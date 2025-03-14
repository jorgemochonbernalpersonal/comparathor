export const fetchAllRatings = async (fetchData, endpoint) => {
    return await fetchData(endpoint, "GET");
}

export const fetchRatingById = async (fetchData, ratingId) => {
    return await fetchData(`ratings/${ratingId}`, "GET");
};

export const updateRating = async (fetchData, ratingId, ratingData) => {
    return await fetchData(`ratings/${ratingId}`, "PUT", ratingData);
};

export const deleteRating = async (fetchData, ratingId) => {
    return await fetchData(`ratings/${ratingId}`, "DELETE");
};

export const createRating = async (fetchData, ratingData) => {
    return await fetchData("ratings", "POST", ratingData);
};

export const fetchUserRatingForProduct = async (fetchData, endpoint) => {
    return await fetchData(endpoint, "GET");
};

