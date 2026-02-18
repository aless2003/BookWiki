package online.hatsune_miku.bookwiki.media;

import online.hatsune_miku.bookwiki.character.Character;
import online.hatsune_miku.bookwiki.character.CharacterRepository;
import online.hatsune_miku.bookwiki.config.PathProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import jakarta.transaction.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
class MigrationServiceTest {

    @Autowired
    private MigrationService migrationService;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private CharacterRepository characterRepository;

    @MockitoBean
    private PathProvider pathProvider;

    @TempDir
    Path tempDir;

    @Test
    void migrateAllBase64() throws Exception {
        // Create a character with Base64 image in description
        String base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        String content = "<p>Look at this:</p><img src=\"data:image/png;base64," + base64Data + "\" width=\"100\" />";
        
        Character character = new Character();
        character.setName("Base64 Char");
        character.setDescription(content);
        character = characterRepository.save(character);

        // Run migration
        migrationService.migrateAllBase64();

        // Verify media created
        assertEquals(1, mediaRepository.count());
        Media media = mediaRepository.findAll().get(0);
        assertTrue(media.getFilename().startsWith("migrated_base64_"));

        // Verify character updated
        Character updated = characterRepository.findById(character.getId()).get();
        assertTrue(updated.getDescription().contains("#{image:" + media.getId() + "}"));
        assertTrue(updated.getDescription().contains("width=\"100\"")); // Attribute preserved
    }
}
