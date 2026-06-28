import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, LogOut, Calendar, Mail, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Not available';
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Toggle profile dropdown
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Good morning, {user?.name || 'User'} 👋
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome back to TaskFlow
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Profile Section with Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {getInitials(user?.name)}
                  </span>
                )}
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                            border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.name} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                          {getInitials(user?.name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {user?.name || 'User'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.role || 'Member'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="px-4 py-3 space-y-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {user?.email || 'No email provided'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      User ID: {user?.id || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Joined: {formatDate(user?.createdAt || user?.joinedDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Last Login: {formatDate(user?.lastLogin)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-2 space-y-2">
                  <button
                    onClick={() => {
                      // Navigate to profile settings
                      console.log('Go to settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 
                             bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                             rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 
                             transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 
                             bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 
                             rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 
                             transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;