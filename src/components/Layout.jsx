import { Outlet } from 'react-router';
import NavBar from './NavBar';
import useLocalStorage from '../hooks/useLocalStorage';

export default function Layout() {
  const [preference, setPreference] = useLocalStorage('assignment7-theme', 'light');
  const theme = preference === 'dark' ? 'dark' : 'light';
  return <div className={`app theme-${theme}`}><a href="#main-content" className="skip-link">Skip to content</a>
    <NavBar theme={theme} toggleTheme={() => setPreference(theme === 'dark' ? 'light' : 'dark')} />
    <main id="main-content" className="main-shell"><Outlet /></main>
    <footer className="site-footer"><span className="footer-brand">found&good</span><span>Everyday things. Thoughtfully discovered.</span><small>React shop · Assignment 7 · 2026</small></footer>
  </div>;
}
