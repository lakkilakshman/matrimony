
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    CircleCheck,
    Settings,
    LogOut,
    Shield,
    List,
    CreditCard,
    Banknote,
    Mail
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
    const location = useLocation();
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/admin-login');
    };

    const menuItems = [
        {
            path: '/admin/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
            description: 'Overview & Statistics'
        },
        {
            path: '/admin/users',
            icon: Users,
            label: 'Users',
            description: 'Manage Users'
        },
        {
            path: '/admin/profiles',
            icon: UserCheck,
            label: 'Profiles',
            description: 'Profile Management'
        },
        {
            path: '/admin/verifications',
            icon: CircleCheck,
            label: 'Verifications',
            description: 'Pending Approvals'
        },
        {
            path: '/admin/form-fields',
            icon: List,
            label: 'Form Fields',
            description: 'Manage Dropdowns'
        },
        {
            path: '/admin/payments',
            icon: Banknote,
            label: 'Payment Approvals',
            description: 'Verify Payments'
        },
        {
            path: '/admin/email-templates',
            icon: Mail,
            label: 'Email Templates',
            description: 'Manage Email Templates'
        },
        {
            path: '/admin/payment-settings',
            icon: CreditCard,
            label: 'Payment Settings',
            description: 'Bank & UPI Details'
        },
        {
            path: '/admin/settings',
            icon: Settings,
            label: 'Settings',
            description: 'System Settings'
        }
    ];

    const isActive = (path) => location.pathname === path;

    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <>
            {/* Mobile Header - Visible only on small screens */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-maroon to-maroon-dark text-white z-40 flex items-center justify-between px-4 shadow-md">
                <div className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-gold" />
                    <span className="font-bold text-lg">Admin Panel</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-md hover:bg-white/10 text-white"
                >
                    {isOpen ? <LogOut className="h-6 w-6 rotate-180" /> : <List className="h-6 w-6" />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 
                bg-gradient-to-b from-maroon-dark to-maroon text-white 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 shadow-xl
            `}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gold p-2 rounded-lg">
                            <Shield className="h-6 w-6 text-maroon" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gold">Admin Panel</h1>
                            <p className="text-xs text-cream/70">Merukulam Matrimony</p>
                        </div>
                    </div>
                </div>

                {/* Admin Info */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gold/20 p-2 rounded-full">
                            <Shield className="h-5 w-5 text-gold" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">
                                {currentUser?.firstName} {currentUser?.lastName}
                            </p>
                            <p className="text-xs text-cream/60">{currentUser?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    <div className="space-y-1 px-3">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)} // Close on click (mobile)
                                    className={`
                                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                                        ${active
                                            ? 'bg-gold text-maroon shadow-lg'
                                            : 'text-cream hover:bg-white/10 hover:text-gold'
                                        }
                                    `}
                                >
                                    <Icon className={`h-5 w-5 ${active ? 'text-maroon' : ''}`} />
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold ${active ? 'text-maroon' : ''}`}>
                                            {item.label}
                                        </p>
                                        <p className={`text-xs ${active ? 'text-maroon/70' : 'text-cream/60'}`}>
                                            {item.description}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm font-semibold">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
