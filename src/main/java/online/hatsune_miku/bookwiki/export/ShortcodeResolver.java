package online.hatsune_miku.bookwiki.export;

import online.hatsune_miku.bookwiki.character.CharacterService;
import online.hatsune_miku.bookwiki.item.ItemService;
import online.hatsune_miku.bookwiki.location.LocationService;
import online.hatsune_miku.bookwiki.lore.LoreService;
import online.hatsune_miku.bookwiki.species.SpeciesService;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ShortcodeResolver {

    private final CharacterService characterService;
    private final ItemService itemService;
    private final LocationService locationService;
    private final LoreService loreService;
    private final SpeciesService speciesService;

    public ShortcodeResolver(CharacterService characterService, ItemService itemService, LocationService locationService, LoreService loreService, SpeciesService speciesService) {
        this.characterService = characterService;
        this.itemService = itemService;
        this.locationService = locationService;
        this.loreService = loreService;
        this.speciesService = speciesService;
    }

    public String resolve(String content) {
        if (content == null || content.isEmpty()) return "";
        
        org.jsoup.nodes.Document doc = org.jsoup.Jsoup.parseBodyFragment(content);
        
        // 1. Resolve images in src attributes
        org.jsoup.select.Elements images = doc.select("img");
        for (org.jsoup.nodes.Element img : images) {
            String src = img.attr("src");
            if (src.startsWith("#{image:") || src.startsWith("#{emote:")) {
                String uuid = src.substring(src.indexOf(":") + 1, src.indexOf("}"));
                img.attr("src", "/api/media/" + uuid);
            }
        }

        // 2. Resolve other shortcodes (mentions) in text nodes
        // We use a regex for this as it's simpler for text-wide replacement
        String processedHtml = doc.body().html();
        Pattern pattern = Pattern.compile("#\\{(\\w+):([\\w\\-]+)\\}");
        Matcher matcher = pattern.matcher(processedHtml);
        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            String type = matcher.group(1);
            String idStr = matcher.group(2);
            
            String replacement;
            // Skip image/emote as they should be in <img> tags now
            if (type.equalsIgnoreCase("image") || type.equalsIgnoreCase("emote")) {
                // If it's a raw shortcode not in an <img> tag, we can still resolve it to one
                if (type.equalsIgnoreCase("image")) {
                    replacement = String.format("<img src=\"/api/media/%s\" alt=\"Media\" style=\"max-width: 100%%; height: auto;\" />", idStr);
                } else {
                    replacement = String.format("<img src=\"/api/media/%s\" class=\"inline-image-emote\" style=\"height: 1.5em; vertical-align: middle;\" />", idStr);
                }
            } else {
                try {
                    Long id = Long.parseLong(idStr);
                    replacement = switch (type.toLowerCase()) {
                        case "character" -> characterService.getCharacterById(id).map(c -> c.getName()).orElse("Unknown Character");
                        case "item" -> itemService.getItemById(id).map(i -> i.getName()).orElse("Unknown Item");
                        case "location" -> locationService.getLocationById(id).map(l -> l.getName()).orElse("Unknown Location");
                        case "lore" -> loreService.getLoreById(id).map(l -> l.getName()).orElse("Unknown Lore");
                        case "species" -> speciesService.getSpeciesById(id).map(s -> s.getName()).orElse("Unknown Species");
                        default -> matcher.group(0); // Keep as is if unknown type
                    };
                } catch (NumberFormatException e) {
                    replacement = matcher.group(0); // Not a long id, skip
                }
            }
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);
        
        return sb.toString();
    }
}
