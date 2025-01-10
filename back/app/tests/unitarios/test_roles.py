import pytest
from datetime import datetime, timezone
from pydantic import ValidationError
from bson import ObjectId
from app.db.models.roles import Role


def test_role_model_creation():
    """
    Test para validar la creación correcta de un rol.
    """
    role_data = {
        "_id": ObjectId(),
        "name": "Administrador",
        "description": "Gestión del sistema",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    role = Role(**role_data)
    assert role.name == "Administrador"
    assert role.description == "Gestión del sistema"


def test_role_missing_name():
    """
    Test para validar que falta el campo obligatorio `name`.
    """
    with pytest.raises(ValidationError, match="Field required"):
        Role(
            description="Sin nombre",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )


def test_role_invalid_name_length():
    """
    Test para validar que el campo `name` tiene un tamaño inválido.
    """
    with pytest.raises(
        ValidationError, match="String should have at least 3 characters"
    ):
        Role(
            name="Ad",
            description="Rol con nombre corto",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )


def test_role_string_representation():
    """
    Test para validar la representación en cadena de un rol.
    """
    role_data = {
        "_id": ObjectId(),
        "name": "Moderador",
        "description": "Moderador de contenidos",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    role = Role(**role_data)
    assert str(role) == f"Role(id={role.id}, name={role.name})"
