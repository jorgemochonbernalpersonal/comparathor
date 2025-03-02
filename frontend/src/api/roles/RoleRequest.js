export const fetchAllRoles = async (fetchData, endpoint) => {
    return await fetchData(endpoint, "GET");
}

export const fetchRoleById = async (fetchData, roleId) => {
    return await fetchData(`/api/roles/${roleId}`, "GET");
};

export const createRole = async (fetchData, roleData) => {
    return await fetchData("/api/roles", "POST", roleData);
};

export const updateRole = async (fetchData, roleId, roleData) => {
    return await fetchData(`/api/roles/${roleId}`, "PUT", roleData);
};

export const deleteRole = async (fetchData, roleId) => {
    return await fetchData(`/api/roles/${roleId}`, "DELETE");
};
