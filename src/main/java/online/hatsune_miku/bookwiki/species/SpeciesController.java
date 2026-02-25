package online.hatsune_miku.bookwiki.species;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SpeciesController {

    @Autowired
    private SpeciesService speciesService;

    @GetMapping("/stories/{storyId}/species")
    public List<Species> getSpeciesByStory(@PathVariable Long storyId) {
        return speciesService.getSpeciesByStory(storyId);
    }

    @PostMapping("/stories/{storyId}/species")
    public Species createSpecies(@PathVariable Long storyId, @RequestBody Species species) {
        return speciesService.createSpecies(storyId, species);
    }

    @GetMapping("/species/{id}")
    public Species getSpecies(@PathVariable Long id) {
        return speciesService.getSpecies(id);
    }

    @PutMapping("/species/{id}")
    public Species updateSpecies(@PathVariable Long id, @RequestBody Species species) {
        return speciesService.updateSpecies(id, species);
    }

    @DeleteMapping("/species/{id}")
    public void deleteSpecies(@PathVariable Long id) {
        speciesService.deleteSpecies(id);
    }

    @PostMapping("/species/{id}/sections")
    public Species addSection(@PathVariable Long id, @RequestBody SpeciesSection section) {
        return speciesService.addSection(id, section);
    }
}
