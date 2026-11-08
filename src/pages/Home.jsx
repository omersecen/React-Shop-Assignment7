import { Link } from 'react-router';

export default function Home() {
  return <><section className="hero"><div className="hero-copy"><p className="eyebrow">THE EVERYDAY, REIMAGINED</p><h1>Good things.<br /><em>Great finds.</em></h1><p>From your morning routine to your favourite corner. Discover everyday essentials with a little more character.</p><Link className="button" to="/products">Explore the collection <span>↗</span></Link><div className="hero-footnote"><span>01 / CURATED DISCOVERIES</span><span>Made for your everyday</span></div></div>
    <div className="hero-art" aria-label="A collection of everyday objects"><div className="art-label">THE GOOD<br />IN EVERYDAY.</div><div className="bottle"><span>found<br /><b>daily.</b><small>ESSENTIAL CARE</small></span></div><div className="jar"><span>good<br /><b>things</b></span></div><div className="sphere"></div><span className="art-caption">A LITTLE SOMETHING FOR YOU ↗</span></div>
  </section><section className="category-section"><div className="section-heading"><div><p className="eyebrow">A PLACE TO START</p><h2>Find your kind of good.</h2></div><Link className="text-button" to="/products">View everything →</Link></div><div className="category-grid">
    <Link to="/products?category=beauty" className="category-tile"><span>01</span><h3>The daily ritual</h3><p>Beauty essentials</p><b aria-hidden="true">↗</b></Link>
    <Link to="/products?category=fragrances" className="category-tile"><span>02</span><h3>A lasting impression</h3><p>Fragrances to discover</p><b aria-hidden="true">↗</b></Link>
    <Link to="/products?category=furniture" className="category-tile"><span>03</span><h3>Make yourself at home</h3><p>Furniture & favourite corners</p><b aria-hidden="true">↗</b></Link>
  </div></section></>;
}
