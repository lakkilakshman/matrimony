import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Save, Upload, CreditCard, Banknote, QrCode, AlertCircle, Check } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx';
import { useToast } from '@/components/ui/use-toast';
import api from '@/services/api';

const AdminPaymentSettingsPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        account_holder_name: '',
        branch_name: '',
        upi_id: '',
        qr_code_image: ''
    });
    const [qrFile, setQrFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/payments/settings');
            if (response.success) {
                setSettings(response.data);
                if (response.data.qr_code_image) {
                    setPreviewUrl(`http://localhost:5000${response.data.qr_code_image}`);
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Don't show error if it's just 404 (not configured yet)
            if (error.response?.status !== 404) {
                toast({
                    title: "Error",
                    description: "Failed to load payment settings",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    title: "File too large",
                    description: "QR Code image should be less than 2MB",
                    variant: "destructive"
                });
                return;
            }
            setQrFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('bank_name', settings.bank_name);
            formData.append('account_number', settings.account_number);
            formData.append('ifsc_code', settings.ifsc_code);
            formData.append('account_holder_name', settings.account_holder_name);
            formData.append('branch_name', settings.branch_name);
            formData.append('upi_id', settings.upi_id);

            if (qrFile) {
                formData.append('qr_code', qrFile);
            }

            const response = await api.put('/payments/admin/settings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.success) {
                toast({
                    title: "Success",
                    description: "Payment settings updated successfully",
                });
                // Refresh settings to get updated image path if changed
                fetchSettings();
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast({
                title: "Error",
                description: "Failed to update settings",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Helmet>
                <title>Payment Settings | Admin Dashboard</title>
            </Helmet>

            <AdminSidebar />

            <div className="flex-1 p-4 md:p-8 ml-0 md:ml-64 pt-20 md:pt-8 text-left">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
                            <p className="text-gray-500 mt-1">Manage bank details and UPI configuration for payments</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Bank Details Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                <Banknote className="h-5 w-5 text-maroon" />
                                <h2 className="text-xl font-bold text-gray-900">Bank Transfer Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">Bank Name</Label>
                                    <Input
                                        id="bank_name"
                                        name="bank_name"
                                        value={settings.bank_name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. State Bank of India"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="account_holder_name">Account Holder Name</Label>
                                    <Input
                                        id="account_holder_name"
                                        name="account_holder_name"
                                        value={settings.account_holder_name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Merukulam Matrimony"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="account_number">Account Number</Label>
                                    <Input
                                        id="account_number"
                                        name="account_number"
                                        value={settings.account_number}
                                        onChange={handleInputChange}
                                        placeholder="Enter account number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ifsc_code">IFSC Code</Label>
                                    <Input
                                        id="ifsc_code"
                                        name="ifsc_code"
                                        value={settings.ifsc_code}
                                        onChange={handleInputChange}
                                        placeholder="e.g. SBIN0001234"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="branch_name">Branch Name</Label>
                                    <Input
                                        id="branch_name"
                                        name="branch_name"
                                        value={settings.branch_name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Hyderabad Main Branch"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* UPI & QR Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                <QrCode className="h-5 w-5 text-maroon" />
                                <h2 className="text-xl font-bold text-gray-900">UPI & QR Code</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="upi_id">UPI ID (VPA)</Label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="upi_id"
                                                name="upi_id"
                                                value={settings.upi_id}
                                                onChange={handleInputChange}
                                                className="pl-9"
                                                placeholder="e.g. merukulam@sbi"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">This UPI ID will be displayed to users for copy-paste.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Upload QR Code Image</Label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-maroon/50 transition-colors text-center cursor-pointer relative bg-gray-50">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center">
                                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600 font-medium">Click to upload QR Code</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG (max 2MB)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <Label className="mb-4 text-gray-500">QR Code Preview</Label>
                                    {previewUrl ? (
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <img
                                                src={previewUrl}
                                                alt="QR Code Preview"
                                                className="w-48 h-48 object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-48 h-48 border-2 border-gray-200 border-dashed rounded-lg flex items-center justify-center bg-gray-100 text-gray-400">
                                            No QR Code
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-maroon hover:bg-maroon-dark text-white px-8 py-6 text-lg shadow-lg"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        Save Settings
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminPaymentSettingsPage;
