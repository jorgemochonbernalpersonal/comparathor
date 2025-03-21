import {
    fetchAllRatings,
    fetchRatingById,
    createRating,
    updateRating,
    deleteRating,
    fetchUserRatingForProduct
} from "./RatingRequest";

export const getAllRatings = async (fetchData, filters = {}) => {
    console.log(filters)
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
        if (filters.search?.trim()) queryParams.append("search", filters.search.trim());
        const endpoint = `ratings?${queryParams.toString()}`;
        const response = await fetchAllRatings(fetchData, endpoint);
        return {
            total: response.total ?? 0,
            ratings: response.content ?? [],
        };
    } catch (error) {
        throw new Error(error.message || "Error al obtener las calificaciones.");
    }
};

export const createRatingById = async (fetchData, ratingData) => {
    try {
        if (typeof fetchData !== "function") {
            throw new Error("fetchData no es una función válida.");
        }

        const createdRating = await createRating(fetchData, ratingData);

        if (!createdRating || createdRating.error) {
            throw new Error(createdRating?.message || "Error al registrar el rating");
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
        throw new Error(error.message || "Error al obtener la calificación.");
    }
};

export const updateRatingById = async (fetchData, ratingId, ratingData) => {
    try {
        const response = await updateRating(fetchData, ratingId, ratingData);
        if (!response) {
            throw new Error("No se pudo actualizar la calificación.");
        }
        return response;
    } catch (error) {
        throw new Error(error.message || "Error al actualizar la calificación.");
    }
};

export const deleteRatingById = async (fetchData, ratingId) => {
    try {
        await deleteRating(fetchData, ratingId);
    } catch (error) {
        throw new Error(error.message || "Error al eliminar la calificación.");
    }
};

export const getUserRatingForProduct = async (fetchData, productId, userId) => {
    try {
        const endpoint = `ratings/product/${productId}/user/${userId}`;
        const response = await fetchUserRatingForProduct(fetchData, endpoint);
        if (!response) {
            throw new Error("No se encontró calificación para el usuario y producto especificados.");
        }
        return response;
    } catch (error) {
        throw new Error(error.message || "Error al obtener la calificación del usuario para el producto.");
    }
};
