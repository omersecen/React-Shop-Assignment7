import { useSearchParams } from 'react-router';
import { fetchProducts } from '../api/productsApi';
import useFetch from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
  const { loading, error, data: products } = useFetch(fetchProducts, []);
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  function updateFilter(key, value) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true });
  }
  const categories = [...new Set((products ?? []).map(product => product.category))].sort();
  const filtered = (products ?? []).filter(product =>
    product.title.toLowerCase().includes(query.toLowerCase()) && (!category || product.category === category));
  return <>
    <header className="page-heading"><p className="eyebrow">THE COLLECTION</p><h1>Find your everyday favourites.</h1><p>Little discoveries, all in one place. Find something that feels like you.</p></header>
    <div className="filters">
      <label>Search products<input type="search" placeholder="What are you looking for?" value={query} onChange={event => updateFilter('q', event.target.value)} /></label>
      <label>Category<select value={category} onChange={event => updateFilter('category', event.target.value)}>
        <option value="">All categories</option>
        {category && !categories.includes(category) && <option value={category}>{category}</option>}
        {categories.map(value => <option key={value} value={value}>{value.replaceAll('-', ' ')}</option>)}
      </select></label>
      <button className="button secondary" onClick={() => setParams(previous => { const next = new URLSearchParams(previous); next.delete('q'); next.delete('category'); return next; })}>Reset filters</button>
    </div>
    {loading ? <p className="notice" role="status">Loading the collection…</p>
      : error ? <div className="notice error" role="alert"><h2>Unable to load products</h2><p>{error.message}</p><p>Check your connection and reload the page.</p></div>
      : <><p className="result-count" role="status">{filtered.length} {filtered.length === 1 ? 'product' : 'products'} found</p>
        {filtered.length === 0 ? <div className="notice"><h2>No matching products</h2><p>Try another search or reset the filters.</p></div>
          : <div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} />)}</div>}</>}
  </>;
}
