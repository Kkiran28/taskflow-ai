import { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaChartPie, 
  FaChartLine,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaCalendarWeek,
  FaCalendarAlt,
  FaCalendar,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';

const Analytics = () => {
  const { darkMode } = useTheme();
  const { tasks, loading } = useTasks(); // Use centralized tasks
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
    onTrack: 0
  });
  const [taskDistribution, setTaskDistribution] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [trend, setTrend] = useState({ direction: 'up', value: 0 });
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    calculateStats(tasks);
  }, [tasks, timeRange]);

  const calculateStats = (taskList) => {
    const total = taskList.length;
    if (total === 0) {
      setStats({
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        overdue: 0,
        completionRate: 0,
        onTrack: 0
      });
      setTaskDistribution([]);
      setChartData([]);
      setInsights([]);
      setTrend({ direction: 'up', value: 0 });
      return;
    }

    // ✅ FIX: Check for both 'completed' and 'done' status
    const completed = taskList.filter(t => 
      t.status === 'completed' || t.status === 'done'
    ).length;
    
    const inProgress = taskList.filter(t => 
      t.status === 'in-progress' || t.status === 'in progress'
    ).length;
    
    const pending = taskList.filter(t => 
      t.status === 'pending' || t.status === 'todo'
    ).length;
    
    const now = new Date();
    const overdue = taskList.filter(t => {
      const taskDate = t.dueDate ? new Date(t.dueDate) : new Date(t.date);
      return taskDate < now && t.status !== 'completed' && t.status !== 'done';
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const onTrack = total > 0 ? Math.round(((total - overdue) / total) * 100) : 0;

    setStats({
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate,
      onTrack
    });

    // Task Distribution
    setTaskDistribution([
      { label: 'Completed', value: completed, color: '#10B981', icon: '✅' },
      { label: 'In Progress', value: inProgress, color: '#F59E0B', icon: '🔄' },
      { label: 'Pending', value: pending, color: '#6366F1', icon: '⏳' },
      { label: 'Overdue', value: overdue, color: '#EF4444', icon: '⚠️' },
    ]);

    // Generate chart data based on time range
    const chartData = generateChartData(taskList);
    setChartData(chartData);

    // Insights
    const insightsData = generateInsights(taskList, chartData);
    setInsights(insightsData);

    // Calculate trend
    if (chartData.length > 1) {
      const lastTwo = chartData.slice(-2);
      const current = lastTwo[1]?.completed || 0;
      const previous = lastTwo[0]?.completed || 0;
      if (current > previous) {
        setTrend({ direction: 'up', value: Math.round(((current - previous) / (previous || 1)) * 100) });
      } else if (current < previous) {
        setTrend({ direction: 'down', value: Math.round(((previous - current) / (previous || 1)) * 100) });
      } else {
        setTrend({ direction: 'neutral', value: 0 });
      }
    }
  };

  const generateChartData = (taskList) => {
    const now = new Date();
    let data = [];
    
    if (timeRange === 'week') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      const currentDay = now.getDay();
      const sunday = new Date(now);
      sunday.setDate(now.getDate() - currentDay);
      sunday.setHours(0, 0, 0, 0);

      data = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        data.push({
          label: shortDays[i],
          fullLabel: days[i],
          date: date,
          tasks: 0,
          completed: 0,
          isToday: i === currentDay
        });
      }

      taskList.forEach(task => {
        const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.date);
        const diffTime = taskDate - sunday;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays < 7) {
          const index = diffDays;
          if (index >= 0 && index < data.length) {
            data[index].tasks++;
            if (task.status === 'completed' || task.status === 'done') {
              data[index].completed++;
            }
          }
        }
      });
    } else if (timeRange === 'month') {
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const isToday = i === 0;
        days.push({
          label: `${date.getDate()}/${date.getMonth() + 1}`,
          fullLabel: `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`,
          date: date,
          tasks: 0,
          completed: 0,
          isToday: isToday
        });
      }
      
      taskList.forEach(task => {
        const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.date);
        const diffDays = Math.floor((now - taskDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 30) {
          const index = 29 - diffDays;
          if (index >= 0 && index < days.length) {
            days[index].tasks++;
            if (task.status === 'completed' || task.status === 'done') {
              days[index].completed++;
            }
          }
        }
      });
      data = days;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      data = months.map((month, index) => ({
        label: month,
        fullLabel: fullMonths[index],
        tasks: 0,
        completed: 0,
        isToday: index === now.getMonth()
      }));
      
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      taskList.forEach(task => {
        const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.date);
        const monthIndex = taskDate.getMonth();
        const yearDiff = currentYear - taskDate.getFullYear();
        if (yearDiff === 0 || (yearDiff === 1 && monthIndex > currentMonth)) {
          const diffMonths = (currentYear - taskDate.getFullYear()) * 12 + (currentMonth - monthIndex);
          if (diffMonths >= 0 && diffMonths < 12) {
            const index = 11 - diffMonths;
            if (index >= 0 && index < data.length) {
              data[index].tasks++;
              if (task.status === 'completed' || task.status === 'done') {
                data[index].completed++;
              }
            }
          }
        }
      });
    }
    
    return data;
  };

  const generateInsights = (taskList, chartData) => {
    const insights = [];
    const total = taskList.length;
    if (total === 0) return insights;

    if (chartData.length > 0) {
      const maxCompleted = Math.max(...chartData.map(d => d.completed));
      if (maxCompleted > 0) {
        const peakDay = chartData.find(d => d.completed === maxCompleted);
        insights.push({
          type: 'productivity',
          label: 'Productivity Peak',
          value: peakDay?.fullLabel || peakDay?.label || 'N/A',
          description: `Most productive ${timeRange}`,
          color: 'green',
          icon: <FaChartLine className="text-green-500" />
        });
      }
    }

    const completed = taskList.filter(t => t.status === 'completed' || t.status === 'done').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    insights.push({
      type: 'rate',
      label: 'Completion Rate',
      value: `${rate}%`,
      description: `${completed} of ${total} tasks completed`,
      color: rate > 70 ? 'green' : rate > 40 ? 'yellow' : 'red',
      icon: <FaCheckCircle className={rate > 70 ? 'text-green-500' : rate > 40 ? 'text-yellow-500' : 'text-red-500'} />
    });

    const completedTasks = taskList.filter(t => t.status === 'completed' || t.status === 'done');
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((acc, task) => {
        const created = new Date(task.createdAt || task.date || task.dueDate);
        const completed = new Date(task.updatedAt || task.date || task.dueDate);
        const diffTime = Math.abs(completed - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return acc + Math.max(1, diffDays);
      }, 0);
      const avgDays = Math.round((totalDays / completedTasks.length) * 10) / 10;
      insights.push({
        type: 'time',
        label: 'Avg. Completion Time',
        value: `${avgDays} days`,
        description: 'Average time to complete',
        color: avgDays < 3 ? 'green' : avgDays < 7 ? 'yellow' : 'red',
        icon: <FaClock className={avgDays < 3 ? 'text-green-500' : avgDays < 7 ? 'text-yellow-500' : 'text-red-500'} />
      });
    }

    const overdue = taskList.filter(t => {
      const taskDate = t.dueDate ? new Date(t.dueDate) : new Date(t.date);
      return taskDate < new Date() && t.status !== 'completed' && t.status !== 'done';
    }).length;
    const onTrack = total > 0 ? Math.round(((total - overdue) / total) * 100) : 0;
    insights.push({
      type: 'track',
      label: 'On Track',
      value: `${onTrack}%`,
      description: `${total - overdue} tasks on schedule`,
      color: onTrack > 70 ? 'green' : onTrack > 40 ? 'yellow' : 'red',
      icon: <FaTasks className={onTrack > 70 ? 'text-green-500' : onTrack > 40 ? 'text-yellow-500' : 'text-red-500'} />
    });

    return insights;
  };

  const getMaxValue = () => {
    if (chartData.length === 0) return 10;
    return Math.max(...chartData.map(d => Math.max(d.tasks, d.completed))) + 2;
  };

  const getInsightColor = (color) => {
    const colors = {
      green: 'bg-green-50/80 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/50',
      yellow: 'bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200/50 dark:border-yellow-800/50',
      blue: 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/50',
      red: 'bg-red-50/80 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/50'
    };
    return colors[color] || 'bg-gray-50/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50';
  };

  const getTrendIcon = () => {
    if (trend.direction === 'up') return <FaArrowUp className="text-green-500" />;
    if (trend.direction === 'down') return <FaArrowDown className="text-red-500" />;
    return <FaMinus className="text-gray-500" />;
  };

  const getTrendColor = () => {
    if (trend.direction === 'up') return 'text-green-500';
    if (trend.direction === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  const getTimeRangeIcon = () => {
    if (timeRange === 'week') return <FaCalendarWeek />;
    if (timeRange === 'month') return <FaCalendarAlt />;
    return <FaCalendar />;
  };

  const scrollLeft = () => {
    if (scrollIndex > 0) {
      setScrollIndex(scrollIndex - 1);
    }
  };

  const scrollRight = () => {
    if (scrollIndex < chartData.length - 4) {
      setScrollIndex(scrollIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Analytics Dashboard
              </h1>
              <span className={`px-3 py-1 text-xs rounded-full ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
              } flex items-center gap-1.5`}>
                {getTimeRangeIcon()} {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
              </span>
            </div>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {tasks.length} total tasks • {stats.completionRate}% completion rate
              {trend.value > 0 && (
                <span className={`ml-2 text-xs ${getTrendColor()} flex items-center gap-1 inline-flex`}>
                  {getTrendIcon()} {trend.value}% from previous {timeRange}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {[
              { id: 'week', label: 'Week', icon: <FaCalendarWeek className="text-xs" /> },
              { id: 'month', label: 'Month', icon: <FaCalendarAlt className="text-xs" /> },
              { id: 'year', label: 'Year', icon: <FaCalendar className="text-xs" /> }
            ].map((range) => (
              <button 
                key={range.id}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  timeRange === range.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : `${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'}`
                }`}
                onClick={() => setTimeRange(range.id)}
              >
                {range.icon}
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { 
              title: 'Total Tasks', 
              value: stats.total, 
              icon: FaTasks, 
              bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50',
              text: darkMode ? 'text-blue-400' : 'text-blue-600'
            },
            { 
              title: 'Completed', 
              value: stats.completed, 
              icon: FaCheckCircle, 
              bg: darkMode ? 'bg-green-900/30' : 'bg-green-50',
              text: darkMode ? 'text-green-400' : 'text-green-600'
            },
            { 
              title: 'In Progress', 
              value: stats.inProgress, 
              icon: FaClock, 
              bg: darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50',
              text: darkMode ? 'text-yellow-400' : 'text-yellow-600'
            },
            { 
              title: 'Overdue', 
              value: stats.overdue, 
              icon: FaExclamationTriangle, 
              bg: stats.overdue > 0 ? (darkMode ? 'bg-red-900/30' : 'bg-red-50') : (darkMode ? 'bg-gray-700' : 'bg-gray-100'),
              text: stats.overdue > 0 ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-gray-400' : 'text-gray-600')
            }
          ].map((stat, index) => (
            <div key={index} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-5 rounded-2xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'} transition-all hover:shadow-md hover:-translate-y-0.5`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.text}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
          {/* Task Distribution */}
          <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-5 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                <FaChartPie className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                Task Distribution
              </h3>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {stats.total} total
              </span>
            </div>
            <div className="space-y-4">
              {taskDistribution.length > 0 && taskDistribution.some(d => d.value > 0) ? (
                taskDistribution.map((item) => (
                  <div key={item.label} className="group">
                    <div className="flex justify-between items-center text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                      </div>
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.value}</span>
                    </div>
                    <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5 overflow-hidden`}>
                      <div 
                        className="h-2.5 rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                        style={{ 
                          width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mx-auto mb-3`}>
                      <FaChartPie className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-2xl`} />
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No tasks to distribute</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Chart */}
          <div className={`lg:col-span-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-5 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                <FaChartBar className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                {timeRange === 'week' ? 'Weekly Progress' : timeRange === 'month' ? 'Monthly Progress' : 'Yearly Progress'}
                {timeRange === 'week' && (
                  <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'} font-normal`}>
                    (Sun - Sat)
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-blue-500 rounded"></span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Tasks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-green-500 rounded"></span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Completed</span>
                </div>
              </div>
            </div>
            
            <div>
              {chartData.length > 0 ? (
                <>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {chartData.map((item, index) => {
                      const totalHeight = getMaxValue();
                      const taskPercent = totalHeight > 0 ? (item.tasks / totalHeight) * 100 : 0;
                      const completedPercent = totalHeight > 0 ? (item.completed / totalHeight) * 100 : 0;
                      
                      return (
                        <div key={index} className="group">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} ${item.isToday ? 'font-semibold text-blue-500 dark:text-blue-400' : ''}`}>
                              {timeRange === 'week' ? item.fullLabel : item.fullLabel || item.label}
                              {item.isToday && <span className="ml-1 text-[8px] font-normal">(Today)</span>}
                            </span>
                            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item.completed}/{item.tasks} completed
                            </span>
                          </div>
                          <div className="flex gap-0.5 h-9">
                            <div className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg relative overflow-hidden ${item.isToday ? 'ring-2 ring-blue-500/50' : ''}`}>
                              {item.tasks > 0 ? (
                                <>
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-lg transition-all duration-700 ease-out group-hover:opacity-80"
                                    style={{ width: `${taskPercent}%` }}
                                  />
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-green-500 rounded-lg transition-all duration-700 ease-out group-hover:opacity-80"
                                    style={{ width: `${completedPercent}%` }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-white drop-shadow-lg">
                                      {item.tasks} tasks
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500">No tasks</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {chartData.length > 5 && (
                    <div className="flex justify-center items-center gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={scrollLeft}
                        disabled={scrollIndex === 0}
                        className={`p-1.5 rounded-lg transition-all ${
                          scrollIndex === 0 
                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <FaChevronLeft className="w-4 h-4" />
                      </button>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {scrollIndex + 1} - {Math.min(scrollIndex + 5, chartData.length)} of {chartData.length}
                      </span>
                      <button
                        onClick={scrollRight}
                        disabled={scrollIndex >= chartData.length - 5}
                        className={`p-1.5 rounded-lg transition-all ${
                          scrollIndex >= chartData.length - 5 
                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <FaChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mx-auto mb-3`}>
                      <FaChartBar className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-2xl`} />
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data available</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'} mt-1`}>Tasks will appear here as you create them</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-5 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Key Insights</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={index} className={`${getInsightColor(insight.color)} p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{insight.icon}</span>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {insight.label}
                    </p>
                  </div>
                  <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {insight.value}
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {insight.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-6">
                <div className="text-center">
                  <FaChartLine className={`text-2xl ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-2`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {tasks.length === 0 ? 'Create tasks to see insights' : 'No insights available'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
      `}</style>
    </div>
  );
};

export default Analytics;