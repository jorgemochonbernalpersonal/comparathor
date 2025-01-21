from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGODB_URI, DATABASE_NAME
from bson import ObjectId
from datetime import datetime

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DATABASE_NAME]

users_collection = db.users
products_collection = db.products
roles_collection = db.roles


async def initialize_collections():
    """
    Crea las colecciones 'users', 'products', y 'roles' explícitamente si no existen.
    También inserta roles iniciales en la colección 'roles'.
    """
    existing_collections = await db.list_collection_names()

    if "users" not in existing_collections:
        await db.create_collection("users")
        print("Collection 'users' created.")

    if "products" not in existing_collections:
        await db.create_collection("products")
        print("Collection 'products' created.")

    if "roles" not in existing_collections:
        await db.create_collection("roles")
        print("Collection 'roles' created.")

        # Roles iniciales
        roles = [
            {
                "_id": ObjectId("64b9fabc23456789abcdef01"),
                "name": "admin",
                "description": "Administrador del sistema",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
            },
            {
                "_id": ObjectId("64b9fabd23456789abcdef02"),
                "name": "user",
                "description": "Usuario registrado",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
            },
            {
                "_id": ObjectId("64b9fabe23456789abcdef03"),
                "name": "public",
                "description": "Usuario público sin registro",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
            },
        ]

        await roles_collection.insert_many(roles)
        print("Roles iniciales insertados.")


async def test_connection():
    """
    Verifica la conexión con MongoDB enviando un comando 'ping'.
    """
    try:
        await client.admin.command("ping")
        print("MongoDB connected successfully!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
