import React, { useState } from 'react'
import axios from 'axios'

function CreateFaculty({token}) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [branch, setBranch] = useState('')
  const [role, setRole] = useState('TEACHER')
  const [teachsub, setTeachsub] = useState([]) // array of subjects
  const [subjectInput, setSubjectInput] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const addSubject = () => {
    const v = subjectInput.trim()
    if (v) {
      const upper = v.toUpperCase()
      if (!teachsub.includes(upper)) {
        setTeachsub(prev => [...prev, upper])
      }
      setSubjectInput('')
    }
  }

  const removeSubject = (s) => {
    setTeachsub(prev => prev.filter(x => x !== s))
  }

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0]
    setImage(f || null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const url = 'http://localhost:8080/super-admin/create-teacher'
      const fd = new FormData()
      fd.append('name', name)
      fd.append('username', username)
      fd.append('branch', branch)
      fd.append('role', role)
      // append each teachsub separately so backend can bind to List<String>
      teachsub.forEach(sub => fd.append('teachsub', sub))
      if (image) fd.append('image', image)

      const res = await axios.post(url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // axios resolves non-2xx as throw, so if we reach here it's success
      const data = res.data
      const text = typeof data === 'string' ? data : JSON.stringify(data)
      setMessage({ type: 'success', text: 'Faculty account created successfully!'})
      // reset form
      setName('')
      setUsername('')
      setBranch('')
      setRole('')
      setTeachsub([])
      setImage(null)
    } catch (err) {
      // try to extract server message
      const serverMsg = err?.response?.data || err.message
      const text = typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg)
      setMessage({ type: 'error', text: text || 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = { padding: '9px 13px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'var(--bg-card)', outline: 'none', transition: 'var(--transition)', width: '100%' };
  const labelStyle = { display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '5px' };

  return (
    <div style={{ padding: '28px 32px' }}>
      <div className="svec-form-panel" style={{ maxWidth: '540px' }}>
        <div className="svec-form-panel-title">Create Faculty Account</div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} required
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Username</label>
              <input style={fieldStyle} value={username} onChange={e => setUsername(e.target.value)} required
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Branch</label>
              <input style={fieldStyle} value={branch} onChange={e => setBranch(e.target.value.toUpperCase())}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select className="svec-select-styled" style={{}} value={role} onChange={e => setRole(e.target.value)}>
                <option value="TEACHER">TEACHER</option>
                <option value="HOD">HOD</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Subjects Taught</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input style={{ ...fieldStyle, flex: 1 }} value={subjectInput} onChange={e => setSubjectInput(e.target.value.toUpperCase())} placeholder="Enter subject code and press Add"
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button type="button" className="svec-btn svec-btn-outline" style={{ whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }} onClick={addSubject}>+ Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {teachsub.map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(0,180,216,0.25)', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700 }}>
                    {s}
                    <button type="button" onClick={() => removeSubject(s)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Image (optional)</label>
              <input type="file" accept="image/*" onChange={onFileChange}
                style={{ ...fieldStyle, padding: '7px 13px', cursor: 'pointer' }} />
            </div>
          </div>

          <div style={{ marginTop: '22px' }}>
            <button className="svec-btn svec-btn-primary" type="submit" disabled={loading} style={{ minWidth: '140px', justifyContent: 'center' }}>
              {loading ? '⟳ Creating...' : '+ Create Faculty'}
            </button>
          </div>
        </form>

        {message && (
          <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: message.type === 'success' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: '0.88rem', fontWeight: 600 }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateFaculty
