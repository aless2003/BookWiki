package online.hatsune_miku.bookwiki.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import online.hatsune_miku.bookwiki.media.MediaReference;
import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.species.SpeciesLink;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataPackage {
    private String version;
    private List<Story> stories;
    private List<MediaDTO> media;
    private List<SpeciesLink> speciesLinks;
    private List<MediaReference> mediaReferences;
}
