import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit3, Save, X, LogOut, Upload, Lock } from 'lucide-react';
import { fetchProfile, logout } from '../redux/authSlice'; // Adjust path based on your file structure

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get user data from Redux store
  const { user, loading, error } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    avatar: null
  });

  // Fetch profile data on component mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Update local state when user data is fetched
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        avatar: null
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setProfileData({ ...profileData, avatar: e.target.files[0] });
    }
  };

  const handleSave = () => {
    console.log('Saving profile:', profileData);
    // TODO: Add update profile API call here
    // dispatch(updateProfile(profileData));
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original user data
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        avatar: null
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Show loading state
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchProfile())}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User size={32} className="text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Profile Settings</h2>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition-all duration-200 font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-200 transition-all duration-200 font-medium"
              >
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl hover:bg-green-200 transition-all duration-200 font-medium"
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xl overflow-hidden">
                  {profileData.avatar ? (
                    <img
                      src={URL.createObjectURL(profileData.avatar)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload size={16} className="text-gray-500" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h4>
                <p className="text-sm text-gray-500">Admin User</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="text-gray-400" />
                  <span>First Name</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                    isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="text-gray-400" />
                  <span>Last Name</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                    isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="text-gray-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                    isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="text-gray-400" />
                  <span>Mobile Number</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={profileData.mobileNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                    isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-start space-x-3 text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-xl transition-colors">
              <Mail size={18} className="text-gray-400 shrink-0" />
              <span className="font-medium">Change Email</span>
            </button>
            <button className="w-full flex items-center justify-start space-x-3 text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-xl transition-colors">
              <Lock size={18} className="text-gray-400 shrink-0" />
              <span className="font-medium">Change Password</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-start space-x-3 text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-xl transition-colors"
            >
              <LogOut size={18} className="text-gray-400 shrink-0" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
