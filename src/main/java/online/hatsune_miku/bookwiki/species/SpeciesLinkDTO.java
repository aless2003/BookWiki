package online.hatsune_miku.bookwiki.species;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class SpeciesLinkDTO {
    private Long id;
    private Long sourceSpeciesId;
    private Long targetSpeciesId;
    private String label;
    @JsonProperty("isBidirectional")
    private boolean isBidirectional;
}
