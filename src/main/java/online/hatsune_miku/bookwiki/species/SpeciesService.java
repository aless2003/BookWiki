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
    private SpeciesLinkRepository speciesLinkRepository;

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
    public SpeciesLink createLink(SpeciesLink link) {
        if (!speciesRepository.existsById(link.getSourceSpeciesId()) || 
            !speciesRepository.existsById(link.getTargetSpeciesId())) {
            throw new RuntimeException("One or both species not found");
        }
        return speciesLinkRepository.save(link);
    }

    @Transactional
    public void deleteLink(Long linkId) {
        speciesLinkRepository.deleteById(linkId);
    }

    public List<SpeciesLink> getLinksBySpecies(Long speciesId) {
        return speciesLinkRepository.findAllBySpeciesId(speciesId);
    }

    public SpeciesFlowDTO getSpeciesFlow(List<Long> speciesIds) {
        SpeciesFlowDTO flow = new SpeciesFlowDTO();
        java.util.Set<Long> allLinksIds = new java.util.HashSet<>();
        java.util.List<SpeciesLink> allLinks = new java.util.ArrayList<>();
        
        for (Long id : speciesIds) {
            List<SpeciesLink> speciesLinks = speciesLinkRepository.findAllBySpeciesId(id);
            for (SpeciesLink link : speciesLinks) {
                if (allLinksIds.add(link.getId())) {
                    allLinks.add(link);
                }
            }
        }
        
        // Track added node IDs to avoid duplicates
        java.util.Set<Long> addedNodes = new java.util.HashSet<>();
        
        // Ensure all requested source IDs are in the nodes list even if they have no links
        for (Long id : speciesIds) {
            if (addedNodes.add(id)) {
                speciesRepository.findById(id).ifPresent(s -> {
                    flow.getNodes().add(mapToNodeDTO(s, false));
                });
            }
        }
        
        for (SpeciesLink link : allLinks) {
            // Add edges
            SpeciesLinkDTO edge = new SpeciesLinkDTO();
            edge.setId(link.getId());
            edge.setSourceSpeciesId(link.getSourceSpeciesId());
            edge.setTargetSpeciesId(link.getTargetSpeciesId());
            edge.setLabel(link.getLabel());
            edge.setBidirectional(link.isBidirectional());
            flow.getEdges().add(edge);
            
            // Add source node if not already added
            if (addedNodes.add(link.getSourceSpeciesId())) {
                speciesRepository.findById(link.getSourceSpeciesId()).ifPresent(s -> {
                    flow.getNodes().add(mapToNodeDTO(s, false));
                });
            }
            
            // Add target node if not already added
            if (addedNodes.add(link.getTargetSpeciesId())) {
                speciesRepository.findById(link.getTargetSpeciesId()).ifPresent(s -> {
                    flow.getNodes().add(mapToNodeDTO(s, false));
                });
            }
        }
        
        return flow;
    }

    public SpeciesFlowDTO getSpeciesFlow(Long speciesId) {
        return getSpeciesFlow(java.util.List.of(speciesId));
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

    public SpeciesTaxonomyDTO getTaxonomy(Long speciesId) {
        Species target = getSpecies(speciesId);
        SpeciesTaxonomyDTO taxonomy = new SpeciesTaxonomyDTO();

        // Get immediate parent
        if (target.getParentId() != null) {
            speciesRepository.findById(target.getParentId()).ifPresent(parent -> {
                taxonomy.setParentNode(mapToNodeDTO(parent, false));
            });
        }

        // Get target and recursive descendants
        taxonomy.setTargetNode(mapToNodeDTO(target, true));

        return taxonomy;
    }

    private SpeciesTreeNodeDTO mapToNodeDTO(Species species, boolean recursive) {
        SpeciesTreeNodeDTO node = new SpeciesTreeNodeDTO();
        node.setId(species.getId());
        node.setName(species.getName());
        node.setPictureUrl(species.getPictureUrl());

        if (recursive) {
            List<Species> children = speciesRepository.findByParentId(species.getId());
            for (Species child : children) {
                node.getChildren().add(mapToNodeDTO(child, true));
            }
        }

        return node;
    }
}
