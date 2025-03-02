from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

hashed_password = "$2b$12$c63ZVnMBNYd9fKEInWWyxu0OXhAKdvXqL1IThgm3m1idwLCkfUkTO"
plain_password = "cocoteq22"

is_valid = pwd_context.verify(plain_password, hashed_password)

print(f"¿La contraseña es válida?: {is_valid}")
