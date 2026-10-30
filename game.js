(() => {
const C = window.GAME_CONFIG, N = C.size, LP = 450;
const $ = s => document.querySelector(s);
const K = (x, y) => x + ',' + y;
const KEY = 'thief:' + C.id;
const blank = () => ({ placed: {}, hints: {}, xs: {}, t: 0, won: false });
let S; try { S = JSON.parse(localStorage.getItem(KEY)) || blank(); } catch (e) { S = blank(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
let sel = null;
const P = Object.fromEntries(C.people.map(p => [p.id, p]));
const T = C.objectTypes, blocked = new Set();
C.objects.forEach(o => { if (!T[o.type].walkable) for (let i = 0; i < (o.w || 1); i++) for (let j = 0; j < (o.h || 1); j++) blocked.add(K(o.x + i, o.y + j)); });
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

function avatar(p) {
  const d = document.createElement('div'); d.className = 'av'; d.style.background = p.color || '#888'; d.textContent = p.name[0];
  if (p.img) { const i = new Image(); i.draggable = false; i.onload = () => { d.textContent = ''; d.appendChild(i); }; i.src = p.img; }
  return d;
}

/* ---- board ---- */
document.title = C.title; $('#title').textContent = C.title;
const board = $('#board'); board.style.setProperty('--n', N); board.style.setProperty('--lp', LP + 'ms');
const cells = {}, rm = (x, y) => C.map[y][x];
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const r = C.rooms[rm(x, y)], c = document.createElement('div');
  c.className = 'cell'; c.dataset.x = x; c.dataset.y = y; c.style.background = r.color;
  c.style.borderTopWidth = (y === 0 ? 0 : rm(x, y - 1) !== rm(x, y) ? 4 : 1) + 'px';
  c.style.borderLeftWidth = (x === 0 ? 0 : rm(x - 1, y) !== rm(x, y) ? 4 : 1) + 'px';
  if (r.floor) { const i = new Image(); i.onload = () => { c.style.backgroundImage = `url(${r.floor})`; }; i.src = r.floor; }
  c.mk = document.createElement('div'); c.mk.className = 'mk'; c.appendChild(c.mk);
  board.appendChild(c); cells[K(x, y)] = c;
}
Object.keys(C.rooms).forEach(id => {
  let b = null;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (rm(x, y) === id && (!b || y > b.y || (y === b.y && x < b.x))) b = { x, y };
  if (b) { const l = document.createElement('span'); l.className = 'lbl'; l.textContent = C.rooms[id].name; cells[K(b.x, b.y)].appendChild(l); }
});
const ol = document.createElement('div'); ol.className = 'objs'; board.appendChild(ol);
C.objects.forEach(o => {
  const t = T[o.type], w = o.w || 1, h = o.h || 1, d = document.createElement('div'); d.className = 'obj';
  d.style.cssText = `left:${o.x / N * 100}%;top:${o.y / N * 100}%;width:${w / N * 100}%;height:${h / N * 100}%;--c:${t.color}`;
  d.innerHTML = `<div class="bx"><span>${esc(t.label || o.type)}</span></div>`;
  if (t.img) { const i = new Image(); i.draggable = false; i.onload = () => { d.classList.add('has'); d.firstChild.appendChild(i); }; i.src = t.img; }
  ol.appendChild(d);
});

/* ---- cards, bar, general clues ---- */
const bar = $('#bar'), cards = $('#cards');
const xb = document.createElement('button'); xb.className = 'tool'; xb.dataset.id = 'X';
xb.innerHTML = '<div class="tx">&times;</div><span>Пусто</span>'; xb.onclick = () => choose('X'); bar.appendChild(xb);
C.people.forEach(p => {
  const card = document.createElement('div'); card.className = 'card'; card.dataset.id = p.id;
  card.innerHTML = `<div class="ph"><div class="slot"></div><div class="nm">${esc(p.name)}</div></div><div class="cl">${(C.clues[p.id] || []).map(t => `<p>${fmt(t)}</p>`).join('')}</div>`;
  card.querySelector('.slot').appendChild(avatar(p)); card.onclick = () => choose(p.id); cards.appendChild(card);
  const b = document.createElement('button'); b.className = 'tool'; b.dataset.id = p.id;
  b.appendChild(avatar(p)); b.insertAdjacentHTML('beforeend', `<span>${esc(p.name)}</span>`); b.onclick = () => choose(p.id); bar.appendChild(b);
});
$('#general').innerHTML = (C.generalClues || []).map(t => `<li>${fmt(t)}</li>`).join('');

/* ---- state helpers ---- */
function autoX(skip) {
  const a = new Set();
  for (const id in S.placed) { if (id === skip) continue; const p = S.placed[id]; for (let i = 0; i < N; i++) { a.add(K(i, p.y)); a.add(K(p.x, i)); } }
  return a;
}
function occupied() { const o = {}; for (const id in S.placed) o[K(S.placed[id].x, S.placed[id].y)] = id; return o; }
function choose(id) { sel = sel === id ? null : id; render(); }

function render() {
  const a = autoX(), occ = occupied();
  for (const k in cells) {
    const mk = cells[k].mk; mk.innerHTML = ''; if (blocked.has(k)) continue;
    if (occ[k]) { const v = avatar(P[occ[k]]); v.classList.add('big'); mk.appendChild(v); }
    else if (a.has(k)) mk.innerHTML = '<i class="x auto"></i>';
    else if (S.xs[k]) mk.innerHTML = '<i class="x man"></i>';
    else (S.hints[k] || []).slice(0, 4).forEach(id => mk.appendChild(avatar(P[id])));
  }
  document.querySelectorAll('[data-id]').forEach(e => {
    e.classList.toggle('sel', e.dataset.id === sel); e.classList.toggle('done', !!S.placed[e.dataset.id]);
  });
  $('#status').innerHTML = sel === 'X' ? 'Инструмент: крестик. Касание - отметить клетку как пустую.'
    : sel ? `Выбран: <b>${esc(P[sel].name)}</b>. Касание - подсказка, удержание - подтвердить клетку.`
    : 'Выберите персонажа внизу или карточку, затем действуйте на сетке.';
  tick(0); save();
}

/* ---- input ---- */
function tap(c) {
  const k = K(c.dataset.x, c.dataset.y);
  if (!sel || blocked.has(k) || occupied()[k] || autoX().has(k)) return;
  if (sel === 'X') { if (S.xs[k]) delete S.xs[k]; else S.xs[k] = 1; }
  else {
    delete S.xs[k];
    const h = S.hints[k] = S.hints[k] || [], i = h.indexOf(sel);
    if (i >= 0) h.splice(i, 1); else h.push(sel);
  }
  render();
}
function longPress(c) {
  if (!sel || sel === 'X') return;
  const x = +c.dataset.x, y = +c.dataset.y, k = K(x, y), cur = S.placed[sel], occ = occupied();
  if (cur && cur.x === x && cur.y === y) { delete S.placed[sel]; }
  else {
    if (blocked.has(k) || occ[k] || autoX(sel).has(k)) return;
    S.placed[sel] = { x, y }; delete S.xs[k]; S.hints[k] = [];
    for (const kk in S.hints) S.hints[kk] = S.hints[kk].filter(id => id !== sel);
  }
  if (navigator.vibrate) navigator.vibrate(20);
  render();
}
let tm = null, st = null, fired = false;
const cancel = () => { clearTimeout(tm); if (st) st.c.classList.remove('press'); st = null; };
board.addEventListener('pointerdown', e => {
  const c = e.target.closest('.cell'); if (!c) return;
  st = { x: e.clientX, y: e.clientY, c }; fired = false;
  if (sel && sel !== 'X') c.classList.add('press');
  tm = setTimeout(() => { fired = true; c.classList.remove('press'); longPress(c); }, LP);
});
board.addEventListener('pointermove', e => { if (st && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 12) cancel(); });
board.addEventListener('pointerup', () => { if (!st) return; clearTimeout(tm); const c = st.c, f = fired; c.classList.remove('press'); st = null; if (!f) tap(c); });
board.addEventListener('pointercancel', cancel); board.addEventListener('pointerleave', cancel);
board.addEventListener('contextmenu', e => e.preventDefault());

/* ---- check / reset / timer ---- */
const msg = h => { $('#msgtxt').innerHTML = h; $('#msg').hidden = false; };
$('#ok').onclick = () => { $('#msg').hidden = true; };
$('#check').onclick = () => {
  const n = C.people.filter(p => S.placed[p.id]).length;
  if (n < C.people.length) return msg(`Подтверждено ${n} из ${C.people.length}. Расставьте всех удержанием.`);
  const bad = C.people.filter(p => { const s = C.solution[p.id], q = S.placed[p.id]; return !s || s[0] !== q.x || s[1] !== q.y; });
  if (bad.length) return msg(`Есть ошибки: неверно расставлено ${bad.length}.`);
  S.won = true; save(); msg(`Дело раскрыто. Вор: <b>${esc(P[C.thief] ? P[C.thief].name : '?')}</b>.`);
};
$('#reset').onclick = () => { if (confirm('Сбросить прогресс?')) { S = blank(); sel = null; render(); } };
function tick(d) {
  S.t += d; const m = Math.floor(S.t / 60), s = S.t % 60;
  $('#timer').textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
setInterval(() => { if (!S.won && !document.hidden) { tick(1); save(); } }, 1000);
render();
})();
