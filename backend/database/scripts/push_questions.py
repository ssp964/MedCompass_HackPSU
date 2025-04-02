from backend.database.server import get_collection


def seed_question_categories():
    questions_col = get_collection("questions")

    question_data = [
        {
            "category": "Cardiovascular Conditions",
            "questions": [
                "Are you monitoring your blood pressure regularly as advised?",
                "Have you experienced any shortness of breath, chest pain, or swelling in your legs?",
                "Have you gained weight suddenly or noticed swelling in your ankles?",
                "Are you following your prescribed medication regimen for blood thinners, diuretics, etc.?",
                "Are you keeping track of your salt and fluid intake?",
            ],
        },
        {
            "category": "Diabetes",
            "questions": [
                "Have you been checking your blood sugar levels as prescribed?",
                "Have you been following your meal plan and taking insulin as directed?",
                "Are you experiencing any symptoms like excessive thirst, frequent urination, or fatigue?",
                "Do you need help understanding your medication doses or any adjustments?",
            ],
        },
        {
            "category": "Post-Surgical (Orthopedic, General Surgery)",
            "questions": [
                "Are you experiencing any pain or discomfort at the surgical site?",
                "Are you following the recommended physical therapy exercises?",
                "Are you able to perform activities of daily living, such as bathing and dressing, independently?",
                "Have you been able to move around with assistance (walker/crutches)?",
                "Are you attending scheduled physical therapy sessions?",
            ],
        },
        {
            "category": "Respiratory Conditions",
            "questions": [
                "Have you been using your inhalers or nebulizer as prescribed?",
                "Are you experiencing increased shortness of breath or coughing?",
                "Have you had any chest tightness or difficulty breathing?",
                "Have you been able to keep track of your oxygen saturation levels?",
            ],
        },
        {
            "category": "Cancer",
            "questions": [
                "Are you experiencing any new symptoms like nausea, fatigue, or pain?",
                "Have you been attending scheduled chemotherapy or radiation appointments?",
                "Have you experienced any side effects from your treatment, such as nausea or low appetite?",
                "Do you need additional help with managing symptoms or medication side effects?",
            ],
        },
        {
            "category": "Neurological Conditions",
            "questions": [
                "Are you noticing any changes in your speech, vision, or strength?",
                "Are you experiencing headaches or dizziness?",
                "Have you had any seizures or unusual symptoms like confusion or loss of balance?",
                "Do you need support in managing daily activities?",
            ],
        },
    ]

    for entry in question_data:
        questions_col.update_one(
            {"category": entry["category"]},
            {"$set": {"questions": entry["questions"]}},
            upsert=True,
        )
        print(f"Upserted category: {entry['category']}")


if __name__ == "__main__":
    seed_question_categories()
