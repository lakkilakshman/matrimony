import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Check, Copy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from '@/components/ui/use-toast';

const PaymentPage = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [plan, setPlan] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [transactionId, setTransactionId] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plansRes, settingsRes] = await Promise.all([
                    api.get('/payments/plans'),
                    api.get('/payments/settings')
                ]);

                if (plansRes.success) {
                    const selectedPlan = plansRes.data.find(p => p.id === parseInt(planId));
                    if (selectedPlan) {
                        setPlan(selectedPlan);
                    } else {
                        toast({
                            title: "Error",
                            description: "Plan not found",
                            variant: "destructive"
                        });
                        navigate('/pricing');
                    }
                }

                if (settingsRes.success) {
                    setSettings(settingsRes.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: "Error",
                    description: "Failed to load payment details",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [planId, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "Error",
                    description: "File size should be less than 5MB",
                    variant: "destructive"
                });
                return;
            }
            setProofFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Copied to clipboard",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!proofFile) {
            toast({
                title: "Required",
                description: "Please upload payment screenshot/proof",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('plan_id', planId);
        formData.append('payment_method', paymentMethod);
        formData.append('transaction_id', transactionId);
        formData.append('payment_proof', proofFile);

        try {
            const response = await api.post('/payments', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.success) {
                setIsSuccess(true);
                toast({
                    title: "Success",
                    description: "Payment submitted successfully!",
                });
            }
        } catch (error) {
            console.error('Payment submission error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to submit payment",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
                        <p className="text-gray-600 mb-8">
                            Thank you for your payment. We have received your request and it is currently under review.
                            Your subscription will be activated once the payment is verified by our admin.
                        </p>
                        <Button
                            onClick={() => navigate('/profile')}
                            className="w-full bg-maroon text-white hover:bg-maroon-dark py-6 text-lg"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Complete Payment - Merukulam Matrimony</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50 pb-20">
                <Navbar />

                <div className="pt-24 px-4 max-w-3xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/pricing')}
                        className="mb-6 hover:bg-transparent hover:text-maroon pl-0"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Plans
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Order Summary */}
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                                <div className="border-b border-gray-100 pb-4 mb-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">{plan.name}</span>
                                        <span className="font-medium">₹{plan.price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Duration</span>
                                        <span>{plan.duration_months} Months</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold text-maroon">
                                    <span>Total</span>
                                    <span>₹{plan.price}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="md:col-span-2">
                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <h2 className="text-xl font-bold text-maroon mb-6">Payment Method</h2>

                                <div className="flex space-x-4 mb-8">
                                    <button
                                        onClick={() => setPaymentMethod('upi')}
                                        className={`flex-1 py-3 px-4 rounded-lg font-medium border-2 transition-all ${paymentMethod === 'upi'
                                            ? 'border-maroon bg-maroon/5 text-maroon'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        UPI / QR Code
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('bank_transfer')}
                                        className={`flex-1 py-3 px-4 rounded-lg font-medium border-2 transition-all ${paymentMethod === 'bank_transfer'
                                            ? 'border-maroon bg-maroon/5 text-maroon'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        Bank Transfer
                                    </button>
                                </div>

                                {paymentMethod === 'upi' ? (
                                    <div className="text-center mb-8">
                                        <div className="bg-gray-100 p-4 rounded-xl inline-block mb-4">
                                            {settings?.qr_code_image ? (
                                                <img
                                                    src={`http://localhost:5000${settings.qr_code_image}`}
                                                    alt="Payment QR Code"
                                                    className="w-48 h-48 object-contain"
                                                />
                                            ) : (
                                                <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-sm">
                                                    QR Code Not Available
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">Scan QR code using any UPI app</p>
                                        <div className="flex items-center justify-center space-x-2 bg-gray-50 p-3 rounded-lg max-w-xs mx-auto">
                                            <span className="font-mono font-medium text-gray-800">{settings?.upi_id || 'Not Available'}</span>
                                            <button
                                                onClick={() => copyToClipboard(settings?.upi_id)}
                                                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-sm text-gray-600">Bank Name</div>
                                            <div className="text-sm font-medium text-gray-900 text-right">{settings?.bank_name}</div>

                                            <div className="text-sm text-gray-600">Account Number</div>
                                            <div className="text-sm font-medium text-gray-900 text-right font-mono">{settings?.account_number}</div>

                                            <div className="text-sm text-gray-600">IFSC Code</div>
                                            <div className="text-sm font-medium text-gray-900 text-right font-mono">{settings?.ifsc_code}</div>

                                            <div className="text-sm text-gray-600">Account Name</div>
                                            <div className="text-sm font-medium text-gray-900 text-right">{settings?.account_holder_name}</div>

                                            <div className="text-sm text-gray-600">Branch</div>
                                            <div className="text-sm font-medium text-gray-900 text-right">{settings?.branch_name}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Payment Proof</h3>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Transaction ID / Reference Number
                                            </label>
                                            <input
                                                type="text"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-maroon"
                                                placeholder="e.g. UPI1234567890"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Payment Screenshot *
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-maroon transition-colors cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    accept="image/*,.pdf"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                {previewUrl ? (
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview"
                                                            className="h-32 object-contain rounded-lg border border-gray-200"
                                                        />
                                                        <p className="text-xs text-green-600 mt-2 font-medium">Click to change file</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                                                        <p className="text-sm text-gray-600">
                                                            <span className="text-maroon font-medium">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-400">PNG, JPG or PDF (max 5MB)</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon py-6 text-lg font-bold shadow-lg"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Confirm Payment'}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentPage;
