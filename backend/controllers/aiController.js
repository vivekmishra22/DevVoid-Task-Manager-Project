const Task = require('../models/Task');
const Project = require('../models/Project');

// Simple mock AI that always works
const generateAISummary = (project, tasks) => {
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const progressTasks = tasks.filter(t => t.status === 'inProgress');
  const doneTasks = tasks.filter(t => t.status === 'done');
  
  return `**Project: ${project.name}**

📊 **Project Status Report:**
• Total Tasks: ${tasks.length}
• To Do: ${todoTasks.length} tasks
• In Progress: ${progressTasks.length} tasks  
• Completed: ${doneTasks.length} tasks

🎯 **Current Focus:**
${progressTasks.length > 0 ? 
  `Working on: ${progressTasks.map(t => t.title).join(', ')}` : 
  'No tasks in progress. Consider starting some tasks!'}

✅ **Recent Completions:**
${doneTasks.length > 0 ? 
  `Completed: ${doneTasks.map(t => t.title).join(', ')}` : 
  'No tasks completed yet.'}

💡 **Recommendation:**
${getRecommendation(todoTasks.length, progressTasks.length, doneTasks.length)}

---
*AI Project Analysis Complete*`;
};

const getRecommendation = (todo, progress, done) => {
  if (progress === 0 && todo > 0) {
    return "Start working on your todo tasks to build momentum. Consider beginning with the highest priority item.";
  } else if (done === 0 && progress > 0) {
    return "Focus on completing your in-progress tasks to show tangible progress.";
  } else if (done > 0 && progress > 0) {
    return "Great balanced progress! Continue working while celebrating your completions.";
  } else if (todo === 0 && progress === 0 && done > 0) {
    return "Excellent! All tasks completed. Consider adding new objectives or reviewing the project.";
  } else {
    return "Maintain consistent progress by balancing new starts with completions.";
  }
};

const generateAIAnswer = (project, tasks, question) => {
  const questionLower = question.toLowerCase();
  
  // Handle different question types
  if (questionLower.includes('progress') || questionLower.includes('working on')) {
    const progressTasks = tasks.filter(t => t.status === 'inProgress');
    if (progressTasks.length === 0) {
      return "There are no tasks currently in progress. All tasks are either completed or waiting to be started.";
    }
    return `**Tasks Currently in Progress (${progressTasks.length}):**\n\n${progressTasks.map((t, i) => `${i + 1}. **${t.title}**${t.description ? `\n   - ${t.description}` : ''}`).join('\n\n')}`;
  }
  
  if (questionLower.includes('todo') || questionLower.includes('pending')) {
    const todoTasks = tasks.filter(t => t.status === 'todo');
    if (todoTasks.length === 0) {
      return "Excellent! There are no pending tasks. All tasks have been started or completed.";
    }
    return `**Pending Tasks (${todoTasks.length}):**\n\n${todoTasks.map((t, i) => `${i + 1}. **${t.title}**${t.description ? `\n   - ${t.description}` : ''}`).join('\n\n')}`;
  }
  
  if (questionLower.includes('done') || questionLower.includes('complete')) {
    const doneTasks = tasks.filter(t => t.status === 'done');
    if (doneTasks.length === 0) {
      return "No tasks have been completed yet. Focus on moving tasks from 'In Progress' to 'Done'.";
    }
    return `**Completed Tasks (${doneTasks.length}):**\n\n${doneTasks.map((t, i) => `${i + 1}. **${t.title}**${t.description ? `\n   - ${t.description}` : ''}`).join('\n\n')}`;
  }
  
  if (questionLower.includes('how many') || questionLower.includes('count')) {
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const progressCount = tasks.filter(t => t.status === 'inProgress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    
    return `**Task Breakdown:**\n\n• 📝 To Do: ${todoCount} tasks\n• 🔄 In Progress: ${progressCount} tasks\n• ✅ Completed: ${doneCount} tasks\n\n**Total: ${tasks.length} tasks**`;
  }
  
  if (questionLower.includes('priority') || questionLower.includes('next')) {
    const todoTasks = tasks.filter(t => t.status === 'todo');
    if (todoTasks.length === 0) {
      return "All tasks have been started! Focus on completing the in-progress items.";
    }
    return `Based on your task list, I recommend starting with: **"${todoTasks[0].title}"**\n\nConsider these factors when prioritizing:\n• Urgency and deadlines\n• Dependencies between tasks\n• Estimated effort required\n• Business impact`;
  }
  
  // Default response for other questions
  return `I've analyzed your project **"${project.name}"** which has ${tasks.length} total tasks.\n\nI can help you with:\n• Task status and progress updates\n• Priority recommendations  \n• Workload distribution analysis\n• Project completion insights\n\nTry asking about specific tasks or progress!`;
};

// Controller functions
const summarizeProject = async (req, res) => {
  try {
    console.log('🔍 AI Summary requested for project:', req.params.projectId);
    
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId });
    
    if (tasks.length === 0) {
      return res.json({ 
        summary: "This project doesn't have any tasks yet. Add some tasks to get a detailed AI analysis!" 
      });
    }

    const summary = generateAISummary(project, tasks);
    
    console.log('✅ AI Summary generated successfully');
    res.json({ summary });
    
  } catch (error) {
    console.error('❌ Error generating summary:', error);
    res.status(500).json({ 
      message: 'Unable to generate summary at this time. Please try again.' 
    });
  }
};

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    const { projectId } = req.params;
    
    console.log('🤔 AI Question:', question, 'for project:', projectId);
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ message: 'Please provide a question' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ projectId });
    
    if (tasks.length === 0) {
      return res.json({ 
        question,
        answer: "This project doesn't have any tasks yet. Add some tasks first, then I can provide detailed insights and answers!"
      });
    }

    const answer = generateAIAnswer(project, tasks, question);
    
    console.log('✅ AI Question answered successfully');
    res.json({ question, answer });
    
  } catch (error) {
    console.error('❌ Error answering question:', error);
    res.status(500).json({ 
      message: 'Unable to process your question at this time. Please try again.' 
    });
  }
};

module.exports = {
  summarizeProject,
  askQuestion
};


// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const Task = require('../models/Task');
// const Project = require('../models/Project');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // @desc    Summarize project tasks
// // @route   POST /api/ai/summarize/:projectId
// const summarizeProject = async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.projectId);
//     if (!project) {
//       return res.status(404).json({ message: 'Project not found' });
//     }

//     const tasks = await Task.find({ projectId: req.params.projectId });
    
//     if (tasks.length === 0) {
//       return res.json({ summary: 'No tasks found in this project.' });
//     }

//     const taskSummary = tasks.map(task => 
//       `- ${task.title} (${task.status}): ${task.description || 'No description'}`
//     ).join('\n');

//     const prompt = `
//       Please provide a concise summary of this project and its tasks.
      
//       Project: ${project.name}
//       Description: ${project.description}
      
//       Tasks:
//       ${taskSummary}
      
//       Please provide:
//       1. A brief overall project status
//       2. Breakdown of tasks by status
//       3. Any notable observations or suggestions
      
//       Keep it under 200 words and be professional.
//     `;

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const summary = response.text();

//     res.json({ summary });
//   } catch (error) {
//     console.error('AI Summarization Error:', error);
//     res.status(500).json({ 
//       message: 'Failed to generate summary',
//       error: error.message 
//     });
//   }
// };

// // @desc    Ask question about tasks
// // @route   POST /api/ai/ask/:projectId
// const askQuestion = async (req, res) => {
//   try {
//     const { question } = req.body;
    
//     if (!question) {
//       return res.status(400).json({ message: 'Question is required' });
//     }

//     const project = await Project.findById(req.params.projectId);
//     if (!project) {
//       return res.status(404).json({ message: 'Project not found' });
//     }

//     const tasks = await Task.find({ projectId: req.params.projectId });
    
//     const taskContext = tasks.map(task => 
//       `Task: ${task.title} | Status: ${task.status} | Description: ${task.description || 'None'}`
//     ).join('\n');

//     const prompt = `
//       Project Context:
//       Project Name: ${project.name}
//       Project Description: ${project.description}
      
//       Tasks in this project:
//       ${taskContext}
      
//       User Question: ${question}
      
//       Please answer the question based on the project and task information above.
//       If the question cannot be answered with the available information, please say so.
//       Keep your response helpful and concise.
//     `;

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const answer = response.text();

//     res.json({ question, answer });
//   } catch (error) {
//     console.error('AI Question Error:', error);
//     res.status(500).json({ 
//       message: 'Failed to process question',
//       error: error.message 
//     });
//   }
// };

// module.exports = {
//   summarizeProject,
//   askQuestion
// };