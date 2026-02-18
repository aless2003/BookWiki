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

    @Autowired
    private online.hatsune_miku.bookwiki.media.ReferenceTrackingService referenceTrackingService;

    public List<Character> getCharactersByStory(Long storyId) {
        return characterRepository.findByStoryId(storyId);
    }

    @org.springframework.transaction.annotation.Transactional
    public Character createCharacter(Long storyId, Character character) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        character.setStory(story);
        
        if (character.getCustomSections() != null) {
            character.getCustomSections().forEach(section -> section.setCharacter(character));
        }
        
        Character saved = characterRepository.save(character);
        trackReferences(saved);
        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
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
            
            Character saved = characterRepository.save(c);
            trackReferences(saved);
            return saved;
        }).orElseThrow(() -> new RuntimeException("Character not found"));
    }

    private void trackReferences(Character character) {
        StringBuilder content = new StringBuilder();
        if (character.getPictureUrl() != null) content.append(character.getPictureUrl());
        if (character.getAppearance() != null) content.append(character.getAppearance());
        if (character.getDescription() != null) content.append(character.getDescription());
        if (character.getCustomSections() != null) {
            for (CharacterSection section : character.getCustomSections()) {
                if (section.getContent() != null) content.append(section.getContent());
            }
        }
        referenceTrackingService.updateReferences(content.toString(), "CHARACTER", character.getId());
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteCharacter(Long id) {
        characterRepository.deleteById(id);
        referenceTrackingService.deleteReferences("CHARACTER", id);
    }
    
        public java.util.Optional<Character> getCharacterById(Long id) {
            return characterRepository.findById(id);
        }
    
        public Character getCharacter(Long id) {        return characterRepository.findById(id).orElseThrow(() -> new RuntimeException("Character not found"));
    }

    public Character addSection(Long characterId, CharacterSection section) {
        Character c = getCharacter(characterId);
        section.setCharacter(c);
        c.getCustomSections().add(section);
        return characterRepository.save(c);
    }
}
