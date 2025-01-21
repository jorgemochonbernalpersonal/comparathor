import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import UserDashboard from '../components/Registered/UserDashboard';
import ComparisonList from '../components/Registered/Comparisons/ComparisonList';
import ComparisonForm from '../components/Registered/Comparisons/ComparisonForm';
import ComparisonDetails from '../components/Registered/Comparisons/ComparisonDetails';

const RegisteredRoutes = () => {
    return (
        <>
            <ProtectedRoute role="registered">
                <Route path="/user/dashboard" element={<UserDashboard />} />
                <Route path="/user/comparisons" element={<ComparisonList />} />
                <Route path="/user/comparisons/new" element={<ComparisonForm />} />
                <Route path="/user/comparisons/:id" element={<ComparisonDetails />} />
            </ProtectedRoute>
        </>
    );
};

export default RegisteredRoutes;
