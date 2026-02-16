from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.reject import Rejection, RejectReason, RejectStatus
from app.schemas.reject import RejectCreate, RejectSearch, RejectAppeal, RejectResponse
from typing import List, Optional
import uuid
from datetime import datetime
import os
import aiofiles

router = APIRouter()

def generate_request_id():
    """Generate unique request ID for rejection"""
    return f"REQ-{str(uuid.uuid4())[:8].upper()}"

@router.post("/process", response_model=dict)
async def process_rejection(reject_data: RejectCreate, db: Session = Depends(get_db)):
    """Process a new rejection request"""
    try:
        # Create rejection record
        db_rejection = Rejection(
            request_id=reject_data.request_id,
            reject_reason=RejectReason(reject_data.reject_reason),
            detailed_reason=reject_data.detailed_reason,
            reviewer=reject_data.reviewer
        )
        
        db.add(db_rejection)
        db.commit()
        db.refresh(db_rejection)
        
        return {
            "success": True,
            "message": "Rejection processed successfully",
            "data": {
                "id": db_rejection.id,
                "request_id": db_rejection.request_id,
                "reject_reason": db_rejection.reject_reason.value,
                "detailed_reason": db_rejection.detailed_reason,
                "reviewer": db_rejection.reviewer,
                "status": db_rejection.status.value,
                "created_at": db_rejection.created_at.isoformat()
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid rejection reason: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process rejection: {str(e)}"
        )

@router.get("/search", response_model=dict)
async def search_rejections(
    request_id: str = None,
    reject_reason: str = None,
    date_from: str = None,
    date_to: str = None,
    db: Session = Depends(get_db)
):
    """Search rejection records"""
    try:
        query = db.query(Rejection)
        
        # Apply filters
        if request_id:
            query = query.filter(Rejection.request_id.ilike(f"%{request_id}%"))
        
        if reject_reason:
            try:
                reason_enum = RejectReason(reject_reason)
                query = query.filter(Rejection.reject_reason == reason_enum)
            except ValueError:
                pass
        
        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from)
                query = query.filter(Rejection.created_at >= date_from_obj)
            except ValueError:
                pass
        
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to)
                query = query.filter(Rejection.created_at <= date_to_obj)
            except ValueError:
                pass
        
        # Execute query
        rejections = query.order_by(Rejection.created_at.desc()).all()
        
        # Format results
        results = []
        for rejection in rejections:
            results.append({
                "id": rejection.id,
                "request_id": rejection.request_id,
                "reject_reason": rejection.reject_reason.value,
                "detailed_reason": rejection.detailed_reason,
                "reviewer": rejection.reviewer,
                "status": rejection.status.value,
                "appeal_reason": rejection.appeal_reason,
                "supporting_docs_path": rejection.supporting_docs_path,
                "created_at": rejection.created_at.isoformat(),
                "updated_at": rejection.updated_at.isoformat() if rejection.updated_at else None
            })
        
        return {
            "success": True,
            "message": f"Found {len(results)} rejection records",
            "data": results,
            "count": len(results)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search rejections: {str(e)}"
        )

@router.post("/appeal", response_model=dict)
async def appeal_rejection(
    request_id: str = Form(...),
    appeal_reason: str = Form(...),
    supporting_docs: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Submit an appeal for a rejected request"""
    try:
        # Find rejection record
        rejection = db.query(Rejection).filter(Rejection.request_id == request_id).first()
        if not rejection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rejection record for request {request_id} not found"
            )
        
        # Handle file upload if provided
        supporting_docs_path = None
        if supporting_docs and supporting_docs.filename:
            upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate unique filename
            file_extension = os.path.splitext(supporting_docs.filename)[1]
            unique_filename = f"appeal_{request_id}_{uuid.uuid4().hex[:8]}{file_extension}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await supporting_docs.read()
                await f.write(content)
            
            supporting_docs_path = file_path
        
        # Update rejection with appeal
        rejection.appeal_reason = appeal_reason
        rejection.supporting_docs_path = supporting_docs_path
        rejection.status = RejectStatus.APPEALED
        
        db.commit()
        db.refresh(rejection)
        
        return {
            "success": True,
            "message": "Appeal submitted successfully",
            "data": {
                "request_id": rejection.request_id,
                "appeal_reason": rejection.appeal_reason,
                "status": rejection.status.value,
                "supporting_docs_uploaded": supporting_docs_path is not None,
                "updated_at": rejection.updated_at.isoformat() if rejection.updated_at else None
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit appeal: {str(e)}"
        )