// src/routes/index.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicRoutes from '../router/PublicRoutes';
import RegisteredRoutes from '../router/RegisteredRoutes';
import AdminRoutes from '../router/AdminRoutes';
import NotFound from '../components/NotFound';

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/*" element={<PublicRoutes />} /> 
      <Route path="/user/*" element={<RegisteredRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AllRoutes;
