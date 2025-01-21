import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './../router/ProtectedRoute';
import AdminDashboard from './../components/Admin/Dashboard';
import ProductTypeList from './../components/Admin/ProductTypes/ProductTypeList';
import ProductTypeForm from './../components/Admin/ProductTypes/ProductTypeForm.';
import UserList from './../components/Admin/Users/UserList';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute role="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/product-types"
                element={
                    <ProtectedRoute role="admin">
                        <ProductTypeList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/product-types/new"
                element={
                    <ProtectedRoute role="admin">
                        <ProductTypeForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute role="admin">
                        <UserList />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default AdminRoutes;