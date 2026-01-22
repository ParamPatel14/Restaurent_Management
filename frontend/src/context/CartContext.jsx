import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [tableId, setTableId] = useState(null); // Which table is ordering

  const addToCart = (item, quantity = 1, notes = '') => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.notes === notes);
      if (existing) {
        return prev.map(i => 
          (i.id === item.id && i.notes === notes) 
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity, notes }];
    });
  };

  const removeFromCart = (itemId, notes = '') => {
    setCart(prev => prev.filter(i => !(i.id === itemId && i.notes === notes)));
  };

  const updateQuantity = (itemId, notes, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId && i.notes === notes) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      tableId,
      setTableId
    }}>
      {children}
    </CartContext.Provider>
  );
};
