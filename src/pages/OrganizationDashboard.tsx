import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Eye,
  Trash2
} from 'lucide-react';

interface Record {
  id: string;
  organization_id: string;
  created_by: string;
  title: string;
  description: string | null;
  data: any;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalMembers: number;
  totalRecords: number;
  pendingRecords: number;
  approvedRecords: number;
  rejectedRecords: number;
}

export function OrganizationDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalRecords: 0,
    pendingRecords: 0,
    approvedRecords: 0,
    rejectedRecords: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(records.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, records]);

  const fetchDashboardData = async () => {
    try {
      // Fetch records
      const { data: recordsData, error: recordsError } = await supabase
        .from('records')
        .select('*')
        .eq('organization_id', user?.organizationId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (recordsError) throw recordsError;
      setRecords(recordsData || []);
      setFilteredRecords(recordsData || []);

      // Fetch members count
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'member')
        .eq('organization_id', user?.organizationId);

      if (membersError) throw membersError;

      // Calculate stats
      const pending = recordsData?.filter(r => r.status === 'pending').length || 0;
      const approved = recordsData?.filter(r => r.status === 'approved').length || 0;
      const rejected = recordsData?.filter(r => r.status === 'rejected').length || 0;

      setStats({
        totalMembers: membersData?.length || 0,
        totalRecords: recordsData?.length || 0,
        pendingRecords: pending,
        approvedRecords: approved,
        rejectedRecords: rejected
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecords(records.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record');
    }
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color, 
    bgColor 
  }: { 
    icon: any; 
    label: string; 
    value: number | string; 
    color: string; 
    bgColor: string; 
  }) => (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`p-2 sm:p-3 ${bgColor} rounded-lg`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-neutral-600 truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="Organization Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Welcome, {user?.organizationName || user?.email}
          </h1>
          <p className="text-neutral-600 mt-1">
            Here's an overview of your activity
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                icon={Users}
                label="Members"
                value={stats.totalMembers}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={FileText}
                label="Total Records"
                value={stats.totalRecords}
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
              <StatCard
                icon={Clock}
                label="Pending"
                value={stats.pendingRecords}
                color="text-yellow-600"
                bgColor="bg-yellow-50"
              />
              <StatCard
                icon={TrendingUp}
                label="Approved"
                value={stats.approvedRecords}
                color="text-green-600"
                bgColor="bg-green-50"
              />
            </div>

            {/* Records List */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Recent Records ({filteredRecords.length})
                  </h2>
                  
                  {/* Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        statusFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        statusFilter === 'pending'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setStatusFilter('approved')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        statusFilter === 'approved'
                          ? 'bg-green-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Approved
                    </button>
                    <button
                      onClick={() => setStatusFilter('rejected')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        statusFilter === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p className="font-medium">No records yet</p>
                  <p className="text-sm mt-2">
                    Records submitted by your members will appear here
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-sm">Title</th>
                        <th className="text-left p-4 font-semibold text-sm">Status</th>
                        <th className="text-left p-4 font-semibold text-sm">Created</th>
                        <th className="text-left p-4 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record) => (
                        <tr 
                          key={record.id} 
                          className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-medium text-neutral-900">
                              {record.title || 'Untitled'}
                            </div>
                            {record.description && (
                              <div className="text-xs text-neutral-500 truncate max-w-xs">
                                {record.description}
                              </div>
                            )}
                          </td>
                          <td className="p-4">{getStatusBadge(record.status)}</td>
                          <td className="p-4 text-sm text-neutral-600">
                            {new Date(record.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}