import {
    fetchUserById,
    fetchAllUsers,
    updateUser,
    deleteUser,
} from "./UserRequest";

export const getAllUsers = async (fetchData, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        queryParams.append("page", filters.page !== undefined ? filters.page : 0);
        queryParams.append("size", filters.limit !== undefined ? filters.limit : 10);

        if (filters.roleName) queryParams.append("roleName", filters.roleName);
        if (filters.searchTerm && filters.searchTerm.trim() !== "") {
            queryParams.append("searchTerm", filters.searchTerm.trim());
        }

        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        const endpoint = `users?${queryParams.toString()}`;
        const response = await fetchAllUsers(fetchData, endpoint);
        
        return {
            total: response.totalUsers ?? 0,
            users: response.content ?? [],
        };
    } catch (error) {
        console.error("❌ Error al cargar usuarios:", error);
        return { total: 0, users: [] };
    }
};


export const getUserById = async (fetchData, userId) => {
    try {
        return await fetchUserById(fetchData, userId);
    } catch (error) {
        console.error("❌ Error obteniendo usuario:", error);
        return null;
    }
};

export const updateUserById = async (fetchData, userId, userData) => {
    try {
        const updatedUser = await updateUser(fetchData, userId, userData);
        return updatedUser;
    } catch (error) {
        console.error("❌ Error actualizando usuario:", error);
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
