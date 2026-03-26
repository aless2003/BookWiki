package online.hatsune_miku.bookwiki.species;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpeciesSectionRepository extends JpaRepository<SpeciesSection, Long> {
    List<SpeciesSection> findAllByInheritedFromSectionId(Long inheritedFromSectionId);
}
