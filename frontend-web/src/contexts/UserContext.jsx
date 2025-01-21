import React, { createContext, useContext, useState } from 'react';
import { useFetch } from './../hooks/useFetch';
import {
    fetchUserById,
    fetchAllUsers,
    createUser,
    loginUser,
    updateUser,
    deleteUser,
} from './../api/users/userRequest';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]); 
    const [currentUser, setCurrentUser] = useState(null);
    const { fetchData } = useFetch();

    const loadUsers = async () => {
        const data = await fetchAllUsers(fetchData);
        setUsers(data);
    };

    const getUserById = async (userId) => {
        return await fetchUserById(fetchData, userId);
    };

    const registerUser = async (userData) => {
        const newUser = await createUser(fetchData, userData);
        setUsers((prevUsers) => [...prevUsers, newUser]);
        return newUser;
    };

    const login = async (credentials) => {
        const user = await loginUser(fetchData, credentials);
        setCurrentUser(user);
        return user;
    };

    const updateUserById = async (userId, userData) => {
        const updatedUser = await updateUser(fetchData, userId, userData);
        setUsers((prevUsers) =>
            prevUsers.map((user) => (user.id === userId ? updatedUser : user))
        );
        return updatedUser;
    };

    const deleteUserById = async (userId) => {
        await deleteUser(fetchData, userId);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    };

    return (
        <UserContext.Provider
            value={{
                users,
                currentUser,
                loadUsers,
                getUserById,
                registerUser,
                login,
                updateUserById,
                deleteUserById,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
