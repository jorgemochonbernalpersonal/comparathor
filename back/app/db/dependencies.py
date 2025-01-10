from app.db.mongodb import db

async def get_db():
    """
    Devuelve la base de datos MongoDB como dependencia para FastAPI.
    """
    return db
