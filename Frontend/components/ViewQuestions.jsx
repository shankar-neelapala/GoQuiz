import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import FormComponent from './Form';
import { useToast } from './Toast';

function ViewQuestions({ username, token }) {
  const toast = useToast();
  const [regulation, setRegulation] = useState();
  const [batch, setBatch] = useState(-1);
  const [branch, setBranch] = useState(-1);
  const [semester, setSemester] = useState(-1);
  const [subjects, setSubjects] = useState({});
  const [sections, setSections] = useState([-1, "ALL"]);
  const [ccode, setCcode] = useState("");
  const [exam_type, setExam_type] = useState(-1);
  const [displayque, setDisplayque] = useState(0);
  const [question, setQuestion] = useState([]);
  const [buttonname, setButtonname] = useState("View Questions");
  const [subjectText, setSubjectText] = useState("");
  const [updatebutton, setUpdatebutton] = useState("UPDATE");

  const handleregulation = (selectedBatch, selectedbranch) => {
    if (selectedBatch === -1 || selectedbranch === -1) return;
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/getregulation`, {
      headers: { Authorization: token }, withCredentials: true,
      params: { batch: selectedBatch, branch: selectedbranch }
    })
    .then(res => { setRegulation(res.data[0].regulation); })
    .catch(err => { toast.error('Error', err?.response?.data?.message || err.message || String(err)); setSubjects({}); });
  };

  const handleviewquestions = (e) => {
    e.preventDefault();
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/checkeligibility`, {
      headers: { Authorization: token }, withCredentials: true,
      params: { username, coursecode: ccode }
    })
    .then(res => {
      if (res.data.output === "eligible") {
        axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/getquestions`, {
          headers: { Authorization: token }, withCredentials: true,
          params: { batch, exam_type, branch, coursecode: ccode }
        })
        .then(res => { if (res.data !== "") { setQuestion(res.data); setDisplayque(1); } else { toast.info('No Questions', 'No questions have been entered for this exam yet.'); } })
        .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
      } else {
        setDisplayque(0);
        toast.warning('Access Denied', 'You are not eligible to view questions for this subject.');
      }
    });
  };

  const handleupdateque = (e, index) => {
    e.preventDefault();
    axios.put(`http://${import.meta.env.VITE_HOST}:8080/teacher/updatequestion`,
      { id: question[index].id, batch, exam_type, branch, semester: question[index].semester, coursecode: ccode, question_no: question[index].question_no, question: question[index].question, options: question[index].options, answer: question[index].answer },
      { headers: { Authorization: token }, withCredentials: true }
    )
    .then(res => { if (res.data === 1) { toast.success('Updated', 'Changes saved successfully.'); } })
    .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
  };

  useEffect(() => {
    if (batch === -1 || branch === -1 || semester === -1) return;
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/getsubjects`, {
      headers: { Authorization: token }, withCredentials: true,
      params: { regulation, branch, semester }
    })
    .then(res => { setSubjects(res.data[0]); setCcode("-1"); })
    .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
  }, [branch, regulation, semester]);

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)', fontSize: '0.88rem', color: 'var(--text-primary)', outline: 'none', transition: 'var(--transition)', resize: 'vertical' };

  return (
    <div style={{ padding: '24px 28px' }}>
      <div className="svec-form-panel" style={{ marginBottom: '24px' }}>
        <div className="svec-form-panel-title">Select Question Paper</div>
        <FormComponent
          batch={batch} setBatch={setBatch}
          branch={branch} setBranch={setBranch}
          semester={semester} setSemester={setSemester}
          subjects={subjects} ccode={ccode} setCcode={setCcode}
          exam_type={exam_type} setExam_type={setExam_type}
          sections={sections} setSections={setSections}
          displayque={displayque} setDisplay={setDisplayque}
          buttonname={buttonname} setButtonname={setButtonname}
          handleregulation={handleregulation} handlequestions={handleviewquestions}
          setSubjectText={setSubjectText}
        />
      </div>

      {displayque === 1 && Array.isArray(question) && (
        <div>
          <div className="svec-section-title">Questions ({question.length})</div>
          {question.map((result, index) => (
            <div key={index} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px 24px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '14px', alignItems: 'flex-start' }}>
                <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', minWidth: '36px', textAlign: 'center' }}>Q{result.question_no}</span>
                <textarea style={{ ...inputStyle, minHeight: '60px' }} value={result.question}
                  onChange={(e) => { const updated = [...question]; updated[index] = { ...updated[index], question: e.target.value }; setQuestion(updated); }}
                  onClick={() => setUpdatebutton("UPDATE")} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', paddingLeft: '50px' }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '20px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{String.fromCharCode(65 + i)}</span>
                    <input type="text" style={{ ...inputStyle, resize: 'none' }} value={result.options[i] || ""}
                      onChange={(e) => { const updated = [...question]; const updatedOptions = [...updated[index].options]; updatedOptions[i] = e.target.value; updated[index].options = updatedOptions; setQuestion(updated); }}
                      onClick={() => setUpdatebutton("UPDATE")} required />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.06em' }}>✓ ANSWER:</span>
                  <input type='text' style={{ ...inputStyle, width: '220px', resize: 'none' }} value={result.answer}
                    onChange={(e) => { const updated = [...question]; updated[index].answer = e.target.value; setQuestion(updated); }}
                    onClick={() => setUpdatebutton("UPDATE")} required />
                </div>
                <button className="svec-btn svec-btn-primary" style={{ padding: '7px 18px', fontSize: '0.78rem' }}
                  onClick={(e) => { handleupdateque(e, index); setUpdatebutton("UPDATED"); }}>
                  {updatebutton}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewQuestions
