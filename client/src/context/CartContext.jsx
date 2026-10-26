import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(undefined);
const STORAGE_KEY = 'cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // `product` is a Product document from the API. We copy what the cart needs
  // including rental rates, durations, and refundable security deposits.
  const addItem = (product, quantity = 1, options = {}) => {
    const isRent = product.listingType === 'rent';
    const isGiveaway = product.isFreeGiveaway || product.listingType === 'giveaway' || Number(product.price) === 0;
    const rentDurationDays = Number(options.rentDurationDays || product.rentDurationDays) || 1;
    const rentPricePerDay = Number(product.rentPricePerDay) || 0;
    const rentDeposit = Number(product.rentDeposit) || 0;

    const effectivePrice = isRent
      ? rentPricePerDay * rentDurationDays
      : isGiveaway
      ? 0
      : Number(product.price);

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          title: product.title,
          price: effectivePrice,
          originalPrice: Number(product.price) || 0,
          image: product.imageUrl,
          quantity,
          listingType: isRent ? 'rent' : isGiveaway ? 'giveaway' : 'buy',
          rentPricePerDay,
          rentDeposit,
          rentDurationDays,
          isFreeGiveaway: isGiveaway,
        },
      ];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDeposit = items.reduce(
    (sum, item) => sum + (item.listingType === 'rent' ? (item.rentDeposit * item.quantity) : 0),
    0
  );
  const grandTotal = subtotal + totalDeposit;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        totalDeposit,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return ctx;
}
