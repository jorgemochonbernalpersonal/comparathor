import React, { createContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../hooks/UseFetch";
import { createUserById, updateUserById, deleteUserById } from "../api/users/UserLogic";
import { toast } from "react-toastify";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const queryClient = useQueryClient();

    const getErrorMessage = (error, defaultMessage) => {
        let errorMsg = error?.response?.data?.message || error?.message || defaultMessage;
        return errorMsg.replace(/^Error \d+: /, "");
    };

    const createUserMutation = useMutation({
        mutationFn: (userData) => createUserById(fetchData, userData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["users"]); 
            toast.success(data.message || "✅ Usuario creado con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al crear usuario."));
        },
    });
    
    const updateUserMutation = useMutation({
        mutationFn: ({ id, userData }) => updateUserById(fetchData, id, userData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["users"]);
            toast.success(data.message || "✅ Usuario actualizado con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al actualizar usuario."));
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id) => deleteUserById(fetchData, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["users"]);
            toast.success(data.message || "✅ Usuario eliminado con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al eliminar usuario."));
        },
    });

    return (
        <UserContext.Provider value={{
            createUser: createUserMutation.mutateAsync,
            updateUser: updateUserMutation.mutateAsync,
            deleteUser: deleteUserMutation.mutateAsync
        }}>
            {children}
        </UserContext.Provider>
    );
};
