import React, { useEffect, useState } from 'react';
import { Select, Button, MessageBar } from '@fluentui/react-components';
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
    <div>
      <h2>Redeem Gift Card</h2>
      {status && <MessageBar messageBarType={status.type === 'error' ? 1 : 0}>{status.text}</MessageBar>}
      <label>Select Gift Card</label>
      <Select value={selected || ''} onChange={e => setSelected(e.target.value)}>
        <option value="" disabled>Select...</option>
        {catalog.map(item => (
          <option key={item.catalogItemId} value={item.catalogItemId}>
            {item.name} (${item.denominationUSD})
          </option>
        ))}
      </Select>
  <Button onClick={handleRedeem} disabled={!selected}>Redeem</Button>
    </div>
  );
}
