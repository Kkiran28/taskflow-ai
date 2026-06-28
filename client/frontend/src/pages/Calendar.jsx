import { useState, useEffect } from 'react';
import { 
  FaChevronLeft, FaChevronRight, FaPlus, FaTimes, 
  FaClock, FaFlag, FaUser, FaTag, FaCalendarAlt, 
  FaChevronDown, FaChevronUp, FaFilter, FaSearch, 
  FaEdit, FaTrash, FaSave, FaTimesCircle, FaCheckCircle, 
  FaCircle, FaBars
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { boardService } from '../services/boardService';

const Calendar = () => {
  const { darkMode } = useTheme();
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask,
    loading 
  } = useTasks();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'medium',
    status: 'pending',
    assignee: '',
    category: '',
    tags: '',
    boardId: ''
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load boards for task creation
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const result = await boardService.getBoards();
        const boardsList = result.boards || [];
        setBoards(boardsList);
        if (boardsList.length > 0) {
          setSelectedBoardId(boardsList[0]._id);
          setTaskFormData(prev => ({ ...prev, boardId: boardsList[0]._id }));
        }
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
    };
    fetchBoards();
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const shortDayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
    setSelectedTask(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
    setSelectedTask(null);
  };

  const goToYear = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setViewMode('month');
  };

  const getTasksForDate = (day) => {
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.date);
      return taskDate.getDate() === dateObj.getDate() &&
             taskDate.getMonth() === dateObj.getMonth() &&
             taskDate.getFullYear() === dateObj.getFullYear();
    });
  };

  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    return getTasksForDate(selectedDate);
  };

  const getSearchedTasks = () => {
    if (!searchQuery.trim()) return [];
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-blue-500';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      high: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      low: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
    };
    return badges[priority] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      todo: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return badges[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const closeTaskDetail = () => {
    setSelectedTask(null);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    setSelectedTask(null);
    setSearchQuery('');
    if (isMobile) {
      setIsSidebarOpen(true);
    }
  };

  const openAddTaskModal = (date = null) => {
    const defaultDate = date || selectedDate || new Date().getDate();
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), defaultDate);
    setTaskFormData({
      title: '',
      description: '',
      date: dateObj.toISOString().split('T')[0],
      time: '12:00',
      priority: 'medium',
      status: 'pending',
      assignee: '',
      category: '',
      tags: '',
      boardId: selectedBoardId || (boards.length > 0 ? boards[0]._id : '')
    });
    setEditingTask(null);
    setShowAddTask(true);
  };

  const openEditTaskModal = (task) => {
    const dateObj = task.dueDate ? new Date(task.dueDate) : new Date(task.date);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      date: dateObj.toISOString().split('T')[0],
      time: task.time || '12:00',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      assignee: task.assignee || '',
      category: task.category || '',
      tags: task.tags ? task.tags.join(', ') : '',
      boardId: task.boardId || selectedBoardId || (boards.length > 0 ? boards[0]._id : '')
    });
    setEditingTask(task);
    setShowAddTask(true);
  };

  const resetForm = () => {
    setTaskFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      priority: 'medium',
      status: 'pending',
      assignee: '',
      category: '',
      tags: '',
      boardId: selectedBoardId || (boards.length > 0 ? boards[0]._id : '')
    });
  };

  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData({
      ...taskFormData,
      [name]: value
    });
  };

  const saveTask = async () => {
    const { title, description, date, time, priority, status, assignee, category, tags, boardId } = taskFormData;
    
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (!date) {
      alert('Please select a date');
      return;
    }

    if (!boardId) {
      alert('Please select a board');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(date),
      time: time || '12:00',
      priority: priority || 'medium',
      status: status || 'pending',
      assignee: assignee.trim() || 'Unassigned',
      category: category.trim() || 'General',
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };

    try {
      if (editingTask) {
        await updateTask(editingTask._id, taskData);
      } else {
        await addTask(boardId, taskData);
      }
      setShowAddTask(false);
      setEditingTask(null);
      resetForm();
    } catch (error) {
      alert('Error saving task: ' + error.message);
    }
  };

  const deleteTaskHandler = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        setSelectedTask(null);
      } catch (error) {
        alert('Error deleting task: ' + error.message);
      }
    }
  };

  const getSidebarTasks = () => {
    if (searchQuery.trim()) {
      return getSearchedTasks();
    } else if (selectedDate) {
      return getTasksForDate(selectedDate);
    }
    return [];
  };

  const sidebarTasks = getSidebarTasks();

  const filteredSidebarTasks = sidebarTasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const getSidebarTitle = () => {
    if (searchQuery.trim()) {
      return `Search Results: "${searchQuery}"`;
    } else if (selectedDate) {
      return `Tasks for ${monthNames[currentDate.getMonth()]} ${selectedDate}`;
    }
    return 'Select a date';
  };

  const renderCalendar = () => {
    const days = [];
    const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className={`h-12 sm:h-16 md:h-20 border ${darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-100 bg-gray-50/30'}`}></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayTasks = getTasksForDate(day);
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentDate.getMonth() &&
                     new Date().getFullYear() === currentDate.getFullYear();
      const isSelected = selectedDate === day;

      days.push(
        <div 
          key={day} 
          className={`h-12 sm:h-16 md:h-20 border ${darkMode ? 'border-gray-700' : 'border-gray-100'} p-0.5 sm:p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all ${
            isToday ? darkMode ? 'bg-blue-900/30' : 'bg-blue-50' : ''
          } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <div className={`text-[10px] sm:text-xs font-medium flex items-center justify-between px-0.5 sm:px-1 ${
            isToday ? 'text-blue-600 dark:text-blue-400' : darkMode ? 'text-gray-200' : 'text-gray-700'
          } ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            <span>{day}</span>
            {dayTasks.length > 0 && (
              <span className={`text-[8px] sm:text-[10px] ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} px-1 sm:px-1.5 py-0.5 rounded-full`}>
                {dayTasks.length}
              </span>
            )}
          </div>
          <div className="mt-0.5 space-y-0.5 hidden sm:block">
            {dayTasks.slice(0, 2).map((task) => (
              <div 
                key={task._id || task.id} 
                className={`text-[8px] sm:text-[10px] flex items-center gap-0.5 p-0.5 rounded hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} cursor-pointer transition-colors truncate`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskClick(task);
                }}
              >
                <span className={`w-1 h-1 rounded-full inline-block flex-shrink-0 ${getPriorityColor(task.priority)}`}></span>
                <span className={`truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{task.title}</span>
              </div>
            ))}
            {dayTasks.length > 2 && (
              <div className="text-[8px] sm:text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                +{dayTasks.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    for (let i = days.length; i < totalSlots; i++) {
      days.push(
        <div key={`empty-end-${i}`} className={`h-12 sm:h-16 md:h-20 border ${darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-100 bg-gray-50/30'}`}></div>
      );
    }

    return days;
  };

  const renderTaskDetail = () => {
    if (!selectedTask) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn`}>
          <div className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between`}>
            <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Task Details</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => openEditTaskModal(selectedTask)}
                className={`p-1.5 sm:p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-colors`}
              >
                <FaEdit className="text-sm sm:text-base" />
              </button>
              <button 
                onClick={() => deleteTaskHandler(selectedTask._id || selectedTask.id)}
                className={`p-1.5 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full transition-colors`}
              >
                <FaTrash className="text-sm sm:text-base" />
              </button>
              <button 
                onClick={closeTaskDetail}
                className={`p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <FaTimes className="text-sm sm:text-base" />
              </button>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-4">
              <h4 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-600'}`}>{selectedTask.title}</h4>
              <span className={`text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border ${getPriorityBadge(selectedTask.priority)} self-start sm:self-auto`}>
                {selectedTask.priority}
              </span>
            </div>
            
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed`}>
              {selectedTask.description || 'No description provided.'}
            </p>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <FaCalendarAlt className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} w-3 h-3 sm:w-4 sm:h-4`} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-400'}>
                  {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No date set'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <FaClock className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} w-3 h-3 sm:w-4 sm:h-4`} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedTask.time || 'No time set'}</span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <FaUser className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} w-3 h-3 sm:w-4 sm:h-4`} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedTask.assignee || 'Unassigned'}</span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <FaTag className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} w-3 h-3 sm:w-4 sm:h-4`} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedTask.category || 'Uncategorized'}</span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <FaFlag className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} w-3 h-3 sm:w-4 sm:h-4`} />
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${getStatusBadge(selectedTask.status)}`}>
                  {selectedTask.status || 'pending'}
                </span>
              </div>
              
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} w-3 h-3 sm:w-4 sm:h-4 mt-0.5`}>#</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedTask.tags.map((tag, index) => (
                      <span key={index} className={`text-[10px] sm:text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} px-1.5 sm:px-2 py-0.5 rounded-full`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTask.boardTitle && (
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <FaBars className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} w-3 h-3 sm:w-4 sm:h-4`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedTask.boardTitle}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={async () => {
                  try {
                    const updatedTask = { ...selectedTask, status: 'completed' };
                    await updateTask(selectedTask._id || selectedTask.id, updatedTask);
                    setSelectedTask(updatedTask);
                  } catch (error) {
                    alert('Error updating task: ' + error.message);
                  }
                }}
                className="flex-1 bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedTask.status === 'completed' || selectedTask.status === 'done'}
              >
                <FaCheckCircle className="inline mr-1 sm:mr-2 text-xs sm:text-sm" />
                Mark Complete
              </button>
              <button 
                onClick={() => openEditTaskModal(selectedTask)}
                className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
              >
                <FaEdit className="inline mr-1 sm:mr-2 text-xs sm:text-sm" />
                Edit Task
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAddTaskModal = () => {
    if (!showAddTask) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn`}>
          <div className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between`}>
            <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            <button 
              onClick={() => {
                setShowAddTask(false);
                setEditingTask(null);
              }}
              className={`p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              <FaTimes className="text-sm sm:text-base" />
            </button>
          </div>
          
          <div className="p-4 sm:p-6">
            <form onSubmit={(e) => { e.preventDefault(); saveTask(); }}>
              <div className="space-y-3 sm:space-y-4">
                {/* Board Selection */}
                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Board *</label>
                  <select
                    name="boardId"
                    value={taskFormData.boardId}
                    onChange={handleTaskFormChange}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                    required
                  >
                    <option value="">Select a board</option>
                    {boards.map(board => (
                      <option key={board._id} value={board._id}>{board.title}</option>
                    ))}
                  </select>
                  {boards.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Please create a board first</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Task Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={taskFormData.title}
                    onChange={handleTaskFormChange}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Description</label>
                  <textarea
                    name="description"
                    value={taskFormData.description}
                    onChange={handleTaskFormChange}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder="Enter task description"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={taskFormData.date}
                      onChange={handleTaskFormChange}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Time</label>
                    <input
                      type="time"
                      name="time"
                      value={taskFormData.time}
                      onChange={handleTaskFormChange}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Priority</label>
                    <select
                      name="priority"
                      value={taskFormData.priority}
                      onChange={handleTaskFormChange}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Status</label>
                    <select
                      name="status"
                      value={taskFormData.status}
                      onChange={handleTaskFormChange}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                    >
                      <option value="todo">To Do</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Assignee</label>
                  <input
                    type="text"
                    name="assignee"
                    value={taskFormData.assignee}
                    onChange={handleTaskFormChange}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder="Enter assignee name"
                  />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={taskFormData.category}
                    onChange={handleTaskFormChange}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder="e.g., Work, Personal, Meeting"
                  />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={taskFormData.tags}
                    onChange={handleTaskFormChange}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder="e.g., urgent, design, client"
                  />
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm"
                  disabled={boards.length === 0}
                >
                  <FaSave className="text-xs sm:text-sm" />
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTask(false);
                    setEditingTask(null);
                  }}
                  className={`flex-1 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm`}
                >
                  <FaTimesCircle className="text-xs sm:text-sm" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen max-h-[100vh] overflow-hidden p-2 sm:p-3 md:p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2 sm:mb-3 md:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className={`text-lg sm:text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Calendar</h1>
          <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({tasks.length} tasks)</span>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 border rounded-lg text-[10px] sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-0.5 sm:gap-1 ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}
          >
            {viewMode === 'month' ? (
              <>View Year <FaChevronDown className="text-[8px] sm:text-xs" /></>
            ) : (
              <>View Month <FaChevronUp className="text-[8px] sm:text-xs" /></>
            )}
          </button>
          <button 
            onClick={() => openAddTaskModal()}
            className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-0.5 sm:gap-1 hover:bg-blue-700 transition-colors shadow-sm text-[10px] sm:text-sm"
            disabled={boards.length === 0}
          >
            <FaPlus className="text-[8px] sm:text-xs" />
            <span className="hidden xs:inline">Add</span> Task
          </button>
          {isMobile && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-1.5 sm:p-2 rounded-lg border ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
              <FaBars className="text-xs sm:text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-2 sm:gap-3 md:gap-4 h-[calc(100%-60px)] overflow-hidden">
        {/* Calendar Section */}
        <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden flex flex-col min-w-0`}>
          {/* Navigation */}
          {viewMode === 'month' && (
            <div className={`p-1.5 sm:p-2 md:p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-wrap items-center justify-between gap-1 sm:gap-2`}>
              <div className="flex items-center gap-1 sm:gap-2">
                <button 
                  onClick={prevMonth}
                  className={`p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <FaChevronLeft className="text-[10px] sm:text-xs md:text-sm" />
                </button>
                <h2 className={`text-xs sm:text-sm md:text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} min-w-[100px] sm:min-w-[140px] text-center`}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button 
                  onClick={nextMonth}
                  className={`p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <FaChevronRight className="text-[10px] sm:text-xs md:text-sm" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <button 
                  onClick={() => {
                    setCurrentDate(new Date());
                    setSelectedDate(null);
                    setSelectedTask(null);
                    setSearchQuery('');
                  }}
                  className={`text-[8px] sm:text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors`}
                >
                  Today
                </button>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FaFilter className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-[8px] sm:text-xs`} />
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className={`text-[8px] sm:text-xs border rounded-lg px-1 sm:px-2 py-0.5 sm:py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                  >
                    <option value="all">All</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="relative hidden sm:block">
                  <FaSearch className={`absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-[8px] sm:text-xs`} />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-5 sm:pl-7 pr-1.5 sm:pr-2 py-0.5 sm:py-1 border rounded-lg text-[8px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-20 sm:w-28 md:w-32 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="flex-1 overflow-auto">
            {viewMode === 'month' ? (
              <>
                <div className="grid grid-cols-7">
                  {dayNames.map((day) => (
                    <div key={day} className={`p-0.5 sm:p-1 md:p-1.5 text-center text-[8px] sm:text-xs font-semibold border-b ${darkMode ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-100'}`}>
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{shortDayNames[dayNames.indexOf(day)]}</span>
                    </div>
                  ))}
                  {renderCalendar()}
                </div>
              </>
            ) : (
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <h3 className={`text-base sm:text-lg md:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentDate.getFullYear()}</h3>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => goToYear(currentDate.getFullYear() - 1)}
                      className={`p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      <FaChevronLeft className="text-xs sm:text-sm" />
                    </button>
                    <button
                      onClick={() => goToYear(currentDate.getFullYear() + 1)}
                      className={`p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      <FaChevronRight className="text-xs sm:text-sm" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
                  {Array.from({ length: 12 }, (_, month) => {
                    const daysInMonth = new Date(currentDate.getFullYear(), month + 1, 0).getDate();
                    const firstDay = new Date(currentDate.getFullYear(), month, 1).getDay();
                    const monthTasks = tasks.filter(task => {
                      const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.date);
                      return taskDate.getMonth() === month && taskDate.getFullYear() === currentDate.getFullYear();
                    });
                    
                    return (
                      <div key={month} className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-1.5 sm:p-2 hover:shadow-md transition-shadow`}>
                        <h4 className={`text-[8px] sm:text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-0.5 sm:mb-1`}>{monthNames[month].substring(0, 3)}</h4>
                        <div className="grid grid-cols-7 gap-0.5">
                          {shortDayNames.map((d, idx) => (
                            <div key={idx} className={`text-[5px] sm:text-[8px] ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-center`}>{d}</div>
                          ))}
                          {Array.from({ length: firstDay }, (_, i) => (
                            <div key={`empty-${i}`} className="text-[5px] sm:text-[8px] text-center"></div>
                          ))}
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const hasTask = tasks.some(task => {
                              const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.date);
                              return taskDate.getDate() === day && 
                                     taskDate.getMonth() === month && 
                                     taskDate.getFullYear() === currentDate.getFullYear();
                            });
                            return (
                              <button
                                key={day}
                                onClick={() => {
                                  setCurrentDate(new Date(currentDate.getFullYear(), month, day));
                                  setViewMode('month');
                                }}
                                className={`text-[5px] sm:text-[8px] text-center p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'} ${hasTask ? 'font-semibold' : ''}`}
                              >
                                {day}
                                {hasTask && <div className="w-0.5 h-0.5 bg-blue-500 rounded-full mx-auto"></div>}
                              </button>
                            );
                          })}
                        </div>
                        {monthTasks.length > 0 && (
                          <div className={`mt-0.5 sm:mt-1 text-[6px] sm:text-[8px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{monthTasks.length} tasks</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Desktop */}
        {!isMobile && (
          <div className={`w-[30%] min-w-[220px] sm:min-w-[250px] md:min-w-[280px] ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm flex flex-col`}>
            <div className={`p-2 sm:p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                  {getSidebarTitle()}
                </h3>
                {sidebarTasks.length > 0 && (
                  <span className={`text-[8px] sm:text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`}>
                    {filteredSidebarTasks.length} task{filteredSidebarTasks.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 md:p-3">
              {sidebarTasks.length > 0 ? (
                <div className="space-y-1.5 sm:space-y-2">
                  {filteredSidebarTasks.map((task) => (
                    <div 
                      key={task._id || task.id} 
                      className={`p-1.5 sm:p-2 border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'}`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>{task.title}</p>
                          <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                            <span className={`text-[6px] sm:text-[10px] px-0.5 sm:px-1.5 py-0.5 rounded-full ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`text-[6px] sm:text-[10px] px-0.5 sm:px-1.5 py-0.5 rounded-full ${getStatusBadge(task.status)}`}>
                              {task.status}
                            </span>
                            {task.time && (
                              <span className={`text-[6px] sm:text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-0.5`}>
                                <FaClock className="text-[4px] sm:text-[8px]" />
                                {task.time}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditTaskModal(task);
                            }}
                            className={`p-0.5 sm:p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors`}
                          >
                            <FaEdit className="text-[6px] sm:text-[10px]" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTaskHandler(task._id || task.id);
                            }}
                            className={`p-0.5 sm:p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded transition-colors`}
                          >
                            <FaTrash className="text-[6px] sm:text-[10px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredSidebarTasks.length === 0 && (
                    <div className="text-center py-4 sm:py-6 md:py-8">
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-400'} text-xs sm:text-sm`}>No matching tasks</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 md:py-12">
                  <FaCalendarAlt className={`text-2xl sm:text-3xl md:text-4xl ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-2 sm:mb-3`} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-400'} text-xs sm:text-sm`}>
                    {searchQuery.trim() ? 'No tasks found' : 'Click on a date to view tasks'}
                  </p>
                  {!searchQuery.trim() && (
                    <button 
                      onClick={() => openAddTaskModal(selectedDate || new Date().getDate())}
                      className="mt-1.5 sm:mt-2 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      + Add a task
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {sidebarTasks.length > 0 && !searchQuery.trim() && (
              <div className={`p-1.5 sm:p-2 md:p-3 border-t ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'} rounded-b-xl`}>
                <button 
                  onClick={() => openAddTaskModal(selectedDate || new Date().getDate())}
                  className={`w-full text-center text-[8px] sm:text-xs ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} font-medium flex items-center justify-center gap-0.5 sm:gap-1`}
                >
                  <FaPlus className="text-[6px] sm:text-[10px]" />
                  Add New Task
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed right-0 top-0 h-full w-[280px] max-w-[80vw] bg-white dark:bg-gray-800 z-50 shadow-2xl animate-slide-in-right rounded-l-2xl overflow-hidden">
              <div className="flex flex-col h-full">
                <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                  <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {getSidebarTitle()}
                  </h3>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3">
                  {sidebarTasks.length > 0 ? (
                    <div className="space-y-2">
                      {filteredSidebarTasks.map((task) => (
                        <div 
                          key={task._id || task.id} 
                          className={`p-2 border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'}`}
                          onClick={() => {
                            handleTaskClick(task);
                            setIsSidebarOpen(false);
                          }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>{task.title}</p>
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getPriorityBadge(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStatusBadge(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditTaskModal(task);
                                  setIsSidebarOpen(false);
                                }}
                                className={`p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors`}
                              >
                                <FaEdit className="text-[10px]" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTaskHandler(task._id || task.id);
                                }}
                                className={`p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded transition-colors`}
                              >
                                <FaTrash className="text-[10px]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredSidebarTasks.length === 0 && (
                        <div className="text-center py-8">
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-400'} text-sm`}>No matching tasks</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaCalendarAlt className={`text-4xl ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-3`} />
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-400'} text-sm`}>
                        {searchQuery.trim() ? 'No tasks found' : 'Click on a date to view tasks'}
                      </p>
                      {!searchQuery.trim() && (
                        <button 
                          onClick={() => {
                            openAddTaskModal(selectedDate || new Date().getDate());
                            setIsSidebarOpen(false);
                          }}
                          className="mt-2 text-blue-600 dark:text-blue-400 text-xs hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          + Add a task
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {sidebarTasks.length > 0 && !searchQuery.trim() && (
                  <div className={`p-3 border-t ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
                    <button 
                      onClick={() => {
                        openAddTaskModal(selectedDate || new Date().getDate());
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full text-center text-xs ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} font-medium flex items-center justify-center gap-1`}
                    >
                      <FaPlus className="text-[10px]" />
                      Add New Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {renderTaskDetail()}
      {renderAddTaskModal()}

      {/* CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: ${darkMode ? '#374151' : '#f1f1f1'};
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4B5563' : '#c1c1c1'};
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6B7280' : '#a8a8a8'};
        }

        @media (max-width: 768px) {
          .overflow-y-auto::-webkit-scrollbar {
            width: 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;