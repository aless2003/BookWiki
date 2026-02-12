package online.hatsune_miku.bookwiki.export;

import online.hatsune_miku.bookwiki.chapter.Chapter;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;

@Service
public class DocxExportService implements ExportService {

    @Autowired
    private ShortcodeResolver shortcodeResolver;

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();

    @Override
    public byte[] export(String title, List<Chapter> chapters) throws IOException {
        try (XWPFDocument document = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Story Title
            XWPFParagraph titlePara = document.createParagraph();
            titlePara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = titlePara.createRun();
            titleRun.setText(title);
            titleRun.setBold(true);
            titleRun.setFontSize(24);
            titleRun.setFontFamily("Times New Roman");

            boolean firstChapter = true;
            for (Chapter chapter : chapters) {
                // Chapter Title
                XWPFParagraph chapterPara = document.createParagraph();
                chapterPara.setAlignment(ParagraphAlignment.CENTER);
                
                if (!firstChapter) {
                    chapterPara.setPageBreak(true);
                } else {
                    chapterPara.setSpacingBefore(400); // Visual gap from story title
                }
                
                XWPFRun chapterRun = chapterPara.createRun();
                chapterRun.setText(chapter.getTitle());
                chapterRun.setBold(true);
                chapterRun.setFontSize(18);
                chapterRun.setFontFamily("Times New Roman");

                String resolvedContent = shortcodeResolver.resolve(chapter.getContent());
                
                // Split by manual pagebreaks
                String[] segments = resolvedContent.split("#\\{pagebreak\\}");
                for (int i = 0; i < segments.length; i++) {
                    addHtmlToDocx(document, segments[i]);
                    if (i < segments.length - 1) {
                        XWPFParagraph breakPara = document.createParagraph();
                        breakPara.setPageBreak(true);
                    }
                }
                firstChapter = false;
            }

            document.write(out);
            return out.toByteArray();
        }
    }

    private void addHtmlToDocx(XWPFDocument document, String html) {
        org.jsoup.nodes.Document doc = Jsoup.parseBodyFragment(html);
        for (Element element : doc.body().children()) {
            processTopLevelElement(document, element);
        }
    }

    private void processTopLevelElement(XWPFDocument document, Element element) {
        if (element.tagName().equals("img")) {
            handleImage(document, element);
        } else {
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.setSpacingBetween(2.0, LineSpacingRule.AUTO);
            processElementRecursive(document, paragraph, element, false, false, false);
        }
    }

    private void handleImage(XWPFDocument document, Element imgElement) {
        String src = imgElement.attr("src");
        if (src == null || src.isEmpty()) return;

        try {
            byte[] imageData;
            String filename;
            int format;

            if (src.startsWith("data:image/")) {
                String header = src.substring(0, src.indexOf(","));
                String base64Data = src.substring(src.indexOf(",") + 1);
                imageData = Base64.getDecoder().decode(base64Data);
                
                filename = "embedded_image";
                if (header.contains("image/png")) format = XWPFDocument.PICTURE_TYPE_PNG;
                else if (header.contains("image/jpeg") || header.contains("image/jpg")) format = XWPFDocument.PICTURE_TYPE_JPEG;
                else if (header.contains("image/gif")) format = XWPFDocument.PICTURE_TYPE_GIF;
                else return;
            } else {
                filename = src.substring(src.lastIndexOf('/') + 1);
                if (filename.contains("?")) {
                    filename = filename.substring(0, filename.indexOf('?'));
                }
                Path imagePath = uploadDir.resolve(filename);
                if (!Files.exists(imagePath)) return;
                imageData = Files.readAllBytes(imagePath);
                
                String lowerName = filename.toLowerCase();
                if (lowerName.endsWith(".png")) format = XWPFDocument.PICTURE_TYPE_PNG;
                else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) format = XWPFDocument.PICTURE_TYPE_JPEG;
                else if (lowerName.endsWith(".gif")) format = XWPFDocument.PICTURE_TYPE_GIF;
                else return;
            }

            try (InputStream is = new ByteArrayInputStream(imageData)) {
                BufferedImage bimg = ImageIO.read(new ByteArrayInputStream(imageData));
                double width = 400;
                double height = 300;
                
                if (bimg != null) {
                    width = bimg.getWidth();
                    height = bimg.getHeight();
                    
                    String attrWidth = imgElement.attr("width");
                    String attrHeight = imgElement.attr("height");
                    
                    if (!attrWidth.isEmpty() && !attrHeight.isEmpty()) {
                        try {
                            width = Double.parseDouble(attrWidth.replaceAll("[^0-9.]", ""));
                            height = Double.parseDouble(attrHeight.replaceAll("[^0-9.]", ""));
                        } catch (NumberFormatException e) { /* fallback to natural */ }
                    } else if (!attrWidth.isEmpty()) {
                        try {
                            double targetWidth = Double.parseDouble(attrWidth.replaceAll("[^0-9.]", ""));
                            height = height * (targetWidth / width);
                            width = targetWidth;
                        } catch (NumberFormatException e) { /* fallback to natural */ }
                    }

                    // Standard DOCX printable width is ~450 points (6.25 inches)
                    double maxWidth = 450; 
                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }
                }

                XWPFParagraph imagePara = document.createParagraph();
                imagePara.setAlignment(ParagraphAlignment.CENTER);
                XWPFRun imageRun = imagePara.createRun();
                imageRun.addPicture(is, format, filename, Units.toEMU(width), Units.toEMU(height));
            }
        } catch (Exception e) {
            System.err.println("Failed to embed image in DOCX: " + e.getMessage());
        }
    }

    private void processElementRecursive(XWPFDocument document, XWPFParagraph paragraph, Element element, boolean bold, boolean italic, boolean underline) {
        for (Node node : element.childNodes()) {
            if (node instanceof TextNode textNode) {
                String text = textNode.text();
                if (!text.isEmpty()) {
                    XWPFRun run = paragraph.createRun();
                    run.setText(text);
                    run.setFontSize(12);
                    run.setFontFamily("Times New Roman");
                    if (bold) run.setBold(true);
                    if (italic) run.setItalic(true);
                    if (underline) run.setUnderline(UnderlinePatterns.SINGLE);
                }
            } else if (node instanceof Element child) {
                if (child.tagName().equals("img")) {
                    handleImage(document, child);
                } else {
                    boolean nextBold = bold || child.tagName().equals("b") || child.tagName().equals("strong");
                    boolean nextItalic = italic || child.tagName().equals("i") || child.tagName().equals("em");
                    boolean nextUnderline = underline || child.tagName().equals("u");
                    
                    if (child.tagName().equals("br")) {
                        paragraph.createRun().addBreak();
                    } else {
                        processElementRecursive(document, paragraph, child, nextBold, nextItalic, nextUnderline);
                    }
                }
            }
        }
    }

    @Override
    public String getFormat() {
        return "docx";
    }
}
