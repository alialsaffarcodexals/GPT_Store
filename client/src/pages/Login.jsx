import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      nav('/')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="card" style={{maxWidth:420, margin:'20px auto'}}>
      <div className="neon-title" style={{fontSize:22}}>Login</div>
      <form onSubmit={submit} className="row" style={{flexDirection:'column'}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div style={{color:'var(--danger)'}}>{error}</div>}
        <button type="submit">Login</button>
      </form>
      <div style={{opacity:0.7, marginTop:10}}>Admin seed: admin@gptstore.local / Admin@123</div>
    </div>
  )
}
