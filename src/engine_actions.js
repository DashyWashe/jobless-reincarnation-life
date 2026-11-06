/* ===================== ENGINE: ACTIONS ===================== */
function spendAP(L) { if (L.cheats && L.cheats.infAp) { L.ap = Math.max(L.ap, 1); return true; } if (L.ap <= 0) return false; L.ap--; return true; }
function spendSP(L) { if (L.cheats && L.cheats.infSp) { L.sp = Math.max(L.sp, 1); return true; } if (L.sp <= 0) return false; L.sp--; return true; }
const rnd = (a, b) => a + R.f() * (b - a);

/* ---------- mentors & schools ---------- */
const MENTOR_ROLES = ['mentor','mother','father','guardian','party','spouse','partner','friend'];
function mentorRank(L, k) {
  let r = 0;
  for (const p of L.people) if (p.alive && p.skill && MENTOR_ROLES.includes(p.role) && (p.role === 'mentor' || p.role === 'mother' || p.role === 'father' || p.role === 'guardian')) {
    if (p.skill.k === k || (k === 'fund' && STYLE[p.skill.k])) r = Math.max(r, p.skill.r);
  }
  const s = L.edu.school && SCHOOL[L.edu.school];
  if (s && s.mentor && (s.mentor.skill === k || (k === 'fund' && STYLE[s.mentor.skill]))) r = Math.max(r, s.mentor.rank);
  return r;
}
function mentorMult(L, k) { const r = mentorRank(L, k); return r > 1 ? 1 + 0.12 * (r - 1) : 1; }
function schoolMult(L, k) {
  const s = L.edu.school && SCHOOL[L.edu.school]; if (!s) return 1;
  const keys = Object.keys(s.xp); const path = XP_PATH[k] || [k];
  return keys.some(x => x === k || path.includes(x)) ? 1.15 : 1;
}

/* ---------- MANA ---------- */
function manaWin(L) { const r = RACE[L.race]; const x = mods(L).manaWin || 0; return [r.manaWin[0] + x, r.manaWin[1] + x]; }
function manaPhase(L) { const [a, b] = manaWin(L); return L.age <= a ? 1 : L.age <= b ? 2 : 3; }
function manaBlock(L) { if (L.age < 1 && !META.upg.born_mage) return 'Too young. You feel a strange warmth inside, nothing more.'; return null; }
function actMana(L, push) {
  const M = mods(L), ph = manaPhase(L);
  const grow = Math.max(0.1, 1 + (M.manaGrow || 0));
  let gain = (ph === 1 ? 50 : ph === 2 ? 22 : 0) * L.mana.pot * grow * (push ? 1.8 : 1) * rnd(0.85, 1.15);
  if (META.upg.born_mage && L.age === 0) gain *= 1.2;
  gain = Math.round(gain);
  L.mana.cap += gain; L.mana.casted = true;
  if (ph === 3) { L.mana.ctrl = clamp(L.mana.ctrl + (push ? 5 : 3), 0, 100); L.mana.eff = clamp(L.mana.eff + 1.5, 0, 100); }
  else L.mana.ctrl = clamp(L.mana.ctrl + 1, 0, 100);
  let msg = ph < 3 ? `You ${push ? 'drain every drop of mana until the world spins' : 'cycle your mana until you are pleasantly tired'}. Capacity +${fmt(gain)}.`
                   : `Your capacity is set now, but your control sharpens (control ${Math.round(L.mana.ctrl)}).`;
  const extra = chantProgress(L, push ? 1.3 : 1);
  if (extra) msg += ' ' + extra;
  if (push && !M.noOver) {
    L.mana.over++;
    const dmg = hurt(L, (8 + R.i(0, 12)) * (1 + (M.overHurt || 0)) * (1 + (L.mana.over - 1) * 0.6), 'mana exhaustion');
    stress(L, 8);
    msg += ` You collapse afterward (−${dmg} health).`;
    if (L.hp <= 0) { L.hp = 1; L.deathCause = ''; stress(L, 12); msg += ' You do not wake for two days. When you do, everyone around your bed has been crying.'; }
    if (L.age <= 10 && L.hp > 0 && L.hp < maxHp(L) * 0.3) {
      L.flags.severeOver = (L.flags.severeOver || 0) + 1;
      msg += ' A fever burns for days. Your parents sit up with you through the night.';
      if (L.flags.severeOver >= 1 && earn(L, 'overflow_scar', 'Your body adapted to the strain.')) unlock(L, 'overflow');
    }
  }
  if (L.mana.cap >= 1000 && L.age <= 5) unlock(L, 'mana_prodigy');
  if (L.mana.cap >= 10000) unlock(L, 'mana_ocean');
  if (!L.mana.revealed && L.mana.cap >= 400) { L.mana.revealed = true; msg += ' Your parents notice the air hum around you. They realize you have unusual mana.'; }
  return msg;
}
function chantProgress(L, f) {
  if (L.mana.chantless) return '';
  const M = mods(L);
  const ageF = L.age <= 5 ? 1 : Math.max(0.02, 1 - (L.age - 5) * 0.16);
  L.mana.chant += (5 + R.f() * 6) * (1 + (M.chant || 0)) * ageF * f;
  if (L.mana.chant >= 100) {
    L.mana.chantless = true;
    earn(L, 'silent_caster', 'A spell forms in your hand without a single word.');
    unlock(L, 'chantless'); if (L.age < 6) unlock(L, 'chantless_child');
    fame(L, 10);
    return 'Something clicks: you cast without chanting.';
  }
  return '';
}

/* ---------- MAGIC ---------- */
function magicBlock(L, k) {
  const m = MAGIC_ID[k];
  if (L.age < m.minAge) return `Available from age ${m.minAge}.`;
  if (k === 'summon' && !(L.edu.school === 'ranoa' || L.edu.done.includes('ranoa') || mentorRank(L, 'summon') > 0)) return 'Needs Ranoa University or a summoner mentor.';
  if (k === 'gravity' && !(hasFlag(L, 'gravity') || mentorRank(L, 'gravity') > 0)) return 'Needs Gravity Sense or a legendary teacher.';
  if (L.age < 5 && L.read < 15 && mentorRank(L, k) === 0 && !hasFlag(L, 'earlyRead') && !L.flags.books) return 'Learn to read first, or find a tutor.';
  return null;
}
function addSkillXp(L, k, base, quiet) {
  if (k === 'magic') k = bestElement(L);
  if (k === 'holy') k = 'heal';
  if (k === 'sword') k = L.sword.styleChosen ? L.sword.primary : 'fund';
  const isStyle = !!STYLE[k] || k === 'fund';
  let gain = base * xpMult(L, k) * mentorMult(L, k) * schoolMult(L, k) * rnd(0.85, 1.15);
  if (isStyle) {
    gain *= clamp(1 + (L.st.str + L.st.agi - 14) / 60, 0.7, 1.6);
    if (k !== 'fund' && L.sword.primary && k !== L.sword.primary && !hasFlag(L, 'noStylePenalty')) gain *= 0.7;
    L.sword[k] = (L.sword[k] || 0) + gain;
  } else if (MAGIC_ID[k]) {
    gain *= 1 + L.mana.eff / 250;
    L.magic[k] = (L.magic[k] || 0) + gain;
  } else return 0;
  if (k !== 'fund') autoRank(L, k, quiet);
  return Math.round(gain);
}
function bestElement(L) { let best = 'water', bv = -1; for (const e of ['fire','water','earth','wind']) { const v = L.magic[e] || 0; if (v > bv) { bv = v; best = e; } } return best; }
function actMagic(L, k) {
  const gain = addSkillXp(L, k, 22 * (L.age < 6 ? 0.8 : 1));
  L.mana.casted = true;
  if (manaPhase(L) < 3) L.mana.cap += Math.round(8 * L.mana.pot * Math.max(0.1, 1 + (pct(L,'manaGrow'))));
  let msg = `You practice ${MAGIC_ID[k].name.toLowerCase()} magic. +${gain} XP.`;
  const extra = chantProgress(L, 0.5); if (extra) msg += ' ' + extra;
  return msg;
}
function autoRank(L, k, quiet) {
  const cur = L.ranks[k] || 0; const r = Math.min(rankOfXp(skillXp(L, k)), Math.max(3, cur));
  if (r > cur) {
    L.ranks[k] = r;
    const nm = STYLE[k] ? STYLE[k].name : MAGIC_ID[k].name + ' magic';
    if (!quiet) { log(L, `You reach ${RANKS[r]} rank in ${nm}.`, 'rank'); if (ACH_HOOK && r >= 3) ACH_HOOK('rank', RANKS[r] + ' · ' + nm, ''); }
    if (r === 3 && STYLE[k] && ['sg','wg','ng'].every(s => (L.ranks[s] || 0) >= 3)) unlock(L, 'tri_style');
    if (MAGIC_ID[k] && r >= 1) unlock(L, 'first_spell');
    if (k === 'summon' && r >= 2) unlock(L, 'summoner');
    if (k === 'gravity' && r >= 1) unlock(L, 'gravity');
  }
}

/* ---------- SWORD ---------- */
function styleAge() { return META.upg.blade_prodigy ? 5 : 8; }
function swordBlock(L, k) { if (L.age < 4) return 'Too young to hold a practice sword.'; if (k && !L.sword.styleChosen) return `Choose a style at age ${styleAge()}.`; return null; }
function actSword(L, k) {
  const style = L.sword.styleChosen ? k : 'fund';
  const gain = addSkillXp(L, style, 22);
  grow(L, 'str', 0.25 * xpMult(L, 'body')); grow(L, 'agi', 0.3 * xpMult(L, 'body'));
  if (L.aura.compat > 0 && auraPhase(L) > 0) auraTrain(L, 0.25);
  stress(L, 2);
  return style === 'fund' ? `You swing a wooden sword until your arms ache. Fundamentals +${gain}.` : `You drill ${STYLE[k].name}. +${gain} XP.`;
}
function chooseStyle(L, k) {
  L.sword.styleChosen = true; L.sword.primary = k; unlock(L, 'first_style');
  L.sword[k] = (L.sword[k] || 0) + L.sword.fund; L.sword.fund = 0;
  autoRank(L, k);
}

/* ---------- AURA ---------- */
function auraWin(L) { const r = RACE[L.race]; const M = mods(L); const w = r.auraWin.slice(); w[3] += (M.auraWin || 0); w[2] += Math.round((M.auraWin || 0) / 2); if (M.earlyAura) w[0] = Math.max(4, w[0] - 2); return w; }
function auraPhase(L) { const w = auraWin(L); if (L.age < w[0]) return 0; if (L.age < w[1]) return 1; if (L.age <= w[2]) return 2; if (L.age <= w[3]) return 3; return 4; }
function auraTrain(L, f) {
  const w = auraWin(L), ph = auraPhase(L);
  const base = ph === 1 ? 10 : ph === 2 ? 30 : ph === 3 ? 30 * Math.max(0.15, 1 - (L.age - w[2]) / (w[3] - w[2] + 1)) : 0;
  const g = Math.round(base * L.aura.compat * Math.max(0.1, 1 + pct(L, 'auraGrow')) * xpMult(L, 'aura') * rnd(0.85, 1.15) * f);
  L.aura.cap += g;
  L.aura.ctrl = clamp(L.aura.ctrl + (ph === 4 ? 4 : 1) * f, 0, 100);
  auraStageCheck(L);
  return g;
}
function auraStageCheck(L) {
  let s = 0;
  for (let i = 1; i < AURA_CAP.length; i++) {
    if (L.aura.cap < AURA_CAP[i]) break;
    if (i === 5 && L.aura.ctrl < 50) break;
    if (i === 6 && (L.aura.ctrl < 80 || !(bestSword(L) >= 5 || hasFlag(L, 'dragonBlood') || L.traits.includes('aura_monarch') || L.traits.includes('heaven_physique')))) break;
    s = i;
  }
  if (s > L.aura.stage) {
    if (L.aura.stage === 0) { log(L, 'Heat floods your limbs. Your Battle Aura awakens.', 'rank'); unlock(L, 'aura_awake'); L.aura.known = true; }
    else log(L, `Your Battle Aura reaches ${AURA_STAGES[s]}.`, 'rank');
    if (ACH_HOOK) ACH_HOOK('rank', 'Battle Aura · ' + AURA_STAGES[s], '');
    if (s === 6) { unlock(L, 'aura_legend'); fame(L, 150); }
    L.aura.stage = s;
  }
}
function auraBlock(L) { const w = auraWin(L); if (L.age < w[0]) return `Your body is too young. Conditioning starts at ${w[0]}.`; return null; }
function actAura(L) {
  const ph = auraPhase(L);
  grow(L, 'str', 0.25 * xpMult(L, 'body')); grow(L, 'agi', 0.2 * xpMult(L, 'body'));
  if (L.aura.compat <= 0) {
    L.cnt.auraFail = (L.cnt.auraFail || 0) + 1;
    if (!L.aura.known && L.cnt.auraFail >= 4 && L.age >= 12) { L.aura.known = true; return 'You train hard, but nothing stirs. A veteran tells you plainly: your body has no aura compatibility. The training still builds strength.'; }
    return 'You condition your body. You feel stronger, but no aura stirs.';
  }
  const g = auraTrain(L, 1);
  stress(L, 3);
  const phaseTxt = ['', 'conditioning', 'prime growth window', 'final growth window', 'capacity is fixed; control improves'][ph];
  return `Aura training (${phaseTxt}). Aura +${g}${ph === 4 ? `, control ${Math.round(L.aura.ctrl)}` : ''}.`;
}

/* ---------- BODY / MIND / REST / CRAFT ---------- */
function actBody(L) {
  const m = xpMult(L, 'body');
  grow(L, 'str', rnd(0.45, 0.8) * m); grow(L, 'agi', rnd(0.45, 0.8) * m);
  if ((L.bonusHp || 0) < 30) L.bonusHp = (L.bonusHp || 0) + 1;
  stress(L, 2);
  return L.age < 4 ? 'You crawl, toddle, and climb everything in sight.' : 'You run, climb, and lift until you are drenched in sweat. Strength and agility grow.';
}
function actStudy(L) {
  const m = xpMult(L, 'study') * (hasFlag(L, 'earlyRead') || L.flags.books ? 1.5 : 1);
  if (L.age < 2) {
    L.cnt.talk = (L.cnt.talk || 0) + 1;
    grow(L, 'int', 0.4 * m);
    if (L.cnt.talk === 1) { unlock(L, 'first_words'); return 'You babble back at your parents until a real word slips out. They are thrilled.'; }
    L.read = clamp(L.read + 5 * m, 0, 100);
    return 'You listen to every word around you and start piecing language together.';
  }
  L.read = clamp(L.read + 11 * m, 0, 100); grow(L, 'int', rnd(0.4, 0.7) * m);
  if (L.read >= 100) unlock(L, 'literate');
  return L.read >= 100 ? 'You read deeply and think hard. Intelligence grows.' : `You study letters and books. Reading ${Math.round(L.read)}/100.`;
}
function actRest(L) { const before = L.stress; stress(L, -22); heal(L, 12); return `You rest and do nothing in particular. Stress −${Math.round(before - L.stress)}.`; }
function craftBlock(L) { if (L.age < 8) return 'Available from age 8.'; return null; }
function actCraft(L) {
  L.craft = (L.craft || 0) + 18 * xpMult(L, 'craft') * rnd(0.85, 1.15);
  const earth = rankOf(L, 'earth');
  if (earth >= 2 && L.age >= 10) {
    const price = Math.round((8 + earth * 10 + L.craft / 25) * rnd(0.8, 1.3) * (1 + pct(L, 'income')));
    money(L, price); L.cnt.fig = (L.cnt.fig || 0) + 1;
    if (L.cnt.fig === 10) { earn(L, 'figurine_master', 'A royal collector buys your work by the crate.'); unlock(L, 'figurines'); }
    return `You sculpt a figurine with earth magic and sell it for ${price} gold.${L.cnt.fig >= 3 && L.cnt.fig < 10 ? ` (${L.cnt.fig} sold)` : ''}`;
  }
  if (hasFlag(L, 'tools') && L.read >= 50 && L.age >= 15) { const p = Math.round(rnd(30, 80) * (1 + pct(L, 'income'))); money(L, p); return `You build a small magic tool and sell it for ${p} gold.`; }
  const p = L.age >= 12 ? Math.round(rnd(2, 8)) : 0; if (p) money(L, p);
  return `You make things with your hands. Crafting improves${p ? `, and you sell a trinket for ${p} gold` : ''}.`;
}
function healBlock(L) { if (L.age < 8) return 'Available from age 8.'; if (rankOf(L, 'heal') < 1) return 'Needs Beginner healing magic.'; return null; }
function actHealPoor(L) {
  addSkillXp(L, 'heal', 18); L.cnt.healFree = (L.cnt.healFree || 0) + 1; fame(L, 1.5); stress(L, -4);
  if (L.cnt.healFree === 10) { earn(L, 'poor_healer', 'The poor quarter knows your name and blesses it.'); unlock(L, 'healer'); }
  return `You heal the sick in the poor quarter for free. (${L.cnt.healFree} times so far)`;
}

/* ---------- RANK TRIALS ---------- */
const TRIAL_BASE = { 4: .45, 5: .30, 6: .18, 7: .08 };
function trialInfo(L, k) {
  const cur = L.ranks[k] || 0, next = cur + 1;
  if (next < 4 || next > 7) return null;
  const cut = 1 - (pct(L, 'reqCut') || 0);
  const need = Math.round(RANK_XP[next] * cut);
  const xp = skillXp(L, k);
  const info = { next, need, xp, ready: xp >= need, reason: '', chance: 0, label: `${RANKS[next]} trial` };
  if (!info.ready) return info;
  if (MAGIC_ID[k] && L.mana.cap < MANA_GATE[next] * cut) info.reason = `Needs ${fmt(MANA_GATE[next] * cut)} mana capacity`;
  if (next >= 6 && L.fame < 100 * cut) info.reason = `Needs regional fame (fame ${Math.round(L.fame)}/${Math.round(100 * cut)})`;
  if (L.trials[k] === L.age) info.reason = 'Try again next year';
  if (next === 7 && STYLE[k]) {
    const holder = META.world.gods[k];
    info.label = `Challenge ${holder} for the ${STYLE[k].short} title`;
    info.chance = clamp(1 / (1 + Math.exp(-(power(L) - 230) / 25)) + pct(L, 'trial'), .03, .95);
  } else {
    const mr = mentorRank(L, k);
    let c = TRIAL_BASE[next] + (mr >= next ? .25 : mr === next - 1 ? .1 : 0) + (schoolMult(L, k) > 1 ? .1 : 0) + pct(L, 'trial') + (L.st.luck - 8) * 0.004 + (power(L) - 40) / 600;
    info.chance = clamp(c, .05, .95);
  }
  if (L.cheats && L.cheats.sureTrial) info.chance = 1;
  return info;
}
function actTrial(L, k) {
  const info = trialInfo(L, k); if (!info || !info.ready || info.reason) return 'Not ready.';
  L.trials[k] = L.age;
  const nm = STYLE[k] ? STYLE[k].name : MAGIC_ID[k].name + ' magic';
  if (R.chance(info.chance)) {
    L.ranks[k] = info.next;
    fame(L, [0, 0, 0, 0, 30, 80, 200, 500][info.next]);
    log(L, `You pass the ${RANKS[info.next]} trial in ${nm}!`, 'rank');
    if (ACH_HOOK) ACH_HOOK('rank', RANKS[info.next] + ' · ' + nm, '');
    unlock(L, ['', '', '', '', 'rank_saint', 'rank_king', 'rank_emperor', 'rank_god'][info.next]);
    if (info.next === 4 && k === 'sg') earn(L, 'sanctum_blade');
    if (info.next === 4 && k === 'wg') earn(L, 'water_disciple');
    if (info.next === 4 && k === 'ng') earn(L, 'north_heir');
    if (bestSword(L) >= 4 && bestMagic(L) >= 4) unlock(L, 'dual_saint');
    if (info.next === 7 && STYLE[k]) { META.world.gods[k] = L.name + ' ' + L.sur; log(L, `You defeat ${info.label.split(' ')[1]} and take the title of ${STYLE[k].short}.`, 'big'); }
    if (!L.epithet && L.fame >= 60) giveEpithet(L);
    return `Passed! ${RANKS[info.next]} rank in ${nm}.`;
  }
  stress(L, 15);
  if (info.next === 7) hurt(L, R.i(15, 40), 'a duel with a god');
  log(L, `You fail the ${RANKS[info.next]} trial in ${nm}.`, 'bad');
  return `You fall short of ${RANKS[info.next]} this time.`;
}
const EPITHETS = { fire: 'Flamecaller', water: 'Tidecaller', earth: 'Quagmire', wind: 'Stormcaller', heal: 'Saint’s Hand', barrier: 'Bulwark', detox: 'Purifier', summon: 'Gatekeeper', gravity: 'Worldweight', sg: 'Swift Blade', wg: 'Still Water', ng: 'Northern Wolf' };
function giveEpithet(L) {
  let e = EPITHETS[bestSkillName(L)] || 'Wanderer';
  if (L.traits.includes('hot_headed') && bestSword(L) >= 3) e = 'Mad Dog';
  L.epithet = e;
  log(L, `People start calling you “${e}.”`, 'big');
}

/* ---------- PEOPLE ---------- */
const SOCIAL = [
  { id: 'talk', name: 'Talk', cond: (L, p) => L.age >= 1 },
  { id: 'gift', name: 'Give a gift', cond: (L, p) => L.age >= 3, note: (L) => L.age >= 15 ? '10 gold' : 'Handmade' },
  { id: 'time', name: 'Spend time together', cond: (L, p) => true },
  { id: 'train', name: 'Train together', cond: (L, p) => p.skill && L.age >= 3 && p.role !== 'child' },
  { id: 'mentor', name: 'Ask to be your mentor', cond: (L, p) => p.skill && p.skill.r >= 3 && p.role !== 'mentor' && !['mother','father','guardian','child','grandchild'].includes(p.role) && L.age >= 4 },
  { id: 'apologize', name: 'Apologize', cond: (L, p) => p.op < 10 && L.age >= 3 },
  { id: 'argue', name: 'Pick a fight', cond: (L, p) => L.age >= 3 },
  { id: 'recruit', name: 'Invite to your party', cond: (L, p) => L.guild.reg && L.age >= 15 && p.age >= 15 && ['friend','other','rival'].includes(p.role) },
  { id: 'dismiss', name: 'Part ways with the party', cond: (L, p) => p.role === 'party' },
  { id: 'date', name: 'Ask on a date', cond: (L, p) => canRomance(L, p) && !L.partner && !['partner','spouse','ex'].includes(p.role) },
  { id: 'propose', name: 'Propose marriage', cond: (L, p) => p.role === 'partner' && canRomance(L, p) },
  { id: 'intimate', name: 'Spend an intimate night', cond: (L, p) => ['partner','spouse'].includes(p.role) && canRomance(L, p) },
  { id: 'adopt', name: 'Adopt a child together', cond: (L, p) => p.role === 'spouse' && L.age >= 21, note: () => '100 gold' },
  { id: 'breakup', name: 'Break up', cond: (L, p) => p.role === 'partner' },
  { id: 'divorce', name: 'Divorce', cond: (L, p) => p.role === 'spouse' },
];
function actSocial(L, pid, aid) {
  const p = person(L, pid); if (!p || !p.alive) return 'They are gone.';
  const like = p.likes === aid ? 1.5 : 1;
  const nm = p.name;
  switch (aid) {
    case 'talk': { relGain(L, p, R.i(4, 10) * like); relChecks(L, p); const tag = p.tags.find(t => TALK_LINES[t]); const line = tag && p.age >= 8 ? R.pick(TALK_LINES[tag]) : (p.age < 8 ? `${nm} chatters happily about bugs, games, and nothing at all.` : ''); return `You talk with ${nm}. ${line}`.trim(); }
    case 'gift':
      if (L.age >= 15) { if (L.gold < 10) return 'You need 10 gold.'; money(L, -10); }
      relGain(L, p, R.i(8, 15) * like); return L.age >= 15 ? `You give ${nm} a thoughtful gift.` : `You give ${nm} a little gift you made yourself.`;
    case 'time': { relGain(L, p, R.i(6, 12) * like); relChecks(L, p); stress(L, -5); const where = R.pick(['by the river', 'at the market', 'on a long walk', 'at the tavern', 'in the hills outside town', 'at the festival grounds']); if (R.chance(.3)) remember(p, L, `A good day spent ${where}`); return `You spend the day with ${nm} ${where}.`; }
    case 'train': {
      const k = p.skill.k; const g = addSkillXp(L, STYLE[k] && !L.sword.styleChosen ? 'fund' : k, 16 * (1 + 0.15 * p.skill.r));
      relGain(L, p, R.i(3, 7) * like);
      return `${nm} trains with you. +${g} XP.`;
    }
    case 'mentor': {
      const diff = [0, 0, 0, 0.75, 0.55, 0.35, 0.15, 0.05][p.skill.r] || 0.5;
      const c = clamp(diff + p.op / 200 + (L.fame / 1000) + pct(L, 'interview') - (p.canon ? 0.1 : 0), 0.03, 0.95);
      if (R.chance(c)) { p.prevRole = p.role; p.role = 'mentor'; relGain(L, p, 10); remember(p, L, 'Took you on as a student'); unlock(L, 'mentor_found'); log(L, `${nm} agrees to mentor you.`, 'good'); return `${nm} agrees to take you as a student.`; }
      relGain(L, p, -3); return `${nm} declines. Maybe once you've proven yourself.`;
    }
    case 'apologize': relGain(L, p, R.i(10, 20)); return `You apologize to ${nm}. Things feel a little better.`;
    case 'argue': p.op = clamp(p.op - R.i(10, 25), -100, 100); stress(L, -3); relChecks(L, p); if (p.op < -40 && p.role !== 'rival' && !isFamily(p)) { p.role = 'rival'; return `You and ${nm} have a blazing argument. You are rivals now.`; } return `You argue with ${nm}.`;
    case 'recruit': {
      if (L.people.filter(x => x.role === 'party' && x.alive).length >= 5) return 'Your party is full (6 including you).';
      const c = clamp(0.3 + p.op / 150 + pct(L, 'party'), 0.05, 0.95);
      if (R.chance(c)) { p.prevRole = p.role; p.role = 'party'; p.power = p.power || R.i(8, 26); remember(p, L, 'Joined your party'); log(L, `${nm} joins your party.`, 'good'); partyChecks(L); return `${nm} joins your party.`; }
      return `${nm} isn't ready to adventure with you.`;
    }
    case 'dismiss': p.role = p.prevRole || 'friend'; return `${nm} leaves the party on good terms.`;
    case 'date': {
      const c = clamp(0.2 + p.op / 140 + (L.st.looks - 8) * 0.02 + (L.st.cha - 8) * 0.02 + pct(L, 'romance'), 0.05, 0.92);
      if (R.chance(c)) { p.prevRole = p.role; p.role = 'partner'; L.partner = p.id; relGain(L, p, 12); remember(p, L, 'Started dating you'); log(L, `You start dating ${nm}.`, 'love'); return `${nm} says yes. You\u2019re dating now.`; }
      relGain(L, p, -6); return `${nm} turns you down gently.`;
    }
    case 'propose': {
      const c = clamp(-0.1 + p.op / 90, 0.05, 0.95);
      if (R.chance(c)) { p.role = 'spouse'; L.spouse = p.id; L.partner = null; relGain(L, p, 15); stress(L, -10); remember(p, L, 'Married you'); log(L, `You marry ${nm} in a small, happy ceremony.`, 'love'); unlock(L, 'married'); return `${nm} says yes! You marry soon after.`; }
      relGain(L, p, -12); return `${nm} says it's too soon.`;
    }
    case 'intimate': {
      relGain(L, p, R.i(6, 12)); stress(L, -8);
      const fertile = (x) => x.age <= Math.min(45, (RACE[x.race].life[0]) * 0.6);
      const me = { age: L.age, race: L.race };
      if (L.sex !== p.sex && fertile(L.sex === 'f' ? me : p) && !L.flags.pregnant && R.chance(0.25)) { L.flags.pregnant = { with: p.id, due: L.age + 1 }; return `You and ${nm} share a quiet, intimate night. Weeks later, there is happy news: a baby is on the way.`; }
      return `You and ${nm} share a quiet, intimate night together.`;
    }
    case 'adopt': {
      if (L.gold < 100) return 'You need 100 gold.';
      money(L, -100); const c = addChild(L, p, true); return `You and ${nm} adopt ${c.name}.`;
    }
    case 'breakup': p.role = 'ex'; L.partner = null; p.op = clamp(p.op - 30, -100, 100); stress(L, 10); return `You break up with ${nm}.`;
    case 'divorce': p.role = 'ex'; L.spouse = null; p.op = clamp(p.op - 40, -100, 100); stress(L, 18); money(L, -L.gold * 0.3); return `You and ${nm} divorce. It is expensive and painful.`;
  }
  return '';
}
function remember(p, L, text) { if (!p.mem) p.mem = []; p.mem.push({ a: L.age, t: text }); if (p.mem.length > 8) p.mem.shift(); }
function relChecks(L, p) { if (p.op >= 100) unlock(L, 'beloved'); if (p.role === 'rival' && p.op <= -100) unlock(L, 'nemesis'); }
function partyChecks(L) { const party = L.people.filter(x => x.alive && x.role === 'party'); if (party.length >= 5) unlock(L, 'party_full'); if (party.some(x => x.race === 'superd')) unlock(L, 'dead_end'); }
function addChild(L, other, adopted) {
  const race = adopted ? R.pick([L.race, L.race, other.race]) : (R.chance(.5) ? L.race : other.race);
  const c = npc(L, { role: 'child', age: adopted ? R.i(0, 6) : 0, race, sur: L.sur, op: R.i(60, 85), met: L.age });
  if (!adopted) {
    const g = inheritLook(c.look, [{ look: L.look, me: 1 }, other], 1);
    c.look = g.look; c.looks = clamp(Math.round((L.st.looks + npcLooks(other)) / 2 + R.i(-3, 3)), 1, 20);
    const bits = []; if (g.from.eyes) bits.push(`${g.from.eyes.me ? 'your' : other.name + '’s'} eyes`); if (g.from.hair && g.from.hair !== 'both') bits.push(`${g.from.hair.me ? 'your' : other.name + '’s'} hair`);
    c.likeNote = bits.length ? `${c.sex === 'f' ? 'She' : 'He'} has ${bits.join(' and ')}.` : '';
    const d = { race, bg: L.bg, season: R.pick(SEASONS).id, omen: 'clear', parents: [{ role: L.sex === 'f' ? 'mother' : 'father', traits: L.traits }, { role: 'other', traits: other.traits || [] }] };
    c.traits = rollBornTraits(d, []).traits;
  } else c.traits = rollBornTraits({ race, bg: 'laborer', season: 'spring', omen: 'clear', parents: [] }, []).traits;
  L.children = (L.children || 0) + 1;
  log(L, adopted ? `${c.name} joins your family.` : `${c.name} is born. ${c.likeNote || ''} ${c.traits.length ? 'Born with ' + c.traits.map(id => TRAIT[id].name).join(', ') + '.' : ''}`.replace(/\s+/g, ' ').trim(), 'love');
  if (L.people.filter(x => x.role === 'child').length >= 5) unlock(L, 'big_family');
  return c;
}
function actMeet(L, kind) {
  if (kind === 'friend') {
    const p = npc(L, { role: 'friend', age: Math.max(1, L.age + R.i(-2, 2)), op: R.i(18, 40) });
    if (L.age >= 15 && R.chance(.25)) p.skill = { k: R.pick(['sg','wg','ng','fire','water','earth','wind','heal']), r: R.i(1, 3) };
    return `You meet ${p.name}, a ${p.tags[0]} ${RACE[p.race].name.toLowerCase()} ${p.age < 15 ? 'kid' : ''} who quickly becomes a friend.`.replace('  ', ' ');
  }
  if (kind === 'love' && L.vow === 'solitude') return actMeet(L, 'friend');
  if (kind === 'love') {
    const minA = Math.max(18, L.age - 6), maxA = Math.max(minA, L.age + 6);
    const race = R.chance(.75) ? L.race : R.w(RACES, r => r.weight).id;
    const p = npc(L, { role: 'other', age: R.i(minA, maxA), race, op: R.i(15, 35) });
    p.age = Math.max(p.age, romanceAge(L, p));
    if (R.chance(.3)) p.skill = { k: R.pick(['sg','wg','ng','fire','water','heal','barrier']), r: R.i(1, 4) };
    return `At a festival you meet ${p.name}, ${p.age}, ${p.tags[0]} and easy to talk to.`;
  }
  if (kind === 'adventurer') {
    const p = npc(L, { role: 'other', age: Math.max(15, L.age + R.i(-4, 8)), op: R.i(10, 30), power: R.i(10, 30) + L.guild.rank * 6 });
    p.skill = { k: R.pick(['sg','wg','ng','fire','water','earth','wind','heal','barrier']), r: clamp(L.guild.rank + R.i(0, 2), 1, 5) };
    return `At the guild hall you meet ${p.name}, a ${RANKS[p.skill.r].toLowerCase()} ${STYLE[p.skill.k] ? STYLE[p.skill.k].short + ' swordsman' : MAGIC_ID[p.skill.k].name.toLowerCase() + ' mage'} looking for a party.`;
  }
  return '';
}

/* ---------- JOBS ---------- */
function townOk(where, town) {
  if (!where || where === 'any') return true;
  if (where === 'city') return town.size >= 3;
  if (where === 'capital') return town.size >= 4;
  return town.tags.includes(where);
}
function jobReqs(L, j) {
  const cut = 1 - (pct(L, 'reqCut') || 0); const out = []; const r = j.req;
  const n = (v) => Math.ceil(v * cut);
  if (r.age) out.push({ l: `Age ${r.age}+`, ok: L.age >= r.age });
  for (const s of ['str','agi','int','cha']) if (r[s]) out.push({ l: `${{ str: 'Strength', agi: 'Agility', int: 'Intelligence', cha: 'Charisma' }[s]} ${n(r[s])}`, ok: L.st[s] >= n(r[s]) });
  if (r.sword) out.push({ l: `${RANKS[r.sword]} swordsmanship`, ok: bestSword(L) >= r.sword });
  if (r.magic) out.push({ l: `${RANKS[r.magic]} attack magic`, ok: bestAttack(L) >= r.magic });
  if (r.heal) out.push({ l: `${RANKS[r.heal]} healing`, ok: rankOf(L, 'heal') >= r.heal });
  if (r.summon) out.push({ l: `${RANKS[r.summon]} summoning`, ok: rankOf(L, 'summon') >= r.summon });
  if (r.read) out.push({ l: `Reading ${n(r.read)}`, ok: L.read >= n(r.read) });
  if (r.edu) out.push({ l: `${SCHOOL[r.edu].name} graduate`, ok: L.edu.done.includes(r.edu) });
  if (r.cls) out.push({ l: ['', 'Wealthy family', 'Knight family or better', 'Noble family', 'Royal family'][r.cls], ok: L.family.cls >= r.cls || (r.cls <= 2 && L.fame >= 150) });
  if (r.fame) out.push({ l: `Fame ${n(r.fame)}`, ok: L.fame >= n(r.fame) });
  if (r.guild) out.push({ l: `Guild rank ${GUILD_RANKS[r.guild]}`, ok: L.guild.reg && L.guild.rank >= r.guild });
  if (r.shadow) out.push({ l: 'A talent for shadows', ok: hasFlag(L, 'shadow') || L.st.agi >= 16 });
  if (r.tools) out.push({ l: 'Can build magic tools', ok: hasFlag(L, 'tools') });
  return out;
}
function refreshBoards(L) {
  const town = TOWN[L.town];
  L.jobBoard = [];
  if (L.age >= 12) {
    const pool = JOBS.filter(j => townOk(j.where, town) && (!L.job || L.job.id !== j.id));
    for (let k = pool.length - 1; k > 0; k--) { const m = R.i(0, k); [pool[k], pool[m]] = [pool[m], pool[k]]; }
    L.jobBoard = pool.slice(0, 7).map(j => j.id);
  }
  L.quests = [];
  if (L.guild.reg && town.tags.includes('guild')) for (let k = 0; k < 4; k++) L.quests.push(genQuest(L));
}
function actApply(L, jid) {
  const j = JOB[jid];
  if (jobReqs(L, j).some(x => !x.ok)) return 'You don’t meet the requirements yet.';
  const c = clamp(0.5 + (L.st.cha - 10) * 0.03 + pct(L, 'interview') + L.fame * 0.0006 + (L.edu.done.includes('apprentice') && ['Common'].includes(j.cat) ? .2 : 0), 0.08, 0.97);
  L.jobBoard = L.jobBoard.filter(x => x !== jid);
  if (R.chance(c)) {
    L.job = { id: jid, lvl: 0, perf: 50, yrs: 0 }; L.cnt.jobs = (L.cnt.jobs || 0) + 1;
    log(L, `You are hired as ${j.ladder[0]}${L.age < 15 ? ' (part-time)' : ''}.`, 'good');
    unlock(L, 'first_job');
    return `Hired! You start as ${j.ladder[0]}.`;
  }
  return `The ${j.name.toLowerCase()} interview doesn't go your way.`;
}
function salary(L) { if (!L.job) return 0; const j = JOB[L.job.id]; return Math.round(j.pay[L.job.lvl] * (1 + pct(L, 'income')) * (L.age < 15 ? 0.4 : 1)); }
function actWorkHard(L) { if (!L.job) return 'You have no job.'; const j = JOB[L.job.id]; L.job.perf = clamp(L.job.perf + R.i(12, 20), 0, 100); jobXp(L, j, 20); stress(L, 6); return `You put in long hours. Performance ${Math.round(L.job.perf)}/100.`; }
function jobXp(L, j, base) {
  const k = j.skill;
  if (['body'].includes(k)) { grow(L, 'str', 0.2); grow(L, 'agi', 0.2); }
  else if (k === 'social') grow(L, 'cha', 0.3);
  else if (k === 'study' || k === 'work') grow(L, 'int', 0.2);
  else if (k === 'craft') L.craft = (L.craft || 0) + base * 0.6;
  else addSkillXp(L, k, base, true);
}
function promoInfo(L) {
  if (!L.job) return null; const j = JOB[L.job.id];
  if (L.job.lvl >= j.ladder.length - 1) return { top: true };
  const ok = L.job.perf >= 70 && L.job.yrs >= 2;
  return { top: false, ok, reason: ok ? '' : `Needs performance 70 and 2 years in the role (${Math.round(L.job.perf)}, ${L.job.yrs} yr)`, next: j.ladder[L.job.lvl + 1] };
}
function actPromo(L) {
  const info = promoInfo(L); if (!info || info.top || !info.ok) return 'Not yet.';
  const j = JOB[L.job.id];
  if (R.chance(clamp(0.5 + (L.job.perf - 70) / 60 + pct(L, 'interview'), 0.1, 0.95))) {
    L.job.lvl++; L.job.yrs = 0; L.job.perf = 55; fame(L, j.fame * 3); L.cnt.promos = (L.cnt.promos || 0) + 1;
    log(L, `Promoted to ${j.ladder[L.job.lvl]}!`, 'good');
    if (L.job.lvl === j.ladder.length - 1) unlock(L, 'career_top');
    return `Promoted to ${j.ladder[L.job.lvl]}.`;
  }
  L.job.perf -= 10; return 'Your boss says not this year.';
}
function quitJob(L) { if (!L.job) return ''; const n = JOB[L.job.id].ladder[L.job.lvl]; log(L, `You quit your job as ${n}.`); L.job = null; return 'You quit.'; }

/* ---------- SCHOOLS & TUTORS ---------- */
function schoolStatus(L, s) {
  const town = TOWN[L.town];
  if (L.edu.done.includes(s.id) && s.years) return { ok: false, why: 'Already graduated' };
  if (L.age < s.age[0]) return { ok: false, why: `From age ${s.age[0]}` };
  if (L.age > s.age[1]) return { ok: false, why: 'Too old' };
  if (s.where !== 'any' && !townOk(s.where, town)) return { ok: false, why: 'Not in this town' };
  const payer = L.age < 15 ? L.family.funds : L.gold;
  let cost = s.cost;
  if (s.id === 'sanctum') { const inv = (L.ranks.sg || 0) >= 3 || L.bg === 'sanctum_line' || ['sword_talent','god_swordsman','sword_saint_soul'].some(t => L.traits.includes(t)); if (!inv) return { ok: false, why: 'Invitation only: Advanced Sword God Style or rare sword talent' }; }
  if (s.id === 'ranoa') {
    const cut = 1 - (pct(L, 'reqCut') || 0);
    const schol = L.mana.cap >= 2500 * cut || L.mana.chantless || bestMagic(L) >= 4;
    const exam = L.st.int >= 9 * cut && (bestMagic(L) >= 2 || L.mana.cap >= 800 * cut);
    if (schol) return { ok: true, cost: 0, note: 'Special-student scholarship' };
    if (!exam) return { ok: false, why: 'Exam: Intelligence 9 and Intermediate magic or 800 mana' };
  }
  if (s.id === 'seminary' && (L.race === 'demonkin' || L.race === 'superd')) return { ok: false, why: 'The seminary turns demons away' };
  if (payer < cost) return { ok: false, why: `${cost} gold a year (${L.age < 15 ? 'family' : 'you'} can't afford it)` };
  return { ok: true, cost };
}
function actEnroll(L, sid) {
  const s = SCHOOL[sid]; const st = schoolStatus(L, s); if (!st.ok) return st.why;
  L.edu.school = sid; L.edu.yrs = 0; L.edu.free = st.cost === 0 && s.cost > 0;
  log(L, `You enroll at ${s.name}${L.edu.free ? ' on a scholarship' : ''}.`, 'good');
  return `Enrolled at ${s.name}.`;
}
function leaveSchool(L) { if (!L.edu.school) return ''; log(L, `You leave ${SCHOOL[L.edu.school].name}.`); L.edu.school = null; return 'You left school.'; }
function tutorStatus(L) {
  const tutors = L.people.filter(p => p.alive && p.role === 'mentor' && p.tutor).length;
  if (L.age < 2) return { ok: false, why: 'From age 2' };
  if (L.age >= 15) return { ok: false, why: 'Tutors teach children; find a mentor instead' };
  if (tutors >= 2) return { ok: false, why: 'Two tutors is the limit' };
  if (L.family.funds < 60) return { ok: false, why: 'Your family can’t afford 60 gold' };
  return { ok: true };
}
function actHireTutor(L, k) {
  const st = tutorStatus(L); if (!st.ok) return st.why;
  L.family.funds -= 60;
  const r = R.w([3, 4, 5], x => x === 3 ? 60 : x === 4 ? 35 : 5);
  let p;
  if (k === 'water' && R.chance(.15) && !L.people.some(x => x.name === 'Roxy')) { p = roxy(L); p.role = 'mentor'; p.tutor = true; }
  else if (STYLE[k] && L.family.wealth >= 3 && R.chance(.12) && !L.people.some(x => x.name === 'Ghislaine')) { p = ghislaine(L); p.role = 'mentor'; p.tutor = true; }
  else p = npc(L, { role: 'mentor', tutor: true, age: R.i(24, 55), op: R.i(20, 40), skill: { k, r }, job: 'Tutor', race: R.chance(.7) ? 'human' : R.w(RACES, x => x.weight).id });
  const sk = STYLE[p.skill.k] ? STYLE[p.skill.k].name : MAGIC_ID[p.skill.k].name + ' magic';
  remember(p, L, 'Became your tutor'); unlock(L, 'mentor_found');
  log(L, `${p.name} ${p.sur} arrives to tutor you in ${sk} (${RANKS[p.skill.r]} rank).`, 'good');
  if (!L.mana.revealed && MAGIC_ID[k]) { L.mana.revealed = true; }
  return `${p.name} becomes your tutor (${RANKS[p.skill.r]} ${sk}).`;
}

/* ---------- GUILD ---------- */
function guildStatus(L) {
  const town = TOWN[L.town];
  if (L.guild.reg) return { ok: false, why: 'Registered' };
  if (L.age < 11) return { ok: false, why: 'From age 11 with a guardian' };
  const guardian = L.people.some(p => p.alive && ['mother','father','guardian'].includes(p.role));
  if (L.age < 15 && !guardian) return { ok: false, why: 'Under 15 you need a guardian’s consent' };
  if (!town.tags.includes('guild')) return { ok: false, why: 'No guild hall in this town' };
  return { ok: true };
}
function actRegister(L) {
  const s = guildStatus(L); if (!s.ok) return s.why;
  L.guild.reg = true; unlock(L, 'guild_reg'); refreshBoards(L);
  log(L, 'You register at the Adventurer Guild as an F-rank adventurer.', 'good');
  return 'Registered as F rank.';
}
let _qid = 0;
function genQuest(L) {
  const rank = clamp(L.guild.rank + R.w([-1, 0, 0, 1, 1, 2], x => 1), 0, 6);
  const town = TOWN[L.town];
  const type = R.w(QUEST_TYPES, t => t.w * (t.id === 'labyrinth' && town.tags.includes('labyrinth') ? 4 : 1));
  const foe = type.foes[rank];
  const verbs = { hunt: 'Hunt ' + foe, escort: 'Escort ' + foe, delivery: 'Deliver ' + foe, explore: 'Explore ' + foe, gather: 'Gather ' + foe, defense: 'Defend ' + foe, labyrinth: 'Clear ' + foe };
  return { id: 'q' + (++_qid) + R.i(100, 999), type: type.id, rank, title: verbs[type.id], danger: Math.round(QUEST_DANGER[rank] * rnd(0.9, 1.15)),
           gold: Math.round([8, 20, 45, 90, 180, 400, 1000][rank] * rnd(0.8, 1.25)), pts: [2, 4, 7, 12, 20, 35, 60][rank], fame: [0, 1, 2, 4, 8, 15, 30][rank] };
}
function questChance(L, q) {
  if (L.cheats && L.cheats.sureQuest) return 1;
  let pw = power(L); if (q.type === 'labyrinth') pw *= 1 + pct(L, 'laby');
  return clamp(1 / (1 + Math.exp(-(pw - q.danger) / 9)), 0.03, 0.97);
}
function riskLabel(p) { return p >= .85 ? 'Safe' : p >= .65 ? 'Fair' : p >= .4 ? 'Risky' : p >= .2 ? 'Dangerous' : 'Deadly'; }
function actQuest(L, qid) {
  const q = L.quests.find(x => x.id === qid); if (!q) return 'That quest is gone.';
  L.quests = L.quests.filter(x => x !== q);
  const p = questChance(L, q);
  const party = L.people.filter(x => x.alive && x.role === 'party');
  if (R.chance(p)) {
    const g = Math.round(q.gold * (1 + pct(L, 'loot') + pct(L, 'questGold')) * Math.max(0.4, 1 - 0.1 * party.length));
    money(L, g); L.guild.pts += q.pts; fame(L, q.fame); L.cnt.quests = (L.cnt.quests || 0) + 1;
    addSkillXp(L, L.sword.styleChosen && bestSword(L) >= bestAttack(L) ? L.sword.primary : (bestAttack(L) > 0 ? bestElement(L) : 'fund'), 10 + q.rank * 6, true);
    party.forEach(x => relGain(L, x, 4));
    let msg = `Quest complete: ${q.title}. +${g} gold, +${q.pts} guild points.`;
    if (q.type === 'labyrinth' && q.rank >= 2) { if (earn(L, 'laby_conqueror', 'You reach the labyrinth’s core and claim its mana crystal.')) { unlock(L, 'labyrinth'); fame(L, 25); } }
    log(L, msg, 'good');
    return msg;
  }
  let msg = `The quest fails: ${q.title}.`;
  const gap = q.danger - power(L);
  const M = mods(L);
  const deathP = (gap > 35 ? 0.45 : gap > 20 ? 0.22 : 0.02) * (1 - (M.deathSave || 0));
  if (R.chance(deathP)) { L.hp = 0; L.deathCause = `killed on a quest (${q.title.toLowerCase()})`; log(L, msg + ' You do not make it back.', 'bad'); return msg + ' You do not make it back.'; }
  if (R.chance(0.65)) {
    const d = hurt(L, R.i(10, 22) + q.rank * 6, 'quest wounds'); msg += ` You are wounded (−${d} health).`;
    if (q.rank >= 3 && R.chance(0.15 * Math.max(0.2, 1 + pct(L, 'injury')))) { const inj = R.pick(['a scarred sword arm','a ruined knee','a lost eye','a crushed hand']); L.injuries.push(inj); msg += ` You are left with ${inj}.`; if (inj === 'a lost eye') { L.flags.patchSide = R.pick([-1, 1]); addScar(L, 'brow', L.flags.patchSide); } }
  }
  if (party.length && R.chance(0.2)) { const x = R.pick(party); x.op -= 10; if (x.op < 0) { x.role = 'friend'; msg += ` ${x.name} quits the party.`; } }
  stress(L, 10); log(L, msg, 'bad');
  return msg;
}

/* ---------- TRAVEL ---------- */
function travelInfo(L, tid) {
  const from = TOWN[L.town], to = TOWN[tid];
  if (tid === L.town) return { ok: false, why: 'You are here' };
  if (L.age < 15 && !L.flags.displaced) return { ok: false, why: 'Too young to travel alone' };
  const fly = hasFlag(L, 'fly'), sea = L.race === 'seafolk';
  const cross = from.cont !== to.cont;
  let cost = cross ? (fly || sea ? 10 : 60) : 5;
  const mount = L.gear && L.gear.mount;
  if (mount === 'land_dragon' || (mount === 'horse' && !cross)) cost = Math.max(1, Math.round(cost / 2));
  if (to.cont === 'heaven' && !fly && L.race !== 'heavenfolk') cost += 60;
  if ((to.id === 'superd_camp' || to.id === 'silverleaf') && !L.flags['found_' + to.id] && !(L.home === to.id)) return { ok: false, why: 'Hidden. Someone must show you the way' };
  if (L.gold < cost) return { ok: false, why: `${cost} gold`, cost };
  return { ok: true, cost, cross };
}
function actTravel(L, tid) {
  const info = travelInfo(L, tid); if (!info.ok) return info.why;
  money(L, -info.cost);
  const to = TOWN[tid];
  L.town = tid; if (!L.towns) L.towns = []; if (!L.towns.includes(tid)) L.towns.push(tid); discoverL(L, 'town', tid);
  if (!L.visited.includes(to.cont)) { L.visited.push(to.cont); if (L.visited.length >= 5) { earn(L, 'wanderer'); unlock(L, 'wanderer'); } }
  let msg = `You travel to ${to.name}${info.cross ? `, crossing to the ${CONT[to.cont].name}` : ''}.`;
  if (L.job && !townOk(JOB[L.job.id].where, to)) { msg += ` You leave your job as ${JOB[L.job.id].ladder[L.job.lvl]} behind.`; L.job = null; }
  if (L.edu.school && !townOk(SCHOOL[L.edu.school].where, to) && SCHOOL[L.edu.school].where !== 'any') { msg += ` You withdraw from ${SCHOOL[L.edu.school].name}.`; L.edu.school = null; }
  log(L, msg);
  refreshBoards(L);
  if (L.flags.displaced && (tid === L.flags.displaced || (TOWN[tid].tags.includes('fittoa') && TOWN[L.flags.displaced].tags.includes('fittoa')))) {
    L.flags.displaced = 0;
    let home = 'Home. After everything, you are home. The village is half rebuilt, and some faces are missing, but you made it.';
    const lost = L.people.filter(p => p.alive && p.lost);
    const still = lost.find(p => p.role === 'mother') || lost.find(p => p.role === 'father');
    lost.forEach(p => { if (p === still && R.chance(.6)) return; p.lost = false; relGain(L, p, 30); home += ` ${p.name} is here waiting for you.`; });
    const missing = L.people.find(p => p.alive && p.lost && isFamily(p));
    if (missing) home += ` There is still no word of ${missing.name}.`;
    home += finishDisplaced(L);
    log(L, home, 'big'); msg += ' ' + home;
  }
  return msg;
}
function exploreBlock(L) { if (L.age < 6) return 'From age 6.'; return null; }

/* ---------- EXPLORE ---------- */
const EXPLORE_SKIP = ['sibling_born','first_steps','fever','plague','misfortune','family_woe','grandchild','retire','elder_reflection','job_praise','job_conflict','mangod','found_coins','twin_bond','sibling_rivalry','hardship','chores','parent_war','school_prize','dragon_awaken','labyrinth_rumor'];
const EXPLORE_BOOST = { demon_empress: 3, superd: 2, holy_beast: 2, stampede: 2, bandits: 2, beggar: 2, tavern_brawl: 2, spirit: 2, north_wanderer: 2, lost_woods: 2, neighbor_kid: 2, pet: 2, dragon_god: 1.5 };
function actExplore(L) {
  const pool = EVENTS.filter(e => !EXPLORE_SKIP.includes(e.id)).map(e => ({ e, w: eventWeight(L, e) * (EXPLORE_BOOST[e.id] || 1) })).filter(x => x.w > 0);
  if (pool.length && R.chance(0.65)) {
    const p = R.w(pool, x => x.w);
    const before = L.queue.length;
    fireEvent(L, p.e);
    if (L.queue.length > before) return '';
    return L.log.length ? L.log[L.log.length - 1].t : 'You explore the area.';
  }
  const town = TOWN[L.town];
  const r = R.i(0, 3);
  if (r === 0) { const g = Math.round(R.i(2, 12) * (1 + pct(L, 'loot'))); money(L, g); return `You wander ${town.name}’s back streets and find ${g} gold.`; }
  if (r === 1) return actMeet(L, 'friend');
  if (r === 2) { stress(L, -6); return `You spend the day exploring ${town.name}. ${town.note}`; }
  grow(L, 'agi', .3); return `You climb the highest point near ${town.name} and take in the view.`;
}

/* ---------- NPC BIOS ---------- */
const aOrAn = (w) => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
function genBio(p) {
  const q = R.pick(QUIRKS);
  if (p.canon) return p.bio || '';
  if (['mother','father'].includes(p.role) && p.job) return `Works as ${aOrAn(p.job.toLowerCase())}. ${cap1(p.tags[0])} by nature, and ${q}.`;
  if (p.role === 'guardian') return `Runs the orphanage with a firm hand and a soft heart, and ${q}.`;
  if (p.age < 6) return `A small, ${p.tags[0]} child who ${q}.`;
  if (p.age < 15) return `A ${p.tags[0]} kid who ${R.pick(DREAMS)} and ${q}.`;
  return `${cap1(p.tags[0])}${p.tags[1] ? ' and ' + p.tags[1] : ''}. ${cap1(R.pick(DREAMS))}, and ${q}.`;
}

/* ---------- ACTIVITIES ---------- */
const ACT = Object.fromEntries(ACTIVITIES.map(a => [a.id, a]));
function activityBlock(L, id) {
  const a = ACT[id];
  if (L.age < a.minAge) return `From age ${a.minAge}`;
  if (a.size && TOWN[L.town].size < a.size) return 'Needs a town or city';
  if (id === 'gamble' && L.gold < 10) return 'Needs 10 gold';
  if (id === 'groom' && L.gold < 15) return 'Needs 15 gold';
  if (id === 'healpoor') return healBlock(L);
  if (id === 'craft') return craftBlock(L);
  if (id === 'explore') return exploreBlock(L);
  if (id === 'grave' && !L.people.some(p => !p.alive && (isFamily(p) || p.op >= 50 || p.role === 'mentor'))) return 'No one to mourn yet';
  return null;
}
function rumors(L) {
  const s7 = META.world.seven;
  return [
    'Rumor has it the Sword Sanctum turns away nine of every ten who climb its stairs.',
    'A merchant swears a starving woman in royal clothes keeps turning up around Rikarisu, begging for food and promising rewards.',
    'They say Ranoa University takes anyone, demons included, if their magic is strong enough.',
    'Word is the Teleport Labyrinth in Begaritt has swallowed three A-rank parties this year.',
    `Drunks argue over whether ${s7[6].name}, the ${s7[6].title}, could beat ${s7[5].name}.`,
    'A sailor claims the Sea Folk sank a smuggler’s ship last month for crossing without their permission.',
    'Someone saw a silver-haired man with golden eyes on the northern road. Every dog in the village howled.',
    'The Holy Knights of Millis are recruiting again. Demons need not apply, they say.',
    'An old adventurer says a green-haired Superd once saved her caravan, and nobody believes her.',
  ];
}
function actActivity(L, id) {
  switch (id) {
    case 'explore': return actExplore(L);
    case 'craft': return actCraft(L);
    case 'healpoor': return actHealPoor(L);
    case 'library': {
      const m = xpMult(L, 'study'); L.read = clamp(L.read + 8 * m, 0, 100); grow(L, 'int', .5 * m);
      if (L.read >= 100) unlock(L, 'literate');
      if (R.chance(.12)) { const k = R.pick(['fire','water','earth','wind','barrier','heal']); const g = addSkillXp(L, k, 30, true); return `In a dusty corner of the library you find an old treatise on ${MAGIC_ID[k].name.toLowerCase()} magic (+${g} XP).`; }
      return 'You spend the day among the shelves. Reading and Intelligence improve.';
    }
    case 'tavern': {
      stress(L, -4);
      if (R.chance(.45)) {
        const pool = EVENTS.filter(e => ['bandits','tavern_brawl','investment','labyrinth_rumor','guild_rescue','admirer','noble_ball','beggar','merchant_guard','noble_insult','bard_song','old_friend'].includes(e.id)).map(e => ({ e, w: eventWeight(L, e) })).filter(x => x.w > 0);
        const pk = R.w(pool, x => x.w);
        if (pk) { const before = L.queue.length; fireEvent(L, pk.e); if (L.queue.length > before) return ''; return L.log[L.log.length - 1].t; }
      }
      return R.pick(rumors(L));
    }
    case 'pray': { stress(L, -8); if (R.chance(.12)) { const g = addSkillXp(L, 'heal', 15, true); return `As you pray, warmth settles in your hands (+${g} healing XP).`; } return 'You kneel in the quiet chapel. Your mind settles.'; }
    case 'gamble': {
      money(L, -10);
      if (R.chance(clamp(.38 + L.st.luck * .008, .1, .7))) { const w = R.chance(.12) ? 90 : 22; money(L, w); if (w >= 90) unlock(L, 'gambler'); return w >= 90 ? `The dice love you tonight. You walk away with ${w} gold.` : `You win ${w} gold.`; }
      stress(L, 4); return 'The dice go cold. You lose your stake.';
    }
    case 'groom': {
      money(L, -15); stress(L, -5);
      const g = Math.max(.05, .35 - Math.max(0, L.st.looks - 6) * .025); L.st.looks = Math.min(20, L.st.looks + g);
      return R.pick(['A hot bath, a sharp barber, and a clean shirt. You catch your reflection and do a double take.', 'The bathhouse steam takes ten years of grime off you. The barber takes the rest.', 'Oils, a trim, and an hour of gossip in the bath. You walk out standing a little straighter.']) + ` (Looks +${g.toFixed(2)})`;
    }
    case 'oddjobs': { const g = R.i(3, 9) + Math.floor(L.st.str / 4); money(L, g); stress(L, 3); return `You haul crates and carry messages all day for ${g} gold.`; }
    case 'spar': {
      const k = L.sword.styleChosen ? L.sword.primary : 'fund'; const g = addSkillXp(L, k, 18); grow(L, 'agi', .2);
      if (R.chance(.22)) { const d = hurt(L, R.i(3, 8), 'a sparring accident'); return `You spar until dusk (+${g} XP) and take a nasty knock (−${d} health).`; }
      stress(L, 3); return `You spar with the regulars at the training grounds. +${g} XP.`;
    }
    case 'hunt': {
      if (R.chance(questChance(L, { danger: 14 + L.age / 3, type: 'hunt' }))) {
        const g = Math.round(R.i(6, 20) * (1 + pct(L, 'loot'))); money(L, g);
        addSkillXp(L, L.sword.styleChosen && bestSword(L) >= bestAttack(L) ? L.sword.primary : bestElement(L), 12, true);
        return `You track and bring down a ${R.pick(['great boar','horned rabbit','forest wolf','marsh lizard','rock turtle'])}. Pelts and meat sell for ${g} gold.`;
      }
      const d = hurt(L, R.i(6, 14), 'a hunt gone wrong'); return `The hunt goes badly (−${d} health).`;
    }
    case 'meditate': { L.mana.ctrl = clamp(L.mana.ctrl + 3, 0, 100); stress(L, -12); return `You sit in silence and follow your mana’s currents. Control ${Math.round(L.mana.ctrl)}; stress eases.`; }
    case 'journal': { stress(L, -9); grow(L, 'int', .15); return 'You write about the year so far. Putting it on paper helps.'; }
    case 'grave': { const p = R.pick(L.people.filter(p => !p.alive && (isFamily(p) || p.op >= 50 || p.role === 'mentor'))); stress(L, -14); return `You leave flowers for ${p.name} and tell them about your year.`; }
    case 'volunteer': { stress(L, -10); fame(L, 1); return 'You help at the orphanage. The children won’t stop asking you about magic.'; }
  }
  return '';
}

/* ---------- MARKET ---------- */
const WHERE_NAMES = { guild: 'towns with a guild hall', university: 'Sharia', church: 'Millishion', size2: 'towns and cities', size3: 'cities' };
function sellValue(L, slot) { const id = L.gear[slot]; return id && ITEM[id] && !ITEM[id].unique ? Math.round(ITEM[id].price * 0.5) : 0; }
function itemBlock(L, id) {
  const it = ITEM[id]; const town = TOWN[L.town];
  if (it.unique) return 'Cannot be bought';
  if (L.gear[it.slot] === id) return 'Owned';
  if (L.age < it.minAge) return `From age ${it.minAge}`;
  if (it.where === 'size2' && town.size < 2) return 'Sold in towns and cities';
  if (it.where === 'size3' && town.size < 3) return 'Sold in cities';
  if (!['any','size2','size3'].includes(it.where) && !town.tags.includes(it.where)) return `Sold in ${WHERE_NAMES[it.where] || it.where}`;
  const net = it.price - sellValue(L, it.slot);
  if (L.gold < net) return `Needs ${fmt(net)} gold`;
  return null;
}
/* ---------- YEAR PLAN: unused actions are shared between up to three chosen focuses ---------- */
const PLAN_OPTS = [
  { id: 'mana', grp: 'Training', name: 'Mana', icon: 'drop', block: (L) => manaBlock(L), run: (L) => actMana(L, false) },
  { id: 'body', grp: 'Training', name: 'Body training', icon: 'fist', block: () => null, run: (L) => actBody(L) },
  { id: 'study', grp: 'Training', name: 'Study', icon: 'book', block: () => null, run: (L) => actStudy(L) },
  { id: 'aura', grp: 'Training', name: 'Battle Aura', icon: 'flame', block: (L) => auraBlock(L), run: (L) => actAura(L) },
  { id: 'sword', grp: 'Swordsmanship', name: 'Your sword style', icon: 'sword', block: (L) => swordBlock(L, null), run: (L) => actSword(L, L.sword.styleChosen ? L.sword.primary : null) },
  ...['sg', 'wg', 'ng'].map(k => ({ id: 's_' + k, grp: 'Swordsmanship', name: STYLE[k].name, icon: 'sword', block: (L) => swordBlock(L, k), run: (L) => actSword(L, k) })),
  ...MAGIC.map(m => ({ id: 'm_' + m.id, grp: 'Magic', name: m.name + ' magic', icon: 'wand', block: (L) => magicBlock(L, m.id), run: (L) => actMagic(L, m.id) })),
  { id: 'rest', grp: 'Daily life', name: 'Rest', icon: 'leaf', block: () => null, run: (L) => actRest(L) },
  { id: 'explore', grp: 'Daily life', name: 'Explore', icon: 'map', block: (L) => exploreBlock(L), run: (L) => actExplore(L) },
  { id: 'work', grp: 'Daily life', name: 'Work hard', icon: 'work', block: (L) => L.job ? null : 'You have no job.', run: (L) => actWorkHard(L) },
  { id: 'craft', grp: 'Daily life', name: 'Craft', icon: 'scroll', block: (L) => craftBlock(L), run: (L) => actCraft(L) },
  { id: 'healpoor', grp: 'Daily life', name: 'Heal the poor', icon: 'heart', block: (L) => healBlock(L), run: (L) => actHealPoor(L) },
];
const PLAN_OPT = Object.fromEntries(PLAN_OPTS.map(o => [o.id, o]));
const planList = (L) => (L.plan || []).filter(id => PLAN_OPT[id]);
/* spends actions in turn across the plan; stops when actions run out, an event needs you, or nothing is open yet */
function spendPlan(L, max) {
  const plan = planList(L).map(id => PLAN_OPT[id]);
  const done = {}; let n = 0, i = 0, miss = 0;
  if (!plan.length) return { n, done };
  while (L.ap > 0 && L.alive && L.hp > 0 && !L.queue.length && n < (max || 99)) {
    const o = plan[i++ % plan.length];
    let b = null; try { b = o.block(L); } catch (e) { b = 'error'; }
    if (b) { if (++miss >= plan.length) break; continue; }
    miss = 0;
    if (!spendAP(L)) break;
    try { o.run(L); } catch (err) { console.error('plan', o.id, err); }
    done[o.id] = (done[o.id] || 0) + 1; n++;
  }
  return { n, done };
}
const planSummary = (done) => Object.entries(done).map(([id, c]) => `${PLAN_OPT[id] ? PLAN_OPT[id].name : id}${c > 1 ? ' ×' + c : ''}`).join(', ');
function workBlock(L, id) {
  const w = WORK[id]; if (!w) return 'Unknown work.';
  if ((L.works || {})[id] != null) return `You funded this at age ${L.works[id]}.`;
  if (L.age < w.minAge) return `From age ${w.minAge}.`;
  if (w.fameReq && L.fame < w.fameReq) return `People must know your name first (fame ${w.fameReq}).`;
  if (L.gold < w.cost) return `Needs ${fmt(w.cost)} gold.`;
  return null;
}
function actFund(L, id) {
  const b = workBlock(L, id); if (b) return b;
  const w = WORK[id]; if (!L.works) L.works = {};
  money(L, -w.cost); L.works[id] = L.age;
  const f0 = L.fame; fame(L, w.fame); const f = Math.round(L.fame - f0);
  unlock(L, 'benefactor'); if (WORKS.every(x => L.works[x.id] != null)) unlock(L, 'great_patron');
  if (id === 'expedition') { discoverL(L, 'town', 'sky_temple'); if (!L.towns.includes('sky_temple')) L.towns.push('sky_temple'); }
  const msg = `You fund ${workLc(w)}. ${w.done} Fame +${f}.`;
  log(L, msg, 'good');
  return msg;
}
function buyItem(L, id) {
  const b = itemBlock(L, id); if (b) return b;
  const it = ITEM[id]; const old = L.gear[it.slot]; const refund = sellValue(L, it.slot);
  money(L, -(it.price - refund)); L.gear[it.slot] = id;
  if (['cottage','townhouse','manor'].includes(id)) unlock(L, 'homeowner');
  if (id === 'manor') unlock(L, 'manor_lord');
  if (id === 'mithril_blade' || id === 'dragonscale') unlock(L, 'well_armed');
  const msg = `You buy the ${it.name}${old ? ` and sell your ${ITEM[old].name} for ${refund} gold` : ''}.`;
  log(L, msg, 'good');
  return msg;
}
function sellItem(L, slot) {
  const id = L.gear[slot]; if (!id) return '';
  const v = sellValue(L, slot); money(L, v); delete L.gear[slot];
  return ITEM[id].unique ? `You put away the ${ITEM[id].name}.` : `You sell the ${ITEM[id].name} for ${v} gold.`;
}
