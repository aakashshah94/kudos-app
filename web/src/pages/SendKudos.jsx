import React, { useState } from 'react';
import { TextField, PrimaryButton, Checkbox, MessageBar } from '@fluentui/react';
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
      <TextField label="Recipient User ID" value={recipientUserId} onChange={(_, v) => setRecipientUserId(v)} />
      <TextField label="Message" value={message} onChange={(_, v) => setMessage(v)} multiline />
      <TextField label="Points" type="number" value={points} min={MIN_TRANSFER_POINTS} onChange={(_, v) => setPoints(Number(v))} />
      <Checkbox label="Public" checked={isPublic} onChange={(_, c) => setIsPublic(c)} />
      <PrimaryButton text="Send" onClick={handleSend} />
    </div>
  );
}
