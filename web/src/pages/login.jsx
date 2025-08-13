import { useState } from 'react';
import api from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const onLogin = async () => {
    try {
      const { data } = await api.post('/auth/login', { email });
      localStorage.setItem('token', data.token);
      setMsg('Logged in. Go to Dashboard.');
    } catch {
      setMsg('Login failed');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Login (pilot)</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      <button onClick={onLogin}>Login</button>
      <div>{msg}</div>
    </div>
  );
}