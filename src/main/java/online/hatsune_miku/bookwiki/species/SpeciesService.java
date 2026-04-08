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
    private final SpeciesRepository speciesRepository;

    private final StoryRepository storyRepository;

    private final SpeciesLinkRepository speciesLinkRepository;

    private final ReferenceTrackingService referenceTrackingService;

    private final SmartMergeService smartMergeService;

    private final SpeciesSectionRepository speciesSectionRepository;

    public SpeciesService(SpeciesRepository speciesRepository, StoryRepository storyRepository, SpeciesLinkRepository speciesLinkRepository, ReferenceTrackingService referenceTrackingService, SmartMergeService smartMergeService, SpeciesSectionRepository speciesSectionRepository) {
        this.speciesRepository = speciesRepository;
        this.storyRepository = storyRepository;
        this.speciesLinkRepository = speciesLinkRepository;
        this.referenceTrackingService = referenceTrackingService;
        this.smartMergeService = smartMergeService;
        this.speciesSectionRepository = speciesSectionRepository;
    }

    public List<Species> getSpeciesByStory(Long storyId) {
        return speciesRepository.findByStoryId(storyId).stream()
                .map(this::applyInheritance)
                .toList();
    }

    public Optional<Species> getSpeciesById(Long id) {
        return speciesRepository.findById(id).map(this::applyInheritance);
    }

    public Species getSpecies(Long id) {
        return speciesRepository.findById(id)
                .map(this::applyInheritance)
                .orElseThrow(() -> new RuntimeException("Species not found"));
    }

    private Species applyInheritance(Species species) {
        if (species.getParentId() == null) {
            return species;
        }

        List<SpeciesSection> inheritableSections = getInheritableSectionsFromAncestors(species.getParentId());
        
        boolean modified = false;
        for (SpeciesSection template : inheritableSections) {
            // Check if child already has this section (by inheritedFromSectionId OR title)
            boolean exists = species.getCustomSections().stream()
                    .anyMatch(s -> template.getId().equals(s.getInheritedFromSectionId()) || 
                                  (s.getTitle() != null && s.getTitle().equalsIgnoreCase(template.getTitle())));
            
            if (!exists) {
                SpeciesSection newSection = new SpeciesSection();
                newSection.setTitle(template.getTitle());
                newSection.setContent(template.getContent());
                newSection.setIsInheritable(true); // Default to true for recursive inheritance
                newSection.setInheritedFromSectionId(template.getId());
                newSection.setSpecies(species);
                species.getCustomSections().add(newSection);
                modified = true;
            }
        }

        if (modified) {
            return speciesRepository.save(species);
        }
        
        return species;
    }

    private List<SpeciesSection> getInheritableSectionsFromAncestors(Long parentId) {
        java.util.List<SpeciesSection> allInheritable = new java.util.ArrayList<>();
        Long currentParentId = parentId;
        java.util.Set<Long> visited = new java.util.HashSet<>();

        while (currentParentId != null && visited.add(currentParentId)) {
            Optional<Species> parentOpt = speciesRepository.findById(currentParentId);
            if (parentOpt.isPresent()) {
                Species parent = parentOpt.get();
                if (parent.getCustomSections() != null) {
                    for (SpeciesSection section : parent.getCustomSections()) {
                        if (Boolean.TRUE.equals(section.getIsInheritable())) {
                            // Only add if we don't have a section with this title yet 
                            // (closer ancestors override further ones)
                            boolean alreadyAdded = allInheritable.stream()
                                    .anyMatch(s -> s.getTitle().equals(section.getTitle()));
                            if (!alreadyAdded) {
                                allInheritable.add(section);
                            }
                        }
                    }
                }
                currentParentId = parent.getParentId();
            } else {
                break;
            }
        }
        return allInheritable;
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
            // Store old inheritable sections content for comparison
            java.util.Map<Long, String> oldInheritableContent = new java.util.HashMap<>();
            if (s.getCustomSections() != null) {
                for (SpeciesSection section : s.getCustomSections()) {
                    if (Boolean.TRUE.equals(section.getIsInheritable())) {
                        oldInheritableContent.put(section.getId(), section.getContent());
                    }
                }
            }

            s.setName(updated.getName());
            s.setPictureUrl(updated.getPictureUrl());
            s.setCategory(updated.getCategory());
            s.setParentId(updated.getParentId());
            s.setLifespan(updated.getLifespan());
            s.setAverageSize(updated.getAverageSize());
            s.setDiet(updated.getDiet());
            s.setDescription(updated.getDescription());
            s.setHabitatId(updated.getHabitatId());

            // Handle Custom Sections carefully to preserve IDs for propagation
            java.util.List<SpeciesSection> existingSections = s.getCustomSections();
            java.util.List<SpeciesSection> updatedSections = updated.getCustomSections();
            
            if (updatedSections == null) {
                existingSections.clear();
            } else {
                // Remove sections not in updated list
                existingSections.removeIf(existing -> updatedSections.stream()
                        .noneMatch(u -> u.getId() != null && u.getId().equals(existing.getId())));

                for (SpeciesSection uSection : updatedSections) {
                    if (uSection.getId() == null) {
                        // New section
                        uSection.setSpecies(s);
                        existingSections.add(uSection);
                    } else {
                        // Update existing section
                        existingSections.stream()
                                .filter(e -> e.getId().equals(uSection.getId()))
                                .findFirst()
                                .ifPresent(e -> {
                                    e.setTitle(uSection.getTitle());
                                    e.setContent(uSection.getContent());
                                    e.setIsInheritable(uSection.getIsInheritable());
                                    e.setInheritedFromSectionId(uSection.getInheritedFromSectionId());
                                });
                    }
                }
            }

            Species saved = speciesRepository.save(s);
            trackReferences(saved);

            // Propagate changes if inheritable sections were modified
            if (saved.getCustomSections() != null) {
                for (SpeciesSection section : saved.getCustomSections()) {
                    if (Boolean.TRUE.equals(section.getIsInheritable())) {
                        String oldContent = oldInheritableContent.get(section.getId());
                        if (oldContent == null || !oldContent.equals(section.getContent())) {
                            propagateInheritance(section, oldContent);
                        }
                    }
                }
            }

            return saved;
        }).orElseThrow(() -> new RuntimeException("Species not found"));
    }

    private void propagateInheritance(SpeciesSection template, String oldParentContent) {
        propagateInheritanceRecursive(template, oldParentContent, new java.util.HashSet<>());
    }

    private void propagateInheritanceRecursive(SpeciesSection template, String oldParentContent, java.util.Set<Long> visited) {
        if (!visited.add(template.getId())) {
            return;
        }

        // 1. Update existing copies
        List<SpeciesSection> descendants = speciesSectionRepository.findAllByInheritedFromSectionId(template.getId());
        for (SpeciesSection childSection : descendants) {
            String mergedContent = smartMergeService.merge(template.getContent(), oldParentContent, childSection.getContent());
            if (!mergedContent.equals(childSection.getContent())) {
                String oldChildContent = childSection.getContent();
                childSection.setContent(mergedContent);
                speciesSectionRepository.save(childSection);
                
                // If this child section is ALSO inheritable, propagate further
                if (Boolean.TRUE.equals(childSection.getIsInheritable())) {
                    propagateInheritanceRecursive(childSection, oldChildContent, visited);
                }
            }
        }

        // 2. Proactively add to children of the owner of this template if they don't have it
        if (template.getSpecies() != null && template.getSpecies().getId() != null) {
            List<Species> children = speciesRepository.findByParentId(template.getSpecies().getId());
            for (Species child : children) {
                boolean hasSection = child.getCustomSections().stream()
                        .anyMatch(s -> template.getId().equals(s.getInheritedFromSectionId()));
                
                if (!hasSection) {
                    SpeciesSection newSection = new SpeciesSection();
                    newSection.setTitle(template.getTitle());
                    newSection.setContent(template.getContent());
                    newSection.setIsInheritable(true);
                    newSection.setInheritedFromSectionId(template.getId());
                    newSection.setSpecies(child);
                    child.getCustomSections().add(newSection);
                    speciesRepository.save(child);
                    // No need to recurse here, applyInheritance on child will handle its own descendants if fetched
                }
            }
        }
    }

    @Transactional
    public void deleteSpecies(Long id) {
        speciesRepository.deleteById(id);
        referenceTrackingService.deleteReferences("SPECIES", id);
    }

    @Transactional
    public void depropagateInheritance(Long sectionId, String mode) {
        SpeciesSection template = speciesSectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        
        depropagateRecursive(template, mode);
    }

    private void depropagateRecursive(SpeciesSection current, String mode) {
        List<SpeciesSection> descendants = speciesSectionRepository.findAllByInheritedFromSectionId(current.getId());
        
        for (SpeciesSection childSection : descendants) {
            if ("ALL".equalsIgnoreCase(mode)) {
                // Remove recursively first to ensure we find all grand-children
                depropagateRecursive(childSection, "ALL");
                speciesSectionRepository.delete(childSection);
            } else if ("UNEDITED".equalsIgnoreCase(mode)) {
                // If it matches parent content, it's considered unedited
                if (childSection.getContent().equals(current.getContent())) {
                    depropagateRecursive(childSection, "UNEDITED");
                    speciesSectionRepository.delete(childSection);
                }
                // If edited, we stop recursion for this branch
            }
        }
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
