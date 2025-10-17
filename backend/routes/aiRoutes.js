const express = require('express');
const router = express.Router();
const {
  summarizeProject,
  askQuestion
} = require('../controllers/aiController');

router.post('/summarize/:projectId', summarizeProject);
router.post('/ask/:projectId', askQuestion);

module.exports = router;