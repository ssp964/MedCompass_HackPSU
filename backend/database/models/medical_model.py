from pydantic import BaseModel
from typing import Optional
import re
from backend.database.server import insert_one, find_one, find_all, get_collection

COLLECTION_NAME = "medical_data"


class MedicalData(BaseModel):
    patient_id: str
    hospitalization_id: Optional[str] = None
    diagnosis: str
    allergies: str
    admit_date: str
    discharge_instructions: str
    follow_up_app_date: str

    class Config:
        arbitrary_types_allowed = True


def generate_unique_hospitalization_id():
    """
    Generates a unique hospitalization ID in the format H0001, H0002, etc.
    """
    col = get_collection(COLLECTION_NAME)
    last_record = col.find_one({}, sort=[("hospitalization_id", -1)])
    if last_record and "hospitalization_id" in last_record:
        last_num = int(re.sub(r"\D", "", last_record["hospitalization_id"]))
    else:
        last_num = 0
    return f"H{last_num + 1:04d}"


def insert_medical_data(medical: MedicalData):
    """
    Inserts medical data into the 'medical_data' collection.
    Automatically generates a unique hospitalization_id if not provided.
    """
    document = medical.dict()

    if not document.get("hospitalization_id"):
        document["hospitalization_id"] = generate_unique_hospitalization_id()

    return insert_one(COLLECTION_NAME, document)


def get_medical_data_by_patient_id(patient_id: str):
    """
    Retrieves medical data by patient_id.
    """
    return find_one(COLLECTION_NAME, {"patient_id": patient_id})


def get_all_medical_data():
    """
    Retrieves all medical data documents.
    """
    return find_all(COLLECTION_NAME)
