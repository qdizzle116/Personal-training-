require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuid } = require('uuid');
const db = require('./database');
const { generateOPTPlan, getCurrentPhase } = require('./optModel');
const { sendDailyEmail, sendTestEmail, scheduleDaily } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Stats
app.get('/api/stats', (req, res) => {
  try {
    res.json({
      totalClients: db.statsOps.totalClients.get().count,
      todaySessions: db.statsOps.todaySessions.get().count,
      weekSessions: db.statsOps.weekSessions.get().count,
      recentClients: db.statsOps.recentClients.all()
    });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = db.clientOps.getAll.all().map(c => {
      let currentPhase = null;
      if (c.plan_data) {
        try {
          const plan = JSON.parse(c.plan_data);
          const pr = db.planOps.getByClient.get(c.id);
          if (pr) currentPhase = getCurrentPhase(plan, pr.start_date);
        } catch(_) {}
      }
      return { ...c, plan_data:undefined, current_phase:currentPhase };
    });
    res.json(clients);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get('/api/clients/:id', (req, res) => {
  try {
    const client = db.clientOps.getById.get(req.params.id);
    if (!client) return res.status(404).json({ error:'Not found' });
    const parq = db.parqOps.getByClient.get(client.id);
    const assessment = db.assessmentOps.getByClient.get(client.id);
    const planRecord = db.planOps.getByClient.get(client.id);
    const sessions = db.sessionOps.getByClient.all(client.id);
    let plan = null, currentPhase = null;
    if (planRecord) { plan = JSON.parse(planRecord.plan_data); currentPhase = getCurrentPhase(plan, planRecord.start_date); }
    res.json({ ...client, parq, assessment, plan, plan_start:planRecord?.start_date, current_phase:currentPhase, sessions });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post('/api/clients', (req, res) => {
  try {
    const { client, parq, assessment } = req.body;
    const id = uuid();
    db.clientOps.insert.run({ id, first_name:'', last_name:'', email:'', phone:'', dob:'', gender:'', occupation:'', emergency_name:'', emergency_phone:'', ...client });
    if (parq) {
      const anyYes = [parq.q1,parq.q2,parq.q3,parq.q4,parq.q5,parq.q6,parq.q7].some(v=>v);
      db.parqOps.insert.run({ id:uuid(), client_id:id, q1:parq.q1?1:0, q2:parq.q2?1:0, q3:parq.q3?1:0, q4:parq.q4?1:0, q5:parq.q5?1:0, q6:parq.q6?1:0, q7:parq.q7?1:0, cleared:anyYes?0:1, notes:parq.notes||'' });
    }
    let plan = null;
    if (assessment) {
      db.assessmentOps.insert.run({ id:uuid(), client_id:id, goals:JSON.stringify(assessment.goals||[]), fitness_level:assessment.fitness_level||'beginner', training_history:assessment.training_history||'', training_days_per_week:assessment.training_days_per_week||3, session_duration:assessment.session_duration||60, available_equipment:JSON.stringify(assessment.available_equipment||[]), injuries:assessment.injuries||'', medical_conditions:assessment.medical_conditions||'', diet_approach:assessment.diet_approach||'', sleep_hours:assessment.sleep_hours||7, stress_level:assessment.stress_level||5, motivation_level:assessment.motivation_level||7, notes:assessment.notes||'' });
      plan = generateOPTPlan({ ...assessment, goals:JSON.stringify(assessment.goals||[]) });
      db.planOps.insert.run({ id:uuid(), client_id:id, plan_data:JSON.stringify(plan), start_date:new Date().toISOString().split('T')[0] });
    }
    res.status(201).json({ ...db.clientOps.getById.get(id), plan });
  } catch(e) { console.error(e); res.status(500).json({ error:e.message }); }
});

app.put('/api/clients/:id', (req, res) => {
  try { db.clientOps.update.run({ id:req.params.id, ...req.body }); res.json(db.clientOps.getById.get(req.params.id)); }
  catch(e) { res.status(500).json({ error:e.message }); }
});

app.delete('/api/clients/:id', (req, res) => {
  try { db.clientOps.delete.run(req.params.id); res.json({ success:true }); }
  catch(e) { res.status(500).json({ error:e.message }); }
});

// Sessions
app.get('/api/sessions', (req, res) => {
  try {
    const { month } = req.query;
    res.json(month ? db.sessionOps.getByMonth.all(`${month}%`) : db.sessionOps.getAll.all());
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get('/api/sessions/today', (req, res) => {
  try { res.json(db.sessionOps.getByDate.all(new Date().toISOString().split('T')[0])); }
  catch(e) { res.status(500).json({ error:e.message }); }
});

app.post('/api/sessions', (req, res) => {
  try {
    const { client_id, date, time, duration, phase, notes } = req.body;
    const id = uuid();
    db.sessionOps.insert.run({ id, client_id, date, time:time||null, duration:duration||60, phase:phase||null, notes:notes||null });
    res.status(201).json({ id, client_id, date, time, duration, phase, notes });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.put('/api/sessions/:id', (req, res) => {
  try {
    const { client_id, date, time, duration, phase, notes, completed } = req.body;
    db.sessionOps.update.run({ id:req.params.id, client_id, date, time, duration, phase, notes, completed:completed?1:0 });
    res.json({ success:true });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.delete('/api/sessions/:id', (req, res) => {
  try { db.sessionOps.delete.run(req.params.id); res.json({ success:true }); }
  catch(e) { res.status(500).json({ error:e.message }); }
});

// Settings
app.get('/api/settings', (req, res) => {
  try {
    const s = db.getAllSettings();
    if (s.smtp_pass) s.smtp_pass = '••••••••';
    res.json(s);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.put('/api/settings', (req, res) => {
  try {
    const u = { ...req.body };
    if (u.smtp_pass === '••••••••') delete u.smtp_pass;
    db.setSettings(u);
    if (u.daily_email_time) { const { rescheduleDaily } = require('./emailService'); rescheduleDaily(); }
    res.json({ success:true });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post('/api/settings/test-email', async (req, res) => {
  try { res.json(await sendTestEmail(req.body.email)); }
  catch(e) { res.status(500).json({ error:e.message }); }
});

app.post('/api/email/send-now', async (req, res) => {
  try { res.json(await sendDailyEmail()); }
  catch(e) { res.status(500).json({ error:e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════════╗`);
  console.log(`║  DIVINE STRENGTH PERSONAL TRAINING DASHBOARD  ║`);
  console.log(`║  Running at http://localhost:${PORT}              ║`);
  console.log(`╚═══════════════════════════════════════════════╝\n`);
  scheduleDaily();
});
