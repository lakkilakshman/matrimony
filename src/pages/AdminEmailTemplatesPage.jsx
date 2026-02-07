import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Shield, Mail, CircleCheck, CircleX, TriangleAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/AdminSidebar';

const AdminEmailTemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const authToken = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/admin/email-templates`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (response.data.success) {
                setTemplates(response.data.data);
            }
        } catch (error) {
            console.error('Fetch templates error:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load email templates',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (template) => {
        setEditingTemplate({ ...template });
        setIsModalOpen(true);
    };

    const handleUpdateTemplate = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const authToken = localStorage.getItem('authToken');
            const response = await axios.put(
                `${API_URL}/admin/email-templates/${editingTemplate.id}`,
                {
                    subject: editingTemplate.subject,
                    body: editingTemplate.body,
                    is_active: editingTemplate.is_active
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` }
                }
            );

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: 'Template updated successfully',
                });
                setIsModalOpen(false);
                fetchTemplates();
            }
        } catch (error) {
            console.error('Update template error:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update template',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingTemplate(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSendTestEmail = async () => {
        if (!testEmail) {
            toast({
                title: 'Error',
                description: 'Please enter a recipient email address',
                variant: 'destructive',
            });
            return;
        }

        try {
            setSendingTest(true);
            const authToken = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/admin/email-templates/${editingTemplate.id}/test`,
                { email: testEmail },
                {
                    headers: { Authorization: `Bearer ${authToken}` }
                }
            );

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: `Test email sent to ${testEmail}`,
                });
            }
        } catch (error) {
            console.error('Send test email error:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to send test email',
                variant: 'destructive',
            });
        } finally {
            setSendingTest(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-cream to-white">
                <AdminSidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-maroon animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-cream to-white">
            <AdminSidebar />

            <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 md:ml-64 pt-20 md:pt-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 sm:mb-8"
                    >
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-maroon mb-2 flex items-center flex-wrap gap-2">
                            <Mail className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gold" />
                            Email Templates
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-maroon/70">
                            Manage automated email templates for user notifications
                        </p>
                    </motion.div>

                    <div className="mb-8 flex justify-between items-center">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                            <TriangleAlert className="text-blue-500 w-5 h-5 flex-shrink-0" />
                            <p className="text-sm text-blue-700">
                                Use <span className="font-mono bg-blue-100 px-1 rounded">{"{{variableName}}"}</span> syntax for placeholders.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Template Name</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Subject</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Last Updated</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {templates.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Mail className="h-12 w-12 text-gray-300 mb-3" />
                                                    <p className="text-lg font-medium text-gray-900">No templates found</p>
                                                    <p className="text-sm text-gray-500">Email templates will appear here once seeded in the database.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        templates.map((template) => (
                                            <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm sm:text-base">{template.name}</p>
                                                            <p className="text-xs text-gray-500 sm:hidden">{template.subject}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell max-w-xs truncate">
                                                    {template.subject}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                    {template.is_active ? (
                                                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                                                            <CircleCheck className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 whitespace-nowrap">
                                                            <CircleX className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                                                    {new Date(template.updated_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditClick(template)}
                                                        className="text-xs sm:text-sm px-2 sm:px-4"
                                                    >
                                                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                                                        <span className="hidden sm:inline">Edit</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Edit Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col scale-in-center">
                                <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Template: {editingTemplate?.name}</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 p-1">
                                        <CircleX size={20} className="sm:w-6 sm:h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateTemplate} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={editingTemplate?.subject || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
                                            placeholder="Enter email subject"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-1">
                                            <label className="block text-sm font-semibold text-gray-700">Email Body (HTML Supported)</label>
                                            <span className="text-xs text-secondary italic font-semibold">Placeholders like {"{{name}}"} are available</span>
                                        </div>
                                        <textarea
                                            name="body"
                                            value={editingTemplate?.body || ''}
                                            onChange={handleInputChange}
                                            rows={10}
                                            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-xs sm:text-sm"
                                            placeholder="Enter email body HTML"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            name="is_active"
                                            checked={!!editingTemplate?.is_active}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="is_active" className="text-xs sm:text-sm font-medium text-gray-700">
                                            Enable this template (Sends automated emails when triggered)
                                        </label>
                                    </div>
                                </form>

                                <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                                    <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpdateTemplate}
                                        disabled={saving}
                                        className="bg-primary hover:bg-primary-dark px-6 sm:px-8 w-full sm:w-auto order-1 sm:order-2"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>

                                {/* Test Email Section */}
                                <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Send Test Email</h3>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="email"
                                            placeholder="Enter recipient email"
                                            value={testEmail}
                                            onChange={(e) => setTestEmail(e.target.value)}
                                            className="flex-1 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={handleSendTestEmail}
                                            disabled={sendingTest || !testEmail}
                                            className="w-full sm:w-auto whitespace-nowrap"
                                        >
                                            {sendingTest ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                                            Send Test
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AdminEmailTemplatesPage;
