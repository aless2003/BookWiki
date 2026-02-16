package online.hatsune_miku.bookwiki.emote;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateEmoteRequest {
    private String name;
    private String imageUrl;
}
