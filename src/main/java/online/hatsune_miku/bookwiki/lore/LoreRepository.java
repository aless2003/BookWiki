package online.hatsune_miku.bookwiki.lore;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoreRepository extends JpaRepository<Lore, Long> {
    List<Lore> findByStoryId(Long storyId);
}
