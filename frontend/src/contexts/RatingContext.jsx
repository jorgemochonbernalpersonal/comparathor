import React, { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../hooks/UseFetch";
import { getAllRatings, createRatingById, updateRatingById, deleteRatingById, getUserRatingForProduct } from "../api/ratings/RatingLogic";
import { toast } from "react-toastify";

export const RatingContext = createContext();

export const RatingProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const queryClient = useQueryClient();

    const getErrorMessage = (error, defaultMessage) => {
        let errorMsg = error?.response?.data?.message || error?.message || defaultMessage;
        return errorMsg.replace(/^Error \d+: /, "");
    };

    const { data: ratingData = { ratings: [], total: 0 }, isLoading, refetch } = useQuery({
        queryKey: ["ratings"],
        queryFn: () => getAllRatings(fetchData),
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
        initialData: { ratings: [], total: 0 },
        enabled: false,
    });

    const refetchRatings = () => {
        if (typeof refetch === "function") {
            refetch();
        } else {
            console.warn("`refetchRatings` no está disponible.");
        }
    };

    const createRatingMutation = useMutation({
        mutationFn: async (ratingData) => await createRatingById(fetchData, ratingData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["ratings"]);
            toast.success(data.message || "Calificación creada con éxito.");
            refetchRatings();
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al crear calificación."));
        },
    });

    const updateRatingMutation = useMutation({
        mutationFn: async ({ id, ratingData }) => await updateRatingById(fetchData, id, ratingData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["ratings"]);
            toast.success(data.message || "Calificación actualizada con éxito.");
            refetchRatings();
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al actualizar calificación."));
        },
    });

    const deleteRatingMutation = useMutation({
        mutationFn: async (id) => await deleteRatingById(fetchData, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["ratings"]);
            toast.success(data.message || "Calificación eliminada con éxito.");
            refetchRatings();
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Error al eliminar calificación."));
        },
    });

    const fetchUserRating = async (productId, userId) => {
        try {
            return await getUserRatingForProduct(fetchData, productId, userId);
        } catch (error) {
            console.error("Error al obtener la calificación del usuario:", error);
            return null;
        }
    };

    return (
        <RatingContext.Provider value={{
            ratings: ratingData.ratings,
            totalRatings: ratingData.total,
            isLoading,
            refetchRatings,
            createRating: createRatingMutation.mutateAsync,
            updateRating: updateRatingMutation.mutateAsync,
            deleteRating: deleteRatingMutation.mutateAsync,
            fetchUserRating,
        }}>
            {children}
        </RatingContext.Provider>
    );
};

export const useRating = () => {
    const context = useContext(RatingContext);
    if (!context) {
        throw new Error("useRating debe ser usado dentro de un RatingProvider");
    }
    return context;
};
