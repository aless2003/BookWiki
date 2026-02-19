package online.hatsune_miku.bookwiki.media;

import jakarta.persistence.EntityManager;
import org.hibernate.Session;
import org.hibernate.jdbc.ReturningWork;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;
import java.io.OutputStream;
import java.sql.Blob;
import java.sql.Connection;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MediaServiceTest {

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private EntityManager entityManager;

    @Mock
    private MediaReferenceRepository referenceRepository;

    @Mock
    private Session session;

    @Mock
    private Connection connection;

    @Mock
    private Blob blob;

    @InjectMocks
    private MediaService mediaService;

    @Test
    @SuppressWarnings("unchecked")
    void saveMedia() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "test data".getBytes());

        when(entityManager.unwrap(Session.class)).thenReturn(session);
        when(session.doReturningWork(any(ReturningWork.class))).thenAnswer(invocation -> {
            ReturningWork<Blob> work = invocation.getArgument(0);
            return work.execute(connection);
        });
        when(connection.createBlob()).thenReturn(blob);
        when(blob.setBinaryStream(1)).thenReturn(mock(OutputStream.class));
        when(mediaRepository.save(any(Media.class))).thenAnswer(i -> i.getArguments()[0]);

        Media saved = mediaService.saveMedia(file);

        assertNotNull(saved);
        assertEquals("test.png", saved.getFilename());
        assertEquals("image/png", saved.getContentType());
        assertEquals(blob, saved.getData());
        verify(mediaRepository).save(any(Media.class));
    }

    @Test
    void getMediaStream() throws Exception {
        UUID id = UUID.randomUUID();
        Media media = new Media();
        media.setData(blob);
        InputStream is = mock(InputStream.class);
        
        when(mediaRepository.findById(id)).thenReturn(Optional.of(media));
        when(blob.getBinaryStream()).thenReturn(is);

        InputStream result = mediaService.getMediaStream(id);

        assertEquals(is, result);
    }
}
