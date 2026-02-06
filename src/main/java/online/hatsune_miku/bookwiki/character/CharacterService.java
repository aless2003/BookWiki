package online.hatsune_miku.bookwiki.character;

import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CharacterService {
    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private StoryRepository storyRepository;

    public List<Character> getCharactersByStory(Long storyId) {
        return characterRepository.findByStoryId(storyId);
    }

    public Character createCharacter(Long storyId, Character character) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        character.setStory(story);
        
        if (character.getCustomSections() != null) {
            character.getCustomSections().forEach(section -> section.setCharacter(character));
        }
        
        return characterRepository.save(character);
    }

    public Character updateCharacter(Long id, Character updated) {
        return characterRepository.findById(id).map(c -> {
            c.setName(updated.getName());
            c.setPictureUrl(updated.getPictureUrl());
            c.setBirthday(updated.getBirthday());
            
            // New fields
            c.setSocialStatus(updated.getSocialStatus());
            c.setRole(updated.getRole());
            c.setAppearance(updated.getAppearance());
            c.setTraits(updated.getTraits());
            
            c.setDescription(updated.getDescription());
            
            // Handle Custom Sections
            c.getCustomSections().clear();
            if (updated.getCustomSections() != null) {
                c.getCustomSections().addAll(updated.getCustomSections());
                c.getCustomSections().forEach(section -> section.setCharacter(c));
            }
            
            return characterRepository.save(c);
        }).orElseThrow(() -> new RuntimeException("Character not found"));
    }

    public void deleteCharacter(Long id) {
        characterRepository.deleteById(id);
    }
    
    public Character getCharacter(Long id) {
        return characterRepository.findById(id).orElseThrow(() -> new RuntimeException("Character not found"));
    }

    public Character addSection(Long characterId, CharacterSection section) {
        Character c = getCharacter(characterId);
        section.setCharacter(c);
        c.getCustomSections().add(section);
        return characterRepository.save(c);
    }
}
