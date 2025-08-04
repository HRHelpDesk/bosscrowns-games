import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserDataProvider } from './context/UserDataContext';
import CrownMatchGame from './components/match-game';
import WigJeopardy from './components/WigJeopardy';
import './App.css';

function App() {
  return (
    <UserDataProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/jeopardy" element={<WigJeopardy />} />
            <Route path="/match-game" element={<CrownMatchGame />} />
            <Route path="/" element={<CrownMatchGame />} /> {/* Default route */}
          </Routes>
        </div>
      </Router>
    </UserDataProvider>
  );
}

export default App;