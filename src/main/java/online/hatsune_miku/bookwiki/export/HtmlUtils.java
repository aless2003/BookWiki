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
     * Extracts a numeric value from a dimension string (e.g., "100px" -> 100.0)
     * @param dimension The dimension string.
     * @return The numeric value, or null if it cannot be parsed.
     */
    public static Double parseDimension(String dimension) {
        if (dimension == null || dimension.isEmpty() || dimension.equals("auto")) {
            return null;
        }
        try {
            return Double.parseDouble(dimension.replaceAll("[^0-9.]", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
