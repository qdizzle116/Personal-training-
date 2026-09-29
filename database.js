const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'divine_strength.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    dob TEXT,
    gender TEXT,
    occupation TEXT,
    emergency_name TEXT,
    emergency_phone TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS parq_responses (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    q1 INTEGER DEFAULT 0,
    q2 INTEGER DEFAULT 0,
    q3 INTEGER DEFAULT 0,
    q4 INTEGER DEFAULT 0,
    q5 INTEGER DEFAULT 0,
    q6 INTEGER DEFAULT 0,
    q7 INTEGER DEFAULT 0,
    cleared INTEGER DEFAULT 1,
    notes TEXT,
    date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    goals TEXT,
    fitness_level TEXT DEFAULT 'beginner',
    training_history TEXT,
    training_days_per_week INTEGER DEFAULT 3,
    session_duration INTEGER DEFAULT 60,
    available_equipment TEXT,
    injuries TEXT,
    medical_conditions TEXT,
    diet_approach TEXT,
    sleep_hours REAL DEFAULT 7,
    stress_level INTEGER DEFAULT 5,
    motivation_level INTEGER DEFAULT 7,
    notes TEXT,
    date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS training_plans (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    plan_data TEXT NOT NULL,
    start_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    duration INTEGER DEFAULT 60,
    phase TEXT,
    notes TEXT,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

const defaultSettings = {
  trainer_name: process.env.TRAINER_NAME || 'Trainer',
  trainer_email: process.env.TRAINER_EMAIL || '',
  dashboard_url: process.env.DASHBOARD_URL || 'http://localhost:3000',
  smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtp_port: process.env.SMTP_PORT || '587',
  smtp_secure: process.env.SMTP_SECURE || 'false',
  smtp_user: process.env.SMTP_USER || '',
  smtp_pass: process.env.SMTP_PASS || '',
  daily_email_time: process.env.DAILY_EMAIL_TIME || '06:00',
  email_enabled: 'false'
};

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(defaultSettings)) {
  insertSetting.run(key, value);
}

const clientOps = {
  getAll: db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM sessions s WHERE s.client_id = c.id) as session_count,
      (SELECT tp.plan_data FROM training_plans tp WHERE tp.client_id = c.id ORDER BY tp.created_at DESC LIMIT 1) as plan_data
    FROM clients c ORDER BY c.created_at DESC
  `),
  getById: db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM sessions s WHERE s.client_id = c.id) as session_count
    FROM clients c WHERE c.id = ?
  `),
  insert: db.prepare(`
    INSERT INTO clients (id, first_name, last_name, email, phone, dob, gender, occupation, emergency_name, emergency_phone)
    VALUES (@id, @first_name, @last_name, @email, @phone, @dob, @gender, @occupation, @emergency_name, @emergency_phone)
  `),
  update: db.prepare(`
    UPDATE clients SET first_name=@first_name, last_name=@last_name, email=@email, phone=@phone,
    dob=@dob, gender=@gender, occupation=@occupation, emergency_name=@emergency_name,
    emergency_phone=@emergency_phone, updated_at=datetime('now') WHERE id=@id
  `),
  delete: db.prepare('DELETE FROM clients WHERE id = ?')
};

const parqOps = {
  getByClient: db.prepare('SELECT * FROM parq_responses WHERE client_id = ? ORDER BY date DESC LIMIT 1'),
  insert: db.prepare(`
    INSERT INTO parq_responses (id, client_id, q1, q2, q3, q4, q5, q6, q7, cleared, notes)
    VALUES (@id, @client_id, @q1, @q2, @q3, @q4, @q5, @q6, @q7, @cleared, @notes)
  `)
};

const assessmentOps = {
  getByClient: db.prepare('SELECT * FROM assessments WHERE client_id = ? ORDER BY date DESC LIMIT 1'),
  insert: db.prepare(`
    INSERT INTO assessments (id, client_id, goals, fitness_level, training_history, training_days_per_week,
    session_duration, available_equipment, injuries, medical_conditions, diet_approach, sleep_hours,
    stress_level, motivation_level, notes)
    VALUES (@id, @client_id, @goals, @fitness_level, @training_history, @training_days_per_week,
    @session_duration, @available_equipment, @injuries, @medical_conditions, @diet_approach, @sleep_hours,
    @stress_level, @motivation_level, @notes)
  `)
};

const planOps = {
  getByClient: db.prepare('SELECT * FROM training_plans WHERE client_id = ? ORDER BY created_at DESC LIMIT 1'),
  insert: db.prepare(`
    INSERT INTO training_plans (id, client_id, plan_data, start_date)
    VALUES (@id, @client_id, @plan_data, @start_date)
  `)
};

const sessionOps = {
  getAll: db.prepare(`
    SELECT s.*, c.first_name || ' ' || c.last_name as client_name, c.email as client_email
    FROM sessions s JOIN clients c ON s.client_id = c.id ORDER BY s.date ASC, s.time ASC
  `),
  getByDate: db.prepare(`
    SELECT s.*, c.first_name || ' ' || c.last_name as client_name, c.email as client_email
    FROM sessions s JOIN clients c ON s.client_id = c.id WHERE s.date = ? ORDER BY s.time ASC
  `),
  getByClient: db.prepare('SELECT * FROM sessions WHERE client_id = ? ORDER BY date DESC, time DESC'),
  getByMonth: db.prepare(`
    SELECT s.*, c.first_name || ' ' || c.last_name as client_name
    FROM sessions s JOIN clients c ON s.client_id = c.id WHERE s.date LIKE ? ORDER BY s.date ASC, s.time ASC
  `),
  insert: db.prepare(`
    INSERT INTO sessions (id, client_id, date, time, duration, phase, notes)
    VALUES (@id, @client_id, @date, @time, @duration, @phase, @notes)
  `),
  update: db.prepare(`
    UPDATE sessions SET client_id=@client_id, date=@date, time=@time, duration=@duration,
    phase=@phase, notes=@notes, completed=@completed WHERE id=@id
  `),
  delete: db.prepare('DELETE FROM sessions WHERE id = ?')
};

const settingOps = {
  get: db.prepare('SELECT value FROM settings WHERE key = ?'),
  getAll: db.prepare('SELECT key, value FROM settings'),
  set: db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
};

const statsOps = {
  totalClients: db.prepare('SELECT COUNT(*) as count FROM clients'),
  todaySessions: db.prepare("SELECT COUNT(*) as count FROM sessions WHERE date = date('now')"),
  weekSessions: db.prepare("SELECT COUNT(*) as count FROM sessions WHERE date >= date('now', '-6 days')"),
  recentClients: db.prepare("SELECT first_name, last_name, created_at FROM clients ORDER BY created_at DESC LIMIT 5")
};

function getSetting(key) {
  const row = settingOps.get.get(key);
  return row ? row.value : null;
}

function getAllSettings() {
  return settingOps.getAll.all().reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
}

function setSetting(key, value) { settingOps.set.run(key, value); }

function setSettings(obj) {
  const tx = db.transaction((s) => {
    for (const [k, v] of Object.entries(s)) settingOps.set.run(k, String(v));
  });
  tx(obj);
}

module.exports = { db, clientOps, parqOps, assessmentOps, planOps, sessionOps, statsOps, getSetting, getAllSettings, setSetting, setSettings };
