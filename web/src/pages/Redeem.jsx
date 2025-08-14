import React, { useEffect, useState } from 'react';
import { Select, Button, MessageBar, Card, CardHeader } from '@fluentui/react-components';
import axios from '../lib/api';

export default function Redeem() {
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    axios.get('/api/catalog').then(res => setCatalog(res.data.data));
  }, []);

  const handleRedeem = async () => {
    try {
      const res = await axios.post('/api/redemptions', { catalogItemId: selected });
      setStatus({ type: 'success', text: `Redeemed: ${res.data.data.vendorResult.code}` });
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.error || 'Redemption failed.' });
    }
  };

  return (
    <Card style={{ maxWidth: 500, margin: '0 auto', padding: 32, boxShadow: '0 2px 16px #e0e7ef', background: '#f9fbff' }}>
      <CardHeader
        header={<h2 style={{ margin: 0, fontWeight: 600, color: '#0078d4' }}>Redeem Gift Card</h2>}
      />
      <form style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16 }} onSubmit={e => { e.preventDefault(); handleRedeem(); }}>
        {status && <MessageBar messageBarType={status.type === 'error' ? 1 : 0}>{status.text}</MessageBar>}
        <label style={{ fontWeight: 500 }}>Select Gift Card</label>
        <Select value={selected || ''} onChange={e => setSelected(e.target.value)} size="large">
          <option value="" disabled>Select...</option>
          {catalog.map(item => (
            <option key={item.catalogItemId} value={item.catalogItemId}>
              {item.name} (${item.denominationUSD})
            </option>
          ))}
        </Select>
        <Button appearance="primary" size="large" style={{ marginTop: 12 }} type="submit" disabled={!selected}>Redeem</Button>
      </form>
    </Card>
  );
}
