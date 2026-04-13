import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const localData = localStorage.getItem('cart');
        return localData ? JSON.parse(localData) : [];
    });

    const syncTimeoutRef = useRef(null);

    // Persist to localStorage on every change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Debounced server sync — fires 1.5s after the last cart change
    const scheduleSyncToServer = useCallback((items) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
            try {
                const payload = items.map(item => ({
                    product: item._id,
                    cartId: item.cartId,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size || '',
                    selectedOptions: item.selectedOptions || {},
                }));
                await axios.put(import.meta.env.VITE_API_URL + '/api/cart', { items: payload }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (_) { /* silent fail — localStorage is the source of truth */ }
        }, 1500);
    }, []);

    // On login: merge server cart into local cart then sync back
    const loadCartFromServer = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get(import.meta.env.VITE_API_URL + '/api/cart', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const serverItems = res.data;
            if (!serverItems || serverItems.length === 0) return;

            // Merge: client items take precedence for duplicates
            setCartItems(prev => {
                const merged = [...prev];
                serverItems.forEach(serverItem => {
                    const exists = merged.find(i => i.cartId === serverItem.cartId);
                    if (!exists) {
                        merged.push({
                            ...serverItem.product,
                            cartId: serverItem.cartId,
                            quantity: serverItem.quantity,
                            price: serverItem.price,
                            size: serverItem.size,
                            selectedOptions: serverItem.selectedOptions || {},
                        });
                    }
                });
                return merged;
            });
        } catch (_) {}
    }, []);

    // Build a deterministic cartId from product + size + selected options
    const buildCartId = (productId, size, selectedOptions = {}) => {
        const optStr = Object.entries(selectedOptions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v}`)
            .join('|');
        return `${productId}-${size || ''}-${optStr}`;
    };

    const addToCart = (product, quantity, size = '', extraPrice = 0, selectedOptions = {}) => {
        const cartId = buildCartId(product._id, size, selectedOptions);
        setCartItems(prev => {
            const existing = prev.find(item => item.cartId === cartId);
            let next;
            if (existing) {
                next = prev.map(item =>
                    item.cartId === cartId ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                next = [...prev, {
                    ...product,
                    cartId,
                    quantity,
                    size,
                    price: product.price + extraPrice,
                    selectedOptions,
                }];
            }
            scheduleSyncToServer(next);
            return next;
        });
    };

    const removeFromCart = (cartId) => {
        setCartItems(prev => {
            const next = prev.filter(item => item.cartId !== cartId);
            scheduleSyncToServer(next);
            return next;
        });
    };

    const updateQuantity = (cartId, amount) => {
        setCartItems(prev => {
            const next = prev.map(item => {
                if (item.cartId === cartId) {
                    const newQ = item.quantity + amount;
                    return { ...item, quantity: newQ > 0 ? newQ : 1 };
                }
                return item;
            });
            scheduleSyncToServer(next);
            return next;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        const token = localStorage.getItem('token');
        if (token) {
            axios.delete(import.meta.env.VITE_API_URL + '/api/cart', { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        }
    };

    const getCartTotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const getCartCount = () => cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, loadCartFromServer }}>
            {children}
        </CartContext.Provider>
    );
};
