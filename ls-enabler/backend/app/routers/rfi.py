from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.rfi import RFI, RFIStatus, RFIPriority
from app.schemas.rfi import RFICreate, RFIUpdate, RFISearch, RFIResponse
from typing import List
import uuid
from datetime import datetime

router = APIRouter()

def generate_rfi_id():
    """Generate unique RFI ID"""
    return f"RFI-{str(uuid.uuid4())[:8].upper()}"

@router.post("/create", response_model=dict)
async def create_rfi(rfi_data: RFICreate, db: Session = Depends(get_db)):
    """Create a new RFI request"""
    try:
        # Generate unique RFI ID
        rfi_id = generate_rfi_id()
        
        # Create RFI record
        db_rfi = RFI(
            rfi_id=rfi_id,
            title=rfi_data.title,
            description=rfi_data.description,
            priority=RFIPriority(rfi_data.priority),
            requester=rfi_data.requester
        )
        
        db.add(db_rfi)
        db.commit()
        db.refresh(db_rfi)
        
        return {
            "success": True,
            "message": "RFI created successfully",
            "data": {
                "rfi_id": db_rfi.rfi_id,
                "title": db_rfi.title,
                "status": db_rfi.status.value,
                "priority": db_rfi.priority.value,
                "created_at": db_rfi.created_at.isoformat()
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create RFI: {str(e)}"
        )

@router.get("/search", response_model=dict)
async def search_rfi(
    rfi_id: str = None,
    status_filter: str = None,
    date_from: str = None,
    date_to: str = None,
    db: Session = Depends(get_db)
):
    """Search RFI requests"""
    try:
        query = db.query(RFI)
        
        # Apply filters
        if rfi_id:
            query = query.filter(RFI.rfi_id.ilike(f"%{rfi_id}%"))
        
        if status_filter:
            try:
                status_enum = RFIStatus(status_filter)
                query = query.filter(RFI.status == status_enum)
            except ValueError:
                pass
        
        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from)
                query = query.filter(RFI.created_at >= date_from_obj)
            except ValueError:
                pass
        
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to)
                query = query.filter(RFI.created_at <= date_to_obj)
            except ValueError:
                pass
        
        # Execute query
        rfis = query.order_by(RFI.created_at.desc()).all()
        
        # Format results
        results = []
        for rfi in rfis:
            results.append({
                "rfi_id": rfi.rfi_id,
                "title": rfi.title,
                "description": rfi.description,
                "status": rfi.status.value,
                "priority": rfi.priority.value,
                "requester": rfi.requester,
                "comments": rfi.comments,
                "created_at": rfi.created_at.isoformat(),
                "updated_at": rfi.updated_at.isoformat() if rfi.updated_at else None
            })
        
        return {
            "success": True,
            "message": f"Found {len(results)} RFI requests",
            "data": results,
            "count": len(results)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search RFIs: {str(e)}"
        )

@router.post("/update", response_model=dict)
async def update_rfi(rfi_update: RFIUpdate, db: Session = Depends(get_db)):
    """Update RFI status and comments"""
    try:
        # Find RFI
        rfi = db.query(RFI).filter(RFI.rfi_id == rfi_update.rfi_id).first()
        if not rfi:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"RFI {rfi_update.rfi_id} not found"
            )
        
        # Update fields
        rfi.status = RFIStatus(rfi_update.status)
        if rfi_update.comments:
            if rfi.comments:
                rfi.comments += f"\n\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {rfi_update.comments}"
            else:
                rfi.comments = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {rfi_update.comments}"
        
        db.commit()
        db.refresh(rfi)
        
        return {
            "success": True,
            "message": "RFI updated successfully",
            "data": {
                "rfi_id": rfi.rfi_id,
                "title": rfi.title,
                "status": rfi.status.value,
                "priority": rfi.priority.value,
                "comments": rfi.comments,
                "updated_at": rfi.updated_at.isoformat() if rfi.updated_at else None
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status value: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update RFI: {str(e)}"
        )