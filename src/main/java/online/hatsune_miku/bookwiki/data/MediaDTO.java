package online.hatsune_miku.bookwiki.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaDTO {
    private UUID id;
    private String filename;
    private String contentType;
    private byte[] data;
    private LocalDateTime createdAt;
}
