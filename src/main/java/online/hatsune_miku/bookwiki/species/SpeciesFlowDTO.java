package online.hatsune_miku.bookwiki.species;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class SpeciesFlowDTO {
    private List<SpeciesTreeNodeDTO> nodes = new ArrayList<>();
    private List<SpeciesLinkDTO> edges = new ArrayList<>();
}
