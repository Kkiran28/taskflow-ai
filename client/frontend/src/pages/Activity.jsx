import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FaCheckCircle, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaClock,
  FaUser,
  FaFilter,
  FaCalendarAlt,
  FaArrowRight,
  FaCircle,
  FaSearch
} from 'react-icons/fa';

const Activity = () => {
  const { darkMode } = useTheme();
  const { tasks, loading } = useTasks();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState([]);

  // Generate activities from tasks whenever tasks change
  useEffect(() => {
    if (!loading) {
      generateActivities();
    }
  }, [tasks, loading]);

  // Generate activity from tasks
  const generateActivities = () => {
    const activityList = [];
    
    tasks.forEach(task => {
      // Task created activity
      const createdDate = task.createdAt || task.date || new Date();
      activityList.push({
        id: `${task._id || task.id}-created-${Date.now()}`,
        taskId: task._id || task.id,
        type: 'created',
        title: task.title,
        board: task.boardTitle || task.boardId || 'Unknown Board',
        user: task.assignee || 'System',
        timestamp: new Date(createdDate),
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        action: `created task "${task.title}"`
      });

      // If task is completed, add completion activity
      if (task.status === 'completed' || task.status === 'done') {
        const completedDate = task.updatedAt || task.date || new Date();
        activityList.push({
          id: `${task._id || task.id}-completed-${Date.now()}`,
          taskId: task._id || task.id,
          type: 'completed',
          title: task.title,
          board: task.boardTitle || task.boardId || 'Unknown Board',
          user: task.assignee || 'System',
          timestamp: new Date(completedDate),
          status: 'completed',
          priority: task.priority || 'medium',
          action: `completed task "${task.title}"`
        });
      }

      // If task was updated (check if updatedAt exists and is different from createdAt)
      if (task.updatedAt && task.createdAt && 
          new Date(task.updatedAt).getTime() !== new Date(task.createdAt).getTime() &&
          task.status !== 'completed' && task.status !== 'done') {
        activityList.push({
          id: `${task._id || task.id}-updated-${Date.now()}`,
          taskId: task._id || task.id,
          type: 'updated',
          title: task.title,
          board: task.boardTitle || task.boardId || 'Unknown Board',
          user: task.assignee || 'System',
          timestamp: new Date(task.updatedAt),
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          action: `updated task "${task.title}"`
        });
      }
    });

    // Sort by timestamp (newest first)
    activityList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setActivities(activityList);
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'created':
        return <FaPlus className="text-blue-500 dark:text-blue-400" />;
      case 'completed':
        return <FaCheckCircle className="text-green-500 dark:text-green-400" />;
      case 'updated':
        return <FaEdit className="text-yellow-500 dark:text-yellow-400" />;
      case 'deleted':
        return <FaTrash className="text-red-500 dark:text-red-400" />;
      default:
        return <FaClock className="text-gray-500 dark:text-gray-400" />;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'created':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
      case 'completed':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
      case 'updated':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'deleted':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20';
    }
  };

  const getActivityBg = (type) => {
    const bg = {
      completed: 'hover:bg-green-50 dark:hover:bg-green-900/10',
      created: 'hover:bg-blue-50 dark:hover:bg-blue-900/10',
      updated: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/10',
      deleted: 'hover:bg-red-50 dark:hover:bg-red-900/10'
    };
    return bg[type] || 'hover:bg-gray-50 dark:hover:bg-gray-700/50';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'done': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'todo': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    return badges[priority] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusCount = (type) => {
    return activities.filter(a => a.type === type).length;
  };

  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all' && activity.type !== filter) return false;
    if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className={`h-[calc(100vh-80px)] flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Activity Feed</h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {activities.length} total activities • {filteredActivities.length} shown
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-700'}`}
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {['all', 'created', 'completed', 'updated', 'deleted'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                    filter === type
                      ? 'bg-blue-600 text-white'
                      : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                  }`}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-3 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{activities.length}</span>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-3 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Completed</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">{getStatusCount('completed')}</span>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-3 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Created</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{getStatusCount('created')}</span>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-3 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Updated</span>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{getStatusCount('updated')}</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
          <div className="h-[calc(100vh-340px)] overflow-y-auto p-4 space-y-3">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${getActivityBg(activity.type)} ${
                    darkMode ? 'border border-gray-700/50' : 'border border-transparent'
                  }`}
                >
                  {/* Timeline Line */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full border-2 ${getActivityColor(activity.type)} flex items-center justify-center bg-white dark:bg-gray-800 flex-shrink-0`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    {index < filteredActivities.length - 1 && (
                      <div className={`w-0.5 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} absolute top-10`}></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {activity.title}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          in {activity.board} • by {activity.user}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(activity.status)}`}>
                          {activity.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(activity.priority)}`}>
                          {activity.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                      <span className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1`}>
                        <FaClock className="text-[10px]" />
                        {getTimeAgo(activity.timestamp)}
                      </span>
                      <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} flex items-center gap-1`}>
                        <FaCalendarAlt className="text-[10px]" />
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] capitalize ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-440px)] text-center">
                <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-3`}>
                  <FaFilter className={`text-2xl ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activities.length === 0 ? 'No activities yet. Start by creating tasks!' : 'No activities found for this filter'}
                </p>
                {activities.length === 0 && (
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                    Activities will appear here as you create and manage tasks
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;