package online.hatsune_miku.bookwiki.location;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")

public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/stories/{storyId}/locations")
    public List<Location> getLocationsByStory(@PathVariable Long storyId) {
        return locationService.getLocationsByStory(storyId);
    }

    @PostMapping("/stories/{storyId}/locations")
    public Location createLocation(@PathVariable Long storyId, @RequestBody Location location) {
        return locationService.createLocation(storyId, location);
    }

    @PutMapping("/locations/{id}")
    public Location updateLocation(@PathVariable Long id, @RequestBody Location location) {
        return locationService.updateLocation(id, location);
    }

    @DeleteMapping("/locations/{id}")
    public void deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
    }

    @GetMapping("/locations/{id}/taxonomy")
    public LocationTaxonomyDTO getTaxonomy(@PathVariable Long id) {
        return locationService.getTaxonomy(id);
    }

    @GetMapping("/locations/flow")
    public LocationFlowDTO getLocationFlow(@RequestParam List<Long> ids) {
        return locationService.getLocationFlow(ids);
    }

    @PostMapping("/locations/links")
    public LocationLink createLink(@RequestBody LocationLink link) {
        return locationService.createLink(link);
    }

    @DeleteMapping("/locations/links/{id}")
    public void deleteLink(@PathVariable Long id) {
        locationService.deleteLink(id);
    }
}
