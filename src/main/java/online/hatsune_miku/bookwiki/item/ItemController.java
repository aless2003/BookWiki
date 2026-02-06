package online.hatsune_miku.bookwiki.item;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @GetMapping("/stories/{storyId}/items")
    public List<Item> getItemsByStory(@PathVariable Long storyId) {
        return itemService.getItemsByStory(storyId);
    }

    @PostMapping("/stories/{storyId}/items")
    public Item createItem(@PathVariable Long storyId, @RequestBody Item item) {
        return itemService.createItem(storyId, item);
    }

    @PutMapping("/items/{id}")
    public Item updateItem(@PathVariable Long id, @RequestBody Item item) {
        return itemService.updateItem(id, item);
    }

    @DeleteMapping("/items/{id}")
    public void deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
    }
}
