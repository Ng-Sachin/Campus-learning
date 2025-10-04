import React from 'react';
import { X, Sparkles, Check } from 'lucide-react';

interface NewFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewFeaturesModal: React.FC<NewFeaturesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      version: 'Latest Updates',
      date: 'October 2025',
      items: [
        'Enhanced Mentor Browser with search, campus/house/availability filters',
        'Grid layout for mentor cards showing campus, house, and current phase',
        'Leave tracking system - mentors can mark themselves on leave',
        'Super Mentor badge and capacity display improvements',
        'Required reason field for mentor change requests',
        'Fixed goal lifecycle - students can edit goals when mentor requests changes',
        'Improved goal status feedback (pending, reviewed, approved)',
        'Reflection form only shows when goal is approved',
        'Bug report and feature request system',
        'New features showcase (you\'re looking at it!)'
      ]
    },
    {
      version: 'Core Features',
      date: 'September 2025',
      items: [
        'Complete mentorship system with request workflow',
        'Admin approval system for mentor changes',
        'Daily goal setting and reflection system',
        'Mentor review and feedback capabilities',
        'Student dashboard with progress tracking',
        'Mentor dashboard with mentee management',
        'Multi-campus and house support',
        'Phase and topic management'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">What's New</h2>
              <p className="text-gray-600 mt-1">Latest features and improvements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {features.map((release, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{release.version}</h3>
                  <span className="text-sm text-gray-500">{release.date}</span>
                </div>
                
                <div className="space-y-2">
                  {release.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>

                {idx < features.length - 1 && (
                  <div className="border-t border-gray-200 pt-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-center text-sm text-gray-600">
            Have suggestions? Use the <span className="font-medium text-primary-600">Submit Bug/Feature</span> button!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewFeaturesModal;
