import React, { createContext, useContext, useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { boardService } from '../services/boardService';

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all tasks from all boards
  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      const boardsResult = await boardService.getBoards();
      const boardsData = boardsResult.boards || [];
      setBoards(boardsData);

      let allTasks = [];
      for (const board of boardsData) {
        try {
          const tasksResult = await taskService.getTasksByBoard(board._id);
          const boardTasks = (tasksResult.tasks || []).map(task => ({
            ...task,
            boardId: board._id,
            boardTitle: board.title,
            date: task.dueDate ? new Date(task.dueDate) : new Date(),
            status: task.status || 'pending',
            priority: task.priority || 'medium'
          }));
          allTasks = [...allTasks, ...boardTasks];
        } catch (err) {
          console.error(`Error fetching tasks for board ${board._id}:`, err);
        }
      }
      setTasks(allTasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add task
  const addTask = async (boardId, taskData) => {
    try {
      const result = await taskService.createTask(boardId, taskData);
      await fetchAllTasks(); // Refresh all tasks
      return result;
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };

  // Update task
  const updateTask = async (taskId, taskData) => {
    try {
      const result = await taskService.updateTask(taskId, taskData);
      await fetchAllTasks(); // Refresh all tasks
      return result;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      const result = await taskService.deleteTask(taskId);
      await fetchAllTasks(); // Refresh all tasks
      return result;
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  // Get tasks by date
  const getTasksByDate = (date) => {
    const targetDate = new Date(date);
    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.date);
      return taskDate.getDate() === targetDate.getDate() &&
             taskDate.getMonth() === targetDate.getMonth() &&
             taskDate.getFullYear() === targetDate.getFullYear();
    });
  };

  // Get tasks by status
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  // Get task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending' || t.status === 'todo').length;
    const overdue = tasks.filter(t => {
      const dueDate = t.dueDate ? new Date(t.dueDate) : new Date(t.date);
      return dueDate < new Date() && t.status !== 'completed' && t.status !== 'done';
    }).length;
    
    return { total, completed, inProgress, pending, overdue };
  };

  // Get tasks for a specific board
  const getTasksForBoard = (boardId) => {
    return tasks.filter(task => task.boardId === boardId);
  };

  // Initial load
  useEffect(() => {
    fetchAllTasks();
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks,
      boards,
      loading,
      error,
      fetchAllTasks,
      addTask,
      updateTask,
      deleteTask,
      getTasksByDate,
      getTasksByStatus,
      getTaskStats,
      getTasksForBoard,
      setTasks // For local updates
    }}>
      {children}
    </TaskContext.Provider>
  );
};