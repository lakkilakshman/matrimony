
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-maroon-dark to-maroon text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-gold fill-gold" />
              <span className="text-xl font-bold">Merukulam Matrimony</span>
            </div>
            <p className="text-cream/80 text-sm">
              Connecting hearts, building futures. Your trusted partner in finding your perfect life companion within the Merukulam community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-cream/80 hover:text-gold transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-cream/80 hover:text-gold transition-colors text-sm">
                  Browse Profiles
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-cream/80 hover:text-gold transition-colors text-sm">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-cream/80 hover:text-gold transition-colors text-sm">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-cream/80 text-sm">
                <Mail className="h-4 w-4 text-gold" />
                <span>info@Merukulammatrimony.com</span>
              </li>
              <li className="flex items-center space-x-2 text-cream/80 text-sm">
                <Phone className="h-4 w-4 text-gold" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2 text-cream/80 text-sm">
                <MapPin className="h-4 w-4 text-gold" />
                <span>Hyderabad, Telangana</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gold/20 mt-8 pt-6 text-center">
          <p className="text-cream/60 text-sm">
            © {new Date().getFullYear()} Merukulam Matrimony. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
