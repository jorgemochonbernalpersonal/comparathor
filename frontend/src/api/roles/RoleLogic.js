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
        if (filters.searchTerm) queryParams.append("searchTerm", filters.searchTerm);
        if (filters.startDate) queryParams.append("startDate", filters.startDate.toString());
        if (filters.endDate) queryParams.append("endDate", filters.endDate.toString());
        if (filters.updatedStartDate) queryParams.append("updatedStartDate", filters.updatedStartDate.toString());
        if (filters.updatedEndDate) queryParams.append("updatedEndDate", filters.updatedEndDate.toString());
        if (filters.roleCreatedBy) queryParams.append("roleCreatedBy", filters.roleCreatedBy);
        if (filters.sortField) queryParams.append("sortField", filters.sortField);
        if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

        const endpoint = `roles?${queryParams.toString()}`;
        console.log("📡 Llamando API:", endpoint); // 🕵️‍♂️ DEBUG

        const response = await fetchAllRoles(fetchData, endpoint);

        return {
            roles: response.content ?? [],
            total: response.totalElements ?? 0,
        };
    } catch (error) {
        console.error("❌ Error al cargar roles:", error.response?.data || error.message);
        return { roles: [], total: 0 };
    }
};

export const getRoleById = async (fetchData, roleId) => {
    if (!fetchData) {
        console.error("❌ Error: `fetchData` no está definido.");
        return null;
    }

    try {
        return await fetchRoleById(fetchData, roleId);
    } catch (error) {
        console.error(`❌ Error al obtener el rol con ID ${roleId}:`, error.response?.data || error.message);
        return null;
    }
};

export const addRole = async (fetchData, newRole) => {
    console.log(newRole)
    if (!fetchData) {
        console.error("❌ Error: `fetchData` no está definido.");
        throw new Error("fetchData no está disponible.");
    }

    try {
        return await createRole(fetchData, newRole);
    } catch (error) {
        console.error("❌ Error al agregar rol:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Error al agregar rol.");
    }
};

export const updateRoleById = async (fetchData, roleId, updates) => {
    console.log(roleId)
    console.log(updates)
    if (!fetchData) {
        console.error("❌ Error: `fetchData` no está definido.");
        throw new Error("fetchData no está disponible.");
    }

    try {
        return await updateRole(fetchData, roleId, updates);
    } catch (error) {
        console.error(`❌ Error al actualizar rol [ID ${roleId}]:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Error al actualizar rol.");
    }
};

export const deleteRoleById = async (fetchData, roleId) => {
    if (!fetchData) {
        console.error("❌ Error: `fetchData` no está definido.");
        throw new Error("fetchData no está disponible.");
    }

    try {
        await deleteRole(fetchData, roleId);
        return true;
    } catch (error) {
        console.error(`❌ Error al eliminar rol [ID ${roleId}]:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Error al eliminar rol.");
    }
};
