export const fetchAllUsers = async (fetchData) => {
    return await fetchData('/api/users/', 'GET');
};

export const fetchUserById = async (fetchData, userId) => {
    return await fetchData(`/api/users/${userId}`, 'GET');
};

export const createUser = async (fetchData, userData) => {
    return await fetchData('/users/', 'POST', userData);
};

export const loginUser = async (fetchData, credentials) => {
    return await fetchData('/api/users/login', 'POST', credentials);
};

export const updateUser = async (fetchData, userId, userData) => {
    return await fetchData(`/api/users/${userId}`, 'PUT', userData);
};

export const deleteUser = async (fetchData, userId) => {
    return await fetchData(`/api/users/${userId}`, 'DELETE');
};
