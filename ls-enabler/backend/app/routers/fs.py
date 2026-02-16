from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.fs import FileRecord
from app.schemas.fs import FileUpload, FileSearch, FileManage, FileResponse
from typing import List, Optional
import uuid
import os
import aiofiles
from datetime import datetime
import json

router = APIRouter()

def generate_file_id():
    """Generate unique file ID"""
    return f"FILE-{str(uuid.uuid4())[:8].upper()}"

@router.post("/upload", response_model=dict)
async def upload_file(
    category: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a file to the system"""
    try:
        # Validate category
        valid_categories = ["Documents", "Images", "Reports", "Logs"]
        if category not in valid_categories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category. Must be one of: {valid_categories}"
            )
        
        # Setup upload directory
        upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique file ID and filename
        file_id = generate_file_id()
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
        unique_filename = f"{file_id}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Get file size
        content = await file.read()
        file_size = len(content)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Parse tags
        tag_list = []
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        # Create database record
        db_file = FileRecord(
            file_id=file_id,
            filename=unique_filename,
            original_filename=file.filename or "unknown",
            file_path=file_path,
            file_size=file_size,
            file_type=file.content_type,
            category=category,
            description=description,
            tags=json.dumps(tag_list) if tag_list else None
        )
        
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return {
            "success": True,
            "message": "File uploaded successfully",
            "data": {
                "file_id": db_file.file_id,
                "filename": db_file.original_filename,
                "category": db_file.category,
                "file_size": db_file.file_size,
                "file_type": db_file.file_type,
                "upload_date": db_file.upload_date.isoformat(),
                "download_url": f"/uploads/{unique_filename}"
            }
        }
        
    except Exception as e:
        db.rollback()
        # Clean up uploaded file if database save failed
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

@router.get("/search", response_model=dict)
async def search_files(
    filename: str = None,
    category: str = None,
    upload_date_from: str = None,
    upload_date_to: str = None,
    tags: str = None,
    db: Session = Depends(get_db)
):
    """Search uploaded files"""
    try:
        query = db.query(FileRecord)
        
        # Apply filters
        if filename:
            query = query.filter(FileRecord.original_filename.ilike(f"%{filename}%"))
        
        if category:
            query = query.filter(FileRecord.category == category)
        
        if upload_date_from:
            try:
                date_from_obj = datetime.fromisoformat(upload_date_from)
                query = query.filter(FileRecord.upload_date >= date_from_obj)
            except ValueError:
                pass
        
        if upload_date_to:
            try:
                date_to_obj = datetime.fromisoformat(upload_date_to)
                query = query.filter(FileRecord.upload_date <= date_to_obj)
            except ValueError:
                pass
        
        if tags:
            # Search in tags JSON field
            search_tags = [tag.strip().lower() for tag in tags.split(",")]
            for tag in search_tags:
                query = query.filter(FileRecord.tags.ilike(f"%{tag}%"))
        
        # Execute query
        files = query.order_by(FileRecord.upload_date.desc()).all()
        
        # Format results
        results = []
        for file_record in files:
            # Parse tags from JSON
            file_tags = []
            if file_record.tags:
                try:
                    file_tags = json.loads(file_record.tags)
                except json.JSONDecodeError:
                    file_tags = []
            
            results.append({
                "file_id": file_record.file_id,
                "filename": file_record.original_filename,
                "category": file_record.category,
                "description": file_record.description,
                "tags": file_tags,
                "file_size": file_record.file_size,
                "file_type": file_record.file_type,
                "upload_date": file_record.upload_date.isoformat(),
                "download_url": f"/uploads/{file_record.filename}"
            })
        
        return {
            "success": True,
            "message": f"Found {len(results)} files",
            "data": results,
            "count": len(results)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search files: {str(e)}"
        )

@router.post("/manage", response_model=dict)
async def manage_files(file_manage: FileManage, db: Session = Depends(get_db)):
    """Update file metadata or delete files"""
    try:
        # Find file record
        file_record = db.query(FileRecord).filter(FileRecord.file_id == file_manage.file_id).first()
        if not file_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File {file_manage.file_id} not found"
            )
        
        if file_manage.action == "Update Metadata":
            # Update metadata
            if file_manage.new_description is not None:
                file_record.description = file_manage.new_description
            
            if file_manage.new_tags is not None:
                # Parse new tags
                tag_list = [tag.strip() for tag in file_manage.new_tags.split(",") if tag.strip()]
                file_record.tags = json.dumps(tag_list) if tag_list else None
            
            db.commit()
            db.refresh(file_record)
            
            return {
                "success": True,
                "message": "File metadata updated successfully",
                "data": {
                    "file_id": file_record.file_id,
                    "filename": file_record.original_filename,
                    "description": file_record.description,
                    "tags": json.loads(file_record.tags) if file_record.tags else [],
                    "updated_at": file_record.updated_at.isoformat() if file_record.updated_at else None
                }
            }
            
        elif file_manage.action == "Delete File":
            # Delete file from filesystem
            try:
                if os.path.exists(file_record.file_path):
                    os.remove(file_record.file_path)
            except Exception as e:
                print(f"Warning: Failed to delete physical file: {e}")
            
            # Delete database record
            filename = file_record.original_filename
            db.delete(file_record)
            db.commit()
            
            return {
                "success": True,
                "message": f"File '{filename}' deleted successfully",
                "data": {
                    "file_id": file_manage.file_id,
                    "action": "deleted"
                }
            }
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid action. Must be 'Update Metadata' or 'Delete File'"
            )
            
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to manage file: {str(e)}"
        )