import re
from backend.database.server import get_collection


def get_next_call_report_id(discharge_col):
    """
    Get the next available call_report_id in format: R0001, R0002, etc.
    """
    last_doc = discharge_col.find_one(
        {"call_report_id": {"$regex": "^R\\d{4}$"}}, sort=[("call_report_id", -1)]
    )

    if last_doc and "call_report_id" in last_doc:
        last_id = int(last_doc["call_report_id"][1:])
        next_id = last_id + 1
    else:
        next_id = 1

    return f"R{next_id:04d}"


def push_discharge_calls():
    """
    Pushes discharge call data with sequential call_report_id (R0001, R0002, ...)
    """
    discharge_col = get_collection("post_discharge_calls")

    discharge_data = [
        {
            "hospitalization_id": "H0005",
            "call_date": "2025-03-30 02:00",
            "call_status": True,
            "category": "Cardiovascular Conditions",
            "response": "",
        },
        {
            "hospitalization_id": "H0006",
            "call_date": "2025-03-30 02:00",
            "call_status": False,
            "category": "Diabetes",
            "response": "",
        },
    ]

    for data in discharge_data:
        data["call_report_id"] = get_next_call_report_id(discharge_col)
        discharge_col.insert_one(data)
        print(f"Inserted discharge call data: {data}")


if __name__ == "__main__":
    push_discharge_calls()
