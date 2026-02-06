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

    public List<Item> getItemsByStory(Long storyId) {
        return itemRepository.findByStoryId(storyId);
    }

    public Item createItem(Long storyId, Item item) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        item.setStory(story);
        
        if (item.getCustomSections() != null) {
            item.getCustomSections().forEach(section -> section.setItem(item));
        }
        
        return itemRepository.save(item);
    }

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
            
            return itemRepository.save(i);
        }).orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }
}
