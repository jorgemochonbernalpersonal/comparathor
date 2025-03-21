import { useQuery } from "@tanstack/react-query";
import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { BrandContext } from "../contexts/BrandContext";
import { getAllBrands } from "../api/brands/BrandLogic";
import { useFetch } from "./UseFetch";

export const useBrand = (filters = {}) => {
    const { fetchData } = useFetch();
    const context = useContext(BrandContext);

    if (!context) {
        throw new Error("useBrand debe ser usado dentro de un BrandProvider");
    }

    const { createBrand, updateBrand, deleteBrand } = context;

    const [currentPage, setCurrentPage] = useState(() => (filters.page ? filters.page - 1 : 0));
    const [sortField, setSortField] = useState(filters.sortField || "id");
    const [sortOrder, setSortOrder] = useState(filters.sortOrder || "asc");

    useEffect(() => {
        setCurrentPage(filters.page ? filters.page - 1 : 0);
    }, [filters.page]);

    const queryKey = useMemo(() => [
        "brands",
        { ...filters, sortField, sortOrder, page: currentPage }
    ], [filters, sortField, sortOrder, currentPage]);

    const { data: brandsData, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: () => getAllBrands(fetchData, { ...filters, sortField, sortOrder, page: currentPage }),
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
        brands: brandsData?.brands || [],
        totalBrands: brandsData?.total || 0,
        isLoading,
        error,
        refetchBrands: refetch,
        createBrand,
        updateBrand,
        deleteBrand,
        sortField,
        sortOrder,
        handleSort,
        currentPage,
        handlePageChange,
    }), [
        brandsData, isLoading, error, refetch, createBrand, updateBrand, deleteBrand,
        sortField, sortOrder, handleSort, currentPage, handlePageChange,
    ]);
};
