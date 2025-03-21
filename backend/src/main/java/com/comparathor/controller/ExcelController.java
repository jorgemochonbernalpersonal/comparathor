package com.comparathor.controller;

import com.comparathor.service.ExcelService;
import com.comparathor.service.UserSecurityService;
import com.comparathor.exception.ForbiddenException;
import com.comparathor.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
public class ExcelController {
    private static final int MAX_RECORDS = 25;

    @Autowired
    private ExcelService excelService;

    @Autowired
    private UserSecurityService userSecurityService;

    @PostMapping("/upload-excel")
    public ResponseEntity<Map<String, Object>> uploadExcel(
            @RequestHeader("Authorization") String token,
            @RequestParam("table") String tableName,
            @RequestParam("file") MultipartFile file) {

        validateAccess(token);
        validateFile(file);

        int recordCount = excelService.countRecords(file);
        if (recordCount > MAX_RECORDS) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("success", false, "message", "El archivo contiene demasiados registros. Máximo permitido: " + MAX_RECORDS)
            );
        }

        try {
            Map<String, Object> result = excelService.processExcelFile(file, tableName);

            boolean hasErrors = result.containsKey("errors") && !((List<?>) result.get("errors")).isEmpty();
            HttpStatus status = hasErrors ? HttpStatus.BAD_REQUEST : HttpStatus.OK;

            return ResponseEntity.status(status).body(result);
        } catch (BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("success", false, "message", e.getMessage(), "errors", e.getDetails())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("success", false, "message", "Error interno del servidor", "errors", List.of(e.getMessage()))
            );
        }
    }

    @GetMapping(value = "/download-template", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> downloadTemplate(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam("table") String tableName,
            @RequestParam(value = "format", defaultValue = "xlsx") String format) throws Exception {

        validateAccess(token);
        byte[] templateBytes = excelService.generateTemplate(tableName, format);
        if (templateBytes == null || templateBytes.length == 0) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
        }

        String fileName = tableName + "_template." + format;
        MediaType contentType = switch (format) {
            case "ods" -> MediaType.parseMediaType("application/vnd.oasis.opendocument.spreadsheet");
            case "csv" -> MediaType.parseMediaType("text/csv");
            default -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        };

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");
        headers.setContentType(contentType);
        headers.setContentLength(templateBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(templateBytes);
    }

    private void validateAccess(String token) {
        if (!userSecurityService.hasRole(token, "ROLE_ADMIN")) {
            throw new ForbiddenException("Acceso denegado. Se requiere el rol: ROLE_ADMIN");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("El archivo no puede estar vacío.");
        }
        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".ods") && !fileName.endsWith(".csv"))) {
            throw new BadRequestException("Formato de archivo no soportado. Se permiten .xlsx, .ods y .csv.");
        }
    }
}
