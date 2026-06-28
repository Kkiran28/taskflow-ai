const express = require('express');
const router = express.Router();
const {
  getTasksByBoard,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getAISuggestion,
  reorderTasks,
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/board/:boardId', getTasksByBoard);
router.post('/', createTask);
router.post('/suggest', getAISuggestion);
router.put('/reorder', reorderTasks);
router.put('/:id', updateTask);
router.put('/:id/move', moveTask);
router.delete('/:id', deleteTask);

module.exports = router;