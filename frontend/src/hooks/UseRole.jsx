import { useQuery } from "@tanstack/react-query";
import { useContext, useState, useCallback, useMemo } from "react";
import { RoleContext } from "../contexts/RoleContext";
import { useAuth } from "../hooks/UseAuth"; 
import { useFetch } from "./UseFetch";
import { getAllRoles } from "../api/roles/RoleLogic";
import { ROLES } from "../utils/Constants";

export const useRole = (filters = {}) => {
    const { fetchData } = useFetch();
    const { role: userRole, isAuthenticated } = useAuth(); 
    const context = useContext(RoleContext);

    if (!context) {
        throw new Error("useRole debe ser usado dentro de un RoleProvider");
    }

    const { addRole, updateRole, deleteRole } = context;

    const [currentPage, setCurrentPage] = useState(filters.page || 1);
    const [sortField, setSortField] = useState(filters.sortField || "createdAt");
    const [sortOrder, setSortOrder] = useState(filters.sortOrder || "desc");

    const queryKey = useMemo(() => ["roles", { ...filters, sortField, sortOrder, page: currentPage }],
        [filters, sortField, sortOrder, currentPage]
    );

    const { data: rolesData, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: () => getAllRoles(fetchData, { ...filters, sortField, sortOrder, page: currentPage }),
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

    const isAdmin = userRole && userRole === ROLES.ADMIN;
    const isUser = userRole && userRole === ROLES.REGISTERED;
    const hasRole = (requiredRole) => userRole && userRole === requiredRole;

    return useMemo(() => ({
        roles: rolesData?.roles || [],
        totalRoles: rolesData?.total || 0,
        isLoading,
        error,
        refetchRoles: refetch,
        addRole,
        updateRole,
        deleteRole,
        sortField,
        sortOrder,
        handleSort,
        currentPage,
        handlePageChange,
        isAdmin,
        isUser,
        hasRole,
    }), [
        rolesData, isLoading, error, refetch, addRole, updateRole, deleteRole,
        sortField, sortOrder, handleSort, currentPage, handlePageChange,
        isAdmin, isUser, hasRole
    ]);
};
