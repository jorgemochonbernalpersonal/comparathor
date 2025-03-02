export const fetchAllUsers = async (fetchData, endpoint) => {
    return await fetchData(endpoint, "GET");
}

export const fetchUserById = async (fetchData, userId) => {
    return await fetchData(`users/${userId}`, "GET"); 
};

export const createUser = async (fetchData, userData) => {
    return await fetchData("users", "POST", userData); 
};

export const updateUser = async (fetchData, userId, userData) => {
    return await fetchData(`users/${userId}`, "PUT", userData); 
};

export const deleteUser = async (fetchData, userId) => {
    return await fetchData(`users/${userId}`, "DELETE"); 
};
