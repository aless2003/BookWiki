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
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/world/:storyId" element={<Worldbuilding />} />
        <Route path="/world" element={<StorySelector mode="world" />} />
        <Route path="/stories" element={<StorySelector mode="write" />} />
        <Route path="/write/:storyId" element={<Writing />} />
      </Routes>
    </>
  );
}

export default App;
