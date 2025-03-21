import {
    fetchUserById,
    fetchAllUsers,
    updateUser,
    deleteUser,
    createUser,
} from "./UserRequest";

const parseError = (error, defaultMessage) => {
    if (error.response && error.response.data) {
        return error.response.data.message || defaultMessage;
    }
    return error.message || defaultMessage;
};

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

        return {
            total: response.total ?? 0,
            users: response.content ?? [],
        };
    } catch (error) {
        throw new Error(parseError(error, "Error al obtener los usuarios."));
    }
};

export const createUserById = async (fetchData, userData) => {
    try {
        if (typeof fetchData !== "function") {
            throw new Error("fetchData no es una función válida.");
        }

        const createdUser = await createUser(fetchData, userData);

        if (!createdUser || createdUser.error) {
            throw new Error(createdUser?.message || "Error al registrar el usuario.");
        }

        return createdUser;
    } catch (error) {
        throw new Error(parseError(error, "Error al registrar el usuario."));
    }
};

export const getUserById = async (fetchData, userId) => {
    try {
        return await fetchUserById(fetchData, userId);
    } catch (error) {
        throw new Error(parseError(error, "Error al obtener el usuario."));
    }
};

export const updateUserById = async (fetchData, userId, userData) => {
    try {
        const updatedUser = await updateUser(fetchData, userId, userData);

        if (!updatedUser || updatedUser.error) {
            throw new Error(updatedUser?.message || "Error al actualizar el usuario.");
        }

        return updatedUser;
    } catch (error) {
        throw new Error(parseError(error, "Error al actualizar el usuario."));
    }
};

export const deleteUserById = async (fetchData, userId) => {
    try {
        const deletedUser = await deleteUser(fetchData, userId);

        if (!deletedUser || deletedUser.error) {
            throw new Error(deletedUser?.message || "Error al eliminar el usuario.");
        }

        return deletedUser;
    } catch (error) {
        throw new Error(parseError(error, "Error al eliminar el usuario."));
    }
};
