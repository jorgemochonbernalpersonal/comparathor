import {
    fetchComparisonById,
    fetchAllComparisons,
    createComparison,
    updateComparison,
    deleteComparison,
    fetchProductsByComparisonId,
} from "./ComparisonRequest";

export const getAllComparisons = async (fetchData, filters = {}) => {
    try {
        const queryParams = new URLSearchParams({
            page: filters.page ?? 0,
            size: filters.size ?? 10,
            sortField: filters.sortField ?? "createdAt",
            sortOrder: filters.sortOrder ?? "desc",
        });

        if (filters.userId) queryParams.append("userId", filters.userId);
        if (filters.title?.trim()) queryParams.append("title", filters.title.trim());
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        if (filters.name?.trim()) queryParams.append("name", filters.name.trim());
        if (filters.category?.trim()) queryParams.append("category", filters.category.trim());
        if (filters.price) queryParams.append("price", filters.price);
        if (filters.stock) queryParams.append("stock", filters.stock);
        if (filters.brand?.trim()) queryParams.append("brand", filters.brand.trim());
        if (filters.model?.trim()) queryParams.append("model", filters.model.trim());

        const endpoint = `comparisons?${queryParams.toString()}`;
        const response = await fetchAllComparisons(fetchData, endpoint);

        return {
            total: response.total ?? 0,
            comparisons: response.content?.map(comparison => ({
                ...comparison,
                productIds: comparison.productIds ?? [],
                products: comparison.products ?? [], 
            })) ?? [],
        };
    } catch (error) {
        throw new Error(error.message || "❌ Error al obtener comparaciones.");
    }
};

export const createComparisonById = async (fetchData, comparisonData) => {
    try {
        if (typeof fetchData !== "function") {
            throw new Error("fetchData no es una función válida.");
        }

        const payload = {
            userId: comparisonData.userId,
            title: comparisonData.title,
            description: comparisonData.description,
            productIds: comparisonData.productIds || [],
        };
        const createdComparison = await createComparison(fetchData, payload);
        if (!createdComparison || createdComparison.error) {
            throw new Error(createdComparison?.message || "Error al registrar la comparación.");
        }
        return createdComparison;
    } catch (error) {
        throw new Error(error.message || "Error al registrar la comparación.");
    }
};

export const getComparisonById = async (fetchData, comparisonId) => {
    try {
        const comparison = await fetchComparisonById(fetchData, comparisonId);
        if (!comparison) return null;

        return {
            ...comparison,
            productIds: comparison.productIds ?? [],
        };
    } catch (error) {
        throw new Error(error.message || "Error al obtener la comparación.");
    }
};

export const updateComparisonById = async (fetchData, comparisonId, comparisonData) => {
    try {
        const payload = {
            title: comparisonData.title,
            description: comparisonData.description,
            productIds: comparisonData.products?.map(p => p.productId) ?? [],
        };

        return await updateComparison(fetchData, comparisonId, payload);
    } catch (error) {
        throw new Error(error.message || "Error al actualizar la comparación.");
    }
};

export const deleteComparisonById = async (fetchData, comparisonId) => {
    try {
        await deleteComparison(fetchData, comparisonId);
    } catch (error) {
        throw new Error(error.message || "Error eliminando la comparación.");
    }
};

export const getProductsByComparisonId = async (fetchData, comparisonId) => {
    try {
        const products = await fetchProductsByComparisonId(fetchData, comparisonId);
        if (!products) return [];

        return products.map(product => ({
            name: product.productname,
            category: product.category,
            price: product.price,
            stock: product.stock,
            description: product.description,
            brand: product.brand,
            model: product.model,
            imageUrl: product.image_url,
            createdAt: product.created_at,
            updatedAt: product.updated_at
        }));
    } catch (error) {
        throw new Error(error.message || "Error al obtener los productos.");
    }
};
