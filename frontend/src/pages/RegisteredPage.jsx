import React from "react";
import { Outlet } from "react-router-dom";
import RegisteredDashboard from "../components/registered/RegisteredDashboard";
import { translate } from "../utils/Translate"; 

const RegisteredPage = () => {
    return (
        <div className="registered-page">
            <main className="main-content text-center mt-5">
                <h2>{translate("registered.page.title", { defaultValue: "User Panel" })}</h2>
                <RegisteredDashboard />
                <Outlet />
            </main>

        </div>
    );
};

export default RegisteredPage;
