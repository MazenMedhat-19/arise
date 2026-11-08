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
  return { phase: ACL_PHASES[idx], idx, weeks, a };
}

/* ================= Training ================= */
function template(key) {
  const t = TEMPLATES[key] || TEMPLATES.rest;
  if (key !== 'lower') return t;
  const info = aclInfo();
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
function go(r) { route = r; if (location.hash !== '#' + r) history.replaceState(null, '', '#' + r); render(); window.scrollTo(0, 0); }
function render() {
  document.body.classList.toggle('onboarding', !S.profile);
  if (!S.profile) { $('#view').innerHTML = renderOnboarding(); updateTop(); return; }
  const views = { home: renderHome, fuel: renderFuel, train: renderTrain, rehab: renderRehab, plan: renderPlan };
  if (!views[route]) route = 'home';
  $('#view').innerHTML = views[route]();
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.go === route));
  updateTop();
  afterRender();
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
    <circle cx="66" cy="66" r="${R}" fill="none" stroke="${over ? '#ff453a' : 'url(#rg)'}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" />
  </svg><div class="center"><div class="num">${r0(Math.abs(left))}</div><div class="lbl">${over ? 'KCAL OVER' : 'KCAL LEFT'}</div></div></div>`;
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
  <select id="pf_graft">${[['unknown', "Don't know"], ['patellar', 'Patellar tendon (BTB)'], ['hamstring', 'Hamstring'], ['quad', 'Quadriceps tendon'], ['allograft', 'Donor (allograft)']].map(([v, l]) => `<option value="${v}" ${a.graft === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
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

/* ================= HOME ================= */
let quoteShift = 0;
function quoteOfDay() {
  const n = Math.floor(fromKey(dkey()).getTime() / 864e5);
  return LEGENDS[(((n + quoteShift) % LEGENDS.length) + LEGENDS.length) % LEGENDS.length];
}
function quoteCard(q, extra = '') {
  return `<div class="panel quote legend-card cat-${q.cat} ${extra}"><span class="big" aria-hidden="true">"</span>
    <div class="qt">${esc(q.q)}</div><div class="qa ar">${esc(q.ar)}</div>
    <div class="qby">${esc(q.by).toUpperCase()}</div><div class="qfrom">${esc(q.from)}</div></div>`;
}
/* ================= Readiness · steps · cut trend · muscle volume ================= */
function readiness(k = dkey()) {
  const r = S.days[k]?.ready;
  if (!r) return null;
  const score = Math.round(
    clamp(r.sleep / 8, 0, 1) * 35 + ((r.q - 1) / 4) * 20 + ((5 - r.sore) / 4) * 15 + ((10 - r.knee) / 10) * 15 + ((r.energy - 1) / 4) * 15);
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
    <circle cx="36" cy="36" r="${R}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}" transform="rotate(-90 36 36)"/></svg>
    <span class="mv">${value}</span><span class="ml">${label}</span></button>`;
}
function greeting() { const h = new Date().getHours(); return h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }

function renderHome() {
  const k = dkey(), d = day(k), t = targets(), tot = totals(k), li = levelInfo(S.xp), rk = rankOf(li.lvl), st = stats(), qs = questList(k);
  const done = qs.filter(q => q.done).length, sk = streak();
  const late = new Date().getHours() >= 21 && done < 4;
  const ag = agenda(k).slice(0, 4);
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
      <div><div class="big-num">${ct.cur ? r1(ct.cur.v) : r1(S.profile.weight)}<span>kg</span></div><div class="ml">7-day average</div></div>
      <div><div class="big-num ${ct.rate == null ? 'dim' : ''}">${ct.rate == null ? '—' : (ct.rate > 0 ? '+' : '') + r1(ct.rate)}<span>kg/wk</span></div><div class="ml">${ct.pct == null ? 'weekly rate' : r1(ct.pct) + '% / week'}</div></div>
      <div><div class="big-num ${ct.proj == null ? 'dim' : ''}">${ct.proj == null ? (S.profile.targetWeight || '—') : r1(ct.proj)}<span>kg</span></div><div class="ml">${ct.proj == null ? 'target' : 'projected'}</div></div>
    </div>
    <div class="ready-tip zone-${{ fast: 'low', good: 'go', slow: 'mid', wait: 'none' }[ct.status]}"><b>${{ fast: 'TOO FAST', good: 'ON TRACK', slow: 'SLOW', wait: 'WEEKLY CHECK-IN' }[ct.status]}</b>${esc(ct.advice)}${ct.tdee ? ` Your real maintenance looks like ~${ct.tdee} kcal.` : ''}</div>
  </div>` : ''}

  <div class="panel">
    <div class="panel-title">Daily quests <small>${done}/${qs.length} · ${sk ? `${sk}-day streak` : 'start a streak'}</small></div>
    <div class="xp-line" style="margin-top:0"><span>EXP to level ${li.lvl + 1}</span><span>${li.into} / ${li.need}</span></div>${bar(li.into, li.need)}
    <div style="margin-top:8px">
    ${qs.map(qu => `
      <div class="quest ${qu.done ? 'done' : ''}" ${qu.manual ? `data-action="quest-toggle" data-id="${qu.id}" role="button" tabindex="0"` : qu.action ? `data-action="${qu.action}" role="button" tabindex="0"` : qu.go ? `data-go="${qu.go}" role="button" tabindex="0"` : ''}>
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
      ${[['Protein', tot.p, t.p, 'p'], ['Carbs', tot.c, t.c, 'c'], ['Fat', tot.f, t.f, 'f']].map(([n, c, g, cl]) => `<div><div class="macro-k">${n}</div><div class="macro-v">${r0(c)}<span>/${g}g</span></div>${bar(c, g, cl)}</div>`).join('')}
    </div>
  </div>

  <div class="panel">
    <div class="panel-title">Up next <small><button class="chip" data-go="plan">Full plan</button></small></div>
    ${ag.length ? ag.map(agendaRow).join('') : `<div class="empty">Nothing scheduled. Add your lectures and gym times in Plan.</div>`}
  </div>

  <div class="panel">
    <div class="panel-title">Hunter stats <small>${esc(rk.title)}</small></div>
    <div class="stats" style="margin-top:0">${Object.entries(st).map(([kk, v]) => `<div class="stat"><div class="k">${kk}</div><div class="v">${v}</div></div>`).join('')}</div>
  </div>`;
}

function openCheckin() {
  const r = day().ready || { sleep: 7.5, q: 3, sore: 2, knee: 0, energy: 3 };
  const five = [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']];
  openSheet(`<h2>Morning check-in</h2><p class="muted small" style="margin-top:0">20 seconds. Sets today’s readiness and tells you how hard to push.</p>
    <label for="ci_sleep">Hours slept</label><input id="ci_sleep" type="number" inputmode="decimal" step="0.5" value="${r.sleep}">
    <label>Sleep quality <small class="muted">(1 bad · 5 great)</small></label>${seg('ci_q', five, r.q)}
    <label>Muscle soreness <small class="muted">(1 none · 5 wrecked)</small></label>${seg('ci_sore', five, r.sore)}
    <label>Knee pain right now</label>${seg('ci_knee', [[0, '0'], [2, '1-2'], [4, '3-4'], [6, '5-6'], [8, '7+']], r.knee)}
    <label>Energy & mood <small class="muted">(1 flat · 5 on fire)</small></label>${seg('ci_energy', five, r.energy)}
    <button class="btn primary block" style="margin-top:18px" data-action="checkin-save">Save check-in</button>`);
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
  if (q) pool = pool.filter(f => f.name.toLowerCase().includes(q) || (f.ar || '').includes(q));
  lastResults = [...(online || []), ...pool.slice(0, 40)];
  box.innerHTML = lastResults.length ? lastResults.map((f, i) => `
    <div class="result" data-action="pick-food" data-i="${i}" role="button" tabindex="0">
      <div class="spacer"><div class="nm">${esc(f.name)}</div>${f.ar ? `<div class="ar">${esc(f.ar)}</div>` : ''}
      <div class="sub">${r0(f.kcal)} kcal · P ${r1(f.p)} · C ${r1(f.c)} · F ${r1(f.f)} per 100 g</div></div>
      <span class="src">${f.src === 'OFF' ? 'ONLINE' : f.src}</span></div>`).join('')
    : `<div class="empty">No matches here. Try Online or create a custom food.</div>`;
}
async function searchOnline() {
  const q = val('sq');
  if (q.length < 2) { toast('SYSTEM', 'Type at least 2 letters.'); return; }
  const box = $('#results');
  box.innerHTML = `<div class="empty">Searching Open Food Facts…</div>`;
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=25&fields=code,product_name,product_name_en,product_name_ar,brands,nutriments,serving_quantity,serving_size`;
    const j = await (await fetch(url)).json();
    const list = (j.products || []).map(p => offToFood(p, p.code)).filter(Boolean);
    renderResults(list);
    if (!list.length) toast('SYSTEM', 'Nothing found online.');
  } catch (e) {
    box.innerHTML = `<div class="empty">Could not reach the online database. Check your connection.</div>`;
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
  const local = S.customFoods.find(f => f.code === code) || S.recent.find(f => f.code === code);
  if (local) return openFoodSheet(local);
  openSheet(`<h2>SCANNING DATABASE</h2><p class="muted">Looking up ${esc(code)}…</p>`);
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=code,product_name,product_name_en,product_name_ar,brands,nutriments,serving_quantity,serving_size`);
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
function dietPlan() {
  const t = targets();
  const F = id => FOODS.find(f => f.id === id);
  const plan = [
    { meal: 'Breakfast', time: '08:00', items: [['f_egg', 150, 'p'], ['f_eggw', 66, 'p'], ['f_ful', 150, 'c'], ['f_baladi', 45, 'c'], ['f_salad', 100, '-']] },
    { meal: 'Lunch', time: '14:00', items: [['f_chk', 180, 'p'], ['f_rice', 200, 'c'], ['f_oil', 10, '-'], ['f_salad', 200, '-']] },
    { meal: 'Pre-gym', time: '17:00', items: [['f_greek', 170, 'p'], ['f_oats', 40, 'c'], ['f_banana', 118, 'c'], ['f_honey', 10, '-']] },
    { meal: 'Dinner', time: '21:00', items: [['f_tuna', 120, 'p'], ['f_areesh', 100, 'p'], ['f_baladi', 45, 'c'], ['f_potato', 170, 'c'], ['f_salad', 150, '-']] },
  ];
  const sum = () => plan.flatMap(m => m.items).reduce((a, [id, g]) => { const m = calc(F(id), g); return { kcal: a.kcal + m.kcal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }; }, { kcal: 0, p: 0, c: 0, f: 0 });
  // 1) scale protein foods to the protein target, 2) scale carb foods to fill the calories
  const pOnly = plan.flatMap(m => m.items).filter(i => i[2] === 'p').reduce((a, [id, g]) => a + calc(F(id), g).p, 0);
  const pf = clamp((t.p - (sum().p - pOnly)) / pOnly, 0.6, 2);
  plan.forEach(m => m.items.forEach(i => { if (i[2] === 'p') i[1] *= pf; }));
  const cK = plan.flatMap(m => m.items).filter(i => i[2] === 'c').reduce((a, [id, g]) => a + calc(F(id), g).kcal, 0);
  const cf = clamp((t.kcal - (sum().kcal - cK)) / cK, 0.3, 2.6);
  plan.forEach(m => m.items.forEach(i => { if (i[2] === 'c') i[1] *= cf; i[1] = Math.max(5, Math.round(i[1] / 5) * 5); }));
  const tot = sum();
  openSheet(`<h2>MEAL PLAN</h2><p class="small muted">Built from your targets with Egyptian staples. Swap freely: chicken ↔ fish/kofta, rice ↔ pasta/potato, tuna ↔ eggs.</p>
    ${plan.map((m, mi) => {
      const mt = m.items.reduce((a, [id, g]) => a + calc(F(id), g).kcal, 0);
      return `<div class="panel"><div class="meal-head"><h3>${m.meal.toUpperCase()} <span class="muted small">· ${m.time}</span></h3><span class="k">${r0(mt)} kcal</span></div>
      ${m.items.map(([id, g]) => { const f = F(id), c = calc(f, g); return `<div class="food"><div class="spacer"><div class="nm">${esc(f.name)} <span class="ar muted small">${esc(f.ar)}</span></div><div class="mt">${g} g · P ${r1(c.p)} · C ${r1(c.c)} · F ${r1(c.f)}</div></div><span class="kc">${r0(c.kcal)}</span></div>`; }).join('')}
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
  for (const e of S.schedule) if (e.days.includes(wd)) items.push({ time: e.start, end: e.end, title: e.title, sub: [EVENT_TYPES[e.type]?.label, e.loc].filter(Boolean).join(' · '), type: e.type, id: e.id });
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
    <div class="spacer"><div class="nm">${esc(i.title)}${isNow ? ' <span class="pill-note">NOW</span>' : ''}</div><div class="sub">${esc(i.sub || '')}</div></div></div>`;
}
function renderPlan() {
  const tabs = [['today', 'Today'], ['week', 'Week'], ['tasks', 'Tasks'], ['connect', 'Sync']];
  const body = { today: planToday, week: planWeek, tasks: planTasks, connect: planConnect }[planTab]();
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
  'checkin-save': () => {
    const sleep = clamp(+val('ci_sleep') || 0, 0, 14);
    day().ready = { sleep, q: +val('ci_q'), sore: +val('ci_sore'), knee: +val('ci_knee'), energy: +val('ci_energy') };
    closeSheet(); evaluate(); render();
    const rd = readiness();
    toast('READINESS', `${rd.score}% — ${rd.zone === 'go' ? 'primed' : rd.zone === 'mid' ? 'steady' : 'recover'}`);
  },
  'open-steps': () => openSteps(),
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
    const e = { id: el.dataset.id || uid(), title: val('ev_title'), type: val('ev_type'), days, start: val('ev_s'), end: val('ev_e'), loc: val('ev_loc') };
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
  split: el => { S.split[+el.dataset.wd] = el.value; save(); },
  phase: el => { S.profile.acl.override = el.value; save(); evaluate(); render(); },
  import: el => {
    const f = el.files?.[0];
    if (!f) return;
    f.text().then(txt => {
      const data = JSON.parse(txt);
      if (!data || typeof data !== 'object' || !('days' in data)) throw new Error('Not an ARISE backup');
      S = Object.assign(DEFAULT_STATE(), data); save(); closeSheet(); render(); toast('SYSTEM', 'Backup restored.');
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

/* ================= Boot ================= */
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
