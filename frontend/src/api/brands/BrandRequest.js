export const fetchAllBrands = async (fetchData, endpoint) => {
    return await fetchData(endpoint, "GET");
};

export const fetchBrandById = async (fetchData, brandId) => {
    return await fetchData(`brands/${brandId}`, "GET"); 
};

export const createBrand = async (fetchData, brandData) => {
    return await fetchData("brands", "POST", brandData);
};

export const updateBrand = async (fetchData, brandId, brandData) => {
    return await fetchData(`brands/${brandId}`, "PUT", brandData); 
};

export const deleteBrand = async (fetchData, brandId) => {
    return await fetchData(`brands/${brandId}`, "DELETE"); 
};
