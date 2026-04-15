package online.hatsune_miku.bookwiki.location;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationFlowDTO {
    private List<LocationTreeNodeDTO> nodes;
    private List<LocationLink> edges;
}
