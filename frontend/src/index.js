import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { RoleProvider } from "./contexts/RoleContext";
import { ProductProvider } from "./contexts/ProductContext";
import { RatingProvider } from "./contexts/RatingContext";
import AppRoutes from "./router/Index";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./styles/global.css";
import { ComparisonsContextProvider } from "./contexts/ComparisonsContext";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <UserProvider>
                        <RoleProvider>
                            <ProductProvider>
                                <RatingProvider>
                                    <ComparisonsContextProvider>
                                        <AppRoutes />
                                        <ToastContainer position="bottom-left" autoClose={3000} />
                                    </ComparisonsContextProvider>
                                </RatingProvider>
                            </ProductProvider>
                        </RoleProvider>
                    </UserProvider>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);
