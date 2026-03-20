import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import FormComponent from './Form';
import { useToast } from './Toast';

function UpdateExamSchedule({ token }) {
  const toast = useToast();
  const [regulation, setRegulation] = useState();
  const [batch, setBatch] = useState(-1);
  const [branch, setBranch] = useState(-1);
  const [semester, setSemester] = useState(-1);
  const [subjects, setSubjects] = useState({});
  const [sections, setSections] = useState(["ALL"]);
  const [ccode, setCcode] = useState("");
  const [exam_type, setExam_type] = useState(-1);
  const [displayque, setDisplayque] = useState(0);
  const [buttonname, setButtonname] = useState("SHOW");
  const [subjectText, setSubjectText] = useState("");
  const [schedule, setSchedule] = useState({});
  const [starttime, setStarttime] = useState("");
  const [endtime, setEndtime] = useState("");
  const [date, setDate] = useState("");
  const [id, setId] = useState("");

  const handleregulation = (selectedBatch, selectedbranch) => {
    if (selectedBatch === -1 || selectedbranch === -1) return;
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/getregulation`, {
      headers: { Authorization: token }, withCredentials: true,
      params: { batch: selectedBatch, branch: selectedbranch }
    })
    .then(res => { setRegulation(res.data[0].regulation); })
    .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
  };

  const handlegetschedule = (e) => {
    e.preventDefault();
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/admin/getschedule`, {
      headers: { Authorization: token }, withCredentials: true,
      params: { exam_type, branch, coursecode: ccode, semester, subject: subjectText }
    })
    .then(res => {
      setId(res.data[0].id); setSchedule(res.data[0]);
      setEndtime(res.data[0].endTime); setStarttime(res.data[0].startTime);
      setDate(res.data[0].date); setDisplayque(1);
    })
    .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
  };

  const updateschedule = (e) => {
    e.preventDefault();
    axios.post(`http://${import.meta.env.VITE_HOST}:8080/admin/updateschedule`,
      { id, examtype: exam_type, branch, semester, coursecode: ccode, subject: subjectText, date, startTime: starttime, endTime: endtime },
      { headers: { Authorization: token }, withCredentials: true }
    )
    .then(res => { toast.success('Success', typeof res.data === 'string' ? res.data : 'Operation completed.'); });
  };

  useEffect(() => {
    if (batch === -1 || branch === -1 || semester === -1) return;
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/getsubjects`, {
      headers: { Authorization: token }, withCredentials: true,
      params: { regulation, branch, semester }
    })
    .then(res => { setSubjects(res.data[0]); setCcode("-1"); setSubjectText(); })
    .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
  }, [branch, regulation, semester]);

  const formatDateToInput = (ddmmyyyy) => {
    const [day, month, year] = ddmmyyyy.split("-");
    return `${year}-${month}-${day}`;
  };

  const formatTimeToInput = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  };

  const inputStyle = { padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)', fontSize: '0.88rem', color: 'var(--text-primary)', outline: 'none', transition: 'var(--transition)' };

  return (
    <div style={{ padding: '24px 28px' }}>
      <div className="svec-form-panel" style={{ marginBottom: '24px' }}>
        <div className="svec-form-panel-title">Select Exam to Update</div>
        <FormComponent
          batch={batch} setBatch={setBatch}
          branch={branch} setBranch={setBranch}
          semester={semester} setSemester={setSemester}
          subjects={subjects} ccode={ccode} setCcode={setCcode}
          exam_type={exam_type} setExam_type={setExam_type}
          sections={sections} setSections={setSections}
          setDisplay={setDisplayque} buttonname={buttonname} setButtonname={setButtonname}
          handleregulation={handleregulation} handlequestions={handlegetschedule}
          setSubjectText={setSubjectText}
        />
      </div>

      {displayque === 1 && (
        <div>
          <div className="svec-section-title">Update Schedule</div>
          <form onSubmit={updateschedule}>
            <div className="svec-table-wrap">
              <table className="svec-table">
                <thead>
                  <tr>
                    <th>SNO</th>
                    <th>Course Code</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>1</td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px' }}>{schedule.coursecode}</span></td>
                    <td style={{ fontWeight: 500 }}>{schedule.subject}</td>
                    <td><input type='date' style={inputStyle} required value={formatDateToInput(date)} onChange={(e) => setDate(formatDateToInput(e.target.value))} /></td>
                    <td><input type='time' style={inputStyle} required value={formatTimeToInput(starttime)} onChange={(e) => setStarttime(formatTimeToInput(e.target.value))} /></td>
                    <td><input type='time' style={inputStyle} required value={formatTimeToInput(endtime)} onChange={(e) => setEndtime(formatTimeToInput(e.target.value))} /></td>
                    <td><button type='submit' className="svec-btn svec-btn-accent" style={{ padding: '7px 16px', fontSize: '0.78rem' }}>Save</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default UpdateExamSchedule
