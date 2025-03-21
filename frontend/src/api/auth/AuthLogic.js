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
        throw error;
    }
};

export const register = async (fetchData, userData) => {
    try {
        const response = await fetchRegister(fetchData, userData);
        console.log(response)
        if (!response || typeof response.accessToken !== "string" || typeof response.refreshToken !== "string") {
            throw new Error("❌ No se recibieron los tokens esperados en la respuesta del servidor.");
        }

        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));

        console.log("✅ Usuario registrado correctamente.");
        return response;
    } catch (error) {
        if (error.message.includes("El usuario con el email")) {
            throw new Error("⚠️ Ya existe una cuenta con este correo electrónico.");
        }

        console.error("❌ Error en el registro:", error.message);
        throw error;
    }
};

export const refreshToken = async (fetchData) => {
    try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) return null;

        const response = await fetchRefreshToken(fetchData, storedRefreshToken);
        if (response?.accessToken) {
            localStorage.setItem("accessToken", response.accessToken);
            return response;
        }

        return null;
    } catch (error) {
        console.error("❌ Error al refrescar token:", error);
        return null;
    }
};

export const logout = async (fetchData) => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            console.warn("⚠️ No hay refresh token, cerrando sesión localmente.");
            localStorage.clear();
            return;
        }

        await fetchLogout(fetchData, refreshToken);

        localStorage.clear();
    } catch (error) {
        console.error("❌ Error en logout:", error.message);
        localStorage.clear();
    }
};
