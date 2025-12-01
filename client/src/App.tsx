import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SessionPage from './pages/SessionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/session/:id" element={<SessionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
