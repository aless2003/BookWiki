import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Worldbuilding from './pages/Worldbuilding';
import Writing from './pages/Writing';
import StorySelector from './pages/StorySelector';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_BASE_URL } from './constants/api';

function BackendStatusGuard({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let isMounted = true;
    
    const checkBackend = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      try {
        const response = await fetch(`${API_BASE_URL}/api/stories`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok && isMounted) {
          setIsReady(true);
          return;
        }
      } catch (err) {
        // Not ready yet or timeout
      }
      if (isMounted) {
        setAttempts(prev => prev + 1);
      }
    };

    checkBackend();
    interval = setInterval(checkBackend, 3000); // Poll every 3 seconds to be less aggressive

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-light">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h3>Starting BookWiki...</h3>
        <p className="text-muted">Waiting for backend services to initialize (Attempt {attempts})</p>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Set global dark theme for Bootstrap 5.3+
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  }, []);

  return (
    <BackendStatusGuard>
      <div className="vh-100 d-flex flex-column overflow-hidden">
        <Navigation />
        <div className="flex-grow-1 overflow-hidden position-relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/world/:storyId" element={<Worldbuilding />} />
            <Route path="/world" element={<StorySelector mode="world" />} />
            <Route path="/stories" element={<StorySelector mode="write" />} />
            <Route path="/write/:storyId" element={<Writing />} />
          </Routes>
        </div>
      </div>
    </BackendStatusGuard>
  );
}

export default App;
