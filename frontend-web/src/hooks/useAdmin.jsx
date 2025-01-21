import { useContext } from 'react';
import { UserContext } from './../contexts/UserContext';

export const useAdmin = () => {
    const { currentUser } = useContext(UserContext);

    const isAdmin = currentUser?.role === 'admin';

    return {
        isAdmin,
    };
};
