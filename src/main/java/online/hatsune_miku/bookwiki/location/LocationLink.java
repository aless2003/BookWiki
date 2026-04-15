package online.hatsune_miku.bookwiki.location;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "location_links")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@AllArgsConstructor
public class LocationLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotNull(message = "sourceLocationId is required")
    private Long sourceLocationId;
    
    @Column(nullable = false)
    @NotNull(message = "targetLocationId is required")
    private Long targetLocationId;
    
    private String label;
    
    @JsonProperty("isBidirectional")
    private boolean isBidirectional;
}
