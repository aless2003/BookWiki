package online.hatsune_miku.bookwiki.export;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import online.hatsune_miku.bookwiki.chapter.Chapter;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class PdfExportService implements ExportService {

    @Autowired
    private ShortcodeResolver shortcodeResolver;

    @Override
    public byte[] export(String title, List<Chapter> chapters) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
            Paragraph titlePara = new Paragraph(title, titleFont);
            titlePara.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(titlePara);
            document.add(new Paragraph("\n"));

            for (Chapter chapter : chapters) {
                // Chapter Title
                Font chapterFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
                Paragraph chapterPara = new Paragraph(chapter.getTitle(), chapterFont);
                chapterPara.setAlignment(Paragraph.ALIGN_CENTER);
                document.add(chapterPara);
                document.add(new Paragraph("\n"));

                String resolvedContent = shortcodeResolver.resolve(chapter.getContent());
                
                // Split by pagebreaks
                String[] segments = resolvedContent.split("#\\{pagebreak\\}");
                for (int i = 0; i < segments.length; i++) {
                    addHtmlToPdf(document, segments[i]);
                    if (i < segments.length - 1) {
                        document.newPage();
                    }
                }
                
                document.newPage();
            }

            document.close();
            return out.toByteArray();
        }
    }

    private void addHtmlToPdf(Document document, String html) {
        org.jsoup.nodes.Document doc = Jsoup.parseBodyFragment(html);
        for (Element element : doc.body().children()) {
            Paragraph paragraph = new Paragraph();
            paragraph.setLeading(24.0f); // Double space
            processElement(paragraph, element, false, false, false);
            document.add(paragraph);
        }
    }

    private void processElement(Paragraph paragraph, Element element, boolean bold, boolean italic, boolean underline) {
        for (Node node : element.childNodes()) {
            if (node instanceof TextNode textNode) {
                String text = textNode.text();
                if (!text.isEmpty()) {
                    int style = Font.NORMAL;
                    if (bold && italic) style = Font.BOLDITALIC;
                    else if (bold) style = Font.BOLD;
                    else if (italic) style = Font.ITALIC;
                    
                    if (underline) style |= Font.UNDERLINE;

                    Font font = FontFactory.getFont(FontFactory.TIMES_ROMAN, 12, style);
                    paragraph.add(new com.lowagie.text.Chunk(text, font));
                }
            } else if (node instanceof Element child) {
                boolean nextBold = bold || child.tagName().equals("b") || child.tagName().equals("strong");
                boolean nextItalic = italic || child.tagName().equals("i") || child.tagName().equals("em");
                boolean nextUnderline = underline || child.tagName().equals("u");
                
                if (child.tagName().equals("br")) {
                    paragraph.add(com.lowagie.text.Chunk.NEWLINE);
                } else {
                    processElement(paragraph, child, nextBold, nextItalic, nextUnderline);
                }
            }
        }
    }

    @Override
    public String getFormat() {
        return "pdf";
    }
}
