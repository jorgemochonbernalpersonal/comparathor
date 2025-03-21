import React, { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useFetch } from "../hooks/UseFetch";
import { getAllRoles, addRole, updateRoleById, deleteRoleById } from "../api/roles/RoleLogic";

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const queryClient = useQueryClient();

    const getErrorMessage = (error, defaultMessage) => {
        let errorMsg = error?.response?.data?.message || error?.message || defaultMessage;
        return errorMsg.replace(/^Error \d+: /, "");
    };

    const { data: roleData = { roles: [], total: 0 }, isLoading, refetch } = useQuery({
        queryKey: ["roles"],
        queryFn: () => getAllRoles(fetchData),
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
        initialData: { roles: [], total: 0 },
        enabled: false,
    });

    const refetchRoles = () => {
        if (typeof refetch === "function") {
            refetch();
        } else {
            console.warn("`refetchRoles` no está disponible.");
        }
    };

    const addRoleMutation = useMutation({
        mutationFn: async (newRole) => await addRole(fetchData, newRole),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["roles"]);
            toast.success(data.message || "Rol agregado con éxito.");
            refetchRoles();
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al agregar el rol."));
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ roleId, updatedData }) => await updateRoleById(fetchData, roleId, updatedData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["roles"]);
            toast.success(data.message || "Rol actualizado con éxito.");
            refetchRoles();
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al actualizar el rol."));
        },
    });

    const deleteRoleMutation = useMutation({
        mutationFn: async (roleId) => await deleteRoleById(fetchData, roleId),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["roles"]);
            toast.success(data.message || "Rol eliminado con éxito.");
            refetchRoles();
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al eliminar el rol."));
        },
    });

    return (
        <RoleContext.Provider value={{
            roles: roleData.roles,
            totalRoles: roleData.total,
            isLoading,
            refetchRoles, 
            addRole: addRoleMutation.mutateAsync,
            updateRole: updateRoleMutation.mutateAsync,
            deleteRole: deleteRoleMutation.mutateAsync,
        }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error("useRole debe ser usado dentro de un RoleProvider");
    }
    return context;
};
