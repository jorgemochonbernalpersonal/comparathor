import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import Home from "../components/Public/Home";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import AdminRoute from "../router/AdminRoute";
import AdminPage from "../pages/AdminPage";
import ProductList from "../components/Admin/Products/ProductList";
import ProductForm from "../components/Admin/Products/ProductForm";
import UserList from "../components/Admin/Users/UserList";

const AppRoutes = () => {
    return (
        <>
            <Header />
            <div className="content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/admin/*" element={<AdminRoute />}>
                        <Route path="" element={<AdminPage />}>
                            <Route path="products" element={<ProductList />} />
                            <Route path="product/new" element={<ProductForm />} />
                            <Route path="product/:id/edit" element={<ProductForm />} />
                            <Route path="users" element={<UserList />} />
                        </Route>
                    </Route>
                </Routes>
            </div>
            <Footer />
        </>
    );
};

export default AppRoutes;
