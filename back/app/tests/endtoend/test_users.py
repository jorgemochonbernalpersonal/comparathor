import pytest
from bson import ObjectId


@pytest.mark.asyncio
async def test_e2e_register_and_authenticate(async_client, db):
    """
    Test para registrar y autenticar a un usuario.
    """
    user_data = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "mypassword",
        "role_id": str(ObjectId()),
    }

    register_response = await async_client.post("/api/v1/users/", json=user_data)
    assert register_response.status_code == 201
    registered_user = register_response.json()
    assert registered_user["email"] == "jane@example.com"

    login_response = await async_client.post(
        "/api/v1/users/login",
        json={"email": "jane@example.com", "password": "mypassword"},
    )
    assert login_response.status_code == 200
    assert login_response.json()["message"] == "Autenticación exitosa"


@pytest.mark.asyncio
async def test_e2e_register_user_with_existing_email(async_client, db):
    """
    Test para intentar registrar a un usuario con un email ya existente.
    """
    user_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "mypassword",
        "role_id": str(ObjectId()),
    }

    register_response_1 = await async_client.post("/api/v1/users/", json=user_data)
    assert register_response_1.status_code == 201

    register_response_2 = await async_client.post("/api/v1/users/", json=user_data)
    assert register_response_2.status_code == 400
    assert register_response_2.json()["detail"] == "Email ya registrado"


@pytest.mark.asyncio
async def test_e2e_authenticate_invalid_password(async_client, db):
    """
    Test para autenticar a un usuario con una contraseña incorrecta.
    """
    user_data = {
        "name": "Alice",
        "email": "alice@example.com",
        "password": "correctpassword",
        "role_id": str(ObjectId()),
    }
    await async_client.post("/api/v1/users/", json=user_data)

    login_response = await async_client.post(
        "/api/v1/users/login",
        json={"email": "alice@example.com", "password": "wrongpassword"},
    )
    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Credenciales incorrectas."


@pytest.mark.asyncio
async def test_e2e_authenticate_nonexistent_user(async_client):
    """
    Test para autenticar a un usuario que no existe.
    """
    login_response = await async_client.post(
        "/api/v1/users/login",
        json={"email": "nonexistent@example.com", "password": "doesntmatter"},
    )
    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Credenciales incorrectas."


@pytest.mark.asyncio
async def test_e2e_update_user(async_client, db):
    """
    Test para actualizar un usuario existente.
    """
    user_data = {
        "name": "Charlie",
        "email": "charlie@example.com",
        "password": "mypassword",
        "role_id": str(ObjectId()),
    }
    register_response = await async_client.post("/api/v1/users/", json=user_data)
    user_id = register_response.json()["_id"]

    updated_data = {
        "name": "Charlie Updated",
        "email": "charlie.updated@example.com",
        "role_id": str(ObjectId()),
    }

    update_response = await async_client.put(
        f"/api/v1/users/{user_id}", json=updated_data
    )
    assert update_response.status_code == 200
    updated_user = update_response.json()
    assert updated_user["name"] == "Charlie Updated"
    assert updated_user["email"] == "charlie.updated@example.com"


@pytest.mark.asyncio
async def test_e2e_delete_user(async_client, db):
    """
    Test para eliminar un usuario existente.
    """
    user_data = {
        "name": "Bob",
        "email": "bob@example.com",
        "password": "mypassword",
        "role_id": str(ObjectId()),
    }
    register_response = await async_client.post("/api/v1/users/", json=user_data)
    user_id = register_response.json()["_id"]

    delete_response = await async_client.delete(f"/api/v1/users/{user_id}")
    assert delete_response.status_code == 204

    get_response = await async_client.get(f"/api/v1/users/{user_id}")
    assert get_response.status_code == 404
