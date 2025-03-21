package com.comparathor.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.odftoolkit.simple.SpreadsheetDocument;
import org.odftoolkit.simple.table.Table;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.comparathor.exception.BadRequestException;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class ExcelService {

    private static final int MAX_RECORDS = 25;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    public Map<String, Object> processExcelFile(MultipartFile file, String tableName) {
        List<Map<String, Object>> data;
        String[] requiredColumns = getColumnsForTable(tableName);

        try {
            if (file.getOriginalFilename().endsWith(".xlsx")) {
                data = readExcelFile(file);
            } else if (file.getOriginalFilename().endsWith(".ods")) {
                data = readOdsFile(file);
            } else if (file.getOriginalFilename().endsWith(".csv")) {
                data = readCsvFile(file);
            } else {
                return Map.of("success", false, "message", "Formato de archivo no soportado. Se permiten .xlsx, .ods y .csv.");
            }
        } catch (Exception e) {
            return Map.of("success", false, "message", "Error al leer el archivo: " + e.getMessage());
        }

        if (data.isEmpty() || data.size() > MAX_RECORDS) {
            return Map.of("success", false, "message", "El archivo debe contener entre 1 y " + MAX_RECORDS + " registros.");
        }

        if (!validateRequiredColumns(data, requiredColumns)) {
            return Map.of("success", false, "message", "El archivo no contiene las columnas requeridas: " + Arrays.toString(requiredColumns));
        }

        return switch (tableName.toLowerCase()) {
            case "users" -> userService.bulkInsertUsers(data);
            case "products" -> productService.bulkInsertProducts(data);
            default -> Map.of("success", false, "message", "Tabla no soportada: " + tableName);
        };
    }

    private List<Map<String, Object>> readCsvFile(MultipartFile file) throws IOException {
        List<Map<String, Object>> data = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = br.readLine();
            if (headerLine == null) {
                throw new IOException("El archivo CSV está vacío.");
            }

            String[] headers = headerLine.split(",");
            String line;
            while ((line = br.readLine()) != null) {
                String[] values = line.split(",");
                Map<String, Object> rowData = new HashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    rowData.put(headers[i].trim(), values.length > i ? values[i].trim() : null);
                }
                data.add(rowData);
            }
        }
        return data;
    }

    private boolean validateRequiredColumns(List<Map<String, Object>> data, String[] requiredColumns) {
        if (data.isEmpty()) return false;
        Set<String> fileColumns = data.get(0).keySet();
        return fileColumns.containsAll(Set.of(requiredColumns));
    }

    private List<Map<String, Object>> readExcelFile(MultipartFile file) throws IOException {
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        Iterator<Row> rows = sheet.iterator();
        List<String> columns = new ArrayList<>();
        List<Map<String, Object>> data = new ArrayList<>();
        if (rows.hasNext()) {
            Row headerRow = rows.next();
            for (Cell cell : headerRow) {
                columns.add(cell.getStringCellValue().trim());
            }
        }
        while (rows.hasNext()) {
            Row row = rows.next();
            Map<String, Object> rowData = new HashMap<>();
            for (int i = 0; i < columns.size(); i++) {
                Cell cell = row.getCell(i);
                rowData.put(columns.get(i), (cell != null) ? getCellValue(cell) : null);
            }
            data.add(rowData);
        }
        return data;
    }

    private List<Map<String, Object>> readOdsFile(MultipartFile file) throws Exception {
        SpreadsheetDocument spreadsheet = SpreadsheetDocument.loadDocument(file.getInputStream());
        Table sheet = spreadsheet.getTableList().get(0);

        List<String> columns = new ArrayList<>();
        List<Map<String, Object>> data = new ArrayList<>();

        for (int i = 0; i < sheet.getRowCount(); i++) {
            Map<String, Object> rowData = new HashMap<>();
            for (int j = 0; j < sheet.getColumnCount(); j++) {
                String value = sheet.getCellByPosition(j, i).getStringValue().trim();
                if (i == 0) {
                    columns.add(value);
                } else {
                    rowData.put(columns.get(j), value);
                }
            }
            if (!rowData.isEmpty()) {
                data.add(rowData);
            }
        }
        return data;
    }

    private String getCellValue(Cell cell) {
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> (cell.getNumericCellValue() % 1 == 0) ?
                    String.valueOf((long) cell.getNumericCellValue()) :
                    String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    public int countRecords(MultipartFile file) {
        try {
            if (file.getOriginalFilename().endsWith(".xlsx")) {
                Workbook workbook = WorkbookFactory.create(file.getInputStream());
                Sheet sheet = workbook.getSheetAt(0);
                return sheet.getPhysicalNumberOfRows() - 1;
            } else if (file.getOriginalFilename().endsWith(".ods")) {
                SpreadsheetDocument spreadsheet = SpreadsheetDocument.loadDocument(file.getInputStream());
                Table sheet = spreadsheet.getTableList().get(0);
                return sheet.getRowCount() - 1;
            } else if (file.getOriginalFilename().endsWith(".csv")) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                    return (int) br.lines().count() - 1; // Excluye la cabecera
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al contar registros en el archivo Excel.", e);
        }
        return 0;
    }

    public byte[] generateTemplate(String tableName, String format) throws Exception {
        return format.equals("ods") ? generateOdsTemplate(tableName) : generateXlsxTemplate(tableName);
    }

    private byte[] generateXlsxTemplate(String tableName) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Template");

        CellStyle headerStyle = createHeaderStyle(workbook);
        String[] columns = getColumnsForTable(tableName);
        Row headerRow = sheet.createRow(0);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();

        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        return style;
    }

    private byte[] generateOdsTemplate(String tableName) throws Exception {
        SpreadsheetDocument odsDocument = SpreadsheetDocument.newSpreadsheetDocument();
        Table sheet = odsDocument.getSheetByIndex(0);
        sheet.setTableName("Template");

        String[] columns = getColumnsForTable(tableName);
        for (int i = 0; i < columns.length; i++) {
            sheet.getCellByPosition(i, 0).setStringValue(columns[i]);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        odsDocument.save(outputStream);
        return outputStream.toByteArray();
    }

    private String[] getColumnsForTable(String tableName) {
        return switch (tableName.toLowerCase()) {
            case "users" -> new String[]{"name", "email", "role"};
            case "products" -> new String[]{"name", "category", "price", "stock", "description", "brand", "model", "imageUrl"};
            case "orders" -> new String[]{"order_id", "customer_name", "total_amount"};
            default -> throw new IllegalArgumentException("Tabla no soportada: " + tableName);
        };
    }
}
