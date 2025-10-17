const express = require('express');
const router = express.Router();
const {
  getTasksByProject,
  createTask,
  updateTask,
  updateTaskPosition,
  deleteTask
} = require('../controllers/taskController');

router.route('/project/:projectId')
  .get(getTasksByProject);

router.route('/')
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/position')
  .put(updateTaskPosition);

module.exports = router;