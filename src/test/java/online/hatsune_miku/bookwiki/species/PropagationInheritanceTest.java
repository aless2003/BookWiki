package online.hatsune_miku.bookwiki.species;

import online.hatsune_miku.bookwiki.media.ReferenceTrackingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropagationInheritanceTest {

    @Mock
    private SpeciesRepository speciesRepository;

    @Mock
    private SpeciesSectionRepository speciesSectionRepository;

    @Mock
    private ReferenceTrackingService referenceTrackingService;

    @Spy
    private SmartMergeService smartMergeService = new SmartMergeService();

    @InjectMocks
    private SpeciesService speciesService;

    @Test
    void testPropagationOnUpdate() {
        // Setup Parent
        Species parent = new Species();
        parent.setId(1L);
        SpeciesSection pSection = new SpeciesSection();
        pSection.setId(10L);
        pSection.setTitle("Stats");
        pSection.setContent("Initial Parent Content");
        pSection.setIsInheritable(true);
        pSection.setSpecies(parent);
        parent.setCustomSections(new ArrayList<>(List.of(pSection)));

        // Setup Child Section
        SpeciesSection cSection = new SpeciesSection();
        cSection.setId(100L);
        cSection.setTitle("Stats");
        cSection.setContent("Child Content");
        cSection.setInheritedFromSectionId(10L);

        // Updated Parent
        Species updatedParent = new Species();
        updatedParent.setId(1L);
        SpeciesSection pSectionUpdated = new SpeciesSection();
        pSectionUpdated.setId(10L);
        pSectionUpdated.setTitle("Stats");
        pSectionUpdated.setContent("Updated Parent Content");
        pSectionUpdated.setIsInheritable(true);
        updatedParent.setCustomSections(List.of(pSectionUpdated));

        when(speciesRepository.findById(1L)).thenReturn(Optional.of(parent));
        when(speciesRepository.save(any(Species.class))).thenAnswer(i -> i.getArguments()[0]);
        when(speciesSectionRepository.findAllByInheritedFromSectionId(10L)).thenReturn(List.of(cSection));

        speciesService.updateSpecies(1L, updatedParent);

        // Verify propagation
        verify(speciesSectionRepository).save(argThat(s -> 
            s.getId().equals(100L) && s.getContent().contains("Updated Parent Content")
        ));
    }
}
