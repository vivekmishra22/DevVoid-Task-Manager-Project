const Task = require('../models/Task');

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .sort({ position: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    // Get the highest position for the project to place new task at the bottom
    const highestPositionTask = await Task.findOne({ projectId: req.body.projectId })
      .sort({ position: -1 });
    
    const position = highestPositionTask ? highestPositionTask.position + 1 : 0;
    
    const task = await Task.create({
      ...req.body,
      position
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update task position (for drag and drop)
// @route   PUT /api/tasks/:id/position
const updateTaskPosition = async (req, res) => {
  try {
    const { status, position } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, position },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasksByProject,
  createTask,
  updateTask,
  updateTaskPosition,
  deleteTask
};