package online.hatsune_miku.bookwiki.item;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByStoryId(Long storyId);
}
