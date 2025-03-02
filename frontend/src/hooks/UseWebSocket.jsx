// import { useState, useEffect, useRef, useCallback } from "react";

// const useWebSocket = (url, onMessageReceived) => {
//     const [isConnected, setIsConnected] = useState(false);
//     const [error, setError] = useState(null);
//     const socketRef = useRef(null);

//     useEffect(() => {
//         const ws = new WebSocket(url);
//         socketRef.current = ws;

//         ws.onopen = () => {
//             console.log("🔌 Conectado al WebSocket");
//             setIsConnected(true);
//             setError(null);
//         };

//         ws.onmessage = (event) => {
//             console.log("📩 Mensaje recibido:", event.data);
//             if (onMessageReceived) onMessageReceived(event.data);
//         };

//         ws.onerror = (err) => {
//             console.error("❌ Error en WebSocket:", err);
//             if (!error) setError("Error en la conexión WebSocket");
//         };

//         ws.onclose = () => {
//             console.log("🔌 WebSocket desconectado");
//             setIsConnected(false);
//         };

//         return () => {
//             ws.close();
//         };
//     }, [url]);

//     const sendMessage = useCallback(
//         (message) => {
//             if (socketRef.current && isConnected) {
//                 socketRef.current.send(message);
//                 console.log("📤 Mensaje enviado:", message);
//             } else {
//                 console.warn("⚠️ No se puede enviar mensaje, WebSocket no está conectado.");
//             }
//         },
//         [isConnected]
//     );

//     return { isConnected, sendMessage, error };
// };

// export default useWebSocket;
