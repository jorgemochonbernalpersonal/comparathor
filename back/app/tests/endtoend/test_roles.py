import pytest
from bson import ObjectId


@pytest.mark.asyncio
async def test_e2e_create_and_list_roles(async_client, db):
    """
    Test E2E para crear y listar roles.
    """
    role_data = {"name": "Admin", "description": "Administrador del sistema"}

    create_response = await async_client.post("/api/v1/roles/", json=role_data)
    assert create_response.status_code == 201
    created_role = create_response.json()
    assert created_role["name"] == "Admin"
    assert created_role["description"] == "Administrador del sistema"

    list_response = await async_client.get("/api/v1/roles/")
    assert list_response.status_code == 200
    roles = list_response.json()
    assert any(role["name"] == "Admin" for role in roles)


@pytest.mark.asyncio
async def test_e2e_get_role_by_id(async_client, db):
    """
    Test E2E para obtener un rol por ID.
    """
    role_data = {"name": "Editor", "description": "Editor de contenidos"}

    create_response = await async_client.post("/api/v1/roles/", json=role_data)
    assert create_response.status_code == 201
    created_role = create_response.json()

    role_id = created_role["_id"]
    get_response = await async_client.get(f"/api/v1/roles/{role_id}")
    assert get_response.status_code == 200
    fetched_role = get_response.json()
    assert fetched_role["name"] == "Editor"
    assert fetched_role["description"] == "Editor de contenidos"


@pytest.mark.asyncio
async def test_e2e_update_role(async_client, db):
    """
    Test E2E para actualizar un rol.
    """
    role_data = {"name": "Viewer", "description": "Visualizador de contenidos"}

    create_response = await async_client.post("/api/v1/roles/", json=role_data)
    assert create_response.status_code == 201
    created_role = create_response.json()

    role_id = created_role["_id"]
    updated_data = {"name": "Viewer Updated", "description": "Rol actualizado"}
    update_response = await async_client.put(
        f"/api/v1/roles/{role_id}", json=updated_data
    )
    assert update_response.status_code == 200
    updated_role = update_response.json()
    assert updated_role["name"] == "Viewer Updated"
    assert updated_role["description"] == "Rol actualizado"


@pytest.mark.asyncio
async def test_e2e_delete_role(async_client, db):
    """
    Test E2E para eliminar un rol.
    """
    role_data = {"name": "Temporary", "description": "Rol temporal"}

    # Crear un rol
    create_response = await async_client.post("/api/v1/roles/", json=role_data)
    assert create_response.status_code == 201
    created_role = create_response.json()

    # Eliminar el rol
    role_id = created_role["_id"]
    delete_response = await async_client.delete(f"/api/v1/roles/{role_id}")
    assert delete_response.status_code == 204

    # Verificar que el rol fue eliminado
    get_response = await async_client.get(f"/api/v1/roles/{role_id}")
    assert get_response.status_code == 404
