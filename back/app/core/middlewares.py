from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
import time
import logging
import asyncio
from typing import Dict
from collections import deque


logger = logging.getLogger("uvicorn")

class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        headers = request.headers
        if "User-Agent" not in headers:
            logger.warning("🚨 Posible ataque detectado: Falta User-Agent en headers")
            return Response("Forbidden", status_code=403)

        logger.info(f"✅ Petición segura: {request.method} {request.url}")
        return await call_next(request)



class RateLimitMiddleware(BaseHTTPMiddleware):
    RATE_LIMIT = 100  # Número máximo de solicitudes permitidas
    TIME_WINDOW = 600  # Tiempo en segundos (10 minutos)

    def __init__(self, app):
        super().__init__(app)
        self.requests: Dict[str, deque] = {}  # Diccionario para almacenar timestamps de cada IP
        self.lock = asyncio.Lock()

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time.time()

        async with self.lock:
            if client_ip not in self.requests:
                self.requests[client_ip] = deque(maxlen=self.RATE_LIMIT)  # Fijamos un límite de tamaño

            # Eliminar registros antiguos fuera del TIME_WINDOW
            while self.requests[client_ip] and self.requests[client_ip][0] < current_time - self.TIME_WINDOW:
                self.requests[client_ip].popleft()

            if len(self.requests[client_ip]) >= self.RATE_LIMIT:
                logger.warning(f"🚨 Rate limit excedido para {client_ip}. Bloqueado por {self.TIME_WINDOW} segundos.")
                return Response(
                    content='{"detail": "Too Many Requests"}',
                    status_code=429,
                    media_type="application/json",
                )

            # Registrar nueva petición
            self.requests[client_ip].append(current_time)

        logger.info(f"✅ Petición permitida de {client_ip}. {len(self.requests[client_ip])}/{self.RATE_LIMIT} en {self.TIME_WINDOW}s")
        return await call_next(request)