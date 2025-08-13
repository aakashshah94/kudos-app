import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Button } from '@fluentui/react-components';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';

export default function App() {
  return (
    <>
      <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}