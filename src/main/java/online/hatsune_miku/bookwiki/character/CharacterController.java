package online.hatsune_miku.bookwiki.character;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CharacterController {

    @Autowired
    private CharacterService characterService;

    @GetMapping("/stories/{storyId}/characters")
    public List<Character> getCharactersByStory(@PathVariable Long storyId) {
        return characterService.getCharactersByStory(storyId);
    }

    @PostMapping("/stories/{storyId}/characters")
    public Character createCharacter(@PathVariable Long storyId, @RequestBody Character character) {
        return characterService.createCharacter(storyId, character);
    }
    
    @GetMapping("/characters/{id}")
    public Character getCharacter(@PathVariable Long id) {
        return characterService.getCharacter(id);
    }

    @PutMapping("/characters/{id}")
    public Character updateCharacter(@PathVariable Long id, @RequestBody Character character) {
        return characterService.updateCharacter(id, character);
    }

    @DeleteMapping("/characters/{id}")
    public void deleteCharacter(@PathVariable Long id) {
        characterService.deleteCharacter(id);
    }

    @PostMapping("/characters/{id}/sections")
    public Character addSection(@PathVariable Long id, @RequestBody CharacterSection section) {
        return characterService.addSection(id, section);
    }
}
