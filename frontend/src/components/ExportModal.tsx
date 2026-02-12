import React, { useState } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { MdGetApp } from 'react-icons/md';

interface Chapter {
    id: number;
    title: string;
}

interface ExportModalProps {
    show: boolean;
    onHide: () => void;
    storyId: string;
    chapters: Chapter[];
    currentChapterId: number | null;
}

const ExportModal: React.FC<ExportModalProps> = ({ show, onHide, storyId, chapters, currentChapterId }) => {
    const [format, setFormat] = useState<'pdf' | 'docx'>('pdf');
    const [scope, setScope] = useState<'current' | 'all' | 'specific'>('current');
    const [selectedChapterIds, setSelectedChapterIds] = useState<number[]>(currentChapterId ? [currentChapterId] : []);
    const [isExporting, setIsExporting] = useState(false);

    const handleToggleChapter = (id: number) => {
        setSelectedChapterIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            let chapterIds: number[] = [];
            if (scope === 'current' && currentChapterId) {
                chapterIds = [currentChapterId];
            } else if (scope === 'all') {
                chapterIds = chapters.map(c => c.id);
            } else if (scope === 'specific') {
                chapterIds = selectedChapterIds;
            }

            const response = await fetch(`http://localhost:3906/api/export/${format}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyId: parseInt(storyId),
                    chapterIds: chapterIds
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                // Try to get filename from header
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = `export.${format}`;
                if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
                    filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
                }
                
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                onHide();
            } else {
                console.error('Export failed');
                alert('Export failed. Please try again.');
            }
        } catch (err) {
            console.error('Export error:', err);
            alert('An error occurred during export.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered contentClassName="bg-dark text-light border-secondary">
            <Modal.Header closeButton closeVariant="white" className="border-secondary">
                <Modal.Title>Export Document</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-secondary text-uppercase small">File Format</Form.Label>
                        <div className="d-flex gap-3 mt-2">
                            <Form.Check
                                type="radio"
                                label="PDF Document (.pdf)"
                                name="format"
                                id="format-pdf"
                                checked={format === 'pdf'}
                                onChange={() => setFormat('pdf')}
                            />
                            <Form.Check
                                type="radio"
                                label="Word Document (.docx)"
                                name="format"
                                id="format-docx"
                                checked={format === 'docx'}
                                onChange={() => setFormat('docx')}
                            />
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-secondary text-uppercase small">Selection Scope</Form.Label>
                        <Form.Select 
                            className="bg-black text-light border-secondary mt-2"
                            value={scope}
                            onChange={(e) => setScope(e.target.value as any)}
                        >
                            <option value="current">Current Chapter</option>
                            <option value="all">Entire Story (All Chapters)</option>
                            <option value="specific">Select Specific Chapters...</option>
                        </Form.Select>
                    </Form.Group>

                    {scope === 'specific' && (
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold text-secondary text-uppercase small">Select Chapters</Form.Label>
                            <div className="border border-secondary rounded overflow-auto mt-2" style={{ maxHeight: '200px', backgroundColor: '#000' }}>
                                <ListGroup variant="flush">
                                    {chapters.map(chapter => (
                                        <ListGroup.Item 
                                            key={chapter.id} 
                                            className="bg-transparent border-secondary text-light d-flex align-items-center gap-2 py-2"
                                            action
                                            type="button"
                                            onClick={() => handleToggleChapter(chapter.id)}
                                        >
                                            <Form.Check 
                                                type="checkbox"
                                                checked={selectedChapterIds.includes(chapter.id)}
                                                readOnly
                                            />
                                            {chapter.title}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        </Form.Group>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-secondary">
                <Button variant="secondary" onClick={onHide} disabled={isExporting}>Cancel</Button>
                <Button 
                    variant="primary" 
                    onClick={handleExport} 
                    disabled={isExporting || (scope === 'specific' && selectedChapterIds.length === 0)}
                    className="d-flex align-items-center gap-2"
                >
                    {isExporting ? 'Generating...' : <><MdGetApp /> Export Now</>}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ExportModal;
