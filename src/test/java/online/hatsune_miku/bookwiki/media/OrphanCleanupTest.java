package online.hatsune_miku.bookwiki.media;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import jakarta.transaction.Transactional;
import org.hibernate.Session;
import jakarta.persistence.EntityManager;

import java.sql.Blob;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class OrphanCleanupTest {

    @Autowired
    private ReferenceTrackingService referenceTrackingService;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void testOrphanCleanup() throws Exception {
        // Create media
        Media media = new Media();
        media.setFilename("orphan.png");
        media.setContentType("image/png");
        Session session = entityManager.unwrap(Session.class);
        Blob blob = session.doReturningWork(connection -> connection.createBlob());
        media.setData(blob);
        media = mediaRepository.save(media);
        UUID mediaId = media.getId();

        // Create reference
        String content = "#{image:" + mediaId + "}";
        referenceTrackingService.updateReferences(content, "CHAPTER", 1L);
        assertTrue(mediaRepository.existsById(mediaId));

        // Remove reference
        referenceTrackingService.updateReferences("No more image", "CHAPTER", 1L);
        
        // Media should be deleted
        assertFalse(mediaRepository.existsById(mediaId));
    }
}
