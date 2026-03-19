import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { MdSettings, MdCloudDownload, MdCloudUpload, MdArrowBack, MdCheck, MdErrorOutline } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/api';

interface Story {
  id: number;
  title: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryIds, setSelectedStoryIds] = useState<number[]>([]);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'danger', message: string } | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = () => {
    setIsLoadingStories(true);
    fetch(`${API_BASE_URL}/api/stories`)
      .then(res => res.json())
      .then(data => {
        setStories(data);
        setIsLoadingStories(false);
      })
      .catch(err => {
        console.error('Failed to fetch stories', err);
        setIsLoadingStories(false);
      });
  };

  const handleToggleStory = (id: number) => {
    setSelectedStoryIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleFullExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/data/export/full`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookwiki_full_backup_${new Date().toISOString().split('T')[0]}.bwiki`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Full export failed', err);
      alert('Export failed. Please check the console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectedExport = async () => {
    if (selectedStoryIds.length === 0) return;
    setIsExporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/data/export/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedStoryIds)
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookwiki_stories_export_${new Date().toISOString().split('T')[0]}.bwiki`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Selected export failed', err);
      alert('Export failed. Please check the console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/data/import`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setImportStatus({ type: 'success', message: 'Import successful! Data has been merged.' });
        fetchStories(); // Refresh list
      } else {
        throw new Error('Import failed');
      }
    } catch (err) {
      console.error('Import failed', err);
      setImportStatus({ type: 'danger', message: 'Import failed. The file may be invalid or corrupted.' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Container className="py-5 h-100 overflow-auto text-light">
      <div className="d-flex align-items-center mb-4">
        <Button variant="link" className="text-light p-0 me-3" onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </Button>
        <h1 className="display-5 fw-bold m-0 d-flex align-items-center">
          <MdSettings className="me-2" /> Settings
        </h1>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100 bg-dark border-secondary">
            <Card.Body className="p-4 d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <MdCloudDownload size={32} className="text-primary me-2" />
                <Card.Title className="fs-4 m-0">Export Data</Card.Title>
              </div>
              <Card.Text className="text-secondary mb-4">
                Export your entire project database or individual stories into a portable .bwiki archive.
              </Card.Text>
              
              <div className="d-grid gap-2 mb-4">
                <Button 
                  variant="outline-primary" 
                  onClick={handleFullExport} 
                  disabled={isExporting}
                >
                  {isExporting ? <Spinner size="sm" className="me-2" /> : null}
                  Full Export (.bwiki)
                </Button>
              </div>

              <div className="flex-grow-1">
                <Card.Subtitle className="mb-2 text-muted text-uppercase small fw-bold">Select Stories to Export</Card.Subtitle>
                {isLoadingStories ? (
                  <div className="text-center py-3"><Spinner size="sm" /></div>
                ) : (
                  <ListGroup className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {stories.map(story => (
                      <ListGroup.Item 
                        key={story.id} 
                        className={`bg-dark text-light border-secondary cursor-pointer d-flex justify-content-between align-items-center ${selectedStoryIds.includes(story.id) ? 'bg-primary bg-opacity-10' : ''}`}
                        onClick={() => handleToggleStory(story.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {story.title}
                        {selectedStoryIds.includes(story.id) && <MdCheck className="text-primary" />}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>

              <div className="d-grid mt-auto">
                <Button 
                  variant="primary" 
                  onClick={handleSelectedExport} 
                  disabled={isExporting || selectedStoryIds.length === 0}
                >
                  {isExporting ? <Spinner size="sm" className="me-2" /> : null}
                  Export Selected ({selectedStoryIds.length})
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100 bg-dark border-secondary">
            <Card.Body className="p-4 d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <MdCloudUpload size={32} className="text-success me-2" />
                <Card.Title className="fs-4 m-0">Import Data</Card.Title>
              </div>
              <Card.Text className="text-secondary mb-4">
                Import a .bwiki archive to merge new stories and worldbuilding data into your current project.
              </Card.Text>
              
              <Alert 
                variant={importStatus?.type || 'info'} 
                className="bg-dark text-light border-secondary d-flex align-items-center mb-4"
                show={!!importStatus}
                onClose={() => setImportStatus(null)}
                dismissible
              >
                {importStatus?.type === 'success' ? <MdCheck size={20} className="me-2 text-success" /> : <MdErrorOutline size={20} className="me-2 text-danger" />}
                {importStatus?.message}
              </Alert>

              <div className="d-grid mt-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".bwiki"
                  onChange={handleFileChange}
                />
                <Button 
                  variant="outline-success" 
                  onClick={handleImportClick}
                  disabled={isImporting}
                >
                  {isImporting ? <Spinner size="sm" className="me-2" /> : null}
                  {isImporting ? 'Importing...' : 'Choose .bwiki File'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
