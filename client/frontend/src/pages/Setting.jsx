import { useState } from 'react';
import { 
  FaUser, 
  FaBell, 
  FaPalette, 
  FaLock, 
  FaGlobe,
  FaMoon,
  FaSun,
  FaSave
} from 'react-icons/fa';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    notifications: true,
    emailNotifications: true,
    darkMode: false,
    language: 'English',
    twoFactor: false,
    timezone: 'UTC+5:30'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'preferences', label: 'Preferences', icon: FaGlobe },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  const renderProfile = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl text-blue-600">
            <FaUser />
          </div>
          <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            Change Photo
          </button>
          <button className="px-4 py-2 border rounded-lg text-sm text-red-600 hover:bg-red-50">
            Remove
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
        <input
          type="text"
          name="name"
          value={settings.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <input
          type="email"
          name="email"
          value={settings.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FaSave />
        Save Changes
      </button>
    </form>
  );

  const renderNotifications = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Push Notifications</h4>
            <p className="text-sm text-gray-500">Receive notifications on your device</p>
          </div>
          <input
            type="checkbox"
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
          />
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <input
            type="checkbox"
            name="emailNotifications"
            checked={settings.emailNotifications}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
          />
        </div>
      </div>
      <button
        type="submit"
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FaSave />
        Save Changes
      </button>
    </form>
  );

  const renderAppearance = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Dark Mode</h4>
            <p className="text-sm text-gray-500">Switch between light and dark theme</p>
          </div>
          <button
            type="button"
            onClick={() => setSettings({...settings, darkMode: !settings.darkMode})}
            className={`px-4 py-2 rounded-lg transition-colors ${
              settings.darkMode 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {settings.darkMode ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FaSave />
        Save Changes
      </button>
    </form>
  );

  const renderSecurity = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter current password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter new password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Confirm new password"
        />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="font-medium">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-500">Add an extra layer of security</p>
        </div>
        <input
          type="checkbox"
          name="twoFactor"
          checked={settings.twoFactor}
          onChange={handleChange}
          className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
        />
      </div>
      <button
        type="submit"
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FaSave />
        Update Security
      </button>
    </form>
  );

  const renderPreferences = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
        <select
          name="language"
          value={settings.language}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
        <select
          name="timezone"
          value={settings.timezone}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="UTC-8">UTC-8 (Pacific Time)</option>
          <option value="UTC-5">UTC-5 (Eastern Time)</option>
          <option value="UTC+0">UTC+0 (GMT)</option>
          <option value="UTC+5:30">UTC+5:30 (India Standard Time)</option>
          <option value="UTC+8">UTC+8 (China Time)</option>
        </select>
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="font-medium">Default View</h4>
          <p className="text-sm text-gray-500">Choose your default dashboard view</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">Board</button>
          <button className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50">List</button>
        </div>
      </div>
      <button
        type="submit"
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FaSave />
        Save Preferences
      </button>
    </form>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'profile': return renderProfile();
      case 'notifications': return renderNotifications();
      case 'appearance': return renderAppearance();
      case 'security': return renderSecurity();
      case 'preferences': return renderPreferences();
      default: return renderProfile();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-64 bg-gray-50 border-r">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <h2 className="text-xl font-semibold mb-6 capitalize">
              {activeTab} Settings
            </h2>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;