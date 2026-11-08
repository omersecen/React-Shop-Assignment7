const API_URL = 'https://dummyjson.com/products';

async function request(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(response.status === 404
      ? 'Product not found.'
      : `Could not load products (HTTP ${response.status}). Please try again.`);
  }
  return response.json();
}

export async function fetchProducts(signal) {
  const data = await request(`${API_URL}?limit=100`, signal);
  return data.products;
}

export function fetchProduct(id, signal) {
  return request(`${API_URL}/${encodeURIComponent(id)}`, signal);
}
