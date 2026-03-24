package online.hatsune_miku.bookwiki.species;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "species_links")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@AllArgsConstructor
public class SpeciesLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotNull(message = "sourceSpeciesId is required")
    private Long sourceSpeciesId;
    
    @Column(nullable = false)
    @NotNull(message = "targetSpeciesId is required")
    private Long targetSpeciesId;
    private String label;
    private boolean isBidirectional;
}
