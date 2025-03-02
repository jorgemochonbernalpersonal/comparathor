from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
from app.core.logging_config import logger

router = APIRouter()

connected_clients: List[WebSocket] = []


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    logger.info("🔌 Cliente conectado a WebSocket")

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"📩 Mensaje recibido: {data}")
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        logger.info("🔌 Cliente desconectado de WebSocket")


async def send_notification(message: str):
    for client in connected_clients:
        try:
            await client.send_text(message)
        except Exception as e:
            logger.error(f"❌ Error enviando mensaje: {e}")
            connected_clients.remove(client)
