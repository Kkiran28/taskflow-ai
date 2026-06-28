import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { taskService } from '../services/taskService';
import toast from 'react-hot-toast';

const TaskModal = ({ isOpen, onClose, onSubmit, initialData, boardId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    estimatedEffort: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        estimatedEffort: initialData.estimatedEffort || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        estimatedEffort: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    onSubmit({
      ...formData,
      boardId,
      estimatedEffort: formData.estimatedEffort ? Number(formData.estimatedEffort) : undefined,
    });
  };

  const handleAISuggest = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a task title first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await taskService.getAISuggestion(
        formData.title,
        formData.description
      );
      
      if (response.success && response.suggestion) {
        const { effort, dueDate, reasoning } = response.suggestion;
        setFormData(prev => ({
          ...prev,
          estimatedEffort: effort || '',
          dueDate: dueDate || prev.dueDate,
        }));
        toast.success(`AI Suggestion: ${reasoning}`);
      } else {
        toast.info('Using fallback suggestion');
        setFormData(prev => ({
          ...prev,
          estimatedEffort: '3',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }));
      }
    } catch (error) {
      toast.error('AI service unavailable, using fallback');
      setFormData(prev => ({
        ...prev,
        estimatedEffort: '3',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-slide-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field resize-none"
                rows="3"
                placeholder="Enter task description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estimated Effort (hours)
                </label>
                <button
                  type="button"
                  onClick={handleAISuggest}
                  disabled={aiLoading}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {aiLoading ? 'Thinking...' : 'AI Suggest'}
                </button>
              </div>
              <input
                type="number"
                name="estimatedEffort"
                value={formData.estimatedEffort}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 3"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;