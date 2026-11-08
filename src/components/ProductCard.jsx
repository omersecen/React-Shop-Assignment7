import { Link } from 'react-router';
import { useCartStore } from '../store/cartStore';

export default function ProductCard({ product }) {
  const addItem = useCartStore(state => state.addItem);
  return <article className="product-card">
    <Link className="product-image" to={`/products/${product.id}`} aria-label={`View ${product.title}`}>
      <img src={product.thumbnail} alt={product.title} loading="lazy" />
    </Link>
    <div className="product-info">
      <p className="eyebrow">{product.category.replaceAll('-', ' ')}</p>
      <h2><Link to={`/products/${product.id}`}>{product.title}</Link></h2>
      <div className="card-bottom">
        <strong>${product.price.toFixed(2)}</strong>
        <button className="button small" onClick={() => addItem(product)} aria-label={`Add ${product.title} to cart`}>Add to cart +</button>
      </div>
    </div>
  </article>;
}
