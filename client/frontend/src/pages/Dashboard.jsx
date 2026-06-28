import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {  CheckCircle,  Clock,  AlertCircle,  TrendingUp,  Plus,  ArrowRight,  CalendarDays, ListTodo,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { boardService } from '../services/boardService';
import { taskService } from '../services/taskService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch boards
  const { data: boardsData, isLoading: boardsLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: boardService.getBoards,
  });

  // Fetch all tasks for stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const boardsResult = await boardService.getBoards();
        const boards = boardsResult.boards || [];

        let total = 0;
        let completed = 0;
        let inProgress = 0;
        let overdue = 0;
        const activities = [];

        for (const board of boards) {
          const tasksResult = await taskService.getTasksByBoard(board._id);
          const tasks = tasksResult.tasks || [];

          total += tasks.length;
          completed += tasks.filter((t) => t.status === 'done').length;
          inProgress += tasks.filter((t) => t.status === 'in-progress').length;
          overdue += tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

          tasks.slice(0, 3).forEach((task) => {
            activities.push({
              id: task._id,
              title: task.title,
              board: board.title,
              status: task.status || 'pending',
              dueDate: task.dueDate,
            });
          });
        }

        setStats({ total, completed, inProgress, overdue });
        setRecentActivities(activities.sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0)).slice(0, 5));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: CheckCircle,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+18%',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '+5%',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '+3%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Link to="/boards" className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          <span>Create Board</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">{stat.change}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">from last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming & Recent Activity</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your active tasks and board progress</p>
            </div>
          </div>

          <div className="space-y-3">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                <div className=" flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2">
                    <ListTodo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.board}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{activity.status}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.dueDate ? new Date(activity.dueDate).toLocaleDateString() : 'No deadline'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                No recent activity yet. Create a board and add tasks to see updates here.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <CalendarDays className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Summary</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <span>Boards</span>
              <span className="font-semibold text-gray-900 dark:text-white">{boardsData?.boards?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <span>Open Tasks</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.total - stats.completed}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <span>Due Soon</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.inProgress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Boards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Boards</h2>
          <Link to="/boards" className="text-primary-600 dark:text-primary-400 hover:underline flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boardsLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))
          ) : boardsData?.boards?.length > 0 ? (
            boardsData.boards.slice(0, 3).map((board) => (
              <Link
                key={board._id}
                to={`/boards/${board._id}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer block"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {board.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {board.description || 'No description'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {board.taskCount || 0} Tasks
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Due: {board.dueThisWeek || 0}
                    </span>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${board.progress || 0}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No boards yet</p>
              <Link to="/boards" className="btn-primary inline-flex items-center mt-4">
                <Plus className="w-5 h-5 mr-2" />
                Create your first board
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;