import React, { createContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../hooks/UseFetch";
import { uploadExcel, downloadExcelTemplate } from "../api/excel/ExcelLogic";
import { toast } from "react-toastify";

export const ExcelContext = createContext();

export const ExcelProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const queryClient = useQueryClient();

    const handleMutationError = (error, defaultMessage) => {
        let errorMessage = error?.response?.data?.message || error?.message || defaultMessage;
        toast.error(`❌ ${errorMessage}`);
        return { success: false, message: errorMessage };
    };

    const uploadExcelMutation = useMutation({
        mutationFn: ({ tableName, file }) => uploadExcel(fetchData, tableName, file),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["excel"]);
            if (!data.success) {
                toast.error(`❌ Errores en la subida:\n- ${data.details.join("\n- ")}`);
                return { success: false, message: data.message, details: data.details || [] };
            }
            toast.success("✅ Archivo Excel subido correctamente.");
            return { success: true, message: "Archivo subido correctamente." };
        },
        onError: (error) => handleMutationError(error, "Error inesperado en la subida del archivo."),
    });

    const downloadTemplateMutation = useMutation({
        mutationFn: ({ tableName, format }) => downloadExcelTemplate(fetchData, tableName, format),
        onSuccess: () => {
            toast.success("📥 Plantilla descargada correctamente.");
        },
        onError: (error) => handleMutationError(error, "Error al descargar la plantilla."),
    });

    const handleUploadExcel = async (tableName, file) => {
        if (!file) {
            toast.error("⚠️ No se seleccionó ningún archivo.");
            return { success: false, message: "⚠️ No se seleccionó ningún archivo." };
        }

        if (!tableName || typeof tableName !== "string") {
            toast.error("⚠️ Nombre de tabla inválido.");
            return { success: false, message: "⚠️ Nombre de tabla inválido." };
        }

        const allowedExtensions = [".xlsx", ".ods", ".csv"];
        const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            toast.error("⚠️ Formato de archivo no permitido.");
            return { success: false, message: "⚠️ Formato de archivo no permitido." };
        }

        if (uploadExcelMutation.isLoading) {
            toast.info("⏳ La subida ya está en curso.");
            return { success: false, message: "⏳ La subida ya está en curso." };
        }

        return await uploadExcelMutation.mutateAsync({ tableName, file });
    };

    const handleDownloadTemplate = async (tableName, format = "xlsx") => {
        console.log(tableName)
        if (!tableName || typeof tableName !== "string") {
            toast.error("⚠️ Nombre de tabla inválido.");
            return { success: false, message: "⚠️ Nombre de tabla no definido." };
        }

        const allowedFormats = ["xlsx", "ods", "csv"];
        if (!allowedFormats.includes(format)) {
            toast.error("⚠️ Formato de descarga no permitido.");
            return { success: false, message: "⚠️ Formato de archivo no permitido." };
        }

        return await downloadTemplateMutation.mutateAsync({ tableName, format });
    };

    return (
        <ExcelContext.Provider value={{
            handleUploadExcel,
            handleDownloadTemplate,
            isUploading: uploadExcelMutation.isLoading,
            isDownloading: downloadTemplateMutation.isLoading,
        }}>
            {children}
        </ExcelContext.Provider>
    );
};
