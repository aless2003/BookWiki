package online.hatsune_miku.bookwiki.location;

import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationService {
    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private StoryRepository storyRepository;

    public List<Location> getLocationsByStory(Long storyId) {
        return locationRepository.findByStoryId(storyId);
    }

    public Location createLocation(Long storyId, Location location) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        location.setStory(story);
        
        if (location.getCustomSections() != null) {
            location.getCustomSections().forEach(section -> section.setLocation(location));
        }
        
        return locationRepository.save(location);
    }

    public Location updateLocation(Long id, Location updated) {
        return locationRepository.findById(id).map(l -> {
            l.setName(updated.getName());
            l.setPictureUrl(updated.getPictureUrl());
            l.setDescription(updated.getDescription());
            l.setWhereItIs(updated.getWhereItIs());
            l.setDetails(updated.getDetails());
            
            // Handle Custom Sections
            l.getCustomSections().clear();
            if (updated.getCustomSections() != null) {
                l.getCustomSections().addAll(updated.getCustomSections());
                l.getCustomSections().forEach(section -> section.setLocation(l));
            }
            
            return locationRepository.save(l);
        }).orElseThrow(() -> new RuntimeException("Location not found"));
    }

    public void deleteLocation(Long id) {
        locationRepository.deleteById(id);
    }
}
