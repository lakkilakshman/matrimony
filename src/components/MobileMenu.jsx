
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Home, Grid, User, LogOut, Info, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const MobileMenu = ({ isOpen, onClose }) => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed top-0 right-0 bottom-0 w-64 bg-gradient-to-b from-maroon to-maroon-dark shadow-2xl z-50 md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gold/20">
                <span className="text-white font-bold text-lg">Menu</span>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gold transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4">
                <Link
                  to="/"
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-6 py-4 text-white hover:bg-maroon-dark hover:text-gold transition-colors font-medium border-b border-white/10"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/about"
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-6 py-4 text-white hover:bg-maroon-dark hover:text-gold transition-colors font-medium border-b border-white/10"
                >
                  <Info className="h-5 w-5" />
                  <span>About</span>
                </Link>

                <Link
                  to="/contact"
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-6 py-4 text-white hover:bg-maroon-dark hover:text-gold transition-colors font-medium border-b border-white/10"
                >
                  <Mail className="h-5 w-5" />
                  <span>Contact</span>
                </Link>

                {isAuthenticated && (
                  <>
                    <Link
                      to="/browse"
                      onClick={handleLinkClick}
                      className="flex items-center space-x-3 px-6 py-4 text-white hover:bg-maroon-dark hover:text-gold transition-colors font-medium border-b border-white/10"
                    >
                      <Grid className="h-5 w-5" />
                      <span>All Profiles</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={handleLinkClick}
                      className="flex items-center space-x-3 px-6 py-4 text-white hover:bg-maroon-dark hover:text-gold transition-colors font-medium border-b border-white/10"
                    >
                      <User className="h-5 w-5" />
                      <span>My Profile</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gold/20 bg-maroon-dark/50">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="text-center text-white text-sm font-medium mb-3">
                      Welcome, {currentUser?.firstName}
                    </div>
                    <Button
                      onClick={handleLogout}
                      className="w-full bg-gold text-maroon hover:bg-gold/90 font-bold"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" onClick={handleLinkClick} className="block w-full">
                      <Button variant="outline" className="w-full text-white border-gold hover:bg-gold hover:text-maroon font-medium">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={handleLinkClick} className="block w-full">
                      <Button className="w-full bg-gold text-maroon hover:bg-gold/90 font-bold">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
