package online.hatsune_miku.bookwiki.species;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeciesTaxonomyDTO {
    private SpeciesTreeNodeDTO parentNode;
    private SpeciesTreeNodeDTO targetNode;
}
