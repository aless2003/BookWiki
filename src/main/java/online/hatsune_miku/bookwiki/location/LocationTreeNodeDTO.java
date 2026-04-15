package online.hatsune_miku.bookwiki.location;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationTreeNodeDTO {
    private Long id;
    private String name;
    private String pictureUrl;
    private Double areaPercentage;
    private List<LocationTreeNodeDTO> children = new ArrayList<>();
}
