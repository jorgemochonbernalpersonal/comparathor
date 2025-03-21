import React, { createContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../hooks/UseFetch";
import { createBrandById, updateBrandById, deleteBrandById } from "../api/brands/BrandLogic";
import { toast } from "react-toastify";
import { ERROR_PREFIX_REGEX } from "../utils/Constants";

export const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const queryClient = useQueryClient();

    const getErrorMessage = (error, defaultMessage) => {
        let errorMsg = error?.response?.data?.message || error?.message || defaultMessage;
        return errorMsg.replace(ERROR_PREFIX_REGEX, "");
    };

    const createBrandMutation = useMutation({
        mutationFn: (brandData) => createBrandById(fetchData, brandData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["brands"]);
            toast.success(data.message || "✅ Marca creada con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al crear marca."));
        },
    });

    const updateBrandMutation = useMutation({
        mutationFn: ({ id, brandData }) => updateBrandById(fetchData, id, brandData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["brands"]);
            toast.success(data.message || "Marca actualizada con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al actualizar marca."));
        },
    });

    const deleteBrandMutation = useMutation({
        mutationFn: (id) => deleteBrandById(fetchData, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["brands"]);
            toast.success(data.message || "✅ Marca eliminada con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al eliminar marca."));
        },
    });

    return (
        <BrandContext.Provider value={{
            createBrand: createBrandMutation.mutateAsync,
            updateBrand: updateBrandMutation.mutateAsync,
            deleteBrand: deleteBrandMutation.mutateAsync
        }}>
            {children}
        </BrandContext.Provider>
    );
};
