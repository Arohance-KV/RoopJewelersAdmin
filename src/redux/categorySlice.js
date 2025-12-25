import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem("accessToken");
  const isFormData = options.body instanceof FormData;

  // Build headers conditionally
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // ONLY add Content-Type for non-FormData requests
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method: options.method || "GET",
    ...(options.body && { body: options.body }),
  };

  // Add headers only when needed
  if (Object.keys(headers).length > 0) {
    config.headers = headers;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Initial state
const initialState = {
  categories: [],
  loading: false,
  error: null,
  currentCategory: null,
  success: false,
};

// Async thunks

// GET - Fetch all categories
export const fetchAllCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAPI("/admin/category/list-categories", {
        method: "GET",
      });
      if (data.success) {
        return data.data;
      }
      return rejectWithValue("Failed to fetch categories");
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch categories");
    }
  }
);

// POST - Create new category
export const createCategory = createAsyncThunk(
  "categories/create",
  async (categoryData, { rejectWithValue }) => {
    try {
      const data = await fetchAPI("/admin/category/create", {
        method: "POST",
        body: JSON.stringify(categoryData), // Stringify the JSON
      });
      if (data.success) {
        return data.data;
      }
      return rejectWithValue("Failed to create category");
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create category");
    }
  }
);

// PATCH - Update existing category
export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      const data = await fetchAPI(`/admin/category/update/${categoryId}`, {
        method: "PATCH",
        body: JSON.stringify(categoryData), // Stringify the JSON
      });
      if (data.success) {
        return data.data;
      }
      return rejectWithValue("Failed to update category");
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update category");
    }
  }
);

// DELETE - Delete category
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (categoryId, { rejectWithValue }) => {
    try {
      const data = await fetchAPI(`/admin/category/delete/${categoryId}`, {
        method: "DELETE",
      });
      if (data.success) {
        return categoryId;
      }
      return rejectWithValue("Failed to delete category");
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete category");
    }
  }
);

// Slice
const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch all categories
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        state.error = null;
        state.success = true;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.currentCategory = null;
        state.error = null;
        state.success = true;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (c) => c._id !== action.payload
        );
        state.error = null;
        state.success = true;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearCategoryError,
  setCurrentCategory,
  clearCurrentCategory,
  clearSuccess,
} = categorySlice.actions;

export default categorySlice.reducer;
