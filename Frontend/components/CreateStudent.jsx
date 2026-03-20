import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx-js-style'

// ─── helpers ────────────────────────────────────────────────────────────────
const BASE_URL = 'http://127.0.0.1:8080/super-admin/create-student'
const ROLE = 'STUDENT'
const REQUIRED_COLS = ['name', 'username', 'batch', 'regulation', 'branch', 'semester', 'section']

// sleep utility for rate-limiting bursts
const sleep = ms => new Promise(r => setTimeout(r, ms))

// post a single student (no image) using URLSearchParams
async function postStudent(student, authToken) {
  const params = new URLSearchParams()
  REQUIRED_COLS.forEach(k => params.append(k, (student[k] ?? '').toString().trim()))
  params.append('role', ROLE)
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (authToken) headers['Authorization'] = authToken
  const res = await axios.post(BASE_URL, params.toString(), { timeout: 30000, headers })
  return res
}

// ─── component ──────────────────────────────────────────────────────────────
function CreateStudent({ token }) {
  // ── single-student form state
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [batch, setBatch] = useState('')
  const [regulation, setRegulation] = useState('')
  const [branch, setBranch] = useState('')
  const [semester, setSemester] = useState('')
  const [section, setSection] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // ── tab state
  const [tab, setTab] = useState('single') // 'single' | 'bulk'

  // ── bulk upload state
  const [xlFile, setXlFile] = useState(null)
  const [parsed, setParsed] = useState([])       // array of row objects
  const [parseError, setParseError] = useState('')
  const [bulkResults, setBulkResults] = useState([]) // [{username, status, msg}]
  const [bulkRunning, setBulkRunning] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [bulkDone, setBulkDone] = useState(false)
  const abortRef = useRef(false)

  const authToken = token || localStorage.getItem('token') || localStorage.getItem('authToken')

  useEffect(() => {
    return () => { if (preview) { try { URL.revokeObjectURL(preview) } catch (_) {} } }
  }, [preview])

  // ── single student handlers ──────────────────────────────────────────────
  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) {
      setImage(f)
      if (preview) try { URL.revokeObjectURL(preview) } catch (_) {}
      setPreview(URL.createObjectURL(f))
    } else { setImage(null); setPreview(null) }
  }

  const handleSingleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null); setLoading(true)
    try {
      const headers = {}
      if (authToken) headers['Authorization'] = authToken
      const axiosOpts = { timeout: 30000, maxContentLength: Infinity, maxBodyLength: Infinity, headers }
      if (image) {
        const fd = new FormData()
        ;[['name', name], ['username', username], ['batch', batch],
          ['regulation', regulation], ['branch', branch],
          ['semester', semester], ['section', section], ['role', ROLE]
        ].forEach(([k, v]) => fd.append(k, v))
        fd.append('image', image)
        await axios.post(BASE_URL, fd, axiosOpts)
      } else {
        const params = new URLSearchParams()
        ;[['name', name], ['username', username], ['batch', batch],
          ['regulation', regulation], ['branch', branch],
          ['semester', semester], ['section', section], ['role', ROLE]
        ].forEach(([k, v]) => params.append(k, v))
        await axios.post(BASE_URL, params.toString(), {
          ...axiosOpts, headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers }
        })
      }
      setMessage({ type: 'success', text: 'Student account created successfully!' })
      setName(''); setUsername(''); setBatch(''); setRegulation('')
      setBranch(''); setSemester(''); setSection(''); setImage(null)
    } catch (err) {
      const serverMsg = err?.response?.data || err.message
      setMessage({ type: 'error', text: typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg) })
    } finally { setLoading(false) }
  }

  // ── bulk upload handlers ─────────────────────────────────────────────────
  const handleXlChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) { setXlFile(null); setParsed([]); setParseError(''); return }
    setXlFile(f); setParseError(''); setParsed([]); setBulkResults([]); setBulkDone(false)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
        if (rows.length === 0) { setParseError('The Excel file is empty.'); return }

        // normalise column names — lowercase, trim
        const normalised = rows.map(row => {
          const out = {}
          Object.keys(row).forEach(k => { out[k.toLowerCase().trim()] = String(row[k]).trim() })
          return out
        })

        // check required columns present in first row
        const firstKeys = Object.keys(normalised[0])
        const missing = REQUIRED_COLS.filter(c => !firstKeys.includes(c))
        if (missing.length) {
          setParseError(`Missing column(s): ${missing.join(', ')}. Expected: ${REQUIRED_COLS.join(', ')}`)
          return
        }

        // filter out completely blank rows
        const valid = normalised.filter(r => REQUIRED_COLS.some(k => r[k] !== ''))
        setParsed(valid)
      } catch (err) {
        setParseError('Could not read the file. Make sure it is a valid .xlsx or .xls file.')
      }
    }
    reader.readAsArrayBuffer(f)
  }

  const handleBulkUpload = async () => {
    if (!parsed.length) return
    setBulkRunning(true); setBulkDone(false); abortRef.current = false
    setBulkResults([]); setBulkProgress(0)

    const results = []
    for (let i = 0; i < parsed.length; i++) {
      if (abortRef.current) {
        results.push({ username: '—', status: 'cancelled', msg: 'Cancelled by user' })
        setBulkResults([...results])
        break
      }
      const row = parsed[i]
      try {
        await postStudent(row, authToken)
        results.push({ username: row.username, name: row.name, status: 'success', msg: 'Created' })
      } catch (err) {
        const serverMsg = err?.response?.data || err.message
        results.push({
          username: row.username, name: row.name, status: 'error',
          msg: typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg)
        })
      }
      setBulkResults([...results])
      setBulkProgress(Math.round(((i + 1) / parsed.length) * 100))
      await sleep(120) // small delay to avoid hammering server
    }

    setBulkRunning(false); setBulkDone(true)
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      REQUIRED_COLS,
      ['John Doe', 'STU001', '2022', 'R20', 'CSE', 'I', 'A'],
      ['Jane Smith', 'STU002', '2022', 'R20', 'CSE', 'I', 'A'],
    ])
    ws['!cols'] = REQUIRED_COLS.map(() => ({ wch: 16 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Students')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'students_template.xlsx'; a.click()
  }

  // ── counts for summary
  const successCount = bulkResults.filter(r => r.status === 'success').length
  const errorCount   = bulkResults.filter(r => r.status === 'error').length

  // ── styles
  const fieldStyle = { padding: '9px 13px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'var(--bg-card)', outline: 'none', transition: 'var(--transition)', width: '100%' }
  const labelStyle = { display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '5px' }

  return (
    <div style={{ padding: '28px 32px' }}>

      {/* ── TAB SWITCHER ── */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', width: 'fit-content' }}>
        {[['single', '👤 Single Student'], ['bulk', '📋 Bulk Upload (Excel)']].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setMessage(null) }}
            style={{
              padding: '10px 22px', border: 'none', fontFamily: 'var(--font)',
              fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer',
              transition: 'var(--transition)',
              background: tab === key ? 'var(--primary)' : 'transparent',
              color: tab === key ? '#fff' : 'var(--text-muted)',
              borderRight: key === 'single' ? '1.5px solid var(--border)' : 'none',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          SINGLE STUDENT TAB
      ══════════════════════════════════════════════ */}
      {tab === 'single' && (
        <div className="svec-form-panel" style={{ maxWidth: '540px' }}>
          <div className="svec-form-panel-title">Create Student Account</div>
          <form onSubmit={handleSingleSubmit} encType="multipart/form-data">
            <div style={{ display: 'grid', gap: '14px' }}>
              {[
                { label: 'Name', value: name, onChange: e => setName(e.target.value), required: true },
                { label: 'Username', value: username, onChange: e => setUsername(e.target.value), required: true },
                { label: 'Batch', value: batch, onChange: e => setBatch(e.target.value) },
                { label: 'Regulation', value: regulation, onChange: e => setRegulation(e.target.value.toUpperCase()) },
                { label: 'Branch', value: branch, onChange: e => setBranch(e.target.value.toUpperCase()) },
                { label: 'Semester', value: semester, onChange: e => setSemester(e.target.value) },
                { label: 'Section', value: section, onChange: e => setSection(e.target.value.toUpperCase()) },
              ].map(({ label, value, onChange, required }) => (
                <div key={label}>
                  <label style={labelStyle}>{label}</label>
                  <input style={fieldStyle} value={value} onChange={onChange} required={required}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Image (optional)</label>
                <input type="file" accept="image/*" onChange={onFileChange}
                  style={{ ...fieldStyle, padding: '7px 13px', cursor: 'pointer' }} />
                {preview && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={preview} alt="preview" style={{ maxWidth: 120, maxHeight: 140, borderRadius: 'var(--radius-md)', border: '2px solid var(--accent)', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: '22px' }}>
              <button className="svec-btn svec-btn-primary" type="submit" disabled={loading} style={{ minWidth: '140px', justifyContent: 'center' }}>
                {loading ? '⟳ Creating...' : '+ Create Student'}
              </button>
            </div>
          </form>
          {message && (
            <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: message.type === 'success' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: '0.88rem', fontWeight: 600 }}>
              {message.text}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          BULK UPLOAD TAB
      ══════════════════════════════════════════════ */}
      {tab === 'bulk' && (
        <div style={{ maxWidth: '800px' }}>

          {/* ── STEP 1: Download template ── */}
          <div className="svec-form-panel" style={{ marginBottom: '20px' }}>
            <div className="svec-form-panel-title">Step 1 — Download Template</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.6 }}>
              Download the Excel template, fill in student details (one row per student), then upload it below.
              Required columns: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent)' }}>{REQUIRED_COLS.join(', ')}</span>
            </p>
            <button className="svec-btn svec-btn-download" onClick={downloadTemplate}>
              ↓ Download Excel Template
            </button>
          </div>

          {/* ── STEP 2: Upload file ── */}
          <div className="svec-form-panel" style={{ marginBottom: '20px' }}>
            <div className="svec-form-panel-title">Step 2 — Upload Filled Excel</div>

            {/* Drop zone */}
            <label htmlFor="xl-upload" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '10px', padding: '32px 20px',
              border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
              background: 'rgba(0,180,216,0.03)', cursor: 'pointer', transition: 'var(--transition)',
              marginBottom: '16px',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(0,180,216,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(0,180,216,0.03)' }}
            >
              <span style={{ fontSize: '2.4rem' }}>📂</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {xlFile ? xlFile.name : 'Click to choose file or drag & drop'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Supports .xlsx and .xls files
                </div>
              </div>
            </label>
            <input id="xl-upload" type="file" accept=".xlsx,.xls" onChange={handleXlChange}
              style={{ display: 'none' }} />

            {parseError && (
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)', fontSize: '0.86rem', fontWeight: 600, marginBottom: '14px' }}>
                ⚠ {parseError}
              </div>
            )}

            {parsed.length > 0 && !bulkRunning && !bulkDone && (
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(0,180,216,0.07)', border: '1px solid rgba(0,180,216,0.2)', color: 'var(--accent)', fontSize: '0.88rem', fontWeight: 600 }}>
                ✓ {parsed.length} student{parsed.length > 1 ? 's' : ''} ready to import
              </div>
            )}
          </div>

          {/* ── STEP 3: Preview & confirm ── */}
          {parsed.length > 0 && (
            <div className="svec-form-panel" style={{ marginBottom: '20px' }}>
              <div className="svec-form-panel-title">Step 3 — Preview & Confirm</div>

              {/* Scrollable preview table */}
              <div style={{ overflowX: 'auto', maxHeight: '260px', overflowY: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '18px' }}>
                <table className="svec-table" style={{ minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      {REQUIRED_COLS.map(c => <th key={c}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((row, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                        {REQUIRED_COLS.map(c => (
                          <td key={c} style={{ fontFamily: c === 'username' ? 'var(--font-mono)' : 'inherit', fontSize: c === 'username' ? '0.83rem' : 'inherit' }}>
                            {row[c] || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!bulkRunning && !bulkDone && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button className="svec-btn svec-btn-primary" onClick={handleBulkUpload}
                    style={{ justifyContent: 'center' }}>
                    ▶ Start Import ({parsed.length} students)
                  </button>
                  <button className="svec-btn svec-btn-outline"
                    onClick={() => { setParsed([]); setXlFile(null); setBulkResults([]); setParseError('') }}>
                    ✕ Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Progress & results ── */}
          {(bulkRunning || bulkDone) && (
            <div className="svec-form-panel">
              <div className="svec-form-panel-title">
                {bulkRunning ? `Importing... ${bulkProgress}%` : `Import Complete — ${successCount} succeeded, ${errorCount} failed`}
              </div>

              {/* Progress bar */}
              <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', marginBottom: '18px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${bulkProgress}%`, borderRadius: '99px', background: errorCount > 0 && bulkDone ? `linear-gradient(90deg, var(--success) ${Math.round((successCount / parsed.length) * 100)}%, var(--danger) ${Math.round((successCount / parsed.length) * 100)}%)` : 'linear-gradient(90deg, var(--accent), var(--success))', transition: 'width 0.3s ease' }} />
              </div>

              {/* Summary chips */}
              {bulkDone && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 14px', borderRadius: '99px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.82rem', fontWeight: 700 }}>
                    ✓ {successCount} Created
                  </span>
                  {errorCount > 0 && (
                    <span style={{ padding: '4px 14px', borderRadius: '99px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.82rem', fontWeight: 700 }}>
                      ✕ {errorCount} Failed
                    </span>
                  )}
                </div>
              )}

              {/* Row-by-row results */}
              <div style={{ maxHeight: '280px', overflowY: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <table className="svec-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.83rem' }}>{r.username}</td>
                        <td>{r.name}</td>
                        <td>
                          <span style={{ padding: '2px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, background: r.status === 'success' ? 'rgba(16,185,129,0.1)' : r.status === 'cancelled' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: r.status === 'success' ? 'var(--success)' : r.status === 'cancelled' ? 'var(--warning)' : 'var(--danger)', border: `1px solid ${r.status === 'success' ? 'rgba(16,185,129,0.25)' : r.status === 'cancelled' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                            {r.status === 'success' ? '✓ Created' : r.status === 'cancelled' ? '— Cancelled' : '✕ Failed'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: r.status === 'error' ? 'var(--danger)' : 'var(--text-muted)', maxWidth: '200px', wordBreak: 'break-word' }}>{r.msg}</td>
                      </tr>
                    ))}
                    {/* Pending rows (not yet processed) */}
                    {bulkRunning && parsed.slice(bulkResults.length).map((row, i) => (
                      <tr key={`pending-${i}`} style={{ opacity: 0.4 }}>
                        <td style={{ color: 'var(--text-muted)' }}>{bulkResults.length + i + 1}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.83rem' }}>{row.username}</td>
                        <td>{row.name}</td>
                        <td><span style={{ padding: '2px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>⏳ Pending</span></td>
                        <td>—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action buttons after run */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                {bulkRunning && (
                  <button className="svec-btn" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)' }}
                    onClick={() => { abortRef.current = true }}>
                    ⏹ Cancel Import
                  </button>
                )}
                {bulkDone && (
                  <>
                    <button className="svec-btn svec-btn-outline"
                      onClick={() => { setParsed([]); setXlFile(null); setBulkResults([]); setBulkDone(false); setBulkProgress(0) }}>
                      ↩ Import Another File
                    </button>
                    {errorCount > 0 && (
                      <button className="svec-btn svec-btn-download"
                        onClick={() => {
                          const failed = bulkResults.filter(r => r.status === 'error')
                          const ws = XLSX.utils.json_to_sheet(failed.map(r => ({ username: r.username, name: r.name, error: r.msg })))
                          const wb = XLSX.utils.book_new()
                          XLSX.utils.book_append_sheet(wb, ws, 'Failed')
                          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
                          const blob = new Blob([wbout], { type: 'application/octet-stream' })
                          const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                          a.download = 'failed_students.xlsx'; a.click()
                        }}>
                        ↓ Download Failed Rows
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreateStudent
