import { useQuery } from "@tanstack/react-query";
import { useContext, useState, useCallback, useMemo } from "react";
import { ComparisonsContext } from "../contexts/ComparisonsContext";
import { getAllComparisons, getProductsByComparisonId } from "../api/comparisons/ComparisonLogic";
import { useFetch } from "./UseFetch";

export const useComparison = (filters = {}, selectedComparisonIds = []) => {
    const { fetchData } = useFetch();
    const context = useContext(ComparisonsContext);

    if (!context) {
        throw new Error("useComparison debe ser usado dentro de un ComparisonProvider");
    }

    const { createComparison, updateComparison, deleteComparison } = context;
    const [currentPage, setCurrentPage] = useState(filters.page || 1);
    const [sortField, setSortField] = useState(filters.sortField || "createdAt");
    const [sortOrder, setSortOrder] = useState(filters.sortOrder || "desc");

    // 🔹 Clave única para React Query, asegurando que los datos se actualicen correctamente
    const queryKey = useMemo(() =>
        ["comparisons", { ...filters, selectedComparisonIds, sortField, sortOrder, page: currentPage }],
        [filters, selectedComparisonIds, sortField, sortOrder, currentPage]
    );

    // 🔹 Consultar comparaciones con los filtros proporcionados
    const { data: comparisonsData, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: () => getAllComparisons(fetchData, { ...filters, selectedComparisonIds, sortField, sortOrder, page: currentPage }),
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        enabled: !!fetchData,
    });

    // 🔹 Consultar productos para cada comparación
    const { data: comparisonsWithProducts, isFetching: isFetchingProducts } = useQuery({
        queryKey: ["comparisonsWithProducts", comparisonsData, selectedComparisonIds],
        queryFn: async () => {
            if (!comparisonsData || !comparisonsData.comparisons) return [];

            const enrichedComparisons = await Promise.all(
                comparisonsData.comparisons.map(async (comparison) => {
                    if (!comparison.productIds || comparison.productIds.length === 0) {
                        return { ...comparison, products: [] };
                    }

                    try {
                        const products = await getProductsByComparisonId(fetchData, comparison.id);
                        return { ...comparison, products };
                    } catch (error) {
                        return { ...comparison, products: [] };
                    }
                })
            );

            // 🔹 Filtrar comparaciones seleccionadas si hay IDs seleccionados
            return selectedComparisonIds.length > 0
                ? enrichedComparisons.filter(comparison => selectedComparisonIds.includes(comparison.id))
                : enrichedComparisons;
        },
        enabled: !!comparisonsData,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    // 🔹 Manejar ordenamiento
    const handleSort = useCallback((field) => {
        setSortField(field);
        setSortOrder((prevOrder) => (sortField === field && prevOrder === "asc" ? "desc" : "asc"));
    }, [sortField]);

    // 🔹 Manejar paginación
    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
    }, []);

    return useMemo(() => ({
        comparisons: comparisonsWithProducts || [],
        totalComparisons: comparisonsData?.total || 0,
        isLoading: isLoading || isFetchingProducts,
        error,
        refetchComparisons: refetch,
        createComparison,
        updateComparison,
        deleteComparison,
        sortField,
        sortOrder,
        handleSort,
        currentPage,
        handlePageChange,
    }), [
        comparisonsWithProducts, comparisonsData, isLoading, isFetchingProducts, error, refetch,
        createComparison, updateComparison, deleteComparison,
        sortField, sortOrder, handleSort, currentPage, handlePageChange
    ]);
};
