package com.comparathor.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret) {

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true // 🔹 Usa HTTPS para mayor seguridad
        ));
    }

    public String uploadImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("🚫 Archivo vacío. No se puede subir.");
        }

        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "products",  // 🔹 Guardar en una carpeta específica
                            "use_filename", true,
                            "unique_filename", true // 🔹 Evita sobrescribir archivos
                    )
            );

            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new IOException("Error al subir la imagen a Cloudinary: " + e.getMessage());
        }
    }

    public void deleteImage(String publicId) throws IOException {
        if (publicId == null || publicId.trim().isEmpty()) {
            throw new IOException("PublicId inválido. No se puede eliminar la imagen.");
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new IOException("Error al eliminar imagen en Cloudinary: " + e.getMessage());
        }
    }


    public String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("/")) {
            return null;
        }

        // 🔹 Expresión regular para extraer el PublicId sin la extensión
        Pattern pattern = Pattern.compile(".*/(?<publicId>[^/]+)\\.[a-zA-Z]+$");
        Matcher matcher = pattern.matcher(imageUrl);

        if (matcher.find()) {
            return matcher.group("publicId");
        } else {
            return null;
        }
    }
}
