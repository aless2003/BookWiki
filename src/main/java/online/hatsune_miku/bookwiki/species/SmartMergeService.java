package online.hatsune_miku.bookwiki.species;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

@Service
public class SmartMergeService {

    /**
     * Merges structural changes from the parentTemplate into the childContent.
     * 
     * Strategy:
     * 1. If childContent is empty, just return parentTemplate.
     * 2. Parse both as HTML fragments.
     * 3. Focus on tables: If both have a table, try to align rows and columns.
     * 4. For non-table content: Currently, we might just append new parent content 
     *    if it's not found in child, but tables are the primary target for "templates".
     * 
     * @param parentTemplate The current HTML from the parent section.
     * @param childContent The current HTML from the child section.
     * @return Merged HTML.
     */
    public String merge(String parentTemplate, String childContent) {
        if (childContent == null || childContent.trim().isEmpty() || childContent.equals("<p><br></p>")) {
            return parentTemplate;
        }
        if (parentTemplate == null || parentTemplate.trim().isEmpty()) {
            return childContent;
        }

        Document parentDoc = Jsoup.parseBodyFragment(parentTemplate);
        Document childDoc = Jsoup.parseBodyFragment(childContent);

        mergeTables(parentDoc, childDoc);

        // For non-table content: append parent content if missing in child
        String parentBody = parentDoc.body().html();
        String childBody = childDoc.body().html();
        
        if (!childBody.contains(parentBody)) {
            childDoc.body().append("<hr>").append("<div><strong>Updated from Parent Template:</strong></div>").append(parentBody);
        }
        
        return childDoc.body().html();
    }

    private void mergeTables(Document parentDoc, Document childDoc) {
        Elements parentTables = parentDoc.select("table");
        Elements childTables = childDoc.select("table");

        // Simple heuristic: Merge tables by index if they match
        for (int i = 0; i < parentTables.size() && i < childTables.size(); i++) {
            Element pTable = parentTables.get(i);
            Element cTable = childTables.get(i);
            mergeTable(pTable, cTable);
        }
    }

    private void mergeTable(Element pTable, Element cTable) {
        Elements pRows = pTable.select("tr");
        Elements cRows = cTable.select("tr");

        // 1. Merge existing rows
        for (int i = 0; i < pRows.size() && i < cRows.size(); i++) {
            Element pRow = pRows.get(i);
            Element cRow = cRows.get(i);
            
            Elements pCols = pRow.select("td, th");
            Elements cCols = cRow.select("td, th");
            
            // Sync column count and content for existing cells
            for (int j = 0; j < pCols.size(); j++) {
                Element pCol = pCols.get(j);
                if (j < cCols.size()) {
                    Element cCol = cCols.get(j);
                    // If child cell is empty (or just a break), and parent has content, copy it
                    // This is useful for headers or labels
                    String cHtml = cCol.html().trim();
                    if (cHtml.isEmpty() || cHtml.equals("<br>") || cHtml.equals("<p><br></p>")) {
                        cCol.html(pCol.html());
                    }
                } else {
                    // Append missing column from parent
                    cRow.appendChild(pCol.clone());
                }
            }
        }

        // 2. If parent has more rows, append them to child
        if (pRows.size() > cRows.size()) {
            Element cBody = cTable.select("tbody").first();
            if (cBody == null) cBody = cTable; // Fallback if no tbody
            
            for (int i = cRows.size(); i < pRows.size(); i++) {
                cBody.appendChild(pRows.get(i).clone());
            }
        }
    }

    private int getMaxColumns(Elements rows) {
        int max = 0;
        for (Element row : rows) {
            max = Math.max(max, row.select("td, th").size());
        }
        return max;
    }
}
