/* ARISE — personal "System": nutrition, training, ACL rehab, schedule */
'use strict';

/* ================= Helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const r0 = n => Math.round(+n || 0);
const r1 = n => Math.round((+n || 0) * 10) / 10;
const pad = n => String(n).padStart(2, '0');
const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return dkey(d); };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmtDate = k => fromKey(k).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const toMin = t => { if (!t) return 9999; const [h, m] = t.split(':').map(Number); return h * 60 + m; };

/* Icons — one stroke family, 2px */
const ICONS = {
  push: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  pull: '<path d="M12 5v14M5 12l7 7 7-7"/>',
  upper: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  lower: '<path d="M8 3v8l-3 10h4l3-7 3 7h4l-3-10V3"/>',
  lower2: '<path d="M8 3v8l-3 10h4l3-7 3 7h4l-3-10V3"/><path d="M19 4v4M17 6h4"/>',
  core: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  rest: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  scan: '<path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3M7 8v8M10 8v8M14 8v8M17 8v8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 13l4 4L19 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-3-2 2-2 4-2 7 0 4 3 7 7 7z"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  heart: '<path d="M12 21s-7.5-4.6-9.5-9.3C1 8.3 3.3 4.5 7 4.5c2 0 3.6 1.1 5 2.8 1.4-1.7 3-2.8 5-2.8 3.7 0 6 3.8 4.5 7.2C19.5 16.4 12 21 12 21z"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
};
const ic = (n, cls = 'ic-svg') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ================= State ================= */
const STORE = 'arise.v1';
const DEFAULT_STATE = () => ({
  v: 1, profile: null, xp: 0, days: {}, customFoods: [], recent: [], schedule: [], tasks: [],
  weights: [], prs: {}, lastW: {}, history: [], split: { ...DEFAULT_SPLIT }, settings: { googleClientId: '' },
});
let S = load();
/* One-time coach updates for existing data */
function migrate() {
  const old = { 6: 'push', 0: 'pull', 1: 'rest', 2: 'lower', 3: 'upper', 4: 'rest', 5: 'rest' };
  if (!S.migr || S.migr < 13) {
    const same = Object.keys(old).every(k => S.split?.[k] === old[k]);
    if (same) S.split = { 6: 'push', 0: 'lower', 1: 'pull', 2: 'rest', 3: 'upper', 4: 'lower2', 5: 'rest' };
    S.migr = 13;
    try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }
}
migrate();
function load() {
  try { const raw = localStorage.getItem(STORE); if (raw) return Object.assign(DEFAULT_STATE(), JSON.parse(raw)); } catch (e) { /* ignore */ }
  return DEFAULT_STATE();
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { toast('STORAGE', 'Could not save — storage is full or blocked.'); }
}
function day(k = dkey()) {
  if (!S.days[k]) S.days[k] = { foods: [], water: 0, workout: null, rehab: { done: [] }, knee: null, manual: {}, claimed: {} };
  return S.days[k];
}
try { navigator.storage?.persist?.(); } catch (e) { /* ignore */ }

/* ================= Targets ================= */
const ACTIVITY = [[1.2, 'Desk — little movement'], [1.375, 'Light — 1-3 sessions/week'], [1.55, 'Moderate — 3-5 sessions/week'], [1.725, 'Very active — 6-7 sessions/week']];
const GOALS = {
  acut: { label: 'Aggressive', perKg: { p: 2.4, f: 0.6, cTrain: 2.3, cLight: 1.4 } },
  cut: { label: 'Cut', d: -450, pk: 2.2 },
  recomp: { label: 'Recomp', d: -150, pk: 2.0 },
  maintain: { label: 'Maintain', d: 0, pk: 1.8 },
  bulk: { label: 'Lean bulk', d: 250, pk: 1.8 },
};
function isTrainDay(k = dkey()) {
  const d = S.days[k];
  if (d && typeof d.train === 'boolean') return d.train;
  if (d?.workout?.sets && Object.keys(d.workout.sets).length) return true;
  return tplKeyFor(k) !== 'rest';
}
function targets(k = dkey()) {
  const p = S.profile;
  if (!p) return { kcal: 2200, p: 150, c: 220, f: 70, water: 12, bmr: 0, tdee: 0 };
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'f' ? -161 : 5);
  const tdee = bmr * p.activity;
  const g = GOALS[p.goal] || GOALS.maintain;
  if (g.perKg) {
    const w = p.weight, train = isTrainDay(k), o = p.override || {};
    const pr = +o.p || Math.round(w * g.perKg.p), f = +o.f || Math.round(w * g.perKg.f);
    const c = +o.c || Math.round(w * (train ? g.perKg.cTrain : g.perKg.cLight));
    const kcal = +o.kcal || Math.round((pr * 4 + c * 4 + f * 9) / 10) * 10;
    const water = Math.max(8, Math.round((w * 35) / 250));
    return { kcal, p: pr, c, f, water, bmr: Math.round(bmr), tdee: Math.round(tdee), train, perKg: true };
  }
  let kcal = Math.round((tdee + g.d) / 10) * 10;
  let pr = Math.round(p.weight * g.pk);
  let f = Math.round(p.weight * 0.8);
  const o = p.override || {};
  if (+o.kcal) kcal = +o.kcal;
  if (+o.p) pr = +o.p;
  if (+o.f) f = +o.f;
  const c = +o.c ? +o.c : Math.max(50, Math.round((kcal - pr * 4 - f * 9) / 4));
  const water = Math.max(8, Math.round((p.weight * 35) / 250));
  return { kcal, p: pr, c, f, water, bmr: Math.round(bmr), tdee: Math.round(tdee) };
}
function totals(k) {
  return day(k).foods.reduce((a, x) => ({ kcal: a.kcal + x.kcal, p: a.p + x.p, c: a.c + x.c, f: a.f + x.f }), { kcal: 0, p: 0, c: 0, f: 0 });
}

/* ================= ACL ================= */
function aclInfo() {
  const a = S.profile?.acl;
  if (!a || a.status === 'none') return null;
  let weeks = null;
  if (a.date) weeks = Math.max(0, Math.floor((Date.now() - fromKey(a.date).getTime()) / (7 * 864e5)));
  if (a.override === 'pre' || (a.status === 'preop' && (a.override == null || a.override === ''))) return { phase: ACL_PREHAB, idx: -1, weeks, a };
  let idx;
  if (a.override != null && a.override !== '') idx = +a.override;
  else idx = weeks == null ? 0 : ACL_PHASES.findIndex(ph => weeks < ph.weeks[1]);
  if (idx < 0) idx = ACL_PHASES.length - 1;
  let locked = false;
  if ((a.override == null || a.override === '') && idx === 4 && !a.cleared) { idx = 3; locked = true; }
  return { phase: ACL_PHASES[idx], idx, weeks, a, locked };
}

/* ================= Training ================= */
const LEG_A = [
  ['Leg press', 4, '8-10', 120, 'Feet mid-platform, full range you control. Push through the whole foot.'],
  ['Bulgarian split squat', 3, '8 / side', 90, 'Operated leg first. Torso tall, slow 3 s down.'],
  ['Leg extension', 3, '12-15', 75, 'Slow 3 s lowering, 1 s squeeze at the top. Quads are the knee’s armour.'],
  ['Single-leg leg extension — operated leg', 2, '12-15', 60, 'Extra quad work for the operated side only. Closes the strength gap.'],
  ['Romanian deadlift', 3, '8-10', 120, 'Hinge at the hips, soft knees, flat back.'],
  ['Lying leg curl', 3, '10-12', 75, 'Slow on the way down. Strong hamstrings protect the graft.'],
  ['Hip abduction machine', 3, '15', 60, 'Strong hips keep the knee from caving in.'],
  ['Seated calf raise', 3, '15', 60, 'Full stretch at the bottom.'],
];
const LEG_B = [
  ['Back squat / safety bar squat', 4, '6-8', 150, 'Depth you control. Add 2.5 kg only when every rep looks the same.'],
  ['Forward step-down', 3, '10 / side', 75, 'Slow, knee tracks over the 2nd toe. Operated leg first.'],
  ['Single-leg RDL', 3, '10 / side', 75, 'Hips square to the floor. Balance + hamstrings.'],
  ['Spanish squat (band) — hold', 3, '45 s', 60, 'Band behind the knees, sit back. Loads the quads with almost no joint stress.'],
  ['Leg extension', 3, '12-15', 75, 'Slow lowering. One extra set on the operated leg if it feels good.'],
  ['Nordic hamstring (assisted)', 3, '5', 90, 'Lower as slow as you can, catch with your hands.'],
  ['Standing calf raise', 4, '12-15', 60, 'Pause at the top.'],
  ['Single-leg balance (eyes closed)', 3, '30 s / side', 30, 'Knee soft. Trains the knee’s position sense.'],
];
function template(key) {
  const t = TEMPLATES[key] || TEMPLATES.rest;
  if (key !== 'lower' && key !== 'lower2') return t;
  const info = aclInfo();
  if (!info || info.idx >= 3) {
    const ex = (key === 'lower2' ? LEG_B : LEG_A).slice();
    if (info?.a?.graft === 'peroneus') ex.push(key === 'lower2'
      ? ['Single-leg calf raise — operated side', 3, '12-15', 60, 'Peroneus graft: rebuild the ankle that donated the tendon. Slow up, slow down.']
      : ['Band ankle eversion — operated side', 3, '15-20', 45, 'Peroneus graft: turn the foot out against a band. Keeps the ankle stable for cutting.']);
    if (info?.idx >= 3) ex.push(['Bike — easy flush', 1, '8-10 min', 0, 'Easy spin to finish. Keeps the knee happy.']);
    return { ...t, ex, sub: info ? `${info.phase.arc} · ${key === 'lower2' ? 'strength + control' : 'quad strength'}` : 'Legs · Glutes' };
  }
  let ex;
  if (!info) {
    ex = [
      ['Leg press', 4, '8-10', 120, 'Full controlled range.'],
      ['Romanian deadlift', 3, '8-10', 120, 'Hinge at the hips, flat back.'],
      ['Bulgarian split squat', 3, '8 / side', 90, 'Torso tall, front knee over toes.'],
      ['Lying leg curl', 3, '10-12', 60, 'Slow on the way down.'],
      ['Leg extension', 3, '12', 60, 'Pause at the top.'],
      ['Standing calf raise', 4, '12-15', 60, 'Full stretch at the bottom.'],
    ];
  } else {
    ex = info.phase.ex.map(e => {
      const m = e.d.match(/^(\d+)\s*×\s*(.+)$/);
      return m ? [e.n, +m[1], m[2], 45, e.cue] : [e.n, 1, e.d, 0, e.cue];
    });
    ex.push(['Seated calf raise', 3, '15', 60, 'Knee bent and supported.']);
    if (info.idx >= 1) ex.push(['Hip abduction machine', 3, '15', 60, 'Strong hips protect the knee.']);
  }
  return { ...t, ex, sub: info ? `${info.phase.arc} · ${info.phase.title}` : 'Legs · Glutes' };
}
function tplKeyFor(k = dkey()) {
  const d = S.days[k];
  return d?.workout?.tpl || S.split[fromKey(k).getDay()] || 'rest';
}
function workout(k = dkey()) {
  const d = day(k);
  if (!d.workout) d.workout = { tpl: tplKeyFor(k), sets: {}, done: false };
  return d.workout;
}
function exSets(w, e) {
  if (!w.sets[e[0]]) w.sets[e[0]] = Array.from({ length: e[1] }, () => ({ w: S.lastW[e[0]] ?? '', r: '', done: false }));
  return w.sets[e[0]];
}

/* ================= XP / Quests ================= */
function levelInfo(xp) {
  let lvl = 1, need = 100;
  while (xp >= need) { xp -= need; lvl++; need = 100 + (lvl - 1) * 30; }
  return { lvl, into: xp, need };
}
const RANKS = [[50, 'N', 'National Level Hunter'], [38, 'S', 'Shadow Monarch'], [27, 'A', "Monarch's Vanguard"], [18, 'B', 'Shadow Soldier'], [10, 'C', 'Gate Breaker'], [5, 'D', 'Iron Will'], [1, 'E', 'Awakened Hunter']];
function rankOf(l) { const r = RANKS.find(x => l >= x[0]); return { k: r[1], title: r[2] }; }

function questList(k = dkey()) {
  const d = day(k), t = targets(k), tot = totals(k), info = aclInfo(), q = [];
  const meals = new Set(d.foods.map(f => f.meal)).size;
  q.push({ id: 'meals', name: 'Log 3 meals', ic: 'bolt', xp: 30, cur: Math.min(meals, 3), goal: 3, done: meals >= 3 });
  q.push({ id: 'protein', name: 'Hit protein target', ic: 'bolt', xp: 50, cur: r0(tot.p), goal: t.p, unit: 'g', done: tot.p >= t.p * 0.9 });
  q.push({ id: 'kcal', name: 'Calories on target (±10%)', ic: 'flame', xp: 40, cur: r0(tot.kcal), goal: t.kcal, unit: 'kcal', done: tot.kcal >= t.kcal * 0.9 && tot.kcal <= t.kcal * 1.1 });
  q.push({ id: 'water', name: 'Hydration', ic: 'drop', xp: 20, cur: d.water, goal: t.water, unit: 'glasses', done: d.water >= t.water });
  const tk = tplKeyFor(k);
  if (tk !== 'rest') q.push({ id: 'train', name: `Clear the gate: ${TEMPLATES[tk].name}`, ic: tk, xp: 100, done: !!d.workout?.done, go: 'train' });
  else q.push({ id: 'walk', name: 'Recovery: walk or mobility', ic: 'rest', xp: 30, manual: true, done: !!d.manual.walk });
  if (info) {
    const n = info.phase.ex.length, c = d.rehab.done.length;
    q.push({ id: 'rehab', name: `${info.phase.arc}: rehab session`, ic: 'heart', xp: 80, cur: c, goal: n, done: c >= Math.ceil(n * 0.8), go: 'rehab' });
    q.push({ id: 'knee', name: 'Knee check-in', ic: 'heart', xp: 15, done: !!d.knee, go: 'rehab' });
  }
  q.push({ id: 'steps', name: 'Hit 10k steps', ic: 'bolt', xp: 30, cur: d.steps || 0, goal: 10000, done: (d.steps || 0) >= 10000, action: 'open-steps' });
  q.push({ id: 'study', name: 'Study block — 2h deep focus', ic: 'book', xp: 40, manual: true, done: !!d.manual.study });
  q.push({ id: 'checkin', name: 'Morning check-in', ic: 'moon', xp: 15, done: !!d.ready, action: 'open-checkin' });
  q.push({ id: 'sleep', name: 'Slept 7h+ last night', ic: 'moon', xp: 20, done: (d.ready?.sleep || 0) >= 7, action: 'open-checkin' });
  return q;
}
function evaluate(k = dkey()) {
  const d = day(k);
  let delta = 0;
  for (const q of questList(k)) {
    if (q.done && !d.claimed[q.id]) { d.claimed[q.id] = q.xp; delta += q.xp; queueToast('QUEST COMPLETE', q.name, `+${q.xp} XP`); }
    else if (!q.done && d.claimed[q.id]) { delta -= d.claimed[q.id]; delete d.claimed[q.id]; }
  }
  if (delta) addXp(delta);
  save();
}
function addXp(n) {
  const before = levelInfo(S.xp).lvl;
  S.xp = Math.max(0, S.xp + n);
  const after = levelInfo(S.xp);
  if (after.lvl > before) {
    const rk = rankOf(after.lvl);
    queueToast('LEVEL UP', `You reached Level ${after.lvl}`, `${rk.k}-RANK · ${rk.title}`, 'levelup');
    setTimeout(() => burst('level', `LV ${after.lvl}`), 50);
  }
  updateTop();
}
const dayScore = k => Object.keys(S.days[k]?.claimed || {}).length;
function streak() {
  let k = dkey(), n = 0;
  if (dayScore(k) < 4) k = addDays(k, -1);
  while (dayScore(k) >= 4) { n++; k = addDays(k, -1); }
  return n;
}
function stats() {
  let workouts = 0, rehab = 0, study = 0, water = 0, knee = 0, cardio = 0, good = 0;
  for (const d of Object.values(S.days)) {
    const c = d.claimed || {};
    if (c.train) workouts++;
    if (c.rehab) rehab++;
    if (c.study) study++;
    if (c.water) water++;
    if (c.knee) knee++;
    if (c.walk || (c.train && d.workout?.tpl === 'core')) cardio++;
    if (Object.keys(c).length >= 4) good++;
  }
  const info = aclInfo();
  return {
    STR: 10 + workouts * 2 + Object.keys(S.prs).length,
    VIT: 10 + rehab * 2 + knee,
    AGI: 10 + (info ? Math.max(0, info.idx) * 6 : 0) + cardio,
    END: 10 + cardio * 2 + Math.floor(water / 2),
    INT: 10 + study * 2,
    DIS: 10 + good * 2,
  };
}

/* ================= Toasts ================= */
const toastQ = [];
let toastBusy = false;
function queueToast(t, m, x, cls) { toastQ.push({ t, m, x, cls }); if (!toastBusy) nextToast(); }
function toast(t, m) { queueToast(t, m); }
function nextToast() {
  const it = toastQ.shift();
  if (!it) { toastBusy = false; return; }
  toastBusy = true;
  const el = document.createElement('div');
  el.className = 'toast ' + (it.cls || '');
  el.innerHTML = `<div class="tt">[ ${esc(it.t)} ]</div><div class="tm">${esc(it.m)}</div>${it.x ? `<div class="tx">${esc(it.x)}</div>` : ''}`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); nextToast(); }, 280); }, it.cls === 'levelup' ? 2600 : 1600);
}

/* ================= Sheet ================= */
let sheetClose = null;
function openSheet(html, onClose) {
  if (sheetClose) { const f = sheetClose; sheetClose = null; f(); }
  $('#sheetBody').innerHTML = html;
  $('#sheet').hidden = false;
  sheetClose = onClose || null;
  $('.sheet-panel').scrollTop = 0;
}
function closeSheet() {
  $('#sheet').hidden = true;
  $('#sheetBody').innerHTML = '';
  if (sheetClose) { const f = sheetClose; sheetClose = null; f(); }
}

/* ================= Router ================= */
let route = (location.hash || '#home').slice(1);
let lastRoute = null, lastDone = null;
function go(r) { route = r; if (location.hash !== '#' + r) history.replaceState(null, '', '#' + r); render(); window.scrollTo(0, 0); }
function render() {
  document.body.classList.toggle('onboarding', !S.profile);
  if (!S.profile) { $('#view').innerHTML = renderOnboarding(); updateTop(); return; }
  const views = { home: renderHome, fuel: renderFuel, train: renderTrain, rehab: renderRehab, plan: renderPlan };
  if (!views[route]) route = 'home';
  const entering = route !== lastRoute; lastRoute = route;
  const view = $('#view');
  view.innerHTML = views[route]();
  view.classList.toggle('enter', entering);
  $$('.tab').forEach((t, i) => { const on = t.dataset.go === route; t.classList.toggle('active', on); if (on) $('#tabbar').style.setProperty('--ti', i); });
  updateTop();
  afterRender();
  motion(entering);
}
function updateTop() {
  const rk = rankOf(levelInfo(S.xp).lvl);
  const el = $('#topRank');
  el.textContent = rk.k === 'N' ? 'NL' : rk.k;
  el.className = 'rank-chip ' + rk.k;
}
function afterRender() {
  if (route === 'rehab') {
    const r = $('#kp');
    if (r) { const out = $('#kpv'); r.oninput = () => { out.textContent = r.value; }; }
  }
}

/* ================= Shared UI ================= */
function bar(cur, goal, cls = '') {
  const pct = goal ? clamp((cur / goal) * 100, 0, 100) : 0;
  const over = goal && cur > goal * 1.1 ? ' over' : '';
  return `<div class="bar ${cls}${over}" role="progressbar" aria-valuenow="${r0(cur)}" aria-valuemax="${r0(goal)}"><i style="width:${pct}%"></i></div>`;
}
function ring(cur, goal) {
  const R = 56, C = 2 * Math.PI * R, pct = goal ? clamp(cur / goal, 0, 1) : 0;
  const left = goal - cur, over = left < 0;
  return `<div class="ring"><svg viewBox="0 0 132 132" aria-hidden="true">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3df5a7"/><stop offset="1" stop-color="#3df5a7"/></linearGradient></defs>
    <circle cx="66" cy="66" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="12"/>
    <circle cx="66" cy="66" r="${R}" fill="none" stroke="${over ? '#ff453a' : 'url(#rg)'}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" class="arc" style="--c:${C}"/>
  </svg><div class="center"><div class="num" data-count="${r0(Math.abs(left))}">${r0(Math.abs(left))}</div><div class="lbl">${over ? 'KCAL OVER' : 'KCAL LEFT'}</div></div></div>`;
}
function lineChart(pts, { unit = '', color = '#3df5a7', target = null } = {}) {
  if (pts.length < 2) return `<div class="empty">Log at least two entries to see the trend.</div>`;
  const W = 340, H = 140, P = 26;
  const ys = pts.map(p => p.y).concat(target != null ? [target] : []);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (min === max) { min -= 1; max += 1; }
  const pad2 = (max - min) * 0.15; min -= pad2; max += pad2;
  const x = i => P + (i * (W - P * 2)) / (pts.length - 1);
  const y = v => H - P + 6 - ((v - min) / (max - min)) * (H - P * 1.6);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join('');
  const area = `${path}L${x(pts.length - 1)},${H - P + 6}L${x(0)},${H - P + 6}Z`;
  const last = pts[pts.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend chart">
    <defs><linearGradient id="lg${color.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".3"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${target != null ? `<line x1="${P}" x2="${W - P}" y1="${y(target)}" y2="${y(target)}" stroke="#8e8e93" stroke-dasharray="4 4" stroke-width="1"/><text x="${W - P}" y="${y(target) - 4}" text-anchor="end">target ${target}${unit}</text>` : ''}
    <path d="${area}" fill="url(#lg${color.slice(1)})"/>
    <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="${x(pts.length - 1)}" cy="${y(last.y)}" r="4" fill="${color}"/>
    <text x="${P}" y="${H - 4}">${esc(pts[0].label)}</text><text x="${W - P}" y="${H - 4}" text-anchor="end">${esc(last.label)} · ${last.y}${unit}</text>
  </svg>`;
}
function barChart(vals, target) {
  const W = 340, H = 140, P = 22, max = Math.max(target * 1.25, ...vals.map(v => v.y), 1);
  const bw = (W - P * 2) / vals.length;
  const y = v => H - P - (v / max) * (H - P * 2);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calories, last 7 days">
    <line x1="${P}" x2="${W - P}" y1="${y(target)}" y2="${y(target)}" stroke="#8e8e93" stroke-dasharray="4 4"/>
    ${vals.map((v, i) => {
      const hit = v.y >= target * 0.9 && v.y <= target * 1.1;
      return `<rect x="${P + i * bw + bw * 0.2}" y="${y(v.y)}" width="${bw * 0.6}" height="${Math.max(0, H - P - y(v.y))}" rx="4" fill="${v.y > target * 1.1 ? '#ff453a' : hit ? '#3df5a7' : '#3a3b40'}" opacity="${v.y ? 0.9 : 0.25}"/>
      <text x="${P + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${v.label}</text>`;
    }).join('')}
  </svg>`;
}
function seg(id, opts, val) {
  return `<input type="hidden" id="${id}" value="${esc(val)}"><div class="seg">${opts.map(([v, l]) => `<button type="button" data-action="seg" data-for="${id}" data-val="${esc(v)}" class="${String(v) === String(val) ? 'on' : ''}">${esc(l)}</button>`).join('')}</div>`;
}
const val = id => $('#' + id)?.value?.trim() ?? '';

/* ================= Onboarding / profile ================= */
function profileForm(p = {}) {
  const a = p.acl || { status: 'postop', date: '', graft: 'unknown' };
  return `
  <label for="pf_name">Hunter name</label><input id="pf_name" value="${esc(p.name || '')}" placeholder="Your name">
  <label>Sex</label>${seg('pf_sex', [['m', 'Male'], ['f', 'Female']], p.sex || 'm')}
  <div class="grid3">
    <div><label for="pf_age">Age</label><input id="pf_age" type="number" inputmode="numeric" value="${p.age || ''}" placeholder="21"></div>
    <div><label for="pf_h">Height cm</label><input id="pf_h" type="number" inputmode="decimal" value="${p.height || ''}" placeholder="178"></div>
    <div><label for="pf_w">Weight kg</label><input id="pf_w" type="number" inputmode="decimal" value="${p.weight || ''}" placeholder="75"></div>
  </div>
  <label for="pf_act">Activity</label><select id="pf_act">${ACTIVITY.map(([v, l]) => `<option value="${v}" ${+p.activity === v || (!p.activity && v === 1.55) ? 'selected' : ''}>${l}</option>`).join('')}</select>
  <label>Goal</label>${seg('pf_goal', Object.entries(GOALS).map(([k, g]) => [k, g.label]), p.goal || 'recomp')}
  <div class="grid2"><div><label for="pf_tw">Target weight kg</label><input id="pf_tw" type="number" inputmode="decimal" value="${p.targetWeight || ''}" placeholder="optional"></div>
  <div><label for="pf_dl">Goal deadline</label><input id="pf_dl" type="date" value="${esc(p.deadline || '')}"></div></div>
  <div class="hr"></div>
  <label for="pf_acl">ACL status</label>
  <select id="pf_acl">
    <option value="postop" ${a.status === 'postop' ? 'selected' : ''}>Had ACL surgery (reconstruction)</option>
    <option value="preop" ${a.status === 'preop' ? 'selected' : ''}>Waiting for surgery (prehab)</option>
    <option value="nonop" ${a.status === 'nonop' ? 'selected' : ''}>Non-surgical rehab</option>
    <option value="none" ${a.status === 'none' ? 'selected' : ''}>No knee injury</option>
  </select>
  <label for="pf_date">Surgery date (or injury date if no surgery)</label><input id="pf_date" type="date" value="${esc(a.date || '')}">
  <label for="pf_graft">Graft type</label>
  <select id="pf_graft">${[['unknown', "Don't know"], ['patellar', 'Patellar tendon (BTB)'], ['hamstring', 'Hamstring'], ['quad', 'Quadriceps tendon'], ['peroneus', 'Peroneus longus (from the ankle)'], ['allograft', 'Donor (allograft)']].map(([v, l]) => `<option value="${v}" ${a.graft === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
}
function readProfileForm(prev = {}) {
  const p = {
    ...prev,
    name: val('pf_name') || 'Hunter', sex: val('pf_sex'), age: +val('pf_age'), height: +val('pf_h'), weight: +val('pf_w'),
    activity: +val('pf_act'), goal: val('pf_goal'), targetWeight: +val('pf_tw') || null, deadline: val('pf_dl') || null,
    acl: { ...(prev.acl || {}), status: val('pf_acl'), date: val('pf_date'), graft: val('pf_graft') },
  };
  if (!p.age || !p.height || !p.weight) { toast('SYSTEM', 'Age, height and weight are required.'); return null; }
  return p;
}
function renderOnboarding() {
  return `<div class="onboard-hero"><div class="sys-msg">[ SYSTEM ] YOU HAVE BEEN CHOSEN</div><h1>ARISE</h1>
    <p>The System needs your data to build your quests, your fuel targets and your recovery arc.</p></div>
    <div class="panel sys">${profileForm()}
    <button class="btn primary block" style="margin-top:18px" data-action="ob-submit">Accept the System</button></div>
    <label class="btn block" style="margin:0 0 24px;color:var(--text);font-size:15px;text-transform:none;letter-spacing:0">${ic('download')} Restore from backup file<input type="file" accept="application/json,.json" data-change="import" hidden></label>`;
}


/* ================= Week helpers ================= */
const weekStart = (k = dkey()) => addDays(k, -((fromKey(k).getDay() - 6 + 7) % 7)); // Saturday
const weekDays = (k = dkey()) => Array.from({ length: 7 }, (_, i) => addDays(weekStart(k), i));

/* ================= Theme ================= */
function applyTheme() {
  const t = S.settings?.theme || 'black';
  document.documentElement.dataset.theme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = '#000000';
}

/* ================= Boss fights (weekly) ================= */
const BOSSES = [
  { id: 'warden', name: 'The Protein Warden', title: 'Keeper of the Iron Gate', goal: 6, unit: 'days hitting protein',
    calc: ws => ws.filter(k => S.days[k] && totals(k).p >= targets(k).p * 0.9).length },
  { id: 'colossus', name: 'The Leg-Day Colossus', title: 'Guardian of the Broken Knee', goal: 2, unit: 'leg days cleared',
    calc: ws => ws.filter(k => ['lower', 'lower2'].includes(S.days[k]?.workout?.tpl) && S.days[k]?.workout?.done).length },
  { id: 'serpent', name: 'The Step Serpent', title: 'Coiled Around the Campus', goal: 70000, unit: 'steps',
    calc: ws => ws.reduce((a, k) => a + (S.days[k]?.steps || 0), 0) },
  { id: 'night', name: 'The Night Knight', title: 'Lord of Lost Sleep', goal: 5, unit: 'nights of 7h+ sleep',
    calc: ws => ws.filter(k => ((S.days[k]?.band?.sleep) || (S.days[k]?.ready?.sleep) || 0) >= 7).length },
  { id: 'ledger', name: 'The Ledger Wraith', title: 'Devourer of Unlogged Meals', goal: 6, unit: 'days with 3 meals logged',
    calc: ws => ws.filter(k => new Set((S.days[k]?.foods || []).map(f => f.meal)).size >= 3).length },
  { id: 'gatekeeper', name: 'The Gatekeeper of Iron', title: 'Warden of Five Gates', goal: 5, unit: 'workouts cleared',
    calc: ws => ws.filter(k => S.days[k]?.workout?.done).length },
];
function bossOfWeek(k = dkey()) {
  const n = Math.floor(fromKey(weekStart(k)).getTime() / (7 * 864e5));
  const b = BOSSES[((n % BOSSES.length) + BOSSES.length) % BOSSES.length];
  const ws = weekDays(k), cur = b.calc(ws), pct = clamp(cur / b.goal, 0, 1);
  return { ...b, cur, pct, hp: Math.round((1 - pct) * 100), week: weekStart(k), slain: pct >= 1, claimed: !!S.bosses?.[weekStart(k)] };
}
function bossEmblem(id) {
  const P = {
    warden: '<path d="M32 6 54 16v14c0 14-9 24-22 28C19 54 10 44 10 30V16Z"/><path d="M22 30h20M32 20v20"/>',
    colossus: '<path d="M20 58V34l-6-8 8-16h20l8 16-6 8v24"/><circle cx="26" cy="22" r="2"/><circle cx="38" cy="22" r="2"/><path d="M26 34h12"/>',
    serpent: '<path d="M12 46c8 8 20 8 24 0s-4-14 4-20 16 2 14 10"/><circle cx="50" cy="30" r="2"/><path d="M8 48l6-4"/>',
    night: '<path d="M40 10a22 22 0 1 0 14 34A18 18 0 0 1 40 10Z"/><path d="M18 40l4-4 4 4-4 4Z"/>',
    ledger: '<path d="M16 8h26l8 8v40H16Z"/><path d="M22 24h20M22 32h20M22 40h12"/><path d="M42 8v8h8"/>',
    gatekeeper: '<path d="M14 58V22l18-14 18 14v36"/><path d="M24 58V34h16v24"/><path d="M14 30h36"/>',
  };
  return `<svg class="boss-emblem" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[id] || P.gatekeeper}</svg>`;
}
function bossCard() {
  const b = bossOfWeek();
  const left = Math.max(0, b.goal - b.cur);
  return `<div class="panel boss-card ${b.slain ? 'slain' : ''}">
    <div class="boss-top">${bossEmblem(b.id)}
      <div class="spacer"><div class="boss-k">Weekly boss · ends Friday</div><div class="boss-n">${esc(b.name)}</div><div class="boss-t">${esc(b.title)}</div></div></div>
    <div class="boss-hp"><i style="width:${b.hp}%"></i></div>
    <div class="row between small" style="margin-top:6px"><span class="muted">${b.unit === 'steps' ? b.cur.toLocaleString('en') : b.cur} / ${b.unit === 'steps' ? b.goal.toLocaleString('en') : b.goal} ${esc(b.unit)}</span><span class="boss-hpn">${b.slain ? 'DEFEATED' : `HP ${b.hp}%`}</span></div>
    ${b.slain && !b.claimed ? `<button class="btn primary block" style="margin-top:12px" data-action="boss-claim">Claim victory · +300 XP</button>`
      : b.slain ? `<div class="ready-tip zone-go"><b>ENEMY FELLED</b>Reward claimed. A new boss rises on Saturday.</div>`
      : `<div class="small muted" style="margin-top:6px">${b.unit === 'steps' ? left.toLocaleString('en') : left} more to bring it down.</div>`}
  </div>`;
}

/* ================= University attendance ================= */
// A schedule event of type "uni" can carry subject + kind (Lecture / Section).
function uniSubjects() {
  const map = {};
  for (const e of S.schedule.filter(x => x.type === 'uni')) {
    const name = (e.subject || e.title).trim();
    if (!map[name]) map[name] = { name, events: [] };
    map[name].events.push(e);
  }
  const weeks = S.uni?.termWeeks || 14, rule = S.uni?.rule ?? 0.25;
  return Object.values(map).map(m => {
    const perWeek = m.events.reduce((a, e) => a + e.days.length, 0);
    const total = weeks * perWeek;
    return { ...m, perWeek, total, limit: S.uni?.limits?.[m.name] ?? Math.floor(total * rule), base: S.uni?.base?.[m.name] || 0 };
  }).sort((a, b) => (b.base / (b.limit || 1)) - (a.base / (a.limit || 1)));
}
const attKey = (k, id) => `${k}|${id}`;
function attStats(sub) {
  const ids = new Set(sub.events.map(e => e.id)), byKind = { Lecture: { a: 0, p: 0 }, Section: { a: 0, p: 0 } };
  for (const [key, v] of Object.entries(S.attend || {})) {
    const id = key.split('|')[1];
    if (!ids.has(id)) continue;
    const ev = sub.events.find(e => e.id === id), kind = ev?.kind === 'Section' ? 'Section' : 'Lecture';
    if (v === 'absent') byKind[kind].a++; else if (v === 'present') byKind[kind].p++;
  }
  return byKind;
}
function attendButtons(k, id) {
  const v = S.attend?.[attKey(k, id)];
  return `<span class="att">
    <button class="att-b ${v === 'present' ? 'on ok' : ''}" data-action="att" data-k="${k}" data-id="${id}" data-v="present" aria-label="Attended">${ic('check')}</button>
    <button class="att-b ${v === 'absent' ? 'on bad' : ''}" data-action="att" data-k="${k}" data-id="${id}" data-v="absent" aria-label="Absent">${ic('x')}</button></span>`;
}
function planUni() {
  const subs = uniSubjects(), k = dkey();
  const exams = (S.exams || []).filter(x => x.date >= k).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  const past = (S.exams || []).filter(x => x.date < k).slice(-4);
  const daysTo = d => Math.round((fromKey(d) - fromKey(k)) / 864e5);
  return `<div class="panel sys"><div class="panel-title">Midterms & exams <small><button class="chip" data-action="exam-new">${ic('plus')} Add</button></small></div>
    ${exams.length ? exams.map(x => `<div class="exam-row" data-action="exam-edit" data-id="${x.id}" role="button" tabindex="0">
      <div class="exam-d"><b>${daysTo(x.date) === 0 ? 'TODAY' : daysTo(x.date)}</b><span>${daysTo(x.date) === 0 ? '' : daysTo(x.date) === 1 ? 'day' : 'days'}</span></div>
      <div class="spacer"><div class="nm">${esc(x.subject)}</div><div class="sub">${esc(fmtDate(x.date))}${x.time ? ` · ${esc(x.time)}` : ''}${x.loc ? ` · ${esc(x.loc)}` : ''}</div></div>${ic('right')}</div>`).join('')
      : `<div class="empty">No exams added yet. Send your midterm table and they land here with a countdown.</div>`}
    ${past.length ? `<div class="small muted" style="margin-top:8px">Done: ${past.map(x => esc(x.subject)).join(' · ')}</div>` : ''}</div>
  <div class="panel"><div class="panel-title">Attendance <small>25% rule · tap a count to fix it</small></div>
    ${subs.length ? subs.map(sub => {
      const st = attStats(sub), abs = sub.base + st.Lecture.a + st.Section.a, left = sub.limit - abs;
      const risk = left <= 0 ? 'late' : left <= 3 ? 'soon' : '';
      return `<div class="att-sub">
        <div class="row between"><div class="nm">${esc(sub.name)}</div><button class="due ${risk}" data-action="att-base" data-s="${esc(sub.name)}">${abs} / ${sub.limit} absences</button></div>
        <div class="small muted">${sub.perWeek} sessions/week · ~${sub.total} this term · ${Math.max(0, left)} absence${left === 1 ? '' : 's'} left before the 25% ban</div>
        ${bar(abs, sub.limit, risk ? 'p' : 'c')}
        ${risk === 'late' ? `<div class="penalty" style="margin-top:8px"><b>NO ABSENCES LEFT</b>One more and you can be barred from the ${esc(sub.name.split(' ·')[0])} final. Attend every session.</div>` : risk === 'soon' ? `<div class="small" style="color:var(--orange);margin-top:6px">Danger zone — treat every session as mandatory.</div>` : ''}
      </div>`;
    }).join('') : `<div class="empty">Add your lectures and sections in Week (type: University, with the subject name) and attendance tracking starts automatically.</div>`}
  </div>
  <div class="panel"><div class="panel-title">This week</div>
    ${weekDays().map(dk => {
      const wd = fromKey(dk).getDay(), evs = S.schedule.filter(e => e.type === 'uni' && e.days.includes(wd)).sort((a, b) => toMin(a.start) - toMin(b.start));
      if (!evs.length) return '';
      return `<div class="week-day ${dk === k ? 'today' : ''}"><h4><span>${DAY_NAMES[wd].toUpperCase()} · ${esc(fmtDate(dk))}</span></h4>
        ${evs.map(e => `<div class="agenda-item"><div class="agenda-time">${e.start}</div><span class="agenda-bar" style="--ev:${EVENT_TYPES.uni.color}"></span>
          <div class="spacer"><div class="nm">${esc(e.subject || e.title)}</div><div class="sub">${esc(e.kind || 'Lecture')}${e.loc ? ' · ' + esc(e.loc) : ''}</div></div>${dk <= k ? attendButtons(dk, e.id) : ''}</div>`).join('')}</div>`;
    }).join('') || `<div class="empty">No university sessions this week.</div>`}
  </div>`;
}
function openExam(id) {
  const x = (S.exams || []).find(e => e.id === id) || { subject: '', date: dkey(), time: '', loc: '' };
  openSheet(`<h2>${id ? 'Edit' : 'New'} exam</h2>
    <label for="ex_s">Subject</label><input id="ex_s" value="${esc(x.subject)}" placeholder="e.g. Anatomy midterm">
    <div class="grid2"><div><label for="ex_d">Date</label><input id="ex_d" type="date" value="${esc(x.date)}"></div><div><label for="ex_t">Time</label><input id="ex_t" type="time" value="${esc(x.time)}"></div></div>
    <label for="ex_l">Place</label><input id="ex_l" value="${esc(x.loc)}" placeholder="Hall / building">
    <button class="btn primary block" style="margin-top:16px" data-action="exam-save" data-id="${id || ''}">Save</button>
    ${id ? `<button class="btn danger block" style="margin-top:8px" data-action="exam-del" data-id="${id}">Delete</button>` : ''}`);
}

/* ================= Progress photos (IndexedDB, phone only) ================= */
const PH = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('arise-photos', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('p', { keyPath: 'id' });
      r.onsuccess = () => { this.db = r.result; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  async all() { const db = await this.open(); return new Promise(res => { const q = db.transaction('p').objectStore('p').getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); }); },
  async put(o) { const db = await this.open(); return new Promise(res => { const t = db.transaction('p', 'readwrite'); t.objectStore('p').put(o); t.oncomplete = res; }); },
  async del(id) { const db = await this.open(); return new Promise(res => { const t = db.transaction('p', 'readwrite'); t.objectStore('p').delete(id); t.oncomplete = res; }); },
};
let photoPose = 'front', photoUrls = [];
function shrink(file, max = 1080) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => b ? res(b) : rej(new Error('encode')), 'image/jpeg', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Could not read the photo')); };
    img.src = url;
  });
}
async function openPhotos() {
  photoUrls.forEach(u => URL.revokeObjectURL(u)); photoUrls = [];
  let list = [];
  try { list = (await PH.all()).filter(p => p.pose === photoPose).sort((a, b) => a.date.localeCompare(b.date)); } catch (e) { /* private mode */ }
  const url = b => { const u = URL.createObjectURL(b); photoUrls.push(u); return u; };
  const first = list[0], last = list[list.length - 1];
  openSheet(`<h2>Progress photos</h2><p class="small muted" style="margin-top:0">Stored only on this phone. Same spot, same light, same time of day — once a week.</p>
    <div class="seg" style="margin-bottom:12px">${[['front', 'Front'], ['side', 'Side'], ['back', 'Back']].map(([k, l]) => `<button class="${photoPose === k ? 'on' : ''}" data-action="photo-pose" data-p="${k}">${l}</button>`).join('')}</div>
    <label class="btn primary block" style="margin:0 0 14px;color:var(--accent-ink);text-transform:none;letter-spacing:0">${ic('plus')} Add ${photoPose} photo<input type="file" accept="image/*" data-change="photo-add" hidden></label>
    ${list.length >= 2 ? `<div class="cmp" style="--pos:50%">
        <img src="${url(last.blob)}" alt="${esc(last.date)}"><div class="cmp-top"><img src="${url(first.blob)}" alt="${esc(first.date)}"></div>
        <span class="cmp-l">${esc(fmtDate(first.date))}</span><span class="cmp-r">${esc(fmtDate(last.date))}</span><i class="cmp-line"></i>
        <input class="cmp-range" type="range" min="0" max="100" value="50" aria-label="Compare before and after"></div>
      <p class="small muted" style="text-align:center;margin:6px 0 14px">Drag to compare first vs latest.</p>` : list.length === 1 ? `<p class="small muted">One photo saved. Add another next week to unlock the before / after slider.</p>` : ''}
    <div class="ph-grid">${list.slice().reverse().map(p => `<div class="ph"><img src="${url(p.blob)}" alt="${esc(p.date)}" loading="lazy"><span>${esc(fmtDate(p.date))}</span><button class="x" data-action="photo-del" data-id="${p.id}" aria-label="Delete photo">${ic('x')}</button></div>`).join('')}</div>`,
    () => { photoUrls.forEach(u => URL.revokeObjectURL(u)); photoUrls = []; });
}

/* ================= Profile & gear ================= */
const GEAR_TYPES = [['shoes', 'Shoes'], ['glasses', 'Glasses'], ['watch', 'Watch'], ['other', 'Other']];
function defaultGear() {
  return [
    { id: uid(), type: 'shoes', name: 'Adidas Adizero Evo SL', note: 'Running / speed shoe', km: 0, max: 600 },
    { id: uid(), type: 'watch', name: 'Xiaomi Smart Band 10', note: 'Steps · sleep · heart rate', km: null, max: null },
    { id: uid(), type: 'glasses', name: 'Glasses', note: '', km: null, max: null },
  ];
}
function openProfile() {
  const p = S.profile || {}, me = S.me || {}, li = levelInfo(S.xp), rk = rankOf(li.lvl);
  if (!S.gear) { S.gear = defaultGear(); save(); }
  const gearRow = g => {
    const pct = g.max ? clamp((g.km || 0) / g.max, 0, 1) : null;
    return `<div class="gear">
      <span class="tmpl-ic">${ic(g.type === 'shoes' ? 'bolt' : g.type === 'watch' ? 'heart' : g.type === 'glasses' ? 'search' : 'plus')}</span>
      <div class="spacer"><div class="nm">${esc(g.name)}</div><div class="sub">${esc(g.note || GEAR_TYPES.find(t => t[0] === g.type)?.[1] || '')}${g.max ? ` · ${r0(g.km || 0)} / ${g.max} km` : ''}</div>
        ${pct != null ? bar(g.km || 0, g.max, pct > 0.85 ? 'p' : '') : ''}
        ${pct != null && pct > 0.85 ? `<div class="small" style="color:var(--orange);margin-top:4px">Foam is near the end — plan a new pair.</div>` : ''}</div>
      ${g.max ? `<button class="btn sm" data-action="gear-km" data-id="${g.id}">+ km</button>` : ''}
      <button class="x" data-action="gear-del" data-id="${g.id}" aria-label="Remove ${esc(g.name)}">${ic('x')}</button></div>`;
  };
  openSheet(`<div class="prof-head"><div class="rank-badge ${rk.k}">${rk.k}</div><div><div class="status-name">${esc(p.name || 'Hunter')}</div><div class="status-title">${esc(rk.title)} · LV ${li.lvl}</div>
      ${me.motto ? `<div class="small muted" style="margin-top:2px">“${esc(me.motto)}”</div>` : ''}</div></div>
    <div class="panel"><div class="panel-title">My style</div>
      <div class="grid2">
        <div><label for="me_player">Favourite player</label><input id="me_player" value="${esc(me.player || '')}" placeholder="e.g. Ronaldo"></div>
        <div><label for="me_club">Club</label><input id="me_club" value="${esc(me.club || '')}" placeholder="e.g. Real Madrid"></div>
        <div><label for="me_anime">Anime character</label><input id="me_anime" value="${esc(me.anime || '')}" placeholder="e.g. Thorfinn"></div>
        <div><label for="me_pos">Position</label><input id="me_pos" value="${esc(me.pos || 'Winger')}"></div>
      </div>
      <label for="me_love">Loves</label><input id="me_love" value="${esc(me.love || '')}" placeholder="things you love">
      <label for="me_hate">Hates</label><input id="me_hate" value="${esc(me.hate || '')}" placeholder="things you can’t stand">
      <label for="me_motto">Motto</label><input id="me_motto" value="${esc(me.motto || '')}" placeholder="one line that pushes you">
      <button class="btn primary block" style="margin-top:14px" data-action="me-save">Save</button></div>
    <div class="panel"><div class="panel-title">Gear <small><button class="chip" data-action="gear-new">${ic('plus')} Add</button></small></div>${S.gear.map(gearRow).join('')}
      <p class="small muted" style="margin-bottom:0">Running shoes like the Evo SL lose their bounce after a few hundred km — log runs to know when.</p></div>
    <div class="panel"><div class="panel-title">Theme</div>
      <div class="seg">${[['black', 'Premium black'], ['fantasy', 'Dark fantasy']].map(([k, l]) => `<button class="${(S.settings.theme || 'black') === k ? 'on' : ''}" data-action="theme" data-t="${k}">${l}</button>`).join('')}</div></div>
    <button class="btn block" data-action="open-photos">${ic('plus')} Progress photos</button>`);
}
function openGearNew() {
  openSheet(`<h2>Add gear</h2>
    <label for="gr_n">Name</label><input id="gr_n" placeholder="e.g. Nike Mercurial (turf)">
    <label>Type</label>${seg('gr_t', GEAR_TYPES, 'shoes')}
    <label for="gr_note">Note</label><input id="gr_note" placeholder="optional">
    <label for="gr_max">Track mileage up to (km)</label><input id="gr_max" type="number" inputmode="numeric" placeholder="e.g. 600 for running shoes · empty = no tracking">
    <button class="btn primary block" style="margin-top:16px" data-action="gear-save">Save</button>`);
}

/* ================= HOME ================= */
let quoteShift = 0;
function quoteOfDay() {
  const n = Math.floor(fromKey(dkey()).getTime() / 864e5);
  return LEGENDS[(((n + quoteShift) % LEGENDS.length) + LEGENDS.length) % LEGENDS.length];
}
const RARITY = { anime: 'Mythic', football: 'Legendary', basketball: 'Legendary', f1: 'Epic', combat: 'Epic' };
function quoteCard(q, extra = '') {
  const no = LEGENDS.indexOf(q) + 1, init = (q.by || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `<div class="panel quote legend-card lcard cat-${q.cat} ${extra}">
    <div class="lc-top"><span class="lc-no">No. ${String(no).padStart(2, '0')} / ${LEGENDS.length}</span><span class="lc-rar">${RARITY[q.cat] || 'Rare'}</span></div>
    <div class="lc-body"><div class="lc-mono" aria-hidden="true"><span>${esc(init)}</span></div>
      <div class="spacer"><div class="qby">${esc(q.by)}</div><div class="qfrom">${esc(q.from)}</div></div></div>
    <div class="qt">“${esc(q.q)}”</div><div class="qa ar">${esc(q.ar)}</div></div>`;
}
/* ================= Readiness · steps · cut trend · muscle volume ================= */
function rhrBase(k) {
  const xs = Array.from({ length: 21 }, (_, i) => S.days[addDays(k, -i - 1)]?.band?.rhr).filter(Boolean);
  return xs.length >= 3 ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}
function readiness(k = dkey()) {
  const r = S.days[k]?.ready;
  if (!r) return null;
  const band = S.days[k]?.band || {};
  const sleep = band.sleep || r.sleep;
  let score = clamp(sleep / 8, 0, 1) * 35 + ((r.q - 1) / 4) * 20 + ((5 - r.sore) / 4) * 15 + ((10 - r.knee) / 10) * 15 + ((r.energy - 1) / 4) * 15;
  const base = rhrBase(k);
  if (band.rhr && base) { const dlt = band.rhr - base; if (dlt > 2) score -= Math.min(20, (dlt - 2) * 3); else if (dlt < -2) score += 4; }
  score = Math.round(clamp(score, 0, 100));
  let zone, tip;
  if (score >= 70) { zone = 'go'; tip = 'Green light. Train heavy and chase a rep PR.'; }
  else if (score >= 45) { zone = 'mid'; tip = 'Train normally. Keep the loads, skip extra sets and PR attempts.'; }
  else { zone = 'low'; tip = 'Recovery day. Easy bike, rehab work and steps only. Sleep early.'; }
  if (r.knee >= 4) tip = 'Knee is talking. No impact today: bike, rehab and upper body only. Ice + elevate if swollen.';
  return { score, zone, tip, r };
}
function wAvg(fromK, toK) {
  const xs = S.weights.filter(w => w.date >= fromK && w.date <= toK).map(w => +w.kg);
  return xs.length ? { v: xs.reduce((a, b) => a + b, 0) / xs.length, n: xs.length } : null;
}
function cutTrend() {
  const p = S.profile, today = dkey();
  const cur = wAvg(addDays(today, -6), today), prev = wAvg(addDays(today, -13), addDays(today, -7));
  const first = [...S.weights].sort((a, b) => a.date.localeCompare(b.date))[0];
  const deadline = p.deadline || null;
  const daysLeft = deadline ? Math.max(0, Math.round((fromKey(deadline) - fromKey(today)) / 864e5)) : null;
  let rate = null, pct = null, proj = null, status = 'wait', advice = 'Weigh in every morning after the bathroom. The trend unlocks after 2 weeks of data.';
  if (cur && prev && cur.n >= 3 && prev.n >= 3) {
    rate = cur.v - prev.v; pct = (rate / prev.v) * 100;
    if (daysLeft != null) proj = cur.v + rate * (daysLeft / 7);
    const cutting = ['acut', 'cut'].includes(p.goal);
    if (cutting) {
      if (pct < -1.2) { status = 'fast'; advice = 'Losing too fast — muscle at risk. Add ~150 kcal of carbs on training days.'; }
      else if (pct <= -0.5) { status = 'good'; advice = 'Right in the zone. Change nothing.'; }
      else { status = 'slow'; advice = 'Slower than planned. Tighten logging first, then add 2k steps a day or drop 150 kcal.'; }
    } else { status = 'good'; advice = 'Trend is tracking. Keep logging.'; }
  }
  // Adaptive maintenance (MacroFactor-style): intake minus energy stored/lost, over 14 days
  let tdee = null;
  const logged = Array.from({ length: 14 }, (_, i) => addDays(today, -i - 1)).filter(kk => S.days[kk]?.foods?.length);
  if (logged.length >= 10 && rate != null) {
    const avgIn = logged.reduce((a, kk) => a + totals(kk).kcal, 0) / logged.length;
    tdee = Math.round((avgIn - (rate * 7700) / 7) / 10) * 10;
  }
  return { cur, first, rate, pct, proj, status, advice, daysLeft, deadline, tdee };
}
const MUSCLES = [
  ['Chest', /bench|chest press|fly|dip|push-?up/i],
  ['Back', /row|pulldown|pull-?up|chin/i],
  ['Shoulders', /shoulder press|lateral|arnold|overhead press|face pull|rear delt/i],
  ['Biceps', /curl(?!.*leg)|hammer/i],
  ['Triceps', /tricep|pushdown|skull|dip|close.?grip/i],
  ['Quads', /squat|leg press|leg extension|lunge|step|quad|wall sit|tke|terminal knee/i],
  ['Hamstrings', /leg curl|romanian|rdl|hamstring|nordic/i],
  ['Glutes', /hip thrust|bridge|abduction|glute|split squat|lunge/i],
  ['Calves', /calf/i],
  ['Core', /plank|crunch|core|dead bug|pallof|leg raise|ab wheel|hollow/i],
];
function muscleVolume(days = 7) {
  const out = Object.fromEntries(MUSCLES.map(m => [m[0], 0]));
  for (let i = 0; i < days; i++) {
    const sets = S.days[addDays(dkey(), -i)]?.workout?.sets || {};
    for (const [name, arr] of Object.entries(sets)) {
      const n = (arr || []).filter(s => s.done).length;
      if (!n) continue;
      for (const [m, re] of MUSCLES) if (re.test(name)) out[m] += n;
    }
  }
  return out;
}
function miniRing(pct, color, value, label, action) {
  const R = 30, C = 2 * Math.PI * R, p = clamp(pct, 0, 1);
  return `<button class="mring" data-action="${action}" aria-label="${esc(label)} ${esc(value)}">
    <svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="7"/>
    <circle cx="36" cy="36" r="${R}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}" transform="rotate(-90 36 36)" class="arc" style="--c:${C}"/></svg>
    <span class="mv">${value}</span><span class="ml">${label}</span></button>`;
}
function greeting() { const h = new Date().getHours(); return h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }

function renderHome() {
  const k = dkey(), d = day(k), t = targets(), tot = totals(k), li = levelInfo(S.xp), rk = rankOf(li.lvl), st = stats(), qs = questList(k);
  const done = qs.filter(q => q.done).length, sk = streak();
  const late = new Date().getHours() >= 21 && done < 4;
  const ag = agenda(k).slice(0, 4);
  const nextExam = (S.exams || []).filter(x => x.date >= k).sort((a, b) => a.date.localeCompare(b.date))[0];
  const q = quoteOfDay(), rd = readiness(k), ct = cutTrend(), steps = d.steps || 0;
  const zoneColor = rd ? { go: 'var(--green)', mid: 'var(--gold)', low: 'var(--red)' }[rd.zone] : 'var(--dim)';
  const tk = tplKeyFor(k), tpl = template(tk);
  return `
  <div class="hello">
    <div><div class="hello-date">${esc(fmtDate(k))}</div><div class="hello-name">${greeting()}, ${esc(S.profile.name)}</div></div>
    <div class="lvl-pill" aria-label="Level ${li.lvl}, ${rk.k} rank"><b>LV ${li.lvl}</b><span>${rk.k}-RANK</span></div>
  </div>

  <div class="panel sys today-card">
    <div class="mrings">
      ${miniRing(rd ? rd.score / 100 : 0, zoneColor, rd ? rd.score + '%' : '—', 'Readiness', 'open-checkin')}
      ${miniRing(t.kcal ? tot.kcal / t.kcal : 0, tot.kcal > t.kcal * 1.1 ? 'var(--red)' : 'var(--accent)', r0(Math.max(0, t.kcal - tot.kcal)), 'kcal left', 'go-fuel')}
      ${miniRing(steps / 10000, 'var(--blue)', steps >= 1000 ? r1(steps / 1000) + 'k' : steps, 'Steps', 'open-steps')}
    </div>
    ${rd ? `<div class="ready-tip zone-${rd.zone}"><b>${rd.zone === 'go' ? 'PRIMED' : rd.zone === 'mid' ? 'STEADY' : 'RECOVER'}</b>${esc(rd.tip)}</div>`
      : `<button class="btn primary block" style="margin-top:14px" data-action="open-checkin">${ic('moon')} Morning check-in · 20 seconds</button>`}
    <div class="row" style="margin-top:12px;gap:8px">
      <button class="btn sm cyan" data-action="band-paste">${ic('download')} Sync band</button>
      <button class="btn sm" data-action="band-help">${d.band?.at ? `Synced ${new Date(d.band.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : 'Set up band'}</button>
    </div>
    <div class="today-train" data-go="train" role="button" tabindex="0">
      <span class="tmpl-ic">${ic(tk)}</span>
      <div class="spacer"><div class="tt-k">${tk === 'rest' ? 'Rest day' : 'Today’s session'}</div><div class="tt-v">${esc(tpl.name)}${t.perKg ? ` · ${t.train ? 'Training day' : 'Light day'}` : ''}</div></div>
      ${d.workout?.done ? `<span class="pill-note">CLEARED</span>` : ic('right')}
    </div>
  </div>

  ${ct.deadline || ['acut', 'cut'].includes(S.profile.goal) ? `
  <div class="panel cut-card" data-action="go-body" role="button" tabindex="0">
    <div class="panel-title">${S.profile.goal === 'acut' ? 'Aggressive cut' : 'Cut'} <small>${ct.daysLeft != null ? `${ct.daysLeft} days left` : ''}</small></div>
    <div class="cut-row">
      <div><div class="big-num"><span class="cnt" data-count="${ct.cur ? r1(ct.cur.v) : r1(S.profile.weight)}" data-dec="1">${ct.cur ? r1(ct.cur.v) : r1(S.profile.weight)}</span><span>kg</span></div><div class="ml">7-day average</div></div>
      <div><div class="big-num ${ct.rate == null ? 'dim' : ''}">${ct.rate == null ? '—' : (ct.rate > 0 ? '+' : '') + r1(ct.rate)}<span>kg/wk</span></div><div class="ml">${ct.pct == null ? 'weekly rate' : r1(ct.pct) + '% / week'}</div></div>
      <div><div class="big-num ${ct.proj == null ? 'dim' : ''}">${ct.proj == null ? (S.profile.targetWeight || '—') : r1(ct.proj)}<span>kg</span></div><div class="ml">${ct.proj == null ? 'target' : 'projected'}</div></div>
    </div>
    <div class="ready-tip zone-${{ fast: 'low', good: 'go', slow: 'mid', wait: 'none' }[ct.status]}"><b>${{ fast: 'TOO FAST', good: 'ON TRACK', slow: 'SLOW', wait: 'WEEKLY CHECK-IN' }[ct.status]}</b>${esc(ct.advice)}${ct.tdee ? ` Your real maintenance looks like ~${ct.tdee} kcal.` : ''}</div>
  </div>` : ''}

  ${bossCard()}

  <div class="panel">
    <div class="panel-title">Daily quests <small>${done}/${qs.length} · ${sk ? `${sk}-day streak` : 'start a streak'}</small></div>
    <div class="xp-line" style="margin-top:0"><span>EXP to level ${li.lvl + 1}</span><span>${li.into} / ${li.need}</span></div>${bar(li.into, li.need)}
    <div style="margin-top:8px">
    ${qs.map(qu => `
      <div class="quest ${qu.done ? 'done' : ''}" data-qid="${qu.id}" ${qu.manual ? `data-action="quest-toggle" data-id="${qu.id}" role="button" tabindex="0"` : qu.action ? `data-action="${qu.action}" role="button" tabindex="0"` : qu.go ? `data-go="${qu.go}" role="button" tabindex="0"` : ''}>
        <span class="qbox">${qu.done ? ic('check') : ''}</span>
        <div class="spacer"><div class="qname">${esc(qu.name)}</div>
          ${qu.goal ? `<div class="qprog">${qu.cur.toLocaleString('en')} / ${qu.goal.toLocaleString('en')} ${qu.unit || ''}</div>` : qu.manual ? `<div class="qprog">Tap when done</div>` : ''}</div>
        <span class="qxp">+${qu.xp}</span>
      </div>`).join('')}
    </div>
    ${late ? `<div class="penalty"><b>PENALTY ZONE</b>Fewer than 4 quests cleared and the day is almost over. Your streak is on the line.</div>` : ''}
  </div>

  ${quoteCard(q)}
  <div class="row" style="margin:-4px 0 12px;justify-content:flex-end;gap:8px">
    <button class="btn sm" data-action="quote-next">${ic('shuffle')} Another</button>
    <button class="btn sm" data-action="open-legends">Hall of Legends</button>
  </div>

  <div class="panel" data-go="fuel" role="button" tabindex="0">
    <div class="panel-title">Macros <small>${r0(tot.kcal)} / ${t.kcal} kcal</small></div>
    <div class="grid3">
      ${[['Protein', tot.p, t.p, 'p'], ['Carbs', tot.c, t.c, 'c'], ['Fat', tot.f, t.f, 'f']].map(([n, c, g, cl]) => `<div><div class="macro-k">${n}</div><div class="macro-v"><span class="cnt" data-count="${r0(c)}">${r0(c)}</span><span>/${g}g</span></div>${bar(c, g, cl)}</div>`).join('')}
    </div>
  </div>

  <div class="panel">
    <div class="panel-title">Up next <small><button class="chip" data-go="plan">Full plan</button></small></div>
    ${nextExam ? `<div class="exam-row" data-action="go-uni" role="button" tabindex="0"><div class="exam-d"><b>${Math.round((fromKey(nextExam.date) - fromKey(k)) / 864e5) || 'NOW'}</b><span>days</span></div><div class="spacer"><div class="nm">${esc(nextExam.subject)}</div><div class="sub">${esc(fmtDate(nextExam.date))}${nextExam.time ? ' · ' + esc(nextExam.time) : ''}</div></div></div>` : ''}
    ${ag.length ? ag.map(agendaRow).join('') : `<div class="empty">Nothing scheduled. Add your lectures and gym times in Plan.</div>`}
  </div>

  <div class="panel">
    <div class="panel-title">Hunter stats <small>${esc(rk.title)}</small></div>
    <div class="stats" style="margin-top:0">${Object.entries(st).map(([kk, v]) => `<div class="stat"><div class="k">${kk}</div><div class="v" data-count="${v}">${v}</div></div>`).join('')}</div>
  </div>`;
}

function openCheckin() {
  const r = { sleep: 7.5, q: 3, sore: 2, knee: 0, energy: 3, ...(day().ready || {}) };
  if (day().band?.sleep) r.sleep = day().band.sleep;
  const five = [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']];
  openSheet(`<h2>Morning check-in</h2><p class="muted small" style="margin-top:0">20 seconds. Sets today’s readiness and tells you how hard to push.</p>
    <label for="ci_sleep">Hours slept</label><input id="ci_sleep" type="number" inputmode="decimal" step="0.5" value="${r.sleep}">
    <label>Sleep quality <small class="muted">(1 bad · 5 great)</small></label>${seg('ci_q', five, r.q)}
    <label>Muscle soreness <small class="muted">(1 none · 5 wrecked)</small></label>${seg('ci_sore', five, r.sore)}
    <label>Knee pain right now</label>${seg('ci_knee', [[0, '0'], [2, '1-2'], [4, '3-4'], [6, '5-6'], [8, '7+']], r.knee)}
    <label>Energy & mood <small class="muted">(1 flat · 5 on fire)</small></label>${seg('ci_energy', five, r.energy)}
    <button class="btn primary block" style="margin-top:18px" data-action="checkin-save">Save check-in</button>`);
}
function parseBand(txt) {
  const num = re => { const m = String(txt).match(re); return m ? parseFloat(m[1].replace(',', '.')) : null; };
  const out = {};
  const sm = String(txt).match(/steps?\s*[=:]\s*([\d.,]+)/i); if (sm) out.steps = Math.round(+sm[1].replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'));
  let sl = num(/sleep\s*[=:]\s*([\d.,]+)/i); if (sl != null) { if (sl > 24) sl = sl / 60; out.sleep = Math.round(sl * 10) / 10; }
  const rh = num(/rhr\s*[=:]\s*([\d.,]+)/i); if (rh != null) out.rhr = Math.round(rh);
  return out;
}
function applyBand(b) {
  if (!b || !Object.keys(b).length) return false;
  const d = day();
  d.band = { ...(d.band || {}), ...b, at: Date.now() };
  if (b.steps != null) d.steps = Math.max(d.steps || 0, b.steps);
  if (d.ready && b.sleep) d.ready.sleep = b.sleep;
  evaluate(); render();
  toast('BAND SYNCED', [b.steps != null ? `${b.steps.toLocaleString('en')} steps` : '', b.sleep ? `${b.sleep} h sleep` : '', b.rhr ? `RHR ${b.rhr}` : ''].filter(Boolean).join(' · '));
  return true;
}
async function pasteBand() {
  try {
    const txt = await navigator.clipboard.readText();
    if (!applyBand(parseBand(txt))) toast('SYSTEM', 'No band data on the clipboard. Run the “ARISE Sync” shortcut first.');
  } catch (e) { toast('SYSTEM', 'Paste was blocked. Tap Allow Paste when iPhone asks.'); }
}
function openBandHelp() {
  openSheet(`<h2>Xiaomi band sync</h2>
    <p class="muted small" style="margin-top:0">One-time setup, about 3 minutes. After that: tap the shortcut, open ARISE, tap <b>Sync band</b>.</p>
    <div class="panel"><div class="panel-title">1 · Mi Fitness → Apple Health</div>
      <ul class="list"><li>Mi Fitness → Profile → <b>Third-party data</b> (or Settings) → <b>Apple Health</b> → turn on Steps, Sleep and Heart rate.</li></ul></div>
    <div class="panel"><div class="panel-title">2 · Build the shortcut</div>
      <ul class="list">
        <li>Open <b>Shortcuts</b> → <b>+</b> → name it <b>ARISE Sync</b>.</li>
        <li>Add <b>Find Health Samples</b>: Type <b>Steps</b>, Start Date <b>is today</b>. Then <b>Calculate Statistics</b> → <b>Sum</b>.</li>
        <li>Add <b>Find Health Samples</b>: Type <b>Sleep Analysis</b>, Start Date <b>is in the last 1 day</b>. Then <b>Get Details</b> → <b>Duration</b>, then <b>Calculate Statistics</b> → <b>Sum</b> (minutes or hours both work).</li>
        <li>Add <b>Find Health Samples</b>: Type <b>Resting Heart Rate</b>, Sort by Start Date latest, Limit 1. Then <b>Get Details</b> → <b>Value</b>.</li>
        <li>Add <b>Text</b>: <code>steps=[Sum 1] sleep=[Sum 2] rhr=[Value]</code> using the blue variables.</li>
        <li>Add <b>Copy to Clipboard</b>. Done — add it to your Home Screen or a widget.</li>
      </ul></div>
    <div class="panel"><div class="panel-title">3 · Every morning</div>
      <ul class="list"><li>Tap <b>ARISE Sync</b> → open ARISE → tap <b>Sync band</b> on the home screen. Steps, sleep and resting heart rate fill in, and readiness uses them.</li>
      <li>If resting heart rate is a few beats above your normal, ARISE lowers readiness — that’s an early sign of poor recovery or getting sick.</li></ul></div>
    <button class="btn primary block" data-action="band-paste">${ic('download')} Sync band now</button>`);
}
function openSteps() {
  const s = day().steps || 0;
  openSheet(`<h2>Steps</h2><p class="muted small" style="margin-top:0">Copy today’s number from the iPhone Health app. Goal: 10,000 every day — even on light days.</p>
    <label for="st_n">Steps today</label><input id="st_n" type="number" inputmode="numeric" value="${s || ''}" placeholder="e.g. 8400">
    <div class="chips" style="margin-top:10px">${[1000, 2000, 5000].map(n => `<button class="chip" data-action="steps-add" data-n="${n}">+${n / 1000}k</button>`).join('')}</div>
    <button class="btn primary block" style="margin-top:18px" data-action="steps-save">Save</button>`);
}

/* ================= FUEL ================= */
const MEALS = [{ id: 'breakfast', label: 'Breakfast' }, { id: 'lunch', label: 'Lunch' }, { id: 'dinner', label: 'Dinner' }, { id: 'snacks', label: 'Snacks' }];
let fuelDate = dkey();
function renderFuel() {
  const k = fuelDate, d = day(k), t = targets(k), tot = totals(k);
  const last7 = Array.from({ length: 7 }, (_, i) => { const kk = addDays(dkey(), i - 6); return { label: DAY_NAMES[fromKey(kk).getDay()].slice(0, 2), y: r0(S.days[kk] ? totals(kk).kcal : 0) }; });
  return `
  <div class="row between" style="margin-bottom:12px">
    <button class="icon-btn" data-action="fuel-date" data-d="-1" aria-label="Previous day">${ic('left')}</button>
    <div style="text-align:center"><h1 class="page" style="margin:0">FUEL</h1><div class="muted small">${k === dkey() ? 'Today' : esc(fmtDate(k))}</div></div>
    <button class="icon-btn" data-action="fuel-date" data-d="1" aria-label="Next day" ${k >= dkey() ? 'disabled style="opacity:.3"' : ''}>${ic('right')}</button>
  </div>
  <div class="panel sys">
    <div class="rings">${ring(tot.kcal, t.kcal)}
      <div class="macros">
        ${[['Protein', tot.p, t.p, 'p'], ['Carbs', tot.c, t.c, 'c'], ['Fat', tot.f, t.f, 'f']].map(([n, c, g, cl]) => `
          <div class="macro"><div class="top"><span>${n}</span><span>${r0(c)} / ${g} g</span></div>${bar(c, g, cl)}</div>`).join('')}
        <div class="small muted">Eaten ${r0(tot.kcal)} · Target ${t.kcal} kcal</div>
      </div>
    </div>
    <div class="add-row">
      <button class="btn cyan" data-action="open-scan"><span class="ic">${ic('scan')}</span>Scan</button>
      <button class="btn cyan" data-action="open-search"><span class="ic">${ic('search')}</span>Search</button>
      <button class="btn cyan" data-action="open-quick"><span class="ic">${ic('plus')}</span>Quick add</button>
    </div>
  </div>
  ${MEALS.map(m => {
    const items = d.foods.filter(f => f.meal === m.id);
    const kc = items.reduce((a, f) => a + f.kcal, 0);
    return `<div class="panel">
      <div class="meal-head"><h3>${m.label.toUpperCase()}</h3><span class="k">${r0(kc)} kcal</span>
        <button class="icon-btn" data-action="open-search" data-meal="${m.id}" aria-label="Add to ${m.label}">${ic('plus')}</button></div>
      ${items.map(f => `<div class="food"><div class="spacer"><div class="nm">${esc(f.name)}</div>
        <div class="mt">${r0(f.g)} g · P ${r1(f.p)} · C ${r1(f.c)} · F ${r1(f.f)}</div></div>
        <span class="kc">${r0(f.kcal)}</span><button class="x" data-action="del-food" data-id="${f.id}" aria-label="Remove ${esc(f.name)}">${ic('x')}</button></div>`).join('') || `<div class="empty">Nothing logged.</div>`}
    </div>`;
  }).join('')}
  <div class="panel">
    <div class="panel-title">Hydration <small>${d.water} / ${t.water} glasses · ${(d.water * 0.25).toFixed(2)} L</small></div>
    <div class="water">${Array.from({ length: Math.max(t.water, d.water) }, (_, i) => `<button class="glass ${i < d.water ? 'full' : ''}" data-action="water" data-n="${i < d.water ? i : i + 1}" aria-label="Set water to ${i + 1} glasses"></button>`).join('')}</div>
    <div class="row" style="margin-top:10px"><button class="btn sm" data-action="water" data-n="${Math.max(0, d.water - 1)}">−1</button><button class="btn sm cyan" data-action="water" data-n="${d.water + 1}">${ic('drop')} +1 glass</button></div>
  </div>
  <div class="panel"><div class="panel-title">Last 7 days <small>green = on target</small></div>${barChart(last7, t.kcal)}</div>
  <div class="panel">
    <div class="panel-title">Your targets</div>
    <div class="grid2">
      <div class="kpi"><div class="v">${t.kcal}</div><div class="k">KCAL / DAY</div></div>
      <div class="kpi"><div class="v">${t.p} g</div><div class="k">PROTEIN</div></div>
      <div class="kpi"><div class="v">${t.c} g</div><div class="k">CARBS</div></div>
      <div class="kpi"><div class="v">${t.f} g</div><div class="k">FAT</div></div>
    </div>
    ${t.perKg ? `<label>Today is</label><div class="seg"><button type="button" data-action="fuel-daytype" data-v="1" class="${t.train ? 'on' : ''}">Training day</button><button type="button" data-action="fuel-daytype" data-v="0" class="${t.train ? '' : 'on'}">Light day</button></div>
    <p class="small muted" style="margin-top:12px">Aggressive cut · per kg: P 2.4 · F 0.6 · C ${t.train ? '2.3 (training)' : '1.4 (light)'} · Maintenance ≈ ${t.tdee} kcal. Hit protein every day, aim for 10k+ steps.</p>` : `<p class="small muted">BMR ${t.bmr} · Maintenance ≈ ${t.tdee} kcal · Goal: ${GOALS[S.profile.goal]?.label}. Change it in Settings.</p>`}
    <button class="btn primary block" data-action="diet-plan">Show my meal plan</button>
  </div>`;
}

/* ----- Food sheet ----- */
let FS = null;
const guessMeal = () => { const h = new Date().getHours(); return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 21 ? 'dinner' : 'snacks'; };
const calc = (f, g) => { const m = g / 100; return { kcal: f.kcal * m, p: f.p * m, c: f.c * m, f: f.f * m }; };
function openFoodSheet(food, meal) {
  FS = { food, meal: meal || searchMeal || guessMeal(), g: food.srv?.[0]?.[1] || 100 };
  openSheet(`<h2>${esc(food.name)}</h2>${food.ar ? `<div class="ar muted">${esc(food.ar)}</div>` : ''}
    <div class="muted small">Per 100 g: ${r0(food.kcal)} kcal · P ${r1(food.p)} · C ${r1(food.c)} · F ${r1(food.f)}${food.code ? ` · ${esc(food.code)}` : ''}</div>
    ${food.srv?.length ? `<label>Serving</label><div class="chips">${food.srv.map(s => `<button class="chip" data-action="srv" data-g="${s[1]}">${esc(s[0])} · ${s[1]} g</button>`).join('')}</div>` : ''}
    <label for="fs_g">Amount (grams)</label><input id="fs_g" type="number" inputmode="decimal" value="${FS.g}">
    <div id="fs_prev" class="macro-preview"></div>
    <label>Meal</label>${seg('fs_meal', MEALS.map(m => [m.id, m.label]), FS.meal)}
    <button class="btn primary block" style="margin-top:16px" data-action="fs-add">Add to log</button>`);
  fsPreview();
}
function fsPreview() {
  if (!FS) return;
  const g = +($('#fs_g')?.value) || 0, m = calc(FS.food, g);
  const el = $('#fs_prev');
  if (el) el.innerHTML = [['kcal', m.kcal, '#f5f5f7'], ['protein', m.p, 'var(--p)'], ['carbs', m.c, 'var(--c)'], ['fat', m.f, 'var(--f)']].map(([k2, v, c]) => `<div class="mp"><div class="v" style="color:${c}">${k2 === 'kcal' ? r0(v) : r1(v)}</div><div class="k">${k2.toUpperCase()}</div></div>`).join('');
}
function addRecent(food) {
  const f = { name: food.name, ar: food.ar, kcal: food.kcal, p: food.p, c: food.c, f: food.f, srv: food.srv, code: food.code, src: food.src };
  S.recent = [f, ...S.recent.filter(x => x.name !== f.name)].slice(0, 30);
}
function logFood(food, g, meal, k = fuelDate) {
  const m = calc(food, g);
  day(k).foods.push({ id: uid(), name: food.name, g, meal, ...m });
  addRecent(food);
  evaluate(k);
}

/* ----- Search ----- */
let searchTab = 'all', lastResults = [], searchMeal = null, searchTimer = null;
function openSearch(meal) {
  searchMeal = meal || null;
  openSheet(`<h2>FOOD SEARCH</h2>
    <input id="sq" type="search" placeholder="chicken, فول, oats, Juhayna…" autocomplete="off" aria-label="Search food">
    <div class="chips" style="margin:10px 0 4px">${[['all', 'All'], ['recent', 'Recent'], ['egypt', 'Egyptian & basics'], ['mine', 'My foods']].map(([k, l]) => `<button class="chip ${searchTab === k ? 'on' : ''}" data-action="search-tab" data-t="${k}">${l}</button>`).join('')}</div>
    <div id="results"></div>
    <div class="grid2" style="margin-top:12px">
      <button class="btn cyan" data-action="search-online">${ic('search')} Online</button>
      <button class="btn" data-action="open-custom">${ic('plus')} Custom food</button>
    </div>
    <p class="small muted">Online search uses Open Food Facts — a free database with many Egyptian supermarket products.</p>`);
  renderResults();
}
function renderResults(online) {
  const box = $('#results');
  if (!box) return;
  const q = ($('#sq')?.value || '').trim().toLowerCase();
  let pool;
  if (searchTab === 'recent') pool = S.recent.map(f => ({ ...f, src: 'RECENT' }));
  else if (searchTab === 'mine') pool = S.customFoods.map(f => ({ ...f, src: 'MINE' }));
  else if (searchTab === 'egypt') pool = FOODS.map(f => ({ ...f, src: 'ARISE' }));
  else pool = [...S.customFoods.map(f => ({ ...f, src: 'MINE' })), ...FOODS.map(f => ({ ...f, src: 'ARISE' }))];
  if (q) {
    const words = q.split(/\s+/).filter(Boolean);
    pool = pool.filter(f => { const hay = `${f.name} ${f.ar || ''} ${f.code || ''}`.toLowerCase(); return words.every(w => hay.includes(w)); });
  }
  lastResults = [...(online || []), ...pool.slice(0, 40)];
  box.innerHTML = lastResults.length ? lastResults.map((f, i) => `
    <div class="result" data-action="pick-food" data-i="${i}" role="button" tabindex="0">
      <div class="spacer"><div class="nm">${esc(f.name)}</div>${f.ar ? `<div class="ar">${esc(f.ar)}</div>` : ''}
      <div class="sub">${r0(f.kcal)} kcal · P ${r1(f.p)} · C ${r1(f.c)} · F ${r1(f.f)} per 100 g</div></div>
      <span class="src">${f.src === 'OFF' ? 'ONLINE' : f.src}</span></div>`).join('')
    : `<div class="empty-card">
        <div class="ec-t">${q ? `No “${esc(q)}” in your foods yet` : 'Nothing here yet'}</div>
        <div class="ec-s">Search online, scan the barcode on the pack, or add it once from the label — it’s saved for next time.</div>
        <div class="ec-b">${q ? `<button class="btn cyan sm" data-action="search-online">${ic('search')} Search online</button>` : ''}
          <button class="btn sm" data-action="open-scan">${ic('scan')} Scan</button>
          <button class="btn sm" data-action="open-custom">${ic('plus')} Add from label</button></div></div>`;
}
function fetchT(url, ms = 9000) {
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
  return fetch(url, { signal: ac.signal }).finally(() => clearTimeout(t));
}
async function searchOnline() {
  const q = val('sq');
  if (q.length < 2) { toast('SYSTEM', 'Type at least 2 letters.'); return; }
  const box = $('#results');
  box.innerHTML = `<div class="skeleton-list">${'<div class="sk"></div>'.repeat(4)}</div><div class="empty" style="text-align:center">Searching Open Food Facts…</div>`;
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=25&fields=code,product_name,product_name_en,product_name_ar,brands,nutriments,serving_quantity,serving_size`;
    const r = await fetchT(url);
    if (!r.ok) throw new Error('busy');
    const j = await r.json();
    const list = (j.products || []).map(p => offToFood(p, p.code)).filter(Boolean);
    if (!$('#results')) return;
    renderResults(list);
    if (!list.length) toast('SYSTEM', 'Nothing found online. Scan the barcode instead.');
  } catch (e) {
    if (!$('#results')) return;
    renderResults();
    const b = $('#results');
    b.insertAdjacentHTML('afterbegin', `<div class="penalty" style="margin:0 0 10px"><b>ONLINE SEARCH ISN’T ANSWERING</b>The free food database is busy right now. Scan the barcode on the pack — that lookup almost always works — or add it once from the label.</div>`);
  }
}
function offToFood(p, code) {
  const n = p.nutriments || {};
  let kcal = n['energy-kcal_100g'];
  if (kcal == null && n.energy_100g != null) kcal = n.energy_100g / 4.184;
  if (kcal == null) return null;
  const nm = p.product_name || p.product_name_en || p.product_name_ar || `Product ${code}`;
  const brand = (p.brands || '').split(',')[0].trim();
  const srv = [];
  if (+p.serving_quantity) srv.push([p.serving_size || '1 serving', +p.serving_quantity]);
  if (+p.serving_quantity !== 100) srv.push(['100 g', 100]);
  return { name: brand && !nm.includes(brand) ? `${nm} · ${brand}` : nm, kcal: +kcal, p: +(n.proteins_100g || 0), c: +(n.carbohydrates_100g || 0), f: +(n.fat_100g || 0), srv, src: 'OFF', code: p.code || code };
}

/* ----- Scanner ----- */
let scanner = null;
function loadScript(src) {
  return new Promise((res, rej) => {
    if ($(`script[src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}
async function openScan() {
  openSheet(`<h2>SCAN BARCODE</h2><p class="muted small">Point the camera at the barcode on the pack.</p>
    <div class="scan-frame"><div id="scanner"></div><div class="scan-line"></div></div>
    <div id="scanMsg" class="muted small" style="margin-top:8px"></div>
    <label for="bc">Or type the barcode</label>
    <div class="row"><input id="bc" inputmode="numeric" placeholder="6221007…"><button class="btn cyan" data-action="manual-barcode">Find</button></div>`, stopScan);
  try {
    await loadScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js');
    if (!$('#scanner')) return;
    const F = window.Html5QrcodeSupportedFormats;
    scanner = new window.Html5Qrcode('scanner', { formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128], verbose: false, experimentalFeatures: { useBarCodeDetectorIfSupported: true } });
    await scanner.start({ facingMode: 'environment' }, { fps: 12, qrbox: (w, h) => ({ width: Math.floor(Math.min(w * 0.85, 320)), height: Math.floor(Math.min(h * 0.5, 160)) }) },
      code => { const c = code; stopScan().then(() => lookupBarcode(c)); }, () => {});
  } catch (e) {
    const m = $('#scanMsg');
    if (m) m.textContent = `Camera not available (${e.message || e}). Allow camera access, or type the barcode.`;
  }
}
async function stopScan() {
  const s = scanner; scanner = null;
  if (s) { try { await s.stop(); s.clear(); } catch (e) { /* already stopped */ } }
}
async function lookupBarcode(code) {
  code = String(code).trim();
  if (!code) return;
  const local = S.customFoods.find(f => f.code === code) || S.recent.find(f => f.code === code) || FOODS.find(f => f.code === code);
  if (local) return openFoodSheet(local);
  openSheet(`<h2>SCANNING DATABASE</h2><p class="muted">Looking up ${esc(code)}…</p>`);
  try {
    const r = await fetchT(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=code,product_name,product_name_en,product_name_ar,brands,nutriments,serving_quantity,serving_size`);
    const j = await r.json();
    if (j.status === 1 && j.product) {
      const f = offToFood(j.product, code);
      if (f) return openFoodSheet(f);
      return openCustom({ code, name: j.product.product_name || '' }, 'Product found but it has no nutrition data. Copy it from the label once — it is saved for next time.');
    }
    openCustom({ code }, 'Not in the database yet. Enter it from the label once — next scan finds it instantly.');
  } catch (e) {
    openCustom({ code }, 'No connection. Enter it from the label.');
  }
}
function openCustom(pre = {}, msg = '') {
  openSheet(`<h2>CUSTOM FOOD</h2>${msg ? `<p class="small muted">${esc(msg)}</p>` : ''}
    <label for="cf_name">Name</label><input id="cf_name" value="${esc(pre.name || '')}" placeholder="e.g. Juhayna Greek yogurt">
    <p class="small muted" style="margin:10px 0 0">Values per 100 g (from the nutrition label)</p>
    <div class="grid2">
      <div><label for="cf_k">Calories</label><input id="cf_k" type="number" inputmode="decimal"></div>
      <div><label for="cf_p">Protein g</label><input id="cf_p" type="number" inputmode="decimal"></div>
      <div><label for="cf_c">Carbs g</label><input id="cf_c" type="number" inputmode="decimal"></div>
      <div><label for="cf_f">Fat g</label><input id="cf_f" type="number" inputmode="decimal"></div>
    </div>
    <div class="grid2"><div><label for="cf_s">Serving size g</label><input id="cf_s" type="number" inputmode="decimal" placeholder="optional"></div>
    <div><label for="cf_code">Barcode</label><input id="cf_code" inputmode="numeric" value="${esc(pre.code || '')}"></div></div>
    <button class="btn primary block" style="margin-top:16px" data-action="custom-save">Save & add</button>`);
}
function openQuick() {
  openSheet(`<h2>QUICK ADD</h2><p class="small muted">For restaurant meals or when you only know the totals.</p>
    <label for="qa_name">Name</label><input id="qa_name" placeholder="e.g. Koshari El Tahrir — large">
    <div class="grid2">
      <div><label for="qa_k">Calories</label><input id="qa_k" type="number" inputmode="decimal"></div>
      <div><label for="qa_p">Protein g</label><input id="qa_p" type="number" inputmode="decimal"></div>
      <div><label for="qa_c">Carbs g</label><input id="qa_c" type="number" inputmode="decimal"></div>
      <div><label for="qa_f">Fat g</label><input id="qa_f" type="number" inputmode="decimal"></div>
    </div>
    <label>Meal</label>${seg('qa_meal', MEALS.map(m => [m.id, m.label]), guessMeal())}
    <button class="btn primary block" style="margin-top:16px" data-action="quick-save">Add</button>`);
}

/* ----- Meal plan generator ----- */
const PLAN_BASE = () => [
  { meal: 'Breakfast', time: '08:00', items: [['f_egg', 150, 'p'], ['f_eggw', 66, 'p'], ['f_ful', 150, 'c'], ['f_baladi', 45, 'c'], ['f_salad', 100, '-']] },
  { meal: 'Lunch', time: '14:00', items: [['f_chk', 180, 'p'], ['f_rice', 200, 'c'], ['f_oil', 10, '-'], ['f_salad', 200, '-']] },
  { meal: 'Pre-gym', time: '17:00', items: [['f_greek', 170, 'p'], ['f_oats', 40, 'c'], ['f_banana', 118, 'c'], ['f_honey', 10, '-']] },
  { meal: 'Dinner', time: '21:00', items: [['f_tuna', 120, 'p'], ['f_areesh', 100, 'p'], ['f_baladi', 45, 'c'], ['f_potato', 170, 'c'], ['f_salad', 150, '-']] },
];
const SWAPS = {
  p: ['f_chk', 'f_chkth', 'f_tawook', 'f_fish', 'f_shrimp', 'f_beef', 'f_kofta', 'f_tuna', 'f_egg', 'f_eggw', 'f_greek', 'f_areesh', 'f_whey', 'f_milkl'],
  c: ['f_baladi', 'f_shami', 'f_tortbran', 'f_toastb', 'f_toast', 'f_rice', 'f_pasta', 'f_potato', 'f_sweetp', 'f_oats', 'f_ful', 'f_lentil', 'f_banana', 'f_apple', 'f_orange', 'f_dates', 'f_guava', 'f_mango'],
  '-': ['f_salad', 'f_oil', 'f_tahini', 'f_hummus', 'f_honey', 'f_almond', 'f_pb'],
};
function dietPlan() {
  const t = targets();
  const F = id => FOODS.find(f => f.id === id);
  const plan = PLAN_BASE();
  const sw = S.planSwaps || {};
  plan.forEach((m, mi) => m.items.forEach((it, ii) => {
    const to = sw[`${mi}:${ii}`], from = F(it[0]), nf = to && F(to);
    if (nf && from) { const m0 = calc(from, it[1]); const key = it[2] === 'p' ? 'p' : 'kcal'; it[0] = to; it[1] = clamp((m0[key] / (nf[key] || 1)) * 100, 5, 600); }
  }));
  const sum = () => plan.flatMap(m => m.items).reduce((a, [id, g]) => { const m = calc(F(id), g); return { kcal: a.kcal + m.kcal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }; }, { kcal: 0, p: 0, c: 0, f: 0 });
  // 1) scale protein foods to the protein target, 2) scale carb foods to fill the calories
  const pOnly = plan.flatMap(m => m.items).filter(i => i[2] === 'p').reduce((a, [id, g]) => a + calc(F(id), g).p, 0);
  const pf = clamp((t.p - (sum().p - pOnly)) / pOnly, 0.6, 2);
  plan.forEach(m => m.items.forEach(i => { if (i[2] === 'p') i[1] *= pf; }));
  const cK = plan.flatMap(m => m.items).filter(i => i[2] === 'c').reduce((a, [id, g]) => a + calc(F(id), g).kcal, 0);
  const cf = clamp((t.kcal - (sum().kcal - cK)) / cK, 0.3, 2.6);
  plan.forEach(m => m.items.forEach(i => { if (i[2] === 'c') i[1] *= cf; i[1] = Math.max(5, Math.round(i[1] / 5) * 5); }));
  const tot = sum();
  openSheet(`<h2>MEAL PLAN</h2><p class="small muted">Built from your targets. <b>Long-press</b> any food (or tap ⇄) to swap it — ARISE re-balances the amounts to keep your macros.</p>
    ${Object.keys(S.planSwaps || {}).length ? `<button class="btn sm" style="margin-bottom:10px" data-action="plan-reset">Reset swaps</button>` : ''}
    ${plan.map((m, mi) => {
      const mt = m.items.reduce((a, [id, g]) => a + calc(F(id), g).kcal, 0);
      return `<div class="panel"><div class="meal-head"><h3>${m.meal.toUpperCase()} <span class="muted small">· ${m.time}</span></h3><span class="k">${r0(mt)} kcal</span></div>
      ${m.items.map(([id, g, role], ii) => { const f = F(id), c = calc(f, g); return `<div class="food plan-food" data-mi="${mi}" data-ii="${ii}" data-role="${role}"><div class="spacer"><div class="nm">${esc(f.name)} <span class="ar muted small">${esc(f.ar)}</span></div><div class="mt">${g} g · P ${r1(c.p)} · C ${r1(c.c)} · F ${r1(c.f)}</div></div><span class="kc">${r0(c.kcal)}</span><button class="x" data-action="plan-swap" data-mi="${mi}" data-ii="${ii}" data-role="${role}" aria-label="Swap ${esc(f.name)}">⇄</button></div>`; }).join('')}
      <button class="btn sm cyan" style="margin-top:8px" data-action="log-plan-meal" data-i="${mi}">Log this meal</button></div>`;
    }).join('')}
    <div class="panel sys"><div class="grid2">
      <div class="kpi"><div class="v">${r0(tot.kcal)}</div><div class="k">KCAL (target ${t.kcal})</div></div>
      <div class="kpi"><div class="v">${r0(tot.p)} g</div><div class="k">PROTEIN (target ${t.p})</div></div>
      <div class="kpi"><div class="v">${r0(tot.c)} g</div><div class="k">CARBS</div></div>
      <div class="kpi"><div class="v">${r0(tot.f)} g</div><div class="k">FAT</div></div></div></div>
    <div class="disclaimer"><b>Rules of the System:</b> protein in every meal · 3-4 L water · eat carbs around training · fruit/veg daily · one flexible meal per week is allowed — log it anyway.</div>`);
  window.__plan = plan;
}

function openSwap(mi, ii, role) {
  const cur = window.__plan?.[mi]?.items?.[ii]?.[0];
  const list = (SWAPS[role] || SWAPS['-']).map(id => FOODS.find(f => f.id === id)).filter(Boolean);
  openSheet(`<h2>Swap food</h2><p class="small muted" style="margin-top:0">${role === 'p' ? 'Protein swaps keep the same grams of protein.' : 'Swaps keep the same calories.'}</p>
    ${list.map(f => `<div class="result ${f.id === cur ? 'on' : ''}" data-action="plan-pick" data-k="${mi}:${ii}" data-id="${f.id}" role="button" tabindex="0">
      <div class="spacer"><div class="nm">${esc(f.name)}</div><div class="ar">${esc(f.ar || '')}</div><div class="sub">${r0(f.kcal)} kcal · P ${r1(f.p)} · C ${r1(f.c)} · F ${r1(f.f)} per 100 g</div></div>
      ${f.id === cur ? '<span class="src">NOW</span>' : ''}</div>`).join('')}
    <button class="btn block" style="margin-top:12px" data-action="diet-plan">Back to plan</button>`);
}
/* Long-press a plan food to swap it */
(() => {
  let timer = null, sx = 0, sy = 0;
  const cancel = () => { clearTimeout(timer); timer = null; };
  document.addEventListener('touchstart', e => {
    const row = e.target.closest('.plan-food');
    if (!row || e.target.closest('button')) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    row.classList.add('pressing');
    timer = setTimeout(() => { row.classList.remove('pressing'); timer = null; openSwap(+row.dataset.mi, +row.dataset.ii, row.dataset.role); }, 480);
  }, { passive: true });
  document.addEventListener('touchmove', e => { if (timer && (Math.abs(e.touches[0].clientX - sx) > 8 || Math.abs(e.touches[0].clientY - sy) > 8)) { cancel(); $$('.plan-food.pressing').forEach(r => r.classList.remove('pressing')); } }, { passive: true });
  document.addEventListener('touchend', () => { cancel(); $$('.plan-food.pressing').forEach(r => r.classList.remove('pressing')); });
  document.addEventListener('contextmenu', e => { const row = e.target.closest('.plan-food'); if (row) { e.preventDefault(); openSwap(+row.dataset.mi, +row.dataset.ii, row.dataset.role); } });
})();

/* ================= TRAIN ================= */
let trainTab = 'today', trainWd = null;
function renderTrain() {
  const tabs = [['today', 'Today'], ['week', 'Program'], ['body', 'Physique'], ['log', 'History']];
  const body = { today: trainToday, week: trainWeek, body: trainBody, log: trainLog }[trainTab]();
  return `<h1 class="page">TRAIN</h1><p class="page-sub">Dungeon log — every set is EXP.</p>
    <div class="seg-tabs">${tabs.map(([k, l]) => `<button class="${trainTab === k ? 'on' : ''}" data-action="train-tab" data-t="${k}">${l}</button>`).join('')}</div>${body}`;
}
function dayStrip(selWd) {
  const tw = new Date().getDay();
  return `<div class="day-strip">${WEEK_ORDER.map(wd => `<button class="day-pill ${wd === tw ? 'today' : ''} ${wd === selWd ? 'sel' : ''}" data-action="train-day" data-wd="${wd}" aria-label="${DAY_NAMES[wd]}">
    <div class="d">${DAY_NAMES[wd].toUpperCase()}</div><div class="t">${ic(S.split[wd] || 'rest')}</div></button>`).join('')}</div>`;
}
function trainToday() {
  const k = dkey(), tw = new Date().getDay();
  const wd = trainWd ?? tw;
  if (wd !== tw) {
    const t = template(S.split[wd] || 'rest');
    return dayStrip(wd) + `<div class="panel"><div class="row"><span class="tmpl-ic">${ic(S.split[wd] || 'rest')}</span><div><div class="phase-title">${DAY_NAMES[wd]} · ${t.name}</div><div class="muted small">${esc(t.sub)}</div></div></div></div>
      ${t.ex.map(e => `<div class="ex"><div class="ex-name">${esc(e[0])}</div><div class="ex-meta">${e[1]} × ${esc(e[2])}${e[3] ? ` · rest ${e[3]}s` : ''}</div>${e[4] ? `<div class="ex-cue">${esc(e[4])}</div>` : ''}</div>`).join('')}`;
  }
  const w = workout(k), t = template(w.tpl);
  const info = aclInfo();
  return dayStrip(wd) + `
  <div class="panel sys">
    <div class="row"><span class="tmpl-ic">${ic(w.tpl)}</span><div class="spacer"><div class="phase-title">${t.name}</div><div class="muted small">${esc(t.sub)}</div></div>
      ${w.done ? `<span class="pill-note">CLEARED</span>` : ''}</div>
    <label>Change today's session</label>
    <div class="chips">${Object.keys(TEMPLATES).map(key => `<button class="chip ${w.tpl === key ? 'on' : ''}" data-action="set-tpl" data-tpl="${key}">${TEMPLATES[key].name}</button>`).join('')}</div>
    ${w.tpl === 'lower' && info ? `<p class="small muted" style="margin-bottom:0">Leg day follows your rehab phase (${info.phase.arc}). It levels up automatically as your knee does.</p>` : ''}
  </div>
  ${t.type === 'rest' ? t.ex.map(e => `<div class="ex"><div class="ex-name">${esc(e[0])}</div><div class="ex-meta">${esc(e[2])}</div><div class="ex-cue">${esc(e[4])}</div></div>`).join('') :
    t.ex.map((e, ei) => {
      const sets = exSets(w, e), allDone = sets.every(s => s.done), pr = S.prs[e[0]];
      return `<div class="ex ${allDone ? 'complete' : ''}">
        <div class="ex-head"><div class="spacer"><div class="ex-name">${esc(e[0])}</div><div class="ex-meta">${e[1]} × ${esc(e[2])}${e[3] ? ` · rest ${e[3]}s` : ''}</div></div>
          ${pr ? `<span class="pr">PR ${pr.w}kg×${pr.r}</span>` : ''}</div>
        ${e[4] ? `<div class="ex-cue">${esc(e[4])}</div>` : ''}
        <div class="sets"><div class="set-head"><span>SET</span><span>KG</span><span>REPS</span><span></span></div>
        ${sets.map((s, si) => `<div class="set ${s.done ? 'done' : ''}"><span class="n">${si + 1}</span>
          <input inputmode="decimal" type="number" data-set="${ei}:${si}:w" value="${esc(s.w)}" placeholder="kg" aria-label="Weight set ${si + 1}">
          <input inputmode="numeric" type="number" data-set="${ei}:${si}:r" value="${esc(s.r)}" placeholder="reps" aria-label="Reps set ${si + 1}">
          <button class="ok" data-action="set-done" data-ei="${ei}" data-si="${si}" aria-label="Complete set ${si + 1}">${ic('check')}</button></div>`).join('')}
        </div>
        <button class="btn sm" style="margin-top:8px" data-action="add-set" data-ei="${ei}">${ic('plus')} Set</button>
      </div>`;
    }).join('')}
  ${t.type !== 'rest' ? (w.done ? `<button class="btn block" data-action="reopen-workout">Reopen workout</button>` : `<button class="btn primary block" data-action="finish-workout">Clear the gate · +100 XP</button>`) : ''}`;
}
function trainWeek() {
  return `<div class="panel sys"><div class="panel-title">Weekly split <small>Saturday first</small></div>
    ${WEEK_ORDER.map(wd => `<div class="row between" style="padding:6px 0"><span style="font-family:var(--label);font-weight:700;width:90px">${DAY_NAMES[wd]} <span class="ar muted small">${DAY_AR[wd]}</span></span>
      <select data-change="split" data-wd="${wd}" style="max-width:200px" aria-label="Session for ${DAY_NAMES[wd]}">${Object.keys(TEMPLATES).map(key => `<option value="${key}" ${S.split[wd] === key ? 'selected' : ''}>${TEMPLATES[key].name}</option>`).join('')}</select></div>`).join('')}
  </div>
  <div class="panel"><div class="panel-title">Rules of progression</div><ul class="list">
    <li><b>Double progression:</b> when every set hits the top of the rep range, add 2.5 kg next time (1-2 kg for small muscles).</li>
    <li><b>Effort:</b> finish each set with 1-2 reps left in the tank. Last set can go to technical failure on machines.</li>
    <li><b>Warm-up:</b> 5-8 min easy bike, then 2 lighter ramp-up sets on the first exercise.</li>
    <li><b>Deload:</b> every 6th week, do half the sets at the same weight.</li>
    <li><b>Knee rule:</b> pain during training must stay at 3/10 or lower, and the knee must not be more swollen the next morning. If it is, drop back a level.</li>
    <li><b>Never:</b> jump down from a pull-up bar or a box, pivot on the operated leg, or play football before clearance.</li>
  </ul></div>
  <div class="panel"><div class="panel-title">Physique priorities</div><ul class="list">
    <li>Upper body trains at full intensity from day one — chest, back, shoulders and arms don't need the knee.</li>
    <li>Wide back + capped shoulders = the "V". Lateral raises and pull-ups 2× per week.</li>
    <li>Quads shrink fast after ACL surgery. The rehab work <i>is</i> leg day — don't skip it.</li>
    <li>Protein ${targets().p} g every day and 7-9 h sleep. Muscle is built in recovery.</li>
  </ul></div>`;
}
function trainBody() {
  const ws = [...S.weights].sort((a, b) => a.date.localeCompare(b.date));
  const last = ws[ws.length - 1];
  const ago = ws.find(w => w.date >= addDays(dkey(), -30));
  const tw = S.profile.targetWeight;
  const mv = muscleVolume(7);
  const zone = n => n === 0 ? 'z0' : n < 10 ? 'z1' : n <= 20 ? 'z2' : 'z3';
  const heat = `<div class="panel"><div class="panel-title">Muscle volume <small>hard sets · last 7 days</small></div>
    <div class="heat">${Object.entries(mv).map(([m, n]) => `<div class="heat-cell ${zone(n)}"><span class="hm">${m}</span><span class="hn">${n}</span></div>`).join('')}</div>
    <div class="heat-legend"><span><i class="z1"></i>Under 10</span><span><i class="z2"></i>10–20 ideal</span><span><i class="z3"></i>20+ high</span></div>
    <p class="small muted" style="margin-bottom:0">In a cut, keep each muscle in the 10–20 range to hold on to it. Your operated leg’s quads deserve the most.</p></div>`;
  return `<div class="panel sys"><div class="panel-title">Log body stats</div>
    <div class="grid2"><div><label for="bw">Weight kg</label><input id="bw" type="number" inputmode="decimal" value="${last?.kg || S.profile.weight}"></div>
    <div><label for="bwaist">Waist cm</label><input id="bwaist" type="number" inputmode="decimal" value="${last?.waist || ''}" placeholder="optional"></div></div>
    <button class="btn primary block" style="margin-top:12px" data-action="weight-save">Save today</button></div>
  ${heat}
  <button class="btn block" style="margin-bottom:12px" data-action="open-photos">${ic('plus')} Progress photos · before / after</button>
  <div class="panel"><div class="panel-title">Weight trend <small>${last ? `${last.kg} kg` : ''}${ago && last ? ` · ${(last.kg - ago.kg) >= 0 ? '+' : ''}${r1(last.kg - ago.kg)} kg in 30 days` : ''}</small></div>
    ${lineChart(ws.slice(-30).map(w => ({ label: w.date.slice(5), y: w.kg })), { unit: ' kg', target: tw || null })}</div>
  ${ws.some(w => w.waist) ? `<div class="panel"><div class="panel-title">Waist</div>${lineChart(ws.filter(w => w.waist).slice(-30).map(w => ({ label: w.date.slice(5), y: w.waist })), { unit: ' cm', color: '#a78bfa' })}</div>` : ''}
  <div class="panel"><div class="panel-title">Personal records</div>
    ${Object.entries(S.prs).length ? Object.entries(S.prs).sort((a, b) => b[1].e - a[1].e).map(([n, p]) => `<div class="food"><div class="spacer"><div class="nm">${esc(n)}</div><div class="mt">${esc(p.date)}</div></div><span class="kc">${p.w} kg × ${p.r}</span></div>`).join('') : `<div class="empty">Complete sets with a weight to start recording PRs.</div>`}</div>`;
}
function trainLog() {
  const h = [...S.history].reverse().slice(0, 40);
  return `<div class="panel"><div class="panel-title">Cleared gates <small>${S.history.length} total</small></div>
    ${h.length ? h.map(x => `<div class="food"><span class="tmpl-ic">${ic(x.tpl)}</span><div class="spacer"><div class="nm">${TEMPLATES[x.tpl]?.name || x.tpl}</div><div class="mt">${esc(fmtDate(x.date))} · ${x.sets} sets</div></div><span class="kc">${r0(x.volume)} kg</span></div>`).join('') : `<div class="empty">No workouts yet. Your first gate is waiting.</div>`}</div>`;
}

/* Rest timer */
const RT = { end: 0, iv: null };
function startRest(sec) {
  if (!sec) return;
  RT.end = Date.now() + sec * 1000;
  const el = $('#restTimer');
  el.innerHTML = `<span class="lbl">REST</span><span id="rtv"></span><button class="btn sm" data-action="timer-add">+15s</button><button class="btn sm" data-action="timer-close">Skip</button>`;
  el.hidden = false;
  clearInterval(RT.iv);
  RT.iv = setInterval(tickRest, 250);
  tickRest();
}
function tickRest() {
  const left = Math.max(0, Math.round((RT.end - Date.now()) / 1000));
  const v = $('#rtv');
  if (v) v.textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
  if (left <= 0) { stopRest(); toast('REST OVER', 'Next set. Go.'); try { navigator.vibrate?.(300); } catch (e) { /* no-op */ } }
}
function stopRest() { clearInterval(RT.iv); $('#restTimer').hidden = true; }

/* ================= REHAB ================= */
function renderRehab() {
  const info = aclInfo();
  if (!info) {
    return `<h1 class="page">REHAB</h1><div class="panel sys"><p>No knee injury set in your profile.</p><button class="btn primary block" data-action="open-settings">Set ACL details</button></div>${comebackPanel()}`;
  }
  const k = dkey(), d = day(k), ph = info.phase, kn = d.knee || {};
  const doneN = d.rehab.done.length, total = ph.ex.length;
  const roms = Object.entries(S.days).filter(([, x]) => x.knee?.flex).sort((a, b) => a[0].localeCompare(b[0])).slice(-30);
  const lastKnee = Object.entries(S.days).filter(([kk, x]) => x.knee && kk !== k).sort((a, b) => b[0].localeCompare(a[0]))[0]?.[1].knee;
  const warn = kn.pain >= 7 || kn.swell === 'severe';
  return `<h1 class="page">REHAB</h1><p class="page-sub">The Vinland arc — rebuilding, one rep at a time.</p>
  <div class="panel sys">
    <div class="phase-banner"><div class="spacer"><div class="arc">${ph.arc}</div><div class="phase-title">${esc(ph.title)}</div>
      <div class="muted small">${info.weeks != null ? `Week ${info.weeks} ${info.a.status === 'postop' ? 'after surgery' : 'since injury'}` : 'Set a date in Settings to auto-track your phase'}${ph.weeks[1] ? ` · usually weeks ${ph.weeks[0]}–${ph.weeks[1]}` : ''}</div></div></div>
    <div class="phase-steps">${ACL_PHASES.map((_, i) => `<i class="${i <= info.idx ? 'on' : ''}"></i>`).join('')}</div>
    ${info.locked ? `<div class="ready-tip zone-mid"><b>ARC V LOCKED UNTIL CLEARED</b>By date you’re in the return-to-sport phase, but hops, sprints and cutting wait for your physio’s OK. Many people at 9 months still have a quad strength gap — closing it is the biggest thing that prevents a re-tear. Ask your physio for a quad strength test and hop tests.
      <button class="btn sm" style="margin-top:10px" data-action="acl-cleared">My physio cleared me</button></div>` : ''}
    <label for="phaseSel">Phase (your physio decides)</label>
    <select id="phaseSel" data-change="phase">
      <option value="" ${info.a.override == null || info.a.override === '' ? 'selected' : ''}>Auto from date</option>
      <option value="pre" ${info.a.override === 'pre' ? 'selected' : ''}>Prehab (before surgery)</option>
      ${ACL_PHASES.map((p, i) => `<option value="${i}" ${String(info.a.override) === String(i) ? 'selected' : ''}>${p.arc} — ${p.title}</option>`).join('')}
    </select>
  </div>

  <div class="panel sys">
    <div class="panel-title">Today's session <small>${doneN}/${total} · +80 XP at ${Math.ceil(total * 0.8)}</small></div>
    ${bar(doneN, total)}
    <div style="margin-top:6px">${ph.ex.map(e => `<div class="check ${d.rehab.done.includes(e.id) ? 'done' : ''}" data-action="rehab-toggle" data-id="${e.id}" role="button" tabindex="0">
      <span class="qbox">${d.rehab.done.includes(e.id) ? ic('check') : ''}</span>
      <div><div class="nm">${esc(e.n)}</div><div class="ds">${esc(e.d)}</div>${e.cue ? `<div class="cu">${esc(e.cue)}</div>` : ''}</div></div>`).join('')}</div>
    ${info.a.graft === 'peroneus' ? `<div class="ready-tip zone-go"><b>PERONEUS LONGUS GRAFT</b>Your hamstrings and quads weren’t cut — good news for strength. The donor ankle needs its own work: band eversion, single-leg calf raises and balance. ARISE adds them to your leg days.</div>` : ''}
    ${info.a.graft === 'hamstring' && info.idx <= 1 ? `<div class="penalty" style="border-color:rgba(255,201,77,.4);background:rgba(255,201,77,.08);color:#ffe3a3"><b style="color:var(--gold)">HAMSTRING GRAFT</b>Avoid loaded hamstring curls for the first 6-8 weeks unless your physio says otherwise.</div>` : ''}
  </div>

  <div class="panel">
    <div class="panel-title">Knee check-in <small>+15 XP</small></div>
    <label for="kp">Pain now: <b id="kpv">${kn.pain ?? 2}</b> / 10</label>
    <input id="kp" class="range" type="range" min="0" max="10" value="${kn.pain ?? 2}">
    <label for="ks">Swelling</label>
    <select id="ks">${[['none', 'None'], ['mild', 'Mild'], ['moderate', 'Moderate'], ['severe', 'Severe']].map(([v, l]) => `<option value="${v}" ${kn.swell === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <div class="grid2">
      <div><label for="kf">Bend (flexion °)</label><input id="kf" type="number" inputmode="numeric" value="${kn.flex ?? lastKnee?.flex ?? ''}" placeholder="e.g. 95"></div>
      <div><label for="ke">Straight (extension °)</label><input id="ke" type="number" inputmode="numeric" value="${kn.ext ?? lastKnee?.ext ?? ''}" placeholder="0 = fully straight"></div>
    </div>
    <button class="btn primary block" style="margin-top:12px" data-action="knee-save">${d.knee ? 'Update check-in' : 'Save check-in'}</button>
    ${warn ? `<div class="penalty"><b>SYSTEM ALERT</b>High pain or severe swelling. Ease off today — ice, elevate — and contact your physio or surgeon if it does not settle.</div>` : ''}
  </div>

  <div class="panel"><div class="panel-title">Range of motion <small>flexion °</small></div>
    ${lineChart(roms.map(([kk, x]) => ({ label: kk.slice(5), y: +x.knee.flex })), { unit: '°', color: '#3df5a7', target: info.idx < 2 ? (info.idx < 1 ? 90 : 120) : 135 })}</div>

  <div class="panel"><div class="panel-title">Arc goals</div><ul class="list">${ph.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
    <div class="hr"></div><div class="panel-title" style="color:var(--green)">To unlock the next arc</div><ul class="list">${ph.exit.map(g => `<li>${esc(g)}</li>`).join('')}</ul></div>

  <div class="panel"><div class="panel-title" style="color:var(--red)">Red flags — see a doctor</div><ul class="list flags">${RED_FLAGS.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>
  ${comebackPanel()}
  ${quoteCard(LEGENDS.find(l => l.by === 'Thors') || LEGENDS[0])}
  <div class="disclaimer">This is a general, criteria-based ACL plan to help you stay consistent. It does not replace your surgeon or physiotherapist. Move to the next phase when they clear you, not just because the weeks have passed.</div>`;
}
function comebackPanel() {
  return `<div class="panel"><div class="panel-title">They came back stronger</div>${COMEBACKS.map(c => `<div class="comeback"><b>${esc(c.who)}</b><div class="small muted">${esc(c.what)}</div></div>`).join('')}</div>`;
}

/* ================= PLAN ================= */
let planTab = 'today';
const G = { token: null, exp: 0, events: [], mails: [], unread: 0, err: '' };
function agenda(k) {
  const wd = fromKey(k).getDay(), items = [];
  for (const e of S.schedule) if (e.days.includes(wd)) items.push({ time: e.start, end: e.end, title: e.type === 'uni' && e.subject ? `${e.subject}${e.kind ? ' · ' + e.kind : ''}` : e.title, sub: [EVENT_TYPES[e.type]?.label, e.loc].filter(Boolean).join(' · '), type: e.type, id: e.id, att: e.type === 'uni' ? k : null });
  const tk = tplKeyFor(k);
  if (tk !== 'rest' && !items.some(i => i.type === 'gym')) items.push({ time: '', title: `Gym — ${TEMPLATES[tk].name}`, sub: template(tk).sub, type: 'gym', go: 'train' });
  if (aclInfo() && !items.some(i => i.type === 'rehab')) items.push({ time: '', title: `Rehab — ${aclInfo().phase.arc}`, sub: aclInfo().phase.title, type: 'rehab', go: 'rehab' });
  for (const t of S.tasks) if (!t.done && t.due === k) items.push({ time: '', title: t.title, sub: `Due today · ${t.type}`, type: 'study' });
  for (const e of G.events) {
    if (e.start.slice(0, 10) !== k) continue;
    items.push({ time: e.allDay ? '' : e.start.slice(11, 16), end: e.allDay ? '' : e.end.slice(11, 16), title: e.title, sub: ['Google Calendar', e.loc].filter(Boolean).join(' · '), type: 'other' });
  }
  return items.sort((a, b) => toMin(a.time) - toMin(b.time));
}
function agendaRow(i) {
  const now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
  const isNow = i.time && i.end && toMin(i.time) <= nm && nm < toMin(i.end);
  const attrs = i.id ? `data-action="ev-edit" data-id="${i.id}" role="button" tabindex="0"` : i.go ? `data-go="${i.go}" role="button" tabindex="0"` : '';
  return `<div class="agenda-item ${isNow ? 'now' : ''}" ${attrs} style="--ev:${EVENT_TYPES[i.type]?.color || '#3df5a7'}">
    <div class="agenda-time">${i.time || '—'}${i.end ? `<br><span class="muted">${i.end}</span>` : ''}</div><span class="agenda-bar"></span>
    <div class="spacer"><div class="nm">${esc(i.title)}${isNow ? ' <span class="pill-note">NOW</span>' : ''}</div><div class="sub">${esc(i.sub || '')}</div></div>${i.att && i.att <= dkey() ? attendButtons(i.att, i.id) : ''}</div>`;
}
function renderPlan() {
  const tabs = [['today', 'Today'], ['uni', 'Uni'], ['week', 'Week'], ['tasks', 'Tasks'], ['connect', 'Sync']];
  const body = { today: planToday, uni: planUni, week: planWeek, tasks: planTasks, connect: planConnect }[planTab]();
  return `<h1 class="page">PLAN</h1><p class="page-sub">University, gym, rehab — one timeline.</p>
    <div class="seg-tabs">${tabs.map(([k, l]) => `<button class="${planTab === k ? 'on' : ''}" data-action="plan-tab" data-t="${k}">${l}</button>`).join('')}</div>${body}`;
}
function planToday() {
  const k = dkey(), ag = agenda(k), tmr = agenda(addDays(k, 1));
  const soon = S.tasks.filter(t => !t.done && t.due && t.due >= k && t.due <= addDays(k, 7)).sort((a, b) => a.due.localeCompare(b.due));
  return `<div class="panel sys"><div class="panel-title">${esc(fmtDate(k))} <small><button class="chip" data-action="ev-new">${ic('plus')} Add</button></small></div>
    ${ag.length ? ag.map(agendaRow).join('') : `<div class="empty">Free day. Add your lectures in Week.</div>`}</div>
    ${G.token ? `<div class="panel"><div class="panel-title">Inbox <small>${G.unread} unread</small></div>${mailList()}</div>` : ''}
    <div class="panel"><div class="panel-title">Due this week</div>${soon.length ? soon.map(taskRow).join('') : `<div class="empty">No deadlines in the next 7 days.</div>`}</div>
    <div class="panel"><div class="panel-title">Tomorrow</div>${tmr.length ? tmr.map(agendaRow).join('') : `<div class="empty">Nothing yet.</div>`}</div>`;
}
function planWeek() {
  const tw = new Date().getDay();
  return `<button class="btn primary block" style="margin-bottom:14px" data-action="ev-new">${ic('plus')} Add lecture / gym / event</button>
  <div class="panel">${WEEK_ORDER.map(wd => {
    const its = S.schedule.filter(e => e.days.includes(wd)).sort((a, b) => toMin(a.start) - toMin(b.start));
    return `<div class="week-day ${wd === tw ? 'today' : ''}"><h4><span>${DAY_NAMES[wd].toUpperCase()} <span class="ar">${DAY_AR[wd]}</span></span><span>${TEMPLATES[S.split[wd]]?.name || ''}</span></h4>
      ${its.length ? its.map(e => agendaRow({ time: e.start, end: e.end, title: e.title, sub: [EVENT_TYPES[e.type]?.label, e.loc].filter(Boolean).join(' · '), type: e.type, id: e.id })).join('') : `<div class="empty">—</div>`}</div>`;
  }).join('')}</div>`;
}
function taskRow(t) {
  const k = dkey();
  const cls = !t.due ? '' : t.due < k ? 'late' : t.due <= addDays(k, 2) ? 'soon' : '';
  const label = !t.due ? 'No date' : t.due === k ? 'Today' : t.due === addDays(k, 1) ? 'Tomorrow' : fmtDate(t.due);
  return `<div class="task ${t.done ? 'done' : ''}"><button class="qbox" style="${t.done ? 'background:var(--cyan);color:#001' : ''}" data-action="task-toggle" data-id="${t.id}" aria-label="Toggle ${esc(t.title)}">${t.done ? ic('check') : ''}</button>
    <div class="spacer"><div class="nm">${esc(t.title)}</div><div class="small muted">${esc(t.type)}</div></div>
    <span class="due ${cls}">${esc(label)}</span><button class="x" data-action="task-del" data-id="${t.id}" aria-label="Delete">${ic('x')}</button></div>`;
}
function planTasks() {
  const open = S.tasks.filter(t => !t.done).sort((a, b) => (a.due || '9').localeCompare(b.due || '9'));
  const done = S.tasks.filter(t => t.done).slice(-10);
  return `<div class="panel sys"><div class="panel-title">New task</div>
    <input id="tk_title" placeholder="Exam, assignment, form check…" aria-label="Task title">
    <div class="grid2"><div><label for="tk_due">Due</label><input id="tk_due" type="date"></div><div><label for="tk_type">Type</label>
    <select id="tk_type"><option>Exam</option><option>Assignment</option><option>Project</option><option>Personal</option></select></div></div>
    <button class="btn primary block" style="margin-top:12px" data-action="task-save">Add task</button></div>
  <div class="panel"><div class="panel-title">Open <small>${open.length}</small></div>${open.length ? open.map(taskRow).join('') : `<div class="empty">All clear.</div>`}</div>
  ${done.length ? `<div class="panel"><div class="panel-title">Done</div>${done.map(taskRow).join('')}</div>` : ''}`;
}
function mailList() {
  return G.mails.length ? G.mails.map(m => `<a class="mail" style="display:block;color:inherit;text-decoration:none" href="https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(m.id)}" target="_blank" rel="noopener"><div class="from">${esc(m.from)}</div><div class="subj">${esc(m.subj || '(no subject)')}</div></a>`).join('') : `<div class="empty">Inbox zero.</div>`;
}
function planConnect() {
  return `<div class="panel sys"><div class="panel-title">iPhone Calendar + reminders</div>
    <p class="small muted">Export your weekly timetable and deadlines to the iPhone Calendar. You get a native notification 15 minutes before every lecture and gym session, and the day before each deadline.</p>
    <button class="btn primary block" data-action="ics">${ic('cal')} Export to Calendar (.ics)</button></div>
  <div class="panel"><div class="panel-title">Google Calendar + Gmail</div>
    ${G.token ? `<p class="small" style="color:var(--green)">Connected. Showing the next 7 days and unread mail.</p>
      <button class="btn cyan block" data-action="g-refresh">Refresh</button>
      <div class="hr"></div>
      <div class="panel-title">Upcoming events</div>
      ${G.events.length ? G.events.slice(0, 12).map(e => `<div class="agenda-item"><div class="agenda-time">${e.allDay ? 'ALL DAY' : e.start.slice(11, 16)}</div><span class="agenda-bar"></span><div class="spacer"><div class="nm">${esc(e.title)}</div><div class="sub">${esc(fmtDate(e.start.slice(0, 10)))}</div></div></div>`).join('') : `<div class="empty">No events this week.</div>`}
      <div class="hr"></div><div class="panel-title">Unread mail <small>${G.unread}</small></div>${mailList()}`
    : `<p class="small muted">Read-only access to your calendar and unread emails, right inside ARISE. One-time setup: create a free Google Cloud client ID and paste it in Settings (steps are in the README).</p>
      ${G.err ? `<div class="penalty"><b>ERROR</b>${esc(G.err)}</div>` : ''}
      <button class="btn cyan block" data-action="g-connect">${ic('link')} Connect Google</button>`}
    <div class="grid2" style="margin-top:10px">
      <a class="btn" href="https://mail.google.com" target="_blank" rel="noopener">${ic('mail')} Gmail</a>
      <a class="btn" href="calshow://">${ic('cal')} Calendar</a>
    </div></div>`;
}
function openEvent(id) {
  const e = S.schedule.find(x => x.id === id) || { title: '', type: 'uni', days: [new Date().getDay()], start: '09:00', end: '10:30', loc: '' };
  openSheet(`<h2>${id ? 'EDIT' : 'NEW'} EVENT</h2>
    <label for="ev_title">Title</label><input id="ev_title" value="${esc(e.title)}" placeholder="e.g. Anatomy lecture / Gym">
    <label>Type</label>${seg('ev_type', Object.entries(EVENT_TYPES).map(([k, v]) => [k, v.label]), e.type)}
    <label>Repeats every</label><div class="chips" style="flex-wrap:wrap">${WEEK_ORDER.map(wd => `<button class="chip ${e.days.includes(wd) ? 'on' : ''}" data-action="ev-day" data-wd="${wd}">${DAY_NAMES[wd]}</button>`).join('')}</div>
    <div class="grid2"><div><label for="ev_s">Start</label><input id="ev_s" type="time" value="${e.start}"></div><div><label for="ev_e">End</label><input id="ev_e" type="time" value="${e.end}"></div></div>
    <label for="ev_loc">Location</label><input id="ev_loc" value="${esc(e.loc)}" placeholder="Hall / gym name">
    <div class="grid2"><div><label for="ev_sub">Subject (uni)</label><input id="ev_sub" value="${esc(e.subject || '')}" placeholder="e.g. Physiology"></div>
    <div><label>Kind</label>${seg('ev_kind', [['Lecture', 'Lecture'], ['Section', 'Section']], e.kind || 'Lecture')}</div></div>
    <button class="btn primary block" style="margin-top:16px" data-action="ev-save" data-id="${id || ''}">Save</button>
    ${id ? `<button class="btn danger block" style="margin-top:8px" data-action="ev-del" data-id="${id}">Delete</button>` : ''}`);
}

/* ----- ICS ----- */
function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
async function exportICS() {
  const BY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const now = new Date(), stamp = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ARISE//Personal System//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:ARISE'];
  const nextOf = days => { for (let i = 0; i < 7; i++) { const k = addDays(dkey(), i); if (days.includes(fromKey(k).getDay())) return k; } return dkey(); };
  const dt = (k, t) => `${k.replace(/-/g, '')}T${(t || '09:00').replace(':', '')}00`;
  for (const e of S.schedule) {
    if (!e.days.length) continue;
    const k = nextOf(e.days);
    L.push('BEGIN:VEVENT', `UID:${e.id}@arise`, `DTSTAMP:${stamp}`, `DTSTART:${dt(k, e.start)}`, `DTEND:${dt(k, e.end || e.start)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${e.days.map(d => BY[d]).join(',')}`, `SUMMARY:${icsEsc(e.title)}`);
    if (e.loc) L.push(`LOCATION:${icsEsc(e.loc)}`);
    L.push('BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(e.title)}`, 'END:VALARM', 'END:VEVENT');
  }
  for (const t of S.tasks.filter(x => !x.done && x.due)) {
    const d = t.due.replace(/-/g, ''), nx = addDays(t.due, 1).replace(/-/g, '');
    L.push('BEGIN:VEVENT', `UID:${t.id}@arise`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${nx}`, `SUMMARY:${icsEsc(`${t.type}: ${t.title}`)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT15H', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(t.title)}`, 'END:VALARM', 'END:VEVENT');
  }
  L.push('END:VCALENDAR');
  if (L.length < 7) { toast('SYSTEM', 'Add some events or tasks first.'); return; }
  await shareOrDownload('arise-schedule.ics', L.join('\r\n'), 'text/calendar');
}
async function shareOrDownload(name, text, type) {
  const file = new File([text], name, { type });
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; }
  } catch (e) { if (e.name === 'AbortError') return; }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
}

/* ----- Google (optional) ----- */
async function gConnect() {
  const id = (S.settings.googleClientId || '').trim();
  if (!id) { toast('SYSTEM', 'Paste your Google Client ID in Settings first.'); openSettings(); return; }
  try {
    await loadScript('https://accounts.google.com/gsi/client');
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: id,
      scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly',
      callback: async r => {
        if (r.error) { G.err = r.error_description || r.error; render(); return; }
        G.token = r.access_token; G.exp = Date.now() + (r.expires_in - 60) * 1000; G.err = '';
        await gFetchAll(); render();
      },
    });
    client.requestAccessToken();
  } catch (e) { G.err = e.message; render(); }
}
async function gApi(url) {
  if (Date.now() > G.exp) { G.token = null; throw new Error('Session expired — connect again.'); }
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + G.token } });
  if (!r.ok) throw new Error(`Google API error ${r.status}`);
  return r.json();
}
async function gFetchAll() {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 8);
    const ev = await gApi(`https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=60&timeMin=${start.toISOString()}&timeMax=${end.toISOString()}`);
    const localIso = s => { if (s.length === 10) return s; const d = new Date(s); return `${dkey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
    G.events = (ev.items || []).map(e => ({ title: e.summary || '(no title)', start: localIso(e.start.dateTime || e.start.date), end: localIso(e.end?.dateTime || e.end?.date || e.start.date), allDay: !e.start.dateTime, loc: e.location || '' }));
    const list = await gApi('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8&q=' + encodeURIComponent('is:unread in:inbox'));
    G.unread = list.resultSizeEstimate || 0;
    G.mails = await Promise.all((list.messages || []).map(async m => {
      const d = await gApi(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`);
      const h = n => (d.payload?.headers || []).find(x => x.name === n)?.value || '';
      return { id: m.id, from: h('From').replace(/<.*>/, '').replace(/"/g, '').trim(), subj: h('Subject') };
    }));
  } catch (e) { G.err = e.message; }
}

/* ================= Sheets: settings & legends ================= */
let legendCat = 'all';
function openLegends() {
  const cats = [['all', 'All'], ['anime', 'Anime'], ['football', 'Football'], ['basketball', 'Basketball'], ['f1', 'Formula 1'], ['combat', 'Combat']];
  const list = LEGENDS.filter(l => legendCat === 'all' || l.cat === legendCat);
  openSheet(`<h2>HALL OF LEGENDS</h2><p class="small muted">Words from the ones who refused to stay down.</p>
    <div class="chips" style="margin-bottom:12px">${cats.map(([k, l]) => `<button class="chip ${legendCat === k ? 'on' : ''}" data-action="legend-cat" data-c="${k}">${l}</button>`).join('')}</div>
    ${list.map(q => quoteCard(q)).join('')}`);
}
function openSettings() {
  const p = S.profile || {}, o = p.override || {}, t = targets();
  openSheet(`<h2>SETTINGS</h2>
    <div class="panel">${profileForm(p)}</div>
    <div class="panel"><div class="panel-title">Manual targets <small>leave empty = auto</small></div>
      <div class="grid2">
        <div><label for="o_k">Calories</label><input id="o_k" type="number" inputmode="numeric" value="${o.kcal || ''}" placeholder="${t.kcal}"></div>
        <div><label for="o_p">Protein g</label><input id="o_p" type="number" inputmode="numeric" value="${o.p || ''}" placeholder="${t.p}"></div>
        <div><label for="o_c">Carbs g</label><input id="o_c" type="number" inputmode="numeric" value="${o.c || ''}" placeholder="${t.c}"></div>
        <div><label for="o_f">Fat g</label><input id="o_f" type="number" inputmode="numeric" value="${o.f || ''}" placeholder="${t.f}"></div>
      </div></div>
    <div class="panel"><div class="panel-title">Google sync (optional)</div>
      <label for="g_id">OAuth Client ID</label><input id="g_id" value="${esc(S.settings.googleClientId || '')}" placeholder="xxxx.apps.googleusercontent.com" autocomplete="off"></div>
    <button class="btn primary block" data-action="settings-save">Save</button>
    <div class="panel" style="margin-top:14px"><div class="panel-title">Backup</div>
      <p class="small muted">Everything lives on this phone only. Export a backup every week or two.</p>
      <div class="grid2"><button class="btn cyan" data-action="backup-export">${ic('download')} Export</button>
      <label class="btn" style="margin:0;color:var(--text);font-size:14px">Import<input type="file" accept="application/json,.json" data-change="import" hidden></label></div>
      <button class="btn danger block" style="margin-top:10px" data-action="reset-all">Reset everything</button></div>
    <p class="small muted" style="text-align:center">ARISE · v1.0 · your data never leaves this device unless you export it.</p>`);
}

/* ================= Actions ================= */
const A = {
  'close-sheet': () => closeSheet(),
  'open-settings': () => openSettings(),
  'open-legends': () => openLegends(),
  'legend-cat': el => { legendCat = el.dataset.c; openLegends(); },
  seg: el => { $('#' + el.dataset.for).value = el.dataset.val; $$('button', el.parentElement).forEach(b => b.classList.toggle('on', b === el)); },
  'ob-submit': () => {
    const p = readProfileForm();
    if (!p) return;
    S.profile = p;
    S.weights.push({ date: dkey(), kg: p.weight });
    save(); go('home');
    queueToast('SYSTEM', 'You have become a Player.', `Welcome, ${p.name}`, 'levelup');
  },
  'open-checkin': () => openCheckin(),
  'open-profile': () => openProfile(),
  'open-photos': () => openPhotos(),
  'photo-pose': el => { photoPose = el.dataset.p; openPhotos(); },
  'photo-del': async el => { if (!confirm('Delete this photo? It cannot be undone.')) return; await PH.del(el.dataset.id); openPhotos(); },
  theme: el => { S.settings.theme = el.dataset.t; save(); applyTheme(); openProfile(); render(); },
  'me-save': () => { S.me = { player: val('me_player'), club: val('me_club'), anime: val('me_anime'), pos: val('me_pos'), love: val('me_love'), hate: val('me_hate'), motto: val('me_motto') }; save(); toast('SYSTEM', 'Profile saved.'); openProfile(); },
  'gear-new': () => openGearNew(),
  'gear-save': () => { const n = val('gr_n'); if (!n) return; S.gear = [...(S.gear || []), { id: uid(), name: n, type: val('gr_t'), note: val('gr_note'), km: +val('gr_max') ? 0 : null, max: +val('gr_max') || null }]; save(); openProfile(); },
  'gear-del': el => { if (!confirm('Remove this item?')) return; S.gear = S.gear.filter(g => g.id !== el.dataset.id); save(); openProfile(); },
  'gear-km': el => { const g = S.gear.find(x => x.id === el.dataset.id); const n = parseFloat(prompt(`Add km to ${g.name}:`, '5')); if (n > 0) { g.km = (g.km || 0) + n; save(); openProfile(); } },
  'boss-claim': () => { const b = bossOfWeek(); if (!b.slain || b.claimed) return; S.bosses = { ...(S.bosses || {}), [b.week]: b.id }; addXp(300); save(); burst('boss', 'FELLED'); toast('BOSS DEFEATED', b.name, '+300 XP', 'levelup'); render(); },
  att: el => { const key = attKey(el.dataset.k, el.dataset.id); S.attend = { ...(S.attend || {}) }; S.attend[key] = S.attend[key] === el.dataset.v ? undefined : el.dataset.v; if (!S.attend[key]) delete S.attend[key]; save(); render(); },
  'att-base': el => {
    const name = el.dataset.s, sub = uniSubjects().find(x => x.name === name);
    const n = prompt(`Absences in ${name} BEFORE you started tracking in ARISE (from the uni system):`, String(sub?.base ?? 0));
    if (n === null) return; const v = parseInt(n, 10); if (!(v >= 0)) return;
    S.uni = { ...(S.uni || {}), base: { ...(S.uni?.base || {}), [name]: v } }; save(); render();
  },
  'att-limit': el => { const n = parseInt(prompt(`Allowed absences for ${el.dataset.s}:`, '3'), 10); if (n >= 0) { S.uni = { ...(S.uni || {}), limits: { ...(S.uni?.limits || {}), [el.dataset.s]: n } }; save(); render(); } },
  'go-uni': () => { planTab = 'uni'; go('plan'); },
  'exam-new': () => openExam(),
  'exam-edit': el => openExam(el.dataset.id),
  'exam-save': el => { const x = { id: el.dataset.id || uid(), subject: val('ex_s'), date: val('ex_d'), time: val('ex_t'), loc: val('ex_l') }; if (!x.subject || !x.date) { toast('SYSTEM', 'Add a subject and a date.'); return; } S.exams = [...(S.exams || []).filter(e => e.id !== x.id), x]; save(); closeSheet(); render(); },
  'exam-del': el => { S.exams = (S.exams || []).filter(e => e.id !== el.dataset.id); save(); closeSheet(); render(); },
  'checkin-save': () => {
    const sleep = clamp(+val('ci_sleep') || 0, 0, 14);
    day().ready = { sleep, q: +val('ci_q'), sore: +val('ci_sore'), knee: +val('ci_knee'), energy: +val('ci_energy') };
    closeSheet(); evaluate(); render();
    const rd = readiness();
    toast('READINESS', `${rd.score}% — ${rd.zone === 'go' ? 'primed' : rd.zone === 'mid' ? 'steady' : 'recover'}`);
  },
  'open-steps': () => openSteps(),
  'band-paste': () => pasteBand(),
  'band-help': () => openBandHelp(),
  'acl-cleared': () => {
    if (!confirm('Only tap OK if your physio or surgeon has cleared you for running, jumping and cutting (usually hop tests ≥ 90% of the other leg).')) return;
    S.profile.acl.cleared = true; save(); render(); toast('SYSTEM', 'ARC V unlocked. Build up slowly.');
  },
  'steps-add': el => { const i = $('#st_n'); i.value = (+i.value || 0) + +el.dataset.n; },
  'steps-save': () => { day().steps = Math.max(0, Math.round(+val('st_n') || 0)); closeSheet(); evaluate(); render(); },
  'go-fuel': () => go('fuel'),
  'go-body': () => { trainTab = 'body'; go('train'); },
  'quest-toggle': el => { const d = day(); d.manual[el.dataset.id] = !d.manual[el.dataset.id]; evaluate(); render(); },
  'quote-next': () => { quoteShift++; render(); },
  // Fuel
  'fuel-daytype': el => { day(fuelDate).train = el.dataset.v === '1'; save(); evaluate(); render(); },
  'fuel-date': el => { const n = +el.dataset.d; const k = addDays(fuelDate, n); if (k <= dkey()) { fuelDate = k; render(); } },
  'open-scan': () => openScan(),
  'open-search': el => openSearch(el.dataset.meal),
  'sheet-x': () => closeSheet(),
  'open-quick': () => openQuick(),
  'open-custom': () => openCustom({ name: val('sq') }),
  'search-tab': el => { searchTab = el.dataset.t; $$('[data-action="search-tab"]').forEach(b => b.classList.toggle('on', b === el)); renderResults(); },
  'search-online': () => searchOnline(),
  'pick-food': el => { const f = lastResults[+el.dataset.i]; if (f) openFoodSheet(f, searchMeal); },
  srv: el => { $('#fs_g').value = el.dataset.g; fsPreview(); },
  'fs-add': () => {
    const g = +val('fs_g');
    if (!g) { toast('SYSTEM', 'Enter an amount in grams.'); return; }
    logFood(FS.food, g, val('fs_meal'));
    closeSheet(); render();
    toast('LOGGED', `${FS.food.name} · ${r0(calc(FS.food, g).kcal)} kcal`);
  },
  'del-food': el => { const d = day(fuelDate); d.foods = d.foods.filter(f => f.id !== el.dataset.id); evaluate(fuelDate); render(); },
  water: el => { day(fuelDate).water = Math.max(0, +el.dataset.n); evaluate(fuelDate); render(); },
  'manual-barcode': () => { const c = val('bc'); if (c) stopScan().then(() => lookupBarcode(c)); },
  'custom-save': () => {
    const f = { id: uid(), name: val('cf_name'), kcal: +val('cf_k'), p: +val('cf_p') || 0, c: +val('cf_c') || 0, f: +val('cf_f') || 0, code: val('cf_code') || undefined, src: 'MINE' };
    if (!f.name || !val('cf_k')) { toast('SYSTEM', 'Name and calories are required.'); return; }
    const s = +val('cf_s');
    f.srv = s ? [['1 serving', s], ['100 g', 100]] : [['100 g', 100]];
    S.customFoods = [f, ...S.customFoods.filter(x => !(f.code && x.code === f.code))];
    save(); openFoodSheet(f);
  },
  'quick-save': () => {
    const k = +val('qa_k');
    if (!k) { toast('SYSTEM', 'Enter the calories.'); return; }
    day(fuelDate).foods.push({ id: uid(), name: val('qa_name') || 'Quick add', g: 0, meal: val('qa_meal'), kcal: k, p: +val('qa_p') || 0, c: +val('qa_c') || 0, f: +val('qa_f') || 0 });
    evaluate(fuelDate); closeSheet(); render();
  },
  'diet-plan': () => dietPlan(),
  'plan-swap': el => openSwap(+el.dataset.mi, +el.dataset.ii, el.dataset.role),
  'plan-pick': el => { S.planSwaps = { ...(S.planSwaps || {}), [el.dataset.k]: el.dataset.id }; save(); dietPlan(); toast('SWAPPED', 'Amounts re-balanced to your targets.'); },
  'plan-reset': () => { S.planSwaps = {}; save(); dietPlan(); },
  'log-plan-meal': el => {
    const m = window.__plan?.[+el.dataset.i];
    if (!m) return;
    const meal = { Breakfast: 'breakfast', Lunch: 'lunch', Dinner: 'dinner' }[m.meal] || 'snacks';
    m.items.forEach(([id, g]) => logFood(FOODS.find(f => f.id === id), g, meal, dkey()));
    toast('LOGGED', `${m.meal} added to today`);
    render();
  },
  // Train
  'train-tab': el => { trainTab = el.dataset.t; render(); },
  'train-day': el => { trainWd = +el.dataset.wd; render(); },
  'set-tpl': el => { const w = workout(); if (w.tpl !== el.dataset.tpl) { w.tpl = el.dataset.tpl; w.done = false; } evaluate(); render(); },
  'set-done': el => {
    const w = workout(), t = template(w.tpl), e = t.ex[+el.dataset.ei], s = exSets(w, e)[+el.dataset.si];
    s.done = !s.done;
    if (s.done) {
      const kg = +s.w, reps = parseInt(s.r, 10) || parseInt(e[2], 10) || 0;
      if (!s.r && reps) s.r = String(reps);
      if (kg) S.lastW[e[0]] = s.w;
      if (kg && reps) {
        const e1 = kg * (1 + reps / 30), pr = S.prs[e[0]];
        if (!pr || e1 > pr.e + 0.01) {
          S.prs[e[0]] = { w: kg, r: reps, e: e1, date: dkey() };
          if (pr) queueToast('NEW RECORD', e[0], `${kg} kg × ${reps}`);
        }
      }
      startRest(e[3]);
    }
    save(); render();
  },
  'add-set': el => { const w = workout(), e = template(w.tpl).ex[+el.dataset.ei], sets = exSets(w, e); const last = sets[sets.length - 1]; sets.push({ w: last?.w ?? '', r: '', done: false }); save(); render(); },
  'finish-workout': () => {
    const w = workout(), t = template(w.tpl);
    let vol = 0, n = 0;
    t.ex.forEach(e => (w.sets[e[0]] || []).forEach(s => { if (s.done) { n++; vol += (+s.w || 0) * (parseInt(s.r, 10) || 0); } }));
    if (!n) { toast('SYSTEM', 'Complete at least one set first.'); return; }
    w.done = true;
    S.history = S.history.filter(h => h.date !== dkey());
    S.history.push({ date: dkey(), tpl: w.tpl, volume: vol, sets: n });
    stopRest(); evaluate(); render();
    queueToast('GATE CLEARED', `${n} sets · ${r0(vol)} kg volume`);
  },
  'reopen-workout': () => { workout().done = false; S.history = S.history.filter(h => h.date !== dkey()); evaluate(); render(); },
  'timer-add': () => { RT.end += 15000; tickRest(); },
  'timer-close': () => stopRest(),
  'weight-save': () => {
    const kg = +val('bw');
    if (!kg) return;
    S.weights = S.weights.filter(w => w.date !== dkey());
    S.weights.push({ date: dkey(), kg, waist: +val('bwaist') || null });
    S.profile.weight = kg;
    save(); render(); toast('SYSTEM', `Weight ${kg} kg saved. Targets updated.`);
  },
  // Rehab
  'rehab-toggle': el => { const d = day(), id = el.dataset.id; d.rehab.done = d.rehab.done.includes(id) ? d.rehab.done.filter(x => x !== id) : [...d.rehab.done, id]; evaluate(); render(); },
  'knee-save': () => {
    day().knee = { pain: +val('kp'), swell: val('ks'), flex: val('kf') ? +val('kf') : null, ext: val('ke') ? +val('ke') : null };
    evaluate(); render();
    if (+val('kp') <= 2) toast('SYSTEM', 'Knee looking good. Keep stacking days.');
  },
  // Plan
  'plan-tab': el => { planTab = el.dataset.t; render(); },
  'ev-new': () => openEvent(null),
  'ev-edit': el => openEvent(el.dataset.id),
  'ev-day': el => el.classList.toggle('on'),
  'ev-save': el => {
    const days = $$('[data-action="ev-day"].on').map(b => +b.dataset.wd);
    const e = { id: el.dataset.id || uid(), title: val('ev_title'), type: val('ev_type'), days, start: val('ev_s'), end: val('ev_e'), loc: val('ev_loc'), subject: val('ev_sub') || '', kind: val('ev_kind') || 'Lecture' };
    if (!e.title || !days.length) { toast('SYSTEM', 'Add a title and at least one day.'); return; }
    S.schedule = [...S.schedule.filter(x => x.id !== e.id), e];
    save(); closeSheet(); render();
  },
  'ev-del': el => { S.schedule = S.schedule.filter(x => x.id !== el.dataset.id); save(); closeSheet(); render(); },
  'task-save': () => {
    const title = val('tk_title');
    if (!title) return;
    S.tasks.push({ id: uid(), title, due: val('tk_due'), type: val('tk_type'), done: false });
    save(); render();
  },
  'task-toggle': el => { const t = S.tasks.find(x => x.id === el.dataset.id); if (t) t.done = !t.done; save(); render(); },
  'task-del': el => { S.tasks = S.tasks.filter(x => x.id !== el.dataset.id); save(); render(); },
  ics: () => exportICS(),
  'g-connect': () => gConnect(),
  'g-refresh': async () => { await gFetchAll(); render(); },
  // Settings
  'settings-save': () => {
    const p = readProfileForm(S.profile);
    if (!p) return;
    p.override = { kcal: +val('o_k') || null, p: +val('o_p') || null, c: +val('o_c') || null, f: +val('o_f') || null };
    S.profile = p;
    S.settings.googleClientId = val('g_id');
    save(); closeSheet(); render(); toast('SYSTEM', 'Profile updated.');
  },
  'backup-export': () => shareOrDownload(`arise-backup-${dkey()}.json`, JSON.stringify(S), 'application/json'),
  'reset-all': () => {
    if (!confirm('Delete ALL ARISE data on this phone? This cannot be undone. Export a backup first if unsure.')) return;
    localStorage.removeItem(STORE); S = DEFAULT_STATE(); closeSheet(); go('home');
  },
};
const CHANGE = {
  'photo-add': async el => {
    const f = el.files?.[0]; if (!f) return;
    try { const blob = await shrink(f); await PH.put({ id: uid(), date: dkey(), pose: photoPose, blob }); toast('SYSTEM', 'Photo saved on this phone.'); openPhotos(); }
    catch (e) { toast('SYSTEM', 'Could not save the photo: ' + e.message); }
  },
  split: el => { S.split[+el.dataset.wd] = el.value; save(); },
  phase: el => { S.profile.acl.override = el.value; save(); evaluate(); render(); },
  import: el => {
    const f = el.files?.[0];
    if (!f) return;
    f.text().then(txt => {
      const data = JSON.parse(txt);
      if (data && data.__merge) {
        const ids = new Set((data.schedule || []).map(e => e.id));
        S.schedule = [...S.schedule.filter(e => !ids.has(e.id)), ...(data.schedule || [])];
        if (data.exams) { const ex = new Set(data.exams.map(e => e.id)); S.exams = [...(S.exams || []).filter(e => !ex.has(e.id)), ...data.exams]; }
        if (data.uni) S.uni = { ...(S.uni || {}), ...data.uni };
        if (data.profilePatch && S.profile) S.profile = { ...S.profile, ...data.profilePatch, acl: { ...(S.profile.acl || {}), ...(data.profilePatch.acl || {}) } };
        if (data.me) S.me = { ...(S.me || {}), ...data.me };
        save(); closeSheet(); planTab = 'uni'; go('plan'); toast('SYSTEM', 'University data added.'); return;
      }
      if (!data || typeof data !== 'object' || !('days' in data)) throw new Error('Not an ARISE backup');
      S = Object.assign(DEFAULT_STATE(), data); migrate(); save(); closeSheet(); render(); toast('SYSTEM', 'Backup restored.');
    }).catch(e => toast('SYSTEM', 'Import failed: ' + e.message));
  },
};

/* ================= Events ================= */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-action]');
  if (a && !a.disabled) { e.preventDefault(); A[a.dataset.action]?.(a, e); return; }
  const g = e.target.closest('[data-go]');
  if (g) { if (g.closest('.sheet')) closeSheet(); go(g.dataset.go); }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"]')) { e.preventDefault(); e.target.click(); }
  if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet();
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'fs_g') fsPreview();
  if (t.classList?.contains('cmp-range')) t.closest('.cmp').style.setProperty('--pos', t.value + '%');
  if (t.id === 'sq') { clearTimeout(searchTimer); searchTimer = setTimeout(() => renderResults(), 120); }
  if (t.dataset.set) {
    const [ei, si, f] = t.dataset.set.split(':');
    const w = workout(), e2 = template(w.tpl).ex[+ei];
    exSets(w, e2)[+si][f] = t.value;
    save();
  }
});
document.addEventListener('change', e => { const c = e.target.dataset?.change; if (c) CHANGE[c]?.(e.target); });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'sq') searchOnline(); if (e.key === 'Enter' && e.target.id === 'bc') A['manual-barcode'](); });
window.addEventListener('hashchange', () => { const r = location.hash.slice(1); if (r && r !== route) { route = r; render(); } });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (fuelDate > dkey()) fuelDate = dkey(); render(); } });

/* ================= Motion ================= */
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function countUp(el) {
  const to = +el.dataset.count, dec = +(el.dataset.dec || 0), suf = el.dataset.suf || '';
  if (!isFinite(to) || reduceMotion()) return;
  const t0 = performance.now(), dur = 750;
  const step = now => {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = (to * e).toFixed(dec) + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function motion(entering) {
  if (entering) $$('#view [data-count]').forEach(countUp);
  const done = $$('.quest.done');
  if (route === 'home') {
    if (lastDone) done.forEach(q => { if (!lastDone.has(q.dataset.qid)) q.classList.add('just'); });
    lastDone = new Set(done.map(q => q.dataset.qid));
  }
}
function burst(kind = 'level', label = '') {
  if (reduceMotion()) return;
  const fx = $('#fx');
  const colors = kind === 'level' ? ['#ffd60a', '#3df5a7', '#fff'] : ['#3df5a7', '#5ac8fa', '#fff'];
  const parts = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2, d = 90 + Math.random() * 110;
    return `<i style="--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px;--c:${colors[i % 3]};--r:${Math.random() * 360}deg;animation-delay:${Math.random() * 60}ms"></i>`;
  }).join('');
  fx.innerHTML = `<div class="fx-core ${kind}">${label ? `<b>${esc(label)}</b>` : ''}</div>${parts}`;
  fx.classList.toggle('on', false); void fx.offsetWidth; fx.classList.toggle('on', true);
  clearTimeout(burst.t); burst.t = setTimeout(() => { fx.classList.toggle('on', false); fx.innerHTML = ''; }, 1500);
}
/* Swipe a sheet down to close it */
(() => {
  let y0 = null, dy = 0, panel = null;
  document.addEventListener('touchstart', e => {
    panel = e.target.closest('.sheet-panel');
    if (!panel || (panel.scrollTop > 0 && !e.target.closest('.sheet-grab'))) { panel = null; return; }
    y0 = e.touches[0].clientY; dy = 0; panel.style.transition = 'none';
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (!panel || y0 == null) return;
    dy = Math.max(0, e.touches[0].clientY - y0);
    if (dy > 0) panel.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  document.addEventListener('touchend', () => {
    if (!panel) return;
    panel.style.transition = ''; panel.style.transform = '';
    if (dy > 110) closeSheet();
    panel = null; y0 = null; dy = 0;
  });
})();

/* ================= Boot ================= */
applyTheme();
if (location.hash.startsWith('#sync')) { const b = parseBand(decodeURIComponent(location.hash.replace(/[?&]/g, ' '))); history.replaceState(null, '', '#home'); route = 'home'; setTimeout(() => applyBand(b), 300); }
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
