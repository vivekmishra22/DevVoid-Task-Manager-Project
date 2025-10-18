import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import KanbanBoard from './pages/KanbanBoard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>Project Task Manager</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/project/:projectId" element={<KanbanBoard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;