import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FormComponent from './Form';
import CodingQuestions from './CodingQuestions';
import { useToast } from './Toast';

function ConductExam({username,token}) {
  const toast = useToast();
  // console.log(username);

  const [regulation, setRegulation] = useState();
  const [batch, setBatch] = useState(-1);
  const [branch, setBranch] = useState(-1);
  const [semester, setSemester] = useState(-1);
  const [subjects, setSubjects] = useState({});
  const [sections,setSections] = useState(["ALL"]);
  const [ccode,setCcode] = useState("");
  const [exam_type,setExam_type] = useState(-1);
  const [displayque,setDisplayque] = useState(0);
  const [question,setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer,setAnswer]=useState("");
  const [qno,setQno] = useState(1);
  const [buttonname,setButtonname] = useState("Upload Questions");
  const [ subjectText, setSubjectText] = useState("");

  const handleregulation = (selectedBatch,selectedbranch) => {
    if (selectedBatch === -1 || selectedbranch === -1) return;
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/getregulation`, {
      headers:{Authorization:token},
      withCredentials: true,
      params: { batch: selectedBatch, branch:selectedbranch }
    })
    .then(res => {
      setRegulation(res.data[0].regulation);
    })
    .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
  };

  const handleaddquestions =(e)=>{
    e.preventDefault();
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/checkeligibility`,{headers:{Authorization:token},
      withCredentials: true,params:{username:username,coursecode:ccode}})
    .then(res =>{
      if(res.data.output==="eligible"){
          axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/getnumofqueposted`,{headers:{Authorization:token},
      withCredentials: true,params:{batch:batch,exam_type:exam_type,branch:branch,coursecode:ccode}})
          .then(res =>{
            if(res.data===20){
              toast.info('Already Assigned', 'Questions are already assigned. View the question paper to see them.');
            }
            else{
              setDisplayque(1);
              setQno(res.data+1);
            }
          })
          .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)))
        }
        else{
          setDisplayque(0);
          toast.warning('Access Denied', 'You are not eligible to assign questions to this subject.');
        }
      
    })
    
  }

  const handlequestion =(e,i=0)=>{
    e.preventDefault();
    axios.post(`http://${import.meta.env.VITE_HOST}:8080/teacher/addquestions`,{batch:batch,exam_type:exam_type,branch:branch,semester:semester,coursecode:ccode,question_no:qno,question:question,options:options,answer:answer},
      {headers:{Authorization:token},
      withCredentials: true,}
    )
    .then(res => {console.log(res.data);
                  if(i===0){setQno(qno+1);}
                  else if(i===13){
                      toast.success('Questions Assigned', 'All questions have been posted successfully.');
                      setDisplayque(0);
                    }
                    setQuestion("");
                    setOptions(["","","",""]);
                    setAnswer("");
          })
    .catch(err => console.error(err))

  }

  useEffect(() => {
    if(batch === -1 || branch === -1 || semester === -1) return;
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/getsubjects`, {
      headers:{Authorization:token},
      withCredentials: true,
      params: {
        regulation: regulation,
        branch: branch,
        semester: semester
      }
    })
    .then(res => {
      setSubjects(res.data[0]);
      setCcode("-1");
    })
    .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
  }, [branch, regulation, semester]);


  const inputStyle = { padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)', fontSize: '0.88rem', color: 'var(--text-primary)', outline: 'none', transition: 'var(--transition)', background: 'var(--bg-card)' };

  var divs = [];
  if (qno <= 20) {
    divs.push(
      <form key={qno} id="que-form" onSubmit={handlequestion}>
        <div className="svec-form-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '10px', borderBottom: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '14px', background: 'var(--accent)', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }}></span>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>Question {qno} of 20</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {Array.from({length: 20}, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < qno - 1 ? 'var(--success)' : i === qno - 1 ? 'var(--accent)' : 'var(--border)', transition: 'background 0.2s' }} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
            <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Q{qno}</span>
            <textarea style={{ ...inputStyle, flex: 1, minHeight: '80px', resize: 'vertical' }} placeholder='Enter Question' value={question} onChange={(e) => setQuestion(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {['A','B','C','D'].map((letter, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.82rem', minWidth: '16px' }}>{letter}</span>
                <input type="text" style={{ ...inputStyle, flex: 1 }} placeholder={`Option ${letter}`} value={options[i]} required autoComplete='on' onChange={(e) => { var updated = [...options]; updated[i] = e.target.value; setOptions(updated); }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.06em' }}>✓ ANSWER:</span>
              <input type='text' style={{ ...inputStyle, width: '220px' }} placeholder='Enter correct answer' value={answer} onChange={(e) => setAnswer(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Save to continue to next question</p>
              {qno === 20 ? (
                <button type="submit" className="svec-btn svec-btn-success" onClick={(e) => handlequestion(e, 13)}>✓ Finish</button>
              ) : (
                <button type="submit" className="svec-btn svec-btn-accent">Save & Next →</button>
              )}
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <div className="svec-form-panel" style={{ marginBottom: '24px' }}>
        <div className="svec-section-title" style={{ marginBottom: '20px', fontSize: '0.78rem' }}></div>
        <div className="svec-form-panel-title">SET EXAM</div>
        <FormComponent
          batch={batch} setBatch={setBatch}
          branch={branch} setBranch={setBranch}
          semester={semester} setSemester={setSemester}
          subjects={subjects} ccode={ccode} setCcode={setCcode}
          exam_type={exam_type} setExam_type={setExam_type}
          sections={sections} setSections={setSections}
          setDisplay={setDisplayque} buttonname={buttonname} setButtonname={setButtonname}
          handleregulation={handleregulation} handlequestions={handleaddquestions}
          subjectText={subjectText} setSubjectText={setSubjectText}
        />
      </div>
      <div style={{display:'none'}}>{subjectText}</div>
      {displayque === 1 && (exam_type === "MID-1" || exam_type === "MID-2") ? (divs) : (null)}
      {displayque === 1 && (exam_type === "INTERNAL" || exam_type === "EXTERNAL") ? (
        <CodingQuestions batch={batch} branch={branch} semester={semester} coursecode={ccode} exam_type={exam_type} />
      ) : (null)}
    </div>
  );
}

export default ConductExam;