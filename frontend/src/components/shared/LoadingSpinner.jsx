import React from "react";
import { CircularProgress, Box } from "@mui/material";
import { translate } from "../../utils/Translate";

const LoadingSpinner = ({ size = "medium", color = "primary" }) => {
    const sizeMap = {
        small: 20,
        medium: 40,
        large: 60
    };

    const validColors = ["primary", "secondary", "inherit", "success", "error", "info", "warning"];
    const muiColor = validColors.includes(color) ? color : "primary";

    return (
        <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress size={sizeMap[size] || 40} color={muiColor} />
            <Box ml={2}>{translate("shared.messages.loading")}</Box>
        </Box>
    );
};

export default LoadingSpinner;
