import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useFetch } from "../hooks/UseFetch";
import { login, register, refreshToken, logout } from "../api/auth/AuthLogic";
import { ROLES } from "../utils/Constants";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { fetchData } = useFetch();

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const user = localStorage.getItem("user");
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error("❌ Error al recuperar usuario de localStorage:", error);
            localStorage.removeItem("user");
            return null;
        }
    });

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("accessToken");
            if (token) {
                try {
                    const newToken = await refreshToken(fetchData);
                    if (!newToken) {
                        alert("Tu sesión ha expirado. Vuelve a iniciar sesión.");
                        handleLogout();
                    }
                } catch (error) {
                    console.error("❌ Error al refrescar token:", error);
                    handleLogout();
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const handleLogin = async (credentials) => {
        try {
            const response = await login(fetchData, credentials);
            if (response) {
                storeUserSession(response);
            }
            return response;
        } catch (error) {
            console.error("❌ Error al iniciar sesión:", error);
            throw error;
        }
    };

    const handleRegister = async (userData) => {
        try {
            const response = await register(fetchData, userData);
            if (response) {
                storeUserSession(response);
            }
            return response;
        } catch (error) {
            console.error("❌ Error al registrar usuario:", error);
            throw error;
        }
    };

    const storeUserSession = async (response) => {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));
        await new Promise((resolve) => setTimeout(resolve, 100)); // Esperar que el estado se actualice
        setCurrentUser(response.user);
        setIsAuthenticated(true);
    };
    

    const handleRefreshToken = async () => {
        try {
            return await refreshToken(fetchData);
        } catch (error) {
            console.error("❌ Error al refrescar token:", error);
            handleLogout();
            return null;
        }
    };

    const handleLogout = async () => {
        try {
            await logout(fetchData);
        } catch (error) {
            console.error("❌ Error en logout:", error);
        } finally {
            localStorage.clear();
            setCurrentUser(null);
            setIsAuthenticated(false);
        }
    };

    const role = useMemo(() => currentUser?.role?.name || ROLES.REGISTERED, [currentUser]);
    console.log("Rol actual:", role); // Verifica en consola
    
    const isAdmin = role === ROLES.ADMIN;
    console.log("¿Es Admin?", isAdmin);
    

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                role,
                isAdmin,
                isAuthenticated,
                setIsAuthenticated,
                isLoading,
                login: handleLogin,
                register: handleRegister,
                refreshToken: handleRefreshToken,
                logout: handleLogout,
            }}
        >
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
