import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import SendKudos from './pages/SendKudos.jsx';
import Redeem from './pages/Redeem.jsx';
import AdminReport from './pages/AdminReport.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { FluentProvider, webLightTheme, Card, CardHeader } from '@fluentui/react-components';

export default function App() {
  return (
    <FluentProvider theme={webLightTheme} style={{ minHeight: '100vh', background: '#f4f6fa' }}>
      <header style={{ background: '#fff', boxShadow: '0 2px 8px #eee', padding: '16px 0', marginBottom: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: 28, color: '#0078d4' }}>Kudos App</h1>
          <nav style={{ display: 'flex', gap: 24 }}>
            <Link to="/">Dashboard</Link>
            <Link to="/send-kudos">Send Kudos</Link>
            <Link to="/redeem">Redeem</Link>
            <Link to="/admin-report">Admin Report</Link>
            <Link to="/login">Login</Link>
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <Card style={{ padding: 32, minHeight: 400, boxShadow: '0 2px 16px #e0e7ef', background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/send-kudos" element={<SendKudos />} />
            <Route path="/redeem" element={<Redeem />} />
            <Route path="/admin-report" element={<AdminReport />} />
          </Routes>
        </Card>
      </main>
    </FluentProvider>
  );
}