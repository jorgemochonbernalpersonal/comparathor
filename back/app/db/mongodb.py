from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGODB_URI, DATABASE_NAME

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DATABASE_NAME]

users_collection = db.users
products_collection = db.products


async def initialize_collections():
    """
    Crea las colecciones 'users' y 'products' explícitamente si no existen.
    """
    existing_collections = await db.list_collection_names()
    if "users" not in existing_collections:
        await db.create_collection("users")
        print("Collection 'users' created.")

    if "products" not in existing_collections:
        await db.create_collection("products")
        print("Collection 'products' created.")


async def test_connection():
    """
    Verifica la conexión con MongoDB enviando un comando 'ping'.
    """
    try:
        await client.admin.command("ping")
        print("MongoDB connected successfully!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
