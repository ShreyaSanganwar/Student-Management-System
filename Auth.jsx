
import { useState } from 'react';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginType, setLoginType] = useState('student');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isLogin ? 'login' : 'register';

    const data = isLogin
      ? { email, password }
      : { name, email, password, dob };

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || 'Something went wrong');
        return;
      }

      if (isLogin) {
        if (
          (loginType === 'admin' && result.user.role !== 'admin') ||
          (loginType === 'student' && result.user.role !== 'student')
        ) {
          setMessage('Please select the correct login type.');
          return;
        }

        onLogin(result);
      } else {
        setMessage('Registration successful! Please login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (error) {
      setMessage('Server connection failed. Please try again.');
    }
  };

  const buttonStyle = {
    padding: '10px 20px',
    margin: '5px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#2563eb',
    color: 'white'
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '25px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      textAlign: 'center'
    }}>
      <h2>{isLogin ? 'Login' : 'Student Registration'}</h2>

      {isLogin && (
        <div>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => {
              setLoginType('admin');
              setMessage('');
            }}
          >
            Admin Login
          </button>

          <button
            type="button"
            style={buttonStyle}
            onClick={() => {
              setLoginType('student');
              setMessage('');
            }}
          >
            Student Login
          </button>

          <p>Selected: {loginType === 'admin' ? 'Admin' : 'Student'}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '90%', padding: '10px', margin: '8px 0' }}
            />

            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              style={{ width: '90%', padding: '10px', margin: '8px 0' }}
            />
          </>
        )}

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '90%', padding: '10px', margin: '8px 0' }}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '90%', padding: '10px', margin: '8px 0' }}
        />

        <button type="submit" style={buttonStyle}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      {message && <p>{message}</p>}

      <p>
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
      </p>

      <button
        type="button"
        style={buttonStyle}
        onClick={() => {
          setIsLogin(!isLogin);
          setMessage('');
        }}
      >
        {isLogin ? 'Register as Student' : 'Back to Login'}
      </button>
    </div>
  );
}

export default Auth;
