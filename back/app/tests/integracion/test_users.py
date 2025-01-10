import pytest
from bson import ObjectId
from fastapi import status


@pytest.mark.asyncio
async def test_create_user(async_client, db):
    """
    Test para crear un nuevo usuario.
    """
    user_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "mypassword",
        "role_id": str(ObjectId()),
    }

    response = await async_client.post("/api/v1/users/", json=user_data)

    assert response.status_code == status.HTTP_201_CREATED
    created_user = response.json()
    assert created_user["email"] == user_data["email"]
    assert "password" not in created_user


@pytest.mark.asyncio
async def test_create_user_with_existing_email(async_client, db):
    """
    Test para verificar que no se puede crear un usuario con un email existente.
    """
    user_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "mypassword",
        "role_id": str(ObjectId()),
    }

    await async_client.post("/api/v1/users/", json=user_data)

    response = await async_client.post("/api/v1/users/", json=user_data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Email ya registrado"


@pytest.mark.asyncio
async def test_get_user(async_client, db):
    """
    Test para obtener un usuario por su ID.
    """
    user_data = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "mypassword",
        "role_id": str(ObjectId()),
    }

    response = await async_client.post("/api/v1/users/", json=user_data)
    user_id = response.json()["_id"]

    response = await async_client.get(f"/api/v1/users/{user_id}")

    assert response.status_code == status.HTTP_200_OK
    fetched_user = response.json()
    assert fetched_user["email"] == user_data["email"]
    assert "password" not in fetched_user


@pytest.mark.asyncio
async def test_update_user(async_client, db):
    """
    Test para actualizar un usuario existente.
    """
    user_data = {
        "name": "Alice",
        "email": "alice@example.com",
        "password": "mypassword",
        "role_id": str(ObjectId()),
    }

    response = await async_client.post("/api/v1/users/", json=user_data)
    user_id = response.json()["_id"]

    updated_data = {
        "name": "Alice Updated",
        "email": "alice.updated@example.com",
        "role_id": str(ObjectId()),
    }

    response = await async_client.put(f"/api/v1/users/{user_id}", json=updated_data)

    assert response.status_code == status.HTTP_200_OK
    updated_user = response.json()
    assert updated_user["name"] == updated_data["name"]
    assert updated_user["email"] == updated_data["email"]


@pytest.mark.asyncio
async def test_delete_user(async_client, db):
    """
    Test para eliminar un usuario existente.
    """
    user_data = {
        "name": "Bob",
        "email": "bob@example.com",
        "password": "mypassword",
        "role_id": str(ObjectId()),
    }

    response = await async_client.post("/api/v1/users/", json=user_data)
    user_id = response.json()["_id"]

    response = await async_client.delete(f"/api/v1/users/{user_id}")

    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = await async_client.get(f"/api/v1/users/{user_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Usuario no encontrado"


@pytest.mark.asyncio
async def test_delete_nonexistent_user(async_client):
    """
    Test para intentar eliminar un usuario inexistente.
    """
    nonexistent_id = str(ObjectId())
    response = await async_client.delete(f"/api/v1/users/{nonexistent_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Usuario no encontrado"
