// import React, { useState } from "react";
// import useWebSocket from "../../hooks/useWebSocket";

// const Notification = () => {
//     const [messages, setMessages] = useState([]);

//     const { isConnected, sendMessage, error } = useWebSocket(
//         "ws://127.0.0.1:8000/ws",
//         (message) => {
//             setMessages((prevMessages) => [...prevMessages, message]);
//         }
//     );

//     const handleClose = (index) => {
//         setMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
//     };

//     if (messages.length === 0) return null;

//     return (
//         <div className="notification-container p-3 border rounded shadow-sm bg-light">
//             <h4 className="text-primary">🔔 Notificaciones</h4>

//             {error && <p className="alert alert-danger small p-1 mt-2">{error}</p>}

//             <p className={`fw-bold ${isConnected ? "text-success" : "text-danger"}`}>
//                 {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
//             </p>

//             <ul className="list-group mt-3">
//                 {messages.map((msg, index) => (
//                     <li key={index} className="list-group-item d-flex justify-content-between align-items-center small">
//                         {msg}
//                         <button
//                             className="btn btn-sm btn-danger ms-2"
//                             onClick={() => handleClose(index)}
//                         >
//                             ✕
//                         </button>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default Notification;
