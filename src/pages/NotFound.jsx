import { Link } from 'react-router';

export default function NotFound() {
  return <section className="notice"><p className="eyebrow">404 / A WRONG TURN</p><h1>Nothing found here.</h1><p>That page does not exist. There are still plenty of good things to discover.</p><Link className="button" to="/">Back to home →</Link></section>;
}
