const Task = require('../models/Tasks');
const Board = require('../models/Board');
const aiService = require('../ai/geminiService');
const { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } = require('../config/constants');

// @desc    Get all tasks for a board
// @route   GET /api/tasks/board/:boardId
// @access  Private
exports.getTasksByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, owner: req.user.id });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    const tasks = await Task.find({ board: boardId, owner: req.user.id })
      .sort({ order: 1, createdAt: 1 });

    // Group tasks by status
    const groupedTasks = {
      todo: tasks.filter(task => task.status === 'todo'),
      'in-progress': tasks.filter(task => task.status === 'in-progress'),
      done: tasks.filter(task => task.status === 'done'),
    };

    res.status(200).json({
      success: true,
      tasks,
      groupedTasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, boardId, estimatedEffort } = req.body;

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, owner: req.user.id });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      estimatedEffort,
      board: boardId,
      owner: req.user.id,
      order: await Task.countDocuments({ board: boardId }),
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, estimatedEffort } = req.body;
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status && TASK_STATUS_OPTIONS.includes(status)) task.status = status;
    if (priority && TASK_PRIORITY_OPTIONS.includes(priority)) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (estimatedEffort !== undefined) task.estimatedEffort = estimatedEffort;

    // If task is completed
    if (status === 'done' && !task.completedAt) {
      task.completedAt = new Date();
    }

    await task.save();

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Move task to different status/order
// @route   PUT /api/tasks/:id/move
// @access  Private
exports.moveTask = async (req, res) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (status && TASK_STATUS_OPTIONS.includes(status)) {
      task.status = status;
    }

    if (order !== undefined) {
      task.order = order;
    }

    await task.save();

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get AI suggestion for task
// @route   POST /api/tasks/suggest
// @access  Private
exports.getAISuggestion = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const suggestion = await aiService.generateSuggestion(title, description);

    res.status(200).json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service temporarily unavailable',
    });
  }
};

// @desc    Update task order for drag & drop
// @route   PUT /api/tasks/reorder
// @access  Private
exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

    // Update each task's order
    const updates = tasks.map(({ id, status, order }) =>
      Task.findOneAndUpdate(
        { _id: id, owner: req.user.id },
        { status, order },
        { new: true }
      )
    );

    const updatedTasks = await Promise.all(updates);

    res.status(200).json({
      success: true,
      tasks: updatedTasks,
    });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};