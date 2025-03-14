import React, { createContext, useEffect, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { login, register, refreshToken, logout } from "../api/auth/AuthLogic";
import { useFetch } from "../hooks/UseFetch";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const hasInitialized = useRef(false); 
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        const initializeSession = async () => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;

            setIsAuthLoading(true);

            const storedUser = localStorage.getItem("user");
            const accessToken = localStorage.getItem("accessToken");
            const refreshTokenValue = localStorage.getItem("refreshToken");

            if (storedUser && accessToken && refreshTokenValue) {
                try {
                    const newToken = await refreshToken(fetchData);
                    if (newToken?.accessToken) {
                        localStorage.setItem("accessToken", newToken.accessToken);
                        const parsedUser = JSON.parse(storedUser);
                        queryClient.setQueryData(["currentUser"], parsedUser);
                        setUser(parsedUser); 

                        if (parsedUser.role?.name === "ROLE_ADMIN" && location.pathname === "/") {
                            navigate("/admin", { replace: true });
                        } else if (parsedUser.role?.name === "ROLE_REGISTERED" && location.pathname === "/") {
                            navigate("/user", { replace: true });
                        }
                    } else {
                        handleLogout();
                    }
                } catch (error) {
                    handleLogout();
                }
            }

            setIsAuthLoading(false);
        };

        initializeSession();
    }, [queryClient, fetchData, navigate, location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        queryClient.setQueryData(["currentUser"], null);
        queryClient.clear();
        setUser(null);
        navigate("/login", { replace: true });
    };

    const loginMutation = useMutation({
        mutationFn: (credentials) => login(fetchData, credentials),
        onSuccess: (data) => {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.user));
            queryClient.setQueryData(["currentUser"], data.user);
            setUser(data.user);
            toast.success("✅ Inicio de sesión exitoso");
            const roleName = data.user?.role || "";
            navigate(roleName === "ROLE_ADMIN" ? "/admin" : "/user");
        },
        onError: (error) => {
            toast.error("❌ Error al iniciar sesión");
        },
    });

    const registerMutation = useMutation({
        mutationFn: (userData) => register(fetchData, userData),
        onSuccess: (data) => {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.user));
            queryClient.setQueryData(["currentUser"], data.user);
            setUser(data.user);
            toast.success("✅ Registro exitoso");
            const roleName = data.user?.role || "";
            navigate(roleName === "ROLE_ADMIN" ? "/admin" : "/user");
        },
        onError: (error) => {
            toast.error("❌ Error al registrarse");
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await logout(fetchData);
        },
        onSuccess: handleLogout,
        onError: (error) => {
            toast.error("❌ Error al cerrar sesión");
            handleLogout();
        },
    });


    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isAuthenticated: !!user,
                role: user?.role || null,
                login: loginMutation.mutateAsync,
                register: registerMutation.mutateAsync,
                logout: logoutMutation.mutateAsync,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
