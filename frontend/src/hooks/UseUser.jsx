import { useQuery } from "@tanstack/react-query";
import { useContext, useState, useCallback, useMemo } from "react";
import { UserContext } from "../contexts/UserContext"; 
import { getAllUsers } from "../api/users/UserLogic";
import { useFetch } from "./UseFetch";  

export const useUser = (filters = {}) => {
    const { fetchData } = useFetch();
    const context = useContext(UserContext);
    
    if (!context) {
        throw new Error("useUser debe ser usado dentro de un UserProvider");
    }

    const { createUser, updateUser, deleteUser } = context;

    const [currentPage, setCurrentPage] = useState(filters.page || 1);
    const [sortField, setSortField] = useState(filters.sortField || "id");
    const [sortOrder, setSortOrder] = useState(filters.sortOrder || "asc");

    const queryKey = useMemo(() => ["users", { ...filters, sortField, sortOrder, page: currentPage }], 
        [filters, sortField, sortOrder, currentPage]
    );

    const { data: usersData, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: () => getAllUsers(fetchData, { ...filters, sortField, sortOrder, page: currentPage }),
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
        users: usersData?.users || [],
        totalUsers: usersData?.total || 0,
        isLoading,
        error,
        refetchUsers: refetch,
        createUser,
        updateUser,
        deleteUser,
        sortField,
        sortOrder,
        handleSort,
        currentPage,
        handlePageChange,
    }), [
        usersData, isLoading, error, refetch, createUser, updateUser, deleteUser,
        sortField, sortOrder, handleSort, currentPage, handlePageChange
    ]);
};
