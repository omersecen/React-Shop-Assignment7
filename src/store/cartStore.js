import { create } from 'zustand';

const STORAGE_KEY = 'assignment7-cart';
function readItems() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(items)) return [];
    const ids = new Set();
    return items.filter(item => {
      if (!item || !Number.isInteger(item.id) || ids.has(item.id)
        || typeof item.title !== 'string' || !Number.isFinite(item.price)
        || item.price < 0 || !Number.isInteger(item.quantity) || item.quantity < 1) return false;
      ids.add(item.id);
      return true;
    }).map(({ id, title, price, quantity }) => ({ id, title, price, quantity }));
  } catch {
    return [];
  }
}

export const useCartStore = create(set => ({
  items: readItems(),
  addItem: product => set(state => ({
    items: state.items.some(item => item.id === product.id)
      ? state.items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...state.items, { id: product.id, title: product.title, price: product.price, quantity: 1 }],
  })),
  removeItem: id => set(state => ({ items: state.items.filter(item => item.id !== id) })),
  setQuantity: (id, quantity) => {
    if (!Number.isFinite(quantity)) return;
    const nextQuantity = Math.floor(quantity);
    set(state => ({ items: nextQuantity < 1
      ? state.items.filter(item => item.id !== id)
      : state.items.map(item => item.id === id ? { ...item, quantity: nextQuantity } : item) }));
  },
  clear: () => set({ items: [] }),
}));

// Persistence belongs to the external store, outside React component effects.
const unsubscribe = useCartStore.subscribe((state, previous) => {
  if (state.items === previous.items) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); } catch { /* storage unavailable */ }
});
if (import.meta.hot) import.meta.hot.dispose(unsubscribe);
