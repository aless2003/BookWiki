package online.hatsune_miku.bookwiki.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import online.hatsune_miku.bookwiki.media.Media;
import online.hatsune_miku.bookwiki.story.Story;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataPackage {
    private String version;
    private List<Story> stories;
    private List<Media> media;
}
