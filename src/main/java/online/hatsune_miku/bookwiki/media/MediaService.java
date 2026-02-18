package online.hatsune_miku.bookwiki.media;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.Blob;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;
    private final EntityManager entityManager;

    @Transactional
    public Media saveMedia(MultipartFile file) throws IOException {
        Media media = new Media();
        media.setFilename(file.getOriginalFilename());
        media.setContentType(file.getContentType());

        Session session = entityManager.unwrap(Session.class);
        Blob blob = session.doReturningWork(connection -> {
            try {
                Blob b = connection.createBlob();
                try (InputStream is = file.getInputStream();
                     OutputStream os = b.setBinaryStream(1)) {
                    is.transferTo(os);
                }
                return b;
            } catch (Exception e) {
                throw new RuntimeException("Could not save file to blob", e);
            }
        });
        media.setData(blob);

        return mediaRepository.save(media);
    }

    @Transactional
    public InputStream getMediaStream(UUID id) throws Exception {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found"));
        return media.getData().getBinaryStream();
    }

    public Media getMedia(UUID id) {
        return mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found"));
    }
}
