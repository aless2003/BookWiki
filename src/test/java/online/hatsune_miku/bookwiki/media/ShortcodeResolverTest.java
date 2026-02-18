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
    void resolveImageShortcode() {
        UUID id = UUID.randomUUID();
        String content = "Check this out: #{image:" + id + "}";
        String resolved = shortcodeResolver.resolve(content);
        
        // For now, let's decide what it should resolve to. 
        // During export, it should probably be an <img> tag.
        assertTrue(resolved.contains("<img"));
        assertTrue(resolved.contains("/api/media/" + id));
    }
}
