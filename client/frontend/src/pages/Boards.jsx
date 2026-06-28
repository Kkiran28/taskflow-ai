import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ListTodo,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { boardService } from '../services/boardService';
import { taskService } from '../services/taskService';
import { useTheme } from '../context/ThemeContext';

const Boards = () => {
  const { darkMode } = useTheme(); // ✅ Added theme context
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: ''
  });
  const [boardTasks, setBoardTasks] = useState({});
  const [loadingTasks, setLoadingTasks] = useState({});
  const [activeTabs, setActiveTabs] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: boardService.getBoards,
  });

  const fetchBoardTasks = async (boardId) => {
    if (loadingTasks[boardId]) return;
    setLoadingTasks(prev => ({ ...prev, [boardId]: true }));
    try {
      const result = await taskService.getTasksByBoard(boardId);
      setBoardTasks(prev => ({ ...prev, [boardId]: result.tasks || [] }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(prev => ({ ...prev, [boardId]: false }));
    }
  };

  const createMutation = useMutation({
    mutationFn: boardService.createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries(['boards']);
      toast.success('Board created successfully! 🎉');
      setShowCreateModal(false);
      setFormData({ title: '', description: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create board');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => boardService.updateBoard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['boards']);
      toast.success('Board updated successfully!');
      setEditingBoard(null);
      setFormData({ title: '', description: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update board');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: boardService.deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries(['boards']);
      toast.success('Board deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete board');
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: ({ boardId, data }) => taskService.createTask({ ...data, boardId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['boards']);
      fetchBoardTasks(variables.boardId);
      toast.success('Task created successfully! 🎉');
      setShowTaskModal(false);
      setTaskFormData({ title: '', description: '', status: 'todo', dueDate: '' });
      setEditingTask(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => taskService.updateTask(taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['boards']);
      const boardId = Object.keys(boardTasks).find(key =>
        boardTasks[key].some(task => task._id === variables.taskId)
      );
      if (boardId) {
        fetchBoardTasks(boardId);
      }
      toast.success('Task updated successfully!');
      setShowTaskModal(false);
      setTaskFormData({ title: '', description: '', status: 'todo', dueDate: '' });
      setEditingTask(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries(['boards']);
      const boardId = Object.keys(boardTasks).find(key =>
        boardTasks[key].some(task => task._id === taskId)
      );
      if (boardId) {
        fetchBoardTasks(boardId);
      }
      toast.success('Task deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBoard) {
      updateMutation.mutate({ id: editingBoard._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this board? All tasks will be lost.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (board) => {
    setEditingBoard(board);
    setFormData({ title: board.title, description: board.description || '' });
    setShowCreateModal(true);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      title: taskFormData.title,
      description: taskFormData.description || '',
      status: taskFormData.status,
      dueDate: taskFormData.dueDate || undefined
    };

    if (editingTask) {
      updateTaskMutation.mutate({
        taskId: editingTask._id,
        data: taskData
      });
    } else {
      createTaskMutation.mutate({
        boardId: selectedBoard._id,
        data: taskData
      });
    }
  };

  const handleTaskStatusChange = (task, newStatus) => {
    updateTaskMutation.mutate({
      taskId: task._id,
      data: { ...task, status: newStatus }
    });
  };

  const handleTaskDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setShowTaskModal(true);
  };

  const boards = data?.boards || [];

  const calculateBoardProgress = (boardId) => {
    const tasks = boardTasks[boardId] || [];
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
      case 'completed':
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />;
      case 'todo':
        return <ListTodo className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'medium': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'low': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getTasksByStatus = (tasks, status) => {
    return tasks.filter(task => task.status === status);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBoards = boards.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(boards.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Boards</h1>
        <button
          onClick={() => {
            setEditingBoard(null);
            setFormData({ title: '', description: '' });
            setShowCreateModal(true);
          }}
          className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base px-3 sm:px-4 py-2 w-full xs:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Create Board</span>
        </button>
      </div>

      {/* Boards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : boards.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {currentBoards.map((board) => {
              const progress = calculateBoardProgress(board._id);
              const tasks = boardTasks[board._id] || [];
              const completed = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;

              const todoTasks = getTasksByStatus(tasks, 'todo');
              const inProgressTasks = getTasksByStatus(tasks, 'in-progress');
              const completedTasks = getTasksByStatus(tasks, 'done');

              const hasTasks = tasks.length > 0;

              return (
                <div key={board._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 group hover:shadow-md transition-shadow">
                  <Link to={`/boards/${board._id}`} className="block">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base truncate">
                          {board.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {board.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-0.5 sm:space-x-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleEdit(board);
                          }}
                          className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(board._id);
                          }}
                          className="p-1 sm:p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {tasks.length} Tasks
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {completed} Done
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Task Overview */}
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                        Task Overview
                      </span>
                      <button
                        onClick={() => {
                          setSelectedBoard(board);
                          setEditingTask(null);
                          setTaskFormData({
                            title: '',
                            description: '',
                            status: 'todo',
                            dueDate: ''
                          });
                          setShowTaskModal(true);
                          fetchBoardTasks(board._id);
                        }}
                        className="text-[10px] sm:text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 sm:gap-1"
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Add Task
                      </button>
                    </div>

                    {hasTasks ? (
                      <div className="space-y-2 sm:space-y-3">
                        {/* Tabs - Responsive */}
                        <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto -mx-1 sm:mx-0 px-1 sm:px-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveTabs(prev => ({ ...prev, [board._id]: 'todo' }));
                            }}
                            className={`flex-1 px-1 sm:px-2 py-1 text-[9px] sm:text-[11px] font-semibold text-center border-b-2 transition-all whitespace-nowrap ${
                              (activeTabs[board._id] || 'todo') === 'todo'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600'
                            }`}
                          >
                            To Do ({todoTasks.length})
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveTabs(prev => ({ ...prev, [board._id]: 'in-progress' }));
                            }}
                            className={`flex-1 px-1 sm:px-2 py-1 text-[9px] sm:text-[11px] font-semibold text-center border-b-2 transition-all whitespace-nowrap ${
                              activeTabs[board._id] === 'in-progress'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600'
                            }`}
                          >
                            In Progress ({inProgressTasks.length})
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveTabs(prev => ({ ...prev, [board._id]: 'done' }));
                            }}
                            className={`flex-1 px-1 sm:px-2 py-1 text-[9px] sm:text-[11px] font-semibold text-center border-b-2 transition-all whitespace-nowrap ${
                              activeTabs[board._id] === 'done'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600'
                            }`}
                          >
                            Done ({completedTasks.length})
                          </button>
                        </div>

                        {/* Tab Contents - Responsive */}
                        <div className="max-h-36 sm:max-h-48 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
                          {(activeTabs[board._id] || 'todo') === 'todo' && (
                            todoTasks.length > 0 ? (
                              todoTasks.map((task) => (
                                <div key={task._id} className="flex items-center justify-between text-[10px] sm:text-xs p-1 sm:p-1.5 rounded bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleTaskStatusChange(task, 'in-progress');
                                      }}
                                      className="flex-shrink-0 hover:scale-110 transition-transform text-gray-400 hover:text-blue-500"
                                      title="Move to In Progress"
                                    >
                                      {getStatusIcon(task.status)}
                                    </button>
                                    <span className="truncate text-gray-700 dark:text-gray-300 font-medium text-[10px] sm:text-xs">
                                      {task.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0 ml-1">
                                    <span className={`text-[7px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-full font-semibold uppercase ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleEditTask(task);
                                      }}
                                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                      title="Edit Task"
                                    >
                                      <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleTaskDelete(task._id);
                                      }}
                                      className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 text-center py-3 sm:py-4">
                                No tasks in To Do
                              </p>
                            )
                          )}

                          {activeTabs[board._id] === 'in-progress' && (
                            inProgressTasks.length > 0 ? (
                              inProgressTasks.map((task) => (
                                <div key={task._id} className="flex items-center justify-between text-[10px] sm:text-xs p-1 sm:p-1.5 rounded bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleTaskStatusChange(task, 'done');
                                      }}
                                      className="flex-shrink-0 hover:scale-110 transition-transform text-blue-500 hover:text-green-500"
                                      title="Mark as Completed"
                                    >
                                      {getStatusIcon(task.status)}
                                    </button>
                                    <span className="truncate text-gray-700 dark:text-gray-300 font-medium text-[10px] sm:text-xs">
                                      {task.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0 ml-1">
                                    <span className={`text-[7px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-full font-semibold uppercase ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleEditTask(task);
                                      }}
                                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                      title="Edit Task"
                                    >
                                      <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleTaskDelete(task._id);
                                      }}
                                      className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 text-center py-3 sm:py-4">
                                No tasks in Progress
                              </p>
                            )
                          )}

                          {activeTabs[board._id] === 'done' && (
                            completedTasks.length > 0 ? (
                              completedTasks.map((task) => (
                                <div key={task._id} className="flex items-center justify-between text-[10px] sm:text-xs p-1 sm:p-1.5 rounded bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleTaskStatusChange(task, 'todo');
                                      }}
                                      className="flex-shrink-0 hover:scale-110 transition-transform text-green-500 hover:text-gray-400"
                                      title="Move to To Do"
                                    >
                                      {getStatusIcon(task.status)}
                                    </button>
                                    <span className="truncate line-through text-gray-400 dark:text-gray-500 font-medium text-[10px] sm:text-xs">
                                      {task.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0 ml-1">
                                    <span className={`text-[7px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-full font-semibold uppercase ${getPriorityColor(task.priority)} opacity-60`}>
                                      {task.priority}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleEditTask(task);
                                      }}
                                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                      title="Edit Task"
                                    >
                                      <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleTaskDelete(task._id);
                                      }}
                                      className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 text-center py-3 sm:py-4">
                                No completed tasks yet
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 text-center py-3 sm:py-4">
                        No tasks yet. Click "Add Task" to get started!
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 sm:gap-2 mt-4 sm:mt-6">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }
                return (
                  <button
                    key={index}
                    onClick={() => paginate(pageNumber)}
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-gray-400 dark:text-gray-600">...</span>
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No boards yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first board to start organizing tasks
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Board
          </button>
        </div>
      )}

      {/* Create/Edit Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-4 sm:p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingBoard ? 'Edit Board' : 'Create New Board'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Board Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="e.g., Project Alpha"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base"
                    rows="3"
                    placeholder="Describe your board..."
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingBoard(null);
                    setFormData({ title: '', description: '' });
                  }}
                  className="px-4 py-2 w-full sm:w-auto text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium text-center text-sm sm:text-base"
                >
                  {editingBoard ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-4 sm:p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingTask ? '✏️ Edit Task' : '➕ Create New Task'}
            </h2>

            <form onSubmit={handleTaskSubmit}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={taskFormData.title}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskFormData.description}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base"
                    rows="2 sm:rows-3"
                    placeholder="Task description..."
                  />
                </div>

                {/* Status Field */}
                <div className="border-2 border-purple-400 rounded-lg p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    📊 Status
                  </label>
                  <select
                    value={taskFormData.status}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    <option value="todo">📋 To Do</option>
                    <option value="in-progress">🚀 In Progress</option>
                    <option value="done">✅ Completed</option>
                  </select>
                  <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 mt-1.5 sm:mt-2">
                    💡 Select status to move task to the correct column
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    📅 Due Date
                  </label>
                  <input
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    setTaskFormData({
                      title: "",
                      description: "",
                      status: "todo",
                      dueDate: "",
                    });
                  }}
                  className="px-4 py-2 w-full sm:w-auto text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    createTaskMutation.isPending ||
                    updateTaskMutation.isPending
                  }
                  className="px-4 py-2 w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium text-center text-sm sm:text-base"
                >
                  {editingTask ? "✅ Update Task" : "➕ Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4B5563' : '#D1D5DB'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6B7280' : '#9CA3AF'};
        }
        @media (max-width: 480px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 2px;
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Boards;