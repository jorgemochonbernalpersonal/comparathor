import {
    fetchLogin,
    fetchRegister,
    fetchRefreshToken,
    fetchLogout,
} from "./AuthRequest";

export const login = async (fetchData, userData) => {
    try {

        const response = await fetchLogin(fetchData, userData);

        if (!response || typeof response.accessToken !== "string" || typeof response.refreshToken !== "string") {
            throw new Error("No se recibieron los tokens esperados en la respuesta del servidor.");
        }

        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));

        return response;
    } catch (error) {
        if (error.message.includes("Credenciales incorrectas")) {
            throw new Error("⚠️ Correo o contraseña incorrectos.");
        }

        console.error("🚨 Error en login:", error.message);
        throw error;
    }
};

export const register = async (fetchData, userData) => {
    try {
        const response = await fetchRegister(fetchData, userData);
        if (!response || typeof response.accessToken !== "string" || typeof response.refreshToken !== "string") {
        }
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));
        return response;
    } catch (error) {
        if (error.message.includes("El usuario con el email")) {
            throw new Error("⚠️ Ya existe una cuenta con este correo electrónico.");
        }
        throw error;
    }
};
export const refreshToken = async (fetchData) => {
    try {
        const refresh_token = localStorage.getItem("refreshToken");

        if (!refresh_token) {
            console.warn("⚠️ No hay refresh token disponible.");
            return null; // En vez de cerrar sesión, solo devuelve null
        }

        console.log("🔄 Intentando refrescar token con:", refresh_token);
        const response = await fetchRefreshToken(fetchData, refresh_token);

        if (!response || !response.accessToken) {
            console.warn("❌ No se pudo refrescar el token. Probablemente ha expirado.");
            return null; // No se cierra sesión aquí
        }

        console.log("✅ Token refrescado con éxito:", response.accessToken);
        localStorage.setItem("accessToken", response.accessToken);
        return response.accessToken;
    } catch (error) {
        console.error("❌ Error al refrescar token:", error.message);
        return null; // No cerramos sesión de inmediato
    }
};


export const logout = async (fetchData) => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            localStorage.clear();
            window.location.href = "/login";
            return;
        }
        const response = await fetchLogout(fetchData, refreshToken)
        if (response && response.message) {
        } else {
            console.warn("⚠️ No se pudo cerrar sesión en el backend, pero se limpiará localStorage.");
        }
        localStorage.clear();
        window.location.href = "/login";
    } catch (error) {
        console.error("❌ Error en logout:", error.message);
    }
};
