import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} /> {/* Catch-all route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
