import React, { useState } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import { useToast } from './Toast';

function CodingQuestions(props) {
  const toast = useToast();
  
  const [batch, setBatch] = useState(props.batch || '');
  const [branch, setBranch] = useState(props.branch || '');
  const [examType, setExamType] = useState(props.exam_type || '');
  const [semester, setSemester] = useState(props.semester || '');
  const [courseCode, setCourseCode] = useState(props.coursecode ||'');
  const [questionNo, setQuestionNo] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [marks, setMarks] = useState('');
  const [description, setDescription] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index][field] = value;
    setTestCases(updatedTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', output: '' }]);
  };

  const removeTestCase = (index) => {
    const updatedTestCases = [...testCases];
    updatedTestCases.splice(index, 1);
    setTestCases(updatedTestCases);
  };

  const validateForm = () => {
    if (!questionNo || !questionTitle) {
      toast.warning('Validation Error', 'Please provide question number and title.');
      return false;
    }
    if (!marks || Number(marks) <= 0) {
      toast.warning('Validation Error', 'Please provide valid marks for the question.');
      return false;
    }
    if (!description || description.trim() === '' || description === '<p><br></p>') {
      toast.warning('Validation Error', 'Question description is required.');
      return false;
    }
    for (let i = 0; i < testCases.length; i++) {
      if (!testCases[i].input || !testCases[i].output) {
        toast.warning('Incomplete Test Case', `Please fill input and output for test case #${i + 1}.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const body = {
      batch,
      exam_type: examType,
      branch,
      semester,
      coursecode: courseCode,
      question_no: questionNo,
      question_title: questionTitle,
      question_description: description,
      testCases: testCases.map(tc => tc.input),
      testCasesOutput: testCases.map(tc => tc.output),
      marks: parseFloat(marks),
    };

    try {
      const response = await axios.post(`http://${import.meta.env.VITE_HOST}:8081/faculty/create`, body);

      if (response.status === 200) {
        toast.success('Saved', 'Coding question saved successfully.');

        // optional: clear form after success
        setQuestionTitle('');
        setQuestionNo('');
        setDescription('');
        setTestCases([{ input: '', output: '' }]);
        setMarks('');
      }
    } catch (err) {
      console.error(err);
      let errorMessage = 'Failed to save question.';
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += ` Server responded with ${err.response.status}: ${err.response.data}`;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage += ' No response from server.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += ` ${err.message}`;
      }
      toast.error('Error', errorMessage);
    }
  };

  // Configuration for the editor's toolbar
  const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const fieldStyle = { padding: '9px 13px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'var(--bg-card)', outline: 'none', transition: 'var(--transition)', width: '100%' };
  const labelStyle = { display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '5px' };

  return (
    <div style={{ padding: '24px 28px' }}>
      <div className="svec-form-panel">
        <div className="svec-form-panel-title">Add New Coding Question</div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '14px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>Question No.</label>
            <input
              name="questionNo"
              type="number"
              min="1"
              style={fieldStyle}
              value={questionNo}
              onChange={(e) => setQuestionNo(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Question Title</label>
            <input
              name="questionTitle"
              type="text"
              style={fieldStyle}
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              placeholder={questionNo ? `Question ${questionNo}: Title` : 'Question Title'}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Marks</label>
            <input
              name="marks"
              type="number"
              min="0"
              style={fieldStyle}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Preview header: shows "Question X: Title" above the description */}
        <div className="mb-2">
          <h5>
            {questionNo ? `Question ${questionNo}` : 'Question'}:
            {' '}
            {questionTitle ? questionTitle : '(No title yet)'}
          </h5>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Question Description (HTML will be sent)
          </label>
          <ReactQuill
            theme="snow"
            value={description}
            onChange={setDescription}
            modules={modules}
            placeholder="Enter the question description. You can use the toolbar for formatting and to add images."
            style={{ height: '300px', marginBottom: '50px' }}
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }}></div>
        <div className="svec-section-title" style={{ marginBottom: '14px' }}>Test Cases</div>
        {testCases.map((testCase, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '12px', alignItems: 'start' }}>
            <div>
              <label style={labelStyle}>Test Case #{index + 1} — Input</label>
              <textarea
                id={`test-case-input-${index}`}
                name={`testcase_input_${index}`}
                style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                rows="3"
                value={testCase.input}
                onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                placeholder="Input for the test case"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Expected Output</label>
              <textarea
                id={`test-case-output-${index}`}
                name={`testcase_output_${index}`}
                style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                rows="3"
                value={testCase.output}
                onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                placeholder="Expected output for the test case"
                required
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
              <button
                type="button"
                className="svec-btn"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)', padding: '8px 14px', fontSize: '0.78rem' }}
                onClick={() => removeTestCase(index)}
                disabled={testCases.length === 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))},

        <div style={{ marginTop: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            className="svec-btn svec-btn-outline"
            onClick={addTestCase}
          >
            + Add Test Case
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }}></div>

        <button type="submit" className="svec-btn svec-btn-primary">
          ✓ Save Question
        </button>
      </form>
      </div>
    </div>
  );
}

export default CodingQuestions;