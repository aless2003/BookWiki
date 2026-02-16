import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { MdArrowBack, MdSave, MdPublish, MdOutlineDescription, MdFolderOpen, MdSettings, MdMoreVert, MdAdd, MdDelete } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import TiptapPagedEditor from '../components/TiptapPagedEditor';
import ExportModal from '../components/ExportModal';

interface Entity {
    id: number;
    name: string;
    description: string;
}

interface ChapterNote {
    id?: number;
    content: string;
}

interface Chapter {
    id: number;
    title: string;
    content: string;
    notes: ChapterNote[];
}

const Writing: React.FC = () => {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageCount, setPageCount] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);

  // Worldbuilding entities state
  const [characters, setCharacters] = useState<Entity[]>([]);
  const [items, setItems] = useState<Entity[]>([]);
  const [locations, setLocations] = useState<Entity[]>([]);
  const [lore, setLore] = useState<Entity[]>([]);

  // Fetch chapters and entities on load
  useEffect(() => {
    if (!storyId) return;

    setIsLoading(true);

    const fetchJson = (url: string) => fetch(url).then(res => res.json());

    Promise.all([
        fetchJson(`http://localhost:3906/api/chapters?storyId=${storyId}`),
        fetchJson(`http://localhost:3906/api/stories/${storyId}/characters`),
        fetchJson(`http://localhost:3906/api/stories/${storyId}/items`),
        fetchJson(`http://localhost:3906/api/stories/${storyId}/locations`),
        fetchJson(`http://localhost:3906/api/stories/${storyId}/lore`)
    ])
    .then(([chaptersData, chars, its, locs, lr]) => {
        // Chapters
        const processedChapters = (chaptersData || []).map((c: any) => ({ ...c, notes: c.notes || [] }));
        setChapters(processedChapters);

        if (processedChapters.length > 0) {
            const savedId = localStorage.getItem(`lastChapter_${storyId}`);
            const exists = savedId && processedChapters.some((c: Chapter) => c.id === parseInt(savedId));

            if (exists) {
                setSelectedChapterId(parseInt(savedId!));
            } else {
                // Fallback to chapter with lowest numerical value
                const sorted = [...processedChapters].sort((a: Chapter, b: Chapter) =>
                    a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' })
                );
                setSelectedChapterId(sorted[0].id);
            }
        }

        // Entities
        setCharacters(chars);
        setItems(its);
        setLocations(locs);
        setLore(lr);

        setIsLoading(false);
    })
    .catch(err => {
        console.error("Failed to fetch studio data:", err);
        setIsLoading(false);
    });
  }, [storyId]);

  // Save last viewed chapter
  useEffect(() => {
    if (storyId && selectedChapterId !== null) {
        localStorage.setItem(`lastChapter_${storyId}`, selectedChapterId.toString());
    }
  }, [storyId, selectedChapterId]);

  // Derived state
  const selectedChapter = chapters.find(c => c.id === selectedChapterId);

  // Sort chapters naturally
  const sortedChapters = [...chapters].sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' })
  );

  const handleSave = React.useCallback(async (chapterToSave?: Chapter) => {
      const targetChapter = chapterToSave || selectedChapter;
      if (!targetChapter) return;

      try {
          const response = await fetch(`http://localhost:3906/api/chapters/${targetChapter.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(targetChapter)
          });

          if (response.ok) {
              const updatedChapter = await response.json();
              setChapters(prev => prev.map(c =>
                  c.id === updatedChapter.id ? { ...updatedChapter, notes: updatedChapter.notes || [] } : c
              ));
          }
      } catch (err) {
          console.error('Error saving chapter:', err);
      }
  }, [selectedChapter]);

  const handleChapterSwitch = (newId: number) => {
      if (selectedChapterId === newId) return;
      if (selectedChapter) handleSave(selectedChapter);
      setSelectedChapterId(newId);
  };

  const handleCreateChapter = async () => {
      if (selectedChapter) handleSave(selectedChapter);

      const newTitle = `Chapter ${chapters.length + 1}`;
      try {
          const response = await fetch(`http://localhost:3906/api/chapters?storyId=${storyId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: newTitle, content: '<p></p>', notes: [] })
          });

          if (response.ok) {
              const newChapter = await response.json();
              const chapterWithNotes = { ...newChapter, notes: [] };
              setChapters(prev => [...prev, chapterWithNotes]);
              setSelectedChapterId(newChapter.id);
          }
      } catch (err) {
          console.error('Error creating chapter:', err);
      }
  };

  // Global CTRL+S listener
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              if (selectedChapter) {
                  e.preventDefault();
                  handleSave();
              }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedChapter, handleSave]);

  const updateChapterContent = (newContent: string) => {
      if (selectedChapterId === null) return;
      setChapters(prev => prev.map(c =>
          c.id === selectedChapterId ? { ...c, content: newContent } : c
      ));
  };

  const updateChapterTitle = (newTitle: string) => {
      if (selectedChapterId === null) return;
      setChapters(prev => prev.map(c =>
          c.id === selectedChapterId ? { ...c, title: newTitle } : c
      ));
  };

  // Note Handling
  const handleUpdateNote = (index: number, content: string) => {
      if (selectedChapterId === null) return;
      setChapters(prev => prev.map(c => {
          if (c.id === selectedChapterId) {
              const updatedNotes = [...c.notes];
              updatedNotes[index] = { ...updatedNotes[index], content: content };
              return { ...c, notes: updatedNotes };
          }
          return c;
      }));
  };

  const handleDeleteNote = (index: number) => {
      if (selectedChapterId === null) return;
      setChapters(prev => prev.map(c => {
          if (c.id === selectedChapterId) {
              const updatedNotes = c.notes.filter((_, i) => i !== index);
              return { ...c, notes: updatedNotes };
          }
          return c;
      }));
  };

  const handleNoteAdd = () => {
      if (selectedChapterId === null) return;
      setChapters(prev => prev.map(c => {
          if (c.id === selectedChapterId) {
              return { ...c, notes: [...c.notes, { content: '' }] };
          }
          return c;
      }));
  };

  const handleMentionClick = (id: number, type: string) => {
      // Map 'character', 'item', 'location', 'lore' to display categories
      const typeMap: Record<string, string> = {
          'character': 'Characters',
          'item': 'Items',
          'location': 'Locations',
          'lore': 'Lore'
      };
      const category = typeMap[type] || 'Characters';
      navigate(`/world/${storyId}?category=${category}&id=${id}`);
  };

  if (isLoading) return <div className="text-light p-5">Loading studio...</div>;

  return (
    <Container fluid className="h-100 d-flex flex-column p-0 bg-black text-light">
      {/* Top AppBar */}
      <div className="px-4 py-2 border-bottom border-secondary d-flex justify-content-between align-items-center" style={{ backgroundColor: '#1e1e1e', zIndex: 10 }}>
          <div className="d-flex align-items-center">
              <Button variant="link" className="text-light me-3 p-0" onClick={() => navigate('/stories')}>
                  <MdArrowBack size={24} />
              </Button>
              <div>
                <Form.Control
                    type="text"
                    className="m-0 fw-bold bg-transparent border-0 text-light p-0 shadow-none"
                    style={{ fontSize: '1rem', fontWeight: 'bold' }}
                    value={selectedChapter?.title || ''}
                    onChange={(e) => updateChapterTitle(e.target.value)}
                    disabled={!selectedChapter}
                    placeholder="Chapter Title"
                    onBlur={() => handleSave()}
                    onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                            e.preventDefault();
                            handleSave();
                        }
                        if (e.key === 'Enter') {
                            e.currentTarget.blur();
                        }
                    }}
                />
                <div className="d-flex gap-2 align-items-center">
                    <small className="text-secondary">Last edited just now</small>
                    <span className="text-secondary" style={{ fontSize: '0.8rem' }}>•</span>
                    <small className="text-info fw-bold">{pageCount} {pageCount === 1 ? 'Page' : 'Pages'}</small>
                </div>
              </div>
          </div>
          <div className="d-flex gap-2">
              <Button variant="outline-light" className="d-flex align-items-center gap-2 border-0 bg-dark bg-opacity-25" onClick={() => handleSave()}>
                <MdSave /> <span className="d-none d-md-inline">Save</span>
              </Button>
              <Button variant="outline-light" className="d-flex align-items-center gap-2 border-0 bg-dark bg-opacity-25" onClick={() => setShowExportModal(true)}>
                <MdPublish style={{ transform: 'rotate(180deg)' }} /> <span className="d-none d-md-inline">Export</span>
              </Button>
              <Button variant="primary" className="d-flex align-items-center gap-2">
                <MdPublish /> Publish
              </Button>
              <Button variant="link" className="text-secondary">
                  <MdMoreVert size={24} />
              </Button>
          </div>
      </div>

      <ExportModal 
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        storyId={storyId!}
        chapters={sortedChapters}
        currentChapterId={selectedChapterId}
      />

      <Row className="flex-grow-1 g-0 overflow-hidden" style={{ minHeight: 0 }}>
          <Col md={2} className="d-none d-md-block p-3 overflow-auto h-100" style={{ backgroundColor: '#1e1e1e', borderRight: '1px solid #333' }}>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center px-3 mb-2">
                    <small className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Manuscript</small>
                    <Button variant="link" className="p-0 text-secondary" size="sm" onClick={handleCreateChapter} title="New Chapter">
                        <MdAdd size={18} />
                    </Button>
                </div>
                <div className="mt-2">
                    {sortedChapters.map(chapter => (
                        <div
                            key={chapter.id}
                            className={`nav-drawer-item ${selectedChapterId === chapter.id ? 'active' : ''}`}
                            onClick={() => handleChapterSwitch(chapter.id)}
                        >
                            <MdOutlineDescription /> {chapter.title}
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <small className="text-secondary fw-bold text-uppercase px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Planning</small>
                <div className="mt-2">
                    <div className="nav-drawer-item">
                        <MdFolderOpen /> Notes & Ideas
                    </div>
                    <div className="nav-drawer-item">
                        <MdSettings /> Document Settings
                    </div>
                </div>
            </div>
          </Col>

          <Col md={8} className="d-flex justify-content-center overflow-auto h-100 position-relative bg-black">
            <div className="writing-container w-100 my-4 px-2" style={{ height: 'fit-content' }}>
                {selectedChapter ? (
                    <TiptapPagedEditor
                      content={selectedChapter.content}
                      characters={characters}
                      items={items}
                      locations={locations}
                      lore={lore}
                      onChange={updateChapterContent}
                      onPageCountChange={setPageCount}
                      onSave={() => handleSave()}
                      onMentionClick={handleMentionClick}
                      storyId={storyId}
                    />
                ) : (
                    <div className="text-center text-secondary mt-5">
                        <p>No chapters found. Create one to start writing.</p>
                        <Button variant="outline-primary" onClick={handleCreateChapter}>Create First Chapter</Button>
                    </div>
                )}
            </div>
          </Col>

          <Col md={2} className="d-none d-lg-block p-3 border-start border-secondary overflow-auto h-100" style={{ backgroundColor: '#121212' }}>
             <div className="mb-3">
                 <small className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Quick Notes</small>
             </div>
             {selectedChapter?.notes.map((note, index) => (
                <div key={index} className="mb-3 p-3 rounded position-relative" style={{ backgroundColor: '#1e1e1e', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        className="bg-transparent border-0 text-light p-0 small"
                        style={{ resize: 'none', boxShadow: 'none' }}
                        placeholder="Write a note..."
                        value={note.content}
                        onChange={(e) => handleUpdateNote(index, e.target.value)}
                        onBlur={() => handleSave()}
                        onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                                e.preventDefault();
                                handleSave();
                            }
                        }}
                    />
                    <div className="d-flex justify-content-end mt-2 pt-2 border-top border-secondary">
                        <Button
                            variant="link"
                            size="sm"
                            className="text-secondary p-0 d-flex align-items-center"
                            onClick={async () => {
                                handleDeleteNote(index);
                                if (selectedChapter) {
                                    const updatedNotes = selectedChapter.notes.filter((_, i) => i !== index);
                                    handleSave({ ...selectedChapter, notes: updatedNotes });
                                }
                            }}
                            title="Delete note"
                            style={{ opacity: 0.7 }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        >
                            <MdDelete size={16} />
                        </Button>
                    </div>
                </div>
             ))}
             <Button
                variant="outline-secondary"
                size="sm"
                className="w-100 d-flex align-items-center justify-content-center gap-2 border-0"
                onClick={handleNoteAdd}
                style={{ borderRadius: '12px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)' }}
             >
                 <MdAdd size={18} /> Add New Note
             </Button>
          </Col>
      </Row>
    </Container>
  );
};

export default Writing;
