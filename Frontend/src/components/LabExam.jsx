import React from 'react'
import Compiler from './Compiler'
import { useNavigate } from 'react-router-dom';
function LabExam() {
  const navigate = useNavigate();

  return (
    <div>
      <Compiler />
    </div>
  )
}

export default LabExam
