package online.hatsune_miku.bookwiki.data;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/data")
public class DataManagementController {

    private final ExportService exportService;
    private final ImportService importService;

    public DataManagementController(ExportService exportService, ImportService importService) {
        this.exportService = exportService;
        this.importService = importService;
    }

    @GetMapping("/export/full")
    public ResponseEntity<byte[]> exportFull() throws IOException {
        byte[] content = exportService.exportFull();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"full_backup.bwiki\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }

    @PostMapping("/export/stories")
    public ResponseEntity<byte[]> exportStories(@RequestBody List<Long> storyIds) throws IOException {
        byte[] content = exportService.exportStories(storyIds);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"stories_export.bwiki\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }

    @PostMapping("/import")
    public ResponseEntity<Void> importData(@RequestParam("file") MultipartFile file) throws IOException {
        importService.importPackage(file);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reset")
    public ResponseEntity<Void> resetApplication() {
        importService.resetAll();
        return ResponseEntity.ok().build();
    }
}
