import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { MdSettings, MdCloudDownload, MdCloudUpload, MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();

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
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <MdCloudDownload size={32} className="text-primary me-2" />
                <Card.Title className="fs-4 m-0">Export Data</Card.Title>
              </div>
              <Card.Text className="text-secondary mb-4">
                Export your entire project database or individual stories into a portable .bwiki archive.
              </Card.Text>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" disabled>Full Export (.bwiki)</Button>
                <Button variant="outline-secondary" disabled>Select Stories to Export</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100 bg-dark border-secondary">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <MdCloudUpload size={32} className="text-success me-2" />
                <Card.Title className="fs-4 m-0">Import Data</Card.Title>
              </div>
              <Card.Text className="text-secondary mb-4">
                Import a .bwiki archive to merge new stories and worldbuilding data into your current project.
              </Card.Text>
              <div className="d-grid">
                <Button variant="outline-success" disabled>Choose .bwiki File</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
