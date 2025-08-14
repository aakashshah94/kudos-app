import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SendKudos from './pages/SendKudos.jsx';
import Redeem from './pages/Redeem.jsx';
import AdminReport from './pages/AdminReport.jsx';

export default function App() {
  return (
    <>
      <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/login">Login</Link>
        <Link to="/send-kudos">Send Kudos</Link>
        <Link to="/redeem">Redeem</Link>
        <Link to="/admin-report">Admin Report</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/send-kudos" element={<SendKudos />} />
        <Route path="/redeem" element={<Redeem />} />
        <Route path="/admin-report" element={<AdminReport />} />
      </Routes>
    </>
  );
}