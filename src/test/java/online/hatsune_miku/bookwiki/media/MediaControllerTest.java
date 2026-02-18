package online.hatsune_miku.bookwiki.media;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayInputStream;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class MediaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MediaService mediaService;

    @Test
    void uploadMedia() throws Exception {
        UUID id = UUID.randomUUID();
        Media media = new Media();
        media.setId(id);
        
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "test data".getBytes());

        when(mediaService.saveMedia(any())).thenReturn(media);

        mockMvc.perform(multipart("/api/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.url").value("/api/media/" + id));
    }

    @Test
    void getMedia() throws Exception {
        UUID id = UUID.randomUUID();
        Media media = new Media();
        media.setId(id);
        media.setContentType("image/png");
        
        when(mediaService.getMedia(id)).thenReturn(media);
        when(mediaService.getMediaContent(id)).thenReturn("test data".getBytes());

        mockMvc.perform(get("/api/media/{id}", id))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"))
                .andExpect(content().bytes("test data".getBytes()));
    }
}
