import {
    fetchAllRatings,
    fetchRatingById,
    createRating,
    updateRating,
    deleteRating,
    fetchUserRatingForProduct
} from "./RatingRequest";

export const getAllRatings = async (fetchData, filters = {}) => {
    try {
        const queryParams = new URLSearchParams({
            page: filters.page ?? 0,
            size: filters.size ?? 10,
            sortField: filters.sortField ?? "id",
            sortOrder: filters.sortOrder ?? "asc",
        });

        if (filters.userId) queryParams.append("userId", filters.userId);
        if (filters.productId) queryParams.append("productId", filters.productId);
        if (filters.minRating) queryParams.append("minRating", filters.minRating);
        if (filters.maxRating) queryParams.append("maxRating", filters.maxRating);
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        const endpoint = `ratings?${queryParams.toString()}`;
        const response = await fetchAllRatings(fetchData, endpoint);

        return {
            total: response.total ?? 0,
            ratings: response.content ?? [],
        };
    } catch (error) {
        return { total: 0, ratings: [] };
    }
};

export const createRatingById = async (fetchData, ratingData) => {
    try {
        if (typeof fetchData !== "function") {
            throw new Error("fetchData no es una función válida.");
        }

        const createdRating = await createRating(fetchData, ratingData);

        if (!createdRating || createdRating.error) {
            throw new Error(createdRating?.message || "❌ Error al registrar el rating");
        }

        return createdRating;
    } catch (error) {
        throw new Error(error.message || "Error al registrar el rating.");
    }
};

export const getRatingById = async (fetchData, ratingId) => {
    try {
        return await fetchRatingById(fetchData, ratingId);
    } catch (error) {
        return null;
    }
};

export const updateRatingById = async (fetchData, ratingId, ratingData) => {
    try {
        const response = await updateRating(fetchData, ratingId, ratingData);
        return response;
    } catch (error) {
        return null;
    }
};

export const deleteRatingById = async (fetchData, ratingId) => {
    try {
        await deleteRating(fetchData, ratingId);
    } catch (error) {
        console.error("Error eliminando rating:", error);
    }
};

export const getUserRatingForProduct = async (fetchData, productId, userId) => {
    try {
        const endpoint = `ratings/product/${productId}/user/${userId}`;
        const response = await fetchUserRatingForProduct(fetchData, endpoint);
        return response || null;
    } catch (error) {
        return error;
    }
};

