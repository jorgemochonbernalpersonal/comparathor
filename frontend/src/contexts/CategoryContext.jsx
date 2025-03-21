import React, { createContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../hooks/UseFetch";
import { createCategoryById, updateCategoryById, deleteCategoryById } from "../api/categories/CategoryLogic";
import { toast } from "react-toastify";
import { ERROR_PREFIX_REGEX } from "../utils/Constants";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const queryClient = useQueryClient();

    const getErrorMessage = (error, defaultMessage) => {
        let errorMsg = error?.response?.data?.message || error?.message || defaultMessage;
        return errorMsg.replace(ERROR_PREFIX_REGEX, "");
    };

    const createCategoryMutation = useMutation({
        mutationFn: (categoryData) => createCategoryById(fetchData, categoryData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["categories"]);
            toast.success(data.message || "✅ Categoría creada con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al crear categoría."));
        },
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ id, categoryData }) => updateCategoryById(fetchData, id, categoryData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["categories"]);
            toast.success(data.message || "✅ Categoría actualizada con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al actualizar categoría."));
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: (id) => deleteCategoryById(fetchData, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["categories"]);
            toast.success(data.message || "✅ Categoría eliminada con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al eliminar categoría."));
        },
    });

    return (
        <CategoryContext.Provider value={{
            createCategory: createCategoryMutation.mutateAsync,
            updateCategory: updateCategoryMutation.mutateAsync,
            deleteCategory: deleteCategoryMutation.mutateAsync
        }}>
            {children}
        </CategoryContext.Provider>
    );
};
