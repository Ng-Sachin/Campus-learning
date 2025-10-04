import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Lightbulb, 
  CheckCircle, 
  Clock,
  XCircle,
  Loader,
  Filter,
  AlertTriangle,
  User,
  Calendar
} from 'lucide-react';
import { BugReportService } from '../../services/bugReportService';
import { BugReport } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const AdminBugReports: React.FC = () => {
  const { userData } = useAuth();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'bug' | 'feature'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all');
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await BugReportService.getAllReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    reportId: string,
    status: 'open' | 'in-progress' | 'resolved' | 'closed'
  ) => {
    setUpdating(true);
    try {
      await BugReportService.updateReportStatus(
        reportId,
        status,
        userData?.id,
        adminNotes || undefined
      );
      await loadReports();
      setSelectedReport(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePriority = async (
    reportId: string,
    priority: 'low' | 'medium' | 'high'
  ) => {
    try {
      await BugReportService.updatePriority(reportId, priority);
      await loadReports();
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filterType !== 'all' && report.type !== filterType) return false;
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: reports.length,
    bugs: reports.filter(r => r.type === 'bug').length,
    features: reports.filter(r => r.type === 'feature').length,
    open: reports.filter(r => r.status === 'open').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Bug Reports & Feature Requests</h1>
          <p className="text-gray-600 mt-1">Review and manage user feedback</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.bugs}</p>
            <p className="text-xs text-gray-500 mt-1">Bugs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.features}</p>
            <p className="text-xs text-gray-500 mt-1">Features</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
            <p className="text-xs text-gray-500 mt-1">Open</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-xs text-gray-500 mt-1">Resolved</p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="bug">Bugs Only</option>
              <option value="feature">Features Only</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 text-primary-600 animate-spin" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No reports found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {report.type === 'bug' ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Lightbulb className="h-5 w-5 text-blue-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      </div>

                      <p className="text-gray-700 mb-3 whitespace-pre-line">{report.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                          report.type === 'bug' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {report.type === 'bug' ? 'Bug' : 'Feature'}
                        </span>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span className="capitalize">{report.status.replace('-', ' ')}</span>
                        </span>
                        {report.priority && (
                          <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getPriorityColor(report.priority)}`}>
                            {report.priority} Priority
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{report.user_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {report.admin_notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-medium text-blue-900 mb-1">Admin Notes:</p>
                          <p className="text-sm text-blue-800">{report.admin_notes}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setAdminNotes(report.admin_notes || '');
                      }}
                      className="ml-4 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Management Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Manage Report</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex space-x-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => handleUpdatePriority(selectedReport.id, priority as any)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectedReport.priority === priority
                          ? getPriorityColor(priority)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="capitalize">{priority}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Add internal notes about this report..."
                />
              </div>

              {/* Status Actions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Update Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'open')}
                    disabled={updating}
                    className="px-4 py-2 border-2 border-yellow-300 text-yellow-800 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                  >
                    Mark as Open
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'in-progress')}
                    disabled={updating}
                    className="px-4 py-2 border-2 border-blue-300 text-blue-800 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                    disabled={updating}
                    className="px-4 py-2 border-2 border-green-300 text-green-800 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'closed')}
                    disabled={updating}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-800 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setAdminNotes('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBugReports;
