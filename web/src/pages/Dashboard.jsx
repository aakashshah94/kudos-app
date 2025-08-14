import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/wallet')
      .then(({ data }) => setBalance(data.balancePoints))
      .catch(() => setError('Please log in'));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      {error ? <div>{error}</div> : <div>Points balance: {balance ?? '...'}</div>}
    </div>
  );
}
