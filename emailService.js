const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { getAllSettings, sessionOps } = require('./database');

let scheduledJob = null;

function createTransporter(s) {
  return nodemailer.createTransport({
    host: s.smtp_host || 'smtp.gmail.com',
    port: parseInt(s.smtp_port) || 587,
    secure: s.smtp_secure === 'true',
    auth: { user: s.smtp_user, pass: s.smtp_pass }
  });
}

function fmt12(t) {
  if (!t) return 'TBD';
  const [h, m] = t.split(':').map(Number);
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
}

async function sendDailyEmail() {
  const s = getAllSettings();
  if (s.email_enabled !== 'true') return { success:false, reason:'disabled' };
  if (!s.trainer_email || !s.smtp_user || !s.smtp_pass) return { success:false, reason:'missing_config' };

  const today = new Date().toISOString().split('T')[0];
  const sessions = sessionOps.getByDate.all(today);
  const now = new Date();
  const dayStr = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const dashUrl = s.dashboard_url || 'http://localhost:3000';
  const trainerName = s.trainer_name || 'Trainer';

  let rows = sessions.length ? sessions.map((s,i) => `
    <tr style="background:${i%2===0?'#1a1a1a':'#222'}">
      <td style="padding:12px 15px;color:#fff;border-bottom:1px solid #2a2a2a">${fmt12(s.time)}</td>
      <td style="padding:12px 15px;color:#fff;font-weight:bold;border-bottom:1px solid #2a2a2a">${s.client_name}</td>
      <td style="padding:12px 15px;color:#cc0000;border-bottom:1px solid #2a2a2a">${s.phase||'—'}</td>
      <td style="padding:12px 15px;color:#888;border-bottom:1px solid #2a2a2a">${s.duration||60} min</td>
    </tr>`).join('') : `<tr><td colspan="4" style="padding:20px;text-align:center;color:#666;font-style:italic">No sessions scheduled today.</td></tr>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Arial,sans-serif">
<table width="100%" style="max-width:620px;margin:0 auto">
  <tr><td style="background:linear-gradient(135deg,#1a0000,#0d0d0d);padding:40px 30px;text-align:center;border-bottom:3px solid #cc0000">
    <div style="font-size:11px;letter-spacing:4px;color:#cc0000;text-transform:uppercase">Divine Strength</div>
    <div style="font-size:26px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:2px;margin-top:6px">Personal Training</div>
  </td></tr>
  <tr><td style="background:#cc0000;padding:12px;text-align:center;font-size:13px;font-weight:bold;color:#fff;text-transform:uppercase;letter-spacing:1px">${dayStr}</td></tr>
  <tr><td style="background:#111;padding:28px 30px">
    <p style="color:#fff;font-size:17px;font-weight:bold;margin:0">Good morning, ${trainerName}!</p>
    <p style="color:#888;font-size:13px;margin:8px 0 20px">You have <span style="color:#cc0000;font-weight:bold">${sessions.length} session${sessions.length!==1?'s':''}</span> today.</p>
    <table width="100%" style="border-radius:8px;overflow:hidden;border:1px solid #2a2a2a">
      <thead><tr style="background:#cc0000">
        <th style="padding:10px 15px;text-align:left;color:#fff;font-size:11px;letter-spacing:1px;text-transform:uppercase">Time</th>
        <th style="padding:10px 15px;text-align:left;color:#fff;font-size:11px;letter-spacing:1px;text-transform:uppercase">Client</th>
        <th style="padding:10px 15px;text-align:left;color:#fff;font-size:11px;letter-spacing:1px;text-transform:uppercase">Phase</th>
        <th style="padding:10px 15px;text-align:left;color:#fff;font-size:11px;letter-spacing:1px;text-transform:uppercase">Duration</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="display:flex;gap:12px;margin-top:16px">
      <div style="flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;text-align:center">
        <div style="font-size:28px;font-weight:900;color:#cc0000">${sessions.length}</div>
        <div style="font-size:11px;color:#888;text-transform:uppercase;margin-top:3px">Sessions Today</div>
      </div>
      <div style="flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;text-align:center">
        <div style="font-size:28px;font-weight:900;color:#cc0000">${sessions.reduce((a,s)=>a+(s.duration||60),0)}</div>
        <div style="font-size:11px;color:#888;text-transform:uppercase;margin-top:3px">Total Minutes</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px">
      <a href="${dashUrl}" style="background:#cc0000;color:#fff;text-decoration:none;padding:13px 36px;border-radius:6px;font-weight:bold;font-size:13px;letter-spacing:1px;text-transform:uppercase;display:inline-block">Open Dashboard →</a>
    </div>
  </td></tr>
  <tr><td style="background:#0d0d0d;border-top:1px solid #1a1a1a;padding:16px;text-align:center">
    <p style="margin:0;color:#333;font-size:11px">Divine Strength PT — Automated daily summary</p>
  </td></tr>
</table></body></html>`;

  try {
    const info = await createTransporter(s).sendMail({
      from: `"Divine Strength PT" <${s.smtp_user}>`,
      to: s.trainer_email,
      subject: `Divine Strength PT — Training Schedule for ${dayStr}`,
      html, text: `Divine Strength PT\n${dayStr}\n\nSessions today (${sessions.length}):\n${sessions.map(s=>`  ${fmt12(s.time).padEnd(10)} ${s.client_name}  ${s.phase||''}`).join('\n')}\n\nDashboard: ${dashUrl}`
    });
    console.log(`[Email] Daily schedule sent → ${s.trainer_email}`);
    return { success:true, messageId:info.messageId };
  } catch(err) {
    console.error('[Email] Failed:', err.message);
    return { success:false, error:err.message };
  }
}

async function sendTestEmail(to) {
  const s = getAllSettings();
  if (!s.smtp_user || !s.smtp_pass) return { success:false, error:'SMTP not configured' };
  try {
    const info = await createTransporter(s).sendMail({
      from: `"Divine Strength PT" <${s.smtp_user}>`,
      to: to || s.trainer_email,
      subject: 'Divine Strength PT — Test Email ✓',
      html: `<div style="background:#0d0d0d;color:#fff;padding:30px;font-family:Arial,sans-serif;text-align:center"><h2 style="color:#cc0000">Divine Strength PT</h2><p style="color:#888">Email notifications are working!</p><p><a href="${s.dashboard_url||'http://localhost:3000'}" style="color:#cc0000">Open Dashboard</a></p></div>`,
      text: `Divine Strength PT — Test email successful! Dashboard: ${s.dashboard_url||'http://localhost:3000'}`
    });
    return { success:true, messageId:info.messageId };
  } catch(err) { return { success:false, error:err.message }; }
}

function scheduleDaily() {
  const s = getAllSettings();
  const [h,m] = (s.daily_email_time||'06:00').split(':').map(Number);
  if (scheduledJob) { scheduledJob.destroy(); scheduledJob = null; }
  scheduledJob = cron.schedule(`${m} ${h} * * *`, () => {
    console.log(`[Cron] Running daily email at ${s.daily_email_time}`);
    sendDailyEmail().catch(console.error);
  }, { timezone:'America/New_York' });
  console.log(`[Cron] Daily email scheduled at ${s.daily_email_time} ET`);
}

function rescheduleDaily() { scheduleDaily(); }

module.exports = { sendDailyEmail, sendTestEmail, scheduleDaily, rescheduleDaily };
