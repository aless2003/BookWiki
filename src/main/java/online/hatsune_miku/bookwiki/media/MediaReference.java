package online.hatsune_miku.bookwiki.media;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "media_references")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MediaReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private UUID mediaId;
    
    private String entityType; // e.g., "CHAPTER", "CHARACTER", "LOCATION"
    private Long entityId;

    public MediaReference(UUID mediaId, String entityType, Long entityId) {
        this.mediaId = mediaId;
        this.entityType = entityType;
        this.entityId = entityId;
    }
}
