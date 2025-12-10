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
  products: [],
  loading: false,
  error: null,
  currentProduct: null,
  success: false,
};

// Async thunks

// GET - Fetch all products
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAPI('/admin/list-products', {
        method: 'GET',
      });

      if (data.success) {
        return data.data; // Returns array of products
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
        return data.data; // Returns the created product
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
        return data.data; // Returns the updated product
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
        return productId; // Return the deleted product ID
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
  },
  extraReducers: (builder) => {
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
  clearSuccess 
} = productSlice.actions;

export default productSlice.reducer;
