package online.hatsune_miku.bookwiki.export;

import lombok.Data;
import java.util.List;

@Data
public class ExportRequest {
    private Long storyId;
    private List<Long> chapterIds;
}
