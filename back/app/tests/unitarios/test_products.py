from app.db.models.product import Product
from bson import ObjectId
from datetime import datetime, timezone
import pytest


def test_product_model_creation():
    """
    Test unitario para la creación de un producto válido.
    """
    now = datetime.now(timezone.utc)
    product_data = {
        "id": ObjectId(),
        "name": "Ordenador",
        "description": "Ordenador de alta gama modelo 22 con capacidad de 3 conectores al mismo tiempo",
        "price": 222.99,
        "image_url": "https://example.com/image.png",
        "metadata": {"intel": "Core i9", "pantalla": "16 pulgadas"},
        "created_at": now,
        "updated_at": now,
    }

    product = Product(**product_data)

    assert product.name == "Ordenador"
    assert product.price == 222.99
    assert product.metadata["intel"] == "Core i9"
    assert product.created_at == now
    assert product.updated_at == now


def test_product_invalid_price():
    """
    Test unitario para validar que un precio negativo lanza un error.
    """
    with pytest.raises(ValueError, match="Price must be a non-negative value"):
        Product(
            id=ObjectId(),
            name="Producto inválido",
            description="Producto con precio inválido",
            price=-100.0,
            image_url="https://example.com/image.png",
            metadata={"marca": "Test"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )


def test_product_missing_required_fields():
    """
    Test unitario para validar que faltan campos obligatorios.
    """
    with pytest.raises(ValueError):
        Product(
            name="Producto sin metadata",
            price=100.0,
            image_url="https://example.com/image.png",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )


def test_product_string_representation():
    """
    Test unitario para verificar la representación en cadena del producto.
    """
    product = Product(
        id=ObjectId(),
        name="Producto Test",
        description="Un producto para pruebas",
        price=100.0,
        image_url="https://example.com/image.png",
        metadata={"marca": "Test"},
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    expected_representation = (
        f"Product(id={product.id}, name={product.name}, price={product.price})"
    )
    assert str(product) == expected_representation


def test_product_update_fields():
    """
    Test unitario para validar que los campos se actualizan correctamente.
    """
    now = datetime.now(timezone.utc)
    product = Product(
        id=ObjectId(),
        name="Producto Test",
        description="Un producto para pruebas",
        price=100.0,
        image_url="https://example.com/image.png",
        metadata={"marca": "Test"},
        created_at=now,
        updated_at=now,
    )

    updated_time = now.replace(microsecond=now.microsecond + 1)
    product.updated_at = updated_time

    assert product.updated_at == updated_time
    assert product.updated_at != product.created_at


def test_product_metadata_serialization():
    """
    Test unitario para verificar que los metadatos del producto se serializan correctamente.
    """
    now = datetime.now(timezone.utc)
    product_data = {
        "id": ObjectId(),
        "name": "Producto con metadata",
        "description": "Producto para probar la metadata",
        "price": 150.0,
        "image_url": "https://example.com/image.png",
        "metadata": {"key": "value", "marca": "Test"},
        "created_at": now,
        "updated_at": now,
    }

    product = Product(**product_data)
    serialized = product.model_dump()

    assert serialized["metadata"] == product_data["metadata"]
