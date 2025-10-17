const { GoogleGenerativeAI } = require('@google/generative-ai');
const Task = require('../models/Task');
const Project = require('../models/Project');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Summarize project tasks
// @route   POST /api/ai/summarize/:projectId
const summarizeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId });
    
    if (tasks.length === 0) {
      return res.json({ summary: 'No tasks found in this project.' });
    }

    const taskSummary = tasks.map(task => 
      `- ${task.title} (${task.status}): ${task.description || 'No description'}`
    ).join('\n');

    const prompt = `
      Please provide a concise summary of this project and its tasks.
      
      Project: ${project.name}
      Description: ${project.description}
      
      Tasks:
      ${taskSummary}
      
      Please provide:
      1. A brief overall project status
      2. Breakdown of tasks by status
      3. Any notable observations or suggestions
      
      Keep it under 200 words and be professional.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ summary });
  } catch (error) {
    console.error('AI Summarization Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate summary',
      error: error.message 
    });
  }
};

// @desc    Ask question about tasks
// @route   POST /api/ai/ask/:projectId
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId });
    
    const taskContext = tasks.map(task => 
      `Task: ${task.title} | Status: ${task.status} | Description: ${task.description || 'None'}`
    ).join('\n');

    const prompt = `
      Project Context:
      Project Name: ${project.name}
      Project Description: ${project.description}
      
      Tasks in this project:
      ${taskContext}
      
      User Question: ${question}
      
      Please answer the question based on the project and task information above.
      If the question cannot be answered with the available information, please say so.
      Keep your response helpful and concise.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    res.json({ question, answer });
  } catch (error) {
    console.error('AI Question Error:', error);
    res.status(500).json({ 
      message: 'Failed to process question',
      error: error.message 
    });
  }
};

module.exports = {
  summarizeProject,
  askQuestion
};