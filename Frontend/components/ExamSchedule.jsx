import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function ExamSchedule(props) {
  const location = useLocation();
  const details = location.state?.details || null;
  const token = props.token;
  const [schedule, setSchedule] = useState([]);
  const [exam, setExam] = useState("");
  const [branch] = useState(details[0].branch);
  const [result, setResult] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      const listsemesters = details[0].role.toLowerCase() === "teacher" || details[0].role.toLowerCase() === "hod"
        ? ["I", "III", "V", "VII"] : [details[0].semester];
      try {
        const responses = await Promise.all(
          listsemesters.map((semester) =>
            axios.get(`http://${import.meta.env.VITE_HOST}:8080/common/getschedule`, {
              headers: { Authorization: token }, withCredentials: true,
              params: { branch, semester },
            })
          )
        );
        const allData = responses.map((res) => res.data);
        setResult(allData);
        setSchedule(allData.flat());
        if (allData[0]?.length > 0) { setExam(allData[0][0].examtype); }
      } catch (error) { console.error("Error fetching schedules:", error); }
    };
    fetchSchedules();
  }, []);

  return (
    <div style={{ padding: '24px 28px' }}>
      {schedule.length > 0 && result.map((items, index) => (
        !items[0]?.semester ? ("") : (
          <div key={index} style={{ marginBottom: '28px' }}>
            <div className="svec-section-title">
              <div className="svec-form-panel-title">{items[0]?.semester} Semester &nbsp;<span style={{ color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'none', fontSize: '0.7rem' }}>({exam})</span></div>
            </div>
            <div className="svec-table-wrap">
              <table className="svec-table">
                <thead>
                  <tr>
                    <th>SNO</th>
                    <th>Subject</th>
                    <th>Course Code</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, rowIndex) => (
                    <tr key={item.id || rowIndex}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{rowIndex + 1}</td>
                      <td style={{ fontWeight: 500 }}>{item.subject}</td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'rgba(0,0,0,0.04)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>{item.coursecode}</span></td>
                      <td>{item.date}</td>
                      <td>{item.startTime}–{item.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ))}
    </div>
  );
}

export default ExamSchedule
