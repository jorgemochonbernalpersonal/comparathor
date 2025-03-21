import { useContext } from "react";
import { ExcelContext } from "../contexts/ExcelContext";

export const useExcel = () => {
    const context = useContext(ExcelContext);

    if (!context) {
        throw new Error("useExcel debe ser usado dentro de un ExcelProvider");
    }

    return context;
};
