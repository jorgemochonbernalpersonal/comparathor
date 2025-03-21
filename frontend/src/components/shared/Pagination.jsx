import React from "react";
import { Button } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { translate } from "../../utils/Translate"; 

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (!totalPages || !onPageChange) return null;

    return (
        <div className="pagination-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
            <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
                sx={{ marginRight: 2 }}
            >
                {translate("shared.table.previous")}
            </Button>

            <span className="pagination-text">
                {translate("shared.table.page")} {currentPage + 1} {translate("shared.table.of")} {totalPages}
            </span>

            <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                disabled={currentPage >= totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
                sx={{ marginLeft: 2 }}
            >
                {translate("shared.table.next")}
            </Button>
        </div>
    );
};

export default Pagination;
