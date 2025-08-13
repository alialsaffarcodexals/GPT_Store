import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider, useCart } from './context/CartContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import Product from './pages/Product'

function Navbar() {
  const { user, logout } = useAuth()
  const { open } = useCart()
  const navigate = useNavigate()
  return (
    <div className="nav">
      <div className="container flex">
        <Link className="brand neon-title" to="/">GPT Store</Link>
        <Link to="/">Home</Link>
        {user?.is_admin && <Link to="/admin">Admin</Link>}
        <div className="space" />
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && (
          <div className="row" style={{alignItems:'center'}}>
            <span style={{fontSize:18}}>👤</span>
            <span>{user.name}</span>
          </div>
        )}
        {user && <button className="ghost" onClick={() => { logout(); navigate('/'); }}>Logout</button>}
        <button onClick={open}>Cart</button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/products/:id" element={<Product />} />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
