import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, thunkAPI) => {
    try {
        const { data } = await API.get('/products', { params });
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, thunkAPI) => {
    try {
        const { data } = await API.get(`/products/${id}`);
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Product not found');
    }
});

export const createProduct = createAsyncThunk('products/create', async (formData, thunkAPI) => {
    try {
        const { data } = await API.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, formData }, thunkAPI) => {
    try {
        const { data } = await API.put(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, thunkAPI) => {
    try {
        await API.delete(`/products/${id}`);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
});

const productSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        product: null,
        pagination: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearProductError: (state) => { state.error = null; },
        clearProduct: (state) => { state.product = null; },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all
            .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // Fetch by ID
            .addCase(fetchProductById.pending, (state) => { state.loading = true; })
            .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.product = action.payload; })
            .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // Create
            .addCase(createProduct.fulfilled, (state, action) => { state.items.unshift(action.payload); })
            // Update
            .addCase(updateProduct.fulfilled, (state, action) => {
                const idx = state.items.findIndex((p) => p._id === action.payload._id);
                if (idx !== -1) state.items[idx] = action.payload;
            })
            // Delete
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.items = state.items.filter((p) => p._id !== action.payload);
            });
    },
});

export const { clearProductError, clearProduct } = productSlice.actions;
export default productSlice.reducer;
