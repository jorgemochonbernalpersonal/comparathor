import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
from app.core.logging_config import logger

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def upload_image_to_cloudinary(file, folder="comparathor"):
    response = cloudinary.uploader.upload(file, folder=folder)
    logger.info(f"📤 Imagen subida a Cloudinary: {response['secure_url']}")
    return response["secure_url"]


def delete_image_from_cloudinary(image_url):
    try:
        public_id = image_url.split("/")[-1].split(".")[0]
        cloudinary.uploader.destroy(public_id)
        logger.info(f"🗑️ Imagen eliminada de Cloudinary: {image_url}")
    except Exception as e:
        logger.error(f"❌ Error al eliminar imagen de Cloudinary: {e}")
