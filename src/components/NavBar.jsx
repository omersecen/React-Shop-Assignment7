import { NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../store/cartStore';

export default function NavBar({ theme, toggleTheme }) {
  const count = useCartStore(state => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const { user, dispatch } = useAuth();
  return <header className="site-header"><nav className="nav-shell" aria-label="Main navigation">
    <NavLink className="brand" to="/" end><span className="brand-icon" aria-hidden="true">f.</span> found<span className="brand-dot">&</span>good</NavLink>
    <div className="nav-links"><NavLink to="/" end>Home</NavLink><NavLink to="/products">Collection</NavLink><NavLink to="/cart">Cart <span className="cart-count" aria-label={`${count} items in cart`}>{count}</span></NavLink></div>
    <div className="nav-actions"><button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button>
      {user ? <><span className="username">{user.username}</span><button className="text-button" onClick={() => dispatch({ type: 'LOGGED_OUT' })}>Logout</button></> : <NavLink className="login-link" to="/login">Login ↗</NavLink>}
    </div>
  </nav></header>;
}
