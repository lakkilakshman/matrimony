import React from 'react';
import { User, Image as ImageIcon, CreditCard, Heart, MessageCircle, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

const UserSidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'edit-profile', label: 'Edit Profile', icon: Edit },
        { id: 'album', label: 'My Album', icon: ImageIcon },
        { id: 'plan', label: 'My Plan', icon: CreditCard },
        { id: 'interests', label: 'Interests', icon: Heart },
        { id: 'messages', label: 'Messages', icon: MessageCircle },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gold/20 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-maroon to-maroon-dark text-white">
                <h2 className="text-xl font-bold">Dashboard</h2>
                <p className="text-white/80 text-sm">Manage your account</p>
            </div>
            <div className="p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-gold/10 text-maroon font-semibold border-l-4 border-gold'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-maroon'
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? 'text-maroon' : 'text-gray-400'}`} />
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="ml-auto w-2 h-2 rounded-full bg-gold"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default UserSidebar;
