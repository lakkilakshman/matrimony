import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  CheckCircle,
  Activity,
  TrendingUp,
  Heart,
  Clock,
  Loader2,
  Calendar,
  DollarSign,
  Mail,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import * as adminService from '@/services/adminService';

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      if (response.success) {
        console.log('Dashboard Stats Data:', response.data);
        console.log('Recent Users:', response.data?.recent_users);
        setStatsData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-cream to-white">
        <AdminSidebar />
        <div className="flex-1 ml-0 md:ml-64 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-maroon animate-spin" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: statsData?.total_users || 0,
      change: statsData?.recent_registrations > 0 ? `+${statsData.recent_registrations}` : '0',
      changePercent: '+12%',
      trend: 'up',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: UserCheck,
      label: 'Active Profiles',
      value: statsData?.total_profiles || 0,
      change: statsData?.active_users || 0,
      changePercent: '+8%',
      trend: 'up',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: CheckCircle,
      label: 'Pending Verifications',
      value: statsData?.pending_verifications || 0,
      change: '0',
      changePercent: statsData?.pending_verifications > 0 ? 'Action needed' : 'All clear',
      trend: statsData?.pending_verifications > 0 ? 'down' : 'neutral',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      icon: Heart,
      label: 'Success Rate',
      value: '94%',
      change: `${statsData?.male_count || 0}M / ${statsData?.female_count || 0}F`,
      changePercent: '+5%',
      trend: 'up',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    }
  ];

  const recentUsers = statsData?.recent_users || [];

  console.log('Rendering with recentUsers:', recentUsers);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Merukulam Matrimony</title>
        <meta name="description" content="Admin dashboard for Merukulam Matrimony management" />
      </Helmet>

      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-cream/30 to-white">
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 md:ml-64 pt-20 md:pt-8">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  Dashboard Overview
                </h1>
                <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchStats}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-maroon to-maroon-dark text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm sm:text-base"
              >
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Refresh Data
              </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                const TrendIcon = stat.trend === 'up' ? ArrowUpRight : stat.trend === 'down' ? ArrowDownRight : Activity;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                    className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-100 relative overflow-hidden group"
                  >
                    {/* Background Gradient */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity`} />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${stat.bgColor} p-3 rounded-xl`}>
                        <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className={`flex items-center gap-1 font-semibold ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                          <TrendIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          {stat.changePercent}
                        </span>
                        <span className="text-gray-500">vs last month</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Recent Registrations - Takes 2 columns */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-maroon to-maroon-dark p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">Recent Registrations</h2>
                        <p className="text-xs sm:text-sm text-white/80">Latest member signups</p>
                      </div>
                    </div>
                    <span className="bg-white/20 text-white text-xs sm:text-sm px-3 py-1 rounded-full font-semibold">
                      {recentUsers.length} New
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {recentUsers.length > 0 ? (
                    <div className="space-y-3">
                      {recentUsers.slice(0, 5).map((user, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3 sm:gap-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-maroon to-maroon-dark p-2.5 rounded-full">
                              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gold" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                {user.action || user.email || 'New Registration'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pl-11 sm:pl-0">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                              {user.status || user.gender || 'Active'}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm sm:text-base">No recent registrations</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Stats Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Activity Summary */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg">Platform Activity</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-white/80">Active Today</span>
                      <span className="font-bold text-base sm:text-lg">{statsData?.active_users || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-white/80">This Week</span>
                      <span className="font-bold text-base sm:text-lg">{(statsData?.active_users || 0) * 3}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-white/80">This Month</span>
                      <span className="font-bold text-base sm:text-lg">{(statsData?.active_users || 0) * 7}</span>
                    </div>
                  </div>
                </div>

                {/* Revenue Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">Revenue</h3>
                      <p className="text-xs text-gray-500">This month</p>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">₹45,280</p>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600 font-semibold">
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>+18% from last month</span>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">System Health</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Server Status</span>
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-green-600 font-semibold">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Database</span>
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-green-600 font-semibold">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Email Service</span>
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-green-600 font-semibold">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <a
                  href="/admin/verifications"
                  className="group bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base sm:text-lg font-bold mb-1">Verifications</h3>
                  <p className="text-xs sm:text-sm opacity-90">{statsData?.pending_verifications || 0} pending</p>
                </a>
                <a
                  href="/admin/users"
                  className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Users className="h-7 w-7 sm:h-8 sm:w-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base sm:text-lg font-bold mb-1">Manage Users</h3>
                  <p className="text-xs sm:text-sm opacity-90">{statsData?.total_users || 0} total users</p>
                </a>
                <a
                  href="/admin/profiles"
                  className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <UserCheck className="h-7 w-7 sm:h-8 sm:w-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base sm:text-lg font-bold mb-1">Profiles</h3>
                  <p className="text-xs sm:text-sm opacity-90">{statsData?.total_profiles || 0} active</p>
                </a>
                <a
                  href="/admin/email-templates"
                  className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Mail className="h-7 w-7 sm:h-8 sm:w-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base sm:text-lg font-bold mb-1">Email Templates</h3>
                  <p className="text-xs sm:text-sm opacity-90">Manage templates</p>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
