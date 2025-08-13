import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { isOpen, close, items, remove, setQty, total } = useCart()
  return (
    <div style={{
      position:'fixed', top:0, right:0, height:'100%', width:isOpen?360:0, overflow:'hidden',
      background:'#0b0b0b', borderLeft:'1px solid #1f1f1f', transition:'width .25s ease', zIndex:20, boxShadow:'-6px 0 30px rgba(0,0,0,0.4)'
    }}>
      <div className="card" style={{borderRadius:0, height:'100%', display:'flex', flexDirection:'column'}}>
        <div className="row" style={{alignItems:'center'}}>
          <div className="neon-title" style={{fontSize:20}}>Your Cart</div>
          <div className="space" />
          <button className="ghost" onClick={close}>Close</button>
        </div>
        <hr/>
        <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12}}>
          {items.length === 0 && <div style={{opacity:0.7}}>Your cart is empty.</div>}
          {items.map(it => (
            <div key={it.id} className="card" style={{padding:12}}>
              <div style={{fontWeight:700}}>{it.title}</div>
              <div className="row" style={{alignItems:'center'}}>
                <div>${(it.price * it.quantity).toFixed(2)}</div>
                <div className="space" />
                <input type="number" min="1" value={it.quantity} style={{width:70}} onChange={e => setQty(it.id, parseInt(e.target.value||'1',10))} />
                <button className="ghost" onClick={() => remove(it.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <hr/>
        <div className="row" style={{alignItems:'center'}}>
          <div style={{fontWeight:900, fontSize:18}}>Total: ${total.toFixed(2)}</div>
          <div className="space" />
          <Link to="/checkout"><button disabled={items.length===0}>Proceed to Checkout</button></Link>
        </div>
      </div>
    </div>
  )
}
