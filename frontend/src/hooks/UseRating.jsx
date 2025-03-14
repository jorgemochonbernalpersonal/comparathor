import { useQuery } from "@tanstack/react-query";
import { useContext, useState, useCallback, useMemo } from "react";
import { RatingContext } from "../contexts/RatingContext";
import { getAllRatings, getUserRatingForProduct } from "../api/ratings/RatingLogic";
import { useFetch } from "./UseFetch";

export const useRating = (filters = {}) => {
    const { fetchData } = useFetch();
    const context = useContext(RatingContext);

    if (!context) {
        throw new Error("useRating debe ser usado dentro de un RatingProvider");
    }

    const { createRating, updateRating, deleteRating, fetchUserRating } = context;

    const [currentPage, setCurrentPage] = useState(filters.page || 1);
    const [sortField, setSortField] = useState(filters.sortField || "createdAt");
    const [sortOrder, setSortOrder] = useState(filters.sortOrder || "desc");

    const queryKey = useMemo(() => ["ratings", { ...filters, sortField, sortOrder, page: currentPage }],
        [filters, sortField, sortOrder, currentPage]
    );

    const { data: ratingsData, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: () => getAllRatings(fetchData, { ...filters, sortField, sortOrder, page: currentPage }),
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
        ratings: ratingsData?.ratings || [],
        totalRatings: ratingsData?.total || 0,
        isLoading,
        error,
        refetchRatings: refetch,
        fetchUserRating,
        createRating,
        updateRating,
        deleteRating,
        sortField,
        sortOrder,
        handleSort,
        currentPage,
        handlePageChange,
    }), [
        ratingsData, isLoading, error, refetch, fetchUserRating, createRating, updateRating, deleteRating,
        sortField, sortOrder, handleSort, currentPage, handlePageChange
    ]);
};
