import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
    CheckCircle, XCircle, Search, Filter, Eye, Download,
    Calendar, CreditCard, User, AlertCircle
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog.jsx";
import { useToast } from '@/components/ui/use-toast';
import api from '@/services/api';

const AdminPaymentsPage = () => {
    const { toast } = useToast();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [actionNote, setActionNote] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showProofDialog, setShowProofDialog] = useState(false);
    const [showActionDialog, setShowActionDialog] = useState(false);
    const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

    useEffect(() => {
        fetchPayments();
    }, [filterStatus]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStatus !== 'all') params.status = filterStatus;

            const response = await api.get('/payments/admin/all', { params });
            if (response.success) {
                setPayments(response.data);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast({
                title: "Error",
                description: "Failed to fetch payments",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewProof = (payment) => {
        setSelectedPayment(payment);
        setShowProofDialog(true);
    };

    const handleActionClick = (payment, type) => {
        setSelectedPayment(payment);
        setActionType(type);
        setActionNote('');
        setShowActionDialog(true);
    };

    const handleProcessPayment = async () => {
        if (!selectedPayment || !actionType) return;

        setIsActionLoading(true);
        try {
            const endpoint = `/payments/admin/${selectedPayment.id}/${actionType}`;
            const response = await api.put(endpoint, { admin_notes: actionNote });

            if (response.success) {
                toast({
                    title: "Success",
                    description: `Payment ${actionType}d successfully`,
                });
                setShowActionDialog(false);
                fetchPayments(); // Refresh list
            }
        } catch (error) {
            console.error(`Error ${actionType}ing payment:`, error);
            toast({
                title: "Error",
                description: `Failed to ${actionType} payment`,
                variant: "destructive"
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Rejected</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Helmet>
                <title>Payment Approvals | Admin Dashboard</title>
            </Helmet>

            <AdminSidebar />

            <div className="flex-1 p-4 md:p-8 ml-0 md:ml-64 pt-20 md:pt-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Payment Approvals</h1>
                            <p className="text-gray-500 mt-1">Verify and manage user subscription payments</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilterStatus('all')}
                                className={filterStatus === 'all' ? 'bg-maroon hover:bg-maroon-dark' : ''}
                            >
                                All
                            </Button>
                            <Button
                                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                                onClick={() => setFilterStatus('pending')}
                                className={filterStatus === 'pending' ? 'bg-maroon hover:bg-maroon-dark' : ''}
                            >
                                Pending
                            </Button>
                            <Button
                                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                                onClick={() => setFilterStatus('approved')}
                                className={filterStatus === 'approved' ? 'bg-maroon hover:bg-maroon-dark' : ''}
                            >
                                Approved
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name, email, or transaction ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">User Details</th>
                                        <th className="px-6 py-4">Plan & Amount</th>
                                        <th className="px-6 py-4">Payment Method</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                Loading payments...
                                            </td>
                                        </tr>
                                    ) : filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                No payments found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{payment.user_name || 'N/A'}</div>
                                                    <div className="text-gray-500 text-xs">{payment.user_email}</div>
                                                    <div className="text-gray-500 text-xs">{payment.user_mobile}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-maroon">{payment.plan_name}</div>
                                                    <div className="text-gray-900 font-bold">₹{payment.amount}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="capitalize">{payment.payment_method.replace('_', ' ')}</div>
                                                    <div className="text-gray-500 text-xs font-mono">{payment.transaction_id || 'No Txn ID'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(payment.created_at).toLocaleDateString()}
                                                    <div className="text-xs">{new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(payment.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewProof(payment)}
                                                            title="View Proof"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {payment.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                    onClick={() => handleActionClick(payment, 'approve')}
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleActionClick(payment, 'reject')}
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* View Proof Dialog */}
            <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Payment Proof</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 flex flex-col items-center">
                        {selectedPayment?.payment_proof ? (
                            selectedPayment.payment_proof.endsWith('.pdf') ? (
                                <iframe
                                    src={`http://localhost:5000${selectedPayment.payment_proof}`}
                                    className="w-full h-[500px] border rounded"
                                    title="Payment Proof PDF"
                                />
                            ) : (
                                <img
                                    src={`http://localhost:5000${selectedPayment.payment_proof}`}
                                    alt="Payment Proof"
                                    className="max-h-[500px] object-contain rounded border"
                                />
                            )
                        ) : (
                            <div className="h-40 flex items-center text-gray-500">No proof uploaded</div>
                        )}

                        <div className="mt-4 flex gap-4">
                            <a
                                href={`http://localhost:5000${selectedPayment?.payment_proof}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                            >
                                <Download className="h-4 w-4" /> Download Original
                            </a>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Approve/Reject Confirmation Dialog */}
            <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className={actionType === 'approve' ? 'text-green-600' : 'text-red-600'}>
                            {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-gray-600">
                            Are you sure you want to {actionType} this payment from
                            <span className="font-bold"> {selectedPayment?.user_name}</span>?
                        </p>
                        {actionType === 'approve' && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm text-green-800 flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 mt-0.5" />
                                <div>
                                    Buying <strong>{selectedPayment?.plan_name}</strong> plan.
                                    <br />User's subscription will be activated immediately.
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Admin Notes {actionType === 'reject' && <span className="text-red-500">*</span>}
                            </label>
                            <Input
                                value={actionNote}
                                onChange={(e) => setActionNote(e.target.value)}
                                placeholder={actionType === 'approve' ? "Optional note..." : "Reason for rejection..."}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowActionDialog(false)}>Cancel</Button>
                        <Button
                            className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            onClick={handleProcessPayment}
                            disabled={isActionLoading || (actionType === 'reject' && !actionNote)}
                        >
                            {isActionLoading ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPaymentsPage;
