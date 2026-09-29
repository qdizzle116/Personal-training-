/* ═══════════════════════════════════════════════════
   DIVINE STRENGTH PT — FRONTEND APPLICATION
═══════════════════════════════════════════════════ */

const API = {
  async get(url) { const r = await fetch(url); if (!r.ok) throw new Error(await r.text()); return r.json(); },
  async post(url, data) { const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }); if (!r.ok) throw new Error(await r.text()); return r.json(); },
  async put(url, data) { const r = await fetch(url, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }); if (!r.ok) throw new Error(await r.text()); return r.json(); },
  async del(url) { const r = await fetch(url, { method:'DELETE' }); if (!r.ok) throw new Error(await r.text()); return r.json(); }
};

function toast(msg, type='info') {
  const icons = { success:'fa-circle-check', error:'fa-circle-xmark', info:'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type]||icons.info}"></i><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => { el.style.opacity='0'; el.style.transform='translateX(20px)'; el.style.transition='all .3s ease'; setTimeout(()=>el.remove(), 300); }, 3500);
}

function fmt12(t) {
  if (!t) return '';
  const [h,m] = t.split(':').map(Number);
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
}

function initials(name) {
  return name.split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2);
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d+'T00:00:00');
  return dt.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

/* ─── PAGE ROUTING ─────────────────────────────── */
const App = {
  currentPage: 'dashboard',

  init() {
    document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.showPage(el.dataset.page);
      });
    });

    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    const pageTitles = { dashboard:'Dashboard', clients:'Clients', calendar:'Calendar', settings:'Settings' };
    this.showPage('dashboard');
  },

  showPage(name) {
    this.currentPage = name;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`page-${name}`)?.classList.add('active');
    document.querySelector(`.nav-item[data-page="${name}"]`)?.classList.add('active');
    const titles = { dashboard:'Dashboard', clients:'Clients', calendar:'Calendar', settings:'Settings' };
    document.getElementById('topbarTitle').textContent = titles[name] || name;

    if (name === 'dashboard') Dashboard.load();
    else if (name === 'clients') Clients.load();
    else if (name === 'calendar') CalendarApp.init();
    else if (name === 'settings') Settings.load();
  }
};

/* ─── DASHBOARD ────────────────────────────────── */
const Dashboard = {
  async load() {
    try {
      const [stats, todaySessions] = await Promise.all([
        API.get('/api/stats'),
        API.get('/api/sessions/today')
      ]);
      document.getElementById('stat-clients').textContent = stats.totalClients;
      document.getElementById('stat-today').textContent = stats.todaySessions;
      document.getElementById('stat-week').textContent = stats.weekSessions;
      this.renderTodaySessions(todaySessions);
      this.renderRecentClients(stats.recentClients);
    } catch(e) { toast('Failed to load dashboard', 'error'); }
  },

  renderTodaySessions(sessions) {
    const el = document.getElementById('today-sessions-list');
    if (!sessions.length) { el.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No sessions today</p></div>'; return; }
    el.innerHTML = sessions.map(s => `
      <div class="session-item">
        <span class="session-time">${fmt12(s.time)||'—'}</span>
        <span class="session-client">${s.client_name}</span>
        <span class="session-phase">${s.phase||''}</span>
      </div>`).join('');
  },

  renderRecentClients(clients) {
    const el = document.getElementById('recent-clients-list');
    if (!clients.length) { el.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No clients yet</p></div>'; return; }
    el.innerHTML = clients.map(c => `
      <div class="session-item" style="cursor:pointer" onclick="Clients.openDetail(null,'${c.first_name} ${c.last_name}')">
        <div class="client-avatar" style="width:32px;height:32px;font-size:12px;margin-bottom:0">${initials(`${c.first_name} ${c.last_name}`)}</div>
        <span class="session-client">${c.first_name} ${c.last_name}</span>
        <span class="session-phase">${fmtDate(c.created_at)}</span>
      </div>`).join('');
  }
};

/* ─── CLIENTS ──────────────────────────────────── */
const Clients = {
  all: [],
  currentClient: null,
  wizardStep: 1,
  wizardData: { client:{}, parq:{}, assessment:{} },

  async load() {
    try {
      this.all = await API.get('/api/clients');
      this.render(this.all);
    } catch(e) { toast('Failed to load clients', 'error'); }
  },

  filter(q) {
    if (!q) { this.render(this.all); return; }
    const s = q.toLowerCase();
    this.render(this.all.filter(c => `${c.first_name} ${c.last_name} ${c.email||''}`.toLowerCase().includes(s)));
  },

  render(clients) {
    const el = document.getElementById('clients-list');
    if (!clients.length) {
      el.innerHTML = '<div class="empty-state large"><i class="fas fa-users"></i><p>No clients found.</p></div>';
      return;
    }
    el.innerHTML = clients.map(c => {
      const name = `${c.first_name} ${c.last_name}`;
      const phase = c.current_phase;
      const phaseBadge = phase ? `<div class="client-phase-badge" style="background:${phase.color}22;color:${phase.color};border:1px solid ${phase.color}44">
        <span style="width:7px;height:7px;border-radius:50%;background:${phase.color};display:inline-block"></span>
        Wk ${phase.week} — ${phase.phase_name.replace('Integration — ','')}
      </div>` : '<div class="client-phase-badge" style="background:#222;color:#555;border:1px solid #333">No Plan Yet</div>';
      return `
        <div class="client-card" onclick="Clients.openDetail('${c.id}')">
          ${c.parq_cleared===0||c.parq_cleared==='0'?'<div class="client-parq-flag">⚠ PAR-Q</div>':''}
          <div class="client-avatar">${initials(name)}</div>
          <div class="client-name">${name}</div>
          <div class="client-meta">
            ${c.email?`<span><i class="fas fa-envelope" style="color:#555;margin-right:4px;font-size:11px"></i>${c.email}</span>`:''}
            ${c.phone?`<span><i class="fas fa-phone" style="color:#555;margin-right:4px;font-size:11px"></i>${c.phone}</span>`:''}
          </div>
          ${phaseBadge}
          <div class="client-sessions-count"><i class="fas fa-dumbbell" style="color:#555;margin-right:4px;font-size:10px"></i>${c.session_count||0} sessions logged</div>
        </div>`;
    }).join('');
  },

  async openDetail(id) {
    if (!id) return;
    try {
      const client = await API.get(`/api/clients/${id}`);
      this.currentClient = client;
      document.getElementById('clientDetailTitle').textContent = `${client.first_name} ${client.last_name}`;
      document.getElementById('clientDetailModal').classList.add('open');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.tab-btn').classList.add('active');
      this.switchTab('overview', document.querySelector('.tab-btn'));
    } catch(e) { toast('Failed to load client details', 'error'); }
  },

  closeDetail() {
    document.getElementById('clientDetailModal').classList.remove('open');
    this.currentClient = null;
  },

  switchTab(tab, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const c = this.currentClient;
    if (!c) return;
    const el = document.getElementById('clientDetailContent');

    if (tab === 'overview') {
      const age = c.dob ? Math.floor((Date.now()-new Date(c.dob))/(365.25*24*3600*1000)) : null;
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border)">
          <div class="client-avatar" style="width:64px;height:64px;font-size:24px;margin-bottom:0">${initials(`${c.first_name} ${c.last_name}`)}</div>
          <div>
            <div style="font-size:22px;font-weight:900;color:var(--text)">${c.first_name} ${c.last_name}</div>
            <div style="font-size:13px;color:var(--t3);margin-top:4px">Client since ${fmtDate(c.created_at)}</div>
            ${c.current_phase?`<div style="margin-top:8px"><span class="tag" style="background:${c.current_phase.color}22;color:${c.current_phase.color}">Week ${c.current_phase.week} — ${c.current_phase.phase_name}</span></div>`:''}
          </div>
          <div style="margin-left:auto;display:flex;gap:8px">
            <button class="btn btn-outline" onclick="Clients.closeDetail();setTimeout(()=>Clients.openAddWizard(),100)" style="font-size:11px;padding:8px 14px"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-danger" onclick="Clients.deleteClient('${c.id}')" style="font-size:11px;padding:8px 14px"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item"><div class="info-label">Email</div><div class="info-value">${c.email||'—'}</div></div>
          <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${c.phone||'—'}</div></div>
          <div class="info-item"><div class="info-label">Date of Birth</div><div class="info-value">${c.dob?`${fmtDate(c.dob)} (${age} yrs)`:'—'}</div></div>
          <div class="info-item"><div class="info-label">Gender</div><div class="info-value">${c.gender||'—'}</div></div>
          <div class="info-item"><div class="info-label">Occupation</div><div class="info-value">${c.occupation||'—'}</div></div>
          <div class="info-item"><div class="info-label">Emergency Contact</div><div class="info-value">${c.emergency_name?`${c.emergency_name} — ${c.emergency_phone||''}`:'—'}</div></div>
        </div>
        ${c.assessment ? this._renderAssessmentSummary(c.assessment) : '<div class="empty-state"><i class="fas fa-clipboard"></i><p>No assessment on file</p></div>'}`;
    }
    else if (tab === 'plan') {
      if (!c.plan) { el.innerHTML = '<div class="empty-state large"><i class="fas fa-dumbbell"></i><p>No training plan generated yet.</p></div>'; return; }
      el.innerHTML = this._renderPlan(c.plan, c.plan_start, c.current_phase);
    }
    else if (tab === 'sessions') {
      el.innerHTML = this._renderSessions(c.sessions || []);
    }
    else if (tab === 'parq') {
      el.innerHTML = this._renderPARQ(c.parq);
    }
  },

  _renderAssessmentSummary(a) {
    const goals = JSON.parse(a.goals||'[]').join(', ').replace(/_/g,' ') || '—';
    const equip = JSON.parse(a.available_equipment||'[]').join(', ').replace(/_/g,' ') || '—';
    return `
      <div style="margin-top:16px">
        <div style="font-size:12px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Assessment Summary</div>
        <div class="info-grid">
          <div class="info-item"><div class="info-label">Goals</div><div class="info-value" style="text-transform:capitalize">${goals}</div></div>
          <div class="info-item"><div class="info-label">Fitness Level</div><div class="info-value" style="text-transform:capitalize">${a.fitness_level||'—'}</div></div>
          <div class="info-item"><div class="info-label">Training Days/Week</div><div class="info-value">${a.training_days_per_week||'—'}</div></div>
          <div class="info-item"><div class="info-label">Session Length</div><div class="info-value">${a.session_duration||60} min</div></div>
          <div class="info-item"><div class="info-label">Equipment</div><div class="info-value" style="text-transform:capitalize">${equip}</div></div>
          <div class="info-item"><div class="info-label">Sleep / Night</div><div class="info-value">${a.sleep_hours||'—'} hrs</div></div>
        </div>
        ${a.injuries?`<div style="margin-top:8px"><div class="info-label">Injuries / Limitations</div><div class="info-value" style="color:var(--t2);font-size:13px;margin-top:4px">${a.injuries}</div></div>`:''}
      </div>`;
  },

  _renderPlan(plan, startDate, currentPhase) {
    const wkGrid = plan.weeks.map(w => {
      const isCurrent = currentPhase && w.week === currentPhase.week;
      return `<div class="plan-week-cell ${w.is_deload?'deload':''} ${isCurrent?'current-week':''}"
        style="background:${w.color}${w.is_deload?'33':'66'};border-color:${w.color}44"
        title="Week ${w.week}: ${w.phase_name}${w.is_deload?' (DELOAD)':''}">
        ${w.week}
      </div>`;
    }).join('');

    const phaseRows = plan.weeks.reduce((acc, w) => {
      const key = w.phase_name;
      if (!acc[key]) acc[key] = { ...w, count:0, start:w.week };
      acc[key].count++; acc[key].end = w.week;
      return acc;
    }, {});

    const phaseList = Object.values(phaseRows).map((p,i) => `
      <div class="plan-phase-row ${currentPhase && currentPhase.phase === p.phase && !p.phase_name.includes('Integration') ? 'current' : ''}">
        <div class="plan-phase-dot" style="background:${p.color}"></div>
        <div class="plan-phase-info">
          <div class="plan-phase-name">${p.phase_name}</div>
          <div class="plan-phase-detail">Sets: ${p.sets} | Reps: ${p.reps} | Intensity: ${p.intensity}</div>
        </div>
        <div class="plan-phase-weeks">Wk ${p.start}–${p.end}</div>
      </div>`).join('');

    const current = currentPhase;
    const currentCard = current ? `
      <div class="phase-detail-card" style="border-color:${current.color}44;background:${current.color}11">
        <h4 style="color:${current.color}"><i class="fas fa-location-dot"></i> Current — Week ${current.week}: ${current.phase_name}</h4>
        <div class="phase-spec-grid">
          <div class="phase-spec"><div class="phase-spec-label">Sets</div><div class="phase-spec-value">${current.sets}</div></div>
          <div class="phase-spec"><div class="phase-spec-label">Reps</div><div class="phase-spec-value">${current.reps}</div></div>
          <div class="phase-spec"><div class="phase-spec-label">Intensity</div><div class="phase-spec-value">${current.intensity}</div></div>
          <div class="phase-spec"><div class="phase-spec-label">Rest</div><div class="phase-spec-value">${current.rest}</div></div>
        </div>
        <div style="font-size:12px;color:var(--t2)">${current.note}</div>
      </div>` : '';

    const nutritionHtml = plan.nutrition_notes?.length ? `
      <div style="margin-top:16px"><div style="font-size:12px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Nutrition Guidelines</div>
        ${plan.nutrition_notes.map(n=>`<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;color:var(--t2);display:flex;gap:8px"><span style="color:var(--red);flex-shrink:0">•</span>${n}</div>`).join('')}
      </div>` : '';

    return `
      <div style="margin-bottom:16px">
        <div style="font-size:12px;color:var(--t3);margin-bottom:4px">52-WEEK NASM OPT PLAN · Started ${fmtDate(startDate)} · Split: ${plan.split}</div>
        ${currentCard}
        <div style="font-size:12px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px">Year-at-a-Glance</div>
        <div class="plan-week-grid">${wkGrid}</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;font-size:11px;color:var(--t3)">
          <span>■ Week color = phase</span>
          <span style="opacity:.5">■ Faded = deload week</span>
          <span style="border:1px solid #fff;padding:0 4px">current week</span>
        </div>
        <div style="font-size:12px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Phase Breakdown</div>
        <div>${phaseList}</div>
        ${nutritionHtml}
      </div>`;
  },

  _renderSessions(sessions) {
    if (!sessions.length) return '<div class="empty-state large"><i class="fas fa-calendar"></i><p>No sessions logged yet</p></div>';
    return `
      <div>
        <div style="font-size:12px;color:var(--t3);margin-bottom:12px">${sessions.length} total sessions</div>
        ${sessions.map(s => `
          <div class="session-item">
            <span class="session-time" style="min-width:90px">${fmtDate(s.date)}</span>
            <span class="session-time">${fmt12(s.time)||'—'}</span>
            <span class="session-client">${s.phase||'Session'}</span>
            <span class="session-phase">${s.duration||60} min${s.completed?' ✓':''}</span>
          </div>`).join('')}
      </div>`;
  },

  _renderPARQ(parq) {
    if (!parq) return '<div class="empty-state large"><i class="fas fa-clipboard-question"></i><p>No PAR-Q on file</p></div>';
    const questions = [
      'Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?',
      'Do you feel pain in your chest when you do physical activity?',
      'In the past month, have you had chest pain when you were NOT doing physical activity?',
      'Do you lose your balance because of dizziness, or do you ever lose consciousness?',
      'Do you have a bone or joint problem that could be made worse by a change in your physical activity?',
      'Is your doctor currently prescribing drugs for your blood pressure or heart condition?',
      'Do you know of any other reason why you should not do physical activity?'
    ];
    const anyYes = ['q1','q2','q3','q4','q5','q6','q7'].some(q => parq[q]);
    return `
      <div>
        ${anyYes
          ? `<div class="parq-alert"><i class="fas fa-triangle-exclamation"></i><div><strong>Medical clearance recommended.</strong> One or more PAR-Q questions were answered YES. Client should consult a physician before beginning an exercise program.</div></div>`
          : `<div class="parq-ok"><i class="fas fa-circle-check"></i><div><strong>Cleared to exercise.</strong> All PAR-Q questions answered NO. Client can begin training without medical clearance.</div></div>`}
        <div style="margin-top:16px">
          ${questions.map((q,i) => `
            <div class="parq-question">
              <div class="parq-text"><div class="parq-number">Q${i+1}</div>${q}</div>
              <div>
                <span class="tag ${parq[`q${i+1}`] ? 'tag-red' : 'tag-green'}">${parq[`q${i+1}`] ? 'YES' : 'NO'}</span>
              </div>
            </div>`).join('')}
        </div>
        ${parq.notes ? `<div style="margin-top:12px;padding:12px;background:var(--bg3);border-radius:6px;font-size:13px;color:var(--t2)"><strong style="color:var(--t3);text-transform:uppercase;font-size:11px;letter-spacing:.5px">Notes:</strong><br>${parq.notes}</div>` : ''}
        <div style="margin-top:12px;font-size:12px;color:var(--t4)">Completed: ${fmtDate(parq.date)}</div>
      </div>`;
  },

  async deleteClient(id) {
    if (!confirm('Delete this client and all their data? This cannot be undone.')) return;
    try {
      await API.del(`/api/clients/${id}`);
      this.closeDetail();
      toast('Client deleted', 'success');
      this.load();
      Dashboard.load();
    } catch(e) { toast('Failed to delete client', 'error'); }
  },

  // ── WIZARD ─────────────────────────────────────
  openAddWizard() {
    this.wizardStep = 1;
    this.wizardData = { client:{}, parq:{q1:false,q2:false,q3:false,q4:false,q5:false,q6:false,q7:false,notes:''}, assessment:{goals:[],fitness_level:'beginner',training_days_per_week:3,session_duration:60,available_equipment:[],injuries:'',medical_conditions:'',diet_approach:'',sleep_hours:7,stress_level:5,motivation_level:7,notes:''} };
    document.getElementById('addClientModal').classList.add('open');
    this._renderWizardStep();
  },

  closeWizard() {
    document.getElementById('addClientModal').classList.remove('open');
  },

  _updateWizardNav() {
    document.getElementById('wizardPrev').style.display = this.wizardStep > 1 ? 'inline-flex' : 'none';
    const nextBtn = document.getElementById('wizardNext');
    nextBtn.innerHTML = this.wizardStep === 4 ? '<i class="fas fa-check"></i> Save Client' : 'Next <i class="fas fa-arrow-right"></i>';
    document.querySelectorAll('.wizard-step').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.remove('active','done');
      if (s === this.wizardStep) el.classList.add('active');
      else if (s < this.wizardStep) el.classList.add('done');
    });
  },

  wizardNext() {
    if (this.wizardStep === 1) {
      if (!this._collectStep1()) return;
      this.wizardStep = 2;
    } else if (this.wizardStep === 2) {
      this._collectStep2();
      this.wizardStep = 3;
    } else if (this.wizardStep === 3) {
      this._collectStep3();
      this.wizardStep = 4;
    } else if (this.wizardStep === 4) {
      this._saveClient();
      return;
    }
    this._renderWizardStep();
  },

  wizardPrev() {
    if (this.wizardStep > 1) { this.wizardStep--; this._renderWizardStep(); }
  },

  _renderWizardStep() {
    this._updateWizardNav();
    const el = document.getElementById('wizardContent');
    if (this.wizardStep === 1) el.innerHTML = this._step1HTML();
    else if (this.wizardStep === 2) el.innerHTML = this._step2HTML();
    else if (this.wizardStep === 3) el.innerHTML = this._step3HTML();
    else if (this.wizardStep === 4) el.innerHTML = this._step4HTML();
  },

  _step1HTML() {
    const d = this.wizardData.client;
    return `
      <div style="margin-bottom:8px"><h3 style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">Client Information</h3><p style="font-size:13px;color:var(--t3)">Enter your client's basic details below.</p></div>
      <div class="form-row">
        <div class="form-group"><label>First Name *</label><input type="text" id="w-fname" value="${d.first_name||''}" placeholder="First name"/></div>
        <div class="form-group"><label>Last Name *</label><input type="text" id="w-lname" value="${d.last_name||''}" placeholder="Last name"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Email</label><input type="email" id="w-email" value="${d.email||''}" placeholder="email@example.com"/></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="w-phone" value="${d.phone||''}" placeholder="(555) 555-5555"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Date of Birth</label><input type="date" id="w-dob" value="${d.dob||''}"/></div>
        <div class="form-group"><label>Gender</label>
          <select id="w-gender">
            <option value="">Select…</option>
            <option value="Male" ${d.gender==='Male'?'selected':''}>Male</option>
            <option value="Female" ${d.gender==='Female'?'selected':''}>Female</option>
            <option value="Non-binary" ${d.gender==='Non-binary'?'selected':''}>Non-binary</option>
            <option value="Prefer not to say" ${d.gender==='Prefer not to say'?'selected':''}>Prefer not to say</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label>Occupation</label><input type="text" id="w-occupation" value="${d.occupation||''}" placeholder="e.g. Teacher, Software Engineer…"/></div>
      <div class="form-row">
        <div class="form-group"><label>Emergency Contact Name</label><input type="text" id="w-emname" value="${d.emergency_name||''}" placeholder="Contact name"/></div>
        <div class="form-group"><label>Emergency Contact Phone</label><input type="tel" id="w-emphone" value="${d.emergency_phone||''}" placeholder="(555) 555-5555"/></div>
      </div>`;
  },

  _collectStep1() {
    const fname = document.getElementById('w-fname').value.trim();
    const lname = document.getElementById('w-lname').value.trim();
    if (!fname || !lname) { toast('First and last name are required', 'error'); return false; }
    this.wizardData.client = {
      first_name: fname, last_name: lname,
      email: document.getElementById('w-email').value.trim(),
      phone: document.getElementById('w-phone').value.trim(),
      dob: document.getElementById('w-dob').value,
      gender: document.getElementById('w-gender').value,
      occupation: document.getElementById('w-occupation').value.trim(),
      emergency_name: document.getElementById('w-emname').value.trim(),
      emergency_phone: document.getElementById('w-emphone').value.trim()
    };
    return true;
  },

  _step2HTML() {
    const d = this.wizardData.parq;
    const questions = [
      'Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?',
      'Do you feel pain in your chest when you do physical activity?',
      'In the past month, have you had chest pain when you were NOT doing physical activity?',
      'Do you lose your balance because of dizziness, or do you ever lose consciousness?',
      'Do you have a bone or joint problem (e.g. back, knee, hip) that could be made worse by a change in your physical activity?',
      'Is your doctor currently prescribing drugs (e.g. water pills) for your blood pressure or heart condition?',
      'Do you know of any other reason why you should not do physical activity?'
    ];
    const anyYes = ['q1','q2','q3','q4','q5','q6','q7'].some(q => d[q]);
    return `
      <div style="margin-bottom:16px"><h3 style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">PAR-Q — Physical Activity Readiness Questionnaire</h3><p style="font-size:13px;color:var(--t3)">Please answer honestly. Answer YES or NO to each question.</p></div>
      ${questions.map((q,i)=>`
        <div class="parq-question">
          <div class="parq-text"><div class="parq-number">Q${i+1}</div>${q}</div>
          <div class="parq-options">
            <button class="parq-btn yes ${d[`q${i+1}`]?'selected':''}" onclick="Clients._parqAnswer('q${i+1}',true,this)">YES</button>
            <button class="parq-btn no ${!d[`q${i+1}`]?'selected':''}" onclick="Clients._parqAnswer('q${i+1}',false,this)">NO</button>
          </div>
        </div>`).join('')}
      <div class="form-group" style="margin-top:16px"><label>Additional Notes</label><textarea id="parq-notes" rows="2" placeholder="Any other relevant health information…">${d.notes||''}</textarea></div>
      <div id="parq-status" style="margin-top:12px">
        ${anyYes ? '<div class="parq-alert"><i class="fas fa-triangle-exclamation"></i><div><strong>Medical clearance recommended.</strong> One or more YES answers — advise client to see a physician before starting. You may still proceed by clicking Next.</div></div>' : '<div class="parq-ok"><i class="fas fa-circle-check"></i><div><strong>No issues flagged.</strong> All answers are NO — client is cleared to begin training.</div></div>'}
      </div>`;
  },

  _parqAnswer(key, val, btn) {
    this.wizardData.parq[key] = val;
    const pair = btn.closest('.parq-options');
    pair.querySelectorAll('.parq-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const anyYes = ['q1','q2','q3','q4','q5','q6','q7'].some(q => this.wizardData.parq[q]);
    const status = document.getElementById('parq-status');
    if (status) status.innerHTML = anyYes
      ? '<div class="parq-alert"><i class="fas fa-triangle-exclamation"></i><div><strong>Medical clearance recommended.</strong> One or more YES answers flagged.</div></div>'
      : '<div class="parq-ok"><i class="fas fa-circle-check"></i><div><strong>No issues flagged.</strong> Cleared to begin training.</div></div>';
  },

  _collectStep2() {
    this.wizardData.parq.notes = document.getElementById('parq-notes')?.value || '';
  },

  _step3HTML() {
    const d = this.wizardData.assessment;
    const goalOptions = [
      { value:'weight_loss', label:'Weight Loss' },
      { value:'muscle_gain', label:'Muscle Gain' },
      { value:'athletic_performance', label:'Athletic Performance' },
      { value:'general_fitness', label:'General Fitness' },
      { value:'rehabilitation', label:'Rehabilitation' },
      { value:'sport_specific', label:'Sport Specific' }
    ];
    const equipOptions = [
      { value:'full_gym', label:'Full Gym' },
      { value:'home_gym', label:'Home Gym' },
      { value:'dumbbells', label:'Dumbbells' },
      { value:'barbells', label:'Barbells' },
      { value:'cables', label:'Cable Machines' },
      { value:'bodyweight', label:'Bodyweight Only' },
      { value:'resistance_bands', label:'Resistance Bands' },
      { value:'kettlebells', label:'Kettlebells' }
    ];
    return `
      <div style="margin-bottom:16px"><h3 style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">Fitness Assessment</h3><p style="font-size:13px;color:var(--t3)">Gather information to build a customized OPT model plan.</p></div>
      <div class="form-group">
        <label>Training Goals (select all that apply)</label>
        <div class="checkbox-grid">
          ${goalOptions.map(g=>`<label class="checkbox-item ${d.goals?.includes(g.value)?'checked':''}" onclick="Clients._toggleGoal('${g.value}',this)">
            <input type="checkbox" ${d.goals?.includes(g.value)?'checked':''} style="pointer-events:none"> ${g.label}
          </label>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>Current Fitness Level</label>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${[['beginner','Beginner'],['intermediate','Intermediate'],['advanced','Advanced']].map(([v,l])=>`
            <label class="radio-item ${d.fitness_level===v?'checked':''}" onclick="Clients._setFitness('${v}',this)">
              <input type="radio" name="fitness" value="${v}" ${d.fitness_level===v?'checked':''} style="pointer-events:none"> ${l}
            </label>`).join('')}
        </div>
      </div>
      <div class="form-group"><label>Training History</label><textarea id="w-history" rows="2" placeholder="e.g. 2 years weight training, played college basketball…">${d.training_history||''}</textarea></div>
      <div class="form-row">
        <div class="form-group">
          <label>Training Days Per Week</label>
          <select id="w-days">
            ${[2,3,4,5,6].map(n=>`<option value="${n}" ${d.training_days_per_week==n?'selected':''}>${n} days</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Session Duration</label>
          <select id="w-duration">
            ${[30,45,60,75,90].map(n=>`<option value="${n}" ${d.session_duration==n?'selected':''}>${n} minutes</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Available Equipment</label>
        <div class="checkbox-grid">
          ${equipOptions.map(e=>`<label class="checkbox-item ${d.available_equipment?.includes(e.value)?'checked':''}" onclick="Clients._toggleEquip('${e.value}',this)">
            <input type="checkbox" ${d.available_equipment?.includes(e.value)?'checked':''} style="pointer-events:none"> ${e.label}
          </label>`).join('')}
        </div>
      </div>
      <div class="form-group"><label>Injuries / Physical Limitations</label><textarea id="w-injuries" rows="2" placeholder="List any current or past injuries, pain areas, or limitations…">${d.injuries||''}</textarea></div>
      <div class="form-group"><label>Medical Conditions</label><textarea id="w-medical" rows="2" placeholder="Any relevant medical conditions (beyond PAR-Q)…">${d.medical_conditions||''}</textarea></div>
      <div class="form-group">
        <label>Dietary Approach</label>
        <select id="w-diet">
          <option value="">No preference / general healthy</option>
          ${[['vegetarian','Vegetarian'],['vegan','Vegan'],['low_carb','Low Carb / Keto'],['high_protein','High Protein'],['mediterranean','Mediterranean'],['intermittent_fasting','Intermittent Fasting']].map(([v,l])=>`<option value="${v}" ${d.diet_approach===v?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Average Sleep Per Night: <span id="sleep-val" style="color:var(--red);font-weight:900">${d.sleep_hours||7} hrs</span></label>
        <input type="range" id="w-sleep" min="4" max="10" step=".5" value="${d.sleep_hours||7}" oninput="document.getElementById('sleep-val').textContent=this.value+' hrs'"/>
        <div class="range-labels"><span>4 hrs</span><span>10 hrs</span></div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Stress Level: <span id="stress-val" style="color:var(--red);font-weight:900">${d.stress_level||5}/10</span></label>
          <input type="range" id="w-stress" min="1" max="10" value="${d.stress_level||5}" oninput="document.getElementById('stress-val').textContent=this.value+'/10'"/>
          <div class="range-labels"><span>Low</span><span>High</span></div>
        </div>
        <div class="form-group">
          <label>Motivation Level: <span id="motiv-val" style="color:var(--red);font-weight:900">${d.motivation_level||7}/10</span></label>
          <input type="range" id="w-motiv" min="1" max="10" value="${d.motivation_level||7}" oninput="document.getElementById('motiv-val').textContent=this.value+'/10'"/>
          <div class="range-labels"><span>Low</span><span>High</span></div>
        </div>
      </div>
      <div class="form-group"><label>Additional Notes</label><textarea id="w-notes" rows="2" placeholder="Anything else worth knowing…">${d.notes||''}</textarea></div>`;
  },

  _toggleGoal(val, el) {
    el.classList.toggle('checked');
    const a = this.wizardData.assessment;
    if (!a.goals) a.goals = [];
    if (a.goals.includes(val)) a.goals = a.goals.filter(g=>g!==val);
    else a.goals.push(val);
  },

  _toggleEquip(val, el) {
    el.classList.toggle('checked');
    const a = this.wizardData.assessment;
    if (!a.available_equipment) a.available_equipment = [];
    if (a.available_equipment.includes(val)) a.available_equipment = a.available_equipment.filter(e=>e!==val);
    else a.available_equipment.push(val);
  },

  _setFitness(val, el) {
    this.wizardData.assessment.fitness_level = val;
    el.closest('.form-group').querySelectorAll('.radio-item').forEach(r=>r.classList.remove('checked'));
    el.classList.add('checked');
  },

  _collectStep3() {
    const a = this.wizardData.assessment;
    a.training_history = document.getElementById('w-history')?.value || '';
    a.training_days_per_week = parseInt(document.getElementById('w-days')?.value) || 3;
    a.session_duration = parseInt(document.getElementById('w-duration')?.value) || 60;
    a.injuries = document.getElementById('w-injuries')?.value || '';
    a.medical_conditions = document.getElementById('w-medical')?.value || '';
    a.diet_approach = document.getElementById('w-diet')?.value || '';
    a.sleep_hours = parseFloat(document.getElementById('w-sleep')?.value) || 7;
    a.stress_level = parseInt(document.getElementById('w-stress')?.value) || 5;
    a.motivation_level = parseInt(document.getElementById('w-motiv')?.value) || 7;
    a.notes = document.getElementById('w-notes')?.value || '';
  },

  _step4HTML() {
    const c = this.wizardData.client;
    const p = this.wizardData.parq;
    const a = this.wizardData.assessment;
    const anyYes = ['q1','q2','q3','q4','q5','q6','q7'].some(q=>p[q]);
    const goalLabels = { weight_loss:'Weight Loss', muscle_gain:'Muscle Gain', athletic_performance:'Athletic Performance', general_fitness:'General Fitness', rehabilitation:'Rehabilitation', sport_specific:'Sport Specific' };
    return `
      <div style="margin-bottom:16px"><h3 style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">Review & Confirm</h3><p style="font-size:13px;color:var(--t3)">Review all information below, then click Save Client to generate the OPT plan.</p></div>
      <div class="review-section">
        <h4>Client Info</h4>
        <div class="review-item"><span class="review-key">Name</span><span class="review-val">${c.first_name} ${c.last_name}</span></div>
        <div class="review-item"><span class="review-key">Email</span><span class="review-val">${c.email||'—'}</span></div>
        <div class="review-item"><span class="review-key">Phone</span><span class="review-val">${c.phone||'—'}</span></div>
        <div class="review-item"><span class="review-key">DOB</span><span class="review-val">${c.dob?fmtDate(c.dob):'—'}</span></div>
        <div class="review-item"><span class="review-key">Gender</span><span class="review-val">${c.gender||'—'}</span></div>
      </div>
      <div class="review-section">
        <h4>PAR-Q</h4>
        ${anyYes
          ? '<div class="review-item"><span style="color:#ef4444"><i class="fas fa-triangle-exclamation"></i> Medical clearance recommended — one or more YES answers</span></div>'
          : '<div class="review-item"><span style="color:#10b981"><i class="fas fa-circle-check"></i> All clear — no concerns flagged</span></div>'}
      </div>
      <div class="review-section">
        <h4>Assessment</h4>
        <div class="review-item"><span class="review-key">Goals</span><span class="review-val" style="text-transform:capitalize">${(a.goals||[]).map(g=>goalLabels[g]||g).join(', ')||'—'}</span></div>
        <div class="review-item"><span class="review-key">Fitness Level</span><span class="review-val" style="text-transform:capitalize">${a.fitness_level||'—'}</span></div>
        <div class="review-item"><span class="review-key">Training Days/Wk</span><span class="review-val">${a.training_days_per_week}</span></div>
        <div class="review-item"><span class="review-key">Session Duration</span><span class="review-val">${a.session_duration} min</span></div>
        <div class="review-item"><span class="review-key">Injuries</span><span class="review-val">${a.injuries||'None reported'}</span></div>
      </div>
      <div style="background:rgba(204,0,0,.08);border:1px solid rgba(204,0,0,.3);border-radius:var(--r);padding:14px 16px;display:flex;gap:12px;align-items:flex-start">
        <i class="fas fa-layer-group" style="color:var(--red);margin-top:2px"></i>
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--text)">52-Week NASM OPT Plan Will Be Generated</div>
          <div style="font-size:12px;color:var(--t3);margin-top:4px">A customized year-long periodized training plan will be created based on their goals and fitness level, following the NASM Optimum Performance Training™ model.</div>
        </div>
      </div>`;
  },

  async _saveClient() {
    const btn = document.getElementById('wizardNext');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
    try {
      const result = await API.post('/api/clients', this.wizardData);
      this.closeWizard();
      toast(`${result.first_name} ${result.last_name} added successfully!`, 'success');
      this.load();
      Dashboard.load();
      CalendarApp.reload();
    } catch(e) {
      toast('Failed to save client: ' + e.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check"></i> Save Client';
    }
  }
};

/* ─── CALENDAR ─────────────────────────────────── */
const CalendarApp = {
  instance: null,
  clients: [],
  currentEvent: null,
  initialized: false,

  async init() {
    if (this.initialized && this.instance) {
      this.reload();
      return;
    }
    try {
      this.clients = await API.get('/api/clients');
      const sessions = await API.get('/api/sessions');
      const events = sessions.map(s => this._sessionToEvent(s));
      const el = document.getElementById('calendar');
      if (!el) return;
      this.instance = new FullCalendar.Calendar(el, {
        initialView: 'dayGridMonth',
        headerToolbar: { left:'prev,next today', center:'title', right:'dayGridMonth,timeGridWeek,listWeek' },
        events,
        editable: true,
        selectable: true,
        height: 'auto',
        eventClick: info => this._onEventClick(info),
        select: info => { this.openNewSession(info.startStr); },
        eventDrop: async info => {
          try {
            const { id } = info.event;
            const s = sessions.find(s=>s.id===id);
            if (!s) return;
            const newDate = info.event.startStr.split('T')[0];
            await API.put(`/api/sessions/${id}`, { ...s, date:newDate, completed:s.completed||0 });
          } catch(e) { toast('Failed to move session','error'); info.revert(); }
        }
      });
      this.instance.render();
      this.initialized = true;
    } catch(e) { toast('Failed to load calendar','error'); }
  },

  _sessionToEvent(s) {
    const colors = { 'Phase 1':'#3b82f6','Phase 2':'#8b5cf6','Phase 3':'#f59e0b','Phase 4':'#ef4444','Phase 5':'#10b981' };
    let color = '#cc0000';
    if (s.phase) {
      for (const [k,v] of Object.entries(colors)) { if (s.phase.includes(k)) { color=v; break; } }
    }
    const start = s.time ? `${s.date}T${s.time}` : s.date;
    return { id:s.id, title:s.client_name, start, backgroundColor:color, borderColor:color, extendedProps:{ session:s } };
  },

  async reload() {
    if (!this.instance) return;
    try {
      this.clients = await API.get('/api/clients');
      const sessions = await API.get('/api/sessions');
      this.instance.removeAllEvents();
      sessions.forEach(s => this.instance.addEvent(this._sessionToEvent(s)));
    } catch(e) {}
  },

  openNewSession(date) {
    this.currentEvent = null;
    document.getElementById('session-id').value = '';
    document.getElementById('session-date').value = date || new Date().toISOString().split('T')[0];
    document.getElementById('session-time').value = '';
    document.getElementById('session-duration').value = 60;
    document.getElementById('session-phase').value = '';
    document.getElementById('session-notes').value = '';
    document.getElementById('session-delete-btn').style.display = 'none';
    document.getElementById('sessionModalTitle').textContent = 'Schedule Session';
    this._populateClientSelect(null);
    document.getElementById('sessionModal').classList.add('open');
  },

  _onEventClick(info) {
    const s = info.event.extendedProps.session;
    this.currentEvent = s;
    document.getElementById('session-id').value = s.id;
    document.getElementById('session-date').value = s.date;
    document.getElementById('session-time').value = s.time || '';
    document.getElementById('session-duration').value = s.duration || 60;
    document.getElementById('session-phase').value = s.phase || '';
    document.getElementById('session-notes').value = s.notes || '';
    document.getElementById('session-delete-btn').style.display = 'inline-flex';
    document.getElementById('sessionModalTitle').textContent = 'Edit Session';
    this._populateClientSelect(s.client_id);
    document.getElementById('sessionModal').classList.add('open');
  },

  _populateClientSelect(selectedId) {
    const sel = document.getElementById('session-client');
    sel.innerHTML = '<option value="">Select client…</option>' +
      this.clients.map(c=>`<option value="${c.id}" ${c.id===selectedId?'selected':''}>${c.first_name} ${c.last_name}</option>`).join('');
  },

  closeModal() {
    document.getElementById('sessionModal').classList.remove('open');
    this.currentEvent = null;
  },

  async saveSession() {
    const id = document.getElementById('session-id').value;
    const client_id = document.getElementById('session-client').value;
    const date = document.getElementById('session-date').value;
    if (!client_id) { toast('Please select a client','error'); return; }
    if (!date) { toast('Please select a date','error'); return; }
    const data = {
      client_id, date,
      time: document.getElementById('session-time').value || null,
      duration: parseInt(document.getElementById('session-duration').value) || 60,
      phase: document.getElementById('session-phase').value || null,
      notes: document.getElementById('session-notes').value || null,
      completed: 0
    };
    try {
      if (id) await API.put(`/api/sessions/${id}`, { ...data, completed:this.currentEvent?.completed||0 });
      else await API.post('/api/sessions', data);
      this.closeModal();
      toast(id ? 'Session updated' : 'Session scheduled', 'success');
      this.reload();
      Dashboard.load();
    } catch(e) { toast('Failed to save session','error'); }
  },

  async deleteSession() {
    const id = document.getElementById('session-id').value;
    if (!id || !confirm('Delete this session?')) return;
    try {
      await API.del(`/api/sessions/${id}`);
      this.closeModal();
      toast('Session deleted','success');
      this.reload();
      Dashboard.load();
    } catch(e) { toast('Failed to delete session','error'); }
  }
};

/* ─── SETTINGS ─────────────────────────────────── */
const Settings = {
  async load() {
    try {
      const s = await API.get('/api/settings');
      document.getElementById('set-trainer-name').value = s.trainer_name || '';
      document.getElementById('set-trainer-email').value = s.trainer_email || '';
      document.getElementById('set-dashboard-url').value = s.dashboard_url || '';
      document.getElementById('set-email-enabled').checked = s.email_enabled === 'true';
      document.getElementById('set-daily-time').value = s.daily_email_time || '06:00';
      document.getElementById('set-smtp-host').value = s.smtp_host || '';
      document.getElementById('set-smtp-port').value = s.smtp_port || '587';
      document.getElementById('set-smtp-secure').checked = s.smtp_secure === 'true';
      document.getElementById('set-smtp-user').value = s.smtp_user || '';
      document.getElementById('set-smtp-pass').value = s.smtp_pass || '';
    } catch(e) { toast('Failed to load settings','error'); }
  },

  async save() {
    try {
      await API.put('/api/settings', {
        trainer_name: document.getElementById('set-trainer-name').value,
        trainer_email: document.getElementById('set-trainer-email').value,
        dashboard_url: document.getElementById('set-dashboard-url').value,
        email_enabled: document.getElementById('set-email-enabled').checked ? 'true' : 'false',
        daily_email_time: document.getElementById('set-daily-time').value,
        smtp_host: document.getElementById('set-smtp-host').value,
        smtp_port: document.getElementById('set-smtp-port').value,
        smtp_secure: document.getElementById('set-smtp-secure').checked ? 'true' : 'false',
        smtp_user: document.getElementById('set-smtp-user').value,
        smtp_pass: document.getElementById('set-smtp-pass').value
      });
      toast('Settings saved!', 'success');
    } catch(e) { toast('Failed to save settings','error'); }
  },

  async testEmail() {
    const email = document.getElementById('set-trainer-email').value;
    if (!email) { toast('Enter your email address first','error'); return; }
    toast('Sending test email…', 'info');
    try {
      const r = await API.post('/api/settings/test-email', { email });
      if (r.success) toast('Test email sent! Check your inbox.','success');
      else toast('Email failed: ' + (r.error||r.reason),'error');
    } catch(e) { toast('Email failed: ' + e.message,'error'); }
  },

  async sendNow() {
    toast('Sending daily summary…','info');
    try {
      const r = await API.post('/api/email/send-now', {});
      if (r.success) toast('Daily email sent!','success');
      else toast('Email skipped: ' + (r.reason||r.error),'error');
    } catch(e) { toast('Failed: ' + e.message,'error'); }
  }
};

/* ─── INIT ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => App.init());
