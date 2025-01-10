import pytest
from datetime import datetime, timezone
from bson import ObjectId
from app.db.models.users import User
from app.core.security import verify_password


def test_user_model_creation():
    """
    Test para validar la creación de un modelo de usuario válido.
    """
    user_data = {
        "_id": ObjectId(),
        "name": "Test User",
        "email": "test@example.com",
        "password": "plaintextpassword",
        "role_id": ObjectId(),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    user = User(**user_data)

    assert user.name == "Test User"
    assert user.email == "test@example.com"
    assert verify_password("plaintextpassword", user.password_hash)
    assert user.role_id == user_data["role_id"]


def test_user_model_missing_fields():
    """
    Test para validar que un modelo de usuario sin campos requeridos lanza un error.
    """
    user_data = {
        "email": "missingname@example.com",
        "password": "plaintextpassword",
    }

    with pytest.raises(ValueError):
        User(**user_data)


def test_user_model_invalid_email():
    """
    Test para validar que un email no válido lanza un error.
    """
    user_data = {
        "_id": ObjectId(),
        "name": "Test User",
        "email": "not-an-email",
        "password": "plaintextpassword",
        "role_id": ObjectId(),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    with pytest.raises(ValueError):
        User(**user_data)


def test_user_model_password_hashing():
    """
    Test para validar que la contraseña en texto plano se hashea correctamente.
    """
    user_data = {
        "_id": ObjectId(),
        "name": "Test User",
        "email": "test@example.com",
        "password": "plaintextpassword",
        "role_id": ObjectId(),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    user = User(**user_data)

    assert user.password_hash is not None
    assert verify_password("plaintextpassword", user.password_hash)


def test_user_model_string_representation():
    """
    Test para validar la representación en cadena del modelo de usuario.
    """
    user_data = {
        "_id": ObjectId(),
        "name": "Test User",
        "email": "test@example.com",
        "password": "plaintextpassword",
        "role_id": ObjectId(),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    user = User(**user_data)

    expected_representation = (
        f"User(id={user.id}, name={user.name}, email={user.email})"
    )
    assert str(user) == expected_representation


def test_user_model_update_timestamps():
    """
    Test para validar que los timestamps se actualizan correctamente.
    """
    user_data = {
        "_id": ObjectId(),
        "name": "Test User",
        "email": "test@example.com",
        "password": "plaintextpassword",
        "role_id": ObjectId(),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    user = User(**user_data)
    old_updated_at = user.updated_at
    user.updated_at = datetime.now(timezone.utc)

    assert user.updated_at > old_updated_at
