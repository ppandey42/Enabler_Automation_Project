from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from enum import Enum

class RFIStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"

class RFIPriority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class RFICreate(BaseModel):
    title: str
    description: str
    priority: RFIPriority
    requester: str

class RFIUpdate(BaseModel):
    rfi_id: str
    status: RFIStatus
    comments: Optional[str] = None

class RFISearch(BaseModel):
    rfi_id: Optional[str] = None
    status: Optional[RFIStatus] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None

class RFIResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    rfi_id: str
    title: str
    description: str
    status: RFIStatus
    priority: RFIPriority
    requester: str
    comments: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None