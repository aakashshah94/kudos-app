import React, { useState } from 'react';
import { Input, Textarea, Button, Checkbox, MessageBar } from '@fluentui/react-components';
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
    <div>
      <h2>Send Kudos</h2>
      {status && <MessageBar messageBarType={status.type === 'error' ? 1 : 0}>{status.text}</MessageBar>}
  <label>Recipient User ID</label>
  <Input value={recipientUserId} onChange={e => setRecipientUserId(e.target.value)} />
  <label>Message</label>
  <Textarea value={message} onChange={e => setMessage(e.target.value)} />
  <label>Points</label>
  <Input type="number" value={points} min={MIN_TRANSFER_POINTS} onChange={e => setPoints(Number(e.target.value))} />
      <Checkbox label="Public" checked={isPublic} onChange={(_, c) => setIsPublic(c)} />
  <Button onClick={handleSend}>Send</Button>
    </div>
  );
}
