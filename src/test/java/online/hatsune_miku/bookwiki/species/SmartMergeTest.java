package online.hatsune_miku.bookwiki.species;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SmartMergeTest {

    private final SmartMergeService smartMergeService = new SmartMergeService();

    @Test
    void testMergeEmptyChild() {
        String parent = "<table><tr><td>Stat</td><td>Value</td></tr></table>";
        String child = "";
        String result = smartMergeService.merge(parent, null, child);
        assertEquals(parent, result);
    }

    @Test
    void testMergeTableStructure() {
        // Parent adds a new column "Notes"
        String parent = "<table><tr><th>Stat</th><th>Value</th><th>Notes</th></tr><tr><td>STR</td><td>10</td><td><br></td></tr></table>";
        // Child has old 2-column structure
        String child = "<table><tr><th>Stat</th><th>Value</th></tr><tr><td>STR</td><td>18</td></tr></table>";
        
        String result = smartMergeService.merge(parent, null, child);
        String cleaned = result.replaceAll("\\s", "");
        
        // Result should have 3 columns, and preserve child's "18"
        assertTrue(cleaned.contains("<th>Notes</th>"));
        assertTrue(cleaned.contains("<td>18</td>"));
        assertTrue(cleaned.contains("<td>STR</td><td>18</td><td><br></td>"));
    }

    @Test
    void testAppendNewRows() {
        String parent = "<table><tr><td>Row 1</td></tr><tr><td>Row 2</td></tr></table>";
        String child = "<table><tr><td>Row 1 (modified)</td></tr></table>";
        
        String result = smartMergeService.merge(parent, null, child);
        String cleaned = result.replaceAll("\\s", "");
        
        assertTrue(cleaned.contains("<td>Row1(modified)</td>"));
        assertTrue(cleaned.contains("<td>Row2</td>"));
    }

    @Test
    void testMergeUneditedChild() {
        String oldParent = "<p>Old Content</p>";
        String newParent = "<p>New Content</p>";
        String child = "<p>Old Content</p>"; // Child matches old parent exactly
        
        String result = smartMergeService.merge(newParent, oldParent, child);
        
        assertEquals(newParent, result, "Unedited child should be updated directly to new parent content");
    }
}
