import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(name, email, password)
      nav('/')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="card" style={{maxWidth:420, margin:'20px auto'}}>
      <div className="neon-title" style={{fontSize:22}}>Create account</div>
      <form onSubmit={submit} className="row" style={{flexDirection:'column'}}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div style={{color:'var(--danger)'}}>{error}</div>}
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
