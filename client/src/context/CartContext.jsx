import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const Ctx = createContext(null)
export const useCart = () => useContext(Ctx)

export function CartProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')||'[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  const add = (product, qty=1) => {
    setItems(prev => {
      const found = prev.find(p => p.id === product.id)
      if (found) return prev.map(p => p.id===product.id ? {...p, quantity: p.quantity + qty} : p)
      return [...prev, {...product, quantity: qty}]
    })
    setIsOpen(true)
  }

  const remove = (id) => setItems(prev => prev.filter(p => p.id !== id))
  const setQty = (id, qty) => setItems(prev => prev.map(p => p.id===id ? {...p, quantity: Math.max(1, qty)} : p))
  const clear = () => setItems([])
  const total = useMemo(() => items.reduce((s, p) => s + p.price * p.quantity, 0), [items])

  return <Ctx.Provider value={{ isOpen, open, close, items, add, remove, setQty, clear, total }}>{children}</Ctx.Provider>
}
