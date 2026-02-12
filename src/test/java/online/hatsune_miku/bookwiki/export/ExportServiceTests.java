package online.hatsune_miku.bookwiki.export;

import online.hatsune_miku.bookwiki.chapter.Chapter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class ExportServiceTests {

    @Mock
    private ShortcodeResolver shortcodeResolver;

    @InjectMocks
    private DocxExportService docxExportService;

    @InjectMocks
    private PdfExportService pdfExportService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(shortcodeResolver.resolve(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testDocxExport() throws IOException {
        Chapter c1 = new Chapter();
        c1.setTitle("Chapter 1");
        c1.setContent("<p>Hello <b>World</b></p>");
        
        byte[] result = docxExportService.export("Test Story", List.of(c1));
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void testPdfExport() throws IOException {
        Chapter c1 = new Chapter();
        c1.setTitle("Chapter 1");
        c1.setContent("<p>Hello <i>World</i></p>");
        
        byte[] result = pdfExportService.export("Test Story", List.of(c1));
        assertNotNull(result);
        assertTrue(result.length > 0);
    }
}
