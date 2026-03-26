package online.hatsune_miku.bookwiki.species;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SpeciesSectionTest {

    @Test
    void testGettersAndSetters() {
        SpeciesSection section = new SpeciesSection();
        section.setId(1L);
        section.setTitle("Stats");
        section.setContent("<p>Test</p>");
        section.setIsInheritable(true);
        section.setInheritedFromSectionId(50L);

        assertEquals(1L, section.getId());
        assertEquals("Stats", section.getTitle());
        assertEquals("<p>Test</p>", section.getContent());
        assertEquals(true, section.getIsInheritable());
        assertEquals(50L, section.getInheritedFromSectionId());
    }

    @Test
    void testDefaultValues() {
        SpeciesSection section = new SpeciesSection();
        assertEquals(false, section.getIsInheritable(), "Should default to false");
        assertNull(section.getInheritedFromSectionId(), "Should default to null");
    }

    @Test
    void testNullable() {
        SpeciesSection section = new SpeciesSection();
        section.setIsInheritable(null);
        assertNull(section.getIsInheritable());
    }
}
