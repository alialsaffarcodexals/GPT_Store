import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthAPI } from '../api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await AuthAPI.me()
        setUser(res.user)
      } catch {}
      setLoading(false)
    })()
  }, [])

  const login = async (email, password) => {
    const res = await AuthAPI.login(email, password)
    setUser(res.user)
  }

  const register = async (name, email, password) => {
    const res = await AuthAPI.register(name, email, password)
    setUser(res.user)
  }

  const logout = async () => {
    await AuthAPI.logout()
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>
}
