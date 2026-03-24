package online.hatsune_miku.bookwiki.species;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpeciesLinkRepository extends JpaRepository<SpeciesLink, Long> {
    List<SpeciesLink> findBySourceSpeciesIdOrTargetSpeciesId(Long sourceSpeciesId, Long targetSpeciesId);
    
    default List<SpeciesLink> findAllBySpeciesId(Long speciesId) {
        return findBySourceSpeciesIdOrTargetSpeciesId(speciesId, speciesId);
    }
}
