import React, { useState } from 'react';
import { X, Sparkles, Clock, Calendar, Brain } from 'lucide-react';
import { taskService } from '../services/taskService';
import toast from 'react-hot-toast';

const AISuggestionModal = ({ isOpen, onClose, boardId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [accepted, setAccepted] = useState(false);

  const handleGetSuggestion = async () => {
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    setLoading(true);
    setSuggestion(null);
    setAccepted(false);

    try {
      const response = await taskService.getAISuggestion(title, description);
      if (response.success && response.suggestion) {
        setSuggestion(response.suggestion);
        toast.success('AI suggestion generated! ✨');
      } else {
        toast.info('Using fallback suggestion');
        setSuggestion({
          effort: 3,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reasoning: 'Based on similar tasks, this typically takes 3-5 hours.',
          fallback: true,
        });
      }
    } catch (error) {
      toast.error('AI service unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!suggestion) return;

    try {
      await taskService.createTask({
        title,
        description,
        boardId,
        estimatedEffort: suggestion.effort,
        dueDate: suggestion.dueDate,
        priority: 'medium',
      });
      toast.success('Task created with AI suggestions! 🎉');
      setAccepted(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 animate-slide-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Smart Estimate
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter task details and let AI suggest effort and due date
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              rows="3"
              placeholder="Describe your task..."
            />
          </div>

          {!suggestion && !accepted && (
            <button
              onClick={handleGetSuggestion}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-3 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              <span>{loading ? 'Generating...' : 'Get AI Suggestion'}</span>
            </button>
          )}

          {suggestion && !accepted && (
            <div className="bg-gradient-to-r from-purple-50 to-primary-50 dark:from-purple-900/20 dark:to-primary-900/20 rounded-xl p-4 animate-fade-in">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                AI Suggestion 💡
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">Estimated Effort</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {suggestion.effort} Hours
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    <span className="text-gray-700 dark:text-gray-300">Suggested Due Date</span>
                  </div>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {new Date(suggestion.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Reasoning:</span> {suggestion.reasoning}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setSuggestion(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Suggestion</span>
                </button>
              </div>
            </div>
          )}

          {accepted && (
            <div className="text-center py-8 animate-bounce-in">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Task Created with AI!
              </h3>
              <p className="text-gray-500 dark:text-gray-400">Redirecting to board...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISuggestionModal;