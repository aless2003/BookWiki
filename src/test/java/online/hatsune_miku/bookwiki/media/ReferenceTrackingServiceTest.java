package online.hatsune_miku.bookwiki.media;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ReferenceTrackingServiceTest {

    @Autowired
    private ReferenceTrackingService referenceTrackingService;

    @Autowired
    private MediaReferenceRepository referenceRepository;

    @Test
    void updateReferences() {
        UUID media1 = UUID.randomUUID();
        UUID media2 = UUID.randomUUID();
        String content = "Text with #{image:" + media1 + "} and #{image:" + media2 + "}";
        
        referenceTrackingService.updateReferences(content, "CHAPTER", 1L);
        
        List<UUID> refs = referenceTrackingService.getReferencedMedia("CHAPTER", 1L);
        assertEquals(2, refs.size());
        assertTrue(refs.contains(media1));
        assertTrue(refs.contains(media2));
        
        // Update to only one reference
        String updatedContent = "Only one #{image:" + media1 + "}";
        referenceTrackingService.updateReferences(updatedContent, "CHAPTER", 1L);
        
        refs = referenceTrackingService.getReferencedMedia("CHAPTER", 1L);
        assertEquals(1, refs.size());
        assertTrue(refs.contains(media1));
        assertFalse(refs.contains(media2));
        
        // Check if media2 is still referenced elsewhere (should be false)
        assertFalse(referenceTrackingService.isMediaReferenced(media2));
    }
}
