export const fetchAllCategories = async (fetchData, endpoint) => {
    return await fetchData(endpoint, "GET");
};

export const fetchCategoryById = async (fetchData, categoryId) => {
    return await fetchData(`categories/${categoryId}`, "GET"); 
};

export const createCategory = async (fetchData, categoryData) => {
    return await fetchData("categories", "POST", categoryData);
};

export const updateCategory = async (fetchData, categoryId, categoryData) => {
    return await fetchData(`categories/${categoryId}`, "PUT", categoryData); 
};

export const deleteCategory = async (fetchData, categoryId) => {
    return await fetchData(`categories/${categoryId}`, "DELETE"); 
};
