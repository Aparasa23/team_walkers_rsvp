const APP_CONFIG = {
  spreadsheetId: '14zJw1Zvn11OFA-yCjwhuqX1_J_QtoDWc3OMG4oTqRr4', // Google Sheet ID for Team Walkers RSVP
  responsesSheet: 'RSVP Responses',
  scheduleSheet: 'Event Schedule',
  dashboardSheet: 'Dashboard',
  eventName: 'Team Walkers - Ganesh Chaturthi 2026',
  eventDate: 'September 14 - 19, 2026',
  venue: '4839 W Quartz Valley Circle, Riverton, UT 84096',
  whatsappLink: 'https://chat.whatsapp.com/GZUDSEp7N2pCVgTpREebHZ?mode=gi_t'
};

function doGet() {
  try {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle(APP_CONFIG.eventName + ' RSVP')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (e) {
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle(APP_CONFIG.eventName + ' RSVP')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const result = submitRsvp(payload);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSpreadsheet_() {
  if (APP_CONFIG.spreadsheetId && APP_CONFIG.spreadsheetId.trim()) {
    try {
      return SpreadsheetApp.openById(APP_CONFIG.spreadsheetId.trim());
    } catch (err) {
      console.warn('Could not open spreadsheet by ID, attempting fallback to active spreadsheet:', err);
    }
  }
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (err) {
    console.warn('Could not get active spreadsheet:', err);
  }
  return null;
}

function setupSheets() {
  const ss = getSpreadsheet_();

  let responses = ss.getSheetByName(APP_CONFIG.responsesSheet);
  if (!responses) responses = ss.insertSheet(APP_CONFIG.responsesSheet);
  responses.clear();

  const headers = [
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

  responses.getRange(1, 1, 1, headers.length).setValues([headers]);
  responses.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#0f9aa8')
    .setFontColor('#ffffff');
  responses.setFrozenRows(1);
  responses.autoResizeColumns(1, headers.length);

  let schedule = ss.getSheetByName(APP_CONFIG.scheduleSheet);
  if (!schedule) schedule = ss.insertSheet(APP_CONFIG.scheduleSheet);
  schedule.clear();

  const scheduleHeaders = ['Active', 'Date', 'Start Time', 'End Time', 'Event / Activity', 'Description', 'Fixed Main Event'];
  const seed = [
    [true, new Date(2026, 8, 14), '7:00 PM', '10:00 PM', 'Ganesh Chavithi Pooja & Idol Revealing', 'Revealing Vinayaka Idol, Ganesh Chavithi Pooja followed by Prasadam', true],
    [true, new Date(2026, 8, 15), '7:00 PM', '10:00 PM', 'Ganesh Pooja & Game Night', 'Ganesh Pooja followed by Game Night', false],
    [true, new Date(2026, 8, 16), '7:00 PM', '10:00 PM', 'Ganesh Pooja & Cultural Night', 'Ganesh Pooja followed by Cultural Night', false],
    [true, new Date(2026, 8, 17), '7:00 PM', '10:00 PM', 'Ganesh Pooja & Tambola Night', 'Ganesh Pooja followed by Tambola Night', false],
    [true, new Date(2026, 8, 18), '7:00 PM', '10:00 PM', 'Annadanam & Laddu Auction', 'Annadanam and Laddu Auction', false],
    [true, new Date(2026, 8, 19), '4:00 PM', '8:00 PM', 'Utti Program, Procession & Nimarjanam', 'Utti Program, followed by Ganesh Procession and Nimarjanam', false]
  ];
  schedule.getRange(1, 1, 1, scheduleHeaders.length).setValues([scheduleHeaders]);
  schedule.getRange(2, 1, seed.length, scheduleHeaders.length).setValues(seed);
  schedule.getRange(1, 1, 1, scheduleHeaders.length)
    .setFontWeight('bold')
    .setBackground('#0f9aa8')
    .setFontColor('#ffffff');
  schedule.getRange('A2:A').insertCheckboxes();
  schedule.getRange('G2:G').insertCheckboxes();
  schedule.getRange('B2:B').setNumberFormat('mmm d, yyyy');
  schedule.setFrozenRows(1);
  schedule.autoResizeColumns(1, scheduleHeaders.length);

  let dashboard = ss.getSheetByName(APP_CONFIG.dashboardSheet);
  if (!dashboard) dashboard = ss.insertSheet(APP_CONFIG.dashboardSheet);
  dashboard.clear();

  dashboard.getRange('A1:B1').merge();
  dashboard.getRange('A1').setValue('Team Walkers RSVP Dashboard')
    .setFontWeight('bold')
    .setFontSize(16)
    .setBackground('#0f9aa8')
    .setFontColor('#ffffff');

  const metrics = [
    ['Metric', 'Value'],
    ['Total RSVP submissions', `=MAX(COUNTA('${APP_CONFIG.responsesSheet}'!C:C)-1,0)`],
    ['Families attending', `=COUNTIF('${APP_CONFIG.responsesSheet}'!F:F,"Yes")`],
    ['Families not attending', `=COUNTIF('${APP_CONFIG.responsesSheet}'!F:F,"No")`],
    ['Total adults', `=SUM('${APP_CONFIG.responsesSheet}'!G:G)`],
    ['Total children', `=SUM('${APP_CONFIG.responsesSheet}'!H:H)`],
    ['Total guests', `=SUM('${APP_CONFIG.responsesSheet}'!I:I)`],
    ['', ''],
    ['EVENT DAY PARTICIPATION (FAMILIES)', ''],
    ['Sep 14: Chavithi Pooja & Prasadam', `=COUNTIF('${APP_CONFIG.responsesSheet}'!K:K,"*Sep 14*")`],
    ['Sep 15: Game Night', `=COUNTIF('${APP_CONFIG.responsesSheet}'!K:K,"*Sep 15*")`],
    ['Sep 16: Cultural Night', `=COUNTIF('${APP_CONFIG.responsesSheet}'!K:K,"*Sep 16*")`],
    ['Sep 17: Tambola Night', `=COUNTIF('${APP_CONFIG.responsesSheet}'!K:K,"*Sep 17*")`],
    ['Sep 18: Annadanam & Laddu Auction', `=COUNTIF('${APP_CONFIG.responsesSheet}'!K:K,"*Sep 18*")`],
    ['Sep 19: Utti & Nimarjanam', `=COUNTIF('${APP_CONFIG.responsesSheet}'!K:K,"*Sep 19*")`]
  ];
  dashboard.getRange(3, 1, metrics.length, 2).setValues(metrics);
  dashboard.getRange('A3:B3').setFontWeight('bold').setBackground('#f3d98b');
  dashboard.getRange('A11:B11').setFontWeight('bold').setBackground('#d5a538').setFontColor('#ffffff');
  dashboard.autoResizeColumns(1, 2);

  SpreadsheetApp.flush();
  return 'Setup complete. You can now edit the Event Schedule sheet, then deploy the web app.';
}

function getPublicConfig() {
  let events = [];
  try {
    const ss = getSpreadsheet_();
    if (ss) {
      let schedule = ss.getSheetByName(APP_CONFIG.scheduleSheet);
      if (schedule) {
        const lastRow = schedule.getLastRow();
        if (lastRow >= 2) {
          const rows = schedule.getRange(2, 1, lastRow - 1, 7).getValues();
          const tz = Session.getScriptTimeZone() || ss.getSpreadsheetTimeZone() || 'America/Denver';

          events = rows
            .filter(r => r[0] === true && r[1])
            .map((r, index) => {
              const d = r[1] instanceof Date ? r[1] : new Date(r[1]);
              return {
                id: 'event-' + (index + 1),
                dateIso: Utilities.formatDate(d, tz, 'yyyy-MM-dd'),
                dateLabel: Utilities.formatDate(d, tz, 'EEEE, MMMM d, yyyy'),
                shortDate: Utilities.formatDate(d, tz, 'EEE • MMM d'),
                startTime: normalizeTime_(r[2], tz),
                endTime: normalizeTime_(r[3], tz),
                title: String(r[4] || 'Event'),
                description: String(r[5] || ''),
                fixedMainEvent: r[6] === true
              };
            });
        }
      }
    }
  } catch (err) {
    console.warn('getPublicConfig spreadsheet warning:', err);
  }

  if (!events || events.length === 0) {
    events = [
      { id: 'event-1', dateIso: '2026-09-14', dateLabel: 'Monday, September 14, 2026', shortDate: 'Mon • Sep 14', startTime: '7:00 PM', endTime: '10:00 PM', title: 'Ganesh Chavithi Pooja & Idol Revealing', description: 'Revealing Vinayaka Idol, Ganesh Chavithi Pooja followed by Prasadam', fixedMainEvent: true },
      { id: 'event-2', dateIso: '2026-09-15', dateLabel: 'Tuesday, September 15, 2026', shortDate: 'Tue • Sep 15', startTime: '7:00 PM', endTime: '10:00 PM', title: 'Ganesh Pooja & Game Night', description: 'Ganesh Pooja followed by Game Night', fixedMainEvent: false },
      { id: 'event-3', dateIso: '2026-09-16', dateLabel: 'Wednesday, September 16, 2026', shortDate: 'Wed • Sep 16', startTime: '7:00 PM', endTime: '10:00 PM', title: 'Ganesh Pooja & Cultural Night', description: 'Ganesh Pooja followed by Cultural Night', fixedMainEvent: false },
      { id: 'event-4', dateIso: '2026-09-17', dateLabel: 'Thursday, September 17, 2026', shortDate: 'Thu • Sep 17', startTime: '7:00 PM', endTime: '10:00 PM', title: 'Ganesh Pooja & Tambola Night', description: 'Ganesh Pooja followed by Tambola Night', fixedMainEvent: false },
      { id: 'event-5', dateIso: '2026-09-18', dateLabel: 'Friday, September 18, 2026', shortDate: 'Fri • Sep 18', startTime: '7:00 PM', endTime: '10:00 PM', title: 'Annadanam & Laddu Auction', description: 'Annadanam and Laddu Auction', fixedMainEvent: false },
      { id: 'event-6', dateIso: '2026-09-19', dateLabel: 'Saturday, September 19, 2026', shortDate: 'Sat • Sep 19', startTime: '4:00 PM', endTime: '8:00 PM', title: 'Utti Program, Procession & Nimarjanam', description: 'Utti Program, followed by Ganesh Procession and Nimarjanam', fixedMainEvent: false }
    ];
  }

  return {
    eventName: APP_CONFIG.eventName,
    eventDate: APP_CONFIG.eventDate,
    venue: APP_CONFIG.venue,
    whatsappLink: APP_CONFIG.whatsappLink,
    events
  };
}

function normalizeTime_(value, tz) {
  if (!value) return '';
  if (value instanceof Date) return Utilities.formatDate(value, tz, 'h:mm a');
  return String(value);
}

function submitRsvp(payload) {
  try {
    validatePayload_(payload);
  } catch (err) {
    return {
      ok: false,
      error: err.message || 'Validation failed. Please check your entries.'
    };
  }

  const attending = payload.attending === 'Yes';
  const adults = attending ? clampInt_(payload.adults, 0, 50) : 0;
  const children = attending ? clampInt_(payload.children, 0, 50) : 0;
  const total = adults + children;

  if (attending && total < 1) {
    return {
      ok: false,
      error: 'Please enter at least one attendee.'
    };
  }

  const rsvpId = (payload.rsvpId && String(payload.rsvpId).trim()) || ('TW-' + Utilities.getUuid().slice(0, 8).toUpperCase());

  try {
    const ss = getSpreadsheet_();
    if (ss) {
      let sheet = ss.getSheetByName(APP_CONFIG.responsesSheet);
      if (!sheet) {
        setupSheets();
        sheet = ss.getSheetByName(APP_CONFIG.responsesSheet);
      }
      if (sheet) {
        const lock = LockService.getScriptLock();
        try {
          lock.waitLock(5000);
        } catch (e) {}
        try {
          sheet.appendRow([
            new Date(),
            rsvpId,
            clean_(payload.name, 120),
            clean_(payload.phone, 50),
            clean_(payload.email, 160),
            payload.attending,
            adults,
            children,
            total,
            clean_(payload.guestNames, 500),
            Array.isArray(payload.availability) ? payload.availability.map(v => clean_(v, 200)).join(' | ') : '',
            clean_(payload.dietary, 500),
            clean_(payload.comments, 1000)
          ]);
        } finally {
          try { lock.releaseLock(); } catch (e) {}
        }
      }
    }
  } catch (err) {
    console.error('Spreadsheet save warning:', err);
  }

  return {
    ok: true,
    rsvpId,
    name: clean_(payload.name, 120),
    attending,
    adults,
    children,
    total,
    whatsappLink: APP_CONFIG.whatsappLink
  };
}

function validatePayload_(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid RSVP submission.');

  const name = clean_(payload.name, 120);
  if (!name) throw new Error('Please enter your name.');

  if (!['Yes', 'No'].includes(payload.attending)) {
    throw new Error('Please select whether you will attend.');
  }

  const email = clean_(payload.email, 160);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid email address or leave it blank.');
  }
}

function clampInt_(value, min, max) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function clean_(value, maxLen) {
  return String(value == null ? '' : value).trim().slice(0, maxLen);
}
