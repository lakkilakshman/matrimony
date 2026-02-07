
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Eye, Ban, CheckCircle, Mail, Phone, X, Edit2, Save } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getAllUsers, updateUserStatus, updateUserProfile } from '@/services/adminService';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const { toast } = useToast();

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const response = await getAllUsers(page, pagination.limit);
            if (response.success) {
                setUsers(response.data.users);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast({
                title: 'Error',
                description: 'Failed to load users from database',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter users locally for the search (we can also do this on backend later)
    const filteredUsers = users.filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.matrimony_id && user.matrimony_id.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = async (userId, newStatus) => {
        try {
            const response = await updateUserStatus(userId, newStatus);
            if (response.success) {
                toast({
                    title: 'Status Updated',
                    description: `User status changed to ${newStatus}`,
                });
                // Update local state
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
                if (selectedUser?.id === userId) {
                    setSelectedUser(prev => ({ ...prev, status: newStatus }));
                }
            }
        } catch (error) {
            toast({
                title: 'Action Failed',
                description: 'Failed to update user status',
                variant: 'destructive'
            });
        }
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setEditedUser({ ...user });
        setIsEditing(false);
    };

    const handleEditUser = () => {
        setIsEditing(true);
    };

    const handleSaveUser = async () => {
        try {
            const response = await updateUserProfile(editedUser.id, editedUser);
            if (response.success) {
                toast({
                    title: 'User Updated',
                    description: `${editedUser.first_name}'s information has been updated.`,
                });
                setSelectedUser(editedUser);
                setIsEditing(false);
                // Refresh list to show updated names/data
                fetchData(pagination.page);
            }
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: 'Failed to save user changes',
                variant: 'destructive'
            });
        }
    };

    const handleClosePanel = () => {
        setSelectedUser(null);
        setIsEditing(false);
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            blocked: 'bg-red-100 text-red-700',
            inactive: 'bg-gray-100 text-gray-700',
            suspended: 'bg-orange-100 text-orange-700'
        };
        return styles[status] || styles.active;
    };

    return (
        <>
            <Helmet>
                <title>Manage Users - Admin Panel</title>
            </Helmet>

            <div className="flex min-h-screen bg-gradient-to-br from-cream to-white">
                <AdminSidebar />

                <div className={`flex-1 p-4 md:p-8 ml-0 md:ml-64 pt-20 md:pt-8 transition-all duration-300 ${selectedUser ? 'mr-0 md:mr-96' : ''}`}>
                    <div className="p-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h1 className="text-4xl font-bold text-maroon mb-2 flex items-center">
                                <Users className="h-10 w-10 mr-3 text-gold" />
                                User Management
                            </h1>
                            <p className="text-maroon/70 text-lg">
                                View and manage all registered users ({pagination.total} total)
                            </p>
                        </motion.div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gold/20 p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-maroon mb-2">
                                        Search Users
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gold" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name, email or ID..."
                                            className="w-full pl-10 pr-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-maroon mb-2">
                                        Filter by Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                    >
                                        <option value="all">All Users</option>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="blocked">Blocked</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gold/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-maroon to-maroon-dark text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gold/20">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon mx-auto mb-4"></div>
                                                    <p className="text-maroon/60">Loading users...</p>
                                                </td>
                                            </tr>
                                        ) : filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, index) => (
                                                <motion.tr
                                                    key={user.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`hover:bg-cream/30 transition-colors ${selectedUser?.id === user.id ? 'bg-gold/10' : ''}`}
                                                >
                                                    <td className="px-6 py-4 text-left align-middle">
                                                        <div>
                                                            <p className="font-semibold text-maroon">
                                                                {user.first_name} {user.last_name || ''}
                                                            </p>
                                                            <p className="text-xs font-bold text-gold">{user.matrimony_id || `ID: ${user.id}`}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-left align-middle">
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-maroon flex items-center">
                                                                <Mail className="h-3 w-3 mr-2 text-gold" />
                                                                {user.email}
                                                            </p>
                                                            <p className="text-sm text-maroon flex items-center">
                                                                <Phone className="h-3 w-3 mr-2 text-gold" />
                                                                {user.mobile || 'Not provided'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-left align-middle">
                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-maroon/10 text-maroon uppercase">
                                                            {user.role || 'user'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-left align-middle">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(user.status)}`}>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-left align-middle">
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-gold text-maroon hover:bg-gold/10"
                                                                onClick={() => handleViewUser(user)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            {user.status === 'active' ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                                                    onClick={() => handleStatusChange(user.id, 'blocked')}
                                                                >
                                                                    <Ban className="h-4 w-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-green-500 text-green-500 hover:bg-green-50"
                                                                    onClick={() => handleStatusChange(user.id, 'active')}
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <p className="text-maroon/70">No users found matching your criteria</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {!loading && pagination.totalPages > 1 && (
                            <div className="mt-6 flex justify-center space-x-2">
                                {[...Array(pagination.totalPages)].map((_, i) => (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant={pagination.page === i + 1 ? 'default' : 'outline'}
                                        className={pagination.page === i + 1 ? 'bg-maroon' : 'border-gold text-maroon'}
                                        onClick={() => fetchData(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side Panel */}
                <AnimatePresence>
                    {selectedUser && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 h-screen w-full md:w-96 bg-white shadow-2xl border-l-2 border-gold/20 overflow-y-auto z-40"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-maroon">User Details</h2>
                                    <div className="flex space-x-2">
                                        {!isEditing ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-gold text-maroon hover:bg-gold/10"
                                                onClick={handleEditUser}
                                            >
                                                <Edit2 className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="bg-green-500 text-white hover:bg-green-600"
                                                onClick={handleSaveUser}
                                            >
                                                <Save className="h-4 w-4 mr-1" />
                                                Save
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-500 text-red-500 hover:bg-red-50"
                                            onClick={handleClosePanel}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* User Information */}
                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-sm font-bold text-maroon/60 uppercase tracking-wider mb-4">Basic Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs text-maroon/50 uppercase font-bold">First Name</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editedUser.first_name || ''}
                                                        onChange={(e) => setEditedUser({ ...editedUser, first_name: e.target.value })}
                                                        className="w-full mt-1 px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
                                                    />
                                                ) : (
                                                    <p className="font-semibold text-maroon">{selectedUser.first_name || 'N/A'}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-xs text-maroon/50 uppercase font-bold">Last Name</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editedUser.last_name || ''}
                                                        onChange={(e) => setEditedUser({ ...editedUser, last_name: e.target.value })}
                                                        className="w-full mt-1 px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
                                                    />
                                                ) : (
                                                    <p className="font-semibold text-maroon">{selectedUser.last_name || 'N/A'}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-xs text-maroon/50 uppercase font-bold">Email</label>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        value={editedUser.email || ''}
                                                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                                                        className="w-full mt-1 px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
                                                    />
                                                ) : (
                                                    <p className="font-semibold text-maroon">{selectedUser.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-xs text-maroon/50 uppercase font-bold">Mobile</label>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        value={editedUser.mobile || ''}
                                                        onChange={(e) => setEditedUser({ ...editedUser, mobile: e.target.value })}
                                                        className="w-full mt-1 px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
                                                    />
                                                ) : (
                                                    <p className="font-semibold text-maroon">{selectedUser.mobile || 'Not provided'}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-xs text-maroon/50 uppercase font-bold">Gender</label>
                                                <p className="font-semibold text-maroon capitalize">{selectedUser.gender || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-maroon/50 uppercase font-bold">Account Status</label>
                                                {isEditing ? (
                                                    <select
                                                        value={editedUser.status}
                                                        onChange={(e) => setEditedUser({ ...editedUser, status: e.target.value })}
                                                        className="w-full mt-1 px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="pending">Pending</option>
                                                        <option value="blocked">Blocked</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(selectedUser.status)}`}>
                                                        {selectedUser.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Info Summary */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-sm font-bold text-maroon/60 uppercase tracking-wider mb-4">Profile Summary</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-maroon/60">Age:</span>
                                                <span className="font-semibold text-maroon">{selectedUser.age || 'N/A'} years</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-maroon/60">Location:</span>
                                                <span className="font-semibold text-maroon">
                                                    {selectedUser.city || 'N/A'}, {selectedUser.state || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-maroon/60">Occupation:</span>
                                                <span className="font-semibold text-maroon">{selectedUser.occupation || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-maroon/60">Profile Status:</span>
                                                <span className={`font-bold uppercase ${selectedUser.profile_status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {selectedUser.profile_status || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gold/10">
                                            <p className="text-xs text-maroon/40 italic">
                                                To manage full profile details, gallery and verifications, use the specific "Profiles" or "Verifications" tabs.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default AdminUsersPage;
