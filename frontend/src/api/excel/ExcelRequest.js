export const fetchUploadExcel = async (fetchData, tableName, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return await fetchData(`excel/upload-excel?table=${tableName}`, "POST", formData, {
        "Content-Type": undefined,
    });
};

export const fetchDownloadTemplate = async (fetchData, tableName, format = "xlsx") => {
    return await fetchData(
        `excel/download-template?table=${encodeURIComponent(tableName)}&format=${encodeURIComponent(format)}`,
        "GET",
        null,
        { "Accept": "application/octet-stream" },
        "blob"
    );
};
