import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, CheckCircle, Clock, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchAllUsers } from '../redux/userSlice';
import { fetchAllProducts } from '../redux/productSlice';

function Dashboard() {
  const dispatch = useDispatch();

  // Fetch data from userSlice
  const { 
    users, 
    loading: usersLoading, 
    error: usersError,
    stats: userStats 
  } = useSelector((state) => state.users);

  // Fetch data from productSlice
  const { 
    products, 
    loading: productsLoading, 
    error: productsError 
  } = useSelector((state) => state.products);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Calculate dynamic stats
  const stats = [
    {
      label: 'Total Users',
      value: userStats.totalUsers || users.length,
      change: '+12%',
      Icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500',
      loading: usersLoading
    },
    {
      label: 'Approved Users',
      value: userStats.approvedUsers,
      change: '+8%',
      Icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      borderColor: 'border-green-500',
      loading: usersLoading
    },
    {
      label: 'Pending Users',
      value: userStats.pendingUsers,
      change: '+5%',
      Icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-500',
      loading: usersLoading
    },
    {
      label: 'Total Products',
      value: products.length,
      change: '+23%',
      Icon: Package,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-500',
      loading: productsLoading
    }
  ];

  // Get recent users (last 5)
  const recentUsers = users.slice(-5).reverse();

  // Get recent products (last 5)
  const recentProducts = products.slice(-5).reverse();

  // Refresh data handler
  const handleRefresh = () => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllProducts());
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={usersLoading || productsLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${(usersLoading || productsLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Messages */}
      {(usersError || productsError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Error Loading Data</h3>
            {usersError && <p className="text-red-600 text-sm">Users: {usersError}</p>}
            {productsError && <p className="text-red-600 text-sm">Products: {productsError}</p>}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                {stat.loading ? (
                  <div className="mt-2 h-8 w-16 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</h3>
                    <p className={`text-sm ${stat.textColor} font-medium mt-1`}>{stat.change}</p>
                  </>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Users</h2>
            <span className="text-sm text-gray-500">{users.length} total</span>
          </div>

          {usersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : user.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.status || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No users found</p>
          )}
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Products</h2>
            <span className="text-sm text-gray-500">{products.length} total</span>
          </div>

          {productsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{product.name || 'Unnamed Product'}</p>
                      <p className="text-sm text-gray-500">
                        {product.category || 'No category'} • ${product.price || '0'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock || 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No products found</p>
          )}
        </div>
      </div>

      {/* User Status Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">User Status Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {usersLoading ? '...' : userStats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {usersLoading ? '...' : userStats.approvedUsers}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            {!usersLoading && userStats.totalUsers > 0 && (
              <p className="text-xs text-green-600 mt-2">
                {((userStats.approvedUsers / userStats.totalUsers) * 100).toFixed(1)}% of total
              </p>
            )}
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">
                  {usersLoading ? '...' : userStats.pendingUsers}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            {!usersLoading && userStats.totalUsers > 0 && (
              <p className="text-xs text-yellow-600 mt-2">
                {((userStats.pendingUsers / userStats.totalUsers) * 100).toFixed(1)}% of total
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;