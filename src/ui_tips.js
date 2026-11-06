/* ===================== UI: TOOLTIP CONTENT ===================== */
const TT = (title, tag, body, tagCls) => `<div class="tt"><div class="tt-head"><b>${esc(title)}</b>${tag ? `<span class="tt-tag ${tagCls || ''}">${esc(tag)}</span>` : ''}</div>${body}</div>`;
const ttP = (t, cls) => t ? `<p class="${cls || 'tt-p'}">${t}</p>` : '';
const ttFx = (lines) => lines.length ? `<ul class="tt-fx">${lines.map(l => `<li class="${l.neutral ? 'n' : l.good ? 'g' : 'b'}">${esc(l.t)}</li>`).join('')}</ul>` : '';
const ttRows = (rows) => `<dl class="tt-dl">${rows.filter(Boolean).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
const TAG_NAMES = { guild: 'Adventurer Guild hall', university: 'Ranoa University', church: 'Millis cathedral', port: 'Sea port', capital: 'Royal capital', court: 'Royal court', military: 'Garrison', forge: 'Dwarven forges', labyrinth: 'Labyrinths', sanctum: 'Sword Sanctum', dojo_water: 'Water God dojo', war: 'Frequent wars', danger: 'Dangerous wilds', dragon: 'Red wyrms', forest: 'Great Forest', beast: 'Beastfolk village', elven: 'Elven glade', demon: 'Demon lands', rural: 'Farmland', desert: 'Desert', sea: 'Sea Folk city', sacred: 'Sacred site', hidden: 'Hidden', fittoa: 'Fittoa Region', seminary: 'Seminary' };
const WEALTH_NAMES = ['Destitute', 'Poor', 'Modest', 'Comfortable', 'Wealthy', 'Fabulously rich'];
const CLASS_NAMES = ['Commoner', 'Well-to-do', 'Knightly', 'Noble', 'Royal'];
function xpBreakdown(L, k) {
  const M = mods(L); const out = [];
  let tr = (k === 'social') ? 0 : (M.xp.all || 0); for (const p of (XP_PATH[k] || [k])) tr += M.xp[p] || 0;
  if (Math.abs(tr) >= .005) out.push(`Traits and gear ${sgn(tr)}`);
  const mm = mentorMult(L, k); if (mm > 1) out.push(`Mentor ${sgn(mm - 1)}`);
  const sm = schoolMult(L, k); if (sm > 1) out.push(`School ${sgn(sm - 1)}`);
  if (MAGIC_ID[k] && L.mana.eff) out.push(`Efficiency ${sgn(L.mana.eff / 250)}`);
  if (STYLE[k] || k === 'fund') { const b = clamp(1 + (L.st.str + L.st.agi - 14) / 60, 0.7, 1.6); if (Math.abs(b - 1) > .01) out.push(`Strength and Agility ${sgn(b - 1)}`); if (k !== 'fund' && L.sword.primary && k !== L.sword.primary && !hasFlag(L, 'noStylePenalty')) out.push('Secondary style −30%'); }
  return out;
}
function tipHtml(spec) {
  const [kind, id, extra] = String(spec).split(':');
  const L = UI.L || null;
  try {
    switch (kind) {
      case 'trait': {
        const t = TRAIT[id]; if (!t) return '';
        const lines = fxLines(t.fx || {});
        const src = EARNED_SOURCES.find(e => e.traits.includes(id));
        const tierI = TIER_IDX[t.tier];
        return TT(t.name, tierName(t.tier), ttP(esc(TRAIT_LORE[id] || ''), 'tt-lore') +
          (lines.length ? `<p class="tt-h">Effects</p>${ttFx(lines)}` : `<ul class="tt-fx"><li class="g">${esc(t.up)}</li>${t.down && t.down !== 'None' ? `<li class="b">${esc(t.down)}</li>` : ''}</ul>`) +
          ttRows([['In short', esc(t.up)], ['Drawback', t.down && t.down !== 'None' ? esc(t.down) : '<span class="ok">None</span>'],
            t.tier !== 'earned' && t.tier !== 'admin' ? ['Inheritance', `${Math.round(TIERS[tierI].inherit * 100)}% chance to pass to a child`] : null,
            src ? [t.tier === 'earned' ? 'How to earn' : 'Also earnable', esc(src.how)] : null]), 'tier-' + t.tier);
      }
      case 'tier': { const i = TIER_IDX[id]; const t = TIERS[i]; if (!t) return ''; const tot = TIERS.reduce((a, x) => a + x.weight, 0);
        return TT(t.name + ' traits', 'Rarity', ttP(i >= 4 ? 'The rarest born gifts. They carry no drawback at all.' : i === 3 ? 'Strong talents with a minor drawback. Epic is the last tier with any downside.' : 'Everyday quirks. Each comes with a real trade-off.') + ttRows([['Base odds', `${(t.weight / tot * 100).toFixed(t.weight < 2 ? 2 : 1)}% per trait slot`], ['Drawbacks', i >= 4 ? '<span class="ok">None</span>' : 'Yes'], t.id !== 'admin' ? ['Inheritance', `${Math.round(t.inherit * 100)}% per child`] : null]), 'tier-' + t.id); }
      case 'skill': {
        const isS = !!STYLE[id] || id === 'fund'; const nm = id === 'fund' ? 'Sword Fundamentals' : STYLE[id] ? STYLE[id].name : MAGIC_ID[id].name + ' Magic';
        let body = ttP(esc(SKILL_DESC[id] || ''));
        if (L) {
          const r = rankOf(L, id), xp = id === 'fund' ? L.sword.fund : skillXp(L, id), nx = RANK_XP[Math.min(7, r + 1)];
          const mult = xpMult(L, id) * mentorMult(L, id) * schoolMult(L, id);
          const bd = xpBreakdown(L, id);
          const blk = id === 'fund' ? swordBlock(L, null) : MAGIC_ID[id] ? magicBlock(L, id) : swordBlock(L, id);
          body += ttRows([id !== 'fund' ? ['Rank', `${RANKS[r]}${r < 7 ? ` → ${RANKS[r + 1]} at ${fmt(nx)} XP` : ''}`] : null, ['Experience', `${fmt(xp)} XP`], ['Training speed', `${mulTxt(mult)}${bd.length ? ` <small>(${esc(bd.join(', '))})</small>` : ''}`],
            id !== 'fund' && r >= 3 && r < 7 ? ['Next step', r + 1 === 7 && isS ? 'Defeat the current title holder' : `Pass a ${RANKS[r + 1]} trial once you have ${fmt(RANK_XP[r + 1])} XP${MAGIC_ID[id] ? ` and ${fmt(MANA_GATE[r + 1])} mana` : ''}`] : null,
            blk ? ['Locked', esc(blk)] : null]);
        }
        return TT(nm, isS ? 'Swordsmanship' : 'Magic', body);
      }
      case 'rank': {
        const r = +id; const k = extra;
        const req = r === 0 ? 'Where everyone starts.' : r <= 3 ? `Reached automatically at ${fmt(RANK_XP[r])} XP.` : r === 7 ? `${fmt(RANK_XP[7])} XP, regional fame, then ${k && STYLE[k] ? 'defeat the current title holder in a duel' : 'pass the God trial'}.` : `${fmt(RANK_XP[r])} XP, then pass a ${RANKS[r]} trial.${k && MAGIC_ID[k] ? ` Magic trials also need ${fmt(MANA_GATE[r])} mana capacity.` : ''}${r >= 6 ? ' Requires regional fame.' : ''}`;
        return TT(RANKS[r], `Rank ${ROMANS[r] || '0'} of VII`, ttP(esc(RANK_DESC[r])) + ttRows([['Requirement', esc(req)], r >= 1 ? ['Combat power', `+${STYLE[k] ? r * 13 : MAGIC_ID[k] && MAGIC_ID[k].group === 'attack' ? r * 11 : r * 3} at this rank`] : null]));
      }
      case 'aura': { const s = +id;
        return TT(AURA_STAGES[s], `Stage ${s} of 6`, ttP(esc(AURA_DESC[s])) + ttRows([s ? ['Capacity needed', fmt(AURA_CAP[s])] : null, s === 5 ? ['Also needs', 'Aura control 50'] : null, s === 6 ? ['Also needs', 'Aura control 80, and King rank in a sword style or a legendary body'] : null, s ? ['Combat power', `+${s * 9}`] : null])); }
      case 'looks': {
        if (!L) return '';
        const ap = appearanceOf(L);
        return TT('Appearance', ap.word, ttP(esc(ap.line)) + ttRows(ap.rows.map(([k, v]) => [k, esc(v)])) + ttP('Looks ' + ap.v + '. Parents’ blood sets it at birth, grooming lifts it a little, and age slowly takes it.', 'tt-lore'));
      }
      case 'stat': {
        const v = L ? Math.round(L.st[id]) : null;
        const grow = { str: 'Body training, sword and aura practice, hard labor.', agi: 'Body training and sword practice; grows quickly in childhood.', int: 'Study, the library, school, and journaling.', cha: 'Talking with people, school, and social events.', looks: 'Set at birth, partly by your parents’ blood. The bathhouse and barber lift it a little. Fades in old age.', luck: 'Mostly fixed. Kindness to strangers sometimes helps.' }[id];
        return TT(STAT_FULL[id], v !== null ? String(v) : '', ttP(esc(STAT_DESC[id])) + ttRows([['How it grows', esc(grow)], ['Scale', '5 is ordinary for an adult, 10 is notable, 15 is exceptional, 20 is legendary.']]));
      }
      case 'mana': {
        const names = { cap: 'Mana Capacity', pot: 'Mana Potential', ctrl: 'Mana Control', eff: 'Mana Efficiency', chant: 'Chantless Casting' };
        let rows = [];
        if (L && id === 'cap') { const [a, b] = manaWin(L); rows = [['Current', fmt(L.mana.cap)], ['Growth windows', `Ages 0–${a} (fastest), ${a + 1}–${b} (slower)`], ['Trial gates', 'Saint 600 · King 1,500 · Emperor 4,000 · God 10,000']]; }
        if (L && id === 'pot') rows = [['Grade', L.mana.revealed ? potGrade(L.mana.pot) + ` (${mulTxt(L.mana.pot)} growth)` : 'Hidden'], ['Scale', 'E, D, C, B, A, S, SS']];
        if (L && id === 'chant') rows = [['Progress', L.mana.chantless ? 'Discovered' : Math.round(L.mana.chant) + '%'], ['Best age', 'Before 6. Progress slows sharply every year after 5.']];
        return TT(names[id] || 'Mana', '', ttP(esc(MANA_DESC[id] || '')) + (rows.length ? ttRows(rows) : ''));
      }
      case 'item': {
        const it = ITEM[id]; if (!it) return ''; const sl = (SLOTS_GEAR.find(s => s[0] === it.slot) || [, it.slot])[1];
        const lines = fxLines(it.fx || {}); if (it.power) lines.unshift({ t: `Combat power +${it.power}`, good: true });
        return TT(it.name, sl, ttP(esc(it.desc)) + ttFx(lines) + ttRows([['Price', it.unique ? 'Priceless' : fmt(it.price) + ' gold'], ['Sold in', it.unique ? 'Not sold' : it.where === 'any' ? 'Anywhere' : esc(WHERE_NAMES[it.where] || it.where)], ['Minimum age', String(it.minAge)], !it.unique ? ['Resale', fmt(Math.round(it.price * .5)) + ' gold'] : null]));
      }
      case 'goal': { const g = GOAL[id]; if (!g) return ''; const r = L ? g.check(L) : null; const done = L && L.goalsDone && L.goalsDone.includes(id);
        return TT(g.name, done ? 'Complete' : g.grp, ttP(esc(g.desc)) + ttRows([r ? ['Progress', `${fmt(Math.min(r[0], r[1]))} / ${fmt(r[1])}`] : null, ['Reward', `${g.rw.lp ? g.rw.lp + ' Legacy Points' : ''}${g.rw.gold ? ', ' + g.rw.gold + ' gold' : ''}${g.rw.xp ? ', ' + g.rw.xp + ' XP' : ''}`.replace(/^, /, '')], ['Repeats', 'Every life']])); }
      case 'ach': { const a = ACH[id]; if (!a) return ''; const rw = RW[a.rw] || RW.s; const got = META.ach[id];
        return TT(a.name, got ? 'Unlocked' : a.cat, ttP(esc(a.desc)) + ttRows([['First-time reward', `${rw.lp} Legacy Points, ${rw.gold} gold, ${rw.xp} XP`], got ? ['Unlocked', `${esc(got.who || '')}${got.at ? ', ' + new Date(got.at).toLocaleDateString() : ''}`] : null])); }
      case 'job': { const j = JOB[id]; if (!j) return ''; const rq = L ? jobReqs(L, j) : [];
        return TT(j.name, j.cat, ttP(`Career ladder: ${j.ladder.map(esc).join(' › ')}`) + ttRows([['Pay', `${fmt(j.pay[0])} to ${fmt(j.pay[j.pay.length - 1])} gold a year`], ['Trains', esc(FX_NAMES[j.skill] || j.skill)], j.risk ? ['Danger', `${Math.round(j.risk * 100)}% yearly injury risk`] : null, j.fame ? ['Fame', `+${j.fame} a year`] : null, rq.length ? ['Requirements', rq.map(x => `<span class="${x.ok ? 'ok' : 'no'}">${esc(x.l)}</span>`).join(', ')] : null])); }
      case 'school': { const s = SCHOOL[id]; if (!s) return '';
        return TT(s.name, s.years ? `${s.years}-year program` : 'Open enrollment', ttP(esc(s.note)) + ttRows([['Ages', `${s.age[0]}–${s.age[1] > 90 ? 'any' : s.age[1]}`], ['Tuition', s.cost ? s.cost + ' gold a year' : 'Free'], ['Teaches', Object.keys(s.xp).map(k => esc(FX_NAMES[k] ? FX_NAMES[k].replace(' XP', '') : k)).join(', ')], s.mentor ? ['Instructor', `${RANKS[s.mentor.rank]} rank`] : null])); }
      case 'town': { const t = TOWN[id]; if (!t) return '';
        return TT(t.name, SIZE_NAMES[t.size], ttP(esc(t.note)) + ttRows([['Realm', esc(t.realm)], ['Continent', CONT[t.cont].name], ['Notable', t.tags.map(x => TAG_NAMES[x]).filter(Boolean).join(', ') || 'Nothing in particular']])); }
      case 'race': { const r = RACE[id]; if (!r) return '';
        return TT(r.name, 'Race', ttP(esc(r.desc)) + ttRows([['Lifespan', `${r.life[0]}–${r.life[1]} years`], ['Coming of age', String(r.coming)], ['Mana windows', `0–${r.manaWin[0]}, then to ${r.manaWin[1]}`], ['Battle Aura', `Conditioning from ${r.auraWin[0]}, prime ${r.auraWin[1]}–${r.auraWin[2]}, closes ${r.auraWin[3]}`], ['Mana potential', `${mulTxt(r.pot)}`], ['Aura affinity', `${mulTxt(r.aura)}${r.auraNone ? ` (${Math.round(r.auraNone * 100)}% have none)` : ''}`]])); }
      case 'bg': { const b = BG[id]; if (!b) return '';
        return TT(b.name, tierName(b.tier), ttP(esc(b.desc)) + ttRows([['Wealth', WEALTH_NAMES[b.wealth]], ['Standing', CLASS_NAMES[b.cls]], ['Parents work as', b.jobs.map(esc).join(' and ')], b.races ? ['Races', b.races.map(x => RACE[x].name).join(', ')] : null, b.towns ? ['Born in', b.towns.map(x => TOWN[x] ? TOWN[x].name : x).join(', ')] : null]), 'tier-' + b.tier); }
      case 'season': { const s = SEASON[id]; if (!s) return ''; return TT(s.name, 'Birth season', ttP(esc(s.note)) + ttFx(fxLines(s.fx || {}))); }
      case 'omen': { const o = OMEN[id]; if (!o) return ''; return TT(o.name, 'Birth omen', ttP(esc(o.note)) + (o.luck ? ttRows([['Rarity luck', `+${Math.round(o.luck * 100)}%`]]) : '')); }
      case 'order': { const o = BORDER[id]; if (!o) return ''; return TT(o.name, 'Birth order', ttP(esc(o.note))); }
      case 'upg': { const u = UPG[id]; if (!u) return ''; const lv = META.upg[u.id] || 0; const cat = UPG_CATS.find(c => c[0] === u.cat);
        const prices = u.max > 1 ? Array.from({ length: u.max }, (_, i) => fmt(upgCost(u, i))).join(' → ') + ' LP' : fmt(u.cost) + ' LP';
        return TT(u.name, `${cat ? cat[1] + ' · ' : ''}Level ${lv} of ${u.max}`, ttP(esc(u.note)) + ttRows([[lv >= u.max ? 'Status' : 'Next level', lv >= u.max ? 'Fully owned' : fmt(upgCost(u, lv)) + ' Legacy Points'], u.max > 1 ? ['Level prices', prices] : null, ['Applies to', 'Every life you begin from now on'], ['You have', fmt(META.lp) + ' LP']].filter(Boolean))); }
      case 'arc': { const a = ARC[id]; if (!a) return ''; const s = L ? arcStatus(L, a) : null;
        return TT(a.name, 'Story arc', ttP(esc(a.blurb)) + ttRows([s ? ['Status', s.done ? 'Complete' : s.closed ? 'Closed' : s.stage ? `Chapter ${ROMANS[s.stage]} of ${ROMANS[a.chapters.length]} reached` : 'Not begun'] : null, s && s.next ? ['Next', `${esc(s.next[0])}: ${esc(s.next[1])}`] : null])); }
      case 'act': { const a = ACT[id]; if (!a) return ''; return TT(a.name, a.grp, ttP(esc(a.note)) + ttRows([['Cost', '1 action'], ['From age', String(a.minAge)]])); }
      case 'style': { const s = STYLE[id]; if (!s) return ''; return TT(s.name, s.phil, ttP(esc(SKILL_DESC[id])) + ttP(esc(s.note), 'tt-lore')); }
      case 'person': { if (!L) return ''; const p = person(L, id); if (!p) return '';
        return TT(`${p.name} ${p.sur || ''}`.trim(), ROLE_NAMES[p.role] || p.role, ttP(esc(p.bio || ''), 'tt-lore') + ttRows([['Relationship', `${relLabel(p)} (${p.op > 0 ? '+' : ''}${p.op})`], ['Age', String(p.age)], ['Race', RACE[p.race].name], p.skill ? ['Skill', `${RANKS[p.skill.r]} ${STYLE[p.skill.k] ? STYLE[p.skill.k].short + ' Style' : MAGIC_ID[p.skill.k].name + ' magic'}`] : null])); }
      case 'term': return termTip(id, L);
    }
  } catch (e) { return ''; }
  return '';
}
function termTip(id, L) {
  const M = L ? mods(L) : null;
  switch (id) {
    case 'ap': {
      const base = L ? apBase(L) : 6;
      return TT('Actions', L ? `${L.ap} of ${L.apMax} left` : '', ttP('Everything you train, work at, or explore costs one action. Unused actions are lost when you age up.') +
        ttRows([['By age', '1 to age 5 · 2 to age 10 · 3 to age 14 · 6 from age 15'], ['Wellness bonus', '+1 at 60% health and stress 40 or less · +2 at 80% and 25 · +3 at 92% and 10 (capped at +1 until 5, +2 until 14)'],
          L ? ['This year', `${base} base${L.well ? ` + ${L.well} wellness` : ''}${M.ap ? ` + ${M.ap} from traits and perks` : ''}${L.age <= 10 && M.apEarly ? ` + ${M.apEarly} early` : ''}`] : null]));
    }
    case 'sp': return TT('Social points', L ? `${L.sp} of ${L.spMax || spFor(L)} left` : '', ttP('Spend them on the people in your life: talks, gifts, training, dates, and more. They refresh every year.') + ttRows([['By age', '1 as an infant · 2 as a child · 3 from age 15'], L && M.sp ? ['Bonus', `+${M.sp} from traits and perks`] : null]));
    case 'world': { const n = WN[id]; if (!n) return ''; const m = L && activeWorld(L).find(x => x.id === id); return TT(n.eff || 'Word from afar', m ? `Until year ${m.to}` : '', ttP(esc(n.t)) + (n.fx ? ttFx(fxLines(n.fx)) : '')); }
    case 'plan': { const pl = L ? planList(L) : []; return TT('Year Plan', pl.length ? (L.planAuto !== false ? 'Used when you age up' : 'Manual') : 'Not set', ttP('Choose up to three focuses. Actions you have not spent are shared between them in turn when you press Spend, or automatically when you age up. Rank trials, quests, and story choices are always left to you.') + (pl.length ? ttRows(pl.map((id, i) => [`Focus ${i + 1}`, PLAN_OPT[id].name])) : '')); }
    case 'yearreview': return TT('The year in review', '', ttP('How much you grew between your last two birthdays, and the deeds you did along the way. Open the Journal to see your whole life charted.'));
    case 'vow': { const v = VOW[id]; if (!v) return ''; return TT(v.name, `+${Math.round(v.lp * 100)}% Legacy Points`, ttP(esc(v.desc)) + ttRows([['Lasts', 'This whole life'], ['Reward', `Legacy Points ×${(1 + v.lp).toFixed(2)} when it ends, plus the “A Vow Kept” achievement at 60`]])); }
    case 'compendium': { const c = discCounts(); return TT('World Compendium', `${discTotal()} of ${c.tot} discovered`, ttP('A record of every place, notable person, story, and event you have seen, kept across all your lives. Every ten new discoveries earn Legacy Points, starting at 15 and growing by 5 each time.')); }
    case 'wellness': return TT('Wellness', '', ttP('Healthy, low-stress years grant 1 to 3 extra actions next year. Resting, meditating, a good home, and avoiding injury all help.'));
    case 'power': {
      if (!L) return TT('Combat power', '', ttP('How dangerous you are in a fight. It decides quests, duels, and survival.'));
      const parts = [['Sword rank', bestSword(L) * 13], ['Attack magic rank', bestAttack(L) * 11], ['Battle Aura', L.aura.stage * 9], ['Strength and Agility', Math.round((L.st.str + L.st.agi) * .8)], ['Mana reserves', Math.round(Math.min(25, L.mana.cap / 400))], ['Party', Math.round(partyPower(L) * .4 * (1 + (M.party || 0)))]].filter(x => x[1]);
      return TT('Combat power', String(power(L)), ttP('How dangerous you are in a fight. It decides quests, duels, and survival.') + ttRows(parts.map(([k, v]) => [k, '+' + v])) + (L.age < 14 ? ttP('Children fight at reduced strength (×0.5 under 10, ×0.8 under 14).', 'tt-note') : ''));
    }
    case 'fame': return TT('Fame', L ? FAME_NAMES[fameTier(L.fame)] : '', ttP('What the world knows of you. Fame opens doors, attracts trouble, and is required for the highest rank trials.') + ttRows([['Tiers', 'Locally known 20 · Regional 60 · Royal attention 150 · International 400 · Living legend 1,000'], L ? ['Current', fmt(L.fame)] : null]));
    case 'lp': return TT('Legacy Points', fmt(META.lp), ttP('Your soul’s experience across lives. Earned from achievements, goals, story arcs, and the end of every life. Spend them in the Legacy Shop on perks for all future lives.'));
    case 'rwxp': return TT('Reward XP', '', ttP('Experience rewards flow into your strongest discipline. Before you have trained anything, they go to sword fundamentals or reading.'));
    case 'hp': return TT('Health', L ? `${Math.round(L.hp)} / ${maxHp(L)}` : '', ttP('At zero you die. Rest, healing magic, and time restore it. You regain a little every year.'));
    case 'stress': return TT('Stress', L ? String(Math.round(L.stress)) : '', ttP('Hard training, danger, and grief raise it. Above 85 it damages your health. Low stress grants extra actions.'));
    case 'funds': return TT('Family funds', L ? fmt(L.family.funds) + ' gold' : '', ttP('Your family’s savings. They pay for tutors and schooling until you turn 15, and part of them passes to you as inheritance.'));
    case 'reading': return TT('Reading', L ? String(Math.round(L.read)) : '', ttP('Literacy and scholarship. Reading unlocks magic study without a tutor, helps in exams, and opens scholarly careers.'));
    case 'guild': return TT('Guild ranks', L && L.guild.reg ? GUILD_RANKS[L.guild.rank] : '', ttP('Adventurer Guild ranks run F, E, D, C, B, A, S. Quests earn points; promotion also needs enough combat power.'));
    case 'potential': return TT('Potential grade', '', ttP('E, D, C, B, A, S, SS. A multiplier on every gain. Hidden until a tutor, test, or Demon Eye reveals it.'));
    case 'stage': return TT('Life stage', L ? lifeStage(L) : '', ttP('The chapters of a life: Infancy, Early Childhood, Childhood, Youth, Coming of Age, Adulthood, Middle Years, and Twilight Years. Long-lived races spend far longer in each adult chapter.'));
    case 'date': return TT('The Armored Dragon calendar', L ? 'Year ' + L.year : '', ttP('The Human World of the Six-Faced World counts its years by the Armored Dragon calendar. Each turn is one year of your life; your birth season stays with you.'));
  }
  return '';
}
