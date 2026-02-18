package online.hatsune_miku.bookwiki.export;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class HtmlUtils {
    private static final Pattern STYLE_PATTERN = Pattern.compile("([^:;]+):\s*([^;]+)");

    /**
     * Parses a CSS style attribute string into a Map of property-value pairs.
     * @param style The style string (e.g., "width: 100px; height: auto;")
     * @return A map of style properties to their values.
     */
    public static Map<String, String> parseStyle(String style) {
        Map<String, String> styles = new HashMap<>();
        if (style == null || style.isEmpty()) {
            return styles;
        }

        Matcher matcher = STYLE_PATTERN.matcher(style);
        while (matcher.find()) {
            styles.put(matcher.group(1).trim().toLowerCase(), matcher.group(2).trim());
        }
        return styles;
    }

    /**
     * Extracts a numeric value from a dimension string (e.g., "100px" -> 100.0, "50%" -> 0.5)
     * @param dimension The dimension string.
     * @param total The total size to use for percentage calculation (e.g. page width).
     * @return The calculated value in points, or null if it cannot be parsed.
     */
    public static Double parseDimension(String dimension, double total) {
        if (dimension == null || dimension.isEmpty() || dimension.equals("auto")) {
            return null;
        }
        
        String cleanValue = dimension.replaceAll("[^0-9.%]", "");
        if (cleanValue.isEmpty()) return null;

        try {
            if (cleanValue.endsWith("%")) {
                double percent = Double.parseDouble(cleanValue.substring(0, cleanValue.length() - 1));
                return total * (percent / 100.0);
            } else {
                // Convert pixels (standard in web/editor) to points (standard in PDF/Docx).
                // 1px = 0.75pt (based on 96 DPI vs 72 DPI)
                double val = Double.parseDouble(cleanValue.replaceAll("[^0-9.]", ""));
                return val * 0.75;
            }
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static Double parseDimension(String dimension) {
        return parseDimension(dimension, 0);
    }
}
