/**
 * Jeremiah Davis campaign: saves every message from the website into this
 * Google Sheet and emails the campaign inbox.
 *
 * Setup (once):
 * 1. Open the Google Sheet in the campaign Google account.
 * 2. Extensions > Apps Script. Delete what's there and paste this whole file.
 * 3. Click Deploy > New deployment > gear icon > Web app.
 *    Execute as: Me.  Who has access: Anyone.  Click Deploy.
 * 4. Allow access when Google asks (Advanced > Go to project > Allow).
 * 5. Copy the Web app URL (ends in /exec) and put it in config.js as sheetEndpoint.
 */

const SHEET_NAME = "Messages";
const SEND_EMAIL_ALERTS = true; // set to false to stop the email alerts

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    const clean = (v, max) => String(v || "").replace(/^[=+\-@]/, "'$&").slice(0, max); // block spreadsheet formulas
    const row = [
      new Date(),
      clean(p.topic, 80),
      clean(p.message, 1000),
      clean(p.name, 60),
      clean(p.grade, 10),
    ];
    if (!row[2] || row[2].length < 3) return out({ ok: false, error: "empty" });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(["When", "Type", "Message", "Name", "Grade"]);
      sh.setFrozenRows(1);
      sh.getRange("A1:E1").setFontWeight("bold");
    }
    sh.appendRow(row);

    if (SEND_EMAIL_ALERTS && MailApp.getRemainingDailyQuota() > 0) {
      const to = Session.getEffectiveUser().getEmail();
      MailApp.sendEmail(to, `Campaign site: ${row[1] || "New message"}`,
        `${row[2]}\n\nFrom: ${row[3] || "Anonymous"}${row[4] ? ", " + row[4] : ""}\n\nAll messages: ${ss.getUrl()}`);
    }
    return out({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return out({ ok: true, note: "The campaign message inbox is running." });
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
