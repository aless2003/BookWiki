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

    @Mock
    private SpeciesLinkRepository speciesLinkRepository;

    @InjectMocks
    private SpeciesService speciesService;

    @Test
    void createLink_Success() {
        SpeciesLink link = new SpeciesLink(null, 1L, 2L, "Evolves", false);
        SpeciesLink savedLink = new SpeciesLink(100L, 1L, 2L, "Evolves", false);
        
        when(speciesLinkRepository.save(link)).thenReturn(savedLink);
        
        SpeciesLink result = speciesService.createLink(link);
        
        assertEquals(100L, result.getId());
        assertEquals("Evolves", result.getLabel());
        verify(speciesLinkRepository, times(1)).save(link);
    }

    @Test
    void deleteLink_Success() {
        speciesService.deleteLink(100L);
        verify(speciesLinkRepository, times(1)).deleteById(100L);
    }

    @Test
    void getSpeciesFlow_ComplexNetwork() {
        // Setup: A -> B (TARGET) -> C
        //             B <-> D
        
        Species target = new Species();
        target.setId(2L);
        target.setName("Target Species");
        
        Species sourceA = new Species();
        sourceA.setId(1L);
        sourceA.setName("Source A");
        
        Species targetC = new Species();
        targetC.setId(3L);
        targetC.setName("Target C");
        
        Species alternateD = new Species();
        alternateD.setId(4L);
        alternateD.setName("Alternate D");
        
        SpeciesLink linkAtoB = new SpeciesLink(10L, 1L, 2L, "Evolves From", false);
        SpeciesLink linkBtoC = new SpeciesLink(11L, 2L, 3L, "Evolves To", false);
        SpeciesLink linkBwithD = new SpeciesLink(12L, 2L, 4L, "Alternate", true);
        
        List<SpeciesLink> links = List.of(linkAtoB, linkBtoC, linkBwithD);
        
        when(speciesRepository.findById(2L)).thenReturn(Optional.of(target));
        when(speciesLinkRepository.findAllBySpeciesId(2L)).thenReturn(links);
        when(speciesRepository.findById(1L)).thenReturn(Optional.of(sourceA));
        when(speciesRepository.findById(3L)).thenReturn(Optional.of(targetC));
        when(speciesRepository.findById(4L)).thenReturn(Optional.of(alternateD));
        
        SpeciesFlowDTO flow = speciesService.getSpeciesFlow(2L);
        
        assertNotNull(flow);
        assertEquals(4, flow.getNodes().size());
        assertEquals(3, flow.getEdges().size());
        
        // Nodes check
        assertTrue(flow.getNodes().stream().anyMatch(n -> n.getId().equals(2L)));
        assertTrue(flow.getNodes().stream().anyMatch(n -> n.getId().equals(1L)));
        assertTrue(flow.getNodes().stream().anyMatch(n -> n.getId().equals(3L)));
        assertTrue(flow.getNodes().stream().anyMatch(n -> n.getId().equals(4L)));
        
        // Edges check
        assertTrue(flow.getEdges().stream().anyMatch(e -> e.getId().equals(10L) && e.getLabel().equals("Evolves From")));
        assertTrue(flow.getEdges().stream().anyMatch(e -> e.getId().equals(11L) && e.getLabel().equals("Evolves To")));
        assertTrue(flow.getEdges().stream().anyMatch(e -> e.getId().equals(12L) && e.isBidirectional()));
    }

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
