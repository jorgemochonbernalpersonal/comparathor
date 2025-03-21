import { useQuery } from "@tanstack/react-query";
import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { CategoryContext } from "../contexts/CategoryContext";
import { getAllCategories } from "../api/categories/CategoryLogic";
import { useFetch } from "./UseFetch";

export const useCategory = (filters = {}) => {
    const { fetchData } = useFetch();
    const context = useContext(CategoryContext);

    if (!context) {
        throw new Error("useCategory debe ser usado dentro de un CategoryProvider");
    }

    const { createCategory, updateCategory, deleteCategory } = context;

    const [currentPage, setCurrentPage] = useState(() => (filters.page ? filters.page - 1 : 0));
    const [sortField, setSortField] = useState(filters.sortField || "id");
    const [sortOrder, setSortOrder] = useState(filters.sortOrder || "asc");

    useEffect(() => {
        setCurrentPage(filters.page ? filters.page - 1 : 0);
    }, [filters.page]);

    const queryKey = useMemo(() => [
        "categories",
        { ...filters, sortField, sortOrder, page: currentPage }
    ], [filters, sortField, sortOrder, currentPage]);

    const { data: categoriesData, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: () => getAllCategories(fetchData, { ...filters, sortField, sortOrder, page: currentPage }),
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        enabled: !!fetchData,
    });

    const handleSort = useCallback((field) => {
        setSortField(field);
        setSortOrder(prevOrder => (sortField === field && prevOrder === "asc" ? "desc" : "asc"));
    }, [sortField]);

    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
    }, []);

    return useMemo(() => ({
        categories: categoriesData?.categories || [],
        totalCategories: categoriesData?.total || 0,
        isLoading,
        error,
        refetchCategories: refetch,
        createCategory,
        updateCategory,
        deleteCategory,
        sortField,
        sortOrder,
        handleSort,
        currentPage,
        handlePageChange,
    }), [
        categoriesData, isLoading, error, refetch, createCategory, updateCategory, deleteCategory,
        sortField, sortOrder, handleSort, currentPage, handlePageChange,
    ]);
};
