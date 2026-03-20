import React from 'react'
import { useNavigate } from 'react-router-dom';

function Instructions(props) {
  const navigate = useNavigate();
  const { name, batch, branch, coursecode, examtype, subject, semester, section, username, token, role, image } = props;

  const handleexam = async (e) => {
    e.preventDefault();
    // Request fullscreen first, then navigate so the exam page starts in fullscreen
    try {
      const elem = document.documentElement;
      const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
      if (req) await req.call(elem);
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
    if (examtype === "MID-1" || examtype === "MID-2") {
      navigate("/exam", { state: { name, batch, branch, coursecode, examtype, subject, semester, section, username, image, session: true, role, token } });
    } else {
      navigate("/compiler", { state: { name, batch, branch, coursecode, examtype, subject, semester, section, username, image, session: true, role, token } });
    }
  };

  return (
    <div className="svec-instructions-wrap">
      <div className="svec-instructions-box">
        <div className="svec-instructions-head">Instructions</div>
        <div className="svec-instructions-body">
          <form onSubmit={handleexam}>
            <ul className="svec-instructions-list">
              <li>The Duration of the contest is 20 Minutes.</li>
              <li>There are a total of 20 questions, and 1/2 marks are awarded for every correct response.</li>
              <li>There are four options for each MCQ out of which only one will be correct.</li>
              <li>If you finished your exam then please submit the exam. If time limit has reached then your answers will be submitted automatically.</li>
              <li>Please submit a response to an MCQ once you are sure, as you cannot change it once submitted.</li>
              <li>The maximum mark for the contest is 10.</li>
            </ul>
            <label className="svec-checkbox-label">
              <input type="checkbox" name="checkbox" id="checkbox" required />
              Mark as if you read all the instructions mentioned above.
            </label>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="submit" className="svec-btn svec-btn-accent" style={{ minWidth: '140px', justifyContent: 'center' }}>
                Start Exam
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Instructions
