import React, { useState } from 'react';
import { Input, Textarea, Button, Checkbox, MessageBar, Card, CardHeader } from '@fluentui/react-components';
import axios from '../lib/api';

const MIN_TRANSFER_POINTS = 50;

export default function SendKudos() {
  const [recipientUserId, setRecipientUserId] = useState('');
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [points, setPoints] = useState(MIN_TRANSFER_POINTS);
  const [status, setStatus] = useState(null);

  const handleSend = async () => {
    try {
      const res = await axios.post('/api/transfers', { recipientUserId, message, isPublic, points });
      setStatus({ type: 'success', text: 'Kudos sent!' });
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.error || 'Failed to send kudos.' });
    }
  };

  return (
    <Card style={{ maxWidth: 500, margin: '0 auto', padding: 32, boxShadow: '0 2px 16px #e0e7ef', background: '#f9fbff' }}>
      <CardHeader
        header={<h2 style={{ margin: 0, fontWeight: 600, color: '#0078d4' }}>Send Kudos</h2>}
      />
      <form style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16 }} onSubmit={e => { e.preventDefault(); handleSend(); }}>
        {status && <MessageBar messageBarType={status.type === 'error' ? 1 : 0}>{status.text}</MessageBar>}
        <label style={{ fontWeight: 500 }}>Recipient User ID</label>
        <Input value={recipientUserId} onChange={e => setRecipientUserId(e.target.value)} size="large" />
        <label style={{ fontWeight: 500 }}>Message</label>
        <Textarea value={message} onChange={e => setMessage(e.target.value)} size="large" />
        <label style={{ fontWeight: 500 }}>Points</label>
        <Input type="number" value={points} min={MIN_TRANSFER_POINTS} onChange={e => setPoints(Number(e.target.value))} size="large" />
        <Checkbox label="Public" checked={isPublic} onChange={(_, c) => setIsPublic(c)} />
        <Button appearance="primary" size="large" style={{ marginTop: 12 }} type="submit">Send</Button>
      </form>
    </Card>
  );
}
