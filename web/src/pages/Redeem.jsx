import React, { useEffect, useState } from 'react';
import { Dropdown, PrimaryButton, MessageBar } from '@fluentui/react';
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
      <Dropdown
        label="Select Gift Card"
        options={catalog.map(item => ({
          key: item.catalogItemId,
          text: `${item.name} ($${item.denominationUSD})`
        }))}
        selectedKey={selected}
        onChange={(_, o) => setSelected(o.key)}
      />
      <PrimaryButton text="Redeem" onClick={handleRedeem} disabled={!selected} />
    </div>
  );
}
