package online.hatsune_miku.bookwiki.media;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MediaReferenceRepository extends JpaRepository<MediaReference, Long> {
    List<MediaReference> findByMediaId(UUID mediaId);
    List<MediaReference> findByEntityTypeAndEntityId(String entityType, Long entityId);
    void deleteByEntityTypeAndEntityId(String entityType, Long entityId);
}
