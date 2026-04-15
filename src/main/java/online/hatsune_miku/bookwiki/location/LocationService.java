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
    private LocationLinkRepository locationLinkRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private online.hatsune_miku.bookwiki.media.ReferenceTrackingService referenceTrackingService;

    public List<Location> getLocationsByStory(Long storyId) {
        return locationRepository.findByStoryId(storyId);
    }

    @org.springframework.transaction.annotation.Transactional
    public Location createLocation(Long storyId, Location location) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found"));
        location.setStory(story);
        
        if (location.getCustomSections() != null) {
            location.getCustomSections().forEach(section -> section.setLocation(location));
        }
        
        Location saved = locationRepository.save(location);
        trackReferences(saved);
        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
    public Location updateLocation(Long id, Location updated) {
        return locationRepository.findById(id).map(l -> {
            l.setName(updated.getName());
            l.setPictureUrl(updated.getPictureUrl());
            l.setParentId(updated.getParentId());
            l.setParentAreaPercentage(updated.getParentAreaPercentage());
            l.setForceOverpartition(updated.getForceOverpartition());
            l.setDescription(updated.getDescription());
            l.setWhereItIs(updated.getWhereItIs());
            l.setDetails(updated.getDetails());
            
            // Handle Custom Sections
            l.getCustomSections().clear();
            if (updated.getCustomSections() != null) {
                l.getCustomSections().addAll(updated.getCustomSections());
                l.getCustomSections().forEach(section -> section.setLocation(l));
            }
            
            Location saved = locationRepository.save(l);
            trackReferences(saved);
            return saved;
        }).orElseThrow(() -> new RuntimeException("Location not found"));
    }

    public LocationTaxonomyDTO getTaxonomy(Long id) {
        Location target = locationRepository.findById(id).orElseThrow(() -> new RuntimeException("Location not found"));
        
        LocationTreeNodeDTO parentNode = null;
        if (target.getParentId() != null) {
            Location parent = locationRepository.findById(target.getParentId()).orElse(null);
            if (parent != null) {
                parentNode = mapToTreeNode(parent);
            }
        }

        LocationTreeNodeDTO targetNode = mapToTreeNode(target);
        targetNode.setChildren(getChildrenRecursively(id));

        return new LocationTaxonomyDTO(parentNode, targetNode);
    }

    private List<LocationTreeNodeDTO> getChildrenRecursively(Long parentId) {
        List<Location> children = locationRepository.findByParentId(parentId);
        List<LocationTreeNodeDTO> nodes = new java.util.ArrayList<>();
        for (Location child : children) {
            LocationTreeNodeDTO node = mapToTreeNode(child);
            node.setChildren(getChildrenRecursively(child.getId()));
            nodes.add(node);
        }
        return nodes;
    }

    private LocationTreeNodeDTO mapToTreeNode(Location l) {
        return new LocationTreeNodeDTO(l.getId(), l.getName(), l.getPictureUrl(), l.getParentAreaPercentage(), new java.util.ArrayList<>());
    }

    public LocationFlowDTO getLocationFlow(List<Long> locationIds) {
        List<LocationLink> links = locationLinkRepository.findAllByLocationIds(locationIds);
        java.util.Set<Long> allIds = new java.util.HashSet<>(locationIds);
        for (LocationLink link : links) {
            allIds.add(link.getSourceLocationId());
            allIds.add(link.getTargetLocationId());
        }

        List<Location> locations = locationRepository.findAllById(allIds);
        List<LocationTreeNodeDTO> nodes = locations.stream().map(this::mapToTreeNode).toList();

        return new LocationFlowDTO(nodes, links);
    }

    @org.springframework.transaction.annotation.Transactional
    public LocationLink createLink(LocationLink link) {
        if (!locationRepository.existsById(link.getSourceLocationId()) || !locationRepository.existsById(link.getTargetLocationId())) {
            throw new RuntimeException("One or both locations do not exist");
        }
        return locationLinkRepository.save(link);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteLink(Long id) {
        locationLinkRepository.deleteById(id);
    }

    private void trackReferences(Location location) {
        StringBuilder content = new StringBuilder();
        if (location.getPictureUrl() != null) content.append(location.getPictureUrl());
        if (location.getDescription() != null) content.append(location.getDescription());
        if (location.getWhereItIs() != null) content.append(location.getWhereItIs());
        if (location.getDetails() != null) content.append(location.getDetails());
        if (location.getCustomSections() != null) {
            for (LocationSection section : location.getCustomSections()) {
                if (section.getContent() != null) content.append(section.getContent());
            }
        }
        referenceTrackingService.updateReferences(content.toString(), "LOCATION", location.getId());
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteLocation(Long id) {
        locationRepository.deleteById(id);
        referenceTrackingService.deleteReferences("LOCATION", id);
    }

    public java.util.Optional<Location> getLocationById(Long id) {
        return locationRepository.findById(id);
    }
}
