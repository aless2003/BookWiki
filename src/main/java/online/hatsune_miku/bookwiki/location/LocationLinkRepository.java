package online.hatsune_miku.bookwiki.location;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LocationLinkRepository extends JpaRepository<LocationLink, Long> {
    @Query("SELECT l FROM LocationLink l WHERE l.sourceLocationId = :locationId OR l.targetLocationId = :locationId")
    List<LocationLink> findAllByLocationId(@Param("locationId") Long locationId);

    @Query("SELECT l FROM LocationLink l WHERE l.sourceLocationId IN :ids OR l.targetLocationId IN :ids")
    List<LocationLink> findAllByLocationIds(@Param("ids") List<Long> ids);
}
