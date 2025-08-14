import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card, CardHeader } from '@fluentui/react-components';

export default function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/wallet')
      .then(({ data }) => setBalance(data.balancePoints))
      .catch(() => setError('Please log in'));
  }, []);

  return (
    <Card style={{ maxWidth: 500, margin: '0 auto', padding: 32, boxShadow: '0 2px 16px #e0e7ef', background: '#f9fbff' }}>
      <CardHeader
        header={<h2 style={{ margin: 0, fontWeight: 600, color: '#0078d4' }}>Dashboard</h2>}
      />
      <div style={{ marginTop: 24, fontSize: 20, fontWeight: 500, color: '#333' }}>
        {error ? <span style={{ color: '#d13438' }}>{error}</span> : <span>Points balance: <span style={{ color: '#0078d4', fontWeight: 700 }}>{balance ?? '...'}</span></span>}
      </div>
    </Card>
  );
}