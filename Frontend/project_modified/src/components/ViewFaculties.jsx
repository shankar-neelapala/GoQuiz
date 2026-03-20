import React, { useState } from 'react';
import axios from 'axios';

function ViewFaculties({ token }) {
  const [branch, setBranch] = useState('');
  const [faculties, setFaculties] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [editableFaculty, setEditableFaculty] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchFaculties = () => {
    axios.get('http://localhost:8080/super-admin/get-teachers', {
      params: { branch },
      headers: { Authorization: token }
    })
    .then(response => {
      setFaculties(response.data);
    })
    .catch(error => {
      console.error('There was an error fetching the faculties!', error);
      setFaculties([]);
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearched(true);
    fetchFaculties();
  };

  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty);
    setEditableFaculty({ ...faculty });
  };

  const handleCloseModal = () => {
    setSelectedFaculty(null);
    setEditableFaculty(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableFaculty(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdate = () => {
    axios.post('http://localhost:8080/super-admin/update-faculty', editableFaculty, {
      headers: { Authorization: token }
    })
      .then(response => {
        console.log('Faculty updated successfully', response.data);
        handleCloseModal();
        fetchFaculties(); 
      })
      .catch(error => {
        console.error('Error updating faculty', error);
      });
  };

  const fieldStyle = { padding: '9px 13px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'var(--bg-card)', outline: 'none', transition: 'var(--transition)', width: '100%' };
  const labelStyle = { display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '5px' };

  return (
    <div style={{ padding: '28px 32px' }}>
      <div className="svec-form-panel" style={{ marginBottom: '24px' }}>
        <div className="svec-form-panel-title">Search Faculties</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Branch</label>
            <input type="text" style={fieldStyle} value={branch} onChange={(e) => setBranch(e.target.value.toUpperCase())} required
              onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
          </div>
          <button type="submit" className="svec-btn svec-btn-primary">Search Faculties</button>
        </form>
      </div>

      {searched && faculties && faculties.length === 0 && (
        <div className="svec-no-exam">No faculties found for the given branch.</div>
      )}
      {faculties && faculties.length > 0 && (
        <div>
          <div className="svec-section-title">Faculties ({faculties.length})</div>
          <div className="svec-table-wrap">
            <table className="svec-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map(faculty => (
                  <tr key={faculty.username}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{faculty.username}</td>
                    <td style={{ fontWeight: 500 }}>{faculty.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="svec-btn svec-btn-outline" style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }} onClick={() => handleViewDetails(faculty)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedFaculty && editableFaculty && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,45,94,0.5)', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', width: '480px', maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 24px 64px rgba(15,45,94,0.3)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: 'var(--primary)', borderBottom: '2px solid var(--accent)' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Faculty Details</span>
              <button onClick={handleCloseModal} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '20px 22px', flex: 1 }}>
              {Object.entries(editableFaculty).filter(([key]) => key !== 'image' && key !== 'subjectsname').map(([key, value]) => {
                const isReadOnly = key === 'id' || key === 'role';
                let inputType = 'text';
                if (key === 'email') inputType = 'email';
                if (key === 'password') inputType = 'password';
                let displayValue = value;
                if (Array.isArray(value)) displayValue = value.join(', ');
                if (value === null || value === undefined) displayValue = '';
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '120px', flexShrink: 0, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                    <div style={{ flex: 1 }}>
                      {isReadOnly ? (
                        <div style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{displayValue}</div>
                      ) : (
                        <input type={inputType} name={key} value={displayValue} onChange={handleInputChange}
                          style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)', fontSize: '0.88rem', color: 'var(--text-primary)', outline: 'none', width: '100%', transition: 'var(--transition)' }}
                          onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="svec-btn svec-btn-outline" style={{ padding: '8px 18px', fontSize: '0.82rem' }} onClick={handleCloseModal}>Cancel</button>
              <button className="svec-btn svec-btn-primary" style={{ padding: '8px 18px', fontSize: '0.82rem' }} onClick={handleUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewFaculties;