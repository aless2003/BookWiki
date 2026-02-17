package online.hatsune_miku.bookwiki.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class PathProviderTest {

    @Test
    void testDevModePaths() {
        PathProvider pathProvider = new PathProvider();
        pathProvider.setStandalone(false);

        Path uploadPath = pathProvider.getUploadPath();
        String uploadPathStr = uploadPath.toString().replace("\\", "/");
        assertTrue(uploadPathStr.endsWith("/uploads"), "Expected path to end with /uploads but was: " + uploadPathStr);

        String h2Url = pathProvider.getH2JdbcUrl();
        assertTrue(h2Url.startsWith("jdbc:h2:file:"), "Expected URL to start with jdbc:h2:file: but was: " + h2Url);
        assertTrue(h2Url.contains("/data/bookwiki"), "Expected URL to contain /data/bookwiki but was: " + h2Url);
    }

    @Test
    void testStandaloneModePaths() {
        PathProvider pathProvider = new PathProvider();
        pathProvider.setStandalone(true);

        Path baseDataPath = pathProvider.getBaseDataPath();
        assertTrue(baseDataPath.toString().contains("BookWiki"), "Expected path to contain BookWiki but was: " + baseDataPath);

        Path uploadPath = pathProvider.getUploadPath();
        assertTrue(uploadPath.toString().contains("BookWiki"), "Expected path to contain BookWiki but was: " + uploadPath);
        String uploadPathStr = uploadPath.toString().replace("\\", "/");
        assertTrue(uploadPathStr.contains("/uploads"), "Expected path to contain /uploads but was: " + uploadPathStr);

        String h2Url = pathProvider.getH2JdbcUrl();
        assertTrue(h2Url.contains("BookWiki"), "Expected URL to contain BookWiki but was: " + h2Url);
        assertTrue(h2Url.contains("/data/bookwiki"), "Expected URL to contain /data/bookwiki but was: " + h2Url);
    }
}
