
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, X, Eye, Clock, User } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getPendingVerifications, verifyProfile, getDashboardStats } from '@/services/adminService';

const AdminVerificationsPage = () => {
    const { toast } = useToast();
    const [pendingProfiles, setPendingProfiles] = useState([]);
    const [stats, setStats] = useState({
        pending_verifications: 0,
        verified_profiles: 0,
        blocked_users: 0 // We might not get this exact stat from dashboard endpoint, will check
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profilesRes, statsRes] = await Promise.all([
                getPendingVerifications(),
                getDashboardStats()
            ]);

            if (profilesRes.success) {
                setPendingProfiles(profilesRes.data);
            }

            if (statsRes.success) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch verification data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load pending verifications',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (profileId, userName) => {
        try {
            const response = await verifyProfile(profileId, 'verified', 'Profile approved by admin');

            if (response.success) {
                toast({
                    title: 'Profile Approved',
                    description: `${userName}'s profile has been approved and activated.`,
                    variant: 'default',
                    className: 'bg-green-50 border-green-200'
                });
                // Refresh list
                fetchData();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            toast({
                title: 'Action Failed',
                description: error.message || 'Failed to approve profile',
                variant: 'destructive'
            });
        }
    };

    const handleReject = async (profileId, userName) => {
        if (!window.confirm(`Are you sure you want to reject ${userName}'s profile?`)) {
            return;
        }

        try {
            const response = await verifyProfile(profileId, 'rejected', 'Profile rejected by admin');

            if (response.success) {
                toast({
                    title: 'Profile Rejected',
                    description: `${userName}'s profile has been rejected.`,
                    variant: 'destructive'
                });
                // Refresh list
                fetchData();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            toast({
                title: 'Action Failed',
                description: error.message || 'Failed to reject profile',
                variant: 'destructive'
            });
        }
    };

    return (
        <>
            <Helmet>
                <title>Verifications - Admin Panel</title>
            </Helmet>

            <div className="flex min-h-screen bg-gradient-to-br from-cream to-white">
                <AdminSidebar />

                <div className="flex-1 p-4 md:p-8 ml-0 md:ml-64 pt-20 md:pt-8">
                    <div className="p-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h1 className="text-4xl font-bold text-maroon mb-2 flex items-center">
                                <CheckCircle className="h-10 w-10 mr-3 text-gold" />
                                Pending Verifications
                            </h1>
                            <p className="text-maroon/70 text-lg">
                                Review and approve pending verification requests ({pendingProfiles.length} pending)
                            </p>
                        </motion.div>

                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white rounded-xl shadow-lg border-2 border-gold/20 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-maroon">{pendingProfiles.length}</p>
                                        <p className="text-sm text-maroon/60">Pending Reviews</p>
                                    </div>
                                    <Clock className="h-12 w-12 text-yellow-500" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg border-2 border-gold/20 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-maroon">{stats.verified_profiles || 0}</p>
                                        <p className="text-sm text-maroon/60">Approved Profiles</p>
                                    </div>
                                    <CheckCircle className="h-12 w-12 text-green-500" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg border-2 border-gold/20 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        {/* Dashboard stats might return total_users, need to verify if distinct blocked count is available. 
                                            Assuming generic total users or place holder for now if blocked stat is missing. */}
                                        <p className="text-3xl font-bold text-maroon">{stats.total_users || 0}</p>
                                        <p className="text-sm text-maroon/60">Total Users</p>
                                    </div>
                                    <User className="h-12 w-12 text-maroon" />
                                </div>
                            </div>
                        </div>

                        {/* Pending Verifications List */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto"></div>
                                <p className="mt-4 text-maroon/70">Loading verification requests...</p>
                            </div>
                        ) : pendingProfiles.length > 0 ? (
                            <div className="space-y-4">
                                {pendingProfiles.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-xl shadow-lg border-2 border-gold/20 p-6"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className="bg-gradient-to-br from-maroon to-maroon-dark p-4 rounded-full flex-shrink-0">
                                                    {item.profile_photo ? (
                                                        <img
                                                            src={`http://localhost:5000${item.profile_photo}`}
                                                            alt={item.first_name}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                        />
                                                    ) : null}
                                                    <User className={`h-8 w-8 text-gold ${item.profile_photo ? 'hidden' : ''}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-maroon mb-2">
                                                        {item.first_name} {item.last_name || ''}
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-maroon/70">
                                                        <div>
                                                            <p><span className="font-semibold">Email:</span> {item.email}</p>
                                                            <p><span className="font-semibold">Mobile:</span> {item.mobile || 'Not provided'}</p>
                                                            <p><span className="font-semibold">Gender:</span> {item.gender}</p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-semibold">Age:</span> {item.age ? `${item.age} years` : 'N/A'}</p>
                                                            <p><span className="font-semibold">Location:</span> {item.city || 'N/A'}, {item.state || 'N/A'}</p>
                                                            <p><span className="font-semibold">Occupation:</span> {item.occupation || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                                            Pending Verification
                                                        </span>
                                                        <span className="ml-2 text-xs text-maroon/50">
                                                            ID: {item.matrimony_id || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-2 ml-4">
                                                <Button
                                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 w-full"
                                                    onClick={() => handleApprove(item.id, item.first_name)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="border-red-500 text-red-500 hover:bg-red-50 w-full"
                                                    onClick={() => handleReject(item.id, item.first_name)}
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="border-gold text-maroon hover:bg-gold/10 w-full"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg border-2 border-gold/20 p-12 text-center">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-maroon mb-2">All Caught Up!</h3>
                                <p className="text-maroon/70">There are no pending verifications at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminVerificationsPage;
