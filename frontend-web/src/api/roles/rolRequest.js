export const fetchAllRoles = async (fetchData) => {
    return await fetchData('/roles', 'GET');
};

export const fetchRoleById = async (fetchData, roleId) => {
    return await fetchData(`/roles/${roleId}`, 'GET');
};

export const createRole = async (fetchData, roleData) => {
    return await fetchData('/roles', 'POST', roleData);
};

export const updateRole = async (fetchData, roleId, roleData) => {
    return await fetchData(`/roles/${roleId}`, 'PUT', roleData);
};

export const deleteRole = async (fetchData, roleId) => {
    return await fetchData(`/roles/${roleId}`, 'DELETE');
};
