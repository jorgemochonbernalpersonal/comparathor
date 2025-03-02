import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../utils/Constants";

export const useRole = () => {
    const { role } = useAuth();
    return {
        isAdmin: role === ROLES.ADMIN,
        isUser: role === ROLES.REGISTERED,
        hasRole: (requiredRole) => role === requiredRole, 
    };
};