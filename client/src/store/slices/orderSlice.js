import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const createOrder = createAsyncThunk('orders/create', async (orderData, thunkAPI) => {
    try {
        const { data } = await API.post('/orders', orderData);
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
});

export const fetchMyOrders = createAsyncThunk('orders/myOrders', async (_, thunkAPI) => {
    try {
        const { data } = await API.get('/orders/myorders');
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (params, thunkAPI) => {
    try {
        const { data } = await API.get('/orders', { params });
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
});

export const fetchSalesStats = createAsyncThunk('orders/stats', async (_, thunkAPI) => {
    try {
        const { data } = await API.get('/orders/stats');
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, thunkAPI) => {
    try {
        const { data } = await API.put(`/orders/${id}/status`, { status });
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, thunkAPI) => {
    try {
        const { data } = await API.put(`/orders/${id}/cancel`);
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
});

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        myOrders: [],
        allOrders: [],
        currentOrder: null,
        stats: null,
        pagination: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearOrderError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => { state.loading = true; })
            .addCase(createOrder.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; })
            .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // My orders
            .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
            .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.myOrders = action.payload; })
            .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // All orders (admin)
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.allOrders = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            // Stats
            .addCase(fetchSalesStats.fulfilled, (state, action) => { state.stats = action.payload; })
            // Update status (admin)
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const idx = state.allOrders.findIndex((o) => o._id === action.payload._id);
                if (idx !== -1) state.allOrders[idx] = action.payload;
            })
            // Cancel order (user)
            .addCase(cancelOrder.fulfilled, (state, action) => {
                const idx = state.myOrders.findIndex((o) => o._id === action.payload._id);
                if (idx !== -1) state.myOrders[idx] = action.payload;
            });
    },
});

export const { clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
