import React from 'react'

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
  const labelStyle = { minWidth: '90px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right' };
  const selectStyle = { minWidth: '280px' }; // base - most styling via svec-select-styled class

  return (
    <div>
      <form onSubmit={handlequestions}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '14px 12px', alignItems: 'center', maxWidth: '480px' }}>
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
