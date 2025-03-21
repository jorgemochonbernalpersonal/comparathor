import { useNavigate } from "react-router-dom";
import { refreshToken } from "../api/auth/AuthLogic";
import { publicRoutes } from "../router/Routes";

const API_BASE_URL = "http://localhost:8081/api/";

export const useFetch = () => {
    const navigate = useNavigate();

    const publicEndpoints = publicRoutes
        .map(route => route.endpoint)
        .filter(endpoint => endpoint !== null);

    const handleErrorResponse = async (response) => {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        let errorData;

        try {
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                return Promise.reject(new Error(errorMessage));
            }

            errorData = await response.json();
        } catch (error) {
            console.error("Error al leer la respuesta JSON:", error);
        }

        if (errorData) {
            if (errorData.message) {
                errorMessage = `Error ${response.status}: ${errorData.message}`;
            }
            if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                errorMessage += `\nDetalles:\n- ${errorData.errors.join("\n- ")}`;
            }
        }

        if (response.status === 401) {
            navigate("/login");
        } else if (response.status === 403) {
            navigate("/unauthorized");
        }

        return Promise.reject(new Error(errorMessage));
    };

    const fetchWithTimeout = async (url, options, timeout = 10000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            console.log(`📡 Fetching: ${url} con timeout de ${timeout}ms`);
            return await fetch(url, { ...options, signal: controller.signal });
        } catch (error) {
            if (error.name === "AbortError") {
                console.error(`⏳ Timeout: La petición a ${url} fue abortada después de ${timeout}ms`);
            } else {
                console.error(`🚨 Error en fetchWithTimeout(${url}):`, error);
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const fetchData = async (endpoint, method = "GET", body = null, headers = {}, responseType = "json") => {
        console.log(`📡 fetchData llamado con endpoint: ${endpoint} y método: ${method}`);

        try {
            let currentToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

            if (!currentToken && !publicEndpoints.includes(endpoint)) {
                navigate("/login");
                throw new Error("Usuario no autenticado");
            }

            let options = {
                method,
                mode: "cors",
                credentials: "include",
                headers: {
                    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
                    ...headers,
                },
                body: null,
            };

            if (body instanceof FormData) {
                options.body = body;
                delete options.headers["Content-Type"];
            } else if (body) {
                options.headers["Content-Type"] = "application/json";
                options.body = JSON.stringify(body);
            }

            if (responseType === "blob") {
                options.headers["Accept"] = "application/octet-stream";
            }

            let response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, options);

            if (response.status === 401 && currentToken) {
                try {
                    console.log("🔄 Intentando refrescar el token...");
                    const newToken = await refreshToken();
                    if (!newToken) throw new Error("Sesión expirada, inicia sesión nuevamente.");

                    localStorage.setItem("accessToken", newToken);
                    sessionStorage.setItem("accessToken", newToken);
                    options.headers["Authorization"] = `Bearer ${newToken}`;

                    response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, options);
                } catch (refreshError) {
                    console.error("🚨 Error al refrescar el token:", refreshError);
                    localStorage.removeItem("accessToken");
                    sessionStorage.removeItem("accessToken");
                    navigate("/login");
                    throw new Error("Sesión expirada, inicia sesión nuevamente.");
                }
            }

            if (!response.ok) {
                return handleErrorResponse(response);
            }

            if (responseType === "blob") {
                return response.blob(); 
            }

            return await response.json();
        } catch (error) {
            console.error("🚨 Error en fetchData:", error);
            throw error;
        }
    };

    return { fetchData };
};
