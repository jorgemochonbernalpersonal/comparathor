import pytest
from bson import ObjectId


@pytest.mark.asyncio
async def test_update_product(async_client, db):
    """
    Test para actualizar un producto existente.
    """
    product_data = {
        "name": "Producto original",
        "description": "Descripción original",
        "price": 100.0,
        "image_url": "https://example.com/original.png",
        "metadata": {"marca": "Original"},
    }
    insert_result = await db["products"].insert_one(product_data)
    product_id = str(insert_result.inserted_id)

    updated_data = {
        "name": "Producto actualizado",
        "description": "Descripción actualizada",
        "price": 150.0,
        "image_url": "https://example.com/updated.png",
        "metadata": {"marca": "Actualizada"},
    }

    response = await async_client.put(
        f"/api/v1/products/{product_id}", json=updated_data
    )
    assert response.status_code == 200, f"Error al actualizar producto: {response.text}"

    updated_product = response.json()
    assert updated_product["name"] == updated_data["name"]
    assert updated_product["description"] == updated_data["description"]
    assert updated_product["price"] == updated_data["price"]
    assert updated_product["metadata"]["marca"] == updated_data["metadata"]["marca"]


@pytest.mark.asyncio
async def test_update_nonexistent_product(async_client):
    """
    Test para intentar actualizar un producto inexistente.
    """
    nonexistent_id = str(ObjectId())
    updated_data = {
        "name": "Producto inexistente",
        "description": "Descripción actualizada",
        "price": 150.0,
        "image_url": "https://example.com/updated.png",
        "metadata": {"marca": "Actualizada"},
    }

    response = await async_client.put(
        f"/api/v1/products/{nonexistent_id}", json=updated_data
    )
    assert (
        response.status_code == 404
    ), "No devolvió un error para un producto inexistente"
    assert response.json()["detail"] == "Product not found"


@pytest.mark.asyncio
async def test_create_product_with_missing_fields(async_client):
    """
    Test para intentar crear un producto con campos faltantes.
    """
    incomplete_product = {
        "description": "Producto sin nombre y precio",
    }

    response = await async_client.post("/api/v1/products/", json=incomplete_product)
    assert (
        response.status_code == 422
    ), "No devolvió un error para un producto con campos faltantes"


@pytest.mark.asyncio
async def test_list_products_empty(async_client, db):
    """
    Test para listar productos cuando no hay ninguno en la base de datos.
    """
    response = await async_client.get("/api/v1/products/")
    assert response.status_code == 200, f"Error al listar productos: {response.text}"
    data = response.json()
    assert data == [], "Se esperaba una lista vacía cuando no hay productos"


@pytest.mark.asyncio
async def test_delete_product(async_client, db):
    """
    Test para eliminar un producto existente.
    """
    product_data = {
        "name": "Producto para eliminar",
        "description": "Este producto será eliminado",
        "price": 50.0,
        "image_url": "https://example.com/delete.png",
        "metadata": {"estado": "Borrado"},
    }
    insert_result = await db["products"].insert_one(product_data)
    product_id = str(insert_result.inserted_id)

    response = await async_client.delete(f"/api/v1/products/{product_id}")
    assert response.status_code == 204, "Error al eliminar producto"

    get_response = await async_client.get(f"/api/v1/products/{product_id}")
    assert (
        get_response.status_code == 404
    ), "El producto aún existe después de ser eliminado"


@pytest.mark.asyncio
async def test_delete_nonexistent_product(async_client):
    """
    Test para intentar eliminar un producto inexistente.
    """
    nonexistent_id = str(ObjectId())
    response = await async_client.delete(f"/api/v1/products/{nonexistent_id}")
    assert (
        response.status_code == 404
    ), "No devolvió un error para un producto inexistente"
    assert response.json()["detail"] == "Product not found"
