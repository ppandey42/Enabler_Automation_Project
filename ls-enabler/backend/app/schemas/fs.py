from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class FileUpload(BaseModel):
    category: str
    description: Optional[str] = None
    tags: Optional[str] = None

class FileSearch(BaseModel):
    filename: Optional[str] = None
    category: Optional[str] = None
    upload_date_from: Optional[str] = None
    upload_date_to: Optional[str] = None
    tags: Optional[str] = None

class FileManage(BaseModel):
    file_id: str
    action: str  # "Update Metadata" or "Delete File"
    new_description: Optional[str] = None
    new_tags: Optional[str] = None

class FileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    file_id: str
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    file_type: Optional[str] = None
    category: str
    description: Optional[str] = None
    tags: Optional[str] = None
    upload_date: datetime
    updated_at: Optional[datetime] = None