import {
    fetchUserById,
    fetchAllUsers,
    updateUser,
    deleteUser,
    createUser,
} from "./UserRequest";

export const getAllUsers = async (fetchData, filters = {}) => {
    try {
        const queryParams = new URLSearchParams({
            page: filters.page ?? 0,
            size: filters.size ?? 10,
            sortField: filters.sortField ?? "id",  
            sortOrder: filters.sortOrder ?? "asc", 
        });

        if (filters.role_id) queryParams.append("roleId", filters.role_id);
        if (filters.search?.trim()) queryParams.append("search", filters.search.trim());
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        const endpoint = `users?${queryParams.toString()}`;
        const response = await fetchAllUsers(fetchData, endpoint);
        console.log(endpoint)

        return {
            total: response.total ?? 0,
            users: response.content ?? [],
        };
    } catch (error) {
        return { total: 0, users: [] };
    }
};

export const createUserById = async (fetchData, userData) => {
    try {
        if (typeof fetchData !== "function") {
            throw new Error("❌ fetchData no es una función válida.");
        }

        const createdUser = await createUser(fetchData, userData);

        if (!createdUser || createdUser.error) {
            throw new Error(createdUser?.message || "❌ Error al registrar el usuario.");
        }

        return createdUser;
    } catch (error) {
        console.error("❌ Error en createUserById:", error);
        const parseError = (error) => {
            if (error.response && error.response.data) {
                return error.response.data.message || "❌ Error al registrar el usuario.";
            }
            return error.message || "❌ Error al registrar el usuario.";
        };
        throw new Error(parseError(error));
    }
};


export const getUserById = async (fetchData, userId) => {
    try {
        return await fetchUserById(fetchData, userId);
    } catch (error) {
        return null;
    }
};

export const updateUserById = async (fetchData, userId, userData) => {
    try {
        const updatedUser = await updateUser(fetchData, userId, userData);
        return updatedUser;
    } catch (error) {
        return null;
    }
};

export const deleteUserById = async (fetchData, userId) => {
    try {
        await deleteUser(fetchData, userId);
        console.log(`🗑️ Usuario con ID ${userId} eliminado.`);
    } catch (error) {
        console.error("❌ Error eliminando usuario:", error);
    }
};
