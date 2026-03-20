import React, { useState } from 'react'

function FormAlert({ message, onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 99999, width: 480, maxWidth: 'calc(100vw - 32px)',
      fontFamily: 'var(--font, "Outfit", sans-serif)',
      animation: 'toastFadeIn 0.2s ease',
    }}>
      <style>{`@keyframes toastFadeIn{from{opacity:0;transform:translateX(-50%) scale(0.97)}to{opacity:1;transform:translateX(-50%) scale(1)}}`}</style>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        background: '#fff',
        border: '1px solid rgba(245,158,11,0.25)',
        borderLeft: '5px solid #f59e0b',
        borderRadius: '12px', padding: '18px 20px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      }}>
        <span style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(245,158,11,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', color: '#f59e0b', fontWeight: 800, marginTop: 1,
        }}>⚠</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', marginBottom: 5 }}>
            Required Fields Missing
          </div>
          <div style={{ fontSize: '0.84rem', color: '#6b7280', lineHeight: 1.5 }}>{message}</div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem',
          padding: '2px 7px', lineHeight: 1, marginTop: 1, flexShrink: 0,
          borderRadius: '6px', fontWeight: 700,
        }}>×</button>
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
  const selectStyle = { width: '100%', minWidth: 0 };

  return (
    <div>
      {alertMsg && <FormAlert message={alertMsg} onClose={() => setAlertMsg(null)} />}
      <form onSubmit={(e) => {

        const required = [
          { val: batch, label: 'Batch' },
          { val: branch, label: 'Branch' },
          { val: semester, label: 'Semester' },
          { val: ccode, label: 'Subject / Course Code' },
          { val: (selectedsec || 'ALL'), label: 'Section' },
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
