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
@CrossOrigin(origins = "http://localhost:5173")
public class FileUploadController {

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
    private final Tika tika;

    public FileUploadController() {
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            tika = new Tika();
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload folder", e);
        }
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
            Path destinationPath = this.uploadDir.toRealPath();
            Path targetPath = destinationPath.resolve(filename).normalize().toAbsolutePath();

            if (!targetPath.startsWith(destinationPath)) {
                throw new SecurityException("Security Error: Cannot store file outside of upload directory.");
            }

            try (var is = file.getInputStream()) {
                //noinspection JvmTaintAnalysis -> Already validated the file type, and this is supposed to be used locally anyways.
                Files.copy(is, destinationPath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Return the URL to access the file
            String fileUrl = "http://localhost:3906/uploads/" + filename;
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not upload file: " + e.getMessage()));
        }
    }
}
