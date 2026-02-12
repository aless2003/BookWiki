package online.hatsune_miku.bookwiki.export;

import online.hatsune_miku.bookwiki.chapter.Chapter;
import java.io.IOException;
import java.util.List;

public interface ExportService {
    byte[] export(String title, List<Chapter> chapters) throws IOException;
    String getFormat();
}
