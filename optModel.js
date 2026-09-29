const PHASES = {
  1: {
    name: 'Stabilization Endurance',
    description: 'Build neuromuscular efficiency, stabilization strength, and postural control.',
    sets: '1–3', reps: '12–20', intensity: '50–70% 1RM', rest: '0–90 sec', tempo: '4-2-1',
    focus: ['Corrective flexibility', 'Core stability', 'Balance', 'Muscular endurance'],
    color: '#3b82f6',
    warmup: ['Foam Roll: Calves (30s)', 'Foam Roll: TFL/IT Band (30s)', 'Foam Roll: Thoracic Spine (30s)',
      'Static Stretch: Hip Flexors (30s each)', 'Static Stretch: Pec Minor (30s each)',
      'Active Stretch: Ball Combo (10 reps)'],
    activation: ['Floor Bridge (2×20)', 'Prone Iso-Abs / Plank (2×1 min)', 'Side Iso-Abs (2×30s each)', 'Single-Leg Balance (2×30s each)'],
    resistance: {
      day_A: [
        { name: 'Ball Squat', sets: '1–2', reps: '15–20', notes: 'Feet shoulder-width, neutral spine' },
        { name: 'Seated Cable Row', sets: '1–2', reps: '15–20', notes: 'Neutral grip, retract scapulae' },
        { name: 'Stability Ball DB Chest Press', sets: '1–2', reps: '15–20', notes: 'Head/shoulders on ball' },
        { name: 'Single-Leg DB Scaption', sets: '1–2', reps: '12–15', notes: 'Thumb up, 30° from frontal' },
        { name: 'Single-Leg DB Curl', sets: '1–2', reps: '15–20', notes: 'Maintain balance' },
        { name: 'Single-Leg DB Tricep Ext', sets: '1–2', reps: '15–20', notes: 'Overhead, control' }
      ],
      day_B: [
        { name: 'Step-Up to Balance', sets: '1–2', reps: '15 each', notes: 'Drive knee up, control descent' },
        { name: 'TRX / Suspension Row', sets: '1–2', reps: '15–20', notes: 'Retract scapulae at top' },
        { name: 'Push-Up', sets: '1–2', reps: '15–20', notes: 'Neutral spine, full ROM' },
        { name: 'DB Lateral Raise (single-leg)', sets: '1–2', reps: '12–15', notes: 'Control at top' },
        { name: 'Squat to Row (cable)', sets: '1–2', reps: '15–20', notes: 'Compound movement' },
        { name: 'Romanian Deadlift (light)', sets: '1–2', reps: '15–20', notes: 'Hip hinge, soft knees' }
      ],
      day_C: [
        { name: 'Multiplanar Lunge', sets: '1–2', reps: '10 each', notes: 'Sagittal, frontal, transverse' },
        { name: 'Cable Pull-Through', sets: '1–2', reps: '15–20', notes: 'Hip hinge pattern' },
        { name: 'DB Chest Fly (stability ball)', sets: '1–2', reps: '15–20', notes: 'Wide arc, control' },
        { name: 'Lat Pulldown', sets: '1–2', reps: '15–20', notes: 'Wide grip, pull to chin' },
        { name: 'DB Shoulder Press (stability ball)', sets: '1–2', reps: '15–20', notes: 'Seated on ball' },
        { name: 'Calf Raises (single-leg)', sets: '1–2', reps: '20', notes: 'Full ROM' }
      ]
    },
    cardio: '20–30 min moderate intensity (RPE 5–6/10, HR Zone 1–2)'
  },
  2: {
    name: 'Strength Endurance',
    description: 'Develop prime mover strength with stabilization endurance via superset training.',
    sets: '2–4', reps: '8–12', intensity: '70–80% 1RM', rest: '0–60 sec (between supersets)', tempo: '2-0-2',
    focus: ['Strength development', 'Endurance supersets', 'Hypertrophy base', 'Movement quality'],
    color: '#8b5cf6',
    warmup: ['Foam Roll: Calves, TFL, Adductors, Lats, Thoracic (30s each)',
      'Active Stretch: Leg Swings Front/Back (10 reps)',
      'Dynamic Warm-Up: High Knees, Butt Kicks, Lateral Shuffle (30s each)'],
    activation: ['Ball Crunch (2×15)', 'Back Extension (2×15)', 'Cable Wood Chop (2×12 each)', 'Single-Leg Balance Reach (2×10 each)'],
    resistance: {
      day_A: [
        { name: 'Barbell Squat', sets: '2–4', reps: '8–10', superset: 'Single-Leg Squat (BW)', notes: 'Superset A1/A2' },
        { name: 'Barbell Bench Press', sets: '2–4', reps: '8–10', superset: 'Stability Ball Push-Up', notes: 'Superset B1/B2' },
        { name: 'Barbell Bent-Over Row', sets: '2–4', reps: '8–10', superset: 'Single-Arm DB Row', notes: 'Superset C1/C2' },
        { name: 'Barbell Shoulder Press', sets: '2–4', reps: '8–10', superset: 'Single-Leg DB Lateral Raise', notes: 'Superset D1/D2' }
      ],
      day_B: [
        { name: 'Leg Press', sets: '2–4', reps: '8–10', superset: 'Step-Up to Balance', notes: 'Superset A1/A2' },
        { name: 'Lat Pulldown (wide grip)', sets: '2–4', reps: '8–10', superset: 'TRX Inverted Row', notes: 'Superset B1/B2' },
        { name: 'Romanian Deadlift', sets: '2–4', reps: '8–10', superset: 'Single-Leg Deadlift', notes: 'Superset C1/C2' },
        { name: 'Cable Row', sets: '2–4', reps: '8–10', superset: 'Reverse Fly (stability ball)', notes: 'Superset D1/D2' }
      ],
      day_C: [
        { name: 'Goblet Squat', sets: '2–4', reps: '8–10', superset: 'Lateral Squat', notes: 'Superset A1/A2' },
        { name: 'Incline DB Press', sets: '2–4', reps: '8–10', superset: 'Push-Up with Rotation', notes: 'Superset B1/B2' },
        { name: 'DB Bicep Curl', sets: '2–4', reps: '8–10', superset: 'Single-Leg Curl', notes: 'Superset C1/C2' },
        { name: 'Tricep Pushdown', sets: '2–4', reps: '8–10', superset: 'Single-Arm Tricep Ext', notes: 'Superset D1/D2' }
      ]
    },
    cardio: '20–30 min moderate-high intensity (RPE 6–7/10, Zone 2–3)'
  },
  3: {
    name: 'Muscular Development / Hypertrophy',
    description: 'Maximize muscle cross-sectional area through volume-focused training.',
    sets: '3–5', reps: '6–12', intensity: '75–85% 1RM', rest: '0–60 sec', tempo: '2-0-1',
    focus: ['Muscle hypertrophy', 'Volume accumulation', 'Metabolic stress', 'Mechanical tension'],
    color: '#f59e0b',
    warmup: ['Foam Roll: Full body (30s key areas)', 'Dynamic: Hip mobility, shoulder circles, thoracic rotation (10 reps)',
      'Activation Sets: 2×15 primary pattern at 50% working weight'],
    activation: ['Cable Crunch (3×15)', 'Back Extension (3×12)', 'Pallof Press (2×12 each)', 'Band Pull-Apart (2×20)'],
    resistance: {
      day_A: [
        { name: 'Barbell Back Squat', sets: '4–5', reps: '8–10', notes: 'Full depth, controlled descent' },
        { name: 'Romanian Deadlift', sets: '4', reps: '8–10', notes: 'Hip hinge, hamstring stretch' },
        { name: 'Leg Press', sets: '3–4', reps: '10–12', notes: 'Full ROM' },
        { name: 'Leg Curl (lying)', sets: '3', reps: '10–12', notes: 'Control eccentric' },
        { name: 'Standing Calf Raise', sets: '4', reps: '12–15', notes: '2 sec hold at top' }
      ],
      day_B: [
        { name: 'Barbell Bench Press', sets: '4–5', reps: '8–10', notes: 'Control descent, explosive press' },
        { name: 'Incline DB Press', sets: '4', reps: '10–12', notes: '30–45° incline' },
        { name: 'DB Fly', sets: '3', reps: '12', notes: 'Wide arc, deep stretch' },
        { name: 'Overhead Press (BB)', sets: '4', reps: '8–10', notes: 'Strict form' },
        { name: 'Lateral Raise', sets: '3', reps: '12–15', notes: 'Slight bend at elbow' },
        { name: 'Skull Crusher', sets: '3', reps: '10–12', notes: 'Control to forehead' }
      ],
      day_C: [
        { name: 'Deadlift', sets: '4–5', reps: '6–8', notes: 'Hip hinge, neutral spine' },
        { name: 'Weighted Pull-Up / Lat Pulldown', sets: '4', reps: '8–10', notes: 'Full hang to collarbone' },
        { name: 'Barbell Bent-Over Row', sets: '4', reps: '8–10', notes: 'Elbows 45° from body' },
        { name: 'Seated Cable Row', sets: '3', reps: '10–12', notes: 'Retract scapulae' },
        { name: 'Face Pull', sets: '3', reps: '15', notes: 'External rotation at end' },
        { name: 'Barbell Bicep Curl', sets: '3', reps: '10–12', notes: 'Full ROM' }
      ]
    },
    cardio: '15–20 min low intensity (RPE 4–5/10) post-workout or separate session'
  },
  4: {
    name: 'Maximal Strength',
    description: 'Maximize motor unit recruitment and neural adaptations for peak strength.',
    sets: '4–6', reps: '1–5', intensity: '85–100% 1RM', rest: '3–5 min', tempo: 'Explosive concentric / 3s eccentric',
    focus: ['Maximum force production', 'Neural efficiency', 'Motor unit recruitment', 'Intra-muscular coordination'],
    color: '#ef4444',
    warmup: ['5–10 min bike/row at low intensity', 'Dynamic mobility: hip flexors, thoracic, ankles (10 reps)',
      'Activation: Band pull-apart (2×20), Glute bridge (2×15)',
      'Ramp-Up: 50%×5, 60%×4, 70%×3, 80%×2, 85%×1 before working sets'],
    activation: ['Deadbug (2×10 each)', 'Glute Bridge with Band (2×15)', 'Scapular Push-Up (2×10)', 'Bird Dog (2×10 each)'],
    resistance: {
      day_A: [
        { name: 'Barbell Back Squat', sets: '4–6', reps: '2–4', notes: 'Work to 90–97% 1RM; full depth' },
        { name: 'Romanian Deadlift', sets: '4', reps: '3–5', notes: '80–85% 1RM; hip hinge mastery' },
        { name: 'Weighted Lunge', sets: '3', reps: '5 each', notes: '75–80% 1RM equivalent' }
      ],
      day_B: [
        { name: 'Barbell Bench Press', sets: '4–6', reps: '2–4', notes: 'Work to 90–97% 1RM' },
        { name: 'Overhead Press', sets: '4', reps: '3–5', notes: '85–90% 1RM; strict press' },
        { name: 'Weighted Dip', sets: '3', reps: '4–6', notes: 'Add weight via belt' }
      ],
      day_C: [
        { name: 'Conventional Deadlift', sets: '4–6', reps: '2–4', notes: 'Work to 90–100% 1RM' },
        { name: 'Weighted Pull-Up', sets: '4', reps: '3–5', notes: 'Add weight via belt; full hang' },
        { name: 'Barbell Row (heavy)', sets: '4', reps: '4–6', notes: '80–85% 1RM; explosive' }
      ]
    },
    cardio: '10–15 min low intensity (RPE 3–4) — preserve recovery'
  },
  5: {
    name: 'Power',
    description: 'Develop explosive power and rate of force development through integrated training.',
    sets: '3–6', reps: '1–10', intensity: 'Power: 30–45% 1RM | Strength: 85–100% 1RM', rest: '3–5 min',
    tempo: 'As explosive as possible (concentric) / 3s eccentric',
    focus: ['Rate of force development', 'Explosive power', 'Athletic performance', 'Neuromuscular integration'],
    color: '#10b981',
    warmup: ['Dynamic mobility: full body (10 min)', 'CNS activation: skipping, lateral shuffle, high knees (30s each)',
      'Plyometric prep: 2×5 low box jumps, 2×5 broad jumps',
      'Strength ramp-up: 50%→85% 1RM of primary lift'],
    activation: ['Medicine Ball Slam (2×8)', 'Lateral Bound (2×6 each)', 'Vertical Jump ×5'],
    resistance: {
      day_A: [
        { name: 'Jump Squat', sets: '3–5', reps: '8–10', superset: 'Barbell Squat (heavy)', notes: '30–45% 1RM; land softly' },
        { name: 'Box Jump', sets: '3–5', reps: '5–8', superset: 'Leg Press (heavy)', notes: 'Max height; step down' },
        { name: 'Broad Jump', sets: '3', reps: '5', superset: 'Romanian Deadlift', notes: 'Max distance; explosive' }
      ],
      day_B: [
        { name: 'Medicine Ball Chest Pass', sets: '3–5', reps: '8–10', superset: 'Barbell Bench Press (heavy)', notes: 'Max force; wall or partner' },
        { name: 'Explosive Push-Up', sets: '3–5', reps: '8–10', superset: 'Overhead Press (heavy)', notes: 'Leave ground; clap if able' },
        { name: 'Medicine Ball Rotational Throw', sets: '3', reps: '8 each', superset: 'Cable Row (heavy)', notes: 'Hip drive; explosive rotation' }
      ],
      day_C: [
        { name: 'Medicine Ball Slam', sets: '3–5', reps: '8–10', superset: 'Deadlift (heavy)', notes: 'Full extension overhead' },
        { name: 'Kettlebell Swing', sets: '3–5', reps: '10–15', superset: 'Weighted Pull-Up', notes: 'Hip snap; glute squeeze at top' },
        { name: 'Depth Drop to Jump', sets: '3', reps: '5', notes: 'Minimal ground contact time' }
      ]
    },
    cardio: 'Intervals: 6–8 × 30s max effort / 90s rest or sport-specific agility drills'
  }
};

function getPhaseDurations(fitnessLevel, goals) {
  const g = Array.isArray(goals) ? goals : JSON.parse(goals || '[]');
  const isPerf = g.includes('athletic_performance');
  const isMuscle = g.includes('muscle_gain');
  switch (fitnessLevel) {
    case 'beginner':     return { 1:10, 2:8,  3:isMuscle?10:8,  4:isPerf?8:6,  5:isPerf?8:6,  rest:52 };
    case 'intermediate': return { 1:6,  2:6,  3:isMuscle?10:6,  4:isPerf?8:6,  5:isPerf?8:6,  rest:52 };
    case 'advanced':     return { 1:4,  2:4,  3:isMuscle?10:6,  4:isPerf?10:8, 5:isPerf?10:8, rest:52 };
    default:             return { 1:8,  2:6,  3:8,              4:6,           5:6,           rest:52 };
  }
}

function generateOPTPlan(assessment) {
  const { fitness_level='beginner', goals='[]', training_days_per_week=3, session_duration=60, injuries='' } = assessment;
  const goalsArr = Array.isArray(goals) ? goals : JSON.parse(goals || '[]');
  const dur = getPhaseDurations(fitness_level, goalsArr);
  const weeks = [];
  let cur = 1;

  for (const p of [1,2,3,4,5]) {
    if (cur > 52) break;
    const d = Math.min(dur[p], 52 - cur + 1);
    for (let w = 0; w < d; w++) {
      if (cur > 52) break;
      const isDeload = (w+1) % 4 === 0;
      const ph = PHASES[p];
      weeks.push({ week:cur, phase:p, phase_name:ph.name, week_in_phase:w+1, is_deload:isDeload,
        sets:isDeload?'1–2':ph.sets, reps:ph.reps, intensity:isDeload?'50–60%':ph.intensity,
        rest:ph.rest, tempo:ph.tempo, focus:ph.focus, color:ph.color,
        note:isDeload?'DELOAD WEEK — Reduce volume 50%, focus on form & recovery':ph.description });
      cur++;
    }
  }

  while (cur <= 52) {
    const p = ((cur-1) % 5) + 1;
    const ph = PHASES[p];
    weeks.push({ week:cur, phase:p, phase_name:`Integration — ${ph.name}`, week_in_phase:cur, is_deload:cur%4===0,
      sets:ph.sets, reps:ph.reps, intensity:ph.intensity, rest:ph.rest, tempo:ph.tempo,
      focus:ph.focus, color:ph.color, note:'Integration phase — cyclical NASM OPT periodization' });
    cur++;
  }

  const days = parseInt(training_days_per_week) || 3;
  const split = days<=2?'Full Body (2d/wk)':days===3?'Full Body / Upper-Lower (3d/wk)':days===4?'Upper / Lower (4d/wk)':'Push / Pull / Legs (5–6d/wk)';
  const goalsLabels = { weight_loss:'Weight Loss', muscle_gain:'Muscle Gain', athletic_performance:'Athletic Performance', general_fitness:'General Fitness', rehabilitation:'Rehabilitation', sport_specific:'Sport Specific' };
  const nutritionNotes = goalsArr.includes('weight_loss')
    ? ['Caloric deficit 300–500 kcal/day', 'Protein: 0.8–1g per lb bodyweight', 'Prioritize whole foods & hydration']
    : goalsArr.includes('muscle_gain')
    ? ['Slight caloric surplus: 200–300 kcal above maintenance', 'Protein: 1–1.2g per lb bodyweight', '4–5 protein-rich meals/day']
    : ['Balanced macros: 40% carbs / 30% protein / 30% fat', 'Aim for maintenance calories', 'Minimum 8 cups water daily'];

  return {
    fitness_level, goals:goalsArr, training_days_per_week:days, session_duration, split,
    weeks, phases_detail:PHASES, nutrition_notes:nutritionNotes,
    injury_notes: injuries?.trim() ? [`Reported: ${injuries} — modify exercises accordingly`] : [],
    generated_at: new Date().toISOString()
  };
}

function getCurrentPhase(plan, startDate) {
  const weeksElapsed = Math.floor((Date.now() - new Date(startDate)) / (7*24*60*60*1000));
  const w = Math.min(Math.max(weeksElapsed + 1, 1), 52);
  return plan.weeks.find(x => x.week === w) || plan.weeks[0];
}

module.exports = { generateOPTPlan, getCurrentPhase, PHASES };
