import React from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product }) {
  const { add } = useCart()
  const navigate = useNavigate()
  return (
    <div className="card product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div style={{height:160, background:'#0d0d0d', borderRadius:12, marginBottom:12, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #1f1f1f', padding:8, overflow:'hidden'}}>
        <span style={{opacity:0.8}}>{product.image ? <img src={product.image} alt={product.title} style={{maxHeight:150, maxWidth:'100%', borderRadius:12, objectFit:'contain'}}/> : product.title.substring(0,1)}</span>
      </div>
      <div className="neon-title" style={{fontSize:18}}>{product.title}</div>
      <div style={{opacity:0.8, margin:'6px 0 10px'}}>{product.description}</div>
      <div className="row" style={{alignItems:'center', flexWrap:'wrap'}}>
        <div style={{fontSize:18, fontWeight:800}}>${product.price.toFixed(2)}</div>
        <div className="badge">{product.category}</div>
        <div className="space" />
        <button style={{minWidth:120, marginTop:8}} onClick={(e) => { e.stopPropagation(); add(product, 1) }}>Add to Cart</button>
      </div>
    </div>
  )
}
