package online.hatsune_miku.bookwiki.export;

import online.hatsune_miku.bookwiki.chapter.Chapter;
import org.apache.poi.xwpf.usermodel.*;
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
public class DocxExportService implements ExportService {

    @Autowired
    private ShortcodeResolver shortcodeResolver;

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
            XWPFParagraph paragraph = document.createParagraph();
            // Default styling: 12pt serif, double-spaced
            paragraph.setSpacingBetween(2.0, LineSpacingRule.AUTO);
            processElement(paragraph, element, false, false, false);
        }
    }

    private void processElement(XWPFParagraph paragraph, Element element, boolean bold, boolean italic, boolean underline) {
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
                boolean nextBold = bold || child.tagName().equals("b") || child.tagName().equals("strong");
                boolean nextItalic = italic || child.tagName().equals("i") || child.tagName().equals("em");
                boolean nextUnderline = underline || child.tagName().equals("u");
                
                if (child.tagName().equals("br")) {
                    paragraph.createRun().addBreak();
                } else {
                    processElement(paragraph, child, nextBold, nextItalic, nextUnderline);
                }
            }
        }
    }

    @Override
    public String getFormat() {
        return "docx";
    }
}
