import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography, Button, Menu, MenuItem, Box } from "@mui/material";
import { Home, Login, PersonAdd, AccountCircle, Logout, AdminPanelSettings, Settings } from "@mui/icons-material";
import { useAuth } from "../../hooks/UseAuth";
import { translate } from "../../utils/Translate";

const Header = () => {
    const { currentUser, logout, hasRole } = useAuth();
    const location = useLocation();
    const [user, setUser] = useState(currentUser);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        setUser(currentUser);
    }, [currentUser]);

    const handleLogout = async () => {
        await logout();
        window.location.reload();
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static" sx={{ bgcolor: (theme) => theme.palette.grey[900], color: "white" }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    <Link to="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}>
                        Comparathor ⚡
                    </Link>
                </Typography>

                {!user ? (
                    <>
                        <Button
                            component={Link}
                            to="/"
                            color="inherit"
                            startIcon={<Home />}
                            className={location.pathname === "/" ? "active" : ""}
                        >
                            {translate("shared.header.home")}
                        </Button>
                        <Button
                            component={Link}
                            to="/login"
                            color="inherit"
                            startIcon={<Login />}
                            className={location.pathname === "/login" ? "active" : ""}
                        >
                            {translate("shared.header.login")}
                        </Button>
                        <Button
                            component={Link}
                            to="/register"
                            color="inherit"
                            startIcon={<PersonAdd />}
                            className={location.pathname === "/register" ? "active" : ""}
                        >
                            {translate("shared.header.register")}
                        </Button>
                    </>
                ) : (
                    <>
                        {hasRole("ROLE_ADMIN") && (
                            <Button
                                component={Link}
                                to="/admin"
                                color="inherit"
                                startIcon={<AdminPanelSettings />}
                                className={location.pathname.startsWith("/admin") ? "active" : ""}
                            >
                                {translate("shared.header.adminPanel")}
                            </Button>
                        )}
                        {hasRole("ROLE_REGISTERED") && (
                            <Button
                                component={Link}
                                to="/user"
                                color="inherit"
                                startIcon={<Settings />}
                                className={location.pathname.startsWith("/user") ? "active" : ""}
                            >
                                {translate("shared.header.userPanel")}
                            </Button>
                        )}
                        <IconButton color="inherit" onClick={handleMenuOpen}>
                            <AccountCircle />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={handleMenuClose} component={Link} to="/dashboard">
                                {user?.name}
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <Logout sx={{ marginRight: 1 }} /> {translate("shared.header.logout")}
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
