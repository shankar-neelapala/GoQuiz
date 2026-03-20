import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Instructions from './Instructions';
import { useToast } from './Toast';

function StudentDashBoard() {
  const toast = useToast();
  const location = useLocation();
  let details = location.state?.details || null;
  const token = location.state?.token || null;
  const [exams, setExams] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [start, setStart] = useState(0);
  const [ind, setInd] = useState(-1);

  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear());
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = `${hours}:${minutes}`;
    setCurrentTime(formattedTime);

    axios.get(`http://${import.meta.env.VITE_HOST}:8080/student/getexams`, {
      headers: { Authorization: token },
      withCredentials: true,
      params: { branch: details[0].branch, semester: details[0].semester, date: formattedDate }
    })
    .then(res => { if (res.data.length > 0) { setExams(res.data); } })
    .catch(err => { console.error(err); toast.error('Failed to Load', 'Could not fetch exam schedule. Please try again.'); });
  }, [details]);

  const handleExamTime = (now, start, end) => {
    const [currH, currM] = now.split(':').map(Number);
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const currentMinutes = currH * 60 + currM;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const handleSubmitOrNot = async (e, exams) => {
    e.preventDefault();
    if (!details[0] || !exams) { toast.error('Missing Data', 'Incomplete exam data. Please go back and try again.'); return; }
    const allow = handleExamTime(currentTime, exams.startTime, exams.endTime);
    if (!allow) { toast.warning('Exam Not Available', `This exam is only available between ${exams.startTime} and ${exams.endTime}.`); return; }
    try {
      const res = await axios.get(`http://${import.meta.env.VITE_HOST}:8080/common/getresults`, {
        headers: { Authorization: token },
        withCredentials: true,
        params: { batch: details[0].batch, branch: details[0].branch, coursecode: exams.coursecode, exam_type: exams.examtype, semester: details[0].semester, section: details[0].section, username: details[0].username }
      });
      if (res.data != [] && Object.keys(res.data).length > 0) { toast.warning('Already Submitted', 'You have already submitted this exam.'); return; }
      else { setStart(1); }
    } catch (err) { console.error(err); toast.warning('Already Submitted', 'You have already submitted this exam.'); }
  };

  if (!details[0]) {
    return (<div className="svec-error-state"><div className="svec-error-box">ERROR: YOU ARE NOT AN AUTHORIZED PERSON.</div></div>);
  }

  if (start === 1) {
    return (
      <Instructions
        name={details[0].name}
        batch={details[0].batch}
        branch={details[0].branch}
        coursecode={exams[ind].coursecode}
        examtype={exams[ind].examtype}
        subject={exams[ind].subject}
        semester={details[0].semester}
        section={details[0].section}
        username={details[0].username}
        role={details[0].role}
        image={details[0].image}
        token={token}
      />
    );
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      {exams.length > 0 ? (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '3px', height: '16px', background: 'var(--primary)', borderRadius: '2px', flexShrink: 0, display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Today's Exams</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {exams.map((items, index) => (
              <div className="svec-exam-card" key={index}
                onClick={(e) => { setInd(index); handleSubmitOrNot(e, exams[index]); }}>
                <div className="svec-exam-card-title">{items?.subject}</div>
                <div className="svec-exam-card-type">{items?.examtype}</div>
                <div className="svec-exam-card-time">⏰ {items?.startTime} – {items?.endTime}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="svec-no-exam">No exam scheduled for today</div>
      )}
    </div>
  );
}

export default StudentDashBoard;
