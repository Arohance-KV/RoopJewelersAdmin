import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

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
  products: [],
  loading: false,
  error: null,
  currentProduct: null,
  success: false,
  uploadedImages: [],
  uploadLoading: false,
};

// Async thunks

// POST - Upload image assets
export const uploadImage = createAsyncThunk(
  'products/uploadImage',
  async (imageFile, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/admin/upload/assets`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      // Handle both 'data' and 'images' response shapes from backend
      const images = data.images || data.data || [];
      if (data.success && images.length > 0) {
        // Ensure we always return an array
        return Array.isArray(images) ? images : [images];
      }
      
      // Improved error handling
      const errorMsg = data.message || 'Invalid response from server';
      console.error('Upload failed with server data:', data);  // Keep for now if needed, remove in production
      throw new Error(errorMsg);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload image');
    }
  }
);

// GET - Fetch all products
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAPI('/admin/list-products', {
        method: 'GET',
      });

      if (data.success) {
        return data.data;
      }
      return rejectWithValue('Failed to fetch products');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

// POST - Create new product
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await fetchAPI('/admin/create-product', {
        method: 'POST',
        body: JSON.stringify(productData),
      });

      if (data.success) {
        return data.data;
      }
      return rejectWithValue('Failed to create product');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

// PATCH - Update existing product
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const data = await fetchAPI(`/admin/product/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify(productData),
      });

      if (data.success) {
        return data.data;
      }
      return rejectWithValue('Failed to update product');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

// DELETE - Delete product
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await fetchAPI(`/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (data.success) {
        return productId;
      }
      return rejectWithValue('Failed to delete product');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearUploadedImages: (state) => {
      state.uploadedImages = [];
    },
  },
  extraReducers: (builder) => {
    // Upload image
    builder
      .addCase(uploadImage.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploadLoading = false;
        // Safely handle the payload - ensure it's an array
        const newImages = Array.isArray(action.payload) ? action.payload : [action.payload];
        state.uploadedImages = [...state.uploadedImages, ...newImages];
        state.error = null;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      });

    // Fetch all products
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create product
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        state.error = null;
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.currentProduct = null;
        state.error = null;
        state.success = true;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Delete product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p._id !== action.payload);
        state.error = null;
        state.success = true;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { 
  clearProductError, 
  setCurrentProduct, 
  clearCurrentProduct,
  clearSuccess,
  clearUploadedImages 
} = productSlice.actions;

export default productSlice.reducer;