import {
    fetchAllRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
} from "./RoleRequest";

export const getAllRoles = async (fetchData, filters = {}) => {
    if (!fetchData) {
        return { roles: [], total: 0 };
    }

    try {
        const queryParams = new URLSearchParams();

        if (filters.roleName) queryParams.append("roleName", filters.roleName);
        if (filters.search?.trim()) queryParams.append("search", filters.search.trim());
        if (filters.startDate) queryParams.append("startDate", filters.startDate.toString());
        if (filters.endDate) queryParams.append("endDate", filters.endDate.toString());
        if (filters.updatedStartDate) queryParams.append("updatedStartDate", filters.updatedStartDate.toString());
        if (filters.updatedEndDate) queryParams.append("updatedEndDate", filters.updatedEndDate.toString());
        if (filters.roleCreatedBy) queryParams.append("roleCreatedBy", filters.roleCreatedBy);
        if (filters.sortField) queryParams.append("sortField", filters.sortField);
        if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

        const endpoint = `roles?${queryParams.toString()}`;
        const response = await fetchAllRoles(fetchData, endpoint);

        return {
            roles: response.content ?? [],
            total: response.totalElements ?? 0,
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error al cargar roles.");
    }
};

export const getRoleById = async (fetchData, roleId) => {
    if (!fetchData) {
        throw new Error("fetchData no está disponible.");
    }

    try {
        return await fetchRoleById(fetchData, roleId);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al obtener el rol con ID ${roleId}.`);
    }
};

export const addRole = async (fetchData, newRole) => {
    if (!fetchData) {
        throw new Error("fetchData no está disponible.");
    }

    try {
        return await createRole(fetchData, newRole);
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error al agregar rol.");
    }
};

export const updateRoleById = async (fetchData, roleId, updates) => {
    if (!fetchData) {
        throw new Error("fetchData no está disponible.");
    }

    try {
        return await updateRole(fetchData, roleId, updates);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al actualizar el rol con ID ${roleId}.`);
    }
};

export const deleteRoleById = async (fetchData, roleId) => {
    if (!fetchData) {
        throw new Error("fetchData no está disponible.");
    }

    try {
        await deleteRole(fetchData, roleId);
        return true;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al eliminar el rol con ID ${roleId}.`);
    }
};
