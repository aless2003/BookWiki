package online.hatsune_miku.bookwiki.media;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReferenceTrackingService {

    private final MediaReferenceRepository referenceRepository;
    private final MediaRepository mediaRepository;

    @Transactional
    public void updateReferences(String content, String entityType, Long entityId) {
        // Find all image shortcodes
        Set<UUID> foundUuids = parseShortcodes(content);

        // Get existing references to identify potential orphans later
        List<UUID> oldMediaIds = referenceRepository.findByEntityTypeAndEntityId(entityType, entityId)
                .stream()
                .map(MediaReference::getMediaId)
                .collect(Collectors.toList());

        // Delete old references for this entity
        referenceRepository.deleteByEntityTypeAndEntityId(entityType, entityId);

        // Save new references
        for (UUID mediaId : foundUuids) {
            referenceRepository.save(new MediaReference(mediaId, entityType, entityId));
        }
        
        // Trigger orphan check for old media that was removed
        for (UUID oldId : oldMediaIds) {
            if (!foundUuids.contains(oldId)) {
                // If it's not in the new set, check if it should be deleted
                deleteIfOrphaned(oldId);
            }
        }
    }

    @Transactional
    public void deleteReferences(String entityType, Long entityId) {
        // Get existing references to identify potential orphans
        List<UUID> mediaIds = referenceRepository.findByEntityTypeAndEntityId(entityType, entityId)
                .stream()
                .map(MediaReference::getMediaId)
                .collect(Collectors.toList());

        // Delete references
        referenceRepository.deleteByEntityTypeAndEntityId(entityType, entityId);

        // Trigger orphan check
        for (UUID id : mediaIds) {
            deleteIfOrphaned(id);
        }
    }

    private void deleteIfOrphaned(UUID mediaId) {
        if (referenceRepository.findByMediaId(mediaId).isEmpty()) {
            mediaRepository.deleteById(mediaId);
        }
    }

    private Set<UUID> parseShortcodes(String content) {
        Set<UUID> uuids = new HashSet<>();
        if (content == null) return uuids;

        Pattern pattern = Pattern.compile("#\\{image:([\\w\\-]+)\\}");
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            try {
                uuids.add(UUID.fromString(matcher.group(1)));
            } catch (IllegalArgumentException ignored) {
            }
        }
        return uuids;
    }

    public List<UUID> getReferencedMedia(String entityType, Long entityId) {
        return referenceRepository.findByEntityTypeAndEntityId(entityType, entityId)
                .stream()
                .map(MediaReference::getMediaId)
                .collect(Collectors.toList());
    }

    public boolean isMediaReferenced(UUID mediaId) {
        return !referenceRepository.findByMediaId(mediaId).isEmpty();
    }
}
