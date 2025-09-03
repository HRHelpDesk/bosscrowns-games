import React from 'react';
import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import { UserDataProvider } from './context/UserDataContext';
import CrownMatchGame from './components/CrownMatchGame';
import WigJeopardy from './components/WigJeopardy';
import './App.css';
import CustomAppBar from './components/CustomAppBar';
import ColorSwatches from './components/ColorIndex';

function App() {
  return (
    <UserDataProvider>
      <HashRouter>
        <div className="App">
           <CustomAppBar />
          <Routes>
            <Route path="/jeopardy" element={<WigJeopardy />} />
            <Route path="/match-game" element={<CrownMatchGame />} />
            <Route path="/color-index" element={<ColorSwatches />} />
            <Route path="/" element={<CrownMatchGame />} /> {/* Default route */}
          </Routes>
        </div>
      </HashRouter>
    </UserDataProvider>
  );
}

export default App;