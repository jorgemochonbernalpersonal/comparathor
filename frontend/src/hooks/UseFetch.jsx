import { useNavigate } from "react-router-dom";
import { refreshToken } from "../api/auth/AuthLogic";
import { publicRoutes } from "../router/Routes";

const API_BASE_URL = "http://localhost:8081/api/";

export const useFetch = () => {
    const navigate = useNavigate();

    const publicEndpoints = publicRoutes
        .map(route => route.endpoint)
        .filter(endpoint => endpoint !== null);

    const fetchWithTimeout = async (url, options, timeout = 10000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            console.log(`📡 Fetching: ${url} con timeout de ${timeout}ms`); // 🔍 Debug

            const response = await fetch(url, { ...options, signal: controller.signal });

            return response; 
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

    const parseErrorResponse = async (response) => {
        try {
            const data = await response.json();
            return data.message || JSON.stringify(data);
        } catch {
            return await response.text();
        }
    };

    const handleErrorResponse = async (response) => {
        const errorMessage = await parseErrorResponse(response);

        if (response.status === 401) {
            console.warn("🔴 Sesión expirada, redirigiendo a /login...");
            navigate("/login");
        } else if (response.status === 403) {
            console.warn("⚠️ Acceso denegado, redirigiendo a /unauthorized...");
            navigate("/unauthorized");
        }

        throw new Error(`Error ${response.status}: ${errorMessage}`);
    };

    const fetchData = async (endpoint, method = "GET", body = null, headers = {}) => {
        console.log(`📡 fetchData llamado con endpoint: ${endpoint} y método: ${method}`);

        try {
            if (typeof method !== "string") {
                throw new Error(`❌ Método HTTP inválido: ${JSON.stringify(method)}`);
            }

            let currentToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

            if (!currentToken && !publicEndpoints.includes(endpoint)) {
                console.warn("⚠️ No hay token, redirigiendo a /login...");
                navigate("/login");
                return Promise.reject(new Error("Usuario no autenticado"));
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

            let response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, options);

            if (response.status === 401 && currentToken) {
                console.warn("⚠️ Token expirado, intentando refrescar...");

                try {
                    const newToken = await refreshToken();
                    if (newToken) {
                        localStorage.setItem("accessToken", newToken);
                        sessionStorage.setItem("accessToken", newToken);

                        const retryOptions = {
                            ...options,
                            headers: {
                                ...options.headers,
                                Authorization: `Bearer ${newToken}`,
                            },
                        };

                        response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, retryOptions);
                    } else {
                        console.error("❌ No se pudo refrescar el token, redirigiendo a /login...");
                        localStorage.removeItem("accessToken");
                        sessionStorage.removeItem("accessToken");
                        navigate("/login");
                        return Promise.reject(new Error("Sesión expirada, inicia sesión nuevamente."));
                    }
                } catch (refreshError) {
                    console.error("🚨 Error al refrescar el token, redirigiendo a /login...");
                    localStorage.removeItem("accessToken");
                    sessionStorage.removeItem("accessToken");
                    navigate("/login");
                    return Promise.reject(new Error("Sesión expirada, inicia sesión nuevamente."));
                }
            }

            if (!response.ok) {
                return handleErrorResponse(response);
            }

            return await response.json();
        } catch (error) {
            console.error("🚨 Error en fetchData:", error.message);
            return Promise.reject(error);
        }
    };

    return { fetchData };
};
