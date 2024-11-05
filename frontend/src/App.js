import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Projects from './components/Projects';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Projects />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;