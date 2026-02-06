package online.hatsune_miku.bookwiki.lore;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class LoreController {

    @Autowired
    private LoreService loreService;

    @GetMapping("/stories/{storyId}/lore")
    public List<Lore> getLoreByStory(@PathVariable Long storyId) {
        return loreService.getLoreByStory(storyId);
    }

    @PostMapping("/stories/{storyId}/lore")
    public Lore createLore(@PathVariable Long storyId, @RequestBody Lore lore) {
        return loreService.createLore(storyId, lore);
    }

    @PutMapping("/lore/{id}")
    public Lore updateLore(@PathVariable Long id, @RequestBody Lore lore) {
        return loreService.updateLore(id, lore);
    }

    @DeleteMapping("/lore/{id}")
    public void deleteLore(@PathVariable Long id) {
        loreService.deleteLore(id);
    }
}
