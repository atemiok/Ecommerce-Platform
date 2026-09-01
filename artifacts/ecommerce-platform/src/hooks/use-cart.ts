import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Product } from '@workspace/api-client-react';

export interface CartLine {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = 'ilonito-cart';
const CART_EVENT = 'ilonito-cart-updated';

function readCart(): CartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((line) => line?.product?.id && line.quantity > 0) : [];
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartLine[]>([]);

  useEffect(() => {
    setItems(readCart());
    const sync = () => setItems(readCart());
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const next = readCart();
    const found = next.find((line) => line.product.id === product.id);
    if (found) found.quantity += quantity;
    else next.push({ product, quantity });
    writeCart(next);
    setItems(next);
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const next = readCart()
      .map((line) => line.product.id === productId ? { ...line, quantity } : line)
      .filter((line) => line.quantity > 0);
    writeCart(next);
    setItems(next);
  }, []);

  const removeItem = useCallback((productId: number) => updateQuantity(productId, 0), [updateQuantity]);

  const clearCart = useCallback(() => {
    writeCart([]);
    setItems([]);
  }, []);

  const itemCount = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, line) => sum + line.product.price * line.quantity, 0), [items]);

  return { items, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart };
}