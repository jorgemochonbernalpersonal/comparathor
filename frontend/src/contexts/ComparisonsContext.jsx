import React, { createContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../hooks/UseFetch";
import { 
    createComparisonById, 
    updateComparisonById, 
    deleteComparisonById, 
    getProductsByComparisonId 
} from "../api/comparisons/ComparisonLogic";
import { toast } from "react-toastify";

export const ComparisonsContext = createContext();

export const ComparisonsContextProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const queryClient = useQueryClient();

    const getErrorMessage = (error, defaultMessage) => {
        return error?.response?.data?.message || error?.message || defaultMessage;
    };

    const createComparisonMutation = useMutation({
        mutationFn: async (comparisonData) => {
            if (!comparisonData.productIds || comparisonData.productIds.length === 0) {
                throw new Error("❌ Debes seleccionar al menos un producto.");
            }
            return createComparisonById(fetchData, comparisonData);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(["comparisons"]);
            toast.success(data.message || "✅ Comparación creada con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al crear comparación."));
        },
    });

    const updateComparisonMutation = useMutation({
        mutationFn: async ({ comparisonId, comparisonData }) => {
            if (!comparisonData.productIds || comparisonData.productIds.length === 0) {
                throw new Error("❌ La comparación debe tener al menos un producto.");
            }
            return updateComparisonById(fetchData, comparisonId, comparisonData);
        },
        onSuccess: (data, { comparisonId }) => {
            queryClient.invalidateQueries(["comparisons"]);
            queryClient.invalidateQueries(["comparisons", comparisonId]);
            toast.success(data.message || "✅ Comparación actualizada con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al actualizar comparación."));
        },
    });

    const deleteComparisonMutation = useMutation({
        mutationFn: async (id) => {
            await deleteComparisonById(fetchData, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["comparisons"]);
            toast.success("✅ Comparación eliminada con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al eliminar comparación."));
        },
    });

    const getComparisonProducts = async (comparisonId) => {
        try {
            const products = await getProductsByComparisonId(fetchData, comparisonId);
            queryClient.setQueryData(["comparisonProducts", comparisonId], products);
            return products;
        } catch (error) {
            toast.error("❌ Error al obtener productos de la comparación.");
            return [];
        }
    };

    return (
        <ComparisonsContext.Provider value={{
            createComparison: createComparisonMutation.mutateAsync,
            updateComparison: updateComparisonMutation.mutateAsync,
            deleteComparison: deleteComparisonMutation.mutateAsync,
            getComparisonProducts,
        }}>
            {children}
        </ComparisonsContext.Provider>
    );
};
