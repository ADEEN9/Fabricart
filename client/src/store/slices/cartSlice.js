import { createSlice } from '@reduxjs/toolkit';

const cartItems = localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems'))
    : [];

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: cartItems,
        shippingAddress: localStorage.getItem('shippingAddress')
            ? JSON.parse(localStorage.getItem('shippingAddress'))
            : {},
    },
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const exists = state.items.find((x) => x._id === item._id);

            if (exists) {
                exists.qty = item.qty;
            } else {
                state.items.push(item);
            }
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter((x) => x._id !== action.payload);
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
        updateCartQty: (state, action) => {
            const { id, qty } = action.payload;
            const item = state.items.find((x) => x._id === id);
            if (item) {
                item.qty = qty;
            }
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
        saveShippingAddress: (state, action) => {
            state.shippingAddress = action.payload;
            localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem('cartItems');
        },
    },
});

export const { addToCart, removeFromCart, updateCartQty, saveShippingAddress, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
