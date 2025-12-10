import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import productReducer from './productSlice';
import categoryReducer from './categorySlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    categories: categoryReducer,
    products: productReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
