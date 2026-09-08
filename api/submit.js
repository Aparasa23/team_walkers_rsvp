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

  // Forward to Google Apps Script Webhook — this writes to the Google Sheet
  const gasUrl = 'https://script.google.com/macros/s/AKfycbxx5TdX2AYbgZbiYcDydSXMAP_pKowji2V2IGygYNpKpawprHXLUsXDztOoqC0ZNa5M/exec';

  try {
    const gasResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const rawText = await gasResponse.text();
    console.log('[submit] GAS status:', gasResponse.status, 'body:', rawText);

    let gasData = null;
    try { gasData = JSON.parse(rawText); } catch (e) {
      console.warn('[submit] GAS response not valid JSON:', rawText);
    }

    // If GAS wrote to the sheet and returned ok, send its response directly
    if (gasData && gasData.ok === true) {
      return res.status(200).json(gasData);
    }

    // If GAS returned an explicit error, surface it
    if (gasData && gasData.ok === false) {
      return res.status(200).json(gasData);
    }

    // GAS responded but format was unexpected — still return success with sheet-backed ID if present
    if (gasData && gasData.rsvpId) {
      return res.status(200).json(gasData);
    }

    console.warn('[submit] GAS returned unexpected response, falling back to local response (NOT written to sheet)');
  } catch (e) {
    console.error('[submit] GAS fetch error (NOT written to sheet):', e.message);
  }

  // Last-resort fallback: form submitted OK but NOT saved to Google Sheet
  // This should only happen if GAS is completely unreachable
  const fallbackId = 'TW-FALLBACK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  console.error('[submit] Using fallback ID', fallbackId, '— entry NOT in Google Sheet');

  res.status(200).json({
    ok: true,
    rsvpId: fallbackId,
    name: payload.name.trim(),
    attending: isYes,
    adults,
    children,
    total,
    whatsappLink: 'https://chat.whatsapp.com/GZUDSEp7N2pCVgTpREebHZ?mode=gi_t',
    _warning: 'This RSVP may not have been saved to the Google Sheet. Please contact the organizer.'
  });
};
