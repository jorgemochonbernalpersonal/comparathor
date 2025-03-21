import {
    fetchAllCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "./CategoryRequest";

export const getAllCategories = async (fetchData, filters = {}) => {
    try {
        const queryParams = new URLSearchParams({
            page: filters.page ?? 0,
            size: filters.size ?? 10,
            sortField: filters.sortField ?? "id",
            sortOrder: filters.sortOrder ?? "asc",
        });

        if (filters.color) queryParams.append("color", filters.color);
        if (filters.isActive !== undefined) queryParams.append("isActive", filters.isActive);
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        const endpoint = `categories?${queryParams.toString()}`;
        const response = await fetchAllCategories(fetchData, endpoint);
        console.log(endpoint);

        return {
            total: response.total ?? 0,
            categories: response.content ?? [],
        };
    } catch (error) {
        return { total: 0, categories: [] };
    }
};

export const createCategoryById = async (fetchData, categoryData) => {
    try {
        if (typeof fetchData !== "function") {
            throw new Error("❌ fetchData no es una función válida.");
        }

        const createdCategory = await createCategory(fetchData, categoryData);

        if (!createdCategory || createdCategory.error) {
            throw new Error(createdCategory?.message || "❌ Error al registrar la categoría.");
        }

        return createdCategory;
    } catch (error) {
        console.error("❌ Error en createCategoryById:", error);
        const parseError = (error) => {
            if (error.response && error.response.data) {
                return error.response.data.message || "❌ Error al registrar la categoría.";
            }
            return error.message || "❌ Error al registrar la categoría.";
        };
        throw new Error(parseError(error));
    }
};

export const getCategoryById = async (fetchData, categoryId) => {
    try {
        return await fetchCategoryById(fetchData, categoryId);
    } catch (error) {
        return null;
    }
};

export const updateCategoryById = async (fetchData, categoryId, categoryData) => {
    try {
        const updatedCategory = await updateCategory(fetchData, categoryId, categoryData);
        return updatedCategory;
    } catch (error) {
        return null;
    }
};

export const deleteCategoryById = async (fetchData, categoryId) => {
    try {
        await deleteCategory(fetchData, categoryId);
        console.log(`🗑️ Categoría con ID ${categoryId} eliminada.`);
    } catch (error) {
        console.error("❌ Error eliminando categoría:", error);
    }
};
