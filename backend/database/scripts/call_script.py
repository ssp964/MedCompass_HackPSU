from backend.database.server import get_collection


def get_call_scripts():
    """
    Returns a full call script combining:
    - call_report_id
    - patient_number
    - call time
    - list of questions for that patient's category
    """
    patients_col = get_collection("patients")
    medical_col = get_collection("medical_data")
    discharge_col = get_collection("post_discharge_calls")
    questions_col = get_collection("questions")

    result = []

    patients = patients_col.find({}, {"patient_id": 1, "phone": 1, "_id": 0})

    for patient in patients:
        patient_id = patient.get("patient_id")
        phone = patient.get("phone")

        medical_docs = medical_col.find({"patient_id": patient_id})

        for medical_doc in medical_docs:
            hospitalization_id = medical_doc.get("hospitalization_id")
            if not hospitalization_id:
                continue

            discharge_docs = discharge_col.find(
                {"hospitalization_id": hospitalization_id}
            )

            for discharge_doc in discharge_docs:
                call_report_id = discharge_doc.get("call_report_id", "")
                call_date = discharge_doc.get("call_date", "")
                category = discharge_doc.get("category", "")

                question_doc = questions_col.find_one({"category": category})
                questions = question_doc.get("questions", []) if question_doc else []

                result.append(
                    {
                        "call_report_id": call_report_id,
                        "patient_number": phone,
                        "time": call_date,
                        "questions": questions,
                    }
                )

    return result


def push_responses(call_report_id: str, response: str):
    """
    Pushes responses from the call script to the database.
    Only accepts response if it's a string; raises error otherwise.
    """

    if not isinstance(response, str):
        raise ValueError("Response must be a string.")

    if not isinstance(call_report_id, str):
        raise ValueError("Report id must be a string.")

    discharge_col = get_collection("post_discharge_calls")

    discharge_col.update_one(
        {"call_report_id": call_report_id},
        {"$set": {"response": response, "call_status": True}},
    )
    print("Response pushed to the database.")


# if __name__ == "__main__":
#     call_script = get_call_scripts()
#     print("Call Script:")
#     for entry in call_script:
#         print(f"\nReport ID: {entry['call_report_id']}")
#         print(f"Patient: {entry['patient_number']}")
#         print(f"Time: {entry['time']}")
#         print("Questions:")
#         for q in entry["questions"]:
#             print(f" - {q}")

# push_responses("R0001", "Sample Response")
