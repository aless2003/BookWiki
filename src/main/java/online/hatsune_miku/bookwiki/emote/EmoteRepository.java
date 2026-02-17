package online.hatsune_miku.bookwiki.emote;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmoteRepository extends JpaRepository<Emote, Long> {
    List<Emote> findByStoryId(Long storyId);
    boolean existsByStoryIdAndName(Long storyId, String name);
}
