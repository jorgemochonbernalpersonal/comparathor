import pytest
from bson import ObjectId


@pytest.mark.asyncio
async def test_e2e_create_list_and_delete_products(async_client):
    """
    Test E2E para crear productos, listarlos y luego eliminarlos.
    """
    product_data_1 = {
        "name": "Producto E2E 1",
        "description": "Descripción del producto E2E 1",
        "price": 10.99,
        "image_url": "https://example.com/e2e1.png",
        "metadata": {"categoria": "E2E"},
    }

    product_data_2 = {
        "name": "Producto E2E 2",
        "description": "Descripción del producto E2E 2",
        "price": 20.99,
        "image_url": "https://example.com/e2e2.png",
        "metadata": {"categoria": "E2E"},
    }

    response_1 = await async_client.post("/api/v1/products/", json=product_data_1)
    response_2 = await async_client.post("/api/v1/products/", json=product_data_2)

    assert (
        response_1.status_code == 201
    ), f"Error al crear producto 1: {response_1.text}"
    assert (
        response_2.status_code == 201
    ), f"Error al crear producto 2: {response_2.text}"

    product_1 = response_1.json()
    product_2 = response_2.json()

    list_response = await async_client.get("/api/v1/products/")
    assert (
        list_response.status_code == 200
    ), f"Error al listar productos: {list_response.text}"
    products = list_response.json()

    assert any(p["name"] == "Producto E2E 1" for p in products)
    assert any(p["name"] == "Producto E2E 2" for p in products)

    delete_response = await async_client.delete(f"/api/v1/products/{product_1['_id']}")
    assert delete_response.status_code == 204, "Error al eliminar el producto 1"

    get_response = await async_client.get(f"/api/v1/products/{product_1['_id']}")
    assert get_response.status_code == 404, "El producto eliminado aún existe"

    delete_response = await async_client.delete(f"/api/v1/products/{product_2['_id']}")
    assert delete_response.status_code == 204, "Error al eliminar el producto 2"

    get_response = await async_client.get(f"/api/v1/products/{product_2['_id']}")
    assert get_response.status_code == 404, "El producto eliminado aún existe"


@pytest.mark.asyncio
async def test_e2e_update_product(async_client):
    """
    Test E2E para crear y luego actualizar un producto.
    """
    product_data = {
        "name": "Producto para actualizar E2E",
        "description": "Descripción inicial",
        "price": 100.0,
        "image_url": "https://example.com/update_e2e.png",
        "metadata": {"marca": "MarcaInicial"},
    }

    create_response = await async_client.post("/api/v1/products/", json=product_data)
    assert (
        create_response.status_code == 201
    ), f"Error al crear producto: {create_response.text}"

    created_product = create_response.json()
    product_id = created_product["_id"]

    updated_product_data = {
        "name": "Producto actualizado E2E",
        "description": "Descripción actualizada",
        "price": 150.0,
        "image_url": "https://example.com/updated_e2e.png",
        "metadata": {"marca": "MarcaActualizada"},
    }

    update_response = await async_client.put(
        f"/api/v1/products/{product_id}", json=updated_product_data
    )
    assert (
        update_response.status_code == 200
    ), f"Error al actualizar producto: {update_response.text}"

    updated_product = update_response.json()
    assert updated_product["name"] == "Producto actualizado E2E"
    assert updated_product["price"] == 150.0
    assert updated_product["metadata"]["marca"] == "MarcaActualizada"


@pytest.mark.asyncio
async def test_e2e_attempt_to_update_nonexistent_product(async_client):
    """
    Test E2E para intentar actualizar un producto que no existe.
    """
    nonexistent_id = str(ObjectId())
    updated_data = {
        "name": "Producto inexistente E2E",
        "description": "Descripción actualizada",
        "price": 200.0,
        "image_url": "https://example.com/nonexistent_e2e.png",
        "metadata": {"marca": "No existe"},
    }

    response = await async_client.put(
        f"/api/v1/products/{nonexistent_id}", json=updated_data
    )

    assert (
        response.status_code == 404
    ), f"No devolvió un error 404 para un producto inexistente, devolvió {response.status_code}"
    assert response.json()["detail"] == "Product not found"


@pytest.mark.asyncio
async def test_e2e_attempt_to_delete_nonexistent_product(async_client):
    """
    Test E2E para intentar eliminar un producto que no existe.
    """
    nonexistent_id = str(ObjectId())
    response = await async_client.delete(f"/api/v1/products/{nonexistent_id}")

    assert (
        response.status_code == 404
    ), f"No devolvió un error 404 para un producto inexistente, devolvió {response.status_code}"
    assert response.json()["detail"] == "Product not found"
