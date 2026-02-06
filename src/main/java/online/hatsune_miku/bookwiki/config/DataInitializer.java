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

    public DataInitializer(StoryRepository storyRepository, ChapterRepository chapterRepository) {
        this.storyRepository = storyRepository;
        this.chapterRepository = chapterRepository;
    }

    @Override
    public void run(String @NonNull ... args) {
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
