from pymongo import MongoClient
from pymongo.collection import Collection

# MongoDB Atlas credentials
MONGO_USERNAME = "admin"
MONGO_PASSWORD = "admin"
MONGO_CLUSTER = "narad.gozmlso.mongodb.net"
MONGO_DB_NAME = "my_database"
MONGO_APP_NAME = "narad"

# Construct URI
MONGO_URI = f"mongodb+srv://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_CLUSTER}/?retryWrites=true&w=majority&appName={MONGO_APP_NAME}"

# Create Mongo client and database
client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]


def get_collection(name: str) -> Collection:
    """
    Get a MongoDB collection by name.
    Usage: users = get_collection("users")
    """
    return db[name]


def insert_one(collection_name: str, document: dict):
    """
    Insert a document into a collection.
    """
    collection = get_collection(collection_name)
    result = collection.insert_one(document)
    return result.inserted_id


def find_all(collection_name: str):
    """
    Retrieve all documents from a collection.
    """
    collection = get_collection(collection_name)
    return list(collection.find())


def find_one(collection_name: str, query: dict):
    """
    Find one document by query.
    """
    collection = get_collection(collection_name)
    return collection.find_one(query)
