import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { RoleProvider } from "./contexts/RoleContext";
import { ProductProvider } from "./contexts/ProductContext"; 
import AppRoutes from "./router/Index";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <UserProvider>
                    <RoleProvider>
                        <ProductProvider>
                            <AppRoutes />
                        </ProductProvider>
                    </RoleProvider>
                </UserProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
