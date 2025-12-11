import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  countInStock: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  shippingInfo: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  totalItems: 0,
  totalPrice: 0,
  shippingInfo: JSON.parse(localStorage.getItem('shippingInfo') || 'null'),
};

// Calculate totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
  return { totalItems, totalPrice };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existingItem = state.items.find(x => x.id === item.id);

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.items.push(item);
      }

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;

      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;

      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(x => x.id === id);

      if (item) {
        item.quantity = quantity;
      }

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;

      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      localStorage.removeItem('cartItems');
    },
    saveShippingInfo: (state, action: PayloadAction<CartState['shippingInfo']>) => {
      state.shippingInfo = action.payload;
      localStorage.setItem('shippingInfo', JSON.stringify(action.payload));
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, saveShippingInfo } = cartSlice.actions;
export default cartSlice.reducer;