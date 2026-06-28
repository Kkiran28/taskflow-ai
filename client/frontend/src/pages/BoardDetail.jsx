import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { 
  Plus, 
  ArrowLeft,
  Sparkles,
  Clock,
  Calendar,
  Flag,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { boardService } from '../services/boardService';
import { taskService } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import AISuggestionModal from '../components/AISuggestionModal';

const BoardDetail = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('todo');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch board details
  const { data: boardData } = useQuery({
    queryKey: ['boards'],
    queryFn: boardService.getBoards,
    select: (data) => data.boards?.find(b => b._id === boardId),
  });

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', boardId],
    queryFn: () => taskService.getTasksByBoard(boardId),
    enabled: !!boardId,
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', boardId]);
      queryClient.invalidateQueries(['boards']);
      toast.success('Task created successfully! 🎉');
      setShowTaskModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    },
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', boardId]);
      toast.success('Task updated successfully!');
      setShowTaskModal(false);
      setEditingTask(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', boardId]);
      queryClient.invalidateQueries(['boards']);
      toast.success('Task deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    },
  });

  const handleCreateTask = (data) => {
    createMutation.mutate({ ...data, boardId });
  };

  const handleUpdateTask = (data) => {
    updateMutation.mutate({ id: editingTask._id, data });
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeTask = tasksData?.tasks?.find(t => t._id === active.id);
    const overTask = tasksData?.tasks?.find(t => t._id === over.id);
    
    if (!activeTask || !overTask) return;
    
    // Update task status
    if (activeTask.status !== overTask.status) {
      updateMutation.mutate({
        id: activeTask._id,
        data: { status: overTask.status }
      });
    }
  };

  const getTasksByStatus = (status) => {
    return tasksData?.groupedTasks?.[status] || [];
  };

  const statusColumns = [
    { id: 'todo', label: 'To Do', color: 'bg-gray-100 dark:bg-gray-700' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/20' },
    { id: 'done', label: 'Done', color: 'bg-green-100 dark:bg-green-900/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/boards')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {boardData?.title || 'Board'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {boardData?.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAIModal(true)}
            className="btn-primary flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-primary-500"
          >
            <Sparkles className="w-5 h-5" />
            <span>AI Suggest</span>
          </button>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Board Columns */}
      {isLoading ? (
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {statusColumns.map((col) => (
            <div key={col.id} className="flex-1 min-w-[280px]">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {statusColumns.map((column) => {
              const tasks = getTasksByStatus(column.id);
              return (
                <div key={column.id} className="flex-1 min-w-[280px]">
                  <div className={`${column.color} rounded-xl p-4 min-h-[300px]`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                        {column.label}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {tasks.length}
                      </span>
                    </div>
                    <SortableContext
                      items={tasks.map(t => t._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            onEdit={() => {
                              setEditingTask(task);
                              setShowTaskModal(true);
                            }}
                            onDelete={() => handleDeleteTask(task._id)}
                          />
                        ))}
                        {tasks.length === 0 && (
                          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                            No tasks yet
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        initialData={editingTask}
        boardId={boardId}
      />

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        boardId={boardId}
      />
    </div>
  );
};

export default BoardDetail;