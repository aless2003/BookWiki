package online.hatsune_miku.bookwiki.lore;

import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoreService {
    @Autowired
    private LoreRepository loreRepository;

    @Autowired
    private StoryRepository storyRepository;

    public List<Lore> getLoreByStory(Long storyId) {
        return loreRepository.findByStoryId(storyId);
    }

    public Lore createLore(Long storyId, Lore lore) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        lore.setStory(story);
        
        if (lore.getCustomSections() != null) {
            lore.getCustomSections().forEach(section -> section.setLore(lore));
        }
        
        return loreRepository.save(lore);
    }

    public Lore updateLore(Long id, Lore updated) {
        return loreRepository.findById(id).map(l -> {
            l.setName(updated.getName());
            l.setPictureUrl(updated.getPictureUrl());
            l.setCategories(updated.getCategories());
            l.setDescription(updated.getDescription());
            
            l.getCustomSections().clear();
            if (updated.getCustomSections() != null) {
                l.getCustomSections().addAll(updated.getCustomSections());
                l.getCustomSections().forEach(section -> section.setLore(l));
            }
            
            return loreRepository.save(l);
        }).orElseThrow(() -> new RuntimeException("Lore entry not found"));
    }

    public void deleteLore(Long id) {
        loreRepository.deleteById(id);
    }
}
