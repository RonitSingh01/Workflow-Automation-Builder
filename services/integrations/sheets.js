// src/services/integrations/sheets.js
const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
if (REFRESH_TOKEN) oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function appendRow({ spreadsheetId, range, values }) {
  if (!REFRESH_TOKEN) throw new Error('GOOGLE_REFRESH_TOKEN not set');
  const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] }
  });
  return { updatedRange: res.data.updates.updatedRange };
}

module.exports = { appendRow };
