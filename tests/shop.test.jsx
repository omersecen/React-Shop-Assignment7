// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from '../src/App';
import { AuthProvider } from '../src/context/AuthContext';
import { useCartStore } from '../src/store/cartStore';
import useFetch from '../src/hooks/useFetch';
import useLocalStorage from '../src/hooks/useLocalStorage';
import { fetchProduct, fetchProducts } from '../src/api/productsApi';
import { login, DEMO_USERNAME } from '../src/api/authApi';

const products = [
  { id: 1, title: 'Rose Mascara', description: 'A daily essential', category: 'beauty', price: 12.5, thumbnail: '/one.png' },
  { id: 2, title: 'Wooden Chair', description: 'A comfortable seat', category: 'furniture', price: 50, thumbnail: '/two.png' },
];
function mount(path) {
  return render(<MemoryRouter initialEntries={[path]}><AuthProvider><App /></AuthProvider></MemoryRouter>);
}
beforeEach(() => {
  localStorage.clear();
  useCartStore.getState().clear();
  vi.stubGlobal('fetch', vi.fn(async url => {
    const id = Number(String(url).split('/').pop());
    if (String(url).includes('?limit=')) return { ok: true, json: async () => ({ products }) };
    const product = products.find(item => item.id === id);
    return { ok: !!product, status: product ? 200 : 404, json: async () => product };
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('API services', () => {
  it('parses the product list and forwards the abort signal', async () => {
    const controller = new AbortController();
    expect(await fetchProducts(controller.signal)).toEqual(products);
    expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/products?limit=100', { signal: controller.signal });
  });
  it('rejects missing products and other HTTP failures', async () => {
    await expect(fetchProduct('999999')).rejects.toThrow('Product not found');
    fetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchProducts()).rejects.toThrow('HTTP 503');
  });
  it('resolves only the fixed demo pair after 500ms', async () => {
    vi.useFakeTimers();
    const request = login(DEMO_USERNAME, 'demo123456');
    await vi.advanceTimersByTimeAsync(500);
    await expect(request).resolves.toEqual({ username: DEMO_USERNAME });
    const rejected = expect(login(DEMO_USERNAME, 'wrong')).rejects.toThrow('Invalid credentials');
    await vi.advanceTimersByTimeAsync(500);
    await rejected;
  });
});

describe('cart store', () => {
  it('adds duplicates immutably, changes quantities, removes and persists', () => {
    const { addItem, setQuantity, removeItem, clear } = useCartStore.getState();
    addItem(products[0]);
    const previous = useCartStore.getState().items;
    addItem(products[0]);
    expect(previous[0].quantity).toBe(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    expect(JSON.parse(localStorage.getItem('assignment7-cart'))[0].quantity).toBe(2);
    setQuantity(1, 3);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
    setQuantity(1, 0);
    expect(useCartStore.getState().items).toEqual([]);
    addItem(products[1]); removeItem(2);
    expect(useCartStore.getState().items).toEqual([]);
    addItem(products[0]); clear();
    expect(localStorage.getItem('assignment7-cart')).toBe('[]');
  });
  it('hydrates only valid unique items and recovers malformed stored JSON', async () => {
    localStorage.setItem('assignment7-cart', JSON.stringify([
      { id: 1, title: 'Valid', price: 10, quantity: 2 },
      { id: 1, title: 'Duplicate', price: 10, quantity: 1 },
      { id: 2, title: 'Invalid quantity', price: 5, quantity: -1 },
      null,
    ]));
    vi.resetModules();
    const hydrated = await import('../src/store/cartStore');
    expect(hydrated.useCartStore.getState().items).toEqual([{ id: 1, title: 'Valid', price: 10, quantity: 2 }]);
    localStorage.setItem('assignment7-cart', '{invalid');
    vi.resetModules();
    const recovered = await import('../src/store/cartStore');
    expect(recovered.useCartStore.getState().items).toEqual([]);
  });
  it('does not rerender a count subscriber when the quantity total is unchanged', () => {
    useCartStore.getState().addItem(products[0]);
    let renders = 0;
    function Badge() {
      const count = useCartStore(state => state.items.reduce((sum, item) => sum + item.quantity, 0));
      renders++;
      return <span>{count}</span>;
    }
    render(<Badge />);
    const before = renders;
    act(() => useCartStore.setState(state => ({ items: state.items.map(item => ({ ...item, title: 'Updated title' })) })));
    expect(renders).toBe(before);
  });
});

describe('custom hooks', () => {
  it('aborts old requests and ignores stale responses after input changes', async () => {
    const requests = [];
    const fetcher = (id, signal) => new Promise(resolve => requests.push({ id, signal, resolve }));
    const { result, rerender, unmount } = renderHook(({ id }) => useFetch(fetcher, [id]), { initialProps: { id: '1' } });
    await waitFor(() => expect(requests.length).toBe(1));
    rerender({ id: '2' });
    await waitFor(() => expect(requests.length).toBe(2));
    expect(requests[0].signal.aborted).toBe(true);
    await act(async () => requests[1].resolve('new'));
    await act(async () => requests[0].resolve('old'));
    expect(result.current.data).toBe('new');
    unmount(); expect(requests[1].signal.aborted).toBe(true);
  });
  it('recovers corrupted theme JSON and supports functional updates', async () => {
    localStorage.setItem('theme-test', '{broken');
    const { result } = renderHook(() => useLocalStorage('theme-test', 'light'));
    expect(result.current[0]).toBe('light');
    act(() => result.current[1](value => value === 'light' ? 'dark' : 'light'));
    await waitFor(() => expect(localStorage.getItem('theme-test')).toBe('"dark"'));
  });
});

describe('routed shop flows', () => {
  it('loads a filtered deep link and preserves query text when category changes', async () => {
    mount('/products?q=rose&category=furniture&source=shared');
    await screen.findByText('No matching products');
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'beauty' } });
    await screen.findByRole('heading', { name: 'Rose Mascara' });
    expect(screen.getByLabelText('Search products').value).toBe('rose');
    expect(screen.queryByRole('heading', { name: 'Wooden Chair' })).toBeNull();
  });
  it('handles product errors and loads a new id without remounting the app', async () => {
    mount('/products/1');
    await screen.findByRole('heading', { name: 'Rose Mascara' });
    fireEvent.click(screen.getByRole('button', { name: 'Next product →' }));
    await screen.findByRole('heading', { name: 'Wooden Chair' });
    fireEvent.click(screen.getByRole('button', { name: 'Next product →' }));
    await screen.findByRole('heading', { name: 'Product not found' });
  });
  it('redirects guests, rejects wrong passwords, restores cart and logs out', async () => {
    mount('/cart');
    await screen.findByRole('heading', { name: 'Your finds are waiting.' });
    fireEvent.change(screen.getByLabelText('Student email'), { target: { value: DEMO_USERNAME } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in →' }));
    await screen.findByRole('alert');
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'demo123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in →' }));
    await screen.findByRole('heading', { name: 'Your cart is empty' });
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    await screen.findByRole('heading', { name: 'Your finds are waiting.' });
  });
  it('adds products, updates the cart badge and persists the theme', async () => {
    mount('/products/1');
    await screen.findByRole('heading', { name: 'Rose Mascara' });
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart +' }));
    expect(screen.getByLabelText('1 items in cart').textContent).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    await waitFor(() => expect(localStorage.getItem('assignment7-theme')).toBe('"dark"'));
  });
  it('shows unmatched routes inside the common layout', () => {
    mount('/missing-page');
    expect(screen.getByRole('heading', { name: 'Nothing found here.' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to home →' })).toBeTruthy();
  });
  it('shows a readable catalogue network failure', async () => {
    fetch.mockRejectedValue(new Error('Network unavailable'));
    mount('/products');
    expect((await screen.findByRole('alert')).textContent).toContain('Network unavailable');
  });
});
