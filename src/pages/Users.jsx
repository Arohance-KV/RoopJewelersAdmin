import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users as UsersIcon, 
  User, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle, 
  Clock, 
  Ban, 
  Unlock, 
  Eye,
  Search,
  X,
  MapPin,
  Calendar,
  Shield
} from 'lucide-react';
import { 
  fetchAllUsers, 
  fetchUserById,
  updateUserStatus, 
  toggleBlockUser,
  clearUserError,
  clearSuccess,
  clearCurrentUser
} from '../redux/userSlice';

function Users() {
  const dispatch = useDispatch();
  
  // Get users data from Redux store
  const { users, currentUser, loading, error, success, stats } = useSelector((state) => state.users);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchAllUsers(statusFilter));
  }, [dispatch, statusFilter]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Filter users based on search term with null checks
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const buisnessName = (user.buisnessName || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           buisnessName.includes(searchLower);
  });

  const handleStatusChange = (userId, newStatus) => {
    dispatch(updateUserStatus({ userId, status: newStatus }));
  };

  const handleBlockToggle = (userId, currentBlockStatus) => {
    dispatch(toggleBlockUser({ userId, isBlocked: !currentBlockStatus }));
  };

  const handleViewDetails = (userId) => {
    dispatch(fetchUserById(userId));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    dispatch(clearCurrentUser());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get user initials safely
  const getUserInitials = (user) => {
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return firstInitial + lastInitial || 'U';
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UsersIcon size={32} className="text-blue-600" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Total: {stats.totalUsers} | Approved: {stats.approvedUsers} | Pending: {stats.pendingUsers}
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Action completed successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => dispatch(clearUserError())}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                statusFilter === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                statusFilter === 'approved' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                statusFilter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <UsersIcon size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No users found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search or add new users.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getUserInitials(user)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName || ''} {user.lastName || ''}
                          </p>
                          <p className="text-sm text-gray-500">{user.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        <span>{user.isdCode || ''} {user.phoneNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <Mail size={16} className="text-gray-400" />
                        <span className="truncate max-w-xs">{user.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Building size={16} className="text-gray-400" />
                        <span className="font-medium">{user.buisnessName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.city || 'N/A'}, {user.state || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(user._id, 'approved')}
                              disabled={loading}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                              title="Approve User"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(user._id, 'rejected')}
                              disabled={loading}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                              title="Reject User"
                            >
                              <Clock size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                          disabled={loading}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            user.isBlocked 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          {user.isBlocked ? <Unlock size={18} /> : <Ban size={18} />}
                        </button>
                        <button
                          onClick={() => handleViewDetails(user._id)}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            {loading && !currentUser ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading user details...</p>
                </div>
              </div>
            ) : currentUser ? (
              <div className="p-6 space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                    {getUserInitials(currentUser)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900">
                      {currentUser.firstName} {currentUser.lastName}
                    </h4>
                    <p className="text-gray-500 mt-1">{currentUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentUser.status)}`}>
                        {currentUser.status?.charAt(0).toUpperCase() + currentUser.status?.slice(1)}
                      </span>
                      {currentUser.isBlocked && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Phone size={20} className="text-blue-600" />
                    <span>Contact Information</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{currentUser.email || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                      <p className="font-medium text-gray-900">
                        {currentUser.isdCode} {currentUser.phoneNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Building size={20} className="text-blue-600" />
                    <span>Business Information</span>
                  </h5>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Business Name</p>
                      <p className="font-medium text-gray-900">{currentUser.buisnessName || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <MapPin size={20} className="text-blue-600" />
                    <span>Location</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">City</p>
                      <p className="font-medium text-gray-900">{currentUser.city || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">State</p>
                      <p className="font-medium text-gray-900">{currentUser.state || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Shield size={20} className="text-blue-600" />
                    <span>Account Status</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Status</p>
                      <p className="font-medium text-gray-900">
                        {currentUser.status?.charAt(0).toUpperCase() + currentUser.status?.slice(1) || 'Unknown'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Account Access</p>
                      <p className="font-medium text-gray-900">
                        {currentUser.isBlocked ? 'Blocked' : 'Active'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  {currentUser.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusChange(currentUser._id, 'approved');
                          handleCloseModal();
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Approve User
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange(currentUser._id, 'rejected');
                          handleCloseModal();
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject User
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleBlockToggle(currentUser._id, currentUser.isBlocked);
                      handleCloseModal();
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium ${
                      currentUser.isBlocked
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {currentUser.isBlocked ? 'Unblock User' : 'Block User'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500">User not found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
