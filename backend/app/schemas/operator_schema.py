from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ValidateQRRequest(BaseModel):
    rental_uuid: str


class OperatorMedicalRecordResponse(BaseModel):
    pilot_name: str
    emergency_contact: str
    blood_type: str
    sus_card: Optional[str] = None
    cnh_number: Optional[str] = None


class ValidateQRResponse(BaseModel):
    valid: bool
    status: str
    rental_uuid: str
    track_name: str
    motorcycle_model: str
    effective_speed_limit: int
    start_time: datetime
    end_time: datetime
    medical_record: OperatorMedicalRecordResponse
