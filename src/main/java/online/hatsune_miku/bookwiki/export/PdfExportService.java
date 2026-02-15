package online.hatsune_miku.bookwiki.export;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Image;
import com.lowagie.text.Chunk;
import com.lowagie.text.Element;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import online.hatsune_miku.bookwiki.chapter.Chapter;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;

@Service
public class PdfExportService implements ExportService {

    @Autowired
    private ShortcodeResolver shortcodeResolver;

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();

    @Override
    public byte[] export(String title, List<Chapter> chapters) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.setMargins(72, 72, 72, 72); // 1 inch margins
            document.open();

            // Story Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
            Paragraph titlePara = new Paragraph(title, titleFont);
            titlePara.setAlignment(Element.ALIGN_CENTER);
            titlePara.setSpacingAfter(24f);
            document.add(titlePara);

            boolean firstChapter = true;
            for (Chapter chapter : chapters) {
                if (!firstChapter) {
                    document.newPage();
                }
                
                Font chapterFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
                Paragraph chapterPara = new Paragraph(chapter.getTitle(), chapterFont);
                chapterPara.setAlignment(Element.ALIGN_CENTER);
                chapterPara.setSpacingAfter(18f);
                document.add(chapterPara);

                String resolvedContent = shortcodeResolver.resolve(chapter.getContent());
                
                // Split by manual pagebreaks
                String[] segments = resolvedContent.split("#\\{pagebreak\\}");
                for (int i = 0; i < segments.length; i++) {
                    addHtmlToPdf(document, segments[i]);
                    if (i < segments.length - 1) {
                        document.newPage();
                    }
                }
                firstChapter = false;
            }

            document.close();
            return out.toByteArray();
        }
    }

    private void addHtmlToPdf(Document document, String html) {
        org.jsoup.nodes.Document doc = Jsoup.parseBodyFragment(html);
        Paragraph currentPara = createStandardParagraph();
        
        for (Node node : doc.body().childNodes()) {
            processNode(document, currentPara, node, false, false, false);
        }
        
        if (!currentPara.isEmpty()) {
            document.add(currentPara);
        }
    }

    private void processNode(Document document, Paragraph paragraph, Node node, boolean bold, boolean italic, boolean underline) {
        if (node instanceof TextNode textNode) {
            String text = textNode.text();
            if (!text.isEmpty()) {
                int style = Font.NORMAL;
                if (bold && italic) style = Font.BOLDITALIC;
                else if (bold) style = Font.BOLD;
                else if (italic) style = Font.ITALIC;
                if (underline) style |= Font.UNDERLINE;
                
                Font font = FontFactory.getFont(FontFactory.TIMES_ROMAN, 12, style);
                paragraph.add(new Chunk(text, font));
            }
        } else if (node instanceof org.jsoup.nodes.Element element) {
            String tag = element.tagName();
            
            if (tag.equals("img")) {
                if (!paragraph.isEmpty()) {
                    document.add(paragraph);
                    paragraph.clear();
                }
                handleImage(document, element);
            } else if (tag.equals("br")) {
                paragraph.add(Chunk.NEWLINE);
            } else {
                boolean isBlock = isBlockTag(tag);
                if (isBlock && !paragraph.isEmpty()) {
                    document.add(paragraph);
                    paragraph.clear();
                }
                
                boolean nextBold = bold || tag.equals("b") || tag.equals("strong");
                boolean nextItalic = italic || tag.equals("i") || tag.equals("em");
                boolean nextUnderline = underline || tag.equals("u");
                
                for (Node child : element.childNodes()) {
                    processNode(document, paragraph, child, nextBold, nextItalic, nextUnderline);
                }
                
                if (isBlock && !paragraph.isEmpty()) {
                    document.add(paragraph);
                    paragraph.clear();
                }
            }
        }
    }

    private boolean isBlockTag(String tag) {
        return tag.equals("p") || tag.equals("div") || tag.startsWith("h") || tag.equals("section");
    }

    private Paragraph createStandardParagraph() {
        Paragraph paragraph = new Paragraph();
        paragraph.setLeading(24.0f);
        paragraph.setSpacingAfter(12f);
        return paragraph;
    }

    private void handleImage(Document document, org.jsoup.nodes.Element imgElement) {
        String src = imgElement.attr("src");
        if (src == null || src.isEmpty()) return;

        try {
            Image img;
            if (src.startsWith("data:image/")) {
                String base64Data = src.substring(src.indexOf(",") + 1);
                byte[] decodedData = Base64.getDecoder().decode(base64Data);
                img = Image.getInstance(decodedData);
            } else {
                String filename = src.substring(src.lastIndexOf('/') + 1);
                if (filename.contains("?")) {
                    filename = filename.substring(0, filename.indexOf('?'));
                }
                Path imagePath = uploadDir.resolve(filename);
                if (!Files.exists(imagePath)) return;
                img = Image.getInstance(imagePath.toString());
            }

            if (img != null) {
                // Determine max available width and height
                float pageWidth = document.getPageSize().getWidth() - document.leftMargin() - document.rightMargin();
                float pageHeight = document.getPageSize().getHeight() - document.topMargin() - document.bottomMargin() - 40;
                
                // Get attributes from HTML tag if available
                String attrWidth = imgElement.attr("width");
                String attrHeight = imgElement.attr("height");
                String styleAttr = imgElement.attr("style");

                if (!styleAttr.isEmpty()) {
                    java.util.Map<String, String> styles = HtmlUtils.parseStyle(styleAttr);
                    if (attrWidth.isEmpty()) attrWidth = styles.getOrDefault("width", "");
                    if (attrHeight.isEmpty()) attrHeight = styles.getOrDefault("height", "");
                }

                Double parsedWidth = HtmlUtils.parseDimension(attrWidth);
                Double parsedHeight = HtmlUtils.parseDimension(attrHeight);
                
                if (parsedWidth != null && parsedHeight != null) {
                    img.scaleAbsolute(parsedWidth.floatValue(), parsedHeight.floatValue());
                } else if (parsedWidth != null) {
                    float ratio = parsedWidth.floatValue() / img.getWidth();
                    img.scaleAbsolute(parsedWidth.floatValue(), img.getHeight() * ratio);
                } else {
                    img.scaleToFit(pageWidth, pageHeight);
                }

                // Final safety check: ensure scaled image doesn't exceed page bounds
                if (img.getScaledWidth() > pageWidth || img.getScaledHeight() > pageHeight) {
                    img.scaleToFit(pageWidth, pageHeight);
                }
                
                PdfPTable table = new PdfPTable(1);
                table.setWidthPercentage(100);
                
                PdfPCell cell = new PdfPCell(img, false); // false = do not force scale to cell width
                cell.setBorder(PdfPCell.NO_BORDER);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(0);
                
                table.addCell(cell);
                table.setSpacingBefore(12f);
                table.setSpacingAfter(12f);
                
                document.add(table);
            }
        } catch (Exception e) {
            System.err.println("Failed to embed image in PDF: " + e.getMessage());
        }
    }

    @Override
    public String getFormat() {
        return "pdf";
    }
}
