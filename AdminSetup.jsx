
import { useState } from 'react';

function AdminSetup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [message, setMessage] = useState('');

  async function createAdmin(e) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/setup-admin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            password,
            setupKey
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message);
        return;
      }

      setMessage('Admin account created successfully! You can now login.');

      setName('');
      setEmail('');
      setPassword('');
      setSetupKey('');
    } catch (error) {
      setMessage('Server connection failed.');
    }
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '25px',
      border: '1px solid #ddd',
      borderRadius: '12px'
    }}>
      <h2 style={{ color: '#2563eb', textAlign: 'center' }}>
        Create Admin Account
      </h2>

      <form onSubmit={createAdmin}>
        <input
          placeholder="Admin Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Admin Setup Key"
          value={setupKey}
          onChange={(e) => setSetupKey(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Create Admin
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  margin: '8px 0',
  boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  marginTop: '10px',
  cursor: 'pointer'
};

export default AdminSetup;
