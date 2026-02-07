
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut, Bell, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import MobileMenu from '@/components/MobileMenu';
import { getNotifications, markAllAsRead, markAsRead } from '@/services/notificationService';
import { toast } from '@/components/ui/use-toast';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Rotating Telugu titles
  const teluguTitles = [
    'మేరుకులం వివాహ సేవలు',
    'మీ జీవిత భాగస్వామిని కనుగొనండి',
    'విశ్వసనీయ వైవాహిక సేవ',
    'మంచి జంట కోసం'
  ];
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);

  // Rotate Telugu titles every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % teluguTitles.length);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response && response.success) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      const response = await markAllAsRead();
      if (response && response.success) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await markAsRead(notif.id);
        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate based on notification type
    setIsNotificationsOpen(false);
    if (notif.type === 'interest_received') {
      navigate('/profile'); // User Profile page shows Received Interests
    } else if (notif.type === 'message') {
      navigate('/messages');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-maroon to-maroon-dark shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Rotating Telugu Title */}
            <Link to="/" className="flex flex-col items-start">
              <span className="text-lg sm:text-xl font-bold text-white">Merukulam Matrimony</span>
              <span className="text-[10px] sm:text-xs text-gold/90 font-medium transition-opacity duration-500 block">
                {teluguTitles[currentTitleIndex]}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-white hover:text-gold transition-colors font-medium">
                Home
              </Link>
              <Link to="/about" className="text-white hover:text-gold transition-colors font-medium">
                About
              </Link>
              <Link to="/contact" className="text-white hover:text-gold transition-colors font-medium">
                Contact
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/browse" className="text-white hover:text-gold transition-colors font-medium">
                    All Profiles
                  </Link>
                </>
              )}

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="text-white hover:text-gold transition-colors p-2 relative"
                      aria-label="Notifications"
                    >
                      <Bell className="h-6 w-6" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-maroon">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                        <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center h-10">
                          <h3 className="font-bold text-maroon text-sm">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-gold hover:text-maroon text-xs font-semibold"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 relative ${!notif.is_read ? 'bg-gold/5' : ''
                                  }`}
                              >
                                {!notif.is_read && (
                                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gold rounded-full"></div>
                                )}
                                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{notif.title}</p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                <p className="text-[10px] text-gray-400 mt-2">
                                  {formatTimeAgo(notif.created_at)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-400">
                              <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                              <p className="text-sm">No notifications yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to="/profile">
                    <Button variant="ghost" className="text-white hover:text-gold hover:bg-maroon-dark font-medium">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden lg:inline">{currentUser?.firstName}</span>
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="text-white hover:text-gold hover:bg-maroon-dark font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <Button variant="ghost" className="text-white hover:text-gold hover:bg-maroon-dark font-medium">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gold text-maroon hover:bg-gold/90 font-bold border-2 border-transparent">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-gold transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};

export default Navbar;
