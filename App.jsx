
import { useState, useEffect } from 'react';
import './App.css';
import Auth from './Auth';
import AdminSetup from './AdminSetup';

function App() {
  const isAdminSetup = window.location.pathname === '/admin-setup';

  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);

  function handleLogin(result) {
    setUser(result.user);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setStudents([]);
  }

  async function getStudents() {
    try {
      const response = await fetch(
        'http://localhost:5000/api/registered-students'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.log('Error fetching students:', error);
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      getStudents();
    }
  }, [user]);

  if (isAdminSetup) {
    return <AdminSetup />;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return (
      <div className="container">
        <h1>Admin Dashboard</h1>

        <p>Welcome, {user.name}!</p>

        <button onClick={handleLogout}>Logout</button>

        <h2>Registered Students</h2>

        <p>Total Students: {students.length}</p>

        {students.length === 0 ? (
          <p>No students registered yet.</p>
        ) : (
          students.map((student) => (
            <div className="student" key={student._id}>
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Email:</strong> {student.email}</p>
              <p>
                <strong>DOB:</strong>{' '}
                {student.dob
                  ? new Date(student.dob).toLocaleDateString()
                  : 'Not available'}
              </p>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Student Dashboard</h1>

      <p>Welcome, {user.name}!</p>
      <p>Email: {user.email}</p>
      <p>Role: Student</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default App;
