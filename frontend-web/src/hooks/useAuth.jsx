import { useContext } from 'react';
import { UserContext } from './../contexts/UserContext';

export const useAuth = () => {
    const { currentUser, login, registerUser, logout } = useContext(UserContext);

    const isAuthenticated = !!currentUser;

    return {
        currentUser,
        isAuthenticated,
        login,
        registerUser,
        logout,
    };
};
