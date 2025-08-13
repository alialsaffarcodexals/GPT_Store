import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { OrderAPI } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const { items, total, clear } = useCart()
  const { user } = useAuth()
  const nav = useNavigate()
  const [payment, setPayment] = useState('COD')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const placeOrder = async () => {
    setError('')
    if (!user) { setError('Please login first.'); return }
    if (items.length === 0) { setError('Your cart is empty'); return }
    const payload = {
      items: items.map(it => ({ product_id: it.id, quantity: it.quantity })),
      payment_method: payment
    }
    try {
      const res = await OrderAPI.create(payload)
      setSuccess(res)
      clear()
      setTimeout(() => nav('/'), 1500)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="card" style={{maxWidth:720, margin:'20px auto'}}>
      <div className="neon-title" style={{fontSize:22}}>Checkout</div>
      <div style={{marginTop:10}}>
        <div style={{fontWeight:700}}>Order Summary</div>
        {items.map(it => (
          <div key={it.id} className="row">
            <div>{it.title} x {it.quantity}</div>
            <div className="space" />
            <div>${(it.price * it.quantity).toFixed(2)}</div>
          </div>
        ))}
        <div className="row" style={{fontWeight:900}}>
          <div>Total</div>
          <div className="space" />
          <div>${total.toFixed(2)}</div>
        </div>
        <hr/>
        <div style={{fontWeight:700, marginBottom:6}}>Payment method</div>
        <select value={payment} onChange={e=>setPayment(e.target.value)}>
          <option value="COD">Cash on Delivery</option>
          <option value="CARD">Credit / Debit Card (mock)</option>
          <option value="PAYPAL">PayPal (mock)</option>
        </select>
        <div style={{marginTop:12}}>
          <button onClick={placeOrder}>Place Order</button>
        </div>
        {error && <div style={{color:'var(--danger)', marginTop:8}}>{error}</div>}
        {success && <div style={{color:'var(--accent)', marginTop:8}}>Order #{success.order_id} placed! Total ${success.total.toFixed(2)}</div>}
      </div>
    </div>
  )
}
