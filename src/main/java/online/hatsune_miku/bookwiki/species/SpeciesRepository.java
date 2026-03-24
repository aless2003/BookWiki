package online.hatsune_miku.bookwiki.species;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpeciesRepository extends JpaRepository<Species, Long> {
    List<Species> findByStoryId(Long storyId);
    List<Species> findByParentId(Long parentId);
}
