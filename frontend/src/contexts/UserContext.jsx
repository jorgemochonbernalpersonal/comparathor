import React, { createContext, useContext, useState, useEffect } from "react";
import { useFetch } from "../hooks/UseFetch";
import { getAllUsers, getUserById, updateUserById, deleteUserById } from "../api/users/UserLogic";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            loadUsers();
        }
    }, []);

    const loadUsers = async (filters) => {
        setIsLoading(true);
        try {
            return await getAllUsers(fetchData, filters);
        } catch (error) {
            console.error("❌ Error al obtener usuarios:", error);
            return { users: [], total: 0 };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ loadUsers, updateUserById, deleteUserById, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
