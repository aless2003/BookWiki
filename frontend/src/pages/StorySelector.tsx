import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdLibraryBooks, MdPublic } from 'react-icons/md';

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
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [newStoryDesc, setNewStoryDesc] = useState('');

    useEffect(() => {
        fetch('http://localhost:3906/api/stories')
            .then(res => res.json())
            .then(data => setStories(data))
            .catch(err => console.error(err));
    }, []);

    const handleCreateStory = () => {
        fetch('http://localhost:3906/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newStoryTitle, description: newStoryDesc })
        })
        .then(res => res.json())
        .then(newStory => {
            setStories([...stories, newStory]);
            setShowModal(false);
            setNewStoryTitle('');
            setNewStoryDesc('');
        });
    };

    const handleStoryClick = (id: number) => {
        if (mode === 'world') {
            navigate(`/world/${id}`);
        } else {
            navigate(`/write/${id}`);
        }
    };

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
                <Button variant="primary" onClick={() => setShowModal(true)}>
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

            {/* Create Story Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-dark text-light border-secondary">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>Create New Story</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                                type="text" 
                                autoFocus
                                className="bg-black text-light border-secondary"
                                value={newStoryTitle}
                                onChange={(e) => setNewStoryTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                className="bg-black text-light border-secondary"
                                value={newStoryDesc}
                                onChange={(e) => setNewStoryDesc(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-secondary">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleCreateStory}>Create Story</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StorySelector;
