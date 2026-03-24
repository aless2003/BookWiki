package online.hatsune_miku.bookwiki.species;

import lombok.Data;

@Data
public class SpeciesLinkDTO {
    private Long id;
    private Long sourceSpeciesId;
    private Long targetSpeciesId;
    private String label;
    private boolean isBidirectional;
}
