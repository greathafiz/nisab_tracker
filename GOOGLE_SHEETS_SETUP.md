# Google Sheets Integration for Zakat Reminder Signups

## Setup Instructions

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet called "Zakat Reminder Signups"
3. Add headers in the first row:
   - Column A: `Email`
   - Column B: `Timestamp`
   - Column C: `Source`

### 2. Create Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Paste the following code:

```javascript
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents)
    const email = data.email
    const timestamp = data.timestamp
    const source = data.source || "unknown"

    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()

    // Check if email already exists
    const existingData = sheet.getDataRange().getValues()
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][0] === email) {
        return ContentService.createTextOutput(
          JSON.stringify({ success: true, message: "Email already registered" })
        ).setMimeType(ContentService.MimeType.JSON)
      }
    }

    // Append new row with data
    sheet.appendRow([email, timestamp, source])

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "Email saved successfully" })
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Zakat Reminder API is running")
}
```

### 3. Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon and select **Web app**
3. Configure:
   - Description: "Zakat Reminder Signup API"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Copy the **Web app URL** (it will look like: `https://script.google.com/macros/s/...`)

### 4. Add to Your Environment Variables

In your `.env.local` file, add:

```bash
GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 5. Test the Integration

1. Go to your calculator page
2. Enter an email in the reminder signup form
3. Check your Google Sheet - the email should appear!

## Notes

- The script automatically prevents duplicate emails
- Timestamps are stored in ISO format
- You can add more columns if you want to track additional data
- The sheet will automatically add rows as emails come in

## Accessing Your Data

Your signups will appear in real-time in the Google Sheet. You can:

- Sort by timestamp to see newest signups
- Export to CSV for email campaigns
- Use Google Sheets formulas to analyze data
- Set up notifications when new signups arrive

## Privacy & Security

- Store the Web App URL as an environment variable (never commit it)
- Consider adding CORS restrictions if needed
- Delete emails after notifying users to respect privacy
- Add a privacy policy link in your signup form
