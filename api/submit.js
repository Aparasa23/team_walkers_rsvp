module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const payload = req.body || {};

  if (!payload.name || !payload.name.trim()) {
    return res.status(400).json({ ok: false, error: 'Please enter your name.' });
  }

  const isYes = payload.attending === 'Yes';
  const adults = isYes ? Math.max(0, parseInt(payload.adults || 0, 10)) : 0;
  const children = isYes ? Math.max(0, parseInt(payload.children || 0, 10)) : 0;
  const total = adults + children;

  if (isYes && total < 1) {
    return res.status(400).json({ ok: false, error: 'Please enter at least one attendee.' });
  }

  const rsvpId = 'TW-VERCEL-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  // Forward to Google Apps Script Webhook to save directly to Google Sheet
  const gasUrl = 'https://script.google.com/macros/s/AKfycbxx5TdX2AYbgZbiYcDydSXMAP_pKowji2V2IGygYNpKpawprHXLUsXDztOoqC0ZNa5M/exec';
  try {
    const gasResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    const gasData = await gasResponse.json();
    if (gasData && gasData.rsvpId) {
      return res.status(200).json(gasData);
    }
  } catch (e) {
    console.warn('Google Sheet forward warning:', e);
  }

  res.status(200).json({
    ok: true,
    rsvpId,
    name: payload.name.trim(),
    attending: isYes,
    adults,
    children,
    total,
    whatsappLink: 'https://chat.whatsapp.com/GZUDSEp7N2pCVgTpREebHZ?mode=gi_t'
  });
};
