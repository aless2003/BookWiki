package online.hatsune_miku.bookwiki.chapter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final online.hatsune_miku.bookwiki.media.ReferenceTrackingService referenceTrackingService;

    public ChapterService(ChapterRepository chapterRepository, online.hatsune_miku.bookwiki.media.ReferenceTrackingService referenceTrackingService) {
        this.chapterRepository = chapterRepository;
        this.referenceTrackingService = referenceTrackingService;
    }

    public List<Chapter> getChaptersByStoryId(Long storyId) {
        return chapterRepository.findByStoryId(storyId);
    }

    public Optional<Chapter> getChapterById(Long id) {
        return chapterRepository.findById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public Chapter saveChapter(Chapter chapter) {
        Chapter saved = chapterRepository.save(chapter);
        
        // Track references in content and notes
        StringBuilder content = new StringBuilder();
        if (saved.getContent() != null) content.append(saved.getContent());
        if (saved.getNotes() != null) {
            for (ChapterNote note : saved.getNotes()) {
                if (note.getContent() != null) content.append(note.getContent());
            }
        }
        
        referenceTrackingService.updateReferences(content.toString(), "CHAPTER", saved.getId());
        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteChapter(Long id) {
        chapterRepository.deleteById(id);
        referenceTrackingService.deleteReferences("CHAPTER", id);
    }
}
