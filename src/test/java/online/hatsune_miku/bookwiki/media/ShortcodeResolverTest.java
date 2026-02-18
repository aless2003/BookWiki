package online.hatsune_miku.bookwiki.media;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import online.hatsune_miku.bookwiki.export.ShortcodeResolver;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ShortcodeResolverTest {

    @Autowired
    private ShortcodeResolver shortcodeResolver;

    @Test
    void resolveImageInTag() {
        UUID id = UUID.randomUUID();
        String content = "<img src=\"#{image:" + id + "}\" width=\"100\" style=\"border: 1px solid red;\" />";
        String resolved = shortcodeResolver.resolve(content);
        
        assertTrue(resolved.contains("src=\"/api/media/" + id + "\""));
        assertTrue(resolved.contains("width=\"100\""));
        assertTrue(resolved.contains("style=\"border: 1px solid red;\""));
    }
}
