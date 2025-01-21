// src/router/PublicRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../components/Public/Home';
import LoginPage from './../pages/LoginPage';
import RegisterPage from './../pages/RegisteredPage';

const PublicRoutes = () => {
    return (
        <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Home />} />
        </Routes>
    );
};

export default PublicRoutes;
