export const fetchLogin = async (fetchData, userData) => {
    return await fetchData("auth/login", "POST", userData);
};

export const fetchRegister = async (fetchData, userData) => {
    return await fetchData("auth/register", "POST", userData);
};

export const fetchRefreshToken = async (fetchData, refreshToken) => {
    console.log("🔄 Enviando refreshToken al backend:", refreshToken);
    return await fetchData("auth/refresh-token", "POST", { refresh_token: refreshToken });
};

export const fetchLogout = async (fetchData, refreshToken) => {
    return await fetchData("auth/logout", "POST", { refresh_token: refreshToken });
};
