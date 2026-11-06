/* ===================== THE LONG LIFE: adulthood, elder years, centuries, and three late arcs =====================
   Adult age windows are measured in "life-equivalent" years (see evAge): a 300-year-old elf meets these
   the way a 50-year-old human would. Events marked with actual ages (L.age) are for the truly long-lived. */
const YEAR_HOOKS = [];
const longLived = (L) => (L.lifespan || 70) >= 150;
const closeDead = (L) => L.people.filter(p => !p.alive && (isFamily(p) || p.role === 'spouse' || p.op >= 50));
const kinOf = (L) => L.people.filter(p => p.alive && (isFamily(p) || p.role === 'spouse'));
const descOf = (L) => L.people.filter(p => p.alive && ['child', 'grandchild', 'descendant'].includes(p.role));
const bestKey = (L) => { let best = null, bv = 0; for (const m of MAGIC) { const v = L.magic[m.id] || 0; if (v > bv) { bv = v; best = m.id; } } for (const st of STYLES) { const v = L.sword[st.id] || 0; if (v > bv) { bv = v; best = st.id; } } return best; };
const skillLabel = (k) => !k ? 'your craft' : STYLE[k] ? STYLE[k].name : MAGIC_ID[k] ? MAGIC_ID[k].name + ' magic' : k;
const mkStudent = (L, o) => npc(L, Object.assign({ role: 'student', age: R.i(10, 16), op: R.i(30, 55), noRomance: true, met: L.age, race: R.pick([L.race, 'human', 'human', 'elf', 'beastfolk', 'dwarf', 'demonkin']) }, o || {}));
const yearsWord = (n) => n >= 100 ? `${fmt(n)} years` : n === 1 ? 'one year' : `${n} years`;

/* ---------- three late story arcs ---------- */
ARCEV({ id: 'arc_school_1', arc: 'school', ch: 1, title: 'The Empty Hall', ages: [24, 9999], icon: 'castle', cond: (L) => bestRankAll(L) >= 4 && L.age >= 24 && (L.gold >= 300 || L.fame >= 100),
  fire: (L) => { const k = bestKey(L); return card('The Empty Hall', `An old hall stands empty near the market in ${TOWN[L.town].name}: dust on the floor, light through high windows, room for forty students. People have started asking whether a ${RANKS[bestRankAll(L)]} of ${skillLabel(k)} would ever teach.`, [
    C('Buy the hall outright (800 gold)', 'buy', { disabled: L.gold < 800, hint: 'Needs 800 gold' }), C('Accept a noble patron’s money, and his favors', 'patron', { disabled: L.fame < 100, hint: 'Needs fame 100' }), C('Teach in the open square for free', 'square')], { k }); },
  resolve: (L, k, d) => { L.flags.school = { k: d.k || bestKey(L), at: L.age, students: 0, town: L.town, name: `the ${L.sur} School` }; adv(L, 'school', 1);
    if (k === 'buy') { money(L, -800); fame(L, 10); return `You sweep the floor yourself. By evening, a sign hangs over the door: ${L.flags.school.name}.`; }
    if (k === 'patron') { fame(L, 15); stress(L, 8); L.flags.school.patron = 1; return 'The patron pays for everything, including a statue of himself in the courtyard. You will be hearing from him.'; }
    grow(L, 'cha', .4); fame(L, 5); return 'You draw a circle in the dust of the square and start teaching whoever stops to watch. By the end of the week, a crowd stops.'; } });
ARCEV({ id: 'arc_school_2', arc: 'school', ch: 2, title: 'First Students', ages: [24, 9999], icon: 'hat', cond: (L) => !!L.flags.school,
  fire: (L) => card('First Students', 'Three hopefuls wait at your door on the first morning: a noble’s child with a purse of gold, a barefoot orphan who watched you through the window for a week, and a sullen apprentice another master threw out.', [C('Take the noble’s child', 'noble'), C('Take the orphan', 'orphan'), C('Take all three', 'all'), C('Take the apprentice nobody wanted', 'reject')]),
  resolve: (L, k) => { const s = L.flags.school || {}; const sk = s.k || bestKey(L); adv(L, 'school', 2);
    const make = (o) => { const p = mkStudent(L, Object.assign({ skill: sk ? { k: sk, r: 1 } : null }, o)); s.students = (s.students || 0) + 1; return p; };
    if (k === 'noble') { const p = make({ op: 35 }); money(L, 250); return `${p.name} arrives with a servant to carry the practice gear. The tuition is generous (+250 gold). The talent is… improvable.`; }
    if (k === 'orphan') { const p = make({ op: 60, tags: ['loyal', 'curious'] }); p.gift = 1; grow(L, 'cha', .3); return `${p.name} has never owned shoes. ${cap1(heShe(p))} learns faster than anyone you have ever taught, including yourself.`; }
    if (k === 'reject') { const p = make({ op: 20, tags: ['proud', 'hot-tempered'] }); p.gift = 1; return `${p.name} glares at you for a month. Then ${heShe(p)} stops glaring and starts beating every student in the hall.`; }
    make({ op: 35 }); make({ op: 55 }); make({ op: 25 }); money(L, 250); stress(L, 10); return 'Three students, three temperaments, one hall. The noise is incredible. So is the progress.'; } });
ARCEV({ id: 'arc_school_3', arc: 'school', ch: 3, title: 'The Rival School', ages: [24, 9999], icon: 'sword', cond: (L) => L.flags.school && L.age - (L.flags.school.at || 0) >= 3,
  fire: (L) => { const r = npc(L, { role: 'rival', age: Math.max(30, L.age + R.i(-5, 10)), op: -30, noRomance: true, tags: ['proud', 'stern'], job: 'Master of a rival school', skill: { k: (L.flags.school && L.flags.school.k) || 'sg', r: Math.max(3, bestRankAll(L)) } });
    return card('The Rival School', `${r.name} ${r.sur} has opened a school across the street and is stealing your students with cheaper tuition and louder promises. Today ${heShe(r)} stands at your gate: “One bout. The loser closes their doors.”`, [C('Accept the bout', 'duel'), C('Challenge them to a public debate instead', 'debate'), C('Propose a joint tournament for both schools', 'tourney')], { pid: r.id }); },
  resolve: (L, k, d) => { const r = person(L, d.pid); adv(L, 'school', 3);
    if (k === 'tourney') { if (r) { r.role = 'friend'; relGain(L, r, 45); } fame(L, 25); L.flags.school.students = (L.flags.school.students || 0) + 2; mkStudent(L); mkStudent(L); return 'The tournament fills the whole town for three days. Both schools grow. You and your rival end up drinking together and complaining about students.'; }
    if (k === 'debate') { const c = clamp(.35 + (L.st.int + L.st.cha - 20) * .02, .1, .9); if (R.chance(c)) { fame(L, 20); grow(L, 'cha', .5); if (r) relGain(L, r, -10); return 'You win the debate with a single question your rival cannot answer. Half the town enrolls by Friday.'; } stress(L, 10); return 'Your rival is a better talker than a swordsman. You lose a few students, and a little sleep.'; }
    const c = clamp(.35 + power(L) / 400 + (bestRankAll(L) - ((r && r.skill && r.skill.r) || 3)) * .12, .1, .92);
    if (R.chance(c)) { fame(L, 35); if (r) { relGain(L, r, 25); remember(r, L, 'Lost the bout that closed their school'); } const g = addSkillXp(L, (L.flags.school && L.flags.school.k) || evFightK(L), 120); return `It ends in one exchange. Your rival bows, closes the school, and asks, very quietly, if you need an assistant. (+${g} XP)`; }
    const dmg = hurt(L, R.i(10, 22), 'a duel between schools'); stress(L, 15); fame(L, -10); return `You lose (−${dmg} health). But you refuse to close your doors, and every one of your students stays. Your rival respects that more than the win.`; } });
ARCEV({ id: 'arc_school_4', arc: 'school', ch: 4, title: 'Your Name on the Gate', ages: [24, 9999], icon: 'crown', cond: (L) => L.flags.school && L.age - (L.flags.school.at || 0) >= 7,
  fire: (L) => { const st = L.people.find(p => p.role === 'student' && p.gift) || L.people.find(p => p.role === 'student');
    return card('Your Name on the Gate', `${st ? st.name + ', your first true student, returns as a master in ' + hisHer(st) + ' own right' : 'A former student returns as a master in their own right'}. The town carves your name over the gate of ${L.flags.school.name}. Students you have never met are teaching what you taught.`, [C('Keep teaching until your last day', 'keep'), C('Hand the school to your best student', 'hand')], { pid: st && st.id }); },
  resolve: (L, k, d) => { const st = person(L, d.pid); earn(L, 'school_master', 'The school you founded will outlive you.'); fame(L, 60);
    if (k === 'hand') { META.lp += 60; stress(L, -25); if (st) relGain(L, st, 30); finishArc(L, 'school', 'arc_school', '+60 Legacy Points.'); return 'You hand over the keys. That night, for the first time in years, you sleep past dawn.'; }
    L.flags.school.tuition = 1; finishArc(L, 'school', 'arc_school'); return 'You keep teaching. The tuition keeps the lights on, and the students keep you young.'; } });
YEAR_HOOKS.push((L, notes) => { const s = L.flags.school; if (!s || (L.arc.school || 0) < 2) return; const n = L.people.filter(p => p.alive && p.role === 'student').length + (s.students || 0) * .5; const g = Math.round((s.tuition ? 60 : 25) * Math.max(1, n) * (1 + pct(L, 'income'))); money(L, g); notes.push(`${cap1(s.name)} brings in ${fmt(g)} gold in tuition.`); });

ARCEV({ id: 'arc_long_1', arc: 'longroad', ch: 1, title: 'Those Who Grow Old', ages: [18, 9999], icon: 'hourglass', cond: (L) => L.age >= 100 || (longLived(L) && L.age >= 70 && L.people.some(p => p.alive && !isFamily(p) && p.age >= (RACE[p.race] || RACE.human).life[0] * .9)),
  fire: (L) => { let f = L.people.filter(p => p.alive && !isFamily(p) && p.role !== 'spouse' && p.op >= 20).sort((a, b) => b.age / (RACE[b.race] || RACE.human).life[0] - a.age / (RACE[a.race] || RACE.human).life[0])[0];
    if (!f) f = npc(L, { role: 'friend', race: 'human', age: Math.max(60, Math.min(90, L.age)), op: 55, met: Math.max(0, L.age - 60) });
    return card('Those Who Grow Old', `${f.name} was ${f.age < L.age ? 'younger than you' : 'your age'} when you met. Now ${heShe(f)} is ${f.age}, frail as paper, and asks for you by name. You ${L.age >= effLifespan(L) * .62 ? 'are old too, but you are still here' : 'look almost exactly as you did then'}.`, [C('Sit with them until the end', 'sit'), C('Promise to remember them', 'promise'), C('Try healing magic to buy them more time', 'heal', { disabled: rankOf(L, 'heal') < 3, hint: 'Needs Advanced healing' })], { pid: f.id }); },
  resolve: (L, k, d) => { const f = person(L, d.pid); adv(L, 'longroad', 1);
    if (k === 'heal' && f && R.chance(.6)) { f.age = Math.max(1, f.age - 6); relGain(L, f, 25); addSkillXp(L, 'heal', 90); return `Light pours from your hands into ${f.name}. ${cap1(heShe(f))} sits up, complains about the soup, and lives six more good years.`; }
    if (f) { f.alive = false; f.diedAt = L.age; }
    stress(L, Math.round(20 * (1 + pct(L, 'grief'))));
    if (k === 'promise') { META.lp += 15; return `You promise. ${f ? f.name : 'Your friend'} smiles and closes ${f ? hisHer(f) : 'their'} eyes. You write the name in the front of your journal, where you will see it every day. (+15 Legacy Points)`; }
    if (f) remember(f, L, 'You stayed until the end'); stress(L, -10); return `You hold ${f ? hisHer(f) : 'their'} hand through the night. Near dawn the breathing stops. It is the first of many goodbyes, and you will never get used to them.`; } });
ARCEV({ id: 'arc_long_2', arc: 'longroad', ch: 2, title: 'The Children of Your Children', ages: [18, 9999], icon: 'people', cond: (L) => L.age >= 115 || (L.age >= 90 && L.people.some(p => p.role === 'grandchild')),
  fire: (L) => { const d = npc(L, { role: 'descendant', sur: L.sur, race: R.chance(.6) ? L.race : 'human', age: R.i(12, 17), op: 40, met: L.age, noRomance: true, tags: ['curious', R.pick(['proud', 'shy', 'cheerful', 'witty'])] });
    return card('The Children of Your Children', `A young ${RACE[d.race].name.toLowerCase()} named ${d.name} ${d.sur} knocks on your door with a letter in a hand you almost recognize. ${cap1(heShe(d))} is your great-great-grandchild, give or take a generation, and ${heShe(d)} has walked a very long way to meet the legend from the family stories.`, [C('Teach them what you know', 'teach'), C('Tell them the true stories, not the legends', 'stories'), C('Give them a purse for the road (300 gold)', 'gold', { disabled: L.gold < 300, hint: 'Needs 300 gold' })], { pid: d.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); adv(L, 'longroad', 2);
    if (k === 'teach') { const bk = bestKey(L); if (p) { p.skill = bk ? { k: bk, r: 2 } : null; relGain(L, p, 30); } const g = bk ? addSkillXp(L, bk, 60) : 0; return `${p ? p.name : 'They'} is clumsy, stubborn, and talented: exactly like you were. (+${g} XP from teaching)`; }
    if (k === 'gold') { money(L, -300); if (p) relGain(L, p, 20); fame(L, 10); return 'The purse is heavier than they expected. So are the expectations. They promise to make the family name proud.'; }
    if (p) relGain(L, p, 35); META.lp += 20; stress(L, -15); return 'You tell them about the mistakes, the fear, the people you lost. They leave knowing you were a person, not a statue. (+20 Legacy Points)'; } });
ARCEV({ id: 'arc_long_3', arc: 'longroad', ch: 3, title: 'A World Remade', ages: [18, 9999], icon: 'globe', cond: (L) => L.age >= 150,
  fire: (L) => card('A World Remade', `Magic tools light the streets of ${TOWN[L.town].name} now. Wagons run on mana crystals. Kingdoms you remember are lines on old maps, and children laugh at the way you talk.`, [C('Learn the new ways', 'learn'), C('Keep the old ways alive', 'old'), C('Invest in the new workshops (1,000 gold)', 'invest', { disabled: L.gold < 1000, hint: 'Needs 1,000 gold' })]),
  resolve: (L, k) => { adv(L, 'longroad', 3);
    if (k === 'learn') { grow(L, 'int', 1); L.read = 100; L.craft = (L.craft || 0) + 200; return 'You enroll in a night class with students two centuries younger. The teacher keeps calling on you. You keep getting it right.'; }
    if (k === 'invest') { money(L, -1000); L.flags.workshops = 1; return 'You buy into three workshops. Within a year the dividends arrive, and keep arriving. (Workshops pay you every year.)'; }
    fame(L, 30); META.lp += 15; return 'You teach the old forms, the old songs, the old courtesies. A museum asks for your journals. (+15 Legacy Points)'; } });
YEAR_HOOKS.push((L, notes) => { if (!L.flags.workshops || L.age < 15) return; const g = Math.round(R.i(150, 260) * (1 + pct(L, 'income'))); money(L, g); notes.push(`Your workshops pay ${fmt(g)} gold.`); });
ARCEV({ id: 'arc_long_4', arc: 'longroad', ch: 4, title: 'The Weight of Years', ages: [18, 9999], icon: 'feather', cond: (L) => L.age >= 200,
  fire: (L) => card('The Weight of Years', `Two hundred years. You have outlived ${closeDead(L).length || 'more'} people you loved, ${L.visited.length} continent${L.visited.length === 1 ? '' : 's'} of friends, and at least one kingdom. One morning you wake up and the weight of it all is simply… lighter.`, [C('Make peace with time', 'peace'), C('Begin again: a new name, a new city', 'again')]),
  resolve: (L, k) => { earn(L, 'timeless_soul', 'Time no longer frightens you.');
    if (k === 'again') { const old = L.epithet; L.epithet = ''; L.fame = Math.round(L.fame * .2); const t = R.pick(TOWNS.filter(t => t.size >= 3 && t.id !== L.town)); L.town = t.id; if (!L.towns.includes(t.id)) L.towns.push(t.id); if (!L.visited.includes(t.cont)) L.visited.push(t.cont); grantXp(L, 300); META.lp += 50; finishArc(L, 'longroad', 'arc_longroad', '+50 Legacy Points.');
      return `You leave “${old || L.name}” behind and walk into ${t.name} as a stranger. Nobody knows you. It is wonderful.`; }
    stress(L, -40); finishArc(L, 'longroad', 'arc_longroad'); return 'You stop counting the years and start counting mornings. There are, it turns out, a great many of them left.'; } });

const laplaceDue = (L) => { const y = META.world.laplaceYear || 500; return L.year >= y && (!META.world.laplaceDone || META.world.laplaceDone.id === L.id); };
ARCEV({ id: 'arc_lw_1', arc: 'laplace_war', ch: 1, title: 'The Demon God Returns', ages: [16, 9999], icon: 'flame', cond: (L) => L.age >= 16 && laplaceDue(L),
  fire: (L) => card('The Demon God Returns', `The news comes on a ship from the Demon Continent and spreads faster than plague: Laplace has returned. Demon clans that hated each other a month ago are marching under one banner. ${L.earned.includes('orsted_subordinate') ? 'Orsted’s warning was right to the year.' : 'Old soldiers in the tavern go pale and stop drinking.'}`, [C('Pledge yourself to the alliance', 'pledge'), C('Move your family somewhere safe first', 'family'), C('Seek out the Dragon God', 'orsted', { disabled: !L.earned.includes('orsted_subordinate') && !L.earned.includes('dragon_mark'), hint: 'Needs the Dragon God’s favor' })]),
  resolve: (L, k) => { adv(L, 'laplace_war', 1); L.flags.lwAt = L.year;
    if (k === 'family') { money(L, -Math.min(L.gold, 300)); kinOf(L).forEach(p => relGain(L, p, 12)); stress(L, -5); return 'You move everyone inland, to a town too small to be worth burning. Then you turn back toward the coast.'; }
    if (k === 'orsted') { L.flags.lwOrsted = 1; grantXp(L, 400); return 'Orsted is waiting, as though he expected you. “Good. Then we begin.” His training is brutal, efficient, and eighty years in the making. (+400 XP)'; }
    fame(L, 30); return 'You sign your name in the alliance ledger beneath kings and beggars alike. Everyone signs the same way.'; } });
ARCEV({ id: 'arc_lw_2', arc: 'laplace_war', ch: 2, title: 'The Gathering of Armies', ages: [16, 9999], icon: 'flag', cond: (L) => laplaceDue(L),
  fire: (L) => card('The Gathering of Armies', 'Banners from every continent fill the plains: Asuran knights, Millis holy knights, beastfolk war bands, dwarven siege crews, adventurers of every rank. A herald asks what you bring to the war.', [C('Lead a company of your own', 'lead', { disabled: L.fame < 150, hint: 'Needs fame 150' }), C('Fight in the ranks', 'ranks'), C('Fund the war chest (2,000 gold)', 'fund', { disabled: L.gold < 2000, hint: 'Needs 2,000 gold' }), C('Run the field hospital', 'heal', { disabled: rankOf(L, 'heal') < 2, hint: 'Needs Intermediate healing' })]),
  resolve: (L, k) => { adv(L, 'laplace_war', 2);
    if (k === 'lead') { for (let i = 0; i < 2; i++) { const p = npc(L, { role: 'party', age: R.i(20, 40), op: R.i(40, 60), noRomance: true, met: L.age, skill: { k: R.pick(['sg', 'wg', 'ng', 'fire', 'earth', 'heal']), r: R.i(3, 5) } }); p.power = p.skill.r * 9; } fame(L, 40); L.flags.lwLead = 1; return 'Two hundred soldiers answer to your name. Two veterans become your lieutenants, and your friends.'; }
    if (k === 'fund') { money(L, -2000); fame(L, 50); L.flags.lwFund = 1; return 'Your gold buys armor for an entire legion. Someone paints your name on the supply wagons.'; }
    if (k === 'heal') { addSkillXp(L, 'heal', 200); fame(L, 30); L.flags.lwHeal = 1; return 'You heal until your hands shake and your mana is a dry well, then heal some more.'; }
    grantXp(L, 250); return 'You drill with strangers from five continents until you fight like one body. (+250 XP)'; } });
ARCEV({ id: 'arc_lw_3', arc: 'laplace_war', ch: 3, title: 'The Battle of the Red Sky', ages: [16, 9999], icon: 'bolt', cond: (L) => laplaceDue(L),
  fire: (L) => { const c = clamp(.25 + power(L) / 420 + (L.flags.lwOrsted ? .15 : 0) + (L.flags.lwLead ? .06 : 0) + (L.flags.lwFund ? .04 : 0), .08, .95);
    return card('The Battle of the Red Sky', `The sky over the battlefield turns the color of rust. Laplace stands at the center of his army, and the air around him bends. This is the day the old soldiers prayed would never come back.`, [C(`Strike for Laplace himself (${riskLabel(c)})`, 'strike'), C(`Hold the line (${riskLabel(Math.min(.97, c + .3))})`, 'hold'), C('Guard the healers’ tents', 'guard')], { c }); },
  resolve: (L, k, d) => { const c = d.c || .3; META.world.laplaceDone = { id: L.id, year: L.year, by: L.name + ' ' + L.sur }; adv(L, 'laplace_war', 3);
    if (k === 'strike') {
      if (R.chance(c)) { earn(L, 'laplace_bane', 'You struck the blow that broke the Demon God.'); unlock(L, 'laplace_slayer'); fame(L, 250); META.lp += 150; META.world.laplaceDone.slayer = L.name; return 'You reach him. For one heartbeat the Demon God looks surprised. Then the blow lands, and the red sky cracks open like an egg. Laplace falls. (+150 Legacy Points)'; }
      const dmg = hurt(L, R.i(35, 70), 'the Demon God’s hand'); if (L.hp <= 0 && R.chance(.5 + pct(L, 'deathSave'))) { L.hp = 1; L.deathCause = ''; }
      fame(L, 60); return `He swats you aside like a fly (−${dmg} health). But your charge opened a gap, and someone else drove a spear through it. The Demon God falls, not by your hand, but because of it.`; }
    if (k === 'guard') { L.people.filter(p => p.alive && p.role === 'party').forEach(p => relGain(L, p, 20)); addSkillXp(L, evFightK(L), 150); fame(L, 50); earn(L, 'war_veteran'); unlock(L, 'war_vet'); return 'Wave after wave reaches the tents. None get through. When the sky clears, a thousand wounded soldiers are alive because you stood there.'; }
    const ok = R.chance(Math.min(.97, c + .3)); if (!ok) hurt(L, R.i(15, 30), 'the battle of the Red Sky'); earn(L, 'war_veteran'); unlock(L, 'war_vet'); fame(L, 80); grantXp(L, 300);
    return ok ? 'The line holds. It bends twice, and breaks never. By sunset the Demon God’s army is in full retreat, and Laplace is sealed again.' : 'The line holds, barely, and you carry the scars of it. By sunset the Demon God is sealed again.'; } });
ARCEV({ id: 'arc_lw_4', arc: 'laplace_war', ch: 4, title: 'After the War', ages: [16, 9999], icon: 'sun', cond: (L) => META.world.laplaceDone && META.world.laplaceDone.id === L.id,
  fire: (L) => card('After the War', 'The war is over. Towns are ash, fields are salted, and every family has an empty chair. Someone has to decide what comes next.', [C('Rebuild the burned towns (1,000 gold)', 'build', { disabled: L.gold < 1000, hint: 'Needs 1,000 gold' }), C('Hunt down the last of his generals', 'hunt'), C('Go home and hold your family', 'home')]),
  resolve: (L, k) => { META.lp += 100;
    if (k === 'build') { money(L, -1000); fame(L, 60); finishArc(L, 'laplace_war', 'arc_laplace_war', '+100 Legacy Points.'); return 'Stone by stone, the towns come back. One of them names its new square after you.'; }
    if (k === 'hunt') { grantXp(L, 400); hurt(L, R.i(5, 15), 'a hunt for war criminals'); fame(L, 40); finishArc(L, 'laplace_war', 'arc_laplace_war', '+100 Legacy Points.'); return 'It takes two years and three continents. When it is done, nobody will be marching under that banner again.'; }
    kinOf(L).forEach(p => relGain(L, p, 20)); stress(L, -40); finishArc(L, 'laplace_war', 'arc_laplace_war', '+100 Legacy Points.'); return 'You walk through your own front door, and everyone you love is there, and for a long time nobody says anything at all.'; } });

/* ---------- centuries: milestones for those who live a very long time ---------- */
const CENTURY_TEXT = {
  100: 'One hundred years. The village you were born in has changed its name twice. You remember both.',
  150: 'A century and a half. Your earliest friends are names on stones, and their grandchildren call you by a title instead of your name.',
  200: 'Two hundred years. You have seen four kings crowned in Asura and at least three wars nobody remembers but you.',
  300: 'Three centuries. Scholars come to ask you what really happened in battles they study from books.',
  400: 'Four hundred years. You have started to forget faces, and you keep a book of them so that you will not forget anyone else.',
  500: 'Five centuries. Mountains have not changed, but the rivers have moved, and so have you.',
  750: 'Seven hundred and fifty years. The Superd remember you. The dragons remember you. Almost nobody else does, and that is a kind of freedom.',
  1000: 'A thousand years. You are older than most kingdoms and some languages. The world is still, somehow, full of surprises.',
};
for (const c of [100, 150, 200, 300, 400, 500, 750, 1000]) {
  EV({ id: 'century_' + c, title: c >= 1000 ? 'A Thousand Years' : c === 150 ? 'A Century and a Half' : `${fmt(c)} Years`, kind: 'Milestone', milestone: true, ages: [c, c], w: 0, icon: 'hourglass', cond: (L) => L.age === c,
    fire: (L) => card(c >= 1000 ? 'A Thousand Years' : c === 150 ? 'A Century and a Half' : `${fmt(c)} Years`, CENTURY_TEXT[c] + ' How do you mark the day?', [C('Look back over everything', 'back'), C('Look ahead and set a new goal', 'ahead'), C('Gather everyone who is still here', 'gather')]),
    resolve: (L, k) => { if (c === 200) unlock(L, 'bicentennial'); if (c === 500) unlock(L, 'five_centuries');
      const lp = Math.round(c / 5);
      if (k === 'back') { META.lp += lp; stress(L, -20); return `You read your old journals from the first page to the last. You laugh more than you expected to. (+${lp} Legacy Points)`; }
      if (k === 'ahead') { const xk = grantXp(L, c * 2); return `You pick something you have never mastered and start from the beginning, like a child again. (+${c * 2} ${xk} XP)`; }
      const kin = L.people.filter(p => p.alive && (isFamily(p) || p.role === 'spouse' || p.op >= 40)); kin.forEach(p => relGain(L, p, 12)); stress(L, -25);
      return kin.length ? `${kin.length} people crowd into your home for the celebration. Most of them were not born the last time you threw a party.` : 'Nobody is left to invite, so you invite the whole street. They come.'; } });
}

/* ---------- adulthood ---------- */
EV({ id: 'house_fire', title: 'Smoke in the Night', kind: 'Danger', ages: [18, 9999], w: .7, once: false, cd: 18, icon: 'flame',
  fire: (L) => card('Smoke in the Night', 'You wake to smoke and the roar of fire downstairs. The house is burning.', [C('Drown it with water magic', 'water', { disabled: rankOf(L, 'water') < 2, hint: 'Needs Intermediate water magic' }), C('Get everyone out', 'out'), C('Grab the strongbox first', 'gold')]),
  resolve: (L, k) => { const kin = kinOf(L);
    if (k === 'water') { const g = addSkillXp(L, 'water', 50); fame(L, 6); return `You call down a deluge that soaks the house, the neighbors, and three passing dogs. The fire dies instantly. (+${g} XP)`; }
    if (k === 'gold') { const d = hurt(L, R.i(8, 18), 'a house fire'); kin.forEach(p => relGain(L, p, -6)); stress(L, 10); return `You save the gold and singe your eyebrows off (−${d} health). Your family notices what you went back for.`; }
    const d = hurt(L, R.i(4, 10), 'a house fire'); const loss = Math.round(L.gold * .2); money(L, -loss); kin.forEach(p => relGain(L, p, 10)); return `Everyone gets out (−${d} health). Rebuilding costs ${fmt(loss)} gold, and nobody cares, because everyone got out.`; } });
EV({ id: 'tax_collector', title: 'The Tax Collector', kind: 'Hardship', ages: [18, 9999], w: .8, once: false, cd: 6, icon: 'coin', cond: (L) => L.gold >= 1000,
  fire: (L) => card('The Tax Collector', `A thin man with a ledger and four guards arrives. The lord of ${TOWN[L.town].realm} has discovered, rather suddenly, that you owe him a great deal of money.`, [C(`Pay what he asks (${fmt(Math.round(L.gold * .12))} gold)`, 'pay'), C('Offer a smaller bribe', 'bribe'), C('Ask to see the law that says so', 'law')]),
  resolve: (L, k) => {
    if (k === 'pay') { money(L, -Math.round(L.gold * .12)); return 'You pay. The ledger closes with a satisfied snap.'; }
    if (k === 'bribe') { if (R.chance(.6)) { money(L, -Math.round(L.gold * .05)); return 'He pockets the coins and remembers another appointment.'; } money(L, -Math.round(L.gold * .2)); fame(L, -5); return 'He was an honest tax collector, which is rarer than a dragon. You pay double.'; }
    if (R.chance(clamp(.25 + L.st.int * .02 + L.st.cha * .01, .1, .85))) { grow(L, 'int', .4); fame(L, 4); return 'There is no such law. You know it, he knows it, and now the guards know it. He leaves with nothing.'; } money(L, -Math.round(L.gold * .15)); stress(L, 8); return 'There is such a law. It was passed last week. You pay, with interest.'; } });
EV({ id: 'wandering_duelist', title: 'A Challenger at the Gate', kind: 'Confrontation', ages: [16, 9999], w: 1, once: false, cd: 4, icon: 'sword', cond: (L) => bestSword(L) >= 2,
  fire: (L) => { const r = R.i(Math.max(1, bestSword(L) - 1), Math.min(7, bestSword(L) + 1)); return card('A Challenger at the Gate', `A wandering swordsman with a notched blade has heard your name. “I have beaten every ${RANKS[r]} from here to the sea. You are next.”`, [C('Accept the duel', 'duel'), C('Accept, but only with wooden swords', 'wood'), C('Decline with a bow', 'no')], { r }); },
  resolve: (L, k, d) => { const c = clamp(.5 + (bestSword(L) - d.r) * .18 + power(L) / 900, .08, .94); const sk = L.sword.primary || 'sg';
    if (k === 'no') { fame(L, -2); return 'He spits on the ground and leaves. Children imitate the spit for a week.'; }
    if (R.chance(c)) { const g = addSkillXp(L, sk, k === 'wood' ? 40 : 70); fame(L, k === 'wood' ? 4 : 10); return `You disarm him in four moves. He laughs, bows, and asks where to find a good inn. (+${g} XP)`; }
    const dm = hurt(L, k === 'wood' ? R.i(2, 6) : R.i(8, 18), 'a duel'); const g = addSkillXp(L, sk, 35); return `He is better than he looked (−${dm} health). You learn something from every bruise. (+${g} XP)`; } });
EV({ id: 'apprentice_plea', title: 'The Would-Be Apprentice', kind: 'Encounter', ages: [22, 9999], w: .9, once: false, cd: 6, icon: 'hat', cond: (L) => bestRankAll(L) >= 3 && L.people.filter(p => p.alive && p.role === 'student').length < 5,
  fire: (L) => card('The Would-Be Apprentice', `A teenager has been following you around ${TOWN[L.town].name} for three days, copying your stance badly. Today they finally ask: “Will you teach me?”`, [C('Take them on', 'yes'), C('Give them one lesson and a book', 'once'), C('Send them home to their parents', 'no')]),
  resolve: (L, k) => { const bk = bestKey(L);
    if (k === 'yes') { const p = mkStudent(L, { skill: bk ? { k: bk, r: 1 } : null }); const g = bk ? addSkillXp(L, bk, 30, true) : 0; return `${p.name} becomes your student. Teaching the basics again shows you three things you had forgotten. (+${g} XP)`; }
    if (k === 'once') { grow(L, 'cha', .2); return 'One lesson, one book, and a firm handshake. Years later, a stranger thanks you for both.'; }
    return 'You send them home. They come back the next day. And the next. Eventually, you stop counting.'; } });
EV({ id: 'dragon_sighting', title: 'Red Wings over the Pass', kind: 'Danger', ages: [15, 9999], w: .6, once: false, cd: 12, icon: 'flame', cond: (L) => L.age >= 15,
  fire: (L) => { const c = clamp(1 / (1 + Math.exp(-(power(L) - 160) / 20)), .03, .9); return card('Red Wings over the Pass', 'A Red Dragon circles the mountain pass above town: one of the beasts that make the Red Dragon Mountains impassable. It lands on the ridge to sun itself.', [C('Warn the town and evacuate the pass', 'warn'), C(`Hunt it (${riskLabel(c)})`, 'hunt'), C('Hide and watch', 'watch')], { c }); },
  resolve: (L, k, d) => {
    if (k === 'warn') { fame(L, 8); grow(L, 'cha', .3); return 'Nobody dies. That is the whole story, and it is a good one.'; }
    if (k === 'watch') { grow(L, 'int', .3); stress(L, -4); return 'For an hour you watch the most dangerous creature in the world nap in the sun. It is magnificent.'; }
    if (R.chance(d.c)) { const g = Math.round(R.i(1200, 2400) * (1 + pct(L, 'loot'))); money(L, g); fame(L, 60); grantXp(L, 300); return `The battle shakes the mountain. When the dust settles, the dragon is dead and its scales are worth ${fmt(g)} gold. Bards start writing immediately.`; }
    const dm = hurt(L, R.i(30, 60), 'a Red Dragon'); fame(L, 5); return `Its tail hits like a falling tower (−${dm} health). You are lucky to crawl away alive.`; } });
EV({ id: 'lean_year', title: 'The Lean Year', kind: 'Hardship', ages: [10, 9999], w: .6, once: false, cd: 12, icon: 'leaf',
  fire: (L) => card('The Lean Year', `The harvest fails across ${CONT[TOWN[L.town].cont].name}. Bread doubles in price, then doubles again.`, [C(`Share what you have (${fmt(Math.min(L.gold, 200))} gold)`, 'share', { disabled: L.gold < 50, hint: 'Needs 50 gold' }), C('Organize the town’s relief', 'org', { disabled: L.age < 15, hint: 'From age 15' }), C('Tighten your belt and wait', 'wait')]),
  resolve: (L, k) => {
    if (k === 'share') { money(L, -Math.min(L.gold, 200)); fame(L, 10); L.people.filter(p => p.alive && p.op >= 0).forEach(p => relGain(L, p, 4)); return 'Your gold buys grain for forty families. Nobody in your street goes hungry.'; }
    if (k === 'org') { const ok = R.chance(clamp(.3 + L.st.cha * .03, .1, .9)); grow(L, 'cha', .5); fame(L, ok ? 15 : 4); stress(L, 8); return ok ? 'You set up kitchens, ration lines, and a grain route from the next province. People still talk about the winter you kept everyone alive.' : 'You do what you can. It is not enough, but it is far better than nothing.'; }
    stress(L, 12); const d = hurt(L, R.i(2, 6), 'a lean year'); return `You eat less and worry more (−${d} health). Spring takes a long time to come.`; } });
EV({ id: 'coup_capital', title: 'Banners Change Overnight', kind: 'Intrigue', ages: [18, 9999], w: .5, once: false, cd: 20, icon: 'castle', cond: (L) => TOWN[L.town].size >= 3,
  fire: (L) => card('Banners Change Overnight', `You wake to new banners on the walls of ${TOWN[L.town].name}. A regent has seized the palace in the night, and soldiers are asking everyone the same question: who are you loyal to?`, [C('Swear to the new regent', 'regent'), C('Help the old court escape', 'old'), C('Keep your head down', 'down')]),
  resolve: (L, k) => {
    if (k === 'regent') { money(L, 200); fame(L, 5); stress(L, 6); return 'The regent rewards early loyalty with gold and a title nobody respects. You sleep badly.'; }
    if (k === 'old') { const c = clamp(.35 + power(L) / 300, .15, .9); if (R.chance(c)) { fame(L, 30); grantXp(L, 120); return 'You smuggle three ministers and a crying prince out through the sewers. Within a year the old court returns, and remembers who helped.'; } const d = hurt(L, R.i(10, 25), 'a palace coup'); stress(L, 15); return `The guards catch you at the river gate (−${d} health). You escape. The ministers do not.`; }
    stress(L, 4); return 'You keep your head down. In six months the banners change back, and nobody asks anybody anything.'; } });
EV({ id: 'festival_judge', title: 'The Festival Judge', kind: 'Festival', ages: [22, 9999], w: .9, once: false, cd: 5, icon: 'star', cond: (L) => L.fame >= 30,
  fire: (L) => card('The Festival Judge', `${TOWN[L.town].name} asks you to judge the harvest festival’s great contest: the biggest pumpkin, the fastest horse, and the most beautiful song. The mayor’s nephew is in all three.`, [C('Judge honestly', 'fair'), C('Let the mayor’s nephew win', 'nephew'), C('Make it a comedy roast instead', 'roast')]),
  resolve: (L, k) => {
    if (k === 'fair') { fame(L, 6); stress(L, 3); return 'The nephew loses all three. The mayor stops speaking to you. Everyone else buys you a drink.'; }
    if (k === 'nephew') { money(L, 120); fame(L, -4); return 'The nephew wins all three, including the horse race, on foot. A purse of gold appears in your coat.'; }
    grow(L, 'cha', .5); stress(L, -8); fame(L, 4); return 'You roast every contestant, the mayor, and yourself. The town laughs until midnight.'; } });
EV({ id: 'cursed_ring', title: 'The Ring That Would Not Come Off', kind: 'Discovery', ages: [14, 9999], w: .7, icon: 'ring',
  fire: (L) => card('The Ring That Would Not Come Off', 'A black ring sits in the dirt of an old battlefield, warm to the touch. You slip it on before you think. It will not come off.', [C('Cleanse it with detox magic', 'detox', { disabled: rankOf(L, 'detox') < 2, hint: 'Needs Intermediate detox magic' }), C('Learn to live with it', 'keep'), C('Pay a priest to remove it (200 gold)', 'priest', { disabled: L.gold < 200, hint: 'Needs 200 gold' })]),
  resolve: (L, k) => {
    if (k === 'detox') { const g = addSkillXp(L, 'detox', 60); L.st.luck += 2; return `The curse unravels like smoke and the ring turns silver. It is lucky now, strangely. (+2 Luck, +${g} XP)`; }
    if (k === 'priest') { money(L, -200); return 'The priest chants for an hour and the ring slides off with a sound like a sigh.'; }
    L.st.luck = Math.max(0, L.st.luck - 1); L.mana.cap += Math.round(60 * L.mana.pot); return 'The ring whispers to your mana at night. You get a little stronger and a little unluckier. (−1 Luck, more mana)'; } });
EV({ id: 'wrecked_caravan', title: 'A Wrecked Caravan', kind: 'Discovery', ages: [14, 9999], w: .9, once: false, cd: 6, icon: 'map',
  fire: (L) => card('A Wrecked Caravan', 'On the road you find a merchant caravan overturned: wagons burned, horses gone, and a strongbox half-buried in the mud. The bandits’ tracks lead into the hills.', [C('Return the strongbox to the merchant guild', 'return'), C('Keep it', 'keep'), C('Track the bandits', 'track', { disabled: L.age < 15, hint: 'From age 15' })]),
  resolve: (L, k) => {
    if (k === 'return') { fame(L, 8); money(L, 60); return 'The guild pays a finder’s fee and remembers your face. Merchants start giving you discounts.'; }
    if (k === 'keep') { const g = Math.round(R.i(120, 300) * (1 + pct(L, 'loot'))); money(L, g); stress(L, 4); return `${fmt(g)} gold. You do not sleep especially well.`; }
    const c = clamp(.4 + power(L) / 250, .15, .92); if (R.chance(c)) { const g = Math.round(R.i(200, 450) * (1 + pct(L, 'loot'))); money(L, g); fame(L, 12); addSkillXp(L, evFightK(L), 60); return `You find the camp at dusk. By midnight the bandits are tied up and you are ${fmt(g)} gold richer from the bounty.`; }
    const d = hurt(L, R.i(10, 22), 'bandits'); return `There are more of them than the tracks suggested (−${d} health). You get away. The strongbox does not.`; } });
EV({ id: 'village_fever', title: 'Fever in the Next Village', kind: 'Hardship', ages: [14, 9999], w: .8, once: false, cd: 7, icon: 'drop', cond: (L) => rankOf(L, 'heal') >= 1 || rankOf(L, 'detox') >= 1,
  fire: (L) => card('Fever in the Next Village', 'A rider gallops in at dawn: a fever is spreading through the next village and their healer died yesterday.', [C('Ride there now', 'go'), C('Send medicine and instructions', 'send'), C('Stay away. It could spread here.', 'stay')]),
  resolve: (L, k) => { const hk = rankOf(L, 'heal') >= rankOf(L, 'detox') ? 'heal' : 'detox';
    if (k === 'go') { const g = addSkillXp(L, hk, 90); fame(L, 15); if (R.chance(.25 - pct(L, 'sick') * .2)) { const d = hurt(L, R.i(6, 14), 'a village fever'); return `You save thirty-one people and catch the fever yourself (−${d} health, +${g} XP). It was worth it.`; } return `You work for nine days without sleeping properly. Thirty-one people live who would not have. (+${g} XP)`; }
    if (k === 'send') { money(L, -40); fame(L, 5); addSkillXp(L, hk, 30); return 'Your instructions are clear and your medicine is good. The fever breaks in a week.'; }
    stress(L, 10); return 'You stay away. The fever burns out on its own, taking eleven people with it. You think about that number for a long time.'; } });
EV({ id: 'strange_machine', title: 'A Strange Machine', kind: 'Opportunity', ages: [18, 9999], w: .7, icon: 'gear', cond: (L) => L.read >= 40 && L.gold >= 300,
  fire: (L) => card('A Strange Machine', 'A wild-haired inventor corners you at the inn. She has built a machine that pumps water with mana crystals instead of muscle, and she needs an investor.', [C('Invest 300 gold', 'inv'), C('Invest 1,000 gold', 'big', { disabled: L.gold < 1000, hint: 'Needs 1,000 gold' }), C('Wish her luck', 'no')]),
  resolve: (L, k) => { if (k === 'no') return 'She finds another investor. You hear about her again, years later.'; const amt = k === 'big' ? 1000 : 300; money(L, -amt); L.flags.invention = { amt, at: L.age }; return 'You shake on it. She is already sketching improvements on a napkin before you let go of her hand.'; } });
EV({ id: 'invention_pays', title: 'The Machine Works', kind: 'Opportunity', ages: [18, 9999], w: 3, icon: 'coin', cond: (L) => L.flags.invention && L.age - L.flags.invention.at >= 3,
  fire: (L) => { const inv = L.flags.invention; L.flags.invention = 0; if (R.chance(.65)) { const g = Math.round(inv.amt * R.i(3, 6) * (1 + pct(L, 'income'))); money(L, g); return `The inventor’s pumps are in every town from here to the coast. Your share arrives in a locked chest: ${fmt(g)} gold.`; } stress(L, 6); return 'The prototype exploded. So did the second one. The inventor sends a very apologetic letter and a small, singed cog as a keepsake.'; } });
EV({ id: 'old_teacher', title: 'Your Old Teacher', kind: 'Reunion', ages: [22, 9999], w: .9, icon: 'book', cond: (L) => L.people.some(p => p.alive && (p.role === 'mentor' || p.tutor || p.wasTutor || p.name === 'Roxy' || p.name === 'Ghislaine') && L.age - (p.met || 0) >= 10),
  fire: (L) => { const p = L.people.find(p => p.alive && (p.role === 'mentor' || p.tutor || p.wasTutor || p.name === 'Roxy' || p.name === 'Ghislaine') && L.age - (p.met || 0) >= 10);
    return card('Your Old Teacher', `${p.name} turns up at your door, older now${(RACE[p.race] || RACE.human).life[0] > 150 ? ', though somehow not by much' : ''}, and asks to see what you have become.`, [C('Show them everything you can do', 'show'), C('Ask for one more lesson', 'lesson'), C('Thank them, properly, at last', 'thanks')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); if (!p) return 'They have already gone.';
    if (k === 'show') { relGain(L, p, 15); fame(L, 4); return `${p.name} watches in silence, then says, “You surpassed me years ago, didn’t you.” It is not a question. ${cap1(heShe(p))} looks proud enough to burst.`; }
    if (k === 'lesson') { const g = grantXp(L, 150); relGain(L, p, 10); return `Even now, ${heShe(p)} finds three things you are doing wrong. (+150 ${g} XP)`; }
    relGain(L, p, 30); stress(L, -12); remember(p, L, 'Thanked properly, years later'); return `You tell ${himHer(p)} exactly what ${hisHer(p)} lessons meant. ${p.name} pretends there is something in ${hisHer(p)} eye.`; } });
EV({ id: 'child_wedding', title: 'A Wedding in the Family', kind: 'Family', ages: [34, 9999], w: 1.4, once: false, cd: 3, icon: 'ring', cond: (L) => L.people.some(p => p.alive && p.role === 'child' && p.age >= 20 && !p.married),
  fire: (L) => { const c = R.pick(L.people.filter(p => p.alive && p.role === 'child' && p.age >= 20 && !p.married)); c.married = true;
    return card('A Wedding in the Family', `${c.name} is getting married, to someone ${heShe(c)} met ${R.pick(['at the guild hall', 'at the university', 'on a merchant ship', 'in a duel, of all places', 'at a festival'])}. The whole family is arriving, and everyone is looking at you for the toast.`, [C('Give a generous gift (400 gold)', 'gift', { disabled: L.gold < 400, hint: 'Needs 400 gold' }), C('Give a heartfelt toast', 'toast'), C('Pass on a family heirloom', 'heir')], { pid: c.id }); },
  resolve: (L, k, d) => { const c = person(L, d.pid); if (!c) return 'The wedding goes on without a hitch.';
    if (k === 'gift') { money(L, -400); relGain(L, c, 20); return `The gift buys ${c.name} a house with a garden. ${cap1(heShe(c))} cries. So do you, a bit.`; }
    if (k === 'heir') { relGain(L, c, 25); remember(c, L, 'Received the family heirloom at the wedding'); return `You press the old family token into ${c.name}’s hands. It has been handed down for generations, and now it is ${hisHer(c)} turn.`; }
    const ok = R.chance(clamp(.3 + L.st.cha * .04, .15, .95)); relGain(L, c, ok ? 18 : 8); grow(L, 'cha', .3); return ok ? 'Your toast is short, funny, and devastating. There is not a dry eye in the house.' : 'Your toast runs long and includes one story that should not have been told. Everyone forgives you by dessert.'; } });
EV({ id: 'teen_storm', title: 'Slammed Doors', kind: 'Family', ages: [28, 9999], w: 1.1, once: false, cd: 4, icon: 'bolt', cond: (L) => evKids(L, 13, 17).length > 0,
  fire: (L) => { const c = R.pick(evKids(L, 13, 17)); return card('Slammed Doors', `${c.name} has decided you are the most embarrassing person alive. There is shouting, a slammed door, and a note that says “I’m going to be NOTHING like you.”`, [C('Wait it out with patience', 'wait'), C('Set firm rules', 'rules'), C('Tell them about your own worst year', 'story')], { pid: c.id }); },
  resolve: (L, k, d) => { const c = person(L, d.pid); if (!c) return 'The storm passes.';
    if (k === 'rules') { relGain(L, c, -8); stress(L, 4); return `${c.name} follows the rules, mostly, and sulks magnificently. It passes. Eventually.`; }
    if (k === 'story') { relGain(L, c, 20); stress(L, -4); remember(c, L, 'Heard about your worst year'); return `${c.name} stares at you like you have grown a second head. “You did WHAT?” The door stays open after that.`; }
    relGain(L, c, 6); stress(L, -2); return `You wait. Three days later ${c.name} sits next to you at dinner as if nothing happened. You let ${himHer(c)}.`; } });
EV({ id: 'spouse_dream', title: 'What Your Spouse Wants', kind: 'Family', ages: [24, 9999], w: 1, once: false, cd: 7, icon: 'heart', cond: (L) => { const s = L.spouse && person(L, L.spouse); return s && s.alive; },
  fire: (L) => { const s = person(L, L.spouse); const dream = R.pick(['open a bakery', 'sail to the Heaven Continent', 'write a book', 'study at Ranoa', 'open a tavern for adventurers', 'learn the sword']);
    return card('What Your Spouse Wants', `Over breakfast, ${s.name} admits ${heShe(s)} has always wanted to ${dream}. ${cap1(heShe(s))} has never asked you for anything this big.`, [C('Throw everything behind it (500 gold)', 'all', { disabled: L.gold < 500, hint: 'Needs 500 gold' }), C('Find a way to make it work', 'mid'), C('Say it is not the right time', 'no')], { pid: s.id, dream }); },
  resolve: (L, k, d) => { const s = person(L, d.pid); if (!s) return '';
    if (k === 'all') { money(L, -500); relGain(L, s, 30); stress(L, -8); return `${s.name} gets to ${d.dream}. You have never seen ${himHer(s)} so happy, and it turns out to be contagious.`; }
    if (k === 'mid') { relGain(L, s, 15); stress(L, 5); return 'It takes compromise, late nights, and a few arguments. It works.'; }
    relGain(L, s, -18); return `${s.name} nods and changes the subject. The silence at dinner lasts longer than the argument would have.`; } });
EV({ id: 'grey_hair', title: 'A Grey Hair', kind: 'Reflection', ages: [34, 50], w: 1, icon: 'feather', cond: (L) => !mods(L).ageless,
  fire: (L) => card('A Grey Hair', 'The mirror shows a single grey hair, silver and unrepentant.', [C('Pluck it', 'pluck'), C('Leave it. You earned it.', 'keep'), C('Buy an alchemist’s dye (40 gold)', 'dye', { disabled: L.gold < 40, hint: 'Needs 40 gold' })]),
  resolve: (L, k) => { if (k === 'pluck') return 'You pluck it. Two more grow back in sympathy.'; if (k === 'dye') { money(L, -40); L.st.looks += .5; return 'The dye works perfectly, apart from the week your hair was faintly green.'; } stress(L, -6); grow(L, 'cha', .2); return 'You leave it. Then you leave the next one. It suits you.'; } });
EV({ id: 'road_behind', title: 'The Road Behind You', kind: 'Reflection', ages: [36, 55], w: 1.1, icon: 'map',
  fire: (L) => card('The Road Behind You', 'Somewhere around the middle of your life, you wake up and wonder whether you chose the right road.', [C('Start something completely new', 'new'), C('Double down on what you do best', 'double'), C('Buy something wildly extravagant', 'buy', { disabled: L.gold < 300, hint: 'Needs 300 gold' })]),
  resolve: (L, k) => {
    if (k === 'new') { const opts = [...MAGIC.map(m => m.id).filter(id => !magicBlock(L, id) && rankOf(L, id) === 0), ...(L.sword.styleChosen ? STYLES.map(s => s.id).filter(id => rankOf(L, id) === 0) : [])]; const pk = opts.length ? R.pick(opts) : bestElement(L); const g = addSkillXp(L, pk, 80); stress(L, -10); return `You start ${skillLabel(pk)} from nothing, clumsy as a child. It is the most fun you have had in years. (+${g} XP)`; }
    if (k === 'double') { const bk = bestKey(L); const g = bk ? addSkillXp(L, bk, 120) : 0; return `You go back to the basics of ${skillLabel(bk)} and find depths you missed the first time. (+${g} XP)`; }
    money(L, -300); stress(L, -20); return R.pick(['You buy a racing land-dragon. You never race it. It sleeps on your porch and you love it.', 'You buy a ridiculous hat from the Millis capital. It is the best hat in the world.', 'You commission a ship model so large it needs its own room.']); } });
EV({ id: 'slower_now', title: 'Slower Than You Were', kind: 'Reflection', ages: [45, 65], w: 1, icon: 'hourglass', cond: (L) => bestSword(L) >= 2 && !mods(L).ageless,
  fire: (L) => card('Slower Than You Were', 'A younger swordsman beats you in sparring for the first time. Not by skill. By speed you no longer have.', [C('Change your style: efficiency over speed', 'adapt'), C('Train harder than ever', 'push'), C('Become a teacher', 'teach')]),
  resolve: (L, k) => {
    if (k === 'adapt') { const g = addSkillXp(L, 'wg', 80); L.aura.ctrl = clamp(L.aura.ctrl + 8, 0, 100); return `You stop fighting their fight and start fighting yours. Counterattacks, economy, patience. (+${g} Water God Style XP, +8 aura control)`; }
    if (k === 'push') { if (R.chance(.4)) { L.injuries.push('a stiff back'); return 'You push too hard and wrench your back. It never quite forgives you.'; } grow(L, 'agi', .6); return 'You claw back half a step of speed. It costs you a summer of pain. It is worth it.'; }
    mkStudent(L, { skill: { k: L.sword.primary || 'sg', r: 1 } }); fame(L, 4); return 'You take on a student. Watching someone else get faster is a strange, wonderful kind of victory.'; } });
EV({ id: 'old_wound', title: 'An Old Wound Aches', kind: 'Hardship', ages: [35, 9999], w: 1, once: false, cd: 8, icon: 'heart', cond: (L) => L.injuries.length > 0,
  fire: (L) => card('An Old Wound Aches', `Cold weather wakes ${L.injuries[0]}. Some days it is all you can think about.`, [C('Rest it properly this winter', 'rest'), C('See a Millis healer (250 gold)', 'heal', { disabled: L.gold < 250, hint: 'Needs 250 gold' }), C('Ignore it', 'ignore')]),
  resolve: (L, k) => {
    if (k === 'heal') { money(L, -250); if (R.chance(.6)) { const i = L.injuries.shift(); return `The healer works on ${i} for three days. When she is done, it is simply gone.`; } return 'The healer helps the pain but cannot undo the damage. It is something.'; }
    if (k === 'rest') { heal(L, 15); stress(L, -8); L.ap = Math.max(0, L.ap - 1); return 'You rest, wrapped in blankets with a pile of books. It helps more than you expected. (−1 action this year)'; }
    stress(L, 8); hurt(L, 4, 'an old wound'); return 'You grit your teeth through the winter. The wound does not care how stubborn you are.'; } });
EV({ id: 'memoirs', title: 'Ink and Memory', kind: 'Legacy', ages: [42, 9999], w: 1, icon: 'quill', cond: (L) => !L.flags.memoir && (L.fame >= 40 || bestRankAll(L) >= 3),
  fire: (L) => card('Ink and Memory', 'A printer in Sharia offers to publish your memoirs. You sit down with a stack of paper and a lifetime of stories.', [C('Write the honest version', 'honest'), C('Write the heroic version', 'hero'), C('Write it, but never publish it', 'private')]),
  resolve: (L, k) => { L.flags.memoir = 1;
    if (k === 'honest') { META.lp += 30; fame(L, 15); return 'The honest version sells badly at first, then for a hundred years. Scholars quote it. (+30 Legacy Points)'; }
    if (k === 'hero') { fame(L, 40); stress(L, 4); return 'The heroic version is a bestseller. You win battles you lost and duels you avoided. Your old friends write angry letters.'; }
    stress(L, -20); META.lp += 15; return 'You write it all down, every mistake and every kindness, and lock it in a drawer for your family to find. (+15 Legacy Points)'; } });
EV({ id: 'portrait', title: 'A Portrait for the Hall', kind: 'Legacy', ages: [36, 9999], w: .7, icon: 'user', cond: (L) => L.gold >= 600 && !L.flags.portrait,
  fire: (L) => card('A Portrait for the Hall', 'A famous painter from Ars is passing through. For 400 gold, she will paint you, and for 400 gold she will paint you honestly.', [C('Commission the honest portrait', 'honest'), C('Ask her to make you look heroic', 'hero'), C('Ask her to paint your family instead', 'family')]),
  resolve: (L, k) => { L.flags.portrait = 1; money(L, -400); META.lp += 15;
    if (k === 'family') { kinOf(L).forEach(p => relGain(L, p, 10)); return 'The painting of everyone together hangs over the fireplace for generations. (+15 Legacy Points)'; }
    if (k === 'hero') { fame(L, 10); return 'You look magnificent. Wind in your hair, a sword you never owned. Visitors are very impressed. (+15 Legacy Points)'; }
    grow(L, 'cha', .3); return 'Every line, every scar, every laugh line. It is the truest thing anyone has ever made of you. (+15 Legacy Points)'; } });
EV({ id: 'orphanage', title: 'An Orphanage in Need', kind: 'Legacy', ages: [28, 9999], w: .8, once: false, cd: 12, icon: 'home', cond: (L) => L.gold >= 600,
  fire: (L) => card('An Orphanage in Need', `The orphanage in ${TOWN[L.town].name} is out of money. The matron has been selling the furniture to buy bread.`, [C('Fund it for a year (500 gold)', 'fund'), C('Teach there every week', 'teach'), C('Hold a fundraiser with your fame', 'fame', { disabled: L.fame < 60, hint: 'Needs fame 60' })]),
  resolve: (L, k) => {
    if (k === 'fund') { money(L, -500); fame(L, 10); META.lp += 10; return 'The furniture comes back. So do the beds, the books, and a cook who can actually cook. (+10 Legacy Points)'; }
    if (k === 'teach') { const p = mkStudent(L, { age: R.i(9, 13), op: 50 }); const g = grantXp(L, 60); return `You teach letters, numbers, and a little magic. ${p.name} never misses a lesson. (+60 ${g} XP)`; }
    fame(L, 15); grow(L, 'cha', .4); money(L, 50); return 'Half the town turns up when they hear you will be there. The orphanage is funded for three years.'; } });
EV({ id: 'statue', title: 'A Statue in the Square', kind: 'Fame', ages: [36, 9999], w: 1, icon: 'castle', cond: (L) => L.fame >= 300 && !L.flags.statue,
  fire: (L) => card('A Statue in the Square', `The council of ${TOWN[L.town].name} votes to put up a statue of you in the main square. The sculptor wants you to pose.`, [C('Pose heroically', 'hero'), C('Ask for a plaque for everyone who helped you instead', 'plaque'), C('Refuse. Statues are for the dead.', 'no')]),
  resolve: (L, k) => { L.flags.statue = 1;
    if (k === 'no') { stress(L, -5); fame(L, 5); return 'You refuse. They build it anyway, after a fashion: a small stone bench with your name on it. You sit on it sometimes.'; }
    if (k === 'plaque') { L.people.filter(p => p.op >= 40).forEach(p => relGain(L, p, 8)); META.lp += 20; return 'Forty names on a bronze plaque. People come from other towns to find their grandparents on it. (+20 Legacy Points)'; }
    fame(L, 25); META.lp += 20; return 'The statue is twice your size and considerably more handsome. Pigeons adore it. (+20 Legacy Points)'; } });

/* ---------- elder years ---------- */
EV({ id: 'young_hero', title: 'A Young Hero Asks the Way', kind: 'Encounter', ages: [48, 9999], w: 1.2, once: false, cd: 5, icon: 'compass',
  fire: (L) => card('A Young Hero Asks the Way', 'A young adventurer with a brand-new sword and no scars at all asks you for advice. Everyone says you are the person to ask.', [C('Tell them to master the basics first', 'basics'), C('Tell them to go home', 'home'), C('Take them on one quest yourself', 'quest', { disabled: L.hp < maxHp(L) * .5, hint: 'Needs half health' })]),
  resolve: (L, k) => {
    if (k === 'basics') { META.lp += 5; fame(L, 3); return 'They roll their eyes. Ten years later, a famous swordsman tells a crowd that the best advice they ever got was “master the basics first.” (+5 Legacy Points)'; }
    if (k === 'home') { stress(L, -3); return 'They do not go home. But they remember you said it, on the night it would have mattered.'; }
    const c = clamp(.45 + power(L) / 300, .2, .95); if (R.chance(c)) { grantXp(L, 120); money(L, 120); const p = npc(L, { role: 'friend', age: R.i(18, 23), op: 55, noRomance: true, met: L.age }); return `The two of you clear a goblin warren together. ${p.name} talks the entire time. You do not mind as much as you expected.`; }
    const d = hurt(L, R.i(8, 16), 'an old quest'); return `Your body reminds you how old it is (−${d} health). The young hero carries you home, which is humiliating and sweet.`; } });
EV({ id: 'grandkid_lessons', title: 'Lessons for the Little Ones', kind: 'Family', ages: [45, 9999], w: 1.3, once: false, cd: 3, icon: 'people', cond: (L) => L.people.some(p => p.alive && ['grandchild', 'descendant'].includes(p.role) && p.age >= 4 && p.age <= 16),
  fire: (L) => { const g = R.pick(L.people.filter(p => p.alive && ['grandchild', 'descendant'].includes(p.role) && p.age >= 4 && p.age <= 16)); return card('Lessons for the Little Ones', `${g.name} climbs into your lap and demands to learn ${R.pick(['a spell', 'a sword trick', 'a secret', 'something nobody else knows'])}.`, [C('Teach a little magic', 'magic', { disabled: bestMagic(L) < 1, hint: 'Needs magic' }), C('Teach a sword stance', 'sword', { disabled: bestSword(L) < 1, hint: 'Needs swordsmanship' }), C('Tell a story from your adventures', 'story')], { pid: g.id }); },
  resolve: (L, k, d) => { const g = person(L, d.pid); if (!g) return '';
    relGain(L, g, 15); stress(L, -8);
    if (k === 'magic') { g.skill = g.skill || { k: bestElement(L), r: 1 }; return `${g.name} makes a water ball the size of a pea and screams with joy. You scream too. Nobody else understands why it matters so much.`; }
    if (k === 'sword') { g.skill = g.skill || { k: L.sword.primary || 'sg', r: 1 }; return `${g.name} holds a stick like a sword and scowls exactly the way you do. It is uncanny.`; }
    return `You tell the story of ${R.pick(['the time you met a dragon', 'your first quest', 'the night you got lost in the woods', 'the person who taught you everything'])}. ${g.name} falls asleep at the best part, as is tradition.`; } });
EV({ id: 'old_party', title: 'The Old Party Reunites', kind: 'Reunion', ages: [40, 9999], w: 1, once: false, cd: 10, icon: 'people', cond: (L) => L.people.filter(p => p.alive && ['party', 'friend'].includes(p.role) && L.age - (p.met || 0) >= 15).length >= 1,
  fire: (L) => { const ps = L.people.filter(p => p.alive && ['party', 'friend'].includes(p.role) && L.age - (p.met || 0) >= 15).slice(0, 3);
    return card('The Old Party Reunites', `${ps.map(p => p.name).join(', ')} turn${ps.length === 1 ? 's' : ''} up at your door with a map and a terrible idea: one last adventure, for old times’ sake.`, [C('One last quest!', 'quest'), C('Drink and tell the old stories instead', 'drink'), C('Visit the graves of the ones who didn’t make it', 'graves')], { ids: ps.map(p => p.id) }); },
  resolve: (L, k, d) => { const ps = (d.ids || []).map(id => person(L, id)).filter(Boolean);
    if (k === 'quest') { const c = clamp(.5 + power(L) / 400 + ps.length * .05, .2, .95); ps.forEach(p => relGain(L, p, 12)); if (R.chance(c)) { const g = Math.round(R.i(200, 500) * (1 + pct(L, 'loot'))); money(L, g); fame(L, 12); return `It goes wrong in all the old familiar ways and right in the end. You split ${fmt(g)} gold and laugh until dawn.`; } const dm = hurt(L, R.i(8, 20), 'one last quest'); return `You are all too old for this (−${dm} health). Nobody regrets it.`; }
    if (k === 'graves') { ps.forEach(p => relGain(L, p, 15)); stress(L, -12); META.lp += 5; return 'You visit every grave and leave something at each one. Nobody says much. Nobody needs to.'; }
    ps.forEach(p => relGain(L, p, 18)); stress(L, -15); return 'The stories get bigger every time you tell them. The dragon is now the size of a mountain. Everyone agrees this is accurate.'; } });
EV({ id: 'lingering_cough', title: 'The Cough That Lingers', kind: 'Hardship', ages: [55, 9999], w: .9, once: false, cd: 10, icon: 'drop', cond: (L) => !mods(L).ageless && !(pct(L, 'sick') < 0),
  fire: (L) => card('The Cough That Lingers', 'A cough settles into your chest in autumn and does not leave in spring.', [C('See a good healer (300 gold)', 'heal', { disabled: L.gold < 300, hint: 'Needs 300 gold' }), C('Treat it yourself with detox magic', 'self', { disabled: rankOf(L, 'detox') < 2, hint: 'Needs Intermediate detox magic' }), C('Ignore it and hope', 'ignore')]),
  resolve: (L, k) => {
    if (k === 'heal') { money(L, -300); heal(L, 20); return 'The healer listens to your chest, frowns, and prescribes something that tastes like a swamp. It works.'; }
    if (k === 'self') { const g = addSkillXp(L, 'detox', 60); heal(L, 20); return `You find the poison in your own lungs and draw it out like a splinter. (+${g} XP)`; }
    const d = hurt(L, R.i(8, 18), 'a lingering illness'); stress(L, 6); return `The cough gets worse before it gets better (−${d} health).`; } });
EV({ id: 'quiet_morning', title: 'A Quiet Morning', kind: 'Reflection', ages: [50, 9999], w: 1.1, once: false, cd: 3, icon: 'sun',
  fire: (L) => card('A Quiet Morning', 'No battles, no letters, no visitors. Just the morning, a cup of tea, and nowhere you have to be.', [C('Tend the garden', 'garden'), C('Go fishing', 'fish'), C('Read an old favorite', 'read')]),
  resolve: (L, k) => { stress(L, -10);
    if (k === 'garden') { heal(L, 6); return 'The tomatoes are doing well. The roses are doing better. You are doing best of all.'; }
    if (k === 'fish') { L.st.luck += .3; return R.pick(['You catch nothing and it is perfect.', 'You catch a fish so large you have to tell everyone about it, and you do.', 'A child sits beside you and asks about the old days. You catch nothing. It is still perfect.']); }
    L.read = clamp(L.read + 5, 0, 100); grow(L, 'int', .2); return 'You reread a book you loved at twenty. It is a completely different book now. So are you.'; } });
EV({ id: 'will_written', title: 'Putting Affairs in Order', kind: 'Legacy', ages: [58, 9999], w: 1, icon: 'scroll', cond: (L) => !L.flags.will,
  fire: (L) => card('Putting Affairs in Order', 'A notary comes to the house with ink, wax, and a very patient expression. It is time to write your will.', [C('Leave everything to your children', 'kids', { disabled: !L.people.some(p => p.role === 'child' && p.alive), hint: 'Needs a living child' }), C('Leave a great deal to charity', 'charity'), C('Spend it all while you can', 'spend')]),
  resolve: (L, k) => { L.flags.will = k;
    if (k === 'kids') { L.people.filter(p => p.alive && p.role === 'child').forEach(p => relGain(L, p, 8)); META.lp += 10; return 'Everything to the children, divided fairly, with a letter for each. (+10 Legacy Points)'; }
    if (k === 'charity') { fame(L, 20); META.lp += 15; return 'Schools, orphanages, and a hospital in Millis. Your name will be on doors you will never walk through. (+15 Legacy Points)'; }
    stress(L, -20); return 'You tear up the paper. Life is for the living, and you intend to live.'; } });
EV({ id: 'last_lesson', title: 'The Last Lesson', kind: 'Legacy', ages: [62, 9999], w: 1.2, icon: 'book', cond: (L) => bestRankAll(L) >= 4 && !L.flags.lastLesson && L.people.some(p => p.alive && ['student', 'child', 'grandchild', 'descendant'].includes(p.role) && p.age >= 10),
  fire: (L) => { const cands = L.people.filter(p => p.alive && ['student', 'child', 'grandchild', 'descendant'].includes(p.role) && p.age >= 10); const p = cands.sort((a, b) => b.op - a.op)[0]; const bk = bestKey(L);
    return card('The Last Lesson', `There is one technique you have never taught anyone: the secret at the heart of your ${skillLabel(bk)}. ${p.name} is ready. Maybe you are too.`, [C(`Teach it to ${p.name}`, 'teach'), C('Write it down for whoever comes after', 'write'), C('Let it die with you', 'keep')], { pid: p.id, k: bk }); },
  resolve: (L, k, d) => { L.flags.lastLesson = 1; const p = person(L, d.pid);
    if (k === 'teach' && p) { p.skill = { k: d.k, r: Math.max(p.skill && p.skill.r || 0, Math.max(3, bestRankAll(L) - 2)) }; relGain(L, p, 30); L.flags.legacyTech = d.k; META.lp += 25; return `It takes a year. On the last day, ${p.name} does it perfectly, and you understand that it no longer belongs only to you. (+25 Legacy Points; your heir will inherit part of your mastery)`; }
    if (k === 'write') { L.flags.legacyTech = d.k; META.lp += 20; return 'Forty pages, each one rewritten a dozen times. You seal them with your family crest. (+20 Legacy Points)'; }
    stress(L, -5); return 'Some things are only for you. You smile and say nothing.'; } });
EV({ id: 'last_duel', title: 'One Last Duel', kind: 'Honor', ages: [62, 9999], w: 1, icon: 'sword', cond: (L) => bestSword(L) >= 4 && !L.flags.lastDuel,
  fire: (L) => { const old = L.people.find(p => p.alive && p.role === 'rival'); return card('One Last Duel', old ? `${old.name}, your rival for half a lifetime, sends a letter in shaking handwriting: “Before we are both too old to lift a sword.”` : 'A prodigy half a century younger asks for the honor of crossing swords with a legend.', [C('Fight with everything you have', 'all'), C('Fight to teach, not to win', 'teach'), C('Decline gracefully', 'no')], { pid: old && old.id }); },
  resolve: (L, k, d) => { L.flags.lastDuel = 1; const p = d.pid && person(L, d.pid);
    if (k === 'no') { stress(L, -4); return 'You decline, and send a bottle of very good wine instead. It is accepted in the spirit intended.'; }
    if (k === 'teach') { fame(L, 15); if (p) { relGain(L, p, 40); p.role = 'friend'; } addSkillXp(L, L.sword.primary || 'sg', 100); return 'You fight slowly, so they can see every move. At the end, everyone watching understands something they did not before.'; }
    const c = clamp(.45 + power(L) / 500, .2, .9); if (R.chance(c)) { fame(L, 40); if (p) { relGain(L, p, 30); remember(p, L, 'Lost the last duel, gladly'); } return 'For one moment you are young again. Then it is over, and you have won, and you sit down in the dust and laugh.'; }
    const dm = hurt(L, R.i(10, 20), 'one last duel'); fame(L, 20); if (p) relGain(L, p, 30); return `You lose (−${dm} health). It is the best fight of your life.`; } });
EV({ id: 'pilgrimage', title: 'The Long Pilgrimage', kind: 'Journey', ages: [52, 9999], w: .9, icon: 'map', cond: (L) => !L.flags.pilgrim,
  fire: (L) => card('The Long Pilgrimage', 'Pilgrims pass your door every spring on the way to somewhere holy. This year, you are tempted to follow.', [C('Walk to the cathedral in Millishion', 'millis'), C('Visit the sacred tree in the Great Forest', 'forest'), C('Climb to the Sword Sanctum, one last time', 'sanctum')]),
  resolve: (L, k) => { L.flags.pilgrim = 1; money(L, -Math.min(L.gold, 150)); stress(L, -20);
    if (k === 'millis') { heal(L, 20); return 'The cathedral bells ring as you arrive. You do not know if you believe, but you feel lighter walking home.'; }
    if (k === 'forest') { L.st.luck += 1; return 'Under the oldest tree in the world, everything you worry about feels very small. (+1 Luck)'; }
    addSkillXp(L, 'sg', 60); fame(L, 6); return 'You climb all thousand steps. At the top, a young disciple recognizes your name and bows so low he nearly falls over.'; } });
EV({ id: 'names_on_stone', title: 'Names on the Stone', kind: 'Reflection', ages: [45, 9999], w: 1, once: false, cd: 10, icon: 'flag', cond: (L) => closeDead(L).length >= 3,
  fire: (L) => { const ds = closeDead(L).slice(-4); return card('Names on the Stone', `You walk among the graves of ${ds.map(p => p.name).join(', ')}. The cemetery is a map of your life.`, [C('Tell them all your news', 'talk'), C('Leave flowers and go', 'flowers'), C('Plant a tree for each of them', 'trees')]); },
  resolve: (L, k) => { stress(L, -12);
    if (k === 'trees') { META.lp += 10; return 'Years from now, the cemetery is a small forest. Children play there and do not know why it feels so safe. (+10 Legacy Points)'; }
    if (k === 'talk') { stress(L, -6); return 'You tell them everything: the good news, the gossip, the grandchildren. It is a long visit.'; }
    return 'You leave flowers. The wind takes the petals. That seems right.'; } });

/* ---------- the very long-lived ---------- */
EV({ id: 'outlived_friend', title: 'The Friend Who Grew Old', kind: 'Farewell', ages: [18, 9999], w: 1.4, once: false, cd: 12, icon: 'feather', cond: (L) => longLived(L) && L.age >= 40 && L.people.some(p => p.alive && !isFamily(p) && p.op >= 30 && (RACE[p.race] || RACE.human).life[1] < (L.lifespan || 70) * .6 && p.age >= (RACE[p.race] || RACE.human).life[0] * .85),
  fire: (L) => { const p = R.pick(L.people.filter(p => p.alive && !isFamily(p) && p.op >= 30 && (RACE[p.race] || RACE.human).life[1] < (L.lifespan || 70) * .6 && p.age >= (RACE[p.race] || RACE.human).life[0] * .85));
    return card('The Friend Who Grew Old', `${p.name} was young when you met. Now ${heShe(p)} is ${p.age}, white-haired, and sleeping most of the day, while you have hardly changed at all. ${cap1(heShe(p))} jokes that you must have a painting in the attic.`, [C('Stay close until the end', 'stay'), C('Take them on one last trip', 'trip'), C('Say goodbye now, while they still know you', 'bye')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); if (!p) return ''; p.alive = false; p.diedAt = L.age; stress(L, Math.round(18 * (1 + pct(L, 'grief'))));
    if (k === 'trip') { stress(L, -10); return `You take ${p.name} to see the sea one last time. ${cap1(heShe(p))} dies a month later, still talking about it.`; }
    if (k === 'bye') { META.lp += 5; return `You say everything that needs saying. ${p.name} squeezes your hand. When the end comes, months later, there is nothing left unsaid. (+5 Legacy Points)`; }
    relGain(L, p, 10); return `You are there every day. ${p.name} dies in the spring, with the window open and you reading aloud.`; } });
EV({ id: 'forgotten_deeds', title: 'Nobody Remembers', kind: 'Reflection', ages: [18, 9999], w: 1.2, once: false, cd: 30, icon: 'scroll', cond: (L) => L.age >= 80 && L.fame >= 40 && longLived(L),
  fire: (L) => card('Nobody Remembers', `A young bard in a tavern sings about ${L.epithet ? '“' + L.epithet + '”' : 'a hero from long ago'}. He gets every detail wrong. When you correct him, he laughs: “Old man, that was ages ago. Nobody alive was there.” You were.`, [C('Reinvent yourself under a new name', 'new'), C('Write down what really happened', 'write'), C('Let the legend be wrong', 'let')]),
  resolve: (L, k) => { L.fame = Math.round(L.fame * .6);
    if (k === 'new') { L.epithet = ''; grantXp(L, 150); return 'You stop answering to your old name. A new one will come, if you earn it again.'; }
    if (k === 'write') { META.lp += 15; L.read = 100; return 'You write a correct history. A university in Sharia keeps it under glass. (+15 Legacy Points)'; }
    stress(L, -15); return 'You tip the bard. His version has a better ending anyway.'; } });
EV({ id: 'age_of_tools', title: 'The Age of Magic Tools', kind: 'Discovery', ages: [18, 9999], w: 1, icon: 'gear', cond: (L) => L.year >= 520 || L.age >= 120,
  fire: (L) => card('The Age of Magic Tools', 'Mana-crystal lamps light every street. A dwarf sells you a box that keeps food cold forever. The world is changing faster than at any time you remember.', [C('Study how they work', 'study'), C('Invest in a workshop (800 gold)', 'invest', { disabled: L.gold < 800, hint: 'Needs 800 gold' }), C('Grumble about the old days', 'grumble')]),
  resolve: (L, k) => {
    if (k === 'study') { L.craft = (L.craft || 0) + 150; grow(L, 'int', .6); L.read = clamp(L.read + 10, 0, 100); return 'You take apart three lamps and put back together two. You understand the principle now, and you have ideas.'; }
    if (k === 'invest') { money(L, -800); L.flags.workshops = 1; return 'You buy into a workshop near the market. It pays every year, as reliably as the seasons.'; }
    stress(L, -6); grow(L, 'cha', .2); return 'You grumble. The young people humor you. Secretly, you love the cold box.'; } });
EV({ id: 'century_war', title: 'Another War, Another Century', kind: 'Danger', ages: [18, 9999], w: 1, once: false, cd: 35, icon: 'shield', cond: (L) => L.age >= 90,
  fire: (L) => card('Another War, Another Century', 'War again, between kingdoms that did not exist when you were born. A general comes to your door. She has read about you in books.', [C('Advise the general', 'advise'), C('Take the field once more', 'field'), C('Refuse. You have seen enough wars.', 'refuse')]),
  resolve: (L, k) => {
    if (k === 'advise') { fame(L, 25); grow(L, 'int', .5); money(L, 300); return 'Your advice is two hundred years out of date and somehow still correct. The war ends in a season.'; }
    if (k === 'field') { const c = clamp(.4 + power(L) / 350, .15, .95); if (R.chance(c)) { fame(L, 40); grantXp(L, 250); earn(L, 'war_veteran'); unlock(L, 'war_vet'); return 'They thought you were a museum piece. Then they watched you fight.'; } const d = hurt(L, R.i(15, 35), 'a war of a new century'); return `You are slower than you used to be (−${d} health). You fight anyway.`; }
    stress(L, -10); return 'You refuse. She nods: “The books said you might.” It is the first time a war has asked your permission.'; } });
EV({ id: 'descendant_feud', title: 'Your Descendants Quarrel', kind: 'Family', ages: [55, 9999], w: 1, once: false, cd: 12, icon: 'scales', cond: (L) => descOf(L).filter(p => p.age >= 18).length >= 3,
  fire: (L) => card('Your Descendants Quarrel', 'Your descendants are fighting over the family business, the family house, and, apparently, who you love most. They want you to settle it.', [C('Divide everything evenly (600 gold)', 'even', { disabled: L.gold < 600, hint: 'Needs 600 gold' }), C('Choose one heir to lead the family', 'one'), C('Bang your cane and make them all apologize', 'cane')]),
  resolve: (L, k) => { const ds = descOf(L).filter(p => p.age >= 18);
    if (k === 'even') { money(L, -600); ds.forEach(p => relGain(L, p, 8)); return 'Everyone gets the same. Everyone complains equally. That is how you know it was fair.'; }
    if (k === 'one') { const h = ds.sort((a, b) => b.op - a.op)[0]; ds.forEach(p => relGain(L, p, p === h ? 25 : -10)); return `${h.name} will lead the family. The others sulk, then fall in line, mostly.`; }
    const ok = R.chance(clamp(.3 + L.st.cha * .03 + L.fame / 1000, .15, .9)); ds.forEach(p => relGain(L, p, ok ? 12 : -4)); grow(L, 'cha', .3); return ok ? 'The cane comes down. The room goes silent. Within an hour everyone has apologized to everyone, including the cat.' : 'The cane comes down. Nobody listens. They are, after all, your descendants.'; } });
EV({ id: 'people_elder', title: 'Elder of Your People', kind: 'Honor', ages: [40, 9999], w: 1.1, icon: 'crown', cond: (L) => longLived(L) && L.age >= 100 && !L.flags.elder,
  fire: (L) => card('Elder of Your People', `The ${RACE[L.race].name} of your homeland send a delegation. Their eldest has died, and they ask you to take a seat among the elders who guide your people.`, [C('Accept the honor', 'yes'), C('Accept, but only as an advisor', 'advise'), C('Decline. You are not done wandering.', 'no')]),
  resolve: (L, k) => { L.flags.elder = 1;
    if (k === 'no') { stress(L, -6); return 'They are disappointed, and not surprised. “Come home when you are ready,” the delegation says. “We are patient.”'; }
    if (k === 'advise') { fame(L, 20); META.lp += 15; return 'You advise from a distance. Your letters are read aloud at every council. (+15 Legacy Points)'; }
    fame(L, 40); stress(L, 8); META.lp += 25; grow(L, 'cha', .6); return 'You take your seat among the elders. The decisions are slow, the meetings are long, and you have never felt so needed. (+25 Legacy Points)'; } });
EV({ id: 'sealed_long_ago', title: 'Something Sealed Long Ago', kind: 'Danger', ages: [30, 9999], w: 1, once: false, cd: 25, icon: 'skull', cond: (L) => L.age >= 90,
  fire: (L) => { const c = clamp(1 / (1 + Math.exp(-(power(L) - 140) / 22)), .05, .95); return card('Something Sealed Long Ago', 'A seal you watched the priests set when you were young has cracked. Whatever was under it remembers the world as it was, and it is angry.', [C(`Fight it (${riskLabel(c)})`, 'fight'), C('Reseal it with your mana', 'seal', { disabled: L.mana.cap < 3000, hint: 'Needs 3,000 mana' }), C('Raise the alarm across the province', 'alarm')], { c }); },
  resolve: (L, k, d) => {
    if (k === 'seal') { L.mana.ctrl = clamp(L.mana.ctrl + 5, 0, 100); fame(L, 20); META.lp += 10; return 'You pour mana into the old runes until the cracks close like healing skin. The seal will hold for another century. (+10 Legacy Points)'; }
    if (k === 'alarm') { fame(L, 10); grow(L, 'cha', .3); return 'You rouse three towns and a guild hall. Together, you drive the thing back under the earth.'; }
    if (R.chance(d.c)) { fame(L, 35); grantXp(L, 350); const g = Math.round(R.i(400, 900) * (1 + pct(L, 'loot'))); money(L, g); return `It is old and terrible and slow, and so, in your own way, are you. You win. The relic it guarded is worth ${fmt(g)} gold.`; }
    const dm = hurt(L, R.i(20, 45), 'an ancient horror'); return `It was ancient for a reason (−${dm} health). You drag yourself away and seal the cave mouth behind you.`; } });
EV({ id: 'someone_remembers', title: 'Someone Who Remembers', kind: 'Reunion', ages: [30, 9999], w: 1.1, once: false, cd: 20, icon: 'eye', cond: (L) => L.age >= 110,
  fire: (L) => { const rj = L.people.find(p => p.alive && p.name === 'Ruijerd'); const p = rj || npc(L, { role: 'friend', race: R.pick(['elf', 'superd', 'dragon', 'migurd']), age: L.age + R.i(-20, 200), op: 45, noRomance: true, met: L.age });
    return card('Someone Who Remembers', `${p.name} sits down across from you at an inn as though no time has passed at all. “You look older,” ${heShe(p)} says. It has been sixty years. In all that time, nobody else has remembered who you used to be.`, [C('Talk until morning', 'talk'), C('Travel together for a while', 'travel'), C('Ask what they have learned', 'learn')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); if (!p) return ''; relGain(L, p, 25); stress(L, -15);
    if (k === 'travel') { if (p.role !== 'party') p.role = 'party'; p.power = Math.max(p.power || 0, 40); return `You travel together for a year. It is the easiest company you have kept in a century.`; }
    if (k === 'learn') { grantXp(L, 200); return `${p.name} has spent decades on things you never thought about. You listen like an apprentice. (+200 XP)`; }
    META.lp += 10; return 'The innkeeper gives up and leaves you the keys. When the sun rises you are still talking. (+10 Legacy Points)'; } });
EV({ id: 'new_kingdom', title: 'A New Kingdom on Old Maps', kind: 'Discovery', ages: [30, 9999], w: .9, once: false, cd: 30, icon: 'castle', cond: (L) => L.age >= 100,
  fire: (L) => card('A New Kingdom on Old Maps', 'A kingdom has risen where you remember only forest. Its young queen has heard there is someone alive who knew the land before, and asks for your counsel.', [C('Serve at her court for a while', 'serve'), C('Advise her once, then leave', 'advise'), C('Tell her to plant the forest back', 'forest')]),
  resolve: (L, k) => {
    if (k === 'serve') { money(L, 600); fame(L, 25); stress(L, 10); return 'Court life is exhausting and well paid. You teach the young queen to distrust anyone who flatters her, including you.'; }
    if (k === 'forest') { META.lp += 15; L.st.luck += .5; return 'She laughs, then actually does it: a ring of forest around the capital. In a hundred years it will be magnificent. (+15 Legacy Points)'; }
    fame(L, 15); grow(L, 'int', .4); return 'One evening of advice. She takes all of it. The kingdom does well.'; } });
EV({ id: 'decades_research', title: 'A Spell No One Has Cast', kind: 'Breakthrough', ages: [40, 9999], w: 1, once: false, cd: 25, icon: 'wand', cond: (L) => bestMagic(L) >= 4 && (L.age >= 80 || (longLived(L) && L.age >= 60)),
  fire: (L) => card('A Spell No One Has Cast', 'You have time, more than most mages ever get. You could spend the next decade on a spell nobody has ever completed.', [C('Begin the great work', 'work'), C('Collaborate with Ranoa’s scholars', 'ranoa'), C('Not this decade', 'no')]),
  resolve: (L, k) => { if (k === 'no') return 'There will be other decades. That is the point of living this long.';
    const bk = MAGIC.map(m => m.id).sort((a, b) => (L.magic[b] || 0) - (L.magic[a] || 0))[0];
    const c = k === 'ranoa' ? .75 : .55;
    if (R.chance(c)) { const g = addSkillXp(L, bk, 600); L.mana.cap += Math.round(400 * L.mana.pot); fame(L, 50); META.lp += 25; return `After years of failure, the spell works. Scholars name it after you. (+${g} XP, more mana, +25 Legacy Points)`; }
    const g = addSkillXp(L, bk, 200); stress(L, 10); return `The spell does not work. But you learn more from failing at it than most mages learn in a lifetime. (+${g} XP)`; } });
EV({ id: 'decade_of_silence', title: 'A Decade of Silence', kind: 'Training', ages: [40, 9999], w: 1, once: false, cd: 25, icon: 'sword', cond: (L) => bestSword(L) >= 4 && (L.age >= 80 || (longLived(L) && L.age >= 60)),
  fire: (L) => card('A Decade of Silence', 'You could retreat to the mountains and do nothing but swing a sword, ten thousand times a day, for ten years.', [C('Go to the mountains', 'go'), C('Train a single student the same way', 'student'), C('Stay among people', 'no')]),
  resolve: (L, k) => { if (k === 'no') { stress(L, -5); return 'You stay. The mountains will still be there.'; }
    const sk = L.sword.primary || 'sg';
    if (k === 'student') { const p = mkStudent(L, { age: R.i(14, 18), skill: { k: sk, r: 2 } }); const g = addSkillXp(L, sk, 250); return `You and ${p.name} train side by side until you move like one sword. (+${g} XP)`; }
    const g = addSkillXp(L, sk, 500); L.aura.cap = Math.round(L.aura.cap * 1.15 + 50); auraStageCheck(L); kinOf(L).forEach(p => relGain(L, p, -6)); return `When you come down from the mountain, birds stop singing as you pass. Your family barely recognizes you. (+${g} XP, stronger aura)`; } });

/* ---------- everyday adult life (repeatable, so no year is empty) ---------- */
EV({ id: 'market_day', title: 'Market Day', kind: 'Season', ages: [12, 9999], w: 1.1, once: false, cd: 3, icon: 'basket',
  fire: (L) => card('Market Day', `Market day in ${TOWN[L.town].name}: spice sellers, a juggler, a man selling “genuine dragon teeth” that are clearly goat teeth.`, [C('Haggle for a bargain', 'haggle'), C('Buy a gift for someone you love', 'gift', { disabled: L.gold < 30, hint: 'Needs 30 gold' }), C('Just people-watch', 'watch')]),
  resolve: (L, k) => {
    if (k === 'haggle') { const ok = R.chance(clamp(.3 + L.st.cha * .03, .1, .9)); grow(L, 'cha', .25); if (ok) { money(L, 25); return 'You haggle a merchant down so far he ends up paying you, more or less.'; } return 'The merchant haggles you up. You walk away with a lamp you did not need.'; }
    if (k === 'gift') { money(L, -30); const p = R.pick(L.people.filter(p => p.alive && p.op >= 20)) || null; if (p) { relGain(L, p, 12); return `You find the perfect thing for ${p.name}. ${cap1(heShe(p))} keeps it for years.`; } return 'You buy yourself a gift. You deserve it.'; }
    stress(L, -6); return 'You sit by the fountain with a meat pie and watch the whole town go by. It is better than any play.'; } });
EV({ id: 'stranger_map', title: 'A Stranger with a Map', kind: 'Encounter', ages: [14, 9999], w: .9, once: false, cd: 7, icon: 'map',
  fire: (L) => card('A Stranger with a Map', 'A hooded stranger slides a map across the tavern table. “Treasure,” she whispers. “Three days east. I just need someone to carry the shovel.”', [C('Follow the map', 'go'), C('Buy the map for 50 gold and go alone', 'buy', { disabled: L.gold < 50, hint: 'Needs 50 gold' }), C('Laugh and leave', 'no')]),
  resolve: (L, k) => {
    if (k === 'no') return 'You laugh. A week later you hear someone found treasure three days east. You decide not to think about it.';
    if (k === 'buy') money(L, -50);
    const r = R.f();
    if (r < .4) { const g = Math.round(R.i(80, 400) * (1 + pct(L, 'loot'))); money(L, g); return `Under a lightning-struck oak, exactly where the map said: a chest with ${fmt(g)} gold.`; }
    if (r < .7) { const d = hurt(L, R.i(6, 16), 'a trap'); return `The “treasure” is a trap, and the stranger is long gone (−${d} health).`; }
    grow(L, 'int', .3); stress(L, -4); return 'The map leads to an old picnic spot with a beautiful view. Somebody’s idea of treasure. It is not a bad one.'; } });
EV({ id: 'square_trouble', title: 'Trouble in the Square', kind: 'Confrontation', ages: [12, 9999], w: 1, once: false, cd: 4, icon: 'fist',
  fire: (L) => card('Trouble in the Square', 'Three thugs are shaking down a fruit seller in the square. People are pretending not to see.', [C('Step in', 'fight'), C('Talk them down', 'talk'), C('Fetch the guards', 'guards')]),
  resolve: (L, k) => {
    if (k === 'talk') { if (R.chance(clamp(.25 + L.st.cha * .035 + L.fame / 600, .1, .9))) { grow(L, 'cha', .4); fame(L, 3); return 'You talk until the thugs feel slightly ashamed of themselves, which they did not know was possible. They leave.'; } const d = hurt(L, R.i(3, 8), 'a street fight'); return `They are not in a talking mood (−${d} health).`; }
    if (k === 'guards') { return 'The guards arrive eventually. The fruit seller gives you an apple anyway.'; }
    if (R.chance(clamp(.4 + power(L) / 120, .15, .95))) { addSkillXp(L, evFightK(L), 30, true); fame(L, 4); return 'It takes about four seconds. The fruit seller refuses to let you pay for fruit ever again.'; }
    const d = hurt(L, R.i(6, 14), 'a street fight'); return `Three is more than one (−${d} health). But the guards come running at the noise.`; } });
EV({ id: 'storm_road', title: 'Storm on the Road', kind: 'Danger', ages: [12, 9999], w: .9, once: false, cd: 5, icon: 'cloud',
  fire: (L) => card('Storm on the Road', 'A storm catches you between towns. Through the rain you see a wagon stuck in the mud, and a family huddled under it.', [C('Help them free the wagon', 'help'), C('Share your shelter for the night', 'shelter'), C('Push on alone', 'push')]),
  resolve: (L, k) => {
    if (k === 'help') { grow(L, 'str', .4); const p = npc(L, { role: 'friend', age: R.i(25, 50), op: 35, met: L.age }); return `You heave the wagon free, soaked to the bone. The family insists you visit. ${p.name} becomes a lifelong friend.`; }
    if (k === 'shelter') { stress(L, -4); return 'A long night of stories and wet socks. The children fall asleep on your coat.'; }
    if (R.chance(.3)) { const d = hurt(L, R.i(4, 10), 'a storm'); return `You slip on the flooded road (−${d} health).`; } return 'You make it to the next town by dawn, cold and miserable and proud of yourself.'; } });
EV({ id: 'letter_home', title: 'A Letter from Home', kind: 'Family', ages: [15, 9999], w: 1, once: false, cd: 5, icon: 'scroll', cond: (L) => L.town !== (L.home || L.town) && L.people.some(p => p.alive && ['mother', 'father', 'sibling', 'twin'].includes(p.role)),
  fire: (L) => { const p = R.pick(L.people.filter(p => p.alive && ['mother', 'father', 'sibling', 'twin'].includes(p.role))); return card('A Letter from Home', `A letter from ${p.name}, three pages long, mostly about the weather and the neighbors. On the last page: “We miss you. Come home sometime.”`, [C('Write a long reply', 'write'), C('Send money home (100 gold)', 'gold', { disabled: L.gold < 100, hint: 'Needs 100 gold' }), C('Put it in a drawer for later', 'later')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); if (!p) return '';
    if (k === 'write') { relGain(L, p, 12); stress(L, -4); return 'You write five pages back. It takes all evening. It is worth it.'; }
    if (k === 'gold') { money(L, -100); L.family.funds += 100; relGain(L, p, 8); return 'The money arrives with a short note. The reply that comes back is mostly underlined thank-yous.'; }
    relGain(L, p, -4); return 'You mean to reply. The drawer fills up with letters.'; } });
EV({ id: 'midwinter_feast', title: 'The Midwinter Feast', kind: 'Festival', ages: [15, 9999], w: 1, once: false, cd: 3, icon: 'sun',
  fire: (L) => card('The Midwinter Feast', 'Snow on the rooftops, lanterns in every window. Midwinter is here, and everyone is feasting.', [C('Host the feast yourself (120 gold)', 'host', { disabled: L.gold < 120, hint: 'Needs 120 gold' }), C('Go to every party in town', 'party'), C('A quiet night with the people closest to you', 'quiet')]),
  resolve: (L, k) => {
    if (k === 'host') { money(L, -120); L.people.filter(p => p.alive && p.op >= 10).forEach(p => relGain(L, p, 6)); fame(L, 3); return 'Your table seats twenty. Thirty come. Nobody leaves hungry, and somebody falls asleep under the table.'; }
    if (k === 'party') { grow(L, 'cha', .4); stress(L, -6); if (R.chance(.4)) actMeet(L, 'friend'); return 'You go to every party in town and make at least one new friend at each. Your head regrets it in the morning.'; }
    kinOf(L).forEach(p => relGain(L, p, 8)); stress(L, -12); return 'A small fire, good food, and the people who matter most. It is the best night of the year.'; } });
