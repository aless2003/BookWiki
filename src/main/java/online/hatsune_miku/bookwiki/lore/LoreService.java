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

    @Autowired
    private online.hatsune_miku.bookwiki.media.ReferenceTrackingService referenceTrackingService;

    public List<Lore> getLoreByStory(Long storyId) {
        return loreRepository.findByStoryId(storyId);
    }

    @org.springframework.transaction.annotation.Transactional
    public Lore createLore(Long storyId, Lore lore) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        lore.setStory(story);
        
        if (lore.getCustomSections() != null) {
            lore.getCustomSections().forEach(section -> section.setLore(lore));
        }
        
        Lore saved = loreRepository.save(lore);
        trackReferences(saved);
        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
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
            
            Lore saved = loreRepository.save(l);
            trackReferences(saved);
            return saved;
        }).orElseThrow(() -> new RuntimeException("Lore entry not found"));
    }

    private void trackReferences(Lore lore) {
        StringBuilder content = new StringBuilder();
        if (lore.getPictureUrl() != null) content.append(lore.getPictureUrl());
        if (lore.getDescription() != null) content.append(lore.getDescription());
        if (lore.getCustomSections() != null) {
            for (LoreSection section : lore.getCustomSections()) {
                if (section.getContent() != null) content.append(section.getContent());
            }
        }
        referenceTrackingService.updateReferences(content.toString(), "LORE", lore.getId());
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteLore(Long id) {
        loreRepository.deleteById(id);
        referenceTrackingService.deleteReferences("LORE", id);
    }

    public java.util.Optional<Lore> getLoreById(Long id) {
        return loreRepository.findById(id);
    }
}
