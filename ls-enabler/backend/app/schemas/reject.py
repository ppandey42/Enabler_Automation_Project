from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from enum import Enum

class RejectReason(str, Enum):
    INVALID_DATA = "Invalid Data"
    MISSING_DOCUMENTS = "Missing Documents"
    POLICY_VIOLATION = "Policy Violation"
    TECHNICAL_ISSUES = "Technical Issues"

class RejectStatus(str, Enum):
    PENDING = "Pending"
    APPEALED = "Appealed"
    FINAL = "Final"

class RejectCreate(BaseModel):
    request_id: str
    reject_reason: RejectReason
    detailed_reason: str
    reviewer: str

class RejectSearch(BaseModel):
    request_id: Optional[str] = None
    reject_reason: Optional[RejectReason] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None

class RejectAppeal(BaseModel):
    request_id: str
    appeal_reason: str

class RejectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    request_id: str
    reject_reason: RejectReason
    detailed_reason: str
    reviewer: str
    status: RejectStatus
    appeal_reason: Optional[str] = None
    supporting_docs_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None