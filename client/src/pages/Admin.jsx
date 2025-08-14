import React, { useEffect, useState, useRef } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { AdminAPI, ProductAPI } from '../api'

const empty = { title:'', description:'', price:'', category:'Mobile Phone', image:'', stock:0 }

export default function Admin() {
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [userForm, setUserForm] = useState({ name:'', email:'', password:'', is_admin:false })
  const [userEditingId, setUserEditingId] = useState(null)
  const [error, setError] = useState('')
  const [userError, setUserError] = useState('')
  const fileRef = useRef()

  const load = async () => {
    try {
      const u = await AdminAPI.users()
      const p = await ProductAPI.list()
      setUsers(u.users)
      setProducts(p.products)
    } catch (e) {
      setError(e.message)
    }
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      if (editingId) {
        await AdminAPI.updateProduct(editingId, {...form, price: parseFloat(form.price||0), stock: parseInt(form.stock||0,10)})
      } else {
        await AdminAPI.addProduct({...form, price: parseFloat(form.price||0), stock: parseInt(form.stock||0,10)})
      }
      setForm(empty)
      setEditingId(null)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const edit = (p) => {
    setEditingId(p.id)
    setForm({
      title: p.title, description: p.description, price: p.price, category: p.category, image: p.image, stock: p.stock
    })
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return
    await AdminAPI.deleteProduct(id)
    await load()
  }

  const saveUser = async () => {
    try {
      const payload = { ...userForm, is_admin: userForm.is_admin ? 1 : 0 }
      if (userEditingId) {
        await AdminAPI.updateUser(userEditingId, payload)
      } else {
        await AdminAPI.addUser(payload)
      }
      setUserForm({ name:'', email:'', password:'', is_admin:false })
      setUserEditingId(null)
      setUserError('')
      await load()
    } catch (e) {
      setUserError(e.message)
    }
  }

  const editUser = (u) => {
    setUserEditingId(u.id)
    setUserForm({ name:u.name, email:u.email, password:'', is_admin:!!u.is_admin })
  }

  const removeUser = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await AdminAPI.deleteUser(id)
      await load()
    } catch (e) {
      setUserError(e.message)
    }
  }

  return (
    <ProtectedRoute admin>
      <div className="row" style={{alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <div className="card">
            <div className="neon-title" style={{fontSize:20}}>{editingId ? 'Edit Product' : 'Add Product'}</div>
            <div className="row" style={{flexDirection:'column'}}>
              <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
              <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
              <div className="row">
                <input placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} />
                <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
                  <option>Mobile Phone</option>
                  <option>Laptop</option>
                  <option>PC</option>
                  <option>TV Screen</option>
                  <option>Addon</option>
                </select>
                <input placeholder="Stock" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} />
              </div>
              <div className="row" style={{alignItems:'center'}}>
                <button type="button" className="ghost" onClick={() => fileRef.current.click()}>Upload Image</button>
                <input type="file" accept="image/*" ref={fileRef} style={{display:'none'}} onChange={e => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => setForm({...form, image: reader.result})
                    reader.readAsDataURL(file)
                  }
                }} />
                {form.image && <img src={form.image} alt="preview" style={{height:40, borderRadius:8}} />}
              </div>
              <div className="row">
                <button onClick={save}>{editingId ? 'Update' : 'Create'}</button>
                {editingId && <button className="ghost" onClick={() => { setForm(empty); setEditingId(null) }}>Cancel</button>}
              </div>
              {error && <div style={{color:'var(--danger)'}}>{error}</div>}
            </div>
          </div>

          <div style={{height:16}}/>

          <div className="card">
            <div className="neon-title" style={{fontSize:20}}>Products</div>
            <table className="table">
              <thead>
                <tr><th>Title</th><th>Price</th><th>Stock</th><th>Category</th><th></th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>{p.category}</td>
                    <td style={{textAlign:'right'}}>
                      <button className="ghost" onClick={() => edit(p)}>Edit</button>{' '}
                      <button className="ghost" onClick={() => remove(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{width:380}}>
          <div className="card">
            <div className="neon-title" style={{fontSize:20}}>Users</div>
            <div className="row" style={{flexDirection:'column', marginBottom:12}}>
              <input placeholder="Name" value={userForm.name} onChange={e=>setUserForm({...userForm, name:e.target.value})} />
              <input placeholder="Email" value={userForm.email} onChange={e=>setUserForm({...userForm, email:e.target.value})} />
              <input type="password" placeholder="Password" value={userForm.password} onChange={e=>setUserForm({...userForm, password:e.target.value})} />
              <label style={{display:'flex', alignItems:'center', gap:4}}>
                <input type="checkbox" checked={userForm.is_admin} onChange={e=>setUserForm({...userForm, is_admin:e.target.checked})} /> Admin
              </label>
              <div className="row">
                <button onClick={saveUser}>{userEditingId ? 'Update' : 'Create'}</button>
                {userEditingId && <button className="ghost" onClick={()=>{setUserForm({name:'',email:'',password:'',is_admin:false}); setUserEditingId(null);}}>Cancel</button>}
              </div>
              {userError && <div style={{color:'var(--danger)'}}>{userError}</div>}
            </div>
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Admin</th><th></th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.is_admin ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="row" style={{justifyContent:'flex-end', gap:8}}>
                        <button className="ghost" onClick={() => editUser(u)}>Edit</button>
                        <button className="ghost" onClick={() => removeUser(u.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
