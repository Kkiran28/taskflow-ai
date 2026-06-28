const Board = require('../models/Board');
const Task = require('../models/Tasks');

// @desc    Get all boards
// @route   GET /api/boards
// @access  Private
exports.getBoards = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const boards = await Board.find({ 
      owner: userId,
      isArchived: false,
    }).sort({ createdAt: -1 });
    
    // Get task counts for each board
    const boardsWithCounts = await Promise.all(
      boards.map(async (board) => {
        const taskCount = await Task.countDocuments({ board: board._id });
        const dueThisWeek = await Task.countDocuments({
          board: board._id,
          dueDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: 'done' },
        });
        const completedTasks = await Task.countDocuments({
          board: board._id,
          status: 'done',
        });
        const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;
        
        return {
          ...board.toObject(),
          taskCount,
          dueThisWeek,
          progress,
        };
      })
    );

    res.status(200).json({
      success: true,
      boards: boardsWithCounts,
    });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create board
// @route   POST /api/boards
// @access  Private
exports.createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a board title',
      });
    }

    const board = await Board.create({
      title,
      description,
      owner: req.user?.id || req.userId,
    });

    res.status(201).json({
      success: true,
      board,
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
exports.updateBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    const board = await Board.findOne({ _id: req.params.id, owner: req.user?.id || req.userId });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    board.title = title || board.title;
    board.description = description !== undefined ? description : board.description;
    await board.save();

    res.status(200).json({
      success: true,
      board,
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user?.id || req.userId });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Delete all tasks in the board
    await Task.deleteMany({ board: board._id });
    await board.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Board deleted successfully',
    });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Archive board
// @route   PUT /api/boards/:id/archive
// @access  Private
exports.archiveBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user?.id || req.userId });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    board.isArchived = true;
    await board.save();

    res.status(200).json({
      success: true,
      message: 'Board archived successfully',
    });
  } catch (error) {
    console.error('Archive board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};