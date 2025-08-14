import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const { add } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    ProductAPI.get(id)
      .then(res => setProduct(res.product))
      .catch(e => setError(e.message));
    ProductAPI.reviews(id)
      .then(res => setReviews(res.reviews))
      .catch(() => {});
  }, [id]);

  const submitReview = async () => {
    try {
      const payload = { rating: Number(reviewForm.rating), comment: reviewForm.comment };
      const res = await ProductAPI.addReview(id, payload);
      setReviews([res.review, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
    } catch (e) {
      setError(e.message);
    }
  };

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
        {reviews.length === 0 && <p style={{opacity:0.8}}>No reviews yet.</p>}
        {reviews.map(r => (
          <div key={r.id} style={{marginBottom:12}}>
            <strong>{r.name}</strong> ({r.rating}/5)
            <div style={{opacity:0.8}}>{r.comment}</div>
          </div>
        ))}
        {user ? (
          <div style={{marginTop:12}}>
            <div className="row" style={{flexDirection:'column'}}>
              <select value={reviewForm.rating} onChange={e=>setReviewForm({...reviewForm, rating:e.target.value})}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <textarea
                placeholder="Write a review"
                value={reviewForm.comment}
                onChange={e=>setReviewForm({...reviewForm, comment:e.target.value})}
              />
              <button onClick={submitReview}>Submit Review</button>
            </div>
          </div>
        ) : (
          <p style={{opacity:0.8}}>Please log in to write a review.</p>
        )}
      </div>
    </div>
  );
}
