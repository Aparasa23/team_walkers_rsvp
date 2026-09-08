module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const config = {
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

  res.status(200).json(config);
};
