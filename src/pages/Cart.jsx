import { Link } from 'react-router';
import { useCartStore } from '../store/cartStore';

export default function Cart() {
  const items = useCartStore(state => state.items);
  const setQuantity = useCartStore(state => state.setQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const clear = useCartStore(state => state.clear);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <><header className="page-heading"><p className="eyebrow">A FEW GOOD FINDS</p><h1>Your cart.</h1><p>Everything you picked, in one place.</p></header>
    {items.length === 0 ? <div className="notice"><h2>Your cart is empty</h2><p>Discover something you love in the collection.</p><Link className="button" to="/products">Explore products →</Link></div>
      : <div className="cart-layout"><div className="cart-items">{items.map(item => <article className="cart-row" key={item.id}>
        <div><h2><Link to={`/products/${item.id}`}>{item.title}</Link></h2><p>${item.price.toFixed(2)} each</p></div>
        <label>Quantity<input type="number" min="0" step="1" aria-label={`Quantity for ${item.title}`} value={item.quantity} onChange={event => setQuantity(item.id, event.target.valueAsNumber)} /></label>
        <strong>${(item.price * item.quantity).toFixed(2)}</strong><button className="text-button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.title}`}>Remove</button>
      </article>)}</div><aside className="cart-summary"><h2>Order summary</h2><div><span>Total</span><strong>${total.toFixed(2)}</strong></div><p className="muted">A demo shop for exploring React. No checkout or payments.</p><button className="button secondary" onClick={clear}>Clear cart</button><Link className="text-button" to="/products">Continue exploring →</Link></aside></div>}
  </>;
}
