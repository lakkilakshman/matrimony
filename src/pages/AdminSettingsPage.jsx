import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Settings, Save, Database, Bell, Shield, Globe, Hash, Loader2, Mail } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import * as settingsService from '@/services/settingsService';

const AdminSettingsPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        site_name: '',
        site_email: '',
        auto_approval: false,
        email_notifications: true,
        sms_notifications: false,
        maintenance_mode: false,
        matrimony_id_prefix: 'MKM',
        matrimony_id_start_number: 1,
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_pass: '',
        smtp_from_name: 'Merukayana Matrimony',
        smtp_from_email: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsService.getSettings();
            if (response.success) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast({
                title: 'Error',
                description: 'Failed to load system settings.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await settingsService.updateSettings(settings);
            if (response.success) {
                toast({
                    title: 'Settings Saved',
                    description: 'Your settings have been updated successfully.',
                });
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast({
                title: 'Error',
                description: 'Failed to save settings.',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const settingsSections = [
        {
            icon: Globe,
            title: 'General Settings',
            description: 'Basic application configuration',
            fields: [
                { label: 'Site Name', key: 'site_name', type: 'text' },
                { label: 'Admin Email', key: 'site_email', type: 'email' }
            ]
        },
        {
            icon: Hash,
            title: 'Matrimony ID Configuration',
            description: 'Configure matrimony ID series and format',
            fields: [
                { label: 'ID Prefix (e.g., MKM)', key: 'matrimony_id_prefix', type: 'text', placeholder: 'MKM', helpText: 'Prefix for all matrimony IDs' },
                { label: 'Starting Number', key: 'matrimony_id_start_number', type: 'number', placeholder: '1', helpText: 'Next profile will get this number' }
            ]
        },
        {
            icon: Shield,
            title: 'Security & Verification',
            description: 'User verification and security settings',
            fields: [
                { label: 'Auto-approve new profiles', key: 'auto_approval', type: 'checkbox' },
                { label: 'Maintenance Mode', key: 'maintenance_mode', type: 'checkbox' }
            ]
        },
        {
            icon: Bell,
            title: 'Notifications',
            description: 'Configure notification preferences',
            fields: [
                { label: 'Email Notifications', key: 'email_notifications', type: 'checkbox' },
                { label: 'SMS Notifications', key: 'sms_notifications', type: 'checkbox' }
            ]
        },
        {
            icon: Mail,
            title: 'Email Server (SMTP)',
            description: 'Configure outgoing email server settings',
            fields: [
                { label: 'SMTP Host', key: 'smtp_host', type: 'text', placeholder: 'smtp.gmail.com' },
                { label: 'SMTP Port', key: 'smtp_port', type: 'number', placeholder: '587' },
                { label: 'SMTP User / Email', key: 'smtp_user', type: 'text', placeholder: 'your-email@gmail.com' },
                { label: 'SMTP Password / App Password', key: 'smtp_pass', type: 'password', placeholder: 'App Password' },
                { label: 'From Name', key: 'smtp_from_name', type: 'text', placeholder: 'Merukayana Matrimony' },
                { label: 'From Email', key: 'smtp_from_email', type: 'email', placeholder: 'no-reply@merukulam.com' }
            ]
        }
    ];

    // Preview matrimony ID
    const getPreviewId = () => {
        return `${settings.matrimony_id_prefix}${String(settings.matrimony_id_start_number).padStart(6, '0')}`;
    };

    return (
        <>
            <Helmet>
                <title>Settings - Admin Panel</title>
            </Helmet>

            <div className="flex min-h-screen bg-gradient-to-br from-cream to-white">
                <AdminSidebar />

                <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 md:ml-64 pt-20 md:pt-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-screen">
                            <Loader2 className="h-12 w-12 text-maroon animate-spin" />
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 sm:mb-8"
                            >
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-maroon mb-2 flex items-center flex-wrap gap-2">
                                    <Settings className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gold" />
                                    System Settings
                                </h1>
                                <p className="text-sm sm:text-base md:text-lg text-maroon/70">
                                    Configure application settings and preferences
                                </p>
                            </motion.div>

                            <div className="space-y-4 sm:space-y-6">
                                {settingsSections.map((section, index) => {
                                    const Icon = section.icon;
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white rounded-xl shadow-lg border-2 border-gold/20 overflow-hidden"
                                        >
                                            <div className="bg-gradient-to-r from-maroon to-maroon-dark p-4 sm:p-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-gold p-2 sm:p-3 rounded-lg">
                                                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-maroon" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-lg sm:text-xl font-bold text-white">{section.title}</h2>
                                                        <p className="text-xs sm:text-sm text-cream/80">{section.description}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                                {section.fields.map((field) => (
                                                    <div key={field.key} className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-700">
                                                            {field.label}
                                                        </label>
                                                        {field.type === 'checkbox' ? (
                                                            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!settings[field.key]}
                                                                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.checked })}
                                                                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                                />
                                                                <span className="text-xs sm:text-sm text-gray-600">
                                                                    {field.label === 'Auto-approve new profiles' && 'Automatically verify new user profiles'}
                                                                    {field.label === 'Maintenance Mode' && 'Enable maintenance mode for the site'}
                                                                    {field.label === 'Email Notifications' && 'Send email notifications to users'}
                                                                    {field.label === 'SMS Notifications' && 'Send SMS notifications to users'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type={field.type}
                                                                    value={settings[field.key] || ''}
                                                                    onChange={(e) => setSettings({ ...settings, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                                                                    placeholder={field.placeholder}
                                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
                                                                />
                                                                {field.helpText && (
                                                                    <p className="text-xs sm:text-sm text-gray-500 italic">{field.helpText}</p>
                                                                )}
                                                                {field.key === 'matrimony_id_start_number' && (
                                                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                        <p className="text-xs sm:text-sm text-blue-700 font-medium">
                                                                            Preview: <span className="font-mono font-bold">{getPreviewId()}</span>
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon px-8 py-3"
                                    >
                                        {saving ? (
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="h-5 w-5 mr-2" />
                                        )}
                                        {saving ? 'Saving...' : 'Save All Settings'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminSettingsPage;
