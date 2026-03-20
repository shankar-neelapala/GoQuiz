import React, { useState } from 'react'

/* Inline styled alert dialog — same look as the exam security overlay */
function FormAlert({ message, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font, "Outfit", sans-serif)',
      animation: 'confirmIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <style>{`@keyframes confirmIn{from{opacity:0;transform:scale(0.90) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: '16px', padding: '28px 32px',
        minWidth: '360px', maxWidth: '460px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: '#fef2f2', border: '1.5px solid #fecaca',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
          }}>⚠</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Required Fields Missing</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 22px 48px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 24px', borderRadius: '8px', border: 'none',
            background: '#00b4d8', color: '#fff', cursor: 'pointer',
            fontSize: '0.83rem', fontWeight: 700, fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.target.style.background='#0096c7'}
          onMouseLeave={e => e.target.style.background='#00b4d8'}
          >OK</button>
        </div>
      </div>
    </div>
  );
}

function FormComponent({
  batch, setBatch,
  branch, setBranch,
  semester, setSemester,
  subjects,
  ccode, setCcode,
  exam_type, setExam_type,
  sections,
  selectedsec,
  setSelectedsec,
  setDisplay,
  buttonname,
  handleregulation,
  handlequestions,
  setSubjectText,
}) {
  const [alertMsg, setAlertMsg] = useState(null);
  const labelStyle = { minWidth: '100px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right', whiteSpace: 'nowrap' };
  const selectStyle = { width: '100%', minWidth: 0 }; // stretch full column width

  return (
    <div>
      {alertMsg && <FormAlert message={alertMsg} onClose={() => setAlertMsg(null)} />}
      <form onSubmit={(e) => {
        // Validate all required selects
        const required = [
          { val: batch, label: 'Batch' },
          { val: branch, label: 'Branch' },
          { val: semester, label: 'Semester' },
          { val: ccode, label: 'Subject / Course Code' },
          { val: selectedsec, label: 'Section' },
          { val: exam_type, label: 'Exam Type' },
        ];
        const missing = required.filter(r => !r.val || r.val === '-1' || r.val === '');
        if (missing.length > 0) {
          e.preventDefault();
          setAlertMsg('Please select: ' + missing.map(r => r.label).join(', '));
          return;
        }
        handlequestions(e);
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '14px 16px', alignItems: 'center', width: '100%', maxWidth: '700px' }}>
          <span style={labelStyle}>Course</span>
          <select className="svec-select-styled" style={selectStyle}>
            <option value="btech">BTECH</option>
          </select>

          <span style={labelStyle}>Batch</span>
          <select className="svec-select-styled" style={selectStyle} value={batch}
            onChange={(e) => { setBatch(e.target.value); handleregulation(e.target.value, branch); setDisplay(0); }}>
            <option value="-1" disabled>SELECT</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>

          <span style={labelStyle}>Branch</span>
          <select className="svec-select-styled" style={selectStyle} value={branch}
            onChange={(e) => { setBranch(e.target.value); setDisplay(0); handleregulation(batch, e.target.value); }}>
            <option value="-1" disabled>SELECT</option>
            <option value="CSE">COMPUTER SCIENCE AND ENGINEERING</option>
            <option value="ECE">ELECTRONICS AND COMMUNICATION ENGINEERING</option>
            <option value="ECT">ELECTRICAL AND ELECTRONICS ENGINEERING (ECT)</option>
            <option value="EEE">ELECTRICAL AND ELECTRONICS ENGINEERING</option>
            <option value="ME">MECHANICAL ENGINEERING</option>
            <option value="CE">CIVIL ENGINEERING</option>
            <option value="CST">COMPUTER SCIENCE AND TECHNOLOGY</option>
            <option value="CAI">COMPUTER SCIENCE AND ENGINEERING (AI)</option>
            <option value="AIM">COMPUTER SCIENCE AND ENGINEERING (AIM)</option>
          </select>

          <span style={labelStyle}>Semester</span>
          <select className="svec-select-styled" style={selectStyle} value={semester}
            onChange={(e) => { setSemester(e.target.value); setSubjectText(subjects.subjectname?.[0]); setExam_type(-1); }}>
            <option value="-1" disabled>SELECT</option>
            {["I","II","III","IV","V","VI","VII","VIII"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <span style={labelStyle}>Subject</span>
          <select className="svec-select-styled" style={selectStyle} value={ccode}
            onChange={(e) => { let selectedText = e.target.options[e.target.selectedIndex].text; setCcode(e.target.value); setSubjectText(selectedText); setExam_type(-1); }}>
            <option value="-1" disabled>SELECT</option>
            {Array.isArray(subjects.subjectname) && subjects.subjectname.length > 0 ? (
              subjects.subjectname.map((name, index) => (
                <option key={index} value={subjects.coursecode?.[index]}>{name}</option>
              ))
            ) : (<option disabled>No subjects available</option>)}
          </select>

          <span style={labelStyle}>Section</span>
          <select className="svec-select-styled" style={selectStyle} value={selectedsec}
            onChange={(e) => { setSelectedsec(e.target.value); setExam_type(-1); }}>
            {sections.map(i => (<option key={i} value={i}>{i === -1 ? "SELECT" : i}</option>))}
          </select>

          <span style={labelStyle}>Exam</span>
          {(ccode && ccode.length >= 3 && ccode[ccode.length - 3] === 'L' || ccode.includes('CSTJE01') || ccode.includes('CSTJE02')) ? (
            <select className="svec-select-styled" style={selectStyle} value={exam_type} onChange={(e) => { setExam_type(e.target.value); setDisplay(0); }}>
              <option value="-1" disabled>SELECT</option>
              <option value="INTERNAL">INTERNAL</option>
              <option value="EXTERNAL">EXTERNAL</option>
            </select>
          ) : (
            <select className="svec-select-styled" style={selectStyle} value={exam_type} onChange={(e) => { setExam_type(e.target.value); setDisplay(0); }}>
              <option value="-1" disabled>SELECT</option>
              <option value="MID-1">MID-1</option>
              <option value="MID-2">MID-2</option>
            </select>
          )}
        </div>

        <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'center' }}>
          <button type="submit" className="svec-btn svec-btn-primary">{buttonname}</button>
        </div>
      </form>
    </div>
  );
}

export default FormComponent;
