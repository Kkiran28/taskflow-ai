const mongoose = require('mongoose');
const { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } = require('../config/constants');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    status: {
      type: String,
      enum: TASK_STATUS_OPTIONS,
      default: 'todo',
    },
    priority: {
      type: String,
      enum: TASK_PRIORITY_OPTIONS,
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    estimatedEffort: {
      type: Number, // in hours
      min: [0, 'Effort cannot be negative'],
      max: [100, 'Effort cannot exceed 100 hours'],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    aiSuggestions: {
      effort: Number,
      dueDate: Date,
      reasoning: String,
      generatedAt: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
taskSchema.index({ board: 1, status: 1, order: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);