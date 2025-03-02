import { refreshToken, logout } from "../api/auth/AuthLogic";

const API_BASE_URL = "http://localhost:8081/api/";

export const useFetch = () => {
    const fetchData = async (endpoint, method = "GET", body = null, headers = {}) => {
        try {
            const isFormData = body instanceof FormData;
            let currentToken = localStorage.getItem("accessToken");

            console.log(`📢 Token antes de la solicitud: ${currentToken}`);
            console.log(`🔗 URL: ${API_BASE_URL}${endpoint} | Método: ${method}`);

            let options = {
                method,
                mode: "cors", 
                credentials: "include", 
                headers: {
                    ...(isFormData ? {} : { "Content-Type": "application/json" }),
                    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
                    ...headers,
                },
                body: body ? (isFormData ? body : JSON.stringify(body)) : null,
            };

            console.log("🟢 Enviando solicitud con opciones:", options);

            let response = await fetch(`${API_BASE_URL}${endpoint}`, options);

            console.log("uuuuu " , response)

            if (response.status === 401) {
                console.warn("⚠️ Token expirado. Intentando refrescar...");

                const newToken = await refreshToken(fetchData);
                if (newToken) {
                    console.log("🔄 Nuevo token recibido. Reintentando la solicitud...");
                    localStorage.setItem("accessToken", newToken);

                    options.headers = { ...options.headers, Authorization: `Bearer ${newToken}` };
                    response = await fetch(`${API_BASE_URL}${endpoint}`, options);
                } else {
                    console.error("❌ No se pudo refrescar el token. Cerrando sesión...");
                    await logout(fetchData);
                    return Promise.reject(new Error("Sesión expirada, por favor inicia sesión nuevamente."));
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const responseData = await response.json();
            console.log("✅ Respuesta exitosa:", responseData);
            return responseData;
        } catch (error) {
            console.error("🚨 Error en fetchData:", error.message);
            return Promise.reject(new Error(error.message || "Error desconocido"));
        }
    };

    return { fetchData };
};
