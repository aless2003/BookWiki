package online.hatsune_miku.bookwiki.story;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StoryService {

    @Autowired
    private StoryRepository storyRepository;

    public List<Story> getAllStories() {
        return storyRepository.findAll();
    }

    public Optional<Story> getStoryById(Long id) {
        return storyRepository.findById(id);
    }

    public Story saveStory(Story story) {
        return storyRepository.save(story);
    }

    public Story getDefaultStory() {
        return storyRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No stories found"));
    }

    public void deleteStory(Long id) {
        storyRepository.deleteById(id);
    }
}
