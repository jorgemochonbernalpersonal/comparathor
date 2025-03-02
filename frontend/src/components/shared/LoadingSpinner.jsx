import React from "react";
import "../../styles/spinner.css";

const LoadingSpinner = ({ size = "medium", color = "#007bff" }) => {
    return (
        <div className={`spinner-container ${size}`}>
            <div className="spinner" style={{ borderColor: `${color} transparent transparent transparent` }}></div>
        </div>
    );
};

export default LoadingSpinner;
