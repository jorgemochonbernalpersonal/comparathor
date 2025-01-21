from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import SECRET_KEY

# Algoritmo utilizado para el JWT
ALGORITHM = "HS256"

# Configuración de Passlib para manejo de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Tiempo de expiración por defecto para el token
DEFAULT_TOKEN_EXPIRATION_MINUTES = 15


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Crea un token de acceso con un tiempo de expiración.

    Args:
        data (dict): Los datos que serán codificados en el token.
        expires_delta (timedelta): Tiempo de expiración del token. Por defecto, 15 minutos.

    Returns:
        str: Token JWT firmado.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=DEFAULT_TOKEN_EXPIRATION_MINUTES)
    )
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si la contraseña en texto plano coincide con su hash.

    Args:
        plain_password (str): Contraseña en texto plano.
        hashed_password (str): Contraseña hasheada.

    Returns:
        bool: True si coinciden, False de lo contrario.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Genera el hash de una contraseña utilizando bcrypt.

    Args:
        password (str): Contraseña en texto plano.

    Returns:
        str: Contraseña hasheada.
    """
    return pwd_context.hash(password)


def decode_access_token(token: str) -> dict:
    """
    Decodifica un token JWT y valida su integridad.

    Args:
        token (str): Token JWT a decodificar.

    Returns:
        dict: Los datos decodificados del token.

    Raises:
        JWTError: Si el token es inválido o ha expirado.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise ValueError("Token inválido o expirado") from e
