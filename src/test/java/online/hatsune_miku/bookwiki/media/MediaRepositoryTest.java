package online.hatsune_miku.bookwiki.media;

import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Blob;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class MediaRepositoryTest {

    @Autowired
    private MediaRepository mediaRepository;

    @Test
    void testCRUD() throws Exception {
        Media media = new Media();
        media.setFilename("test.png");
        media.setContentType("image/png");
        
        byte[] content = "Hello World".getBytes();
        Blob blob = Hibernate.getLobHelper().createBlob(content);
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
