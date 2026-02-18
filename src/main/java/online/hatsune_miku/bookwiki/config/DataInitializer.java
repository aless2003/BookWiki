package online.hatsune_miku.bookwiki.config;

import online.hatsune_miku.bookwiki.chapter.Chapter;
import online.hatsune_miku.bookwiki.chapter.ChapterRepository;
import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final online.hatsune_miku.bookwiki.media.MigrationService migrationService;

    public DataInitializer(StoryRepository storyRepository, ChapterRepository chapterRepository, online.hatsune_miku.bookwiki.media.MigrationService migrationService) {
        this.storyRepository = storyRepository;
        this.chapterRepository = chapterRepository;
        this.migrationService = migrationService;
    }

    @Override
    public void run(String @NonNull ... args) {
        // Run media migration first
        try {
            migrationService.migrateFileSystem();
            migrationService.migrateAllBase64();
        } catch (Exception e) {
            System.err.println("Media migration failed: " + e.getMessage());
        }

        Story defaultStory;
        if (storyRepository.count() == 0) {
            defaultStory = new Story();
            defaultStory.setTitle("Default Story");
            defaultStory.setDescription("A place for your unsorted chapters.");
            defaultStory = storyRepository.save(defaultStory);
            System.out.println("Created Default Story");
        } else {
            // Get the first available story as default
            defaultStory = storyRepository.findAll().getFirst();
        }

        // Migrate orphan chapters
        List<Chapter> orphans = chapterRepository.findAll().stream()
                .filter(c -> c.getStory() == null)
                .toList();
        
        if (!orphans.isEmpty()) {
            for (Chapter orphan : orphans) {
                orphan.setStory(defaultStory);
                chapterRepository.save(orphan);
            }
            System.out.println("Migrated " + orphans.size() + " orphan chapters to Default Story.");
        }
    }
}
