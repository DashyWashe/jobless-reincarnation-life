/* ===================== MUSIC AND SOUND: generated live with Web Audio, off by default ===================== */
const SND = { ctx: null, master: null, music: null, fx: null, rev: null, delay: null, timer: 0, mood: null, want: null, next: 0, beat: 0, chord: 0, pads: [], started: false };
const SND_VOL = { off: 0, low: .3, med: .55, high: .85 };
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
/* each mood: tempo, chord progression (MIDI notes for the pad), and the scale the harp wanders in */
const MOODS = {
  title:   { bpm: 54, beats: 8, density: .55, chords: [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]], scale: [62, 64, 65, 67, 69, 72, 74, 76, 77, 79, 81] },
  spring:  { bpm: 62, beats: 8, density: .6, chords: [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]], scale: [67, 69, 71, 72, 74, 76, 79, 81, 83, 84] },
  summer:  { bpm: 66, beats: 8, density: .62, chords: [[55, 59, 62], [53, 57, 60], [48, 52, 55], [55, 59, 62]], scale: [67, 69, 71, 72, 74, 76, 77, 79, 81, 83] },
  autumn:  { bpm: 58, beats: 8, density: .5, chords: [[57, 60, 64], [55, 59, 62], [50, 54, 57], [52, 55, 59]], scale: [64, 67, 69, 71, 72, 74, 76, 79, 81] },
  winter:  { bpm: 52, beats: 10, density: .38, chords: [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]], scale: [64, 66, 67, 71, 72, 74, 76, 79, 83] },
  tension: { bpm: 48, beats: 8, density: .3, chords: [[45, 48, 52], [46, 49, 52], [45, 48, 52], [44, 48, 51]], scale: [57, 58, 60, 63, 64, 69, 70] },
  elegy:   { bpm: 44, beats: 10, density: .32, chords: [[45, 48, 52], [41, 45, 48], [48, 52, 55], [43, 47, 50]], scale: [60, 62, 64, 67, 69, 72, 76] },
};
function sndReady() {
  if (SND.ctx) return true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    const c = SND.ctx = new AC();
    SND.master = c.createGain(); SND.master.gain.value = .9; SND.master.connect(c.destination);
    // a soft hall: generated impulse response
    const len = Math.floor(c.sampleRate * 2.6), ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    SND.rev = c.createConvolver(); SND.rev.buffer = ir;
    const revOut = c.createGain(); revOut.gain.value = .55; SND.rev.connect(revOut); revOut.connect(SND.master);
    SND.delay = c.createDelay(1.5); SND.delay.delayTime.value = .42;
    const fb = c.createGain(); fb.gain.value = .32; const dOut = c.createGain(); dOut.gain.value = .35; const dTone = c.createBiquadFilter(); dTone.type = 'lowpass'; dTone.frequency.value = 2200;
    SND.delay.connect(dTone); dTone.connect(fb); fb.connect(SND.delay); dTone.connect(dOut); dOut.connect(SND.master);
    SND.music = c.createGain(); SND.music.gain.value = 0; SND.music.connect(SND.master);
    const mRev = c.createGain(); mRev.gain.value = .6; SND.music.connect(mRev); mRev.connect(SND.rev);
    const mDel = c.createGain(); mDel.gain.value = .5; SND.music.connect(mDel); mDel.connect(SND.delay);
    SND.fx = c.createGain(); SND.fx.gain.value = 0; SND.fx.connect(SND.master);
    const fRev = c.createGain(); fRev.gain.value = .35; SND.fx.connect(fRev); fRev.connect(SND.rev);
    document.addEventListener('visibilitychange', () => { if (!SND.ctx) return; if (document.hidden) SND.ctx.suspend(); else if (sndOn()) SND.ctx.resume(); });
    return true;
  } catch (err) { console.error('audio', err); SND.ctx = null; return false; }
}
const sndOn = () => (META.settings.music && META.settings.music !== 'off') || (META.settings.sfx && META.settings.sfx !== 'off');
/* apply volume settings; starts or stops the music scheduler */
function sndApply() {
  const s = META.settings, mv = SND_VOL[s.music] || 0, fv = SND_VOL[s.sfx] || 0;
  if (!mv && !fv) { if (SND.ctx) { SND.music.gain.setTargetAtTime(0, SND.ctx.currentTime, .3); SND.fx.gain.value = 0; } sndStop(); return; }
  if (!sndReady()) return;
  const c = SND.ctx; if (c.state === 'suspended' && !document.hidden) c.resume();
  SND.music.gain.setTargetAtTime(mv * 1.1, c.currentTime, .6);
  SND.fx.gain.setTargetAtTime(fv * .6, c.currentTime, .05);
  if (mv) sndStart(); else sndStop();
}
function sndStart() { if (SND.timer) return; SND.next = SND.ctx.currentTime + .15; SND.beat = 0; SND.timer = setInterval(sndTick, 120); }
function sndStop() { if (SND.timer) { clearInterval(SND.timer); SND.timer = 0; } for (const p of SND.pads) try { p.stop(); } catch (e) {} SND.pads = []; }
/* which music fits what is on screen right now */
function moodNow() {
  if (UI.screen === 'title' || UI.screen === 'create') return 'title';
  if (UI.screen === 'dead') return 'elegy';
  const L = UI.L; if (!L) return 'title';
  const s = UI.sheet; if (s && (s.type === 'event' || s.type === 'eventresult') && L.queue[0] && ['Danger', 'Confrontation', 'Hardship'].includes(L.queue[0].kind)) return 'tension';
  return MOODS[L.season] ? L.season : 'autumn';
}
function sndMood() { if (SND.timer) SND.want = moodNow(); }
function sndTick(at) {
  const c = SND.ctx; if (!c || (at == null && c.state !== 'running')) return;
  const now = at == null ? c.currentTime : at;
  if (SND.next < now - .5) SND.next = now + .05;
  while (SND.next < now + .35) {
    if (SND.beat === 0) SND.mood = SND.want || moodNow();
    const M = MOODS[SND.mood] || MOODS.title, slow = SND.mood === 'tension' || SND.mood === 'elegy';
    const step = (60 / M.bpm) / (slow ? 1 : 2), steps = M.beats * (slow ? 1 : 2), t = SND.next;
    const ch = M.chords[SND.chord % M.chords.length];
    if (SND.beat === 0) sndPad(ch, t, step * steps);
    if (Math.random() < M.density * (slow ? 1 : .75)) { const pool = M.scale.concat(ch.map(n => n + 12), ch.map(n => n + 24)).filter(n => n >= 55 && n <= 88); sndPluck(R.pick(pool), t + (Math.random() - .5) * .03, .35 + Math.random() * .4); }
    if (SND.beat % (slow ? 4 : 8) === 0 && Math.random() < .5) sndPluck(ch[0] - 12, t, .25, true);
    SND.next += step;
    if (++SND.beat >= steps) { SND.beat = 0; SND.chord++; }
  }
}
function sndPad(notes, t, dur) {
  const c = SND.ctx, g = c.createGain(), f = c.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = SND.mood === 'tension' ? 520 : 900; f.Q.value = .4;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.055, t + 2.2); g.gain.setValueAtTime(.055, t + dur - .4); g.gain.linearRampToValueAtTime(0, t + dur + 2.2);
  g.connect(f); f.connect(SND.music);
  for (const n of notes) for (const [type, det] of [['triangle', -6], ['sine', 7]]) {
    const o = c.createOscillator(); o.type = type; o.frequency.value = mtof(n); o.detune.value = det; o.connect(g); o.start(t); o.stop(t + dur + 2.4);
    SND.pads.push(o); o.onended = () => { const i = SND.pads.indexOf(o); if (i >= 0) SND.pads.splice(i, 1); };
  }
}
function sndPluck(n, t, vel, low) {
  const c = SND.ctx, g = c.createGain(), f = c.createBiquadFilter(), p = c.createStereoPanner ? c.createStereoPanner() : null;
  f.type = 'lowpass'; f.frequency.value = low ? 900 : 3200;
  const dur = low ? 2.4 : 1.9;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22 * vel, t + .006); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  const o1 = c.createOscillator(), o2 = c.createOscillator(); o1.type = 'triangle'; o2.type = 'sine'; o1.frequency.value = mtof(n); o2.frequency.value = mtof(n + 12); o2.detune.value = 4;
  const g2 = c.createGain(); g2.gain.value = .3; o2.connect(g2); g2.connect(g); o1.connect(g); g.connect(f);
  if (p) { p.pan.value = (Math.random() - .5) * .7; f.connect(p); p.connect(SND.music); } else f.connect(SND.music);
  o1.start(t); o2.start(t); o1.stop(t + dur + .05); o2.stop(t + dur + .05);
}
/* a bell: inharmonic partials with a long tail */
function sndBell(n, t, vel, out) {
  const c = SND.ctx, g = c.createGain(); g.connect(out || SND.fx);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.3 * vel, t + .004); g.gain.exponentialRampToValueAtTime(.0006, t + 2.6);
  for (const [r, a] of [[1, 1], [2.76, .45], [5.4, .22], [8.93, .1]]) { const o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.value = mtof(n) * r; og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + 2.7); }
}
function sndNoise(t, dur, freq, vel) {
  const c = SND.ctx, len = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .8;
  const g = c.createGain(); g.gain.value = .25 * vel; s.connect(f); f.connect(g); g.connect(SND.fx); s.start(t);
}
/* sound effects, all soft */
function sfx(kind) {
  if (!SND.ctx || !(SND_VOL[META.settings.sfx] > 0)) return;
  const c = SND.ctx; if (c.state !== 'running') return;
  const t = c.currentTime + .01;
  const now = performance.now(); if (now - (sfx.last || 0) < 60 && kind === sfx.lastK) return; sfx.last = now; sfx.lastK = kind;
  switch (kind) {
    case 'tap': sndPluck2(76, t, .5); break;
    case 'page': sndNoise(t, .12, 1800, .5); break;
    case 'age': sndBell(57, t, .6); sndBell(64, t + .18, .45); break;
    case 'event': [69, 72, 76, 81].forEach((n, i) => sndPluck2(n, t + i * .07, .45)); break;
    case 'choice': sndPluck2(74, t, .6); sndPluck2(81, t + .06, .4); break;
    case 'rank': [72, 76, 79, 84].forEach((n, i) => sndBell(n, t + i * .11, .5)); break;
    case 'ach': sndBell(79, t, .55); sndBell(84, t + .14, .5); break;
    case 'goal': sndBell(76, t, .45); break;
    case 'disc': sndBell(81, t, .4); sndBell(88, t + .1, .3); break;
    case 'coin': sndBell(91, t, .3); break;
    case 'death': sndBell(38, t, .8); sndBell(45, t + .5, .5); break;
  }
}
function sndPluck2(n, t, vel) {
  const c = SND.ctx, g = c.createGain(), o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(n);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.2 * vel, t + .004); g.gain.exponentialRampToValueAtTime(.0006, t + .9);
  o.connect(g); g.connect(SND.fx); o.start(t); o.stop(t + 1);
}
