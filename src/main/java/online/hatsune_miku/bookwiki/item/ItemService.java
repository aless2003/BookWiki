package online.hatsune_miku.bookwiki.item;

import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {
    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private online.hatsune_miku.bookwiki.media.ReferenceTrackingService referenceTrackingService;

    public List<Item> getItemsByStory(Long storyId) {
        return itemRepository.findByStoryId(storyId);
    }

    @org.springframework.transaction.annotation.Transactional
    public Item createItem(Long storyId, Item item) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        item.setStory(story);
        
        if (item.getCustomSections() != null) {
            item.getCustomSections().forEach(section -> section.setItem(item));
        }
        
        Item saved = itemRepository.save(item);
        trackReferences(saved);
        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
    public Item updateItem(Long id, Item updated) {
        return itemRepository.findById(id).map(i -> {
            i.setName(updated.getName());
            i.setPictureUrl(updated.getPictureUrl());
            i.setDescription(updated.getDescription());
            
            i.getCustomSections().clear();
            if (updated.getCustomSections() != null) {
                i.getCustomSections().addAll(updated.getCustomSections());
                i.getCustomSections().forEach(section -> section.setItem(i));
            }
            
            Item saved = itemRepository.save(i);
            trackReferences(saved);
            return saved;
        }).orElseThrow(() -> new RuntimeException("Item not found"));
    }

    private void trackReferences(Item item) {
        StringBuilder content = new StringBuilder();
        if (item.getPictureUrl() != null) content.append(item.getPictureUrl());
        if (item.getDescription() != null) content.append(item.getDescription());
        if (item.getCustomSections() != null) {
            for (ItemSection section : item.getCustomSections()) {
                if (section.getContent() != null) content.append(section.getContent());
            }
        }
        referenceTrackingService.updateReferences(content.toString(), "ITEM", item.getId());
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
        referenceTrackingService.deleteReferences("ITEM", id);
    }

    public java.util.Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }
}
