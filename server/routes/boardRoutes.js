const express = require('express');
const router = express.Router();
const {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  archiveBoard,
} = require('../controllers/boardController');
const auth = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getBoards)
  .post(createBoard);

router.route('/:id')
  .put(updateBoard)
  .delete(deleteBoard);

router.put('/:id/archive', archiveBoard);

module.exports = router;