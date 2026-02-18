package online.hatsune_miku.bookwiki.media;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadMedia(@RequestParam("file") MultipartFile file) {
        try {
            Media media = mediaService.saveMedia(file);
            return ResponseEntity.ok(Map.of(
                    "id", media.getId().toString(),
                    "url", "/api/media/" + media.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/media/{id}")
    public ResponseEntity<InputStreamResource> getMedia(@PathVariable UUID id) {
        try {
            Media media = mediaService.getMedia(id);
            InputStream is = mediaService.getMediaStream(id);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(media.getContentType()))
                    .body(new InputStreamResource(is));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
