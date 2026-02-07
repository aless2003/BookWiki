import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdLibraryBooks, MdPublic, MdEdit, MdDelete } from 'react-icons/md';

interface Story {
    id: number;
    title: string;
    description: string;
}

interface StorySelectorProps {
    mode?: 'write' | 'world';
}

const StorySelector: React.FC<StorySelectorProps> = ({ mode = 'write' }) => {
    const navigate = useNavigate();
    const [stories, setStories] = useState<Story[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingStory, setEditingStory] = useState<Story | null>(null);
    const [storyTitle, setStoryTitle] = useState('');
    const [storyDesc, setStoryDesc] = useState('');

    const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number; storyId: number | null }>({
        show: false,
        x: 0,
        y: 0,
        storyId: null
    });

    useEffect(() => {
        fetch('http://localhost:3906/api/stories')
            .then(res => res.json())
            .then(data => setStories(data))
            .catch(err => console.error(err));
    }, []);

    const handleOpenCreateModal = () => {
        setEditingStory(null);
        setStoryTitle('');
        setStoryDesc('');
        setShowModal(true);
    };

    const handleOpenEditModal = (story: Story) => {
        setEditingStory(story);
        setStoryTitle(story.title);
        setStoryDesc(story.description);
        setShowModal(true);
        setContextMenu({ ...contextMenu, show: false });
    };

    const handleSaveStory = () => {
        const method = editingStory ? 'PUT' : 'POST';
        const url = editingStory 
            ? `http://localhost:3906/api/stories/${editingStory.id}` 
            : 'http://localhost:3906/api/stories';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: storyTitle, description: storyDesc })
        })
        .then(res => res.json())
        .then(savedStory => {
            if (editingStory) {
                setStories(stories.map(s => s.id === savedStory.id ? savedStory : s));
            } else {
                setStories([...stories, savedStory]);
            }
            setShowModal(false);
            setStoryTitle('');
            setStoryDesc('');
        });
    };

    const handleDeleteStory = (id: number) => {
        if (!window.confirm('Are you sure you want to delete this story? All associated chapters and notes will be lost.')) return;

        fetch(`http://localhost:3906/api/stories/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (res.ok) {
                setStories(stories.filter(s => s.id !== id));
                setContextMenu({ ...contextMenu, show: false });
            }
        });
    };

    const handleStoryClick = (id: number) => {
        if (mode === 'world') {
            navigate(`/world/${id}`);
        } else {
            navigate(`/write/${id}`);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, storyId: number) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.pageX,
            y: e.pageY,
            storyId
        });
    };

    const closeContextMenu = () => {
        setContextMenu({ ...contextMenu, show: false });
    };

    useEffect(() => {
        const handleClick = () => closeContextMenu();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [contextMenu]);

    return (
        <Container className="mt-5 text-light">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1>
                        {mode === 'world' ? <MdPublic className="me-3" /> : <MdLibraryBooks className="me-3" />}
                        {mode === 'world' ? 'Worldbuilding' : 'Your Stories'}
                    </h1>
                    <p className="text-secondary">
                        {mode === 'world' 
                            ? 'Select a story to manage its characters and lore' 
                            : 'Select a story to continue writing'}
                    </p>
                </div>
                <Button variant="primary" onClick={handleOpenCreateModal}>
                    <MdAdd /> New Story
                </Button>
            </div>

            <Row className="g-4">
                {stories.map(story => (
                    <Col key={story.id} md={4}>
                        <Card 
                            className="h-100 bg-dark text-light border-secondary"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => handleStoryClick(story.id)}
                            onContextMenu={(e) => handleContextMenu(e, story.id)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Card.Body>
                                <Card.Title>{story.title}</Card.Title>
                                <Card.Text className="text-secondary">
                                    {story.description || 'No description provided.'}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                
                {stories.length === 0 && (
                    <div className="text-center text-secondary mt-5">
                        <h4>No stories found</h4>
                        <p>Create your first story to get started!</p>
                    </div>
                )}
            </Row>

            {/* Context Menu */}
            {contextMenu.show && (
                <div 
                    style={{ 
                        position: 'absolute', 
                        top: contextMenu.y, 
                        left: contextMenu.x, 
                        zIndex: 1000,
                        minWidth: '150px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Dropdown.Menu show className="bg-dark border-secondary shadow">
                        <Dropdown.Item 
                            className="text-light" 
                            onClick={() => {
                                const story = stories.find(s => s.id === contextMenu.storyId);
                                if (story) handleOpenEditModal(story);
                            }}
                        >
                            <MdEdit className="me-2" /> Edit Story
                        </Dropdown.Item>
                        <Dropdown.Item 
                            className="text-danger" 
                            onClick={() => contextMenu.storyId && handleDeleteStory(contextMenu.storyId)}
                        >
                            <MdDelete className="me-2" /> Delete Story
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </div>
            )}

            {/* Create/Edit Story Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-dark text-light border-secondary">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>{editingStory ? 'Edit Story' : 'Create New Story'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                                type="text" 
                                autoFocus
                                className="bg-black text-light border-secondary"
                                value={storyTitle}
                                onChange={(e) => setStoryTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                className="bg-black text-light border-secondary"
                                value={storyDesc}
                                onChange={(e) => setStoryDesc(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-secondary">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleSaveStory}>
                        {editingStory ? 'Save Changes' : 'Create Story'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StorySelector;
