from datetime import datetime
from backend.database.models.patient_model import Patient, insert_patient
from backend.database.models.medical_model import MedicalData, insert_medical_data
from backend.database.models.discharge_call_model import (
    DischargeCall,
    insert_discharge_call,
)
from backend.database.models.question_model import (
    QuestionCategory,
    insert_question_category,
    get_questions_by_category,
)
from backend.database.server import get_collection


def test_insert_flow():
    print("\nStarting test insert flow...\n")

    # Insert Patient
    patient = Patient(
        first_name="Test",
        last_name="User",
        dob="01011990",  # MMDDYYYY
        phone="+10000000000",
        gender="Other",
        email="testuser@example.com",
        address="456 Test Blvd",
        preferred_call_time="Morning",
    )
    patient_insert_result = insert_patient(patient)
    patient_doc = get_collection("patients").find_one({"_id": patient_insert_result})
    patient_id = patient_doc["patient_id"]
    print(f"Inserted patient with patient_id: {patient_id}")

    # Insert Medical Data (includes hospitalization info)
    medical = MedicalData(
        patient_id=patient_id,
        diagnosis="Hypertension",
        allergies="Penicillin",
        admit_date="03282024",
        discharge_instructions="Take meds daily. Follow diet.",
        follow_up_app_date="04102024",
    )
    medical_insert_result = insert_medical_data(medical)
    medical_doc = get_collection("medical_data").find_one(
        {"_id": medical_insert_result}
    )
    hospitalization_id = medical_doc["hospitalization_id"]
    print(f"Inserted medical record with hospitalization_id: {hospitalization_id}")

    # Insert Discharge Call (linked to hospitalization_id)
    discharge = DischargeCall(
        hospitalization_id=hospitalization_id,
        call_date="2025-03-30 02:00",
        call_status=True,
        category="Cardiovascular Conditions",
        response="Do you experience chest pain during physical activity?",
    )
    insert_discharge_call(discharge)
    print(f"Inserted discharge call for hospitalization_id: {hospitalization_id}")

    # Insert Question Category
    question_category = QuestionCategory(
        category="Cardiovascular Conditions",
        questions=[
            "Do you experience chest pain during physical activity?",
            "Do you have a history of high blood pressure?",
            "Are you on any heart medications?",
        ],
    )
    insert_question_category(question_category)
    print(f"Inserted question category: {question_category.category}")

    # Retrieve and Print Questions
    fetched_questions = get_questions_by_category("Cardiovascular Conditions")
    print(f"Retrieved questions for category: {fetched_questions['category']}")
    for q in fetched_questions["questions"]:
        print(f"  - {q}")

    print("\nAll test inserts completed successfully!\n")


if __name__ == "__main__":
    test_insert_flow()
