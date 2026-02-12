package online.hatsune_miku.bookwiki.export;

import online.hatsune_miku.bookwiki.character.CharacterService;
import online.hatsune_miku.bookwiki.item.ItemService;
import online.hatsune_miku.bookwiki.location.LocationService;
import online.hatsune_miku.bookwiki.lore.LoreService;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ShortcodeResolver {

    private final CharacterService characterService;
    private final ItemService itemService;
    private final LocationService locationService;
    private final LoreService loreService;

    public ShortcodeResolver(CharacterService characterService, ItemService itemService, LocationService locationService, LoreService loreService) {
        this.characterService = characterService;
        this.itemService = itemService;
        this.locationService = locationService;
        this.loreService = loreService;
    }

    public String resolve(String content) {
        if (content == null) return "";
        
        // Resolve mentions: #{type:id}
        Pattern pattern = Pattern.compile("#\\{(\\w+):(\\d+)\\}");
        Matcher matcher = pattern.matcher(content);
        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            String type = matcher.group(1);
            Long id = Long.parseLong(matcher.group(2));
            String name = switch (type.toLowerCase()) {
                case "character" -> characterService.getCharacterById(id).map(c -> c.getName()).orElse("Unknown Character");
                case "item" -> itemService.getItemById(id).map(i -> i.getName()).orElse("Unknown Item");
                case "location" -> locationService.getLocationById(id).map(l -> l.getName()).orElse("Unknown Location");
                case "lore" -> loreService.getLoreById(id).map(l -> l.getName()).orElse("Unknown Lore");
                default -> matcher.group(0); // Keep as is if unknown type
            };
            matcher.appendReplacement(sb, Matcher.quoteReplacement(name));
        }
        matcher.appendTail(sb);
        
        return sb.toString();
    }
}
