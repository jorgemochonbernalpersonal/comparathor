import React, { createContext, useContext, useState } from 'react';
import { useFetch } from './../hooks/useFetch';
import {
    fetchAllRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
} from './../api/roles/rolRequest';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const [roles, setRoles] = useState([]);
    const { fetchData } = useFetch();

    const loadRoles = async () => {
        const data = await fetchAllRoles(fetchData);
        setRoles(data);
    };

    const getRoleById = async (roleId) => {
        return await fetchRoleById(fetchData, roleId);
    };

    const addRole = async (roleData) => {
        const newRole = await createRole(fetchData, roleData);
        setRoles((prevRoles) => [...prevRoles, newRole]);
        return newRole;
    };

    const updateRoleById = async (roleId, roleData) => {
        const updatedRole = await updateRole(fetchData, roleId, roleData);
        setRoles((prevRoles) =>
            prevRoles.map((role) => (role.id === roleId ? updatedRole : role))
        );
        return updatedRole;
    };

    const deleteRoleById = async (roleId) => {
        await deleteRole(fetchData, roleId);
        setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
    };

    return (
        <RoleContext.Provider
            value={{
                roles,
                loadRoles,
                getRoleById,
                addRole,
                updateRoleById,
                deleteRoleById,
            }}
        >
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => useContext(RoleContext);
