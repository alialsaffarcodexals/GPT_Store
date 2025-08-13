import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductAPI } from '../api';
import { useCart } from '../context/CartContext';

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const { add } = useCart();

  useEffect(() => {
    ProductAPI.get(id)
      .then(res => setProduct(res.product))
      .catch(e => setError(e.message));
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!product) return <div>Loading...</div>;

  return (
    <div className="card">
      <div className="row" style={{alignItems: 'flex-start'}}>
        {product.image && (
          <img src={product.image} alt={product.title} style={{maxWidth: 300, borderRadius: 12}} />
        )}
        <div style={{flex:1}}>
          <div className="neon-title" style={{fontSize:24}}>{product.title}</div>
          <p style={{opacity:0.8}}>{product.description}</p>
          <div style={{fontWeight:800, fontSize:20}}>${product.price.toFixed(2)}</div>
          <div className="badge">{product.category}</div>
          <div style={{marginTop:12}}>
            <button style={{minWidth:140}} onClick={() => add(product, 1)}>Add to Cart</button>
          </div>
        </div>
      </div>
      <hr />
      <div>
        <div className="neon-title" style={{fontSize:20}}>Customer Reviews</div>
        <p style={{opacity:0.8}}>No reviews yet.</p>
      </div>
    </div>
  );
}
