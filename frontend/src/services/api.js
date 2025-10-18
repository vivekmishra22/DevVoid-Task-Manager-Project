import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Project APIs
export const getProjects = () => API.get('/projects');
export const createProject = (projectData) => API.post('/projects', projectData);
export const updateProject = (id, projectData) => API.put(`/projects/${id}`, projectData);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Task APIs
export const getTasksByProject = (projectId) => API.get(`/tasks/project/${projectId}`);
export const createTask = (taskData) => API.post('/tasks', taskData);
export const updateTask = (id, taskData) => API.put(`/tasks/${id}`, taskData);
export const updateTaskPosition = (id, positionData) => API.put(`/tasks/${id}/position`, positionData);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// AI APIs
export const summarizeProject = (projectId) => API.post(`/ai/summarize/${projectId}`);
export const askQuestion = (projectId, question) => API.post(`/ai/ask/${projectId}`, { question });

export default API;