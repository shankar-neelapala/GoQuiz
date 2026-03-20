import React from 'react'
import { useLocation } from 'react-router-dom';

function StuProfile() {
  const location = useLocation();
  let details = location.state?.details || null;

  return (
    <div className="svec-profile-wrap">
      <table className="svec-profile-table">
        <thead>
          <tr>
            <th colSpan={6}>Student Profile</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="svec-profile-label">Batch</td>
            <td className="svec-profile-colon">:</td>
            <td className="text-uppercase">{details[0].batch}</td>
            <td rowSpan={3} colSpan={3} style={{ textAlign: 'center', background: 'var(--bg-card)' }}>
              <img
                src={details[0].image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuL6TBF6f4OmR3C6yj7pffvMkM13n9j6Prpg&s"}
                alt={details[0].username}
                className="svec-profile-avatar"
              />
            </td>
          </tr>
          <tr>
            <td className="svec-profile-label">Roll No</td>
            <td className="svec-profile-colon">:</td>
            <td className="text-uppercase">{details[0].username}</td>
          </tr>
          <tr>
            <td className="svec-profile-label">Name</td>
            <td className="svec-profile-colon">:</td>
            <td className="text-uppercase">{details[0].name}</td>
          </tr>
          <tr>
            <td className="svec-profile-label">Branch</td>
            <td className="svec-profile-colon">:</td>
            <td className="text-uppercase">{details[0].branch}</td>
            <td className="svec-profile-label">Semester</td>
            <td className="svec-profile-colon">:</td>
            <td className="text-uppercase">{details[0].semester}</td>
          </tr>
          <tr>
            <td className="svec-profile-label">Section</td>
            <td className="svec-profile-colon">:</td>
            <td className="text-uppercase">{details[0].section}</td>
            <td className="svec-profile-label">Role</td>
            <td className="svec-profile-colon">:</td>
            <td className="text-uppercase">{details[0].role}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default StuProfile
