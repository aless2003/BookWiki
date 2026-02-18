package online.hatsune_miku.bookwiki.controller;

import org.apache.tika.Tika;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")

public class FileUploadController {

    private final Path uploadDir;
    private final Tika tika;

    public FileUploadController(online.hatsune_miku.bookwiki.config.PathProvider pathProvider) {
        this.uploadDir = pathProvider.getUploadPath();
        this.tika = new Tika();
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            String extension;
            try (var is = file.getInputStream()) {
                String detectedType = tika.detect(is);

                extension = switch (detectedType) {
                    case "image/jpeg" -> ".jpg";
                    case "image/png" -> ".png";
                    case "image/gif" -> ".gif";
                    case "image/webp" -> ".webp";
                    default -> null;
                };
            }

            if (extension == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported file type"));
            }

            String filename = UUID.randomUUID() + extension;
            Path destinationPath = this.uploadDir.toAbsolutePath();
            Path targetPath = destinationPath.resolve(filename).normalize().toAbsolutePath();

            if (!targetPath.startsWith(destinationPath)) {
                throw new SecurityException("Security Error: Cannot store file outside of upload directory.");
            }

            try (var is = file.getInputStream()) {
                //noinspection JvmTaintAnalysis -> Already validated the file type, and this is supposed to be used locally anyways.
                Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Return the URL to access the file
            String fileUrl = "http://localhost:3906/uploads/" + filename;
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not upload file: " + e.getMessage()));
        }
    }
}
