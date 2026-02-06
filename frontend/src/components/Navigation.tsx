import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { MdBook, MdPublic, MdEdit } from 'react-icons/md';

const Navigation: React.FC = () => {
    const location = useLocation();
    const match = location.pathname.match(/\/(write|world)\/(\d+)/);
    const storyId = match ? match[2] : null;

    const worldLink = storyId ? `/world/${storyId}` : '/world';
    const writeLink = storyId ? `/write/${storyId}` : '/stories';

    if (location.pathname === '/write') return null;

    return (
        <Navbar expand="lg" variant="dark" className="py-3 sticky-top">
            <Container fluid className="px-4">
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold">
                    <MdBook className="me-2 text-primary" size={24} />
                    BookWiki
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to={worldLink} className={`d-flex align-items-center me-3 ${location.pathname.startsWith('/world') ? 'active text-light' : ''}`}>
                            <MdPublic className="me-1" /> Worldbuilding
                        </Nav.Link>
                        <Nav.Link as={Link} to={writeLink} className={`d-flex align-items-center ${location.pathname.startsWith('/write') || location.pathname === '/stories' ? 'active text-light' : ''}`}>
                            <MdEdit className="me-1" /> Writing
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;