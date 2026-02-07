import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import * as formFieldsService from '@/services/formFieldsService';

const AdminFormFieldsPage = () => {
    const { toast } = useToast();

    const [formFields, setFormFields] = useState({});
    const [selectedField, setSelectedField] = useState('maritalStatus');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [newValue, setNewValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fieldLabels = {
        maritalStatus: 'Marital Status',
        height: 'Height',
        education: 'Education',
        occupation: 'Occupation',
        annualIncome: 'Annual Income',
        religion: 'Religion',
        caste: 'Caste',
        raasi: 'Raasi / Moon Sign',
        star: 'Star / Nakshatra',
        fatherOccupation: "Father's Occupation",
        motherOccupation: "Mother's Occupation",
        city: 'City',
        state: 'State'
    };

    // Fetch all form field options on mount
    useEffect(() => {
        fetchFormFields();
    }, []);

    const fetchFormFields = async () => {
        try {
            setLoading(true);
            const response = await formFieldsService.getAllFormFieldOptions();
            if (response.success) {
                setFormFields(response.data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load form fields',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newValue.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a value',
                variant: 'destructive'
            });
            return;
        }

        try {
            setSaving(true);

            // Generate a value from the label (lowercase, replace spaces with underscores)
            const optionValue = newValue.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

            const response = await formFieldsService.addFieldOption(
                selectedField,
                optionValue,
                newValue.trim()
            );

            if (response.success) {
                await fetchFormFields(); // Refresh the list
                setNewValue('');
                toast({
                    title: 'Success',
                    description: `Added "${newValue}" to ${fieldLabels[selectedField]}`
                });
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Add option error:', error);
            const errorMessage = typeof error === 'string' ? error : error.message || 'Failed to add option';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (option) => {
        setEditingId(option.id);
        setEditValue(option.label);
    };

    const handleSaveEdit = async (id) => {
        if (!editValue.trim()) {
            toast({
                title: 'Error',
                description: 'Value cannot be empty',
                variant: 'destructive'
            });
            return;
        }

        try {
            setSaving(true);

            const response = await formFieldsService.updateFieldOption(
                id,
                editValue.trim()
            );

            if (response.success) {
                await fetchFormFields(); // Refresh the list
                setEditingId(null);
                setEditValue('');
                toast({
                    title: 'Success',
                    description: 'Updated successfully'
                });
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Update option error:', error);
            const errorMessage = typeof error === 'string' ? error : error.message || 'Failed to update option';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, label) => {
        if (window.confirm(`Are you sure you want to delete "${label}"?`)) {
            try {
                setSaving(true);

                const response = await formFieldsService.deleteFieldOption(id);

                if (response.success) {
                    await fetchFormFields(); // Refresh the list
                    toast({
                        title: 'Success',
                        description: 'Deleted successfully'
                    });
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Delete option error:', error);
                const errorMessage = typeof error === 'string' ? error : error.message || 'Failed to delete option';
                toast({
                    title: 'Error',
                    description: errorMessage,
                    variant: 'destructive'
                });
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-maroon animate-spin" />
                </div>
            </div>
        );
    }

    const currentFieldOptions = formFields[selectedField] || [];

    return (
        <>
            <Helmet>
                <title>Form Field Management - Admin Panel</title>
            </Helmet>

            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />

                <div className="flex-1 p-4 md:p-8 ml-0 md:ml-64 pt-20 md:pt-8">
                    <div className="p-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-maroon mb-2">Form Field Management</h1>
                            <p className="text-gray-600">Manage dropdown options for registration form fields</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Field Selector */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow p-4">
                                    <h3 className="font-bold text-maroon mb-4">Select Field</h3>
                                    <div className="space-y-2">
                                        {Object.keys(fieldLabels).map((field) => (
                                            <button
                                                key={field}
                                                onClick={() => {
                                                    setSelectedField(field);
                                                    setEditingId(null);
                                                    setNewValue('');
                                                }}
                                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedField === field
                                                    ? 'bg-maroon text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    }`}
                                            >
                                                {fieldLabels[field]}
                                                <span className="ml-2 text-xs opacity-75">
                                                    ({(formFields[field] || []).length})
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Options List */}
                            <div className="lg:col-span-3">
                                <div className="bg-white rounded-lg shadow">
                                    {/* Add New Option */}
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="font-bold text-maroon mb-4">
                                            Add New {fieldLabels[selectedField]} Option
                                        </h3>
                                        <div className="flex flex-col md:flex-row gap-3">
                                            <input
                                                type="text"
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && !saving && handleAdd()}
                                                placeholder={`Enter new ${fieldLabels[selectedField].toLowerCase()} option`}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
                                                disabled={saving}
                                            />
                                            <Button
                                                onClick={handleAdd}
                                                className="bg-maroon hover:bg-maroon-dark text-white w-full md:w-auto"
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Plus className="w-4 h-4 mr-2" />
                                                )}
                                                Add
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Existing Options */}
                                    <div className="p-6">
                                        <h3 className="font-bold text-maroon mb-4">
                                            Existing {fieldLabels[selectedField]} Options
                                        </h3>
                                        <div className="space-y-2">
                                            {currentFieldOptions.map((option) => (
                                                <motion.div
                                                    key={option.id || option.value}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    {editingId === option.id ? (
                                                        <>
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && !saving && handleSaveEdit(option.id)}
                                                                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-maroon"
                                                                autoFocus
                                                                disabled={saving}
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(option.id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                disabled={saving}
                                                            >
                                                                {saving ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <Save className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(null);
                                                                    setEditValue('');
                                                                }}
                                                                className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                                                disabled={saving}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="flex-1 font-medium text-gray-700">{option.label}</span>
                                                            <button
                                                                onClick={() => handleEdit(option)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                disabled={saving}
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(option.id, option.label)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                disabled={saving}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminFormFieldsPage;
