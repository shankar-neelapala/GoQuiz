import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/Login'
import Student from './components/Student'
import React from 'react'
import Instructions from './components/Instructions'
import Exam from './components/Exam'
import Employee from './components/Employee'
import GroqChatDirect from './components/GrokChatDirect'
import MyCodeEditor from './components/MyCodeEditor'
import Compiler from './components/Compiler'
import LabExam from './components/LabExam'
import CodingQuestions from './components/CodingQuestions'
import Admin from './components/Admin'
import CreateStudent from './components/CreateStudent'
import CreateFaculty from './components/CreateFaculty'
import { ToastProvider } from './components/Toast'
import ViewProgress from './components/ViewProgress'

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student" element={<Student />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/chat" element={<GroqChatDirect />} />
          <Route path="/compiler" element={<Compiler />} />
          <Route path="/labexam" element={<LabExam />} />
          <Route path="/add-coding-question" element={<CodingQuestions />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/create-student" element={<CreateStudent />} />
          <Route path="/create-faculty" element={<CreateFaculty />} />
          <Route path="/view-progress" element={<ViewProgress />}/>
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
