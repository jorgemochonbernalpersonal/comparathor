import Home from "../components/public/Home";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import UserList from "../components/admin/users/UserList";
import ProductList from "../components/admin/products/ProductList";
import UserProductList from "../components/registered/products/UserProductList";
import RoleList from "../components/admin/roles/RolesList";
import UserComparisonsList from "../components/registered/comparisons/UserComparisonsList";

export const publicRoutes = [
    { path: "/", element: <Home />, endpoint: null }, 
    { path: "/login", element: <Login />, endpoint: "auth/login" },
    { path: "/register", element: <Register />, endpoint: "auth/register" },
];

export const adminRoutes = [
    { path: "products", element: <ProductList />, endpoint: "products" },
    { path: "users", element: <UserList />, endpoint: "users" },
    { path: "roles", element: <RoleList />, endpoint: "roles" },
];

export const registeredRoutes = [
    { path: "products", element: <UserProductList />, endpoint: "/products" },
    { path: "comparisons", element: <UserComparisonsList />, endpoint: "/comparisons" },
];