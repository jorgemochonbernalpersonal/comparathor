import pytest
from bson import ObjectId
from datetime import datetime, timezone


@pytest.mark.asyncio
async def test_create_role(async_client, db):
    """
    Test para crear un rol en la base de datos.
    """
    role_data = {"name": "Admin", "description": "Administrador del sistema"}

    response = await async_client.post("/api/v1/roles/", json=role_data)
    assert response.status_code == 201

    created_role = response.json()
    assert created_role["name"] == "Admin"
    assert created_role["description"] == "Administrador del sistema"


@pytest.mark.asyncio
async def test_get_role_by_id(async_client, db):
    """
    Test para obtener un rol por su ID desde la base de datos.
    """
    role_data = {
        "name": "Editor",
        "description": "Editor de contenido",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    insert_result = await db["roles"].insert_one(role_data)
    role_id = str(insert_result.inserted_id)

    response = await async_client.get(f"/api/v1/roles/{role_id}")
    assert response.status_code == 200

    role = response.json()
    assert role["name"] == "Editor"
    assert role["description"] == "Editor de contenido"


@pytest.mark.asyncio
async def test_update_role(async_client, db):
    """
    Test para actualizar un rol en la base de datos.
    """
    role_data = {
        "name": "Viewer",
        "description": "Visualizador de contenido",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    insert_result = await db["roles"].insert_one(role_data)
    role_id = str(insert_result.inserted_id)

    updated_data = {
        "name": "Viewer Updated",
        "description": "Rol actualizado",
    }

    response = await async_client.put(f"/api/v1/roles/{role_id}", json=updated_data)
    assert response.status_code == 200

    updated_role = response.json()
    assert updated_role["name"] == "Viewer Updated"
    assert updated_role["description"] == "Rol actualizado"


@pytest.mark.asyncio
async def test_delete_role(async_client, db):
    """
    Test para eliminar un rol en la base de datos.
    """
    role_data = {
        "name": "Temporary",
        "description": "Rol temporal",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    insert_result = await db["roles"].insert_one(role_data)
    role_id = str(insert_result.inserted_id)

    delete_response = await async_client.delete(f"/api/v1/roles/{role_id}")
    assert delete_response.status_code == 204

    # Verificar que el rol fue eliminado
    get_response = await async_client.get(f"/api/v1/roles/{role_id}")
    assert get_response.status_code == 404
