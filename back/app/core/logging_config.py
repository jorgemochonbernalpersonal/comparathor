import logging
from logging.handlers import RotatingFileHandler
import os

# 📌 Directorio y archivo de logs
LOG_DIR = os.path.join(os.getcwd(), "logs")
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOG_FILE = os.path.join(LOG_DIR, "app.log")

# 📌 Configuración de logs
log_formatter = logging.Formatter(
    "%(asctime)s [%(levelname)s] - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# 📌 Logger para archivo (detalle alto)
file_handler = RotatingFileHandler(
    LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
)
file_handler.setFormatter(log_formatter)
file_handler.setLevel(logging.DEBUG)  # 🛠️ Guardar logs detallados en archivo

# 📌 Logger para consola (menos ruido)
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)
console_handler.setLevel(logging.INFO)  # 🔹 Evitar spam en consola

# 📌 Aplicar configuración
logger = logging.getLogger("uvicorn")  # 📌 Capturar logs de Uvicorn
logger.setLevel(logging.DEBUG)
logger.addHandler(file_handler)
logger.addHandler(console_handler)

logger.info("🚀 Logging iniciado correctamente. Verifica logs en logs/app.log")
