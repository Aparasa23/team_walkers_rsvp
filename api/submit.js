const https = require('https');

module.exports = (req, res) => {
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

  // Background async forward to Google Apps Script Webhook to save to Google Sheet
  const gasUrl = 'https://script.google.com/macros/s/AKfycbxuKtniNEjmH5eb1LiAcElhPxp_R5EnjI3m5xF8_gmfRKm-nh0-1tp8EWNGX1_a_Yk4/exec';
  try {
    const postData = JSON.stringify(payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const reqGas = https.request(gasUrl, options, () => {});
    reqGas.on('error', () => {});
    reqGas.write(postData);
    reqGas.end();
  } catch (e) {}

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
