import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Worldbuilding from './pages/Worldbuilding';
import Writing from './pages/Writing';
import StorySelector from './pages/StorySelector';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  useEffect(() => {
    // Set global dark theme for Bootstrap 5.3+
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  }, []);

  return (
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
  );
}

export default App;
