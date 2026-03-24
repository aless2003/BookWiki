package online.hatsune_miku.bookwiki.species;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SpeciesServiceTest {

    @Mock
    private SpeciesRepository speciesRepository;

    @InjectMocks
    private SpeciesService speciesService;

    @Test
    void getTaxonomy_FullTree() {
        // Setup Hierarchy:
        // A (1) -> B (2) [TARGET] -> C (3) -> D (4)
        
        Species speciesA = new Species();
        speciesA.setId(1L);
        speciesA.setName("Species A");

        Species speciesB = new Species();
        speciesB.setId(2L);
        speciesB.setName("Species B");
        speciesB.setParentId(1L);

        Species speciesC = new Species();
        speciesC.setId(3L);
        speciesC.setName("Species C");
        speciesC.setParentId(2L);

        Species speciesD = new Species();
        speciesD.setId(4L);
        speciesD.setName("Species D");
        speciesD.setParentId(3L);

        when(speciesRepository.findById(2L)).thenReturn(Optional.of(speciesB));
        when(speciesRepository.findById(1L)).thenReturn(Optional.of(speciesA));
        when(speciesRepository.findByParentId(2L)).thenReturn(List.of(speciesC));
        when(speciesRepository.findByParentId(3L)).thenReturn(List.of(speciesD));
        when(speciesRepository.findByParentId(4L)).thenReturn(Collections.emptyList());

        SpeciesTaxonomyDTO taxonomy = speciesService.getTaxonomy(2L);

        assertNotNull(taxonomy);
        
        // Parent check
        assertNotNull(taxonomy.getParentNode());
        assertEquals(1L, taxonomy.getParentNode().getId());
        assertEquals("Species A", taxonomy.getParentNode().getName());
        assertTrue(taxonomy.getParentNode().getChildren().isEmpty());

        // Target check
        assertNotNull(taxonomy.getTargetNode());
        assertEquals(2L, taxonomy.getTargetNode().getId());
        assertEquals("Species B", taxonomy.getTargetNode().getName());
        
        // Descendants check
        assertEquals(1, taxonomy.getTargetNode().getChildren().size());
        SpeciesTreeNodeDTO nodeC = taxonomy.getTargetNode().getChildren().get(0);
        assertEquals(3L, nodeC.getId());
        assertEquals("Species C", nodeC.getName());
        
        assertEquals(1, nodeC.getChildren().size());
        SpeciesTreeNodeDTO nodeD = nodeC.getChildren().get(0);
        assertEquals(4L, nodeD.getId());
        assertEquals("Species D", nodeD.getName());
        assertTrue(nodeD.getChildren().isEmpty());
    }

    @Test
    void getTaxonomy_NoParent() {
        Species target = new Species();
        target.setId(2L);
        target.setName("No Parent");
        target.setParentId(null);

        when(speciesRepository.findById(2L)).thenReturn(Optional.of(target));
        when(speciesRepository.findByParentId(2L)).thenReturn(Collections.emptyList());

        SpeciesTaxonomyDTO taxonomy = speciesService.getTaxonomy(2L);

        assertNotNull(taxonomy);
        assertNull(taxonomy.getParentNode());
        assertNotNull(taxonomy.getTargetNode());
        assertEquals(2L, taxonomy.getTargetNode().getId());
        assertTrue(taxonomy.getTargetNode().getChildren().isEmpty());
    }
}
