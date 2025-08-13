import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider, useCart } from './context/CartContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'

function Navbar() {
  const { user, logout } = useAuth()
  const { open } = useCart()
  const navigate = useNavigate()
  return (
    <div className="nav">
      <div className="container flex">
        <Link className="brand neon-title" to="/">GPT Store</Link>
        <div className="space" />
        <Link to="/">Home</Link>
        {user?.is_admin && <Link to="/admin">Admin</Link>}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && <span className="badge">Hi, {user.name}</span>}
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
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
