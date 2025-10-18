import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../services/api';
import '../styles/ProjectList.css';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject(formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <div className="project-list">
      <div className="project-header">
        <h2>My Projects</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + New Project
        </button>
      </div>

      {showForm && (
        <div className="project-form-overlay">
          <div className="project-form">
            <h3>Create New Project</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Project Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <div className="form-actions">
                <button type="submit" className="btn-primary">Create</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <div className="project-info">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <small>Created: {new Date(project.createdAt).toLocaleDateString()}</small>
            </div>
            <div className="project-actions">
              <button 
                className="btn-primary"
                onClick={() => navigate(`/project/${project._id}`)}
              >
                Open Board
              </button>
              <button 
                className="btn-danger"
                onClick={() => handleDelete(project._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="empty-state">
          <p>No projects yet. Create your first project to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;