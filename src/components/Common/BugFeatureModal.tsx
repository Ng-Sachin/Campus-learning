import React, { useState } from 'react';
import { X, AlertCircle, Lightbulb, CheckCircle, Loader } from 'lucide-react';
import { BugReportService } from '../../services/bugReportService';

interface BugFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    id: string;
    name: string;
    email: string;
  };
}

const BugFeatureModal: React.FC<BugFeatureModalProps> = ({ isOpen, onClose, userData }) => {
  const [type, setType] = useState<'bug' | 'feature'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await BugReportService.createReport({
        user_id: userData.id,
        user_name: userData.name,
        user_email: userData.email,
        type,
        title: title.trim(),
        description: description.trim()
      });

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setTitle('');
          setDescription('');
          onClose();
        }, 2000);
      } else {
        setError('Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Report Bug or Suggest Feature</h2>
            <p className="text-gray-600 mt-1">Help us improve the platform</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Submitted Successfully!</h3>
              <p className="text-gray-600">Thank you for your feedback. Our team will review it soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What would you like to report?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setType('bug')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      type === 'bug'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <AlertCircle className={`h-8 w-8 mx-auto mb-2 ${
                      type === 'bug' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <p className={`font-medium ${
                      type === 'bug' ? 'text-red-900' : 'text-gray-700'
                    }`}>
                      Report a Bug
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Something isn't working
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('feature')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      type === 'feature'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Lightbulb className={`h-8 w-8 mx-auto mb-2 ${
                      type === 'feature' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <p className={`font-medium ${
                      type === 'feature' ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      Feature Request
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Suggest an improvement
                    </p>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={type === 'bug' ? 'Brief description of the bug' : 'Brief description of the feature'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    type === 'bug'
                      ? 'Please describe the bug in detail:\n- What were you trying to do?\n- What happened?\n- What did you expect to happen?\n- Steps to reproduce'
                      : 'Please describe your feature request:\n- What problem does it solve?\n- How should it work?\n- Any additional context'
                  }
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit {type === 'bug' ? 'Bug Report' : 'Feature Request'}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BugFeatureModal;
