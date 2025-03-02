import React, { createContext, useContext, useState, useEffect } from "react";
import { useFetch } from "../hooks/UseFetch";
import {
    getAllRoles,
    getRoleById,
    addRole,
    updateRoleById,
    deleteRoleById,
} from "../api/roles/RoleLogic";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    
    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async (filters = {}) => {
        setIsLoading(true);
        try {
            const response = await getAllRoles(fetchData, filters);
            setRoles(response.roles || []);
            return response;
        } catch (error) {
            console.error("❌ Error al obtener roles:", error);
            return { roles: [] };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RoleContext.Provider
            value={{
                roles,
                isLoading,
                loadRoles,
                getRoleById: (id) => getRoleById(fetchData, id),
                addRole: (newRole) => addRole(fetchData, setRoles, setIsLoading, newRole),
                updateRoleById: (id, updates) => updateRoleById(fetchData, setRoles, setIsLoading, id, updates),
                deleteRoleById: (id) => deleteRoleById(fetchData, setRoles, setIsLoading, id),
            }}
        >
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => useContext(RoleContext);
