package online.hatsune_miku.bookwiki.media;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID> {
}
