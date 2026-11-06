/* ===================== STORY ARCS =====================
   Each chapter fires at most once per year, in order. L.arc[id]: 0 unseen, n = chapters done, 99 complete, -1 closed. */
function ARCEV(o) { EV(Object.assign({ w: 0, once: true, isArc: true, kind: 'Turning Point' }, o)); }
const arcStage = (L, id) => (L.arc && L.arc[id]) || 0;
function adv(L, id, n) { L.arc[id] = n; L.arcYear[id] = L.age; }
function finishArc(L, id, achId, note) {
  L.arc[id] = 99; L.arcYear[id] = L.age; discoverL(L, 'arc', id);
  log(L, `Story complete: ${ARC[id].name}.${note ? ' ' + note : ''}`, 'big');
  if (achId) unlock(L, achId);
}
const canonNpc = (L, o) => { const ex = L.people.find(p => p.name === o.name && p.sur === o.sur); if (ex) return ex; discoverL(L, 'npc', o.name); return npc(L, Object.assign({ canon: true }, o)); };
const roxy = (L) => canonNpc(L, { name: 'Roxy', sur: 'Migurdia', race: 'migurd', sex: 'f', age: 37, op: 30, skill: { k: 'water', r: 4 }, job: 'Traveling mage, Water Saint', tags: ['serious','kind'], look: { hair: '#4f7fd0', eyes: '#3f6fd0', skin: '#f3e0d0', style: 4 }, bio: 'A Migurd mage of the Water Saint rank who left her telepathic tribe to see the world. Looks far younger than she is, hates being reminded of it, and is a far better teacher than she believes.' });
const ghislaine = (L) => canonNpc(L, { name: 'Ghislaine', sur: 'Dedoldia', race: 'beastfolk', sex: 'f', age: 33, op: 25, skill: { k: 'sg', r: 5 }, job: 'Sword King, guard of House Boreas', tags: ['stern','loyal'], look: { hair: '#efe9e0', eyes: '#c8902c', skin: '#a8754f', style: 0 }, bio: 'A Sword King of the Doldia tribe, exiled from the Great Forest in her youth. Fearsome with a blade, hopeless with letters, and fiercely loyal to the house that took her in.' });
const ruijerd = (L) => canonNpc(L, { name: 'Ruijerd', sur: 'Superdia', race: 'superd', sex: 'm', age: 560, op: 40, skill: { k: 'ng', r: 5 }, job: 'Warrior of the Superd', tags: ['stern','loyal'], power: 45, look: { hair: '#2f8f5a', eyes: '#b0412e', skin: '#efe6dc', style: 0 }, bio: 'One of the last Superd. He has spent centuries trying to clear his people’s cursed name. Gentle with children, merciless to anyone who would harm them.' });

/* ---------- A TUTOR FROM AFAR ---------- */
ARCEV({ id: 'arc_tutor_1', arc: 'tutor', ch: 1, title: 'The Blue-Haired Mage', ages: [2, 6], icon: 'hat',
  cond: (L) => TOWN[L.town].cont === 'central' && L.family.wealth >= 1 && (L.mana.revealed || L.mana.cap >= 150 || bestMagic(L) >= 1 || L.flags.books || R.chance(.35)),
  fire: (L) => card('The Blue-Haired Mage', `Your parents post a notice for a live-in magic tutor. Weeks later, a small traveler in a wide-brimmed hat knocks on the door: Roxy Migurdia, a Migurd mage of the Water Saint rank. She looks you over with open doubt. “I was told I’d be teaching a gifted child. You are… very small.”`,
    [C('Show her the spell you taught yourself', 'show', { disabled: !(bestMagic(L) >= 1 || L.mana.cap >= 200), hint: 'Needs any magic or 200 mana' }), C('Ask her where she has traveled', 'ask'), C('Hide behind your parent', 'hide')]),
  resolve: (L, k) => {
    const r = roxy(L); r.role = 'mentor'; r.tutor = false; unlock(L, 'mentor_found'); adv(L, 'tutor', 1);
    if (k === 'show') { relGain(L, r, 25); remember(r, L, 'Was impressed by your first spell'); addSkillXp(L, 'water', 30); return 'A water ball wobbles into being above your palm. Roxy’s hat slides back as she stares. “Who taught you that?” She unpacks her bags that evening.'; }
    if (k === 'ask') { relGain(L, r, 15); L.read = clamp(L.read + 8, 0, 100); return 'She tells you about the Demon Continent, the Migurd who speak without words, and a city of mages called Sharia. You don’t sleep that night.'; }
    relGain(L, r, 8); return 'She crouches down to your height. “I was shy too. We’ll start slowly.”';
  } });
ARCEV({ id: 'arc_tutor_2', arc: 'tutor', ch: 2, title: 'Beyond the Village', ages: [3, 9], icon: 'tree',
  cond: (L) => L.people.some(p => p.alive && p.name === 'Roxy' && p.role === 'mentor'),
  fire: (L) => card('Beyond the Village', 'Roxy announces your next test. It has to happen outside the village, past the old mill, where the hills are open and nobody will get hurt. You have never been past the fence before. The road looks very long.', [C('Take her hand and go', 'go'), C('Ask to wait another year', 'wait')]),
  resolve: (L, k) => {
    const r = L.people.find(p => p.name === 'Roxy');
    if (k === 'wait') { L.arc.tutor = 1; L.arcYear.tutor = L.age; relGain(L, r, -3); return 'Roxy nods slowly. “Next year, then. The hills will still be there.”'; }
    adv(L, 'tutor', 2); relGain(L, r, 15); remember(r, L, 'Walked with you past the village for the first time');
    const g = addSkillXp(L, 'water', 110); L.mana.cap += Math.round(30 * L.mana.pot);
    return `The world beyond the fence is enormous and green and full of birds. On the hilltop, Roxy teaches you to pour mana into the sky itself. +${g} water XP.`;
  } });
ARCEV({ id: 'arc_tutor_3', arc: 'tutor', ch: 3, title: 'The Storm Test', ages: [4, 10], icon: 'drop',
  cond: (L) => L.people.some(p => p.alive && p.name === 'Roxy' && p.role === 'mentor'),
  fire: (L) => card('The Storm Test', 'On the hilltop you chant together. Clouds pile up, thunder rolls, and rain sweeps across the valley at your command. Roxy, soaked through, laughs out loud for the first time since she arrived. That night she packs her bag. “You’ll outgrow me soon. I have some growing to do too.” She presses her old staff into your hands.', [C('Thank her and promise to write', 'thank'), C('Beg her to stay', 'beg')]),
  resolve: (L, k) => {
    const r = L.people.find(p => p.name === 'Roxy');
    r.role = 'friend'; adv(L, 'tutor', 3); L.gear.staff = 'tutor_staff'; addSkillXp(L, 'water', 80);
    remember(r, L, 'Gave you her old staff');
    if (k === 'beg') { relGain(L, r, 10); stress(L, 10); return 'She hugs you and leaves anyway, at dawn, without looking back. Later you realize it was so you would not see her cry. You keep her staff by your bed.'; }
    relGain(L, r, 20); return 'You watch her small figure disappear down the road. Her old staff hums faintly in your hands. (Gained Roxy’s Old Staff.)';
  } });
ARCEV({ id: 'arc_tutor_4', arc: 'tutor', ch: 4, title: 'Letters from Shirone', ages: [6, 30], icon: 'scroll',
  cond: (L) => L.age >= L.arcYear.tutor + 2,
  fire: (L) => card('Letters from Shirone', 'A letter arrives sealed with the crest of the Shirone royal court. Roxy is tutoring a prince there now, a stubborn boy who will not practice. She asks whether you are keeping up your water magic, and signs it “your teacher, still.”', [C('Write back about everything', 'write'), C('Send her your best spell notes', 'notes')]),
  resolve: (L, k) => {
    const r = L.people.find(p => p.name === 'Roxy'); if (r) relGain(L, r, 15);
    if (k === 'notes') addSkillXp(L, 'water', 50); else stress(L, -10);
    earn(L, 'roxy_pupil', 'Your teacher’s lessons stay with you for life.');
    finishArc(L, 'tutor', 'arc_tutor');
    return k === 'notes' ? 'Her reply corrects three of your formulas and praises two. You frame the praise.' : 'You write six pages. Her reply, months later, is eight.';
  } });

/* ---------- THE BOREAS HOUSEHOLD ---------- */
ARCEV({ id: 'arc_boreas_1', arc: 'boreas', ch: 1, title: 'A Position in Roa', ages: [7, 10], icon: 'crown',
  cond: (L) => TOWN[L.town].tags.includes('fittoa') && !L.flags.displaced && (bestMagic(L) >= 1 || arcStage(L, 'tutor') >= 3 || L.st.int >= 8),
  fire: (L) => card('A Position in Roa', 'A rider in the colors of House Boreas Greyrat, which rules all of Fittoa, brings a remarkable offer. Lord Sauros needs a tutor for his granddaughter, and every adult tutor has quit. He has heard about a gifted child. The pay would change your family’s life.', [C('Accept and move to Roa', 'yes'), C('Stay home', 'no')]),
  resolve: (L, k) => {
    if (k === 'no') { L.arc.boreas = -1; return 'You stay home. Some days you wonder what the city would have been like.'; }
    adv(L, 'boreas', 1); L.town = 'roa'; if (!L.towns.includes('roa')) L.towns.push('roa'); L.family.funds += 60; refreshBoards(L);
    return 'You arrive at the Boreas mansion in Roa with one bag and a lot of nerves. The house is bigger than your whole village.';
  } });
ARCEV({ id: 'arc_boreas_2', arc: 'boreas', ch: 2, title: 'The Unteachable Young Lady', ages: [7, 12], icon: 'fist', cond: (L) => !L.flags.displaced,
  fire: (L) => { const p = L.people.find(x => x.name === 'Rosalie') || npc(L, { name: 'Rosalie', sur: 'Boreas Greyrat', race: 'human', sex: 'f', age: L.age + 2, op: -20, role: 'other', tags: ['hot-tempered','proud'], noRomance: true, look: { hair: '#a8322a', eyes: '#3f6fa8', skin: '#f3d6c1', style: 2 }, bio: 'The fierce young lady of House Boreas. Hates lessons, loves swords, and punches first.' });
    return card('The Unteachable Young Lady', `Rosalie Boreas Greyrat is ${p.age}, furious, and has sent four tutors home in tears. She throws a book at your head before you finish introducing yourself. Lord Sauros watches from the doorway, laughing.`,
      [C('Challenge her to a sparring match', 'spar'), C('Win her over with a dazzling spell', 'magic', { disabled: bestMagic(L) < 1, hint: 'Needs any magic' }), C('Go along with the household’s staged kidnapping', 'kidnap', { sub: 'Hired “bandits” snatch you both; you lead her home safely' })], { pid: p.id }); },
  resolve: (L, k, d) => {
    const p = person(L, d.pid); adv(L, 'boreas', 2); p.role = 'friend';
    if (k === 'spar') { if (R.chance(clamp(.25 + power(L) / 80, .1, .9))) { relGain(L, p, 45); remember(p, L, 'Beat her in a sparring match'); return 'You dodge, trip her, and she lands on her back staring at the ceiling. Then she grins. “Again.” Lessons start the next day.'; } hurt(L, 8, 'a sparring match'); relGain(L, p, 30); remember(p, L, 'Took her best punch and got back up'); return 'She flattens you. Twice. You get up both times, and that seems to impress her more than winning would have.'; }
    if (k === 'magic') { relGain(L, p, 45); remember(p, L, 'Showed her real magic'); addSkillXp(L, 'magic', 20); return 'Fire, water, and stone dance in the air between you. Her scowl becomes wide-eyed wonder. “Teach me THAT.”'; }
    relGain(L, p, 55); remember(p, L, 'Brought her home from the “kidnappers”'); stress(L, 8); return 'The kidnapping goes wrong in all the right ways. You talk your way out, lead her across the city at night, and bring her home with dirt on both your faces. She never throws a book at you again.';
  } });
ARCEV({ id: 'arc_boreas_3', arc: 'boreas', ch: 3, title: 'Lessons with a Sword King', ages: [8, 13], icon: 'sword', cond: (L) => !L.flags.displaced,
  fire: (L) => { ghislaine(L); return card('Lessons with a Sword King', 'The household guard, Ghislaine Dedoldia, is a Sword King of the Doldia tribe. She can cut a falling leaf into four pieces. She cannot read her own name. Lord Sauros suggests a trade.', [C('Teach her to read in exchange for sword lessons', 'trade'), C('Keep your focus on magic', 'magic')]); },
  resolve: (L, k) => {
    const g = L.people.find(p => p.name === 'Ghislaine'); adv(L, 'boreas', 3);
    if (k === 'trade') { g.role = 'mentor'; relGain(L, g, 30); remember(g, L, 'Taught her to read'); unlock(L, 'mentor_found'); const x = addSkillXp(L, L.sword.styleChosen ? 'sg' : 'fund', 70); grow(L, 'int', .4); return `Every morning she drills you until your legs give out; every evening you sound out letters together. +${x} sword XP. By winter she reads you a whole page, beaming.`; }
    g.role = 'friend'; relGain(L, g, 10); addSkillXp(L, 'magic', 50); return 'Ghislaine shrugs and goes back to the training yard. You spend the year buried in spellbooks.';
  } });
ARCEV({ id: 'arc_boreas_4', arc: 'boreas', ch: 4, title: 'A Tenth Birthday', ages: [9, 14], icon: 'star', cond: (L) => !L.flags.displaced,
  fire: (L) => card('A Tenth Birthday', 'The household celebrates Rosalie’s birthday with dancing lessons, sweets, and a real sword from Ghislaine. Everyone is waiting to see what you brought.', [C('A ring sculpted with earth magic', 'ring', { disabled: rankOf(L, 'earth') < 1, hint: 'Needs earth magic' }), C('A handwritten book of every lesson so far', 'book'), C('Teach her a spell of her own', 'spell', { disabled: bestMagic(L) < 2, hint: 'Needs Intermediate magic' })]),
  resolve: (L, k) => {
    const p = L.people.find(x => x.name === 'Rosalie'); if (p) { relGain(L, p, 25); remember(p, L, 'Gave her a birthday gift she treasured'); }
    earn(L, 'ghislaine_drills', 'The Sword King’s drills live in your legs now.');
    L.flags.fittoaDoom = 1;
    finishArc(L, 'boreas', 'arc_boreas');
    return `${k === 'ring' ? 'She wears the stone ring on a chain around her neck.' : k === 'book' ? 'She pretends to be bored by the book and reads it every night.' : 'Her first spell is a tiny, crooked flame. She refuses to let anyone blow it out.'} Late that night, the sky over Fittoa glows faintly white, just for a moment. Nobody else seems to notice.`;
  } });

/* ---------- THE DISPLACEMENT INCIDENT (chapter I is the random event “displacement”) ---------- */
ARCEV({ id: 'arc_disp_2', arc: 'displaced', ch: 2, title: 'Stranded', ages: [5, 120], icon: 'flame', cond: (L) => !!L.flags.displaced,
  fire: (L) => { const t = TOWN[L.town];
    if (t.cont === 'demon') return card('Stranded', `You wake shivering on red earth near ${t.name}. The sky is the wrong color and the plants have teeth. At dusk, wolves circle your little fire. Then a tall warrior with emerald hair, a white spear, and a red gem on his forehead steps into the light, and the wolves scatter. Travelers on the road behind you scream one word: “Superd!”`, [C('Trust the warrior', 'trust'), C('Refuse his help and go alone', 'alone')]);
    return card('Stranded', `You wake in the dust outside ${t.name} with nothing but the clothes you fell asleep in. Nobody here has heard of Fittoa. A caravan master looks you over, sighs, and offers you a seat on a wagon heading for the coast.`, [C('Ride with the caravan', 'caravan'), C('Strike out alone', 'alone')]); },
  resolve: (L, k) => {
    adv(L, 'displaced', 2);
    if (k === 'trust') { const r = ruijerd(L); r.role = 'party'; r.power = 45; relGain(L, r, 25); remember(r, L, 'Trusted him when everyone else ran'); earn(L, 'superd_trust', 'He teaches you to feel danger before it arrives.'); unlock(L, 'superd'); partyChecks(L);
      return 'His name is Ruijerd. He was a child-protector long before you were born, and he decides on the spot that you are his to protect. “We will get you home.”'; }
    if (k === 'caravan') { stress(L, -5); return 'The caravan is slow, dusty, and safe. The cook slips you extra bread every night.'; }
    const d = hurt(L, R.i(10, 20), 'the wilds'); grow(L, 'agi', .5); stress(L, 10); return `You survive on your own, barely (−${d} health). You learn more about staying alive in a month than in your whole life before.`;
  } });
ARCEV({ id: 'arc_disp_3', arc: 'displaced', ch: 3, title: 'Coin for the Road', ages: [5, 120], icon: 'coin', cond: (L) => !!L.flags.displaced,
  fire: (L) => { const rj = L.people.some(p => p.alive && p.name === 'Ruijerd' && p.role === 'party');
    return card('Coin for the Road', `The way home crosses oceans, and passage costs money you don’t have.${rj ? ' Ruijerd suggests the Adventurer Guild. He will vouch for you; nobody argues with a Superd.' : ' The local Adventurer Guild takes anyone who can carry a weapon.'}`, [C('Register and take quests', 'guild'), C('Work any odd job you can find', 'work'), C('Perform magic on street corners', 'magic', { disabled: bestMagic(L) < 1, hint: 'Needs any magic' })]); },
  resolve: (L, k) => {
    adv(L, 'displaced', 3); const rj = L.people.some(p => p.alive && p.name === 'Ruijerd' && p.role === 'party');
    if (k === 'guild') { if (!L.guild.reg) { L.guild.reg = true; unlock(L, 'guild_reg'); } L.guild.pts += 12; money(L, 45); fame(L, 8); refreshBoards(L);
      return rj ? 'You name your party Dead End, after the rumors about Ruijerd. People flinch at the name, then pay you anyway. Within months, Dead End is the talk of every guild hall around. +45 gold.' : 'You take every F-rank job on the board until the receptionist knows you by name. +45 gold.'; }
    if (k === 'work') { money(L, 25); grow(L, 'str', .5); stress(L, 8); return 'You wash dishes, haul nets, and sweep stables. Your purse fills slowly. +25 gold.'; }
    money(L, 35); fame(L, 4); addSkillXp(L, 'magic', 20); return 'Crowds gather to watch a child make water dance. Coins rain into your hat. +35 gold.';
  } });
ARCEV({ id: 'arc_disp_4', arc: 'displaced', ch: 4, title: 'Across the Sea', ages: [5, 120], icon: 'drop', cond: (L) => !!L.flags.displaced, skip: (L) => ['millis','central'].includes(TOWN[L.town].cont),
  fire: (L) => card('Across the Sea', 'You reach the port at last. The Sea Folk rule the crossing: no ship carries passengers without their permit, and the permit costs more than you have saved.', [C('Pay for proper passage (40 gold)', 'pay', { disabled: L.gold < 40, hint: 'Needs 40 gold' }), C('Find a smuggler', 'smuggle'), C('Heal the Sea Folk captain’s sick crew', 'heal', { disabled: rankOf(L, 'heal') < 1, hint: 'Needs healing magic' })]),
  resolve: (L, k) => {
    adv(L, 'displaced', 4);
    let msg = '';
    if (k === 'pay') { money(L, -40); msg = 'The crossing is calm. You stand at the rail for hours, watching the old continent shrink.'; }
    else if (k === 'heal') { addSkillXp(L, 'heal', 40); fame(L, 5); msg = 'You spend three days healing a fevered crew. The grateful captain carries you across free, and the Sea Folk remember your name.'; }
    else { if (R.chance(.55)) msg = 'The smuggler’s boat leaks, the captain drinks, and somehow you arrive.'; else { const d = hurt(L, R.i(10, 22), 'a smuggler’s betrayal'); money(L, -L.gold * .5); msg = `The smugglers rob you halfway across and dump you on the beach (−${d} health, half your gold).`; } }
    L.town = 'zant'; if (!L.towns.includes('zant')) L.towns.push('zant'); if (!L.visited.includes('millis')) L.visited.push('millis'); refreshBoards(L);
    return msg + ' You land at Port Zant, on the Millis Continent.';
  } });
ARCEV({ id: 'arc_disp_5', arc: 'displaced', ch: 5, title: 'The Search Party', ages: [5, 120], icon: 'people', cond: (L) => !!L.flags.displaced && TOWN[L.town].cont === 'millis',
  fire: (L) => { const lost = L.people.find(p => p.alive && p.lost && p.role === 'father') || L.people.find(p => p.alive && p.lost && p.role === 'mother');
    if (lost) return card('The Search Party', `In Millishion, a notice board is covered in names: the Fittoa Search Party, listing the missing and the found. The name at the top, as leader, is ${lost.name}. You find them in a tavern, thinner, unshaven, a bottle in hand. They look up and the bottle slips from their fingers.`, [C('Run to them', 'run'), C('Shout at them for drinking while you were lost', 'shout'), C('Stand there, unable to speak', 'freeze')], { pid: lost.id });
    return card('The Search Party', 'In Millishion, a notice board is covered in names: the Fittoa Search Party, listing the missing and the found. You search the lists for your family’s names for a long time.', [C('Add your own name to the found', 'add')]); },
  resolve: (L, k, d) => {
    adv(L, 'displaced', 5); L.town = 'millishion'; if (!L.towns.includes('millishion')) L.towns.push('millishion'); refreshBoards(L);
    const p = d.pid && person(L, d.pid);
    if (!p) { stress(L, 5); return 'You write your name in careful letters. If anyone is looking, they will know you are alive.'; }
    p.lost = false;
    if (k === 'run') { relGain(L, p, 35); remember(p, L, 'Found you in Millishion'); stress(L, -25); return `${p.name} holds you so tightly you can’t breathe, and neither of you cares. They have searched every port on two continents.`; }
    if (k === 'shout') { relGain(L, p, 10); stress(L, -10); remember(p, L, 'Argued, then made up, in a Millishion tavern'); return `The argument is loud, ugly, and necessary. By the end of the night, ${p.name} has poured the bottle into the gutter and you are both crying.`; }
    relGain(L, p, 25); stress(L, -15); return `${p.name} crosses the room and kneels in front of you. Neither of you says anything for a long time. Neither of you needs to.`;
  } });
function finishDisplaced(L) {
  if (arcStage(L, 'displaced') >= 99) return '';
  earn(L, 'displaced_survivor', 'You made it home across the world.'); unlock(L, 'displaced');
  let extra = '';
  if (L.people.some(p => p.alive && p.name === 'Ruijerd' && p.role === 'party')) { earn(L, 'dead_end_legend', 'Dead End is a legend on two continents.'); extra = ' Ruijerd stands beside you at the ruined village gate. “You’re home,” he says, and for once he smiles.'; }
  L.arc.displaced = 99; L.arcYear.displaced = L.age; log(L, 'Story complete: The Displacement Incident.', 'big');
  return extra;
}

/* ---------- RANOA UNIVERSITY ---------- */
ARCEV({ id: 'arc_ranoa_1', arc: 'ranoa', ch: 1, title: 'The Special Students', ages: [11, 200], icon: 'hat', cond: (L) => L.edu.school === 'ranoa',
  fire: (L) => { canonNpc(L, { name: 'Zanoba', sur: 'Shirone', race: 'human', sex: 'm', age: Math.max(19, L.age + 4), op: 10, role: 'other', job: 'Third prince of Shirone', tags: ['curious','loyal'], look: { hair: '#3b2a20', eyes: '#5b3a24', skin: '#e8c0a1', style: 0 }, bio: 'A prince of Shirone and a Divine Child cursed with monstrous strength. Breaks doorknobs, dishes, and occasionally people by accident. Would trade his crown for the perfect figurine.' });
    canonNpc(L, { name: 'Cliff', sur: 'Grimoire', race: 'human', sex: 'm', age: Math.max(11, L.age), op: -5, role: 'other', job: 'Priest prodigy of the Millis church', tags: ['proud','serious'], look: { hair: '#c9a25b', eyes: '#3f6fa8', skin: '#f3d6c1', style: 1 }, bio: 'Grandson of a Millis cardinal and a genuine genius of magic. Insufferably proud. Secretly lonely.' });
    return card('The Special Students', 'Ranoa’s special-student classroom holds the people too strange for the regular ones. A towering prince of Shirone, Zanoba, crushes a doorknob by accident and begs to see any figurines you have made. A sharp-tongued priest prodigy, Cliff Grimoire, announces he will surpass everyone in the room by spring.', [C('Sculpt a figurine for Zanoba', 'fig', { disabled: rankOf(L, 'earth') < 1, hint: 'Needs earth magic' }), C('Accept Cliff’s challenge to a spell duel', 'duel'), C('Keep to yourself and study', 'study')]); },
  resolve: (L, k) => {
    adv(L, 'ranoa', 1); const z = L.people.find(p => p.name === 'Zanoba'), c = L.people.find(p => p.name === 'Cliff');
    if (k === 'fig') { z.role = 'friend'; relGain(L, z, 50); remember(z, L, 'Made him a figurine he would die for'); return 'Zanoba weeps openly over a palm-sized stone soldier. “Master!” he declares, and will not stop calling you that.'; }
    if (k === 'duel') { c.role = 'rival'; const win = R.chance(clamp(.3 + bestMagic(L) * .1, .1, .9)); relGain(L, c, win ? 15 : 5); remember(c, L, win ? 'Lost a spell duel to you' : 'Beat you in a spell duel'); addSkillXp(L, 'magic', 40); return win ? 'Your spell shatters his barrier. Cliff stares, then demands a rematch tomorrow. And the day after.' : 'Cliff wins by a hair and spends a week gloating. You resolve to wipe the smirk off his face.'; }
    L.read = clamp(L.read + 10, 0, 100); addSkillXp(L, 'magic', 30); return 'You keep your head down. The library at Ranoa is larger than some towns.';
  } });
ARCEV({ id: 'arc_ranoa_2', arc: 'ranoa', ch: 2, title: 'Kings of the Back Halls', ages: [11, 200], icon: 'paw', cond: (L) => L.edu.school === 'ranoa',
  fire: (L) => { canonNpc(L, { name: 'Linia', sur: 'Dedoldia', race: 'beastfolk', sex: 'f', age: Math.max(12, L.age + 1), op: -20, role: 'other', job: 'Student and self-declared dorm boss', tags: ['playful','proud'], noRomance: true, look: { hair: '#7a4a2a', eyes: '#d8a520', skin: '#f0d2b8', style: 5 }, bio: 'A Doldia chieftain’s daughter sent to Ranoa to learn some humility. It is not working.' });
    canonNpc(L, { name: 'Pursena', sur: 'Adoldia', race: 'beastfolk', sex: 'f', age: Math.max(12, L.age + 1), op: -20, role: 'other', job: 'Student and self-declared dorm boss', tags: ['greedy','witty'], noRomance: true, look: { hair: '#8d8d8d', eyes: '#c8902c', skin: '#d6a27e', style: 2 }, bio: 'Linia’s partner in crime from a rival Beastfolk clan. Loves meat, money, and making deals.' });
    return card('Kings of the Back Halls', 'Two Beastfolk students, Linia and Pursena, run the dormitory’s back halls like a pair of bandit queens. They block your hallway and demand tribute: your lunch, your gold, and your respect, in that order.', [C('Stand your ground', 'fight'), C('Pay them off (10 gold)', 'pay', { disabled: L.gold < 10, hint: 'Needs 10 gold' }), C('Out-talk them into a better deal', 'talk')]); },
  resolve: (L, k) => {
    adv(L, 'ranoa', 2); const a = L.people.find(p => p.name === 'Linia'), b = L.people.find(p => p.name === 'Pursena');
    if (k === 'fight') { const ok = R.chance(clamp(.3 + power(L) / 120, .1, .95)); [a, b].forEach(x => { x.role = ok ? 'friend' : 'rival'; relGain(L, x, ok ? 40 : 5); }); fame(L, ok ? 6 : 0); if (!ok) hurt(L, 10, 'a dormitory brawl'); return ok ? 'Two quick spells and they are hanging upside down from the rafters. They declare you the new boss and follow you around for the rest of the term.' : 'They win this round, but you leave marks. The war continues.'; }
    if (k === 'pay') { money(L, -10); [a, b].forEach(x => { x.role = 'friend'; relGain(L, x, 20); }); return 'They take the gold and, oddly, decide they like you. Protection money, apparently, includes protection.'; }
    const ok = R.chance(clamp(.25 + (L.st.cha + L.st.int - 16) * .03, .1, .9)); [a, b].forEach(x => { x.role = 'friend'; relGain(L, x, ok ? 35 : 15); }); return ok ? 'By the end of the conversation they owe YOU money. Pursena looks impressed. Linia looks betrayed.' : 'You talk them to a draw. Grudging respect, all around.';
  } });
ARCEV({ id: 'arc_ranoa_3', arc: 'ranoa', ch: 3, title: 'The Silent Seven Star', ages: [12, 200], icon: 'star', cond: (L) => L.edu.school === 'ranoa' || L.edu.done.includes('ranoa'),
  fire: (L) => { canonNpc(L, { name: 'Nanahoshi', sur: 'Shizuka', race: 'human', sex: 'f', age: Math.max(18, L.age + 2), op: 0, role: 'other', job: 'Researcher known as the Silent Seven Star', tags: ['serious','shy'], look: { hair: '#1c1714', eyes: '#3a2a22', skin: '#f3d6c1', style: 6 }, bio: 'A masked researcher from somewhere no map shows. She has no mana at all, and she is trying to build a way home.' });
    return card('The Silent Seven Star', 'At the top of the research tower lives a masked researcher everyone calls the Silent Seven Star. She has no mana, speaks a language nobody recognizes when she is upset, and is building an enormous summoning circle. She asks for help, very quietly, as if she expects you to say no.', [C('Help with her research', 'help'), C('Ask where she really comes from', 'ask'), C('Leave her alone', 'leave')]); },
  resolve: (L, k) => {
    adv(L, 'ranoa', 3); const n = L.people.find(p => p.name === 'Nanahoshi');
    if (k === 'leave') return 'You leave her to her circles. Some nights the tower windows glow until dawn.';
    n.role = 'friend'; relGain(L, n, k === 'help' ? 30 : 20); remember(n, L, k === 'help' ? 'Helped with her circles' : 'Listened to her story');
    if (k === 'help') { const g = addSkillXp(L, 'summon', 90); grow(L, 'int', .6); return `Weeks of formulas and failed circles. Your understanding of summoning leaps forward (+${g} XP), and she finally takes off her mask to say thank you.`; }
    return 'She hesitates, then tells you about a world without magic, with carriages that run on their own and lights in every window. She does not know how she got here. She is not sure you believe her. You do.';
  } });
ARCEV({ id: 'arc_ranoa_4', arc: 'ranoa', ch: 4, title: 'The Princess’s Council', ages: [12, 200], icon: 'crown', cond: (L) => L.edu.school === 'ranoa' || L.edu.done.includes('ranoa'),
  fire: (L) => { canonNpc(L, { name: 'Ariel', sur: 'Anemoi Asura', race: 'human', sex: 'f', age: Math.max(18, L.age + 2), op: 10, role: 'other', job: 'Second Princess of Asura, in exile', tags: ['witty','proud'], look: { hair: '#efe2b0', eyes: '#3f6fa8', skin: '#f6e2d3', style: 2 }, bio: 'The exiled second princess of Asura. Charming, calculating, and determined to take back the kingdom her brother’s faction stole.' });
    return card('The Princess’s Council', 'Ariel Anemoi Asura, second princess of the richest kingdom in the world, presides over Ranoa’s student council in exile. She invites you to tea, compliments your work, and asks, smiling, whether you would like to sit on her council. Everyone knows it is really her faction.', [C('Join her council', 'join'), C('Politely stay neutral', 'no')]); },
  resolve: (L, k) => {
    adv(L, 'ranoa', 4); const a = L.people.find(p => p.name === 'Ariel');
    if (k === 'join') { a.role = 'friend'; relGain(L, a, 30); remember(a, L, 'Joined her council'); L.flags.arielAlly = 1; earn(L, 'council_officer', 'You sit at the princess’s right hand.'); fame(L, 8); return 'You take a seat at the council table. Ariel squeezes your hand. “We are going to change the world, you and I.”'; }
    relGain(L, a, -5); return 'Ariel’s smile does not waver. “The offer stands. It always will.”';
  } });
ARCEV({ id: 'arc_ranoa_5', arc: 'ranoa', ch: 5, title: 'Commencement', ages: [12, 200], icon: 'hat', cond: (L) => L.edu.done.includes('ranoa'),
  fire: (L) => card('Commencement', 'Graduation day in Sharia. Zanoba cries, Cliff pretends not to, and the whole special-student class throws their hats so high that a wind mage has to bring them down. The headmaster calls your name.', [C('Walk proudly across the stage', 'walk'), C('Give a speech nobody asked for', 'speech')]),
  resolve: (L, k) => { fame(L, 15); if (k === 'speech') { grow(L, 'cha', .6); } ['Zanoba','Cliff','Linia','Pursena','Nanahoshi'].forEach(n => { const p = L.people.find(x => x.name === n && x.alive); if (p) relGain(L, p, 10); });
    finishArc(L, 'ranoa', 'arc_ranoa'); return k === 'speech' ? 'Your speech is too long and everybody cheers anyway.' : 'The applause follows you down the steps and into the rest of your life.'; } });

/* ---------- THE TELEPORT LABYRINTH ---------- */
ARCEV({ id: 'arc_laby_1', arc: 'labyrinth', ch: 1, title: 'A Letter from Begaritt', ages: [15, 200], icon: 'scroll', cond: (L) => L.people.some(p => p.alive && p.lost && isFamily(p)),
  fire: (L) => { const p = L.people.find(x => x.alive && x.lost && isFamily(x)); return card('A Letter from Begaritt', `A letter finally arrives, carried across three continents and stained by every one of them: ${p.name} is alive. ${p.sex === 'f' ? 'She' : 'He'} is sealed inside a giant mana crystal deep in the Teleport Labyrinth near Rapan, on the Begaritt Continent. Whoever guards the crystal has killed every party that tried.`, [C('Set out for Begaritt', 'go'), C('Not yet. You need to be stronger first.', 'wait')], { pid: p.id }); },
  resolve: (L, k, d) => { if (k === 'wait') { L.arcYear.labyrinth = L.age; return 'You put the letter in your pack and train harder than you ever have. Next year.'; } adv(L, 'labyrinth', 1); L.flags.labyTarget = d.pid; return 'You pack before the ink is dry. The labyrinth lies beneath Rapan, on the Begaritt Continent. (Travel to Rapan to continue.)'; } });
ARCEV({ id: 'arc_laby_2', arc: 'labyrinth', ch: 2, title: 'Into the Labyrinth', ages: [15, 200], icon: 'map', cond: (L) => L.town === 'rapan',
  fire: (L) => card('Into the Labyrinth', 'The Teleport Labyrinth is a maze of magic circles that fling you into random rooms. Parties vanish for weeks and come back missing people. Yours goes in at dawn.', [C('Map every circle carefully', 'map'), C('Push forward fast', 'push'), C('Hire a local guide (60 gold)', 'guide', { disabled: L.gold < 60, hint: 'Needs 60 gold' })]),
  resolve: (L, k) => {
    if (k === 'guide') { money(L, -60); adv(L, 'labyrinth', 2); return 'The guide knows the first three floors by heart. You reach the lower depths in a week.'; }
    const ok = k === 'map' ? R.chance(clamp(.35 + L.st.int * .03, .2, .95)) : R.chance(questChance(L, { danger: 70, type: 'labyrinth' }));
    if (ok) { adv(L, 'labyrinth', 2); addSkillXp(L, L.sword.styleChosen ? L.sword.primary : bestElement(L), 60, true); return k === 'map' ? 'Your map of the circles is the first accurate one in decades. The lower depths open before you.' : 'You cut a path down through four floors of monsters. The air grows thick with mana.'; }
    const d = hurt(L, R.i(15, 30), 'the Teleport Labyrinth'); L.arcYear.labyrinth = L.age; return `The circles scatter your party and you barely regroup (−${d} health). You retreat to Rapan to try again next year.`;
  } });
ARCEV({ id: 'arc_laby_3', arc: 'labyrinth', ch: 3, title: 'The Guardian', ages: [15, 200], icon: 'flame', cond: (L) => L.town === 'rapan',
  fire: (L) => { const p = person(L, L.flags.labyTarget); return card('The Guardian', `In the deepest chamber, ${p ? p.name : 'the one you came for'} floats inside a crystal as tall as a house. Coiled around it is a Manatite Hydra: nine heads that regrow when cut and scales that drink magic.`, [C('Burn the stumps so the heads can’t regrow', 'fire', { disabled: rankOf(L, 'fire') < 3, hint: 'Needs Advanced fire magic' }), C('Hold a barrier while your party cuts', 'barrier', { disabled: rankOf(L, 'barrier') < 2, hint: 'Needs Intermediate barrier' }), C('Charge in with everything you have', 'charge')]); },
  resolve: (L, k) => {
    const bonus = k === 'fire' ? 0.3 : k === 'barrier' ? 0.2 : 0;
    const ok = R.chance(clamp(questChance(L, { danger: 95, type: 'labyrinth' }) + bonus, .05, .97));
    if (!ok) { const d = hurt(L, R.i(25, 45), 'the Manatite Hydra'); L.arcYear.labyrinth = L.age; return `The hydra throws you across the chamber (−${d} health). You drag your party out alive. Next year.`; }
    adv(L, 'labyrinth', 3); addSkillXp(L, k === 'fire' ? 'fire' : k === 'barrier' ? 'barrier' : (L.sword.styleChosen ? L.sword.primary : bestElement(L)), 150, true); fame(L, 60);
    const target = person(L, L.flags.labyTarget); if (target) target.lost = false;
    if (!L.earned.includes('laby_conqueror')) { earn(L, 'laby_conqueror', 'You walked out of the labyrinth’s heart alive.'); unlock(L, 'labyrinth'); }
    const guard = L.people.find(p => p.alive && !p.lost && p.id !== L.flags.labyTarget && (p.role === 'father' || p.role === 'mother' || p.role === 'party') && !p.canon);
    if (guard && R.chance(.35)) { guard.alive = false; guard.diedAt = L.age; stress(L, 45 * (1 + pct(L, 'grief'))); log(L, `${guard.name} dies in the Teleport Labyrinth, shielding you.`, 'bad');
      return `The last head lunges for you and ${guard.name} steps into its path. The hydra falls. So does ${guard.name}. You hold ${guard.sex === 'f' ? 'her' : 'him'} on the chamber floor while the crystal cracks open behind you.`; }
    return 'Head after head falls and does not grow back. The hydra collapses, the crystal cracks, and the person inside drops, breathing, into your arms.';
  } });
ARCEV({ id: 'arc_laby_4', arc: 'labyrinth', ch: 4, title: 'What Remains', ages: [15, 200], icon: 'heart',
  fire: (L) => { const p = person(L, L.flags.labyTarget); return card('What Remains', `${p ? p.name : 'The one you rescued'} wakes days later in a Rapan inn. Their eyes are kind and completely empty. They do not remember your name, or their own, or anything at all.`, [C('Bring them home and care for them', 'home'), C('Seek a cure from the Millis church', 'cure')], { pid: L.flags.labyTarget }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); if (p) { relGain(L, p, 20); remember(p, L, 'Rescued from the crystal'); }
    finishArc(L, 'labyrinth', 'arc_labyrinth'); fame(L, 20);
    return k === 'home' ? 'Some days are hard. But one morning, over breakfast, they say your name without being told it, and you have to leave the room for a while.' : 'The priests can do nothing for memory. But the pilgrimage gives you time together, and the person they are becoming is someone you love anyway.'; } });

/* ---------- THE MAN-GOD'S GAME ---------- */
ARCEV({ id: 'arc_mg_1', arc: 'mangod', ch: 1, title: 'The White Void', ages: [10, 9999], icon: 'eye', kind: 'Dream',
  cond: (L) => !L.earned.includes('dragon_mark') && R.chance(.12 * evtMul(L, 'manGod')),
  fire: (L) => card('The White Void', 'You fall asleep and wake somewhere endless and white. A figure stands before you, its face a soft blur, as if someone smudged the paint. It is smiling. “Hello! I’m the Man-God. Don’t be afraid. I’ve been watching you, and I’d like to help.”', [C('Listen to what it has to say', 'listen'), C('Force yourself awake', 'wake')]),
  resolve: (L, k) => { adv(L, 'mangod', 1); if (k === 'wake') { L.manGodNo++; stress(L, 6); return 'You claw your way out of the dream and wake gasping. The smile follows you into the morning.'; } return '“Good. We’ll be friends, I think.” You wake with the strangest feeling that it will be back.'; } });
ARCEV({ id: 'arc_mg_2', arc: 'mangod', ch: 2, title: 'Good Advice', ages: [10, 9999], icon: 'eye', kind: 'Dream', cond: (L) => L.age >= L.arcYear.mangod + 1 && !L.earned.includes('dragon_mark'),
  fire: (L) => card('Good Advice', '“Tomorrow, go to the market and buy the third book from the left on the old peddler’s cart,” says the smiling blur. “Trust me. It will change everything.”', [C('Follow the advice', 'follow'), C('Refuse', 'refuse')]),
  resolve: (L, k) => { adv(L, 'mangod', 2);
    if (k === 'refuse') { L.manGodNo++; if (L.manGodNo >= 3) { earn(L, 'mangod_rejector', 'The white dreams stop.'); unlock(L, 'mangod_no'); } return 'The smile flickers, just for a moment. “Suit yourself.”'; }
    L.manGod++; const g = addSkillXp(L, bestElement(L), 90); L.read = clamp(L.read + 15, 0, 100); return `The book is a lost grimoire. Your magic leaps forward (+${g} XP). It really did help. That is what bothers you.`; } });
ARCEV({ id: 'arc_mg_3', arc: 'mangod', ch: 3, title: 'The Price of Advice', ages: [12, 9999], icon: 'eye', kind: 'Dream', cond: (L) => L.age >= L.arcYear.mangod + 2,
  fire: (L) => L.manGod > 0
    ? card('The Price of Advice', 'The Man-God’s next piece of advice sends you down a particular road at a particular hour. You realize too late that the road was chosen for someone waiting at the end of it.', [C('Fight your way out', 'fight'), C('Run', 'run')])
    : card('The Price of Advice', 'You keep refusing the voice in your dreams. Lately, the smile has stopped being friendly. “You’re no fun at all,” it says. “I wonder what happens to people who are no fun.”', [C('Tell it you’re not afraid', 'brave'), C('Say nothing', 'silent')]),
  resolve: (L, k) => { adv(L, 'mangod', 3);
    if (k === 'brave' || k === 'silent') { stress(L, 10); L.manGodNo++; if (L.manGodNo >= 3 && !L.earned.includes('mangod_rejector')) { earn(L, 'mangod_rejector', 'The white dreams stop.'); unlock(L, 'mangod_no'); } return 'You wake in a cold sweat. Somewhere far away, something very old has noticed that the Man-God is angry with you.'; }
    const d = hurt(L, R.i(20, 40), 'the Man-God’s trap'); stress(L, 20); return k === 'fight' ? `It is an ambush. You survive it, barely (−${d} health). In that night’s dream, the smiling figure says nothing at all.` : `You run, but not fast enough (−${d} health).`; } });
ARCEV({ id: 'arc_mg_4', arc: 'mangod', ch: 4, title: 'The Dragon God’s Offer', ages: [15, 9999], icon: 'flame', cond: (L) => L.age >= L.arcYear.mangod + 1,
  fire: (L) => card('The Dragon God’s Offer', 'A man with silver hair and golden eyes is waiting on the road. Every bird has gone silent. “I am Orsted, the Dragon God. The Man-God has been using you as a piece in his game. Work for me, and I will teach you what he fears, and protect what you love.”', [C('Accept and become his subordinate', 'yes'), C('Refuse. You serve no god.', 'no')]),
  resolve: (L, k) => {
    unlock(L, 'dragon_god');
    if (k === 'yes') { earn(L, 'dragon_mark', 'The Man-God can no longer see you.'); earn(L, 'orsted_subordinate', 'You serve the Dragon God in his long war.'); fame(L, 40); canonNpc(L, { name: 'Orsted', sur: '', race: 'dragon', sex: 'm', age: 1000, op: 20, role: 'mentor', skill: { k: 'ng', r: 7 }, job: 'The Dragon God', tags: ['stern','serious'], look: { hair: '#d9dde0', eyes: '#d8a520', skin: '#f0dccd', style: 0 }, bio: 'The Dragon God, second of the Seven Great Powers. A curse makes nearly everyone fear and hate him on sight. He has been fighting the Man-God for longer than kingdoms have existed.' }); }
    finishArc(L, 'mangod', 'arc_mangod');
    return k === 'yes' ? 'Orsted nods once. “Good.” From that night on, the white dreams never come again.' : '“Then stay out of my way,” he says, and is simply gone.';
  } });

/* ---------- THE ASURA SUCCESSION ---------- */
ARCEV({ id: 'arc_asura_1', arc: 'asura', ch: 1, title: 'A Princess in Exile', ages: [17, 90], icon: 'crown', cond: (L) => L.flags.arielAlly || (L.fame >= 150 && TOWN[L.town].cont === 'central') || L.family.cls >= 3,
  fire: (L) => { canonNpc(L, { name: 'Ariel', sur: 'Anemoi Asura', race: 'human', sex: 'f', age: Math.max(20, L.age), op: 15, role: 'friend', job: 'Second Princess of Asura, in exile', tags: ['witty','proud'], look: { hair: '#efe2b0', eyes: '#3f6fa8', skin: '#f6e2d3', style: 2 }, bio: 'The exiled second princess of Asura, fighting to reclaim the kingdom her brother’s faction stole.' });
    return card('A Princess in Exile', 'Princess Ariel Anemoi Asura needs swords, spells, and people she can trust. Her brother’s faction holds the court in Ars, and every day she waits, they grow stronger. She asks you to escort her home and help her take the throne.', [C('Pledge yourself to her cause', 'yes'), C('Decline. Asuran politics are a snake pit.', 'no')]); },
  resolve: (L, k) => { if (k === 'no') { L.arc.asura = -1; return 'Ariel accepts it gracefully. You hear later that she found others.'; } adv(L, 'asura', 1); const a = L.people.find(p => p.name === 'Ariel'); if (a) { relGain(L, a, 20); remember(a, L, 'Pledged to her cause'); } return 'You kneel. The princess laughs and pulls you up. “Friends don’t kneel. Pack light. We leave tonight.”'; } });
ARCEV({ id: 'arc_asura_2', arc: 'asura', ch: 2, title: 'Knives on the Road', ages: [17, 90], icon: 'sword',
  fire: (L) => card('Knives on the Road', 'In a forest on the road to Ars, the trees themselves seem to attack: snares, poisoned needles, a dozen hired blades. Directing it all is Auber Corbett, a North God Style assassin they call the Northern Emperor.', [C('Fight him head-on', 'fight'), C('Spring his traps before he can use them', 'traps'), C('Shield the princess and hold the line', 'shield', { disabled: rankOf(L, 'barrier') < 2, hint: 'Needs Intermediate barrier' })]),
  resolve: (L, k) => {
    const bonus = k === 'traps' ? (L.st.int + L.st.agi - 16) * .02 : k === 'shield' ? .25 : 0;
    if (R.chance(clamp(questChance(L, { danger: 105, type: 'hunt' }) + bonus, .05, .97))) { adv(L, 'asura', 2); fame(L, 40); addSkillXp(L, L.sword.styleChosen ? L.sword.primary : bestElement(L), 120, true); return 'Auber retreats into the trees with a bow, almost amused. “Not this time, then.” The princess arrives at the gates of Ars untouched.'; }
    const d = hurt(L, R.i(25, 45), 'the Northern Emperor’s blades'); L.arcYear.asura = L.age; return `You survive the ambush, barely (−${d} health), and the party turns back to regroup. Next year.`;
  } });
ARCEV({ id: 'arc_asura_3', arc: 'asura', ch: 3, title: 'The Water God’s Blade', ages: [17, 90], icon: 'drop',
  fire: (L) => card('The Water God’s Blade', 'In Ars, the rival prince has the Water God herself, Reida Reya, standing at his shoulder. The coronation council meets in a month. Ariel needs the nobles on her side, and she needs Reida out of the way.', [C('Challenge the Water God’s champion to a duel', 'duel'), C('Expose the rival faction’s crimes', 'expose'), C('Win over the nobles one by one', 'rally')]),
  resolve: (L, k) => {
    L.town = 'ars'; if (!L.towns.includes('ars')) L.towns.push('ars'); refreshBoards(L);
    const p = k === 'duel' ? questChance(L, { danger: 130, type: 'hunt' }) : k === 'expose' ? clamp(.25 + (L.st.int - 8) * .04, .1, .9) : clamp(.2 + (L.st.cha - 8) * .04 + L.fame / 2000, .1, .9);
    if (R.chance(p)) { adv(L, 'asura', 3); fame(L, 60); return k === 'duel' ? 'Steel rings across the palace yard. When it ends, Reida lowers her blade and laughs. “The princess chose well.” The court notices.' : k === 'expose' ? 'Ledgers, letters, and one terrified accountant: the rival faction’s corruption is laid bare before the whole court.' : 'One dinner at a time, the great houses of Asura come around to Ariel’s side.'; }
    stress(L, 15); if (k === 'duel') hurt(L, R.i(20, 35), 'a duel at court'); L.arcYear.asura = L.age; return 'The rival faction holds firm this year. Ariel squeezes your shoulder. “We have time.”';
  } });
ARCEV({ id: 'arc_asura_4', arc: 'asura', ch: 4, title: 'Coronation', ages: [17, 90], icon: 'crown',
  fire: (L) => card('Coronation', 'Bells ring across Ars. In the great hall, Ariel Anemoi Asura is crowned Queen of Asura. When the ceremony ends, she calls your name before the entire court and asks what reward you would accept.', [C('A knighthood in her service', 'knight'), C('A minor noble title and land', 'title'), C('Only her friendship', 'friend')]),
  resolve: (L, k) => {
    earn(L, 'ariel_knight', 'Knighted by the Queen of Asura.'); fame(L, 200);
    if (k === 'knight') { L.family.cls = Math.max(L.family.cls, 2); money(L, 1000); }
    else if (k === 'title') { L.family.cls = Math.max(L.family.cls, 3); L.flags.noble = 1; money(L, 600); }
    else { const a = L.people.find(p => p.name === 'Ariel'); if (a) relGain(L, a, 40); money(L, 300); }
    finishArc(L, 'asura', 'arc_asura');
    return k === 'knight' ? 'The Queen touches a sword to each of your shoulders. Rise, Knight of Asura. (+1,000 gold)' : k === 'title' ? 'A small estate, a seal, and a title: you are a noble of Asura now. (+600 gold)' : 'The Queen of Asura laughs out loud, in front of everyone, and hugs you. Nobody at court knows what to make of it.';
  } });

/* ---------- THE SNOW SANCTUM ---------- */
ARCEV({ id: 'arc_sanct_1', arc: 'sanctum', ch: 1, title: 'The Gate in the Snow', ages: [8, 80], icon: 'sword', cond: (L) => L.edu.school === 'sanctum',
  fire: (L) => card('The Gate in the Snow', 'A thousand stone steps climb into the snow. At the top, in a hall with no fire, hundreds of swordsmen train in silence. On a balcony above them, the Sword God Gal Farion watches, chin on his fist, looking bored.', [C('Ask to be tested immediately', 'test'), C('Train silently with the others', 'train')]),
  resolve: (L, k) => { adv(L, 'sanctum', 1); const g = addSkillXp(L, 'sg', k === 'test' ? 80 : 60); if (k === 'test') { const d = hurt(L, R.i(5, 12), 'a Sanctum test'); return `The instructor knocks you down eleven times. You get up eleven times. “Acceptable,” he says. (+${g} XP, −${d} health)`; } return `You train until your hands bleed and the snow stops feeling cold. (+${g} XP)`; } });
ARCEV({ id: 'arc_sanct_2', arc: 'sanctum', ch: 2, title: 'Swords of the Sanctum', ages: [8, 80], icon: 'bolt', cond: (L) => L.edu.school === 'sanctum' || L.edu.done.includes('sanctum'),
  fire: (L) => { const r = npc(L, { name: 'Dariusz', sur: 'Vell', role: 'rival', race: 'human', sex: 'm', age: Math.max(10, L.age), op: -25, tags: ['proud','hot-tempered'], skill: { k: 'sg', r: Math.max(2, rankOf(L, 'sg')) }, noRomance: true });
    return card('Swords of the Sanctum', `${r.name} ${r.sur}, the Sanctum’s rising star, decides you are a threat and calls you out in front of the whole hall.`, [C('Accept his duel', 'duel'), C('Suggest you train together instead', 'train')], { pid: r.id }); },
  resolve: (L, k, d) => { adv(L, 'sanctum', 2); const r = person(L, d.pid);
    if (k === 'train') { r.role = 'friend'; relGain(L, r, 40); addSkillXp(L, 'sg', 70); return 'He scoffs, then shows up at dawn the next day. And every day after. Rivals make the best training partners.'; }
    if (R.chance(clamp(.3 + (rankOf(L, 'sg') - r.skill.r) * .15 + power(L) / 300, .1, .9))) { relGain(L, r, 15); fame(L, 10); addSkillXp(L, 'sg', 60); return 'One exchange. His sword spins into a snowbank. The hall goes very quiet.'; }
    hurt(L, R.i(8, 16), 'a Sanctum duel'); addSkillXp(L, 'sg', 40); return 'He wins, but only just. You learn more from that loss than from a month of drills.'; } });
ARCEV({ id: 'arc_sanct_3', arc: 'sanctum', ch: 3, title: 'The Sword God’s Eye', ages: [10, 80], icon: 'crown', cond: (L) => rankOf(L, 'sg') >= 3,
  fire: (L) => card('The Sword God’s Eye', `Gal Farion stops beside you in the training yard for the first time. “You. Again.” He draws. The duel lasts exactly three strikes, and you will remember every one of them for the rest of your life.`, [C('Attack with everything you have', 'attack'), C('Watch and learn', 'watch')]),
  resolve: (L, k) => { const g = addSkillXp(L, 'sg', k === 'attack' ? 180 : 140); fame(L, 25); if (k === 'attack') hurt(L, R.i(10, 20), 'the Sword God'); finishArc(L, 'sanctum', 'arc_sanctum');
    return k === 'attack' ? `You land nothing. He nods anyway. “Better than most.” (+${g} XP)` : `You see the shape of something impossibly fast and file it away forever. (+${g} XP)`; } });

/* ---------- LAPLACE'S SHADOW ---------- */
ARCEV({ id: 'arc_lap_1', arc: 'laplace', ch: 1, title: 'The Dragon God’s Warning', ages: [20, 9999], icon: 'flame', cond: (L) => power(L) >= 170 && (L.earned.includes('dragon_mark') || L.earned.includes('orsted_subordinate') || L.earned.includes('seven_powers')),
  fire: (L) => card('The Dragon God’s Warning', `Orsted finds you, as he always does, without warning. “${META.world.laplaceDone ? `Laplace was sealed in the year ${META.world.laplaceDone.year}, not destroyed. In eighty years he returns again.` : 'In eighty years, the Demon God Laplace returns.'} The Man-God wants him to win. I need people who will still matter then, and people whose children will.”`, [C('Swear to prepare', 'yes'), C('Ask why he trusts you', 'why')]),
  resolve: (L, k) => { adv(L, 'laplace', 1); fame(L, 30); const lw = META.world.laplaceDone; if (lw && L.year > lw.year) { META.world.laplaceDone = null; META.world.laplaceYear = L.year + 80; } else if (!META.world.laplaceYear) META.world.laplaceYear = L.year + 80; return k === 'why' ? '“I don’t,” he says. “But you’re the best I have.” From Orsted, that is almost a compliment.' : 'You swear it. Orsted does not smile, but something in his shoulders eases.'; } });
ARCEV({ id: 'arc_lap_2', arc: 'laplace', ch: 2, title: 'An Alliance for the Future', ages: [20, 9999], icon: 'people', cond: (L) => L.fame >= 250 || L.gold >= 3000,
  fire: (L) => card('An Alliance for the Future', 'Preparing for a war eighty years away means persuading people who will not live to see it. Guild masters, kings, merchant princes, and at least one Immortal Demon Lord who mostly wants to party.', [C('Spend gold to fund schools and guilds (1,000 gold)', 'gold', { disabled: L.gold < 1000, hint: 'Needs 1,000 gold' }), C('Spend your fame and favors', 'fame')]),
  resolve: (L, k) => { adv(L, 'laplace', 2); if (k === 'gold') { money(L, -1000); fame(L, 80); return 'Scholarships, armories, and a dozen new guild halls bear your name.'; } fame(L, 40); stress(L, 10); return 'Every favor you have ever been owed, called in at once. It is exhausting. It works.'; } });
ARCEV({ id: 'arc_lap_3', arc: 'laplace', ch: 3, title: 'The Long Preparation', ages: [30, 9999], icon: 'scroll', cond: (L) => L.people.some(p => p.role === 'child') || L.age >= 60,
  fire: (L) => card('The Long Preparation', 'You will likely not see the war. But you can make sure those who come after you are ready. You begin writing down everything you know.', [C('Write it all down for your bloodline', 'write')]),
  resolve: (L) => { META.lp += 250; finishArc(L, 'laplace', 'arc_laplace', '+250 Legacy Points.'); return 'Three volumes, bound in leather, sealed for your descendants. The last page says only: be ready.'; } });
