import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MdPublic, MdEdit } from 'react-icons/md';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-5 h-100 overflow-auto">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">BookWiki</h1>
        <p className="lead text-secondary">Your universe, organized and written.</p>
      </div>

      <Row className="justify-content-center g-4">
        <Col md={5}>
          <Card 
            className="h-100 text-center p-4 cursor-pointer" 
            onClick={() => navigate('/world')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <div className="mb-4 p-4 rounded-circle bg-dark d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                <MdPublic size={48} className="text-primary" />
              </div>
              <Card.Title className="fs-3">Worldbuilding</Card.Title>
              <Card.Text className="text-secondary mb-4">
                Manage your characters, locations, and lore in a wiki-style database.
              </Card.Text>
              <span className="btn btn-primary">Enter World</span>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card 
            className="h-100 text-center p-4"
            onClick={() => navigate('/stories')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <div className="mb-4 p-4 rounded-circle bg-dark d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                <MdEdit size={48} className="text-success" />
              </div>
              <Card.Title className="fs-3">Writer's Studio</Card.Title>
              <Card.Text className="text-secondary mb-4">
                Draft chapters in a focused, distraction-free environment.
              </Card.Text>
              <span className="btn btn-primary" style={{ backgroundColor: '#81c995', color: '#0d3b1e' }}>Start Writing</span>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;