package online.hatsune_miku.bookwiki.media;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.hibernate.Session;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Blob;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class MediaRepositoryTest {

    @Autowired
    private MediaRepository mediaRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void testCRUD() throws Exception {
        Media media = new Media();
        media.setFilename("test.png");
        media.setContentType("image/png");
        
        byte[] content = "Hello World".getBytes();
        Session session = entityManager.unwrap(Session.class);
        Blob blob = session.doReturningWork(connection -> {
            Blob b = connection.createBlob();
            b.setBytes(1, content);
            return b;
        });
        media.setData(blob);

        Media savedMedia = mediaRepository.save(media);
        assertNotNull(savedMedia.getId());
        assertNotNull(savedMedia.getCreatedAt());

        Optional<Media> foundMedia = mediaRepository.findById(savedMedia.getId());
        assertTrue(foundMedia.isPresent());
        assertEquals("test.png", foundMedia.get().getFilename());
        assertEquals("image/png", foundMedia.get().getContentType());
        
        // Test data retrieval
        Blob savedBlob = foundMedia.get().getData();
        assertArrayEquals(content, savedBlob.getBytes(1, (int) savedBlob.length()));

        mediaRepository.delete(savedMedia);
        assertFalse(mediaRepository.existsById(savedMedia.getId()));
    }
}
