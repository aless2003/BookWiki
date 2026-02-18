package online.hatsune_miku.bookwiki.export;

import online.hatsune_miku.bookwiki.chapter.Chapter;
import online.hatsune_miku.bookwiki.media.Media;
import online.hatsune_miku.bookwiki.media.MediaRepository;
import org.hibernate.Session;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.sql.Blob;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class PdfExportIntegrationTest {

    @Autowired
    private PdfExportService pdfExportService;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void testExportWithImage() throws Exception {
        // 1. Create media in DB
        Media media = new Media();
        media.setFilename("test.png");
        media.setContentType("image/png");
        Session session = entityManager.unwrap(Session.class);
        // Create a minimal 1x1 transparent PNG
        byte[] pngData = java.util.Base64.getDecoder().decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==");
        Blob blob = session.doReturningWork(connection -> {
            Blob b = connection.createBlob();
            b.setBytes(1, pngData);
            return b;
        });
        media.setData(blob);
        media = mediaRepository.save(media);
        UUID mediaId = media.getId();

        // 2. Create chapter with image shortcode
        Chapter chapter = new Chapter();
        chapter.setTitle("Chapter 1");
        chapter.setContent("<p>Below is an image:</p><img src=\"#{image:" + mediaId + "}\" width=\"100\" />");

        // 3. Export
        byte[] pdf = pdfExportService.export("Test Story", List.of(chapter));
        
        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
        // We can't easily check PDF content, but if it didn't crash, it's a good sign.
    }
}
