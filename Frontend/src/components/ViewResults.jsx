import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import FormComponent from './Form';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { useToast } from './Toast';
import { useNavigate } from 'react-router-dom';

function ViewResult({ token }) {
  const toast = useToast();
  const [regulation, setRegulation] = useState();
  const [batch, setBatch] = useState(-1);
  const [branch, setBranch] = useState(-1);
  const [semester, setSemester] = useState(-1);
  const [subjects, setSubjects] = useState({});
  const [sections, setSections] = useState([-1, "A", "B", "C", "D"]);
  const [selectedsec, setSelectedsec] = useState();
  const [ccode, setCcode] = useState("");
  const [exam_type, setExam_type] = useState(-1);
  const [result, setResult] = useState([]);
  const [buttonname, setButtonname] = useState("View Result");
  const [displayres, setDisplayres] = useState(true);
  const [display, setDisplay] = useState(0);
  const [subjectText, setSubjectText] = useState();
  const navigate = useNavigate();

  const handleViewQuiz = (res) => {
    console.log(res)
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/student/examquestions`, {
        headers: { Authorization: token }, withCredentials: true,
        params: { username : res.username, batch : res.batch, branch : res.branch, coursecode : res.coursecode, examtype : res.examType}
      })
      .then((res) => {
        //navigate("/view-progress", { state: { res, token } });
         console.log(res.data);
       })
       .catch(() => toast.error('Error', 'Failed to load questions.'));
  };


  const handleregulation = (selectedBatch, selectedbranch) => {
    if (selectedBatch === -1 || selectedbranch === -1) return;
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/getregulation`, {
      headers: { Authorization: token }, withCredentials: true,
      params: { batch: selectedBatch, branch: selectedbranch }
    })
    .then(res => { setRegulation(res.data[0].regulation); setSections(res.data[0].sections); })
    .catch(err => toast.error('Error', err?.response?.data?.message || err.message || String(err)));
  };

  const handleresult = (e) => {
    e.preventDefault();
    axios.get(`http://${import.meta.env.VITE_HOST}:8080/teacher/getresultslist`, {
      headers: { Authorization: token }, withCredentials: true,
      params: { batch, branch, coursecode: ccode, exam_type, semester, section: selectedsec }
    })
    .then(res => { setResult(res.data); if (res.data.length === 0) { setDisplayres(1); } })
    .catch(err => { toast.error('Error', err?.response?.data?.message || err.message || String(err)); });
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

  const handleDownload = () => {
    const filteredData = result.map((item, index) => ({
      SNO: index + 1, ROLLNO: item.username, SEMESTER: item.semester,
      EXAM: item.examType, SUBJECT: subjectText, MARKS: item.marks,
    }));
    const ws = XLSX.utils.json_to_sheet(filteredData);
    ws['!cols'] = [{ wch: 6 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 50 }, { wch: 10 }];
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = XLSX.utils.encode_cell({ r, c });
        if (!ws[cell]) continue;
        const isHeader = r === range.s.r;
        ws[cell].s = { alignment: { horizontal: 'center', vertical: 'center' }, font: { name: 'Calibri', sz: isHeader ? 12 : 11, bold: isHeader } };
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `${branch + "_" + selectedsec + "_SEMESTER" + semester + "_" + exam_type + "_"}_RESULTS.xlsx`);
  };

  return (
    <div style={{ padding: '24px 28px', width: '100%', boxSizing: 'border-box' }}>
      <div className="svec-form-panel" style={{ marginBottom: '24px' }}>
        <div className="svec-form-panel-title">Filter Quiz Results</div>
        <FormComponent
          batch={batch} setBatch={setBatch}
          branch={branch} setBranch={setBranch}
          semester={semester} setSemester={setSemester}
          subjects={subjects} ccode={ccode} setCcode={setCcode}
          exam_type={exam_type} setExam_type={setExam_type}
          sections={sections} setSections={setSections}
          selectedsec={selectedsec} setSelectedsec={setSelectedsec}
          setDisplay={setDisplay} buttonname={buttonname} setButtonname={setButtonname}
          handleregulation={handleregulation} handlequestions={handleresult}
          setSubjectText={setSubjectText}
        />
      </div>

      {Array.isArray(result) && result.length > 0 && (
        <div>
          <div className="svec-section-title">Results</div>
          <div className="svec-table-wrap" style={{ marginBottom: '20px' }}>
            <table className="svec-table">
              <thead>
                <tr>
                  <th>SNO</th>
                  <th>Username</th>
                  <th>Marks</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {result.map((res, index) => (
                  <tr key={res.username + index}>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{index + 1}</td>
                    <td style={{ fontWeight: 500 }}>{res.username}</td>
                    <td>
                      <span style={{ background: res.marks > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: res.marks > 0 ? 'var(--success)' : 'var(--danger)', padding: '2px 10px', borderRadius: '99px', fontWeight: 700, fontSize: '0.85rem' }}>
                        {res.marks}
                      </span>
                    </td>
                    <td>
                      <button className="svec-btn svec-btn-outline" style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }} onClick={() => handleViewQuiz(res)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" className="svec-btn svec-btn-download" onClick={handleDownload}>
              ↓ Download Excel
            </button>
          </div>
        </div>
      )}
      {result.length === 0 && displayres === 1 && (
        <div className="svec-no-exam" style={{ paddingTop: '32px' }}>
          No results found for selected filters.
        </div>
      )}
    </div>
  );
}

export default ViewResult;
