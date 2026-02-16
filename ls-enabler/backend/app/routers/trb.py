from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trb import TechnicalReview, DocumentType, ReviewPriority, ReviewStatus
from app.schemas.trb import TRBSubmit, TRBStatus, TRBAssign, TRBResponse
from typing import List, Optional
import uuid
import os
import aiofiles
from datetime import datetime, date

router = APIRouter()

def generate_review_id():
    """Generate unique review ID"""
    return f"TRB-{str(uuid.uuid4())[:8].upper()}"

@router.post("/submit", response_model=dict)
async def submit_review(
    document_title: str = Form(...),
    document_type: str = Form(...),
    submitter: str = Form(...),
    review_priority: str = Form(...),
    expected_completion: Optional[str] = Form(None),
    document_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Submit a technical document for review"""
    try:
        # Validate enum values
        try:
            doc_type_enum = DocumentType(document_type)
            priority_enum = ReviewPriority(review_priority)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid enum value: {str(e)}"
            )
        
        # Parse expected completion date
        expected_completion_date = None
        if expected_completion:
            try:
                expected_completion_date = datetime.fromisoformat(expected_completion).date()
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date format for expected_completion. Use YYYY-MM-DD"
                )
        
        # Setup upload directory
        upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique review ID and filename
        review_id = generate_review_id()
        file_extension = os.path.splitext(document_file.filename)[1] if document_file.filename else ""
        unique_filename = f"trb_{review_id}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        content = await document_file.read()
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Create database record
        db_review = TechnicalReview(
            review_id=review_id,
            document_title=document_title,
            document_type=doc_type_enum,
            submitter=submitter,
            document_file_path=file_path,
            review_priority=priority_enum,
            expected_completion=expected_completion_date
        )
        
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        
        return {
            "success": True,
            "message": "Document submitted for review successfully",
            "data": {
                "review_id": db_review.review_id,
                "document_title": db_review.document_title,
                "document_type": db_review.document_type.value,
                "submitter": db_review.submitter,
                "review_priority": db_review.review_priority.value,
                "status": db_review.status.value,
                "expected_completion": expected_completion_date.isoformat() if expected_completion_date else None,
                "submitted_at": db_review.submitted_at.isoformat(),
                "document_url": f"/uploads/{unique_filename}"
            }
        }
        
    except Exception as e:
        db.rollback()
        # Clean up uploaded file if database save failed
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit document for review: {str(e)}"
        )

@router.get("/status", response_model=dict)
async def review_status(
    review_id: str = None,
    submitter: str = None,
    status_filter: str = None,
    date_from: str = None,
    date_to: str = None,
    db: Session = Depends(get_db)
):
    """Check review status and comments"""
    try:
        query = db.query(TechnicalReview)
        
        # Apply filters
        if review_id:
            query = query.filter(TechnicalReview.review_id.ilike(f"%{review_id}%"))
        
        if submitter:
            query = query.filter(TechnicalReview.submitter.ilike(f"%{submitter}%"))
        
        if status_filter:
            try:
                status_enum = ReviewStatus(status_filter)
                query = query.filter(TechnicalReview.status == status_enum)
            except ValueError:
                pass
        
        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from)
                query = query.filter(TechnicalReview.submitted_at >= date_from_obj)
            except ValueError:
                pass
        
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to)
                query = query.filter(TechnicalReview.submitted_at <= date_to_obj)
            except ValueError:
                pass
        
        # Execute query
        reviews = query.order_by(TechnicalReview.submitted_at.desc()).all()
        
        # Format results
        results = []
        for review in reviews:
            results.append({
                "review_id": review.review_id,
                "document_title": review.document_title,
                "document_type": review.document_type.value,
                "submitter": review.submitter,
                "status": review.status.value,
                "review_priority": review.review_priority.value,
                "reviewer_email": review.reviewer_email,
                "review_deadline": review.review_deadline.isoformat() if review.review_deadline else None,
                "expected_completion": review.expected_completion.isoformat() if review.expected_completion else None,
                "special_instructions": review.special_instructions,
                "submitted_at": review.submitted_at.isoformat(),
                "completed_at": review.completed_at.isoformat() if review.completed_at else None,
                "document_url": f"/uploads/{os.path.basename(review.document_file_path)}"
            })
        
        return {
            "success": True,
            "message": f"Found {len(results)} reviews",
            "data": results,
            "count": len(results)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get review status: {str(e)}"
        )

@router.post("/assign", response_model=dict)
async def assign_reviewer(trb_assign: TRBAssign, db: Session = Depends(get_db)):
    """Assign reviewer to submitted document"""
    try:
        # Find review
        review = db.query(TechnicalReview).filter(TechnicalReview.review_id == trb_assign.review_id).first()
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Review {trb_assign.review_id} not found"
            )
        
        # Parse review deadline
        try:
            review_deadline_date = datetime.fromisoformat(trb_assign.review_deadline).date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format for review_deadline. Use YYYY-MM-DD"
            )
        
        # Update review with reviewer information
        review.reviewer_email = trb_assign.reviewer_email
        review.review_deadline = review_deadline_date
        review.special_instructions = trb_assign.special_instructions
        review.status = ReviewStatus.UNDER_REVIEW
        
        db.commit()
        db.refresh(review)
        
        return {
            "success": True,
            "message": "Reviewer assigned successfully",
            "data": {
                "review_id": review.review_id,
                "document_title": review.document_title,
                "reviewer_email": review.reviewer_email,
                "review_deadline": review.review_deadline.isoformat(),
                "special_instructions": review.special_instructions,
                "status": review.status.value,
                "updated_at": review.updated_at.isoformat() if review.updated_at else None
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign reviewer: {str(e)}"
        )