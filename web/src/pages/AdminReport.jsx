import React, { useState } from 'react';
import { Input, Button, MessageBar, Card, CardHeader } from '@fluentui/react-components';
import axios from '../lib/api';

export default function AdminReport() {
  const [month, setMonth] = useState('');
  const [csv, setCsv] = useState('');
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    setError(null);
    try {
      const res = await axios.get(`/api/admin/reports/monthly?month=${month}`);
      setCsv(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch report.');
    }
  };

  return (
    <Card style={{ maxWidth: 500, margin: '0 auto', padding: 32, boxShadow: '0 2px 16px #e0e7ef', background: '#f9fbff' }}>
      <CardHeader
        header={<h2 style={{ margin: 0, fontWeight: 600, color: '#0078d4' }}>Monthly Admin Report</h2>}
      />
      <form style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16 }} onSubmit={e => { e.preventDefault(); handleFetch(); }}>
        <label style={{ fontWeight: 500 }}>Month (YYYY-MM)</label>
        <Input value={month} onChange={e => setMonth(e.target.value)} size="large" />
        <Button appearance="primary" size="large" style={{ marginTop: 12 }} type="submit" disabled={!month}>Fetch CSV</Button>
        {error && <MessageBar messageBarType={1}>{error}</MessageBar>}
        {csv && (
          <pre style={{ marginTop: 16, background: '#f6f6f6', padding: 12 }}>{csv}</pre>
        )}
      </form>
    </Card>
  );
}
