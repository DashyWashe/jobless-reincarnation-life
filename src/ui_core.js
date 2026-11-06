/* ===================== UI: CORE ===================== */
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const RM = () => !META.settings.anim || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* frame-rate cap for everything drawn continuously (title sky, celebration sparks). 0 = still image */
const FPS = () => { const f = META.settings.fps; return RM() || f === 'off' ? 0 : f === 'max' ? 1000 : (+f || 60); };
const HOVER = window.matchMedia('(hover: hover) and (pointer: fine)');

/* ---------- STORE: device storage + private cloud save ---------- */
const Store = {
  db: null, uid: null, cloud: 'off', pending: {}, writing: {}, timers: {},
  lsGet(k) { try { const v = localStorage.getItem('jr.' + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
  lsSet(k, v) { try { localStorage.setItem('jr.' + k, JSON.stringify(v)); } catch (e) {} },
  lsDel(k) { try { localStorage.removeItem('jr.' + k); } catch (e) {} },
  loadLocal() {
    const m = this.lsGet('meta'); if (m && m.v) META = Object.assign(newMeta(), m, { settings: Object.assign(newMeta().settings, m.settings || {}), world: Object.assign(newMeta().world, m.world || {}) });
    for (const s of [1, 2, 3]) SLOTS[s] = this.lsGet('slot' + s);
  },
  async initCloud() {
    try {
      const c = window.claude; if (!c || !c.use) return;
      const [db, user] = await Promise.all([c.use('db'), c.use('user')]);
      if (!db || !user) return;
      const uid = await user.id(); if (!uid) return;
      this.db = db; this.uid = uid; this.cloud = 'syncing'; UI.cloudChanged && UI.cloudChanged();
      const col = db.collection('data/users/' + uid);
      const keys = ['meta', 'slot1', 'slot2', 'slot3'];
      const snaps = await Promise.all(keys.map(k => col.doc(k).get().catch(() => null)));
      let changed = false;
      snaps.forEach((snap, i) => {
        if (!snap || !snap.exists) return;
        const data = snap.data(); if (!data || !data.body) return;
        let body; try { body = JSON.parse(data.body); } catch (e) { return; }
        const k = keys[i];
        if (k === 'meta') { if ((body.savedAt || 0) > (META.savedAt || 0)) { META = Object.assign(newMeta(), body, { settings: Object.assign(newMeta().settings, body.settings || {}) }); this.lsSet('meta', META); changed = true; } }
        else { const s = +k.slice(4); const cur = SLOTS[s]; if (!cur || (body.savedAt || 0) > (cur.savedAt || 0)) { if (UI.slot === s && UI.screen === 'game') return; SLOTS[s] = body; this.lsSet(k, body); changed = true; } }
      });
      this.cloud = 'on'; migrateSettings(); if (changed && UI.screen === 'title') render(); UI.cloudChanged && UI.cloudChanged(); applySettings();
    } catch (e) { this.cloud = 'off'; }
  },
  save(k, v) {
    this.lsSet(k, v);
    if (!this.db) return;
    this.pending[k] = v;
    clearTimeout(this.timers[k]);
    this.timers[k] = setTimeout(() => this.flush(k), 1800);
  },
  remove(k) { this.lsDel(k); if (this.db) { this.pending[k] = null; this.flush(k); } },
  async flush(k) {
    if (this.writing[k] || !(k in this.pending)) return;
    const v = this.pending[k]; delete this.pending[k];
    this.writing[k] = true;
    try {
      const ref = this.db.collection('data/users/' + this.uid).doc(k);
      if (v === null) await ref.delete(); else await ref.set({ body: JSON.stringify(v), savedAt: v.savedAt || Date.now() });
      if (this.cloud !== 'on') { this.cloud = 'on'; UI.cloudChanged && UI.cloudChanged(); }
    } catch (e) { this.cloud = 'error'; UI.cloudChanged && UI.cloudChanged(); }
    this.writing[k] = false;
    if (k in this.pending) this.flush(k);
  },
};
const SLOTS = { 1: null, 2: null, 3: null };
function saveMeta() { META.savedAt = Date.now(); Store.save('meta', META); }
function saveGame() {
  if (!UI.L) return;
  if (!META.settings.autosave && !UI.forceSave) return;
  UI.L.savedAt = Date.now(); SLOTS[UI.slot] = UI.L; META.lastSlot = UI.slot;
  Store.save('slot' + UI.slot, UI.L); saveMeta(); UI.forceSave = false;
}
function cloudLabel() { return Store.cloud === 'on' ? 'Saved to your account' : Store.cloud === 'syncing' ? 'Syncing…' : 'Saved on this device'; }

/* ---------- UI STATE ---------- */
const UI = { screen: 'title', page: 'overview', sheet: null, L: null, slot: 1, draft: null, open: {}, logF: 'all', codexF: 'yours', adminSec: 'stats', adminTF: 'admin',
  navOpen: false, sideOpen: false, lastResult: null, deathFinal: null, resetScroll: {}, previewAge: 'adult' };
function loadPrefs() { const p = Store.lsGet('ui'); if (p) { if (p.open) UI.open = p.open; if (p.logF) UI.logF = p.logF; if (p.lcM) UI.lcM = p.lcM; if (p.previewAge) UI.previewAge = p.previewAge; } }
function savePrefs() { Store.lsSet('ui', { open: UI.open, logF: UI.logF, lcM: UI.lcM, previewAge: UI.previewAge }); }

/* ---------- SETTINGS ---------- */
const THEMES = { midnight: 'Dusk', parchment: 'Parchment', crimson: 'Crimson Court', verdant: 'Great Forest', auto: 'Match my system' };
const ACCENTS = { gold: 'Antique gold', silver: 'Moon silver', crimson: 'Crimson', azure: 'Mana azure', jade: 'Jade' };
function migrateSettings() {
  const s = META.settings;
  if (!s.v2) {
    if (!THEMES[s.theme] || s.theme === 'auto') s.theme = 'midnight';
    s.accent = { gold: 'gold', mana: 'azure', rose: 'crimson', violet: 'silver', ember: 'gold' }[s.accent] || (ACCENTS[s.accent] ? s.accent : 'gold');
    if (s.tips === undefined) s.tips = true;
    s.v2 = true;
  }
  if (!s.weight) s.weight = 'bold';
  if (s.fps === undefined) s.fps = '60';
  if (!s.music) s.music = 'off'; if (!s.sfx) s.sfx = 'off';
}
function applySettings() {
  const s = META.settings, root = document.documentElement;
  Object.keys(THEMES).forEach(t => root.classList.remove('t-' + t));
  if (s.theme !== 'auto') root.classList.add('t-' + s.theme);
  root.dataset.accent = s.accent; root.dataset.font = s.font; root.dataset.size = s.size; root.dataset.weight = s.weight || 'bold';
  root.classList.toggle('no-anim', !s.anim);
  root.classList.toggle('fps-off', s.fps === 'off');
}

/* ---------- ICONS ---------- */
const IC = {
  scroll: '<path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H9a2 2 0 0 1-2-2V4z"/><path d="M7 4a2 2 0 0 0-2 2v2h2"/><path d="M10 9h6M10 13h6"/>',
  sword: '<path d="M14.5 3.5 20.5 3l-.5 6L9.5 19.5l-5-5z"/><path d="M5 15.5l-2 2 3.5 3.5 2-2M7.5 13l3.5 3.5"/>',
  wand: '<path d="M4 20 15 9"/><path d="M15 3.5v3M18.5 6l-2 2M20.5 10h-3M12 6.5l1.8 1.8"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.2c2.8.3 5 2.6 5 5.8"/>',
  work: '<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12.5h18"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  coin: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5"/><path d="M12 9.5v5"/>',
  bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  flame: '<path d="M12 21c-4 0-6.5-2.7-6.5-6.2 0-3.9 3.4-5.7 3.9-9.8 2.4 1.5 3.5 3.6 3.6 5.6 1.1-.7 1.8-1.9 1.9-3.2 2.4 1.9 3.6 4.4 3.6 7.4 0 3.5-2.5 6.2-6.5 6.2z"/>',
  drop: '<path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3z"/>',
  tree: '<path d="M12 3 6 11h3l-4 6h14l-4-6h3z"/><path d="M12 17v4"/>',
  paw: '<circle cx="7" cy="10" r="1.8"/><circle cx="10.5" cy="6.5" r="1.8"/><circle cx="14.5" cy="6.5" r="1.8"/><circle cx="18" cy="10" r="1.8"/><path d="M12 12c-3 0-5.5 3.2-5.5 5.4 0 1.6 1.2 2.6 2.8 2.6 1.1 0 1.7-.6 2.7-.6s1.6.6 2.7.6c1.6 0 2.8-1 2.8-2.6C17.5 15.2 15 12 12 12z"/>',
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5 16h14"/>',
  hat: '<path d="M12 4 2 9l10 5 10-5z"/><path d="M6 11v5c0 1.4 2.7 3 6 3s6-1.6 6-3v-5M22 9v6"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
  book2: '<path d="M2.5 5.5C5 4 8.5 4 12 6c3.5-2 7-2 9.5-.5v14c-2.5-1.5-6-1.5-9.5.5-3.5-2-7-2-9.5-.5z"/><path d="M12 6v14"/>',
  fist: '<path d="M7 11V7.5a1.5 1.5 0 0 1 3 0V11M10 10V6.5a1.5 1.5 0 0 1 3 0V10M13 10V7.5a1.5 1.5 0 0 1 3 0V11M16 11V9.5a1.5 1.5 0 0 1 3 0V14c0 4-2.7 7-6.5 7S6 18.5 6 15v-2.5a1.5 1.5 0 0 1 3 0V14"/>',
  basket: '<path d="M4 10h16l-1.8 9.2a2 2 0 0 1-2 1.8H7.8a2 2 0 0 1-2-1.8z"/><path d="M8 10l3-6M16 10l-3-6M9 14v3M15 14v3M12 14v3"/>',
  spear: '<path d="M4 20 18 6"/><path d="M15 3h6v6h-3l-3-3z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><circle cx="9" cy="9" r="1.1" fill="currentColor"/><circle cx="15" cy="15" r="1.1" fill="currentColor"/><circle cx="15" cy="9" r="1.1" fill="currentColor"/><circle cx="9" cy="15" r="1.1" fill="currentColor"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  back: '<path d="M15 5 8 12l7 7"/>',
  chev: '<path d="m9 5 7 7-7 7"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z"/>',
  gem: '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/>',
  skull: '<path d="M12 3a8 8 0 0 0-5 14.2V20h10v-2.8A8 8 0 0 0 12 3z"/><circle cx="9" cy="11" r="1.6"/><circle cx="15" cy="11" r="1.6"/><path d="M10 20v-2M14 20v-2"/>',
  shield: '<path d="M12 3 4.5 6v6c0 4.6 3.2 8 7.5 9 4.3-1 7.5-4.4 7.5-9V6z"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 21h7M9.5 17h5v4h-5z"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5M10 20v-5.5h4V20"/>',
  ship: '<path d="M3 16h18l-2.5 4h-13z"/><path d="M12 3v13M12 4l6 9h-6M12 6 7 13h5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/><circle cx="12" cy="12" r="6.5"/>',
  user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c0-4 3.4-6.8 7.5-6.8s7.5 2.8 7.5 6.8"/>',
  feather: '<path d="M20 4c-6 0-11 4-12.5 11L5 20"/><path d="M20 4c0 7-4 12-11 12.5M9 16.5 14 11"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
  castle: '<path d="M4 21V9h3V6h3v3h4V6h3v3h3v12z"/><path d="M10 21v-5h4v5M4 9V5M20 9V5"/>',
  scales: '<path d="M12 4v16M7 20h10M5 7h14"/><path d="M5 7 2.5 13a3 3 0 0 0 5 0zM19 7l-2.5 6a3 3 0 0 0 5 0z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l2 2M15 8l2 2"/>',
  sparkle: '<path d="M12 3c.8 4.2 2.8 6.2 7 7-4.2.8-6.2 2.8-7 7-.8-4.2-2.8-6.2-7-7 4.2-.8 6.2-2.8 7-7z"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z"/><path d="M5 19 13 11"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4.5M12 17v.5"/>',
  exit: '<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
  save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  mountain: '<path d="M3 20 9.5 8l4 7 2-3.5L21 20z"/>',
  ring: '<circle cx="12" cy="14" r="6"/><path d="m9.5 4 2.5 3 2.5-3"/>',
  quill: '<path d="M4 20c4-1 7-3 9.5-6.5L20 4c-3 .5-6.5 3-9.5 7"/><path d="M4 20l4-6"/>',
  dot: '<circle cx="12" cy="12" r="3" fill="currentColor"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  chart: '<path d="M4 4v16h16"/><path d="M7.5 15l3.5-4.5 3 2.5 5-6.5"/>',
  clover: '<circle cx="9.3" cy="9.3" r="2.9"/><circle cx="14.7" cy="9.3" r="2.9"/><circle cx="9.3" cy="14.7" r="2.9"/><circle cx="14.7" cy="14.7" r="2.9"/><path d="M15.5 17.4c.9 1.8 2.3 3 4 3.4"/>',
  mirror: '<ellipse cx="12" cy="9" rx="5.5" ry="6"/><path d="M12 15v6M9.5 21h5"/><path d="M9.6 6.2c.7-.9 1.6-1.4 2.7-1.5"/>',
  candle: '<path d="M9.5 11h5v10h-5z"/><path d="M8 21h8"/><path d="M12 3c1.8 2 2.1 3.7 0 5.2-2.1-1.5-1.8-3.2 0-5.2z"/><path d="M12 8.2V11"/>',
  chat: '<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-5 4v-4H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M8 9h8M8 12h5"/>',
  storm: '<path d="M7 15h-.5a3.5 3.5 0 0 1-.4-7 5 5 0 0 1 9.6-1.2A3.8 3.8 0 0 1 18 15h-1"/><path d="M12.5 12l-2 4h3l-2 4"/>',
  door: '<path d="M6 21V10a6 6 0 0 1 12 0v11"/><path d="M4 21h16"/><path d="M12 4v17"/><circle cx="14.4" cy="14.5" r=".8"/><circle cx="9.6" cy="14.5" r=".8"/>',
  bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/><path d="M9.5 8h5"/>',
  gift: '<rect x="4" y="10" width="16" height="10" rx="1"/><path d="M3 7h18v3H3zM12 7v13"/><path d="M12 7c-1.6-2.8-5-3.4-5-1.5S9.7 7 12 7zm0 0c1.6-2.8 5-3.4 5-1.5S14.3 7 12 7z"/>',
  heartbreak: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 7.4l-1.6 3.2 2.6 2-1.6 3.4"/>',
  hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.5 0-4-1.2-5.5-3.5L4 15a1.5 1.5 0 0 1 2.5-1.6L8 15"/>',
  scale: '<path d="M12 4v16M7 20h10M5 8h14"/><path d="M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z"/>',
  sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  lute: '<path d="M14.5 9.5c2.5 2.5 2 6.5-.7 8.8-2.7 2.3-6.6 2.3-8.3.6s-1.7-5.6.6-8.3c2.3-2.7 6.3-3.2 8.4-1.1z"/><circle cx="9.5" cy="14.5" r="1.6"/><path d="M14.5 9.5 20 4M18.5 3l2.5 2.5"/>',
};
/* each stat and resource has its own symbol */
const STAT_IC = { str: 'fist', agi: 'feather', int: 'candle', cha: 'chat', looks: 'mirror', luck: 'clover', read: 'book', mana: 'drop', hp: 'heart', stress: 'storm', power: 'bolt', gold: 'coin', fame: 'star', ap: 'hourglass', sp: 'people', aura: 'flame' };
const whole = (v) => fmt(Math.round(v || 0));
/* a stat as it appears on the character sheet: symbol, small-caps name, carved value */
const statRow = (k, name, val, tip, extra) => `<div class="st" data-tip="${tip}"><span class="st-ic">${icon(STAT_IC[k] || 'dot')}</span><span class="st-n">${name}</span><b class="st-v num">${val}</b>${extra || ''}</div>`;
const icon = (n, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || IC.star}</svg>`;

/* ---------- TOASTS & OUTCOMES ---------- */
function toast(kind, title, sub, tier) {
  const host = $('#toasts'); if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast k-' + kind + (tier ? ' tier-' + tier : '');
  const ic = kind === 'ach' ? 'trophy' : kind === 'trait' ? 'gem' : kind === 'rank' ? 'crown' : kind === 'goal' ? 'target' : kind === 'disc' ? 'globe' : kind === 'save' ? 'bookmark' : 'scroll';
  const lab = { ach: 'Achievement', trait: 'Trait earned', rank: 'Mastery', goal: 'Goal complete', disc: 'World Compendium', note: '' }[kind] || '';
  el.innerHTML = `<span class="toast-ic">${icon(ic)}</span><div>${lab ? `<small>${lab}</small>` : ''}<b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
  host.appendChild(el);
  while (host.children.length > 3) host.firstChild.remove();
  setTimeout(() => el.classList.add('out'), 3800);
  setTimeout(() => el.remove(), 4300);
}
ACH_HOOK = (kind, title, sub, tier) => { toast(kind, title, sub, tier); try { celebrate(kind, title, sub, tier); sfx({ rank: 'rank', trait: 'rank', ach: 'ach', goal: 'goal', disc: 'disc' }[kind] || 'goal'); } catch (err) { console.error(err); } };
function flash(msg, tags) {
  UI.lastResult = { msg, tags: tags || [] };
  const el = $('#flash'); if (!el) return;
  if (!msg && !(tags && tags.length)) { el.classList.remove('show'); return; }
  el.innerHTML = `<p>${esc(msg || '')}</p>${tags && tags.length ? `<div class="tags">${tags.map(t => `<span class="tag ${t.c || ''}">${esc(t.t)}</span>`).join('')}</div>` : ''}`;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(flash.t); flash.t = setTimeout(() => el.classList.remove('show'), 5200);
}

/* ---------- CONSEQUENCES: what changed ---------- */
function snap(L) {
  return { hp: L.hp, stress: L.stress, gold: L.gold, fame: L.fame, mcap: L.mana.cap, mctrl: L.mana.ctrl, acap: L.aura.cap, astage: L.aura.stage, read: L.read,
    st: Object.assign({}, L.st), magic: Object.assign({}, L.magic), sword: Object.assign({}, L.sword), ranks: Object.assign({}, L.ranks), earned: L.earned.slice(), ach: L.achLife.slice(),
    ops: Object.fromEntries(L.people.map(p => [p.id, p.op])), alive: Object.fromEntries(L.people.map(p => [p.id, p.alive])), funds: L.family.funds, gpts: L.guild.pts, lp: META.lp, town: L.town };
}
function diffTags(a, L) {
  const t = [], n = (v) => Math.round(v);
  const add = (txt, c) => t.push({ t: txt, c });
  const dg = L.gold - a.gold; if (Math.abs(dg) >= 1) add(`${dg > 0 ? '+' : '−'}${fmt(Math.abs(dg))} gold`, dg > 0 ? 'good' : 'bad');
  const dh = L.hp - a.hp; if (Math.abs(dh) >= 1) add(`${dh > 0 ? '+' : '−'}${n(Math.abs(dh))} health`, dh > 0 ? 'good' : 'bad');
  const ds = L.stress - a.stress; if (Math.abs(ds) >= 1) add(`Stress ${ds > 0 ? '+' : '−'}${n(Math.abs(ds))}`, ds > 0 ? 'bad' : 'good');
  const df = L.fame - a.fame; if (df >= 1) add(`Fame +${n(df)}`, 'gold');
  const dm = L.mana.cap - a.mcap; if (dm >= 1) add(`Mana +${fmt(dm)}`, 'mana');
  const dc = L.mana.ctrl - a.mctrl; if (dc >= 1) add(`Control +${n(dc)}`, 'mana');
  const da = L.aura.cap - a.acap; if (da >= 1) add(`Aura +${fmt(da)}`, 'aura');
  for (const k in L.magic) { const d = (L.magic[k] || 0) - (a.magic[k] || 0); if (d >= 1) add(`+${n(d)} ${MAGIC_ID[k].name} XP`, 'xp'); }
  for (const k of ['fund','sg','wg','ng']) { const d = (L.sword[k] || 0) - (a.sword[k] || 0); if (d >= 1) add(`+${n(d)} ${k === 'fund' ? 'Fundamentals' : STYLE[k].short} XP`, 'xp'); }
  for (const k in L.ranks) if ((L.ranks[k] || 0) > (a.ranks[k] || 0)) add(`${RANKS[L.ranks[k]]} ${STYLE[k] ? STYLE[k].short : MAGIC_ID[k].name}`, 'gold');
  if (L.aura.stage > a.astage) add(AURA_STAGES[L.aura.stage], 'gold');
  for (const s in L.st) { if (!STAT_FULL[s]) continue; const d = Math.round(L.st[s]) - Math.round(a.st[s] || 0), raw = L.st[s] - (a.st[s] || 0); if (d) add(`${d > 0 ? '+' : '−'}${Math.abs(d)} ${STAT_FULL[s]}`, d > 0 ? 'good' : 'bad'); else if (Math.abs(raw) >= 0.2) add(`${STAT_FULL[s]} ${raw > 0 ? 'rising' : 'falling'}`, raw > 0 ? 'good' : 'bad'); }
  const dr = L.read - a.read; if (dr >= 1) add(`Reading +${n(dr)}`, 'good');
  for (const id of L.earned) if (!a.earned.includes(id)) add(`Trait: ${TRAIT[id].name}`, 'gold');
  for (const id of L.achLife) if (!a.ach.includes(id)) add(`Achievement: ${ACH[id].name}`, 'gold');
  for (const p of L.people) {
    if (!(p.id in a.ops)) { if (p.alive) add(`Met ${p.name}`, 'good'); continue; }
    if (a.alive[p.id] && !p.alive) { add(`${p.name} has died`, 'bad'); continue; }
    const d = p.op - a.ops[p.id]; if (Math.abs(d) >= 3) add(`${p.name} ${d > 0 ? '+' : '−'}${Math.abs(n(d))}`, d > 0 ? 'love' : 'bad');
  }
  const dl = META.lp - a.lp; if (dl >= 1) add(`+${fmt(dl)} Legacy`, 'gold');
  if (L.town !== a.town) add(`Now in ${TOWN[L.town].name}`, '');
  return t.slice(0, 10);
}

/* ---------- TOOLTIPS ---------- */
const Tip = { el: null, timer: 0, target: null };
function tipShow(target) {
  if (META.settings.tips === false) return;
  const spec = target.dataset.tip; if (!spec) return;
  const html = tipHtml(spec); if (!html) return;
  const el = Tip.el || (Tip.el = $('#tip')); if (!el) return;
  el.innerHTML = html; el.hidden = false; Tip.target = target;
  const r = target.getBoundingClientRect(); const vw = window.innerWidth, vh = window.innerHeight;
  el.style.left = '0px'; el.style.top = '0px';
  const w = el.offsetWidth, h = el.offsetHeight;
  let x = r.left + r.width / 2 - w / 2, y = r.bottom + 10;
  if (y + h > vh - 12) y = r.top - h - 10;
  if (y < 12) y = Math.min(vh - h - 12, Math.max(12, r.bottom + 10));
  x = Math.max(12, Math.min(vw - w - 12, x));
  el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px';
  el.classList.add('show');
}
function tipHide() { clearTimeout(Tip.timer); const el = Tip.el || $('#tip'); if (el) { el.classList.remove('show'); el.hidden = true; } Tip.target = null; }

/* ---------- PORTRAITS ---------- */
function shade(hex, f) {
  const n = parseInt(String(hex).slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  return '#' + [r, g, b].map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
}
const GARB_COL = { tunic: ['#5b4a36', '#4a5240', '#5a5550', '#634636'], doublet: ['#3b4a63', '#5b3a3a', '#3e5248', '#4b3f5e'], armor: ['#6f7782'], robe: ['#2f3d6b', '#4a2f5e', '#2c4e55', '#5e2f36'], coat: ['#2a3550', '#4d2430', '#2f4636'], mantle: ['#6e1f2a', '#2a2f66'], cloak: ['#4b4636', '#3a4a42', '#4a3a36'], priest: ['#d8d2c4'], swaddle: ['#d9cfbf', '#c9d3d8'] };
function garbFor(L) {
  if (L.age < 2) return 'swaddle';
  const c = L.family.cls, sw = bestSword(L), mg = bestMagic(L);
  if (L.age >= 15) {
    if (c >= 4) return 'mantle'; if (c >= 3 || L.earned.includes('ariel_knight')) return mg > sw ? 'robe' : 'coat';
    if (L.job && /knight|soldier|guard|mercenar/i.test(JOB[L.job.id].name)) return 'armor';
    if (L.flags.church) return 'priest';
    if (mg >= 2 && mg >= sw) return 'robe'; if (sw >= 2) return L.guild.reg ? 'cloak' : 'armor';
    if (L.guild.reg) return 'cloak'; return c >= 1 ? 'doublet' : 'tunic';
  }
  return c >= 3 ? 'coat' : c >= 1 ? 'doublet' : 'tunic';
}
function npcGarb(p) {
  if (p.age < 2) return 'swaddle';
  const j = (p.job || '').toLowerCase();
  if (/princess|prince|queen|king|royal/.test(j)) return /shirone/.test(j) || p.name === 'Zanoba' ? 'coat' : 'mantle';
  if (/noble|heir|lord|lady/.test(j)) return 'coat';
  if (/priest|church|cardinal/.test(j)) return 'priest';
  if (p.skill && MAGIC_ID[p.skill.k] && p.age >= 13) return 'robe';
  if (p.skill && STYLE[p.skill.k] && p.skill.r >= 3) return 'armor';
  if (p.role === 'party' || /adventur/.test(j)) return 'cloak';
  return /merchant|scholar|clerk|teacher/.test(j) ? 'doublet' : 'tunic';
}
/* ---------- SMALL COMPONENTS ---------- */
const tierName = (t) => t === 'earned' ? 'Earned' : TIERS[TIER_IDX[t]].name;
const ROMANS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
function traitChip(id, o) {
  const t = TRAIT[id]; if (!t) return '';
  return `<button class="tchip tier-${t.tier}" data-a="trait" data-id="${id}" data-tip="trait:${id}"><i class="gem"></i><span>${esc(t.name)}</span>${o && o.src ? `<small>${esc(o.src)}</small>` : ''}</button>`;
}
function rankBadge(r, k) { return `<span class="rk r${r}" data-tip="rank:${r}${k ? ':' + k : ''}">${RANKS[r]}</span>`; }
function bar(v, max, cls, o) { const p = clamp(max ? v / max * 100 : 0, 0, 100); return `<span class="bar ${cls || ''}"${o && o.tip ? ` data-tip="${o.tip}"` : ''}><i style="width:${p.toFixed(1)}%"></i></span>`; }
function potGrade(p) { return p >= 8 ? 'SS' : p >= 3.5 ? 'S' : p >= 2.2 ? 'A' : p >= 1.4 ? 'B' : p >= 0.9 ? 'C' : p >= 0.6 ? 'D' : 'E'; }
function pips(n, total, cls) { let s = ''; for (let i = 0; i < Math.max(n, total); i++) s += `<i class="${i < n ? 'on' : ''}"></i>`; return `<span class="pips ${cls || ''}">${s}</span>`; }
/* every button carries a symbol for what it does */
const BTN_IC = { mana: 'drop', magic: 'wand', sword: 'sword', aura: 'flame', body: 'fist', study: 'book', rest: 'moon', explore: 'compass', trial: 'crown', travel: 'ship', workhard: 'work', promo: 'star', register: 'shield', quest: 'flag', apply: 'scroll', enroll: 'book2', meet: 'people', activity: 'sun', buyitem: 'coin', sellitem: 'coin', fund: 'castle', buy: 'star', planspend: 'target', planclear: 'close', reroll: 'dice', begin: 'sparkle', newlife: 'sparkle', continue: 'scroll', totitle: 'door', guideshow: 'compass', doimport: 'scroll', copycode: 'scroll', clearchosen: 'close', tutor: 'hat', heir: 'people', heirloom: 'gem', savequit: 'door', palette: 'search', age: 'hourglass', quit: 'door', leave: 'door', craft: 'scroll', healpoor: 'heart', hire: 'hat', style: 'sword', focus: 'target' };
const SOCIAL_IC = { talk: 'chat', gift: 'gift', time: 'sun', train: 'sword', mentor: 'hat', apologize: 'hand', argue: 'fist', recruit: 'shield', dismiss: 'door', date: 'heart', propose: 'ring', intimate: 'moon', adopt: 'home', breakup: 'heartbreak', divorce: 'heartbreak' };
const ADM_IC = (a) => /skip|age|year/.test(a) ? 'hourglass' : /lp|upg|refund/.test(a) ? 'star' : /ach/.test(a) ? 'trophy' : /arc/.test(a) ? 'flag' : /goal/.test(a) ? 'target' : /equip/.test(a) ? 'shield' : /work/.test(a) ? 'castle' : /child|marry|plive/.test(a) ? 'heart' : /spawn|canon|char/.test(a) ? 'user' : /grad|enroll/.test(a) ? 'book2' : /clear|reset|prm|none|leave|quit|fire/.test(a) ? 'close' : /roll/.test(a) ? 'dice' : /stat|max/.test(a) ? 'fist' : /chant|xp/.test(a) ? 'wand' : /reveal/.test(a) ? 'eye' : /job/.test(a) ? 'work' : /laplace/.test(a) ? 'flame' : /seven/.test(a) ? 'crown' : /board|copy|psave|once|cd/.test(a) ? 'scroll' : /refill/.test(a) ? 'sparkle' : /earn/.test(a) ? 'gem' : /visit/.test(a) ? 'map' : /add/.test(a) ? 'plus' : 'bolt';
function btnIcon(a, o, label) {
  const d = o.data || {};
  if (a === 'social') return SOCIAL_IC[d.act] || 'chat';
  if (a === 'page' || a === 'pagemodal') { const id = d.v || d.id; return (typeof NAV_OF !== 'undefined' && NAV_OF[id] || {}).icon || 'chev'; }
  if (a === 'sheet') return { slots: 'book', export: 'scroll', import: 'scroll', plan: 'target' }[d.type] || 'scroll';
  if (a === 'confirm') return { endlife: 'hourglass', reset: 'skull', quit: 'door', leaveschool: 'door' }[d.c] || 'alert';
  if (a === 'close') return /cancel/i.test(label) ? 'close' : 'check';
  if (a === 'yes') return /danger/.test(o.cls || '') ? 'alert' : 'check';
  if (a.startsWith('ad')) return ADM_IC(a);
  return BTN_IC[a] || null;
}
function btn(label, a, o) {
  o = o || {};
  const attrs = Object.entries(o.data || {}).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');
  const ic = o.icon === false ? null : o.icon || btnIcon(a, o, label);
  return `<button class="btn ${o.cls || ''}" data-a="${a}"${attrs}${o.tip ? ` data-tip="${esc(o.tip)}"` : ''}${o.disabled ? ' disabled' : ''}>${ic ? icon(ic) : ''}<span>${label}</span>${o.cost !== undefined && o.cost !== '' ? `<em class="cost">${o.costIcon === false ? '' : '<i class="dia"></i>'}${esc(o.cost)}</em>` : ''}</button>`;
}
const why = (t) => t ? `<p class="why">${icon('lock')}<span>${esc(t)}</span></p>` : '';
function acc(id, title, body, o) {
  o = o || {};
  const open = UI.open[id] !== undefined ? UI.open[id] : !!o.open;
  return `<section class="acc${open ? ' is-open' : ''}${o.cls ? ' ' + o.cls : ''}" data-acc="${id}">
    <button class="acc-bar" data-a="acc" data-id="${id}" aria-expanded="${open}"><span class="chev">${icon('chev')}</span>${o.icon ? icon(o.icon, 'acc-ic') : ''}<span class="acc-title">${title}</span>${o.sum ? `<span class="acc-sum">${o.sum}</span>` : ''}${o.badge ? `<span class="acc-badge ${o.badgeCls || ''}">${o.badge}</span>` : ''}</button>
    <div class="acc-body"${open ? '' : ' hidden'}>${body}</div></section>`;
}
function rwTags(rw) { return `${rw.lp ? `<span class="rw lp" data-tip="term:lp">${fmt(rw.lp)} LP</span>` : ''}${rw.gold ? `<span class="rw gold">${fmt(rw.gold)} gold</span>` : ''}${rw.xp ? `<span class="rw xp" data-tip="term:rwxp">${fmt(rw.xp)} XP</span>` : ''}`; }
function lifeStage(L) {
  const a = L.age, rc = RACE[L.race];
  if (a <= 2) return 'Infancy'; if (a <= 5) return 'Early Childhood'; if (a <= 10) return 'Childhood'; if (a <= 14) return 'Youth';
  if (a < Math.max(18, rc.coming)) return 'Coming of Age';
  const f = a / Math.max(40, L.lifespan); if (f > .62 && !mods(L).ageless) return 'Twilight Years'; if (f > .42) return 'Middle Years'; return 'Adulthood';
}
const STAGE_ORDER = ['Infancy', 'Early Childhood', 'Childhood', 'Youth', 'Coming of Age', 'Adulthood', 'Middle Years', 'Twilight Years'];
function dateLine(L) { return `Year ${L.year} · ${SEASON[L.season].name}`; }
