import React, { useEffect, useState } from 'react'
import { ProductAPI } from '../api'
import ProductCard from '../components/ProductCard'
import CartDrawer from '../components/CartDrawer'

const categories = ['Mobile Phone', 'Laptop', 'PC', 'TV Screen', 'Addon']

export default function Home() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await ProductAPI.list({ search, category, minPrice, maxPrice })
    setProducts(res.products)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="card">
        <div className="row">
          <input placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Min $" value={minPrice} onChange={e=>setMinPrice(e.target.value)} style={{width:120}} />
          <input placeholder="Max $" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} style={{width:120}} />
          <div className="space" />
          <button onClick={load}>Filter</button>
        </div>
      </div>
      <div style={{height:12}}/>
      {loading ? <div>Loading...</div> : (
        <div className="grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
      <CartDrawer />
    </div>
  )
}
