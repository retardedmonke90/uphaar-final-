import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { getLocalSession, subscribeAuth, type LocalAuthSession } from '../lib/localAuth';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface LuckyOffer {
  amount: number;
  minPurchase: number;
  label: string;
  freeShipping?: boolean;
  source?: 'lucky' | 'manual';
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  discount: number;
  freeShipping: boolean;
  luckyOffer: LuckyOffer | null;
  setDiscount: (offer: LuckyOffer | number | null) => void;
  authSession: LocalAuthSession | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const DISCOUNT_STORAGE_KEY = 'phulwari-active-offer';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readStoredOffer(): LuckyOffer | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LuckyOffer;
  } catch {
    return null;
  }
}

function writeStoredOffer(offer: LuckyOffer | null) {
  if (!canUseStorage()) return;
  if (!offer) {
    localStorage.removeItem(DISCOUNT_STORAGE_KEY);
    return;
  }
  localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(offer));
}

function getCartItems() {
  if (!canUseStorage()) return [];
  try {
    const saved = localStorage.getItem('phulwari-cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getCartItems());
  const [luckyOffer, setLuckyOffer] = useState<LuckyOffer | null>(() => readStoredOffer());
  const [authSession, setAuthSession] = useState<LocalAuthSession | null>(() => getLocalSession());

  useEffect(() => {
    if (canUseStorage()) {
      localStorage.setItem('phulwari-cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    writeStoredOffer(luckyOffer);
  }, [luckyOffer]);

  useEffect(() => {
    const unsubscribe = subscribeAuth(setAuthSession);
    const handleStorage = () => setLuckyOffer(readStoredOffer());
    window.addEventListener('storage', handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setCartItems([]);
    setLuckyOffer(null);
  };

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const luckyDiscount = useMemo(() => {
    if (!luckyOffer) return 0;
    if (luckyOffer.freeShipping) return 0;
    if (totalAmount < luckyOffer.minPurchase) return 0;
    return Math.min(Number(luckyOffer.amount || 0), totalAmount);
  }, [luckyOffer, totalAmount]);

  const welcomeDiscount = useMemo(() => {
    if (!authSession || authSession.role !== 'customer') return 0;
    const percent = Number(authSession.welcomeDiscountPercent || 0);
    if (percent <= 0) return 0;
    return Math.min(Math.round((totalAmount * percent) / 100), totalAmount);
  }, [authSession, totalAmount]);

  const discount = Math.min(luckyDiscount + welcomeDiscount, totalAmount);
  const freeShipping = Boolean(luckyOffer?.freeShipping);

  const setDiscount = (offer: LuckyOffer | number | null) => {
    if (offer === null) {
      setLuckyOffer(null);
      return;
    }

    if (typeof offer === 'number') {
      setLuckyOffer({
        amount: offer,
        minPurchase: 0,
        label: `₹${offer} OFF`,
        source: 'manual',
        freeShipping: false,
      });
      return;
    }

    setLuckyOffer({
      amount: Number(offer.amount || 0),
      minPurchase: Number(offer.minPurchase || 0),
      label: offer.label || 'Special Offer',
      source: offer.source || 'lucky',
      freeShipping: Boolean(offer.freeShipping),
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        discount,
        freeShipping,
        luckyOffer,
        setDiscount,
        authSession,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
