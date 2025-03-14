import { useQuery } from "@tanstack/react-query";
import { useContext, useState, useCallback, useMemo } from "react";
import { ProductContext } from "../contexts/ProductContext";
import { useFetch } from "./UseFetch";
import { getAllProducts } from "../api/products/ProductLogic";

export const useProduct = (filters = {}) => {
    const { fetchData } = useFetch();
    const context = useContext(ProductContext);

    if (!context) {
        throw new Error("useProduct debe ser usado dentro de un ProductProvider");
    }

    const { createProduct, updateProduct, deleteProduct } = context;

    const [currentPage, setCurrentPage] = useState(filters.page || 1);
    const [sortField, setSortField] = useState(filters.sortField || "createdAt");
    const [sortOrder, setSortOrder] = useState(filters.sortOrder || "desc");

    const queryKey = useMemo(() => ["products", { ...filters, sortField, sortOrder, page: currentPage }],
        [filters, sortField, sortOrder, currentPage]
    );

    const { data: productsData, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: () => {
            return getAllProducts(fetchData, { ...filters, sortField, sortOrder, page: currentPage });
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        enabled: !!fetchData,
    });
    
    const handleSort = useCallback((field) => {
        setSortField(field);
        setSortOrder((prevOrder) => (sortField === field && prevOrder === "asc" ? "desc" : "asc"));
    }, [sortField]);

    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
    }, []);

    return useMemo(() => ({
        products: productsData?.products || [],
        totalProducts: productsData?.total || 0,
        isLoading,
        error,
        refetchProducts: refetch,
        createProduct,
        updateProduct,
        deleteProduct,
        sortField,
        sortOrder,
        handleSort,
        currentPage,
        handlePageChange,
    }), [
        productsData, isLoading, error, refetch, createProduct, updateProduct, deleteProduct,
        sortField, sortOrder, handleSort, currentPage, handlePageChange,
    ]);
};
