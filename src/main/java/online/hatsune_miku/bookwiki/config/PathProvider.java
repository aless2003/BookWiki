package online.hatsune_miku.bookwiki.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class PathProvider {

    @Value("${bookwiki.standalone:false}")
    private boolean standalone;

    public void setStandalone(boolean standalone) {
        this.standalone = standalone;
    }

    public boolean isStandalone() {
        return standalone;
    }

    public Path getBaseDataPath() {
        Path path;
        if (standalone) {
            String appData = System.getenv("APPDATA");
            if (appData == null) {
                // For Mac/Linux:
                String userHome = System.getProperty("user.home");
                path = Paths.get(userHome, "BookWiki");
            } else {
                path = Paths.get(appData, "BookWiki");
            }
            path = path.toAbsolutePath().normalize();
            ensureDirectoryExists(path);
            return path;
        } else {
            return Paths.get(".").toAbsolutePath().normalize();
        }
    }

    public Path getUploadPath() {
        Path path;
        if (standalone) {
            path = getBaseDataPath().resolve("uploads").toAbsolutePath().normalize();
        } else {
            path = Paths.get("uploads").toAbsolutePath().normalize();
        }
        ensureDirectoryExists(path);
        return path;
    }

    public String getH2JdbcUrl() {
        Path dbPath = getBaseDataPath().resolve("data").resolve("bookwiki").toAbsolutePath().normalize();
        ensureDirectoryExists(dbPath.getParent());
        
        // H2 URL format: jdbc:h2:file:/path/to/file (or C:/path/on/windows)
        String pathStr = dbPath.toString().replace("\\", "/");
        // On Windows, if the path starts with a drive letter (e.g., C:/), don't add a leading slash.
        // On Unix-like systems, the absolute path already starts with /.
        if (!pathStr.startsWith("/") && !pathStr.contains(":")) {
            pathStr = "/" + pathStr;
        }
        return "jdbc:h2:file:" + pathStr + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH";
    }

    private void ensureDirectoryExists(Path path) {
        try {
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create directory: " + path, e);
        }
    }
}
