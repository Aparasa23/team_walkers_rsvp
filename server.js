const http = require('http');
const fs = require('fs');
const path = require('path');

const INITIAL_PORT = parseInt(process.env.PORT || '3080', 10);
const CSV_FILE = path.join(__dirname, 'RSVP_Responses_Local.csv');
const CONFIG_FILE = path.join(__dirname, 'event_schedule.json');

const CSV_HEADERS = [
  'Timestamp',
  'RSVP ID',
  'Primary Name',
  'Phone',
  'Email',
  'Attending',
  'Adults',
  'Children',
  'Total Guests',
  'Guest Names',
  'Available Event Days',
  'Dietary Restrictions / Allergies',
  'Comments'
];

// Ensure CSV file exists with headers
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, CSV_HEADERS.join(',') + '\n', 'utf8');
}

function escapeCsv(field) {
  const str = String(field == null ? '' : field).replace(/"/g, '""');
  return `"${str}"`;
}

function handleRequest(req, res) {
  // Enable CORS for easy local testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/Index.html')) {
    const indexPath = path.join(__dirname, 'Index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading Index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/config') {
    const fullConfig = {
      eventName: 'Team Walkers – Ganesh Chaturthi 2026',
      eventDate: 'September 14 – 19, 2026',
      venue: '4839 W Quartz Valley Circle, Riverton, UT 84096',
      whatsappLink: 'https://chat.whatsapp.com/GZUDSEp7N2pCVgTpREebHZ?mode=gi_t',
      events: [
        { id: 'event-1', dateIso: '2026-09-14', dateLabel: 'Monday, September 14, 2026', shortDate: 'Mon • Sep 14', startTime: '7:00 PM', endTime: '10:00 PM', title: 'Ganesh Chavithi Pooja & Idol Revealing', description: 'Revealing Vinayaka Idol, Ganesh Chavithi Pooja followed by Prasadam', fixedMainEvent: true },
        { id: 'event-2', dateIso: '2026-09-15', dateLabel: 'Tuesday, September 15, 2026', shortDate: 'Tue • Sep 15', startTime: '7:00 PM', endTime: '10:00 PM', title: 'Ganesh Pooja & Game Night', description: 'Ganesh Pooja followed by Game Night', fixedMainEvent: false },
        { id: 'event-3', dateIso: '2026-09-16', dateLabel: 'Wednesday, September 16, 2026', shortDate: 'Wed • Sep 16', startTime: '7:00 PM', endTime: '10:00 PM', title: 'Ganesh Pooja & Cultural Night', description: 'Ganesh Pooja followed by Cultural Night', fixedMainEvent: false },
        { id: 'event-4', dateIso: '2026-09-17', dateLabel: 'Thursday, September 17, 2026', shortDate: 'Thu • Sep 17', startTime: '7:00 PM', endTime: '10:00 PM', title: 'Ganesh Pooja & Tambola Night', description: 'Ganesh Pooja followed by Tambola Night', fixedMainEvent: false },
        { id: 'event-5', dateIso: '2026-09-18', dateLabel: 'Friday, September 18, 2026', shortDate: 'Fri • Sep 18', startTime: '7:00 PM', endTime: '10:00 PM', title: 'Annadanam & Laddu Auction', description: 'Annadanam and Laddu Auction', fixedMainEvent: false },
        { id: 'event-6', dateIso: '2026-09-19', dateLabel: 'Saturday, September 19, 2026', shortDate: 'Sat • Sep 19', startTime: '4:00 PM', endTime: '8:00 PM', title: 'Utti Program, Procession & Nimarjanam', description: 'Utti Program, followed by Ganesh Procession and Nimarjanam', fixedMainEvent: false }
      ]
    };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(fullConfig));
    return;
  }

  if ((req.method === 'POST' && url.pathname === '/api/submit') || (req.method === 'POST' && url.pathname === '/api/rsvp')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        
        if (!payload.name || !payload.name.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Please enter your name.' }));
          return;
        }

        const isYes = payload.attending === 'Yes';
        const adults = isYes ? Math.max(0, parseInt(payload.adults || 0, 10)) : 0;
        const children = isYes ? Math.max(0, parseInt(payload.children || 0, 10)) : 0;
        const total = adults + children;

        if (isYes && total < 1) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Please enter at least one attendee.' }));
          return;
        }

        const rsvpId = 'TW-VERCEL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        const timestamp = new Date().toISOString();
        const availabilityStr = Array.isArray(payload.availability) ? payload.availability.join(' | ') : '';

        try {
          const row = [
            escapeCsv(timestamp),
            escapeCsv(rsvpId),
            escapeCsv(payload.name),
            escapeCsv(payload.phone),
            escapeCsv(payload.email),
            escapeCsv(payload.attending),
            escapeCsv(adults),
            escapeCsv(children),
            escapeCsv(total),
            escapeCsv(payload.guestNames),
            escapeCsv(availabilityStr),
            escapeCsv(payload.dietary),
            escapeCsv(payload.comments)
          ].join(',') + '\n';

          fs.appendFileSync(CSV_FILE, row, 'utf8');
        } catch (csvErr) {
          console.warn('CSV append warning:', csvErr);
        }

        const responseData = {
          ok: true,
          rsvpId,
          name: payload.name.trim(),
          attending: isYes,
          adults,
          children,
          total,
          whatsappLink: 'https://chat.whatsapp.com/GZUDSEp7N2pCVgTpREebHZ?mode=gi_t'
        };

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(responseData));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON payload.' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

function startServer(port) {
  const server = http.createServer(handleRequest);
  server.listen(port, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Team Walkers RSVP server is running locally!`);
    console.log(`👉 Open in your browser: http://localhost:${port}`);
    console.log(`==================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(INITIAL_PORT);
