import React from "react";
import { Box, Typography } from "@mui/material";
import { translate } from "../../utils/Translate";

const Footer = () => {
    return (
        <Box component="footer" sx={{ bgcolor: "black", color: "white", textAlign: "center", py: 2, mt: 4 }}>
            <Typography variant="body2">
                © {new Date().getFullYear()} Comparathor. {translate("shared.footer.rights")}
            </Typography>
        </Box>
    );
};

export default Footer;
