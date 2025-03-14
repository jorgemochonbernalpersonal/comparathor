import { useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../contexts/AuthContext";
import { ROLES } from "../utils/Constants";

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }

    const { user, setUser } = context;
    const queryClient = useQueryClient();
    const [currentUser, setCurrentUser] = useState(user || null);

    useEffect(() => {
        if (!currentUser) {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser(parsedUser);
                setUser(parsedUser);
                queryClient.setQueryData(["currentUser"], parsedUser);
            }
        }
    }, [queryClient, user, currentUser, setUser]);

    const role = currentUser?.role?.name || null;

    const isAuthenticated = !!currentUser;
    const isAdmin = role === ROLES.ADMIN;
    const isUser = role === ROLES.REGISTERED;

    const hasRole = (requiredRole) => role === requiredRole;

    return {
        currentUser,
        isAuthenticated,
        role,
        isAdmin,
        isUser,
        hasRole,
        ...context,
    };
};
