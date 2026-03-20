import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from './Toast';

function ViewStudents({ token }) {
  const toast = useToast();
  const [batch, setBatch] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [students, setStudents] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editableStudent, setEditableStudent] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchStudents = () => {
    axios.get('http://localhost:8080/super-admin/get-students', {
      params: { batch, branch, semester, section },
      headers: { Authorization: token }
    })
    .then(response => {
      setStudents(response.data);
    })
    .catch(error => {
      console.error('There was an error fetching the students!', error);
      setStudents([]);
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearched(true);
    fetchStudents();
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setEditableStudent({ ...student });
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setEditableStudent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableStudent(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdate = () => {
    axios.put('http://localhost:8080/super-admin/update-student', editableStudent, {
      headers: { Authorization: token }
    })
      .then(response => {
        console.log('Student updated successfully', response.data);
        toast.success('Saved', 'Student record updated successfully.');
        handleCloseModal();
        fetchStudents();
      })
      .catch(error => {
        console.error('Error updating student', error);
      });
  };

  const fieldStyle = { padding: '9px 13px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'var(--bg-card)', outline: 'none', transition: 'var(--transition)', width: '100%' };
  const labelStyle = { display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '5px' };

  return (
    <div style={{ padding: '28px 32px' }}>
      <div className="svec-form-panel" style={{ marginBottom: '24px' }}>
        <div className="svec-form-panel-title">Search Students</div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            {[
              { label: 'Batch', value: batch, onChange: e => setBatch(e.target.value) },
              { label: 'Branch', value: branch, onChange: e => setBranch(e.target.value.toUpperCase()) },
              { label: 'Semester', value: semester, onChange: e => setSemester(e.target.value.toUpperCase()) },
              { label: 'Section', value: section, onChange: e => setSection(e.target.value.toUpperCase()) },
            ].map(({ label, value, onChange }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <input style={fieldStyle} type="text" value={value} onChange={onChange} required
                  onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
              </div>
            ))}
          </div>
          <button type="submit" className="svec-btn svec-btn-primary">Search Students</button>
        </form>
      </div>

      {searched && students && students.length === 0 && (
        <div className="svec-no-exam">No students found for the given filters.</div>
      )}
      {students && students.length > 0 && (
        <div>
          <div className="svec-section-title">Students ({students.length})</div>
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
                {students.map(student => (
                  <tr key={student.username}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{student.username}</td>
                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="svec-btn svec-btn-outline" style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }} onClick={() => handleViewDetails(student)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedStudent && editableStudent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,45,94,0.5)', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', width: '480px', maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 24px 64px rgba(15,45,94,0.3)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: 'var(--primary)', borderBottom: '2px solid var(--accent)' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Student Details</span>
              <button onClick={handleCloseModal} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '20px 22px', flex: 1 }}>
              {Object.entries(editableStudent).filter(([key]) => key !== 'image').map(([key, value]) => {
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

export default ViewStudents;