package online.hatsune_miku.bookwiki.location;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationTaxonomyDTO {
    private LocationTreeNodeDTO parentNode;
    private LocationTreeNodeDTO targetNode;
}
