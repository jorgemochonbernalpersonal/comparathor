import {
    fetchAllRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
} from "./RoleRequest";

export const getAllRoles = async (fetchData, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.roleName) queryParams.append("roleName", filters.roleName);

        const endpoint = `/api/roles${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await fetchAllRoles(fetchData, endpoint);

        if (!response || !Array.isArray(response)) {
            throw new Error("⚠️ La API no devolvió un array válido de roles");
        }

        console.log("✅ Roles cargados:", response);
        return { roles: response };
    } catch (error) {
        console.error("❌ Error al cargar roles:", error);
        return { roles: [] };
    }
};

export const getRoleById = async (fetchData, roleId) => {
    try {
        const role = await fetchRoleById(fetchData, roleId);
        console.log(`✅ Rol obtenido [ID ${roleId}]:`, role);
        return role;
    } catch (error) {
        console.error(`❌ Error al obtener el rol con ID ${roleId}:`, error);
        return null;
    }
};

export const addRole = async (fetchData, setRoles, setIsLoading, setError, newRole) => {
    setIsLoading(true);
    try {
        const createdRole = await createRole(fetchData, newRole);
        setRoles((prevRoles) => [...prevRoles, createdRole]);
        console.log("✅ Rol agregado:", createdRole);
        return createdRole;
    } catch (error) {
        console.error("❌ Error al agregar rol:", error);
        setError(error.message || "Error al agregar rol.");
        return null;
    } finally {
        setIsLoading(false);
    }
};

export const updateRoleById = async (fetchData, setRoles, setIsLoading, setError, roleId, updates) => {
    setIsLoading(true);
    try {
        const updatedRole = await updateRole(fetchData, roleId, updates);
        setRoles((prevRoles) => prevRoles.map((r) => (r.id === roleId ? updatedRole : r)));
        console.log(`✅ Rol actualizado [ID ${roleId}]:`, updatedRole);
        return updatedRole;
    } catch (error) {
        console.error("❌ Error al actualizar rol:", error);
        setError(error.message || "Error al actualizar rol.");
        return null;
    } finally {
        setIsLoading(false);
    }
};

export const deleteRoleById = async (fetchData, setRoles, setIsLoading, setError, roleId) => {
    setIsLoading(true);
    try {
        await deleteRole(fetchData, roleId);
        setRoles((prevRoles) => prevRoles.filter((r) => r.id !== roleId));
        console.log(`✅ Rol eliminado [ID ${roleId}]`);
        return true;
    } catch (error) {
        console.error("❌ Error al eliminar rol:", error);
        setError(error.message || "Error al eliminar rol.");
        return false;
    } finally {
        setIsLoading(false);
    }
};
