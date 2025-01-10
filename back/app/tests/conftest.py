import asyncio
import pytest
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport
from pytest_asyncio import fixture as async_fixture
from motor.motor_asyncio import AsyncIOMotorClient
from app.main import app
from app.db.dependencies import get_db


@pytest.fixture(scope="session")
def event_loop():
    """
    Proporciona un bucle de eventos reutilizable para las pruebas.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()


@async_fixture(scope="session")
async def mongodb_client():
    """
    Fixture para inicializar y cerrar una conexión de MongoDB para pruebas.
    """
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    yield client
    client.close()


@async_fixture(scope="session")
async def db(mongodb_client):
    """
    Devuelve una base de datos específica para las pruebas.
    """
    test_db = mongodb_client["test_database"]
    yield test_db
    try:
        await mongodb_client.drop_database("test_database")
    except RuntimeError:
        pass


@async_fixture(scope="function", autouse=True)
async def clean_database(db):
    """
    Limpia todas las colecciones de la base de datos antes de cada prueba.
    """
    for collection_name in await db.list_collection_names():
        await db[collection_name].delete_many({})


@async_fixture(scope="session")
async def async_client(db):
    """
    Fixture para inicializar un cliente de pruebas asíncrono que usa la base de datos de prueba.
    """

    app.dependency_overrides[get_db] = lambda: db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
