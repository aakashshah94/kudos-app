import React, { useState } from 'react';
import { TextField, PrimaryButton, MessageBar } from '@fluentui/react';
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
    <div>
      <h2>Monthly Admin Report</h2>
      <TextField label="Month (YYYY-MM)" value={month} onChange={(_, v) => setMonth(v)} />
      <PrimaryButton text="Fetch CSV" onClick={handleFetch} disabled={!month} />
      {error && <MessageBar messageBarType={1}>{error}</MessageBar>}
      {csv && (
        <pre style={{ marginTop: 16, background: '#f6f6f6', padding: 12 }}>{csv}</pre>
      )}
    </div>
  );
}
