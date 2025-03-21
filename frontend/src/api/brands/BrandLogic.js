import {
    fetchAllBrands,
    fetchBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
} from "./BrandRequest";

export const getAllBrands = async (fetchData, filters = {}) => {
    try {
        const queryParams = new URLSearchParams({
            page: filters.page ?? 0,
            size: filters.size ?? 10,
            sortField: filters.sortField ?? "id",
            sortOrder: filters.sortOrder ?? "asc",
        });

        if (filters.reliability) queryParams.append("reliability", filters.reliability);
        if (filters.isActive !== undefined) queryParams.append("isActive", filters.isActive);
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        const endpoint = `brands?${queryParams.toString()}`;
        const response = await fetchAllBrands(fetchData, endpoint);
        console.log(endpoint);

        return {
            total: response.total ?? 0,
            brands: response.content ?? [],
        };
    } catch (error) {
        return { total: 0, brands: [] };
    }
};

export const createBrandById = async (fetchData, brandData) => {
    try {
        if (typeof fetchData !== "function") {
            throw new Error("❌ fetchData no es una función válida.");
        }

        const createdBrand = await createBrand(fetchData, brandData);

        if (!createdBrand || createdBrand.error) {
            throw new Error(createdBrand?.message || "❌ Error al registrar la marca.");
        }

        return createdBrand;
    } catch (error) {
        console.error("❌ Error en createBrandById:", error);
        const parseError = (error) => {
            if (error.response && error.response.data) {
                return error.response.data.message || "❌ Error al registrar la marca.";
            }
            return error.message || "❌ Error al registrar la marca.";
        };
        throw new Error(parseError(error));
    }
};

export const getBrandById = async (fetchData, brandId) => {
    try {
        return await fetchBrandById(fetchData, brandId);
    } catch (error) {
        return null;
    }
};

export const updateBrandById = async (fetchData, brandId, brandData) => {
    try {
        const updatedBrand = await updateBrand(fetchData, brandId, brandData);
        return updatedBrand;
    } catch (error) {
        return null;
    }
};

export const deleteBrandById = async (fetchData, brandId) => {
    try {
        await deleteBrand(fetchData, brandId);
        console.log(`🗑️ Marca con ID ${brandId} eliminada.`);
    } catch (error) {
        console.error("❌ Error eliminando marca:", error);
    }
};
