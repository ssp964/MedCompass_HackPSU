from backend.database.server import get_collection
from pymongo.errors import CollectionInvalid


def drop_collections(collections):
    """
    Drop specified collections if they exist in the database.
    """
    db = get_collection(collections[0]).database
    for name in collections:
        if name in db.list_collection_names():
            db[name].drop()
            print(f"Dropped existing collection: {name}")
        else:
            print(f"Collection '{name}' does not exist, skipping drop.")


def create_collection_with_schema(name, schema):
    """
    Create a collection with a specified schema in MongoDB.
    """
    db = get_collection(name).database
    try:
        db.create_collection(
            name, validator={"$jsonSchema": schema}, validationLevel="strict"
        )
        print(f"Created collection '{name}' with schema validation")
    except CollectionInvalid:
        print(f"Failed to create collection '{name}'")


def init_patients():
    schema = {
        "bsonType": "object",
        "required": [
            "patient_id",
            "first_name",
            "last_name",
            "dob",
            "phone",
            "gender",
            "email",
            "address",
            "preferred_call_time",
        ],
        "properties": {
            "patient_id": {"bsonType": "string"},
            "first_name": {"bsonType": "string"},
            "last_name": {"bsonType": "string"},
            "dob": {"bsonType": "string"},
            "phone": {"bsonType": "string"},
            "gender": {"bsonType": "string"},
            "email": {"bsonType": "string"},
            "address": {"bsonType": "string"},
            "preferred_call_time": {"bsonType": "string"},
        },
    }
    create_collection_with_schema("patients", schema)


def init_medical_data():
    schema = {
        "bsonType": "object",
        "required": [
            "patient_id",
            "diagnosis",
            "allergies",
            "hospitalization_id",
            "admit_date",
            "discharge_instructions",
            "follow_up_app_date",
        ],
        "properties": {
            "patient_id": {"bsonType": "string"},
            "diagnosis": {"bsonType": "string"},
            "allergies": {"bsonType": "string"},
            "hospitalization_id": {"bsonType": "string"},
            "admit_date": {"bsonType": "string"},
            "discharge_instructions": {"bsonType": "string"},
            "follow_up_app_date": {"bsonType": "string"},
        },
    }
    create_collection_with_schema("medical_data", schema)


def init_discharge_calls():
    schema = {
        "bsonType": "object",
        "required": [
            "call_report_id",
            "hospitalization_id",
            "call_date",
            "call_status",
            "category",
            "response",
        ],
        "properties": {
            "call_report_id": {"bsonType": "string"},
            "hospitalization_id": {"bsonType": "string"},
            "call_date": {"bsonType": "string"},
            "call_status": {"bsonType": "bool"},
            "category": {"bsonType": "string"},
            "response": {"bsonType": "string"},
        },
    }
    create_collection_with_schema("post_discharge_calls", schema)


def init_questions():
    schema = {
        "bsonType": "object",
        "required": ["category", "questions"],
        "properties": {
            "category": {"bsonType": "string"},
            "questions": {"bsonType": "array", "items": {"bsonType": "string"}},
        },
    }
    create_collection_with_schema("questions", schema)


def ensure_indexes():
    """
    Create unique indexes on ID fields.
    """
    get_collection("patients").create_index("patient_id", unique=True)
    get_collection("medical_data").create_index("hospitalization_id", unique=True)
    get_collection("post_discharge_calls").create_index("call_report_id", unique=True)
    get_collection("questions").create_index("category", unique=True)


def run_all():
    collections = [
        "patients",
        "medical_data",
        "post_discharge_calls",
        "questions",
    ]

    drop_collections(collections)
    init_patients()
    init_medical_data()
    init_discharge_calls()
    init_questions()
    ensure_indexes()


if __name__ == "__main__":
    run_all()
