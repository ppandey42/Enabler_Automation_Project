from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional
from enum import Enum

class DocumentType(str, Enum):
    ARCHITECTURE = "Architecture"
    DESIGN = "Design"
    IMPLEMENTATION = "Implementation"
    TESTING = "Testing"

class ReviewPriority(str, Enum):
    URGENT = "Urgent"
    HIGH = "High"
    NORMAL = "Normal"
    LOW = "Low"

class ReviewStatus(str, Enum):
    SUBMITTED = "Submitted"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    NEEDS_REVISION = "Needs Revision"

class TRBSubmit(BaseModel):
    document_title: str
    document_type: DocumentType
    submitter: str
    review_priority: ReviewPriority
    expected_completion: Optional[str] = None

class TRBStatus(BaseModel):
    review_id: Optional[str] = None
    submitter: Optional[str] = None
    status: Optional[ReviewStatus] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None

class TRBAssign(BaseModel):
    review_id: str
    reviewer_email: str
    review_deadline: str
    special_instructions: Optional[str] = None

class TRBResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    review_id: str
    document_title: str
    document_type: DocumentType
    submitter: str
    document_file_path: str
    review_priority: ReviewPriority
    status: ReviewStatus
    reviewer_email: Optional[str] = None
    review_deadline: Optional[date] = None
    expected_completion: Optional[date] = None
    special_instructions: Optional[str] = None
    submitted_at: datetime
    completed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None