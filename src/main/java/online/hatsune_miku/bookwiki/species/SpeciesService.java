package online.hatsune_miku.bookwiki.species;

import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import online.hatsune_miku.bookwiki.media.ReferenceTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SpeciesService {
    @Autowired
    private SpeciesRepository speciesRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ReferenceTrackingService referenceTrackingService;

    public List<Species> getSpeciesByStory(Long storyId) {
        return speciesRepository.findByStoryId(storyId);
    }

    public Optional<Species> getSpeciesById(Long id) {
        return speciesRepository.findById(id);
    }

    public Species getSpecies(Long id) {
        return speciesRepository.findById(id).orElseThrow(() -> new RuntimeException("Species not found"));
    }

    @Transactional
    public Species createSpecies(Long storyId, Species species) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        species.setStory(story);

        if (species.getCustomSections() != null) {
            species.getCustomSections().forEach(section -> section.setSpecies(species));
        }

        Species saved = speciesRepository.save(species);
        trackReferences(saved);
        return saved;
    }

    @Transactional
    public Species updateSpecies(Long id, Species updated) {
        return speciesRepository.findById(id).map(s -> {
            s.setName(updated.getName());
            s.setPictureUrl(updated.getPictureUrl());
            s.setCategory(updated.getCategory());
            s.setParentId(updated.getParentId());
            s.setLifespan(updated.getLifespan());
            s.setAverageSize(updated.getAverageSize());
            s.setDiet(updated.getDiet());
            s.setDescription(updated.getDescription());
            s.setHabitatId(updated.getHabitatId());

            // Handle Custom Sections
            s.getCustomSections().clear();
            if (updated.getCustomSections() != null) {
                s.getCustomSections().addAll(updated.getCustomSections());
                s.getCustomSections().forEach(section -> section.setSpecies(s));
            }

            Species saved = speciesRepository.save(s);
            trackReferences(saved);
            return saved;
        }).orElseThrow(() -> new RuntimeException("Species not found"));
    }

    @Transactional
    public void deleteSpecies(Long id) {
        speciesRepository.deleteById(id);
        referenceTrackingService.deleteReferences("SPECIES", id);
    }

    private void trackReferences(Species species) {
        StringBuilder content = new StringBuilder();
        if (species.getPictureUrl() != null) content.append(species.getPictureUrl());
        if (species.getDescription() != null) content.append(species.getDescription());
        if (species.getCustomSections() != null) {
            for (SpeciesSection section : species.getCustomSections()) {
                if (section.getContent() != null) content.append(section.getContent());
            }
        }
        referenceTrackingService.updateReferences(content.toString(), "SPECIES", species.getId());
    }

    public Species addSection(Long speciesId, SpeciesSection section) {
        Species s = getSpecies(speciesId);
        section.setSpecies(s);
        s.getCustomSections().add(section);
        return speciesRepository.save(s);
    }
}
