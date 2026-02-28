import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// Get user from localStorage
const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
    try {
        const { data } = await API.post('/auth/login', { email, password });
        localStorage.setItem('userInfo', JSON.stringify(data.data));
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
    }
});

export const register = createAsyncThunk('auth/register', async ({ name, email, password }, thunkAPI) => {
    try {
        const { data } = await API.post('/auth/register', { name, email, password });
        localStorage.setItem('userInfo', JSON.stringify(data.data));
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
});

export const getProfile = createAsyncThunk('auth/getProfile', async (_, thunkAPI) => {
    try {
        const { data } = await API.get('/auth/profile');
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        userInfo,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(login.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload; })
            .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // Register
            .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(register.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload; })
            .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // Get Profile
            .addCase(getProfile.fulfilled, (state, action) => { state.profile = action.payload; });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
