package online.hatsune_miku.bookwiki.chapter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChapterService {

    private final ChapterRepository chapterRepository;

    public ChapterService(ChapterRepository chapterRepository) {
        this.chapterRepository = chapterRepository;
    }

    public List<Chapter> getChaptersByStoryId(Long storyId) {
        return chapterRepository.findByStoryId(storyId);
    }

    public Optional<Chapter> getChapterById(Long id) {
        return chapterRepository.findById(id);
    }

    public Chapter saveChapter(Chapter chapter) {
        return chapterRepository.save(chapter);
    }

    public void deleteChapter(Long id) {
        chapterRepository.deleteById(id);
    }
}
