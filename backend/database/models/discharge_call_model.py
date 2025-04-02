from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import re
from backend.database.server import insert_one, find_one, find_all, get_collection

COLLECTION_NAME = "post_discharge_calls"


class DischargeCall(BaseModel):
    call_report_id: Optional[str] = None
    hospitalization_id: str
    call_date: str
    call_status: bool
    category: str
    response: str

    class Config:
        arbitrary_types_allowed = True


def generate_unique_call_report_id():
    """
    Generate a unique call_report_id in the format R0001, R0002, etc.
    """
    col = get_collection(COLLECTION_NAME)
    last = col.find_one({}, sort=[("call_report_id", -1)])
    if last and "call_report_id" in last:
        last_number = int(re.sub(r"\D", "", last["call_report_id"]))
    else:
        last_number = 0
    return f"R{last_number + 1:04d}"


def insert_discharge_call(discharge: DischargeCall):
    """
    Inserts a post-discharge call record with a unique call_report_id.
    """
    document = discharge.dict()

    if not document.get("call_report_id"):
        document["call_report_id"] = generate_unique_call_report_id()

    return insert_one(COLLECTION_NAME, document)


def get_discharge_call_by_id(call_report_id: str):
    """
    Retrieves a discharge call record by its unique call_report_id.
    """
    return find_one(COLLECTION_NAME, {"call_report_id": call_report_id})


def get_all_discharge_calls():
    """
    Retrieves all post-discharge call records.
    """
    return find_all(COLLECTION_NAME)
