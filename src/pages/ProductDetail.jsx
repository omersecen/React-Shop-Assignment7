import { useNavigate, useParams } from 'react-router';
import { fetchProduct } from '../api/productsApi';
import useFetch from '../hooks/useFetch';
import { useCartStore } from '../store/cartStore';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data: product } = useFetch(fetchProduct, [id]);
  const addItem = useCartStore(state => state.addItem);
  return <>
    <button className="text-button" onClick={() => navigate('/products')}>← Back to collection</button>
    {loading ? <p className="notice" role="status">Loading product…</p>
      : error ? <div className="notice error" role="alert"><h1>{error.message === 'Product not found.' ? 'Product not found' : 'Unable to load product'}</h1><p>{error.message}</p></div>
      : product && <article className="product-detail">
        <div className="detail-image"><img src={product.thumbnail} alt={product.title} /></div>
        <div><p className="eyebrow">{product.category.replaceAll('-', ' ')}</p><h1>{product.title}</h1><p className="detail-price">${product.price.toFixed(2)}</p><p className="description">{product.description}</p>
          <button className="button" onClick={() => addItem(product)}>Add to cart +</button>
          <p className="muted">Your cart is saved on this browser. Sign in to review it.</p>
          <button className="text-button" onClick={() => navigate(`/products/${Number(id) + 1}`)}>Next product →</button>
        </div>
      </article>}
  </>;
}
