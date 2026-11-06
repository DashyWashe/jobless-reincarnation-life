/* ===================== LEGACY EVENTS: echoes of past lives, ancestors, and the works you fund ===================== */
const worked = (L, id, yrs) => L.works && L.works[id] != null && L.age - L.works[id] >= (yrs || 0);
const ancestorOf = (L) => (META.hall || []).filter(h => h.lin && h.lin === L.lineage && h.gen < L.gen).sort((a, b) => b.gen - a.gen)[0] || null;
const kinWord = (L, h) => { const d = L.gen - h.gen; return d === 1 ? (h.sex === 'f' ? 'your mother' : 'your father') : d === 2 ? (h.sex === 'f' ? 'your grandmother' : 'your grandfather') : 'an ancestor of yours'; };

EV({ id: 'deja_vu', title: 'A Road You Remember', kind: 'Reflection', ages: [8, 9999], w: .7, icon: 'compass', cond: (L) => META.lives >= 2 && discTotal() >= 60,
  fire: (L) => card('A Road You Remember', 'You have never walked this road, yet you know where it bends, where the old oak leans, and which stone wobbles underfoot. Somewhere, in another life, you walked it already.', [C('Follow the feeling', 'follow'), C('Write down everything you remember', 'write'), C('Shake it off', 'shake')]),
  resolve: (L, k) => {
    if (k === 'follow') { const g = R.i(40, 140); money(L, g); stress(L, -4); return `At the end of the road, under the wobbling stone, you find a small tin box. Inside are ${g} gold coins and a note in handwriting that looks a great deal like yours: “Told you.”`; }
    if (k === 'write') { L.read = clamp(L.read + 6, 0, 100); grow(L, 'int', .4); return 'You fill six pages before the memories fade. Reading them back later, you understand about half. The other half keeps you up at night, in a good way.'; }
    stress(L, -6); return 'You shake your head and keep walking. Whatever it was, it can stay in the other life.';
  } });

EV({ id: 'ancestor_portrait', title: 'A Portrait in the Attic', kind: 'Legacy', ages: [10, 9999], w: 2, icon: 'castle', cond: (L) => L.gen >= 2 && !!ancestorOf(L),
  fire: (L) => { const h = ancestorOf(L);
    return card('A Portrait in the Attic', `In a trunk under the eaves you find a portrait of ${h.name}${h.epithet ? ` “${h.epithet}”` : ''} ${h.sur}, ${kinWord(L, h)}. ${h.best >= 3 ? `They reached ${RANKS[h.best]} in ${h.bestSkill}` : 'They never chased great power'}, and lived ${h.age} years. The painter caught a look you have seen in your own mirror.`, [C('Hang it in the hall', 'hang'), C('Read the letters tucked behind the canvas', 'letters')], { name: h.name }); },
  resolve: (L, k, d) => {
    if (k === 'hang') { stress(L, -8); fame(L, 3); return `You hang ${d.name} where the morning light falls. Some days you could swear the painted eyes approve.`; }
    const sk = bestKey(L); if (sk) { const g = addSkillXp(L, sk, 90); return `Behind the canvas is a bundle of letters full of training notes in a familiar hand. One trick in ${skillLabel(sk)} works on the first try (+${g} XP).`; }
    L.read = clamp(L.read + 8, 0, 100); grow(L, 'int', .3); return 'Behind the canvas is a bundle of letters: advice, complaints about the weather, and one very bad poem. You read them all twice.';
  } });

EV({ id: 'well_festival', title: 'The Well Day Festival', kind: 'Festival', ages: [19, 9999], w: 2, icon: 'drop', cond: (L) => worked(L, 'well', 4),
  fire: (L) => card('The Well Day Festival', 'The village where you paid for a well now holds a festival in its honor every spring, and this year they have invited you. There will be dancing, pies, and a children’s play about you.', [C('Go, and sit in the front row', 'attend'), C('Send a cart of seed grain instead (150 gold)', 'gift', { disabled: L.gold < 150, hint: 'Needs 150 gold' })]),
  resolve: (L, k) => {
    if (k === 'gift') { money(L, -150); fame(L, 10); return 'The grain arrives with a new bucket for the well. By the next festival, the bucket has its own song.'; }
    stress(L, -10); fame(L, 6); grow(L, 'cha', .3); return 'The children say your name three different ways, all of them wrong. The child playing you trips on the cape twice. You have never enjoyed a play more.';
  } });

EV({ id: 'scholar_visit', title: 'A Letter Becomes a Visitor', kind: 'Reunion', ages: [25, 9999], w: 2, icon: 'hat', cond: (L) => worked(L, 'scholarship', 5),
  fire: (L) => { const m = R.pick(['fire', 'water', 'earth', 'wind']); const p = npc(L, { role: 'friend', age: R.i(19, 25), op: 40, noRomance: true, met: L.age, job: 'Mage of Ranoa University', skill: { k: m, r: 3 } });
    return card('A Letter Becomes a Visitor', `A young mage named ${p.name} knocks at your door. Your scholarship paid for ${hisHer(p)} years at Ranoa, and ${heShe(p)} has come a long way to show you ${hisHer(p)} first original spell: a ${MAGIC_ID[m].name.toLowerCase()} working no textbook describes.`, [C('Ask to learn it', 'learn'), C('Offer to write a letter of recommendation', 'recommend'), C('Invite them to dinner and listen', 'dinner')], { pid: p.id, m }); },
  resolve: (L, k, d) => { const p = person(L, d.pid);
    if (k === 'learn') { const g = addSkillXp(L, d.m, 100); if (p) relGain(L, p, 12); return `You spend three days learning it and three more failing at it. On the seventh day it works (+${g} ${MAGIC_ID[d.m].name} magic XP).`; }
    if (k === 'recommend') { if (p) { relGain(L, p, 25); remember(p, L, 'Wrote the letter that opened every door'); } fame(L, 8); return 'Your letter opens doors across three kingdoms. Years later you hear your name spoken with gratitude in rooms you have never entered.'; }
    if (p) relGain(L, p, 18); stress(L, -8); return 'You listen to stories of exams, dormitory feuds, and a disastrous attempt at summoning. The spell is impressive. The company is better.';
  } });

EV({ id: 'statue_mustache', title: 'A Mustache for the Statue', kind: 'Confrontation', ages: [37, 9999], w: 2, icon: 'crown', cond: (L) => worked(L, 'statue', 2),
  fire: (L) => card('A Mustache for the Statue', 'Overnight, someone painted a large curling mustache on your bronze statue. The whole town is talking about it. Some of them are laughing.', [C('Laugh louder than anyone', 'laugh'), C('Find the culprit', 'hunt'), C('Hire a guard for the statue (300 gold)', 'guard', { disabled: L.gold < 300, hint: 'Needs 300 gold' })]),
  resolve: (L, k) => {
    if (k === 'laugh') { fame(L, 12); stress(L, -6); return 'You laugh until you cry, and the crowd laughs with you. By evening the mustache is the most beloved part of the statue. You decide to keep it.'; }
    if (k === 'hunt') { grow(L, 'cha', .3); return 'The culprit is a nine-year-old with paint on her sleeves and no regrets whatsoever. You hire her to clean it. She does a beautiful job, then asks if she can paint you a better one.'; }
    money(L, -300); return 'A guard now watches the statue day and night. No one paints it again. The pigeons, however, cannot be stopped.';
  } });

EV({ id: 'library_grimoire', title: 'A Grimoire from the War', kind: 'Discovery', ages: [33, 9999], w: 2, icon: 'book', cond: (L) => worked(L, 'library', 3),
  fire: (L) => card('A Grimoire from the War', 'Your library acquires a grimoire from the Laplace War. The pages are warm to the touch, and the margins are full of notes from a mage who died four hundred years ago.', [C('Study it yourself', 'study'), C('Lend it to Ranoa University for a year', 'lend')]),
  resolve: (L, k) => {
    if (k === 'study') { const m = R.pick(['fire', 'water', 'earth', 'wind']); const g = addSkillXp(L, m, 120); stress(L, 4); return `You read it by candlelight for a month. One of the margin notes fixes a mistake you have been making for years (+${g} ${MAGIC_ID[m].name} magic XP).`; }
    fame(L, 15); return 'The university returns it a year later with thanks, a stack of new research, and your name in the acknowledgments of four books.';
  } });

EV({ id: 'patron_plea', title: 'A Town Asks for Help', kind: 'Opportunity', ages: [26, 9999], w: 1.5, icon: 'castle', cond: (L) => Object.keys(L.works || {}).length >= 2,
  fire: (L) => card('A Town Asks for Help', 'A delegation from a flooded river town arrives, hats in hand. They have heard about your works and wonder whether you could help them rebuild.', [C('Pay for the rebuilding (1,000 gold)', 'pay', { disabled: L.gold < 1000, hint: 'Needs 1,000 gold' }), C('Organize the work yourself', 'organize'), C('Decline politely', 'decline')]),
  resolve: (L, k) => {
    if (k === 'pay') { money(L, -1000); fame(L, 25); grow(L, 'cha', .3); return 'The town hall goes back up with your name carved over the door. This time they spell it correctly.'; }
    if (k === 'organize') { stress(L, 8); fame(L, 12); grow(L, 'cha', .4); return 'You cannot pay for everything, but you can organize: merchants donate timber, the guild sends hands, and a dwarf mason works for beer. The town rises again in a single summer.'; }
    fame(L, -2); return 'You explain that you cannot help this time. They understand, mostly.';
  } });

EV({ id: 'sky_seed', title: 'A Seed from the Clouds', kind: 'Discovery', ages: [36, 9999], w: 2, icon: 'leaf', cond: (L) => worked(L, 'expedition', 1),
  fire: (L) => card('A Seed from the Clouds', 'A sailor from your expedition brings you a gift from the Heaven Continent: a seed the size of a plum. It hums when you hold it near your ear.', [C('Plant it in your garden', 'plant'), C('Sell it to a Millis botanist (2,000 gold)', 'sell')]),
  resolve: (L, k) => {
    if (k === 'sell') { money(L, 2000); return 'The botanist pays without haggling, which tells you that you should have asked for more.'; }
    L.hp = maxHp(L); stress(L, -12); return 'It sprouts overnight into a silver tree that glows faintly after dark. Sitting under it, old aches simply leave.';
  } });

/* ---------- invitations that follow letters from close friends and family ---------- */
const inviteFor = (L, k) => { const v = L.flags.invite; if (!v || v.k !== k || L.age - v.a > 2) return null; const p = person(L, v.pid); return p && p.alive && !p.lost ? p : null; };
EV({ id: 'wedding_invite', title: 'A Wedding Invitation', kind: 'Friendship', ages: [10, 9999], w: 6, once: false, cd: 1, icon: 'heart', cond: (L) => !!inviteFor(L, 'wed'),
  fire: (L) => { const p = inviteFor(L, 'wed'); L.flags.invite = null;
    return card('A Wedding Invitation', `${cap1(whoIs(L, p))} has invited you to the wedding. There is a seat for you at the family table, right next to the cake.`, [C('Go, and dance badly', 'go'), C('Send a generous gift (80 gold)', 'gift', { disabled: L.gold < 80, hint: 'Needs 80 gold' }), C('Send your regrets', 'no')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); if (!p) return '';
    if (k === 'go') { relGain(L, p, 15); stress(L, -8); remember(p, L, 'Came to the wedding and gave a toast'); return `You dance badly, cry a little during the vows, and give a toast people quote for years. ${p.name} will always remember that you came.`; }
    if (k === 'gift') { money(L, -80); relGain(L, p, 10); return `Your gift arrives with a note. ${p.name} writes back within the week, mostly in exclamation marks.`; }
    relGain(L, p, -4); return `You send your regrets and a kind letter. ${p.name} understands. Mostly.`; } });
EV({ id: 'guardian_ask', title: 'A Question of Trust', kind: 'Friendship', ages: [16, 9999], w: 6, once: false, cd: 1, icon: 'heart', cond: (L) => !!inviteFor(L, 'baby'),
  fire: (L) => { const p = inviteFor(L, 'baby'); L.flags.invite = null;
    return card('A Question of Trust', `${cap1(whoIs(L, p))} writes again, more carefully this time: if anything ever happened, would you look after the new baby? It is the greatest trust ${heShe(p)} knows how to give.`, [C('Accept, gladly', 'yes'), C('Accept, and send a silver rattle (40 gold)', 'gift', { disabled: L.gold < 40, hint: 'Needs 40 gold' }), C('Gently decline', 'no')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); if (!p) return '';
    if (k === 'yes' || k === 'gift') { if (k === 'gift') money(L, -40); relGain(L, p, k === 'gift' ? 22 : 18); remember(p, L, 'Promised to look after the baby'); grow(L, 'cha', .2); return k === 'gift' ? 'The rattle is the loudest object in the house within a day. Everyone is delighted except the cat.' : `You write back a single word: “Always.” ${p.name} keeps the letter.`; }
    relGain(L, p, -3); return 'You explain why you cannot, honestly and kindly. The friendship survives it.'; } });
