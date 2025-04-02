from pydantic import BaseModel
from typing import List
from backend.database.server import insert_one, find_one, find_all, get_collection

COLLECTION_NAME = "questions"


class QuestionCategory(BaseModel):
    category: str
    questions: List[str]

    class Config:
        arbitrary_types_allowed = True


def insert_question_category(category_data: QuestionCategory):
    """
    Inserts a category with associated questions into the 'questions' collection.
    """
    return insert_one(COLLECTION_NAME, category_data.dict())


def get_questions_by_category(category_name: str):
    """
    Retrieves questions for a given category.
    """
    return find_one(COLLECTION_NAME, {"category": category_name})


def get_all_question_categories():
    """
    Retrieves all question categories and their questions.
    """
    return find_all(COLLECTION_NAME)
