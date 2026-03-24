package online.hatsune_miku.bookwiki.species;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeciesTreeNodeDTO {
    private Long id;
    private String name;
    private String pictureUrl;
    private List<SpeciesTreeNodeDTO> children = new ArrayList<>();
}
