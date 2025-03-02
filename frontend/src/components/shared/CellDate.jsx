import React from "react";
import moment from "moment";
import "moment/locale/es";

const CellDate = ({ value }) => {
    if (!value) {
        return <span style={{ color: "#6c757d", fontStyle: "italic" }}>Fecha no disponible</span>;
    }

    const formattedDate = moment(value).locale("es").format("DD/MM/YYYY");

    return (
        <span style={{ 
            fontWeight: "bold", 
            color: "#495057", 
            padding: "5px 10px",
            borderRadius: "6px",
            backgroundColor: "#e9ecef", 
            display: "inline-block"
        }}>
            {formattedDate}
        </span>
    );
};

export default CellDate;
