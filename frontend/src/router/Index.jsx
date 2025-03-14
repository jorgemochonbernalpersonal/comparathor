import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import AdminRoute from "../router/AdminRoute";
import RegisteredRoute from "../router/RegisteredRoute";
import AdminPage from "../pages/AdminPage";
import RegisteredPage from "../pages/RegisteredPage";
import Unauthorized from "../pages/Unauthorized";
import { publicRoutes, adminRoutes, registeredRoutes } from "./Routes";

const AppRoutes = () => {
    return (
        <>
            <Header />
            <div className="content">
                <Routes>
                    {publicRoutes.map(({ path, element }) => (
                        <Route key={path} path={path} element={element} />
                    ))}

                    <Route path="/admin/*" element={<AdminRoute />}>
                        <Route path="" element={<AdminPage />}>
                            {adminRoutes.map(({ path, element }) => (
                                <Route key={path} path={path} element={element} />
                            ))}
                        </Route>
                    </Route>

                    <Route path="/user/*" element={<RegisteredRoute />}>
                        <Route path="" element={<RegisteredPage />}>
                            {registeredRoutes.map(({ path, element }) => (
                                <Route key={path} path={path} element={element} />
                            ))}
                        </Route>
                    </Route>

                    <Route path="/unauthorized" element={<Unauthorized />} />
                </Routes>
            </div>
            <Footer />
        </>
    );
};

export default AppRoutes;
