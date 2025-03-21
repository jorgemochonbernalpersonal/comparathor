import { fetchUploadExcel, fetchDownloadTemplate } from "./ExcelRequest";

export const uploadExcel = async (fetchData, tableName, file) => {
    if (typeof fetchData !== "function") {
        throw new Error("fetchData no es una función válida.");
    }

    try {
        const response = await fetchUploadExcel(fetchData, tableName, file);

        if (!response || Object.keys(response).length === 0) {
            throw new Error("Respuesta vacía o inválida del servidor.");
        }

        if (response.success === false) {
            return {
                success: false,
                message: response.message || "Se encontraron errores en la subida.",
                details: response.details || []
            };
        }

        return { success: true, message: response.message };

    } catch (error) {
        console.error("Error en uploadExcel:", error);

        const errorMessage =
            error?.response?.data?.message || 
            error?.message || 
            "Error desconocido.";

        return { success: false, message: errorMessage, details: [] };
    }
};

export const downloadExcelTemplate = async (fetchData, tableName, format = "xlsx") => {
    console.log('sisd')
    if (typeof fetchData !== "function") {
        throw new Error("fetchData no es una función válida.");
    }

    try {
        const blob = await fetchDownloadTemplate(fetchData, tableName, format);

        if (!(blob instanceof Blob)) {
            throw new Error("La respuesta no es un archivo válido.");
        }

        const fileName = `${tableName}_template.${format}`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error al descargar la plantilla de Excel:", error);
    }
};
