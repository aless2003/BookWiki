package online.hatsune_miku.bookwiki.species;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SpeciesInheritanceTest {

    @Mock
    private SpeciesRepository speciesRepository;

    @InjectMocks
    private SpeciesService speciesService;

    @Test
    void testBasicInheritance() {
        // Setup Parent
        Species parent = new Species();
        parent.setId(1L);
        SpeciesSection inheritableSection = new SpeciesSection();
        inheritableSection.setId(10L);
        inheritableSection.setTitle("Stats");
        inheritableSection.setContent("<p>Parent Stats</p>");
        inheritableSection.setIsInheritable(true);
        parent.setCustomSections(new ArrayList<>(List.of(inheritableSection)));

        // Setup Child
        Species child = new Species();
        child.setId(2L);
        child.setParentId(1L);
        child.setCustomSections(new ArrayList<>());

        when(speciesRepository.findById(2L)).thenReturn(Optional.of(child));
        when(speciesRepository.findById(1L)).thenReturn(Optional.of(parent));
        when(speciesRepository.save(any(Species.class))).thenAnswer(i -> i.getArguments()[0]);

        Species result = speciesService.getSpecies(2L);

        assertEquals(1, result.getCustomSections().size());
        SpeciesSection inherited = result.getCustomSections().get(0);
        assertEquals("Stats", inherited.getTitle());
        assertEquals("<p>Parent Stats</p>", inherited.getContent());
        assertEquals(10L, inherited.getInheritedFromSectionId());
        assertFalse(inherited.getIsInheritable()); // Children don't re-inherit by default
    }

    @Test
    void testInheritanceOverride() {
        // Grandparent has "Stats"
        Species grandparent = new Species();
        grandparent.setId(1L);
        SpeciesSection gpSection = new SpeciesSection();
        gpSection.setId(10L);
        gpSection.setTitle("Stats");
        gpSection.setContent("GP Stats");
        gpSection.setIsInheritable(true);
        grandparent.setCustomSections(new ArrayList<>(List.of(gpSection)));

        // Parent also has "Stats" (Overrides GP)
        Species parent = new Species();
        parent.setId(2L);
        parent.setParentId(1L);
        SpeciesSection pSection = new SpeciesSection();
        pSection.setId(20L);
        pSection.setTitle("Stats");
        pSection.setContent("P Stats");
        pSection.setIsInheritable(true);
        parent.setCustomSections(new ArrayList<>(List.of(pSection)));

        // Child
        Species child = new Species();
        child.setId(3L);
        child.setParentId(2L);
        child.setCustomSections(new ArrayList<>());

        when(speciesRepository.findById(3L)).thenReturn(Optional.of(child));
        when(speciesRepository.findById(2L)).thenReturn(Optional.of(parent));
        when(speciesRepository.findById(1L)).thenReturn(Optional.of(grandparent));
        when(speciesRepository.save(any(Species.class))).thenAnswer(i -> i.getArguments()[0]);

        Species result = speciesService.getSpecies(3L);

        assertEquals(1, result.getCustomSections().size());
        assertEquals("P Stats", result.getCustomSections().get(0).getContent());
        assertEquals(20L, result.getCustomSections().get(0).getInheritedFromSectionId());
    }

    @Test
    void testNoDuplicateInheritance() {
        Species parent = new Species();
        parent.setId(1L);
        SpeciesSection section = new SpeciesSection();
        section.setId(10L);
        section.setTitle("Stats");
        section.setIsInheritable(true);
        parent.setCustomSections(List.of(section));

        Species child = new Species();
        child.setId(2L);
        child.setParentId(1L);
        SpeciesSection existingInherited = new SpeciesSection();
        existingInherited.setId(100L);
        existingInherited.setTitle("Stats");
        existingInherited.setInheritedFromSectionId(10L); // Already inherited
        child.setCustomSections(new ArrayList<>(List.of(existingInherited)));

        when(speciesRepository.findById(2L)).thenReturn(Optional.of(child));
        when(speciesRepository.findById(1L)).thenReturn(Optional.of(parent));

        Species result = speciesService.getSpecies(2L);

        assertEquals(1, result.getCustomSections().size(), "Should not add duplicate section");
        verify(speciesRepository, never()).save(any());
    }
}
