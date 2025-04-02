from pydantic import BaseModel, EmailStr
from typing import Optional
import random
from backend.database.server import insert_one, find_one, find_all, get_collection

COLLECTION_NAME = "patients"


class Patient(BaseModel):
    patient_id: Optional[str] = None
    first_name: str
    last_name: str
    dob: str
    phone: str
    gender: str
    email: EmailStr
    address: str
    preferred_call_time: str

    class Config:
        arbitrary_types_allowed = True


def generate_unique_patient_id():
    """
    Generates a unique patient_id.
    """
    patients_col = get_collection(COLLECTION_NAME)
    last_patient = patients_col.find_one({}, sort=[("patient_id", -1)])
    if last_patient and "patient_id" in last_patient:
        last_number = int(last_patient["patient_id"][1:])
    else:
        last_number = 0
    new_number = last_number + 1
    return f"P{new_number:04d}"


def insert_patient(patient: Patient):
    """
    Inserts a new patient document. Auto-generates patient_id if not provided.
    """
    patient_dict = patient.dict()

    if not patient_dict.get("patient_id"):
        patient_dict["patient_id"] = generate_unique_patient_id()

    return insert_one(COLLECTION_NAME, patient_dict)


def get_patient_by_patient_id(patient_id: str):
    return find_one(COLLECTION_NAME, {"patient_id": patient_id})


def get_all_patients():
    return find_all(COLLECTION_NAME)
