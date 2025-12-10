import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.VITE_BASE_URL; // Update with your jewel-tech URL

// Helper function for API calls
const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Initial state
const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  success: false,
  stats: {
    totalUsers: 0,
    approvedUsers: 0,
    pendingUsers: 0,
  },
  filters: {
    status: '', // Can be 'approved', 'pending', or ''
  },
};

// Async thunks

// GET - Fetch all users with optional status filter
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (status = '', { rejectWithValue }) => {
    try {
      const queryParam = status ? `?status=${status}` : '';
      const data = await fetchAPI(`/admin/list-users${queryParam}`, {
        method: 'GET',
      });

      if (data.success) {
        return data.data; // Returns array of users
      }
      return rejectWithValue('Failed to fetch users');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

// GET - Fetch single user by ID
export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await fetchAPI(`/admin/user/${userId}`, {
        method: 'GET',
      });

      if (data.success) {
        return data.data; // Returns single user object
      }
      return rejectWithValue('Failed to fetch user');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  }
);

// PATCH - Update user status (approve/pending)
export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const data = await fetchAPI(`/admin/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (data.success) {
        return data.data; // Returns updated user object
      }
      return rejectWithValue('Failed to update user status');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update user status');
    }
  }
);

// PATCH - Block/Unblock user
export const toggleBlockUser = createAsyncThunk(
  'users/toggleBlock',
  async ({ userId, isBlocked }, { rejectWithValue }) => {
    try {
      const data = await fetchAPI(`/admin/${userId}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ isBlocked }),
      });

      if (data.success) {
        return data.data; // Returns updated user object
      }
      return rejectWithValue('Failed to update user block status');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update user block status');
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    calculateStats: (state) => {
      state.stats.totalUsers = state.users.length;
      state.stats.approvedUsers = state.users.filter(u => u.status === 'approved').length;
      state.stats.pendingUsers = state.users.filter(u => u.status === 'pending').length;
    },
  },
  extraReducers: (builder) => {
    // Fetch all users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
        // Calculate stats
        state.stats.totalUsers = action.payload.length;
        state.stats.approvedUsers = action.payload.filter(u => u.status === 'approved').length;
        state.stats.pendingUsers = action.payload.filter(u => u.status === 'pending').length;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update user status
    builder
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
        state.success = true;
        // Recalculate stats
        state.stats.approvedUsers = state.users.filter(u => u.status === 'approved').length;
        state.stats.pendingUsers = state.users.filter(u => u.status === 'pending').length;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Toggle block user
    builder
      .addCase(toggleBlockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
        state.success = true;
      })
      .addCase(toggleBlockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { 
  clearUserError, 
  clearSuccess, 
  setStatusFilter, 
  clearCurrentUser,
  calculateStats 
} = userSlice.actions;

export default userSlice.reducer;
