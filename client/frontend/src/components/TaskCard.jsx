import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Trash2, Calendar, Clock, GripVertical } from 'lucide-react';
import { format } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 ${
        isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {task.title}
            </h4>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={onEdit}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
              {task.description}
            </p>
          )}
          <div className="flex items-center flex-wrap gap-2 mt-3">
            <span className={`badge ${priorityColors[task.priority] || 'badge-medium'}`}>
              {task.priority || 'Medium'}
            </span>
            {task.estimatedEffort && (
              <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                <Clock className="w-3 h-3 mr-1" />
                {task.estimatedEffort}h
              </span>
            )}
            {task.dueDate && (
              <span className={`badge ${isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(task.dueDate), 'MMM d')}
                {isOverdue && ' (Overdue)'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;