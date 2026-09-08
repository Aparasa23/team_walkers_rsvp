# Team Walkers – Ganesh Chaturthi 2026 RSVP

This package is a complete Google Apps Script RSVP microsite.

## What it does

- Polished mobile-first RSVP website
- Uses the Team Walkers Ganesh Chaturthi invitation artwork
- Event schedule/calendar driven from a Google Sheet
- Lets guests select which event days they are available
- RSVP Yes/No
- Adult and child headcount
- Guest names
- Optional phone/email
- Dietary restrictions / allergies
- Comments
- Automatic RSVP ID
- Every submission goes directly into Google Sheets
- Dashboard sheet with automatic totals
- No external database or paid hosting required

## Fastest setup

### 1. Create a Google Sheet
Create a blank Google Sheet, for example:

**Team Walkers Ganesh Chaturthi 2026 RSVP**

### 2. Open Apps Script
From the Google Sheet:

**Extensions → Apps Script**

Delete the default contents of `Code.gs`.

### 3. Add the files
Create these files in Apps Script:

- `Code.gs` → paste the contents from this package
- `Index.html` → create an HTML file named `Index`, then paste the contents
- `appsscript.json` → optional; Apps Script usually creates this automatically

Because the script is bound to the Google Sheet, leave:

`spreadsheetId: ''`

unchanged.

### 4. Run setup once
In Apps Script, choose the function:

`setupSheets`

Click **Run**.

Google will ask you to authorize the script. Approve it.

This creates:

- `RSVP Responses`
- `Event Schedule`
- `Dashboard`

### 5. Edit your event calendar
Open the `Event Schedule` sheet.

Columns:

- **Active** — check this to show an event/day on the RSVP site
- **Date**
- **Start Time**
- **End Time**
- **Event / Activity**
- **Description**
- **Fixed Main Event** — check this for the main celebration

The package starts with September 14, 2026 as the main event.

Add any additional days/activities as new rows. No code change is required.

Example:

| Active | Date | Start Time | End Time | Event / Activity | Description | Fixed Main Event |
|---|---|---|---|---|---|---|
| TRUE | 9/13/2026 | 6:00 PM | 8:00 PM | Preparation / Setup | Decorations and setup | FALSE |
| TRUE | 9/14/2026 | 6:00 PM | 9:00 PM | Ganesh Chaturthi Celebration | Main celebration | TRUE |
| TRUE | 9/15/2026 | 7:00 PM | 8:00 PM | Closing / Visarjan | Closing activity | FALSE |

Only use dates that are actually part of your final schedule.

### 6. Deploy the RSVP website
In Apps Script:

**Deploy → New deployment**

Choose:

**Type: Web app**

Set:

- **Execute as:** Me
- **Who has access:** Anyone

Then click **Deploy**.

Copy the Web App URL. That is the RSVP link you can send in WhatsApp or turn into a QR code.

## How submissions reach Google Sheets

The website uses `google.script.run` to call `submitRsvp()` directly inside Apps Script.

Every RSVP is appended to the `RSVP Responses` sheet automatically.

No Google Form is involved.

## Dashboard

The `Dashboard` sheet automatically shows:

- Total RSVP submissions
- Families attending
- Families not attending
- Total adults
- Total children
- Total guests

You can add charts later if desired.

## Important

Do not publish the Google Sheet itself. Only share the Web App URL.

The script writes to the sheet using your authorization, while guests only see the RSVP page.

## Updating the site later

You can freely edit:

- Schedule rows in the `Event Schedule` sheet — no redeploy needed
- Wording/styles in `Index.html` — redeploy/update the deployment after code changes

## Current fixed event details

- Team Walkers – Ganesh Chaturthi 2026
- September 14, 2026
- 4839 W Quartz Valley Circle, Riverton, UT 84096
