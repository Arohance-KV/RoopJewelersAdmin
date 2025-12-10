import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Replace with your actual base URL
const API_BASE_URL = import.meta.env.VITE_BASE_URL; // Update this with your jewel-tech URL

// Helper function for API calls
const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Initial state
const initialState = {
  user: null,
  accessToken: localStorage.getItem("accessToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await fetchAPI("/admin/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (data.success) {
        const { accessToken } = data.data;
        localStorage.setItem("accessToken", accessToken);
        return data.data;
      }
      return rejectWithValue("Login failed");
    } catch (error) {
      return rejectWithValue(
        error.message || "Login failed. Please try again."
      );
    }
  }
);

// Async thunk for signup
export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await fetchAPI("/admin/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      if (data.success) {
        const { accessToken } = data.data;
        localStorage.setItem("accessToken", accessToken);
        return data.data;
      }
      return rejectWithValue("Signup failed");
    } catch (error) {
      return rejectWithValue(
        error.message || "Signup failed. Please try again."
      );
    }
  }
);

// Async thunk for fetching profile
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAPI("/admin/profile", {
        method: "GET",
      });

      if (data.success) {
        return data.data;
      }
      return rejectWithValue("Failed to fetch profile");
    } catch (error) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("accessToken");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Automatically logout when profile fetch fails
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem("accessToken");
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
