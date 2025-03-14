export const fetchComparisonById = async (fetchData, comparisonId) => {
    return await fetchData(`comparisons/${comparisonId}`, "GET");
};

export const fetchAllComparisons = async (fetchData, endpoint) => {
    return await fetchData(endpoint, "GET");
};

export const createComparison = async (fetchData, comparisonData) => {
    return await fetchData("comparisons", "POST", comparisonData);
};

export const updateComparison = async (fetchData, comparisonId, comparisonData) => {
    return await fetchData(`comparisons/${comparisonId}`, "PUT", comparisonData);
};

export const deleteComparison = async (fetchData, comparisonId) => {
    return await fetchData(`comparisons/${comparisonId}`, "DELETE");
};

export const fetchProductsByComparisonId = async (fetchData, comparisonId) => {
    return await fetchData(`comparisons/${comparisonId}/products`, "GET");
};
