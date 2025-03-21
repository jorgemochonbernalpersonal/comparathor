package com.comparathor.utils;
import org.apache.commons.io.FileUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;

public class FileMultipartUtil {

    public static MultipartFile convertFileToMultipartFile(File file, String contentType) throws IOException {
        byte[] content = FileUtils.readFileToByteArray(file);
        return new ByteArrayMultipartFile(file.getName(), file.getName(), contentType, content);
    }

    private static class ByteArrayMultipartFile implements MultipartFile {
        private final String name;
        private final String originalFilename;
        private final String contentType;
        private final byte[] content;

        public ByteArrayMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
            this.name = name;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
            this.content = content;
        }

        @Override
        public String getName() { return name; }

        @Override
        public String getOriginalFilename() { return originalFilename; }

        @Override
        public String getContentType() { return contentType; }

        @Override
        public boolean isEmpty() { return content == null || content.length == 0; }

        @Override
        public long getSize() { return content.length; }

        @Override
        public byte[] getBytes() { return content; }

        @Override
        public InputStream getInputStream() { return new ByteArrayInputStream(content); }

        @Override
        public void transferTo(File dest) throws IOException {
            FileUtils.writeByteArrayToFile(dest, content);
        }
    }
}
