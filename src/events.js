/* ===================== EVENTS ===================== */
const EVENTS = [];
function EV(o) { EVENTS.push(Object.assign({ w: 1, once: true, ages: [0, 9999], cond: () => true, icon: 'scroll' }, o)); }
const card = (title, text, choices, data, icon) => ({ title, text, choices, data: data || {}, icon });
const C = (t, k, o) => Object.assign({ t, k }, o || {});
const parentOf = (L) => L.people.find(p => p.alive && (p.role === 'mother' || p.role === 'father')) || L.people.find(p => p.alive && p.role === 'guardian');
const inTag = (L, t) => TOWN[L.town].tags.includes(t);
const inCont = (L, c) => TOWN[L.town].cont === c;
const isDemonRace = (L) => ['demonkin','migurd','superd'].includes(L.race);
const kidAdult = (L, kid, adult) => L.age < 15 ? kid : adult;

/* ---------- early childhood ---------- */
EV({ id: 'first_steps', title: 'First steps', ages: [1, 1], w: 6, icon: 'sun',
  fire: (L) => { const p = parentOf(L); grow(L, 'agi', 0.6); return `You take your first wobbly steps${p ? ' toward ' + p.name : ''}, then sit down hard and laugh.`; } });
EV({ id: 'sibling_born', title: 'A new sibling', ages: [1, 8], w: 3, once: false, cond: (L) => L.flags.youngerSib > 0 && L.people.some(p => p.alive && p.role === 'mother'),
  fire: (L) => { L.flags.youngerSib = R.chance(.4) ? 1 : 0; const s = npc(L, { role: 'sibling', age: 0, sur: L.sur, op: R.i(30, 60), met: L.age }); return `Your ${s.sex === 'f' ? 'little sister' : 'little brother'} ${s.name} is born.`; } });
EV({ id: 'fever', title: 'Fever', ages: [0, 6], w: .8, once: false, icon: 'drop',
  fire: (L) => { if (pct(L, 'sick') < 0 && R.chance(.6)) return 'A fever goes around the village. You shrug it off.'; const d = hurt(L, R.i(6, 14), 'a childhood fever'); const p = parentOf(L); return `A fever keeps you in bed for a week (−${d} health).${p ? ' ' + p.name + ' barely sleeps.' : ''}`; } });
EV({ id: 'magic_book', title: 'A book on the high shelf', ages: [1, 5], w: 3, icon: 'book', cond: (L) => L.flags.books || L.family.wealth >= 2,
  fire: (L) => card('A book on the high shelf', 'You climb onto a chair and pull down a heavy book. The cover reads: Beginner’s Guide to Magic.', [C('Read it in secret', 'read'), C('Show your parents', 'show'), C('Use it as a step stool', 'stool')]),
  resolve: (L, k) => {
    if (k === 'read') { L.read = clamp(L.read + 15, 0, 100); L.flags.books = 1; const g = addSkillXp(L, R.pick(['water','fire','earth','wind']), 30); chantProgress(L, 1.5); return `You sound out the words night after night. Your first spell fizzles, then works. +${g} magic XP.`; }
    if (k === 'show') { const p = parentOf(L); if (p) relGain(L, p, 10); L.read = clamp(L.read + 8, 0, 100); L.flags.books = 1; return `${p ? p.name : 'Your guardian'} laughs and reads it to you every night.`; }
    grow(L, 'agi', .3); return 'You reach the cookie jar. It is a great day.';
  } });
EV({ id: 'tutor_arrives', title: 'Your parents hire a tutor', ages: [2, 5], w: 6, icon: 'hat', cond: (L) => BG[L.bg].ex.tutor || (L.order === 'only' && L.family.wealth >= 2 && R.chance(.5)) || (L.mana.revealed && L.family.wealth >= 1 && R.chance(.4)),
  fire: (L) => card('A tutor for the family', 'Your parents decide you need a proper teacher. What should the tutor teach?', [C('Water magic', 'water'), C('Fire magic', 'fire'), C('Earth magic', 'earth'), C('Swordsmanship', 'wg', { disabled: L.age < 4, hint: 'From age 4' })]),
  resolve: (L, k) => { L.family.funds += 60; return actHireTutor(L, k); } });
EV({ id: 'hearth_story', title: 'A story by the fire', ages: [3, 8], w: 1.5, icon: 'flame',
  fire: (L) => card('A story by the fire', `${(parentOf(L) || { name: 'The matron' }).name} tells a story about the Laplace War, when demons and humans fought for centuries.`, [C('Ask about the green-haired demons', 'superd'), C('Ask about the strongest people alive', 'seven'), C('Fall asleep', 'sleep')]),
  resolve: (L, k) => {
    if (k === 'superd') { L.flags.knowsSuperd = 1; return 'They say the Superd were cursed during the war and that their spears drank blood. You wonder if that is the whole story.'; }
    if (k === 'seven') { L.flags.knowsSeven = 1; return 'You learn about the Seven Great Powers, ranked above all others. The Dragon God sits near the top. You decide you will be on that list someday.'; }
    stress(L, -5); return 'You drift off warm and safe.';
  } });
EV({ id: 'mana_burst', title: 'Mana burst', ages: [1, 6], w: 3, icon: 'drop', cond: (L) => L.mana.cap >= 300,
  fire: (L) => { L.mana.revealed = true; const p = parentOf(L); if (p) relGain(L, p, 5); return `You sneeze and a wall of water bursts across the room. ${p ? p.name + ' stares at you, then at the soaked ceiling.' : ''} Your talent is no secret anymore.`; } });
EV({ id: 'neighbor_kid', title: 'The kid by the big tree', ages: [4, 9], w: 3, icon: 'tree',
  fire: (L) => { const p = npc(L, { role: 'other', age: L.age, op: 5, tags: ['shy','gentle'], race: R.chance(.6) ? 'human' : 'elf', look: { hair: '#9cc7a4', eyes: '#4d8a5a', skin: '#f3d6c1', style: 2 } });
    return card('The kid by the big tree', `Three older kids are throwing mud at a quiet child with pale green hair. The kid, ${p.name}, curls up and says nothing.`, [C('Step in and stop them', 'help'), C('Use magic to scare them off', 'magic', { disabled: bestMagic(L) < 1, hint: 'Needs any magic' }), C('Walk past', 'walk')], { pid: p.id }); },
  resolve: (L, k, d) => {
    const p = person(L, d.pid);
    if (k === 'walk') { p.role = 'other'; return 'You keep walking. It bothers you more than you expected.'; }
    p.role = 'friend'; relGain(L, p, 40);
    if (k === 'magic') { addSkillXp(L, 'magic', 10); return `A burst of water sends the bullies running. ${p.name} looks at you like you hung the moon. You have a friend.`; }
    hurt(L, R.i(3, 8), 'a scuffle'); grow(L, 'str', .3);
    return `You get a split lip, but the bullies leave. ${p.name} walks home with you and becomes your best friend.`;
  } });
EV({ id: 'pet', title: 'A stray follows you home', ages: [3, 14], w: 1, icon: 'paw',
  fire: (L) => card('A stray follows you home', 'A scruffy dog has followed you for three streets and sits on your doorstep, wagging.', [C('Keep it', 'keep'), C('Give it to a neighbor', 'give')]),
  resolve: (L, k) => { if (k === 'keep') { L.flags.pet = R.pick(['Biscuit','Ash','Pepper','Rook','Bramble','Moss']); stress(L, -10); return `You name it ${L.flags.pet}. It sleeps at the foot of your bed from then on.`; } return 'The neighbor’s kids are delighted.'; } });
EV({ id: 'parent_sword', title: 'A wooden sword', ages: [4, 7], w: 5, icon: 'sword', cond: (L) => L.people.some(p => p.alive && ['father','mother'].includes(p.role) && p.skill && STYLE[p.skill.k]),
  fire: (L) => { const p = L.people.find(p => p.alive && ['father','mother'].includes(p.role) && p.skill && STYLE[p.skill.k]); return card('A wooden sword', `${p.name} hands you a small wooden sword. “Let’s see what you’ve got.”`, [C('Train every morning', 'train'), C('You’d rather study magic', 'magic')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); if (k === 'train') { const g = addSkillXp(L, 'fund', 45); relGain(L, p, 12); return `Mornings in the yard become your favorite part of the day. Fundamentals +${g}.`; } relGain(L, p, -5); L.read = clamp(L.read + 8, 0, 100); return `${p.name} looks a little disappointed but lets you go back to your books.`; } });
EV({ id: 'healer_watch', title: 'Watching the healer', ages: [3, 7], w: 5, icon: 'heart', cond: (L) => L.bg === 'healer' || L.people.some(p => p.alive && p.skill && p.skill.k === 'heal' && ['mother','father'].includes(p.role)),
  fire: (L) => { const g = addSkillXp(L, 'heal', 30); return `A farmer comes in with a deep gash. You watch the wound close under a soft light and copy the words under your breath. Healing +${g} XP.`; } });

/* ---------- childhood ---------- */
EV({ id: 'style_choice', title: 'Choose your sword style', milestone: true, ages: [5, 8], w: 0, icon: 'sword', cond: (L) => !L.sword.styleChosen && L.age === styleAge(),
  fire: (L) => card('Choose your sword style', `You are ${L.age}, old enough to commit to a school of swordsmanship. Your fundamentals carry over to the style you pick. You can still learn the others later, more slowly.${L.sword.preset ? ' Your family expects ' + STYLE[L.sword.preset].name + '.' : ''}`,
    STYLES.map(s => C(`${s.name} (${s.phil})`, s.id, { sub: s.note }))),
  resolve: (L, k) => { chooseStyle(L, k); log(L, `You commit to ${STYLE[k].name}.`, 'good'); return `You commit to ${STYLE[k].name}.`; } });
EV({ id: 'chores', title: 'The family needs you', ages: [6, 14], w: 3, once: false, icon: 'basket', cond: (L) => BG[L.bg].ex.chores && L.family.wealth <= 1,
  fire: (L) => card('The family needs you', 'Harvest is behind and your family needs every pair of hands this season.', [C('Work the fields', 'work'), C('Sneak off to train', 'sneak')]),
  resolve: (L, k) => { const p = parentOf(L);
    if (k === 'work') { L.family.funds += 20; grow(L, 'str', .5); stress(L, 6); if (p) relGain(L, p, 8); return 'You work until sunset every day. Your family earns a little extra, and your arms get strong.'; }
    if (p) relGain(L, p, -10); addSkillXp(L, L.sword.styleChosen ? L.sword.primary : (bestMagic(L) > 0 ? bestElement(L) : 'fund'), 25); return 'You slip away to practice. Someone notices, and dinner is very quiet.'; } });
EV({ id: 'school_rival', title: 'A rival appears', ages: [6, 14], w: 2.5, icon: 'bolt', cond: (L) => !!L.edu.school,
  fire: (L) => { const p = npc(L, { role: 'rival', age: L.age, op: -15, tags: ['proud','hot-tempered'] }); return card('A rival appears', `${p.name}, the top student in your class, announces that you are a fraud and challenges you in front of everyone.`, [C('Accept a duel', 'duel'), C('Beat them on the exams', 'exam'), C('Offer a handshake', 'friend')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid);
    if (k === 'duel') { if (R.chance(clamp(0.3 + (power(L) - 12) / 40, .1, .9))) { fame(L, 3); relGain(L, p, 10); return `You win. ${p.name} storms off, but now nods at you in the halls.`; } hurt(L, 6, 'a schoolyard duel'); stress(L, 6); return `${p.name} wins, barely. This isn’t over.`; }
    if (k === 'exam') { L.read = clamp(L.read + 10, 0, 100); grow(L, 'int', .5); return 'You study like your life depends on it and take first place. The look on their face is worth it.'; }
    if (R.chance(.5)) { p.role = 'friend'; p.op = 25; return `${p.name} hesitates, then shakes your hand. You become friendly rivals.`; } return `${p.name} slaps your hand away.`; } });
EV({ id: 'school_prize', title: 'Top marks', ages: [7, 14], w: 1, once: false, icon: 'star', cond: (L) => !!L.edu.school && L.st.int >= 8,
  fire: (L) => { grow(L, 'int', .4); const p = parentOf(L); if (p) relGain(L, p, 6); return 'You earn top marks this term. Your teachers start expecting great things.'; } });
EV({ id: 'magic_accident', title: 'A spell goes wild', ages: [3, 30], w: 1, once: false, icon: 'flame', cond: (L) => bestMagic(L) >= 1, wkey: 'accident',
  fire: (L) => card('A spell goes wild', 'A spell surges out of control and sets the barn roof on fire.', [C('Put it out with water magic', 'water', { disabled: rankOf(L, 'water') < 1, hint: 'Needs water magic' }), C('Run for buckets', 'run'), C('Hide and hope nobody saw', 'hide')]),
  resolve: (L, k) => {
    if (k === 'water') { addSkillXp(L, 'water', 20); return 'You douse the flames in one burst. The owner is too relieved to be angry.'; }
    if (k === 'run') { L.family.funds = Math.max(0, L.family.funds - 15); stress(L, 4); return 'You save most of the barn. Your family pays for the rest.'; }
    stress(L, 10); if (R.chance(.6)) { const p = parentOf(L); if (p) relGain(L, p, -15); return 'Everyone saw. You are grounded for a month.'; } return 'Somehow, nobody saw. You feel awful anyway.'; } });
EV({ id: 'bullies', title: 'Bullies', ages: [5, 12], w: 1.2, icon: 'fist',
  fire: (L) => card('Bullies', 'A gang of older kids corners you and demands your lunch money.', [C('Fight back', 'fight'), C('Talk your way out', 'talk'), C('Run', 'run')]),
  resolve: (L, k) => {
    if (k === 'fight') { if (R.chance(clamp(.3 + (L.st.str - 4) * .06 + bestSword(L) * .1, .1, .9))) { fame(L, 1); return 'You knock the biggest one flat. They never bother you again.'; } hurt(L, R.i(5, 10), 'bullies'); return 'You lose, badly, but you made them work for it.'; }
    if (k === 'talk') { if (R.chance(clamp(.3 + (L.st.cha - 4) * .06, .1, .9))) { grow(L, 'cha', .3); return 'You talk fast enough that they forget why they were angry.'; } money(L, -2); return 'They take your coins anyway.'; }
    grow(L, 'agi', .4); return 'You are faster than all of them.'; } });
EV({ id: 'sibling_rivalry', title: 'Sibling rivalry', ages: [6, 18], w: 1, icon: 'bolt', cond: (L) => L.people.some(p => p.alive && ['sibling','twin'].includes(p.role) && Math.abs(p.age - L.age) <= 4),
  fire: (L) => { const s = L.people.find(p => p.alive && ['sibling','twin'].includes(p.role) && Math.abs(p.age - L.age) <= 4); return card('Sibling rivalry', `${s.name} keeps comparing their progress to yours, loudly, at every dinner.`, [C('Train harder to stay ahead', 'train'), C('Make peace', 'peace')], { pid: s.id }); },
  resolve: (L, k, d) => { const s = person(L, d.pid); if (k === 'train') { addSkillXp(L, L.sword.styleChosen ? L.sword.primary : 'fund', 20); relGain(L, s, -5); stress(L, 5); return 'You push yourself harder. The rivalry makes you both better.'; } relGain(L, s, 20); return `You and ${s.name} end up laughing about it. You are closer than ever.`; } });
EV({ id: 'twin_bond', title: 'Twin bond', ages: [3, 12], w: 1, icon: 'heart', cond: (L) => L.people.some(p => p.alive && p.role === 'twin'),
  fire: (L) => { const t = L.people.find(p => p.role === 'twin'); relGain(L, t, 12); stress(L, -6); return `You and ${t.name} invent a secret language nobody else understands.`; } });
EV({ id: 'hardship', title: 'A bad year', ages: [4, 18], w: .8, once: false, icon: 'drop', cond: (L) => L.family.wealth <= 1,
  fire: (L) => card('A bad year', 'The harvest fails and your family’s savings run thin.', [C('Take odd jobs to help', 'help', { disabled: L.age < 8, hint: 'From age 8' }), C('Skip meals so the little ones eat', 'skip'), C('Keep your head down', 'none')]),
  resolve: (L, k) => { L.family.funds = Math.max(0, L.family.funds * 0.6);
    if (k === 'help') { L.family.funds += 25; stress(L, 8); const p = parentOf(L); if (p) relGain(L, p, 12); return 'You run errands and haul water. It helps more than you know.'; }
    if (k === 'skip') { hurt(L, 8, 'hunger'); L.people.filter(p => p.role === 'sibling').forEach(p => relGain(L, p, 10)); return 'You go hungry for a while. Your siblings never forget it.'; }
    stress(L, 6); return 'It is a hard winter.'; } });
EV({ id: 'parent_war', title: 'Called to war', ages: [4, 16], w: 3, cond: (L) => L.bg === 'military' && L.people.some(p => p.alive && ['father','mother'].includes(p.role)), icon: 'sword',
  fire: (L) => { const p = L.people.find(p => p.alive && ['father','mother'].includes(p.role)); stress(L, 10);
    if (R.chance(.18)) { p.alive = false; stress(L, 25 * (1 + pct(L, 'grief'))); log(L, `${p.name} is sent to the border and does not come back.`, 'bad'); return `${p.name} is called to the front. Months later, a letter comes instead of them.`; }
    relGain(L, p, 15); return `${p.name} is called to the front and returns a year later, thinner and quieter. They hug you for a long time.`; } });
EV({ id: 'demon_prejudice', title: 'Unwelcome', ages: [5, 80], w: 2, once: false, icon: 'fist', cond: (L) => isDemonRace(L) && (inCont(L, 'millis') || inTag(L, 'church')),
  fire: (L) => card('Unwelcome', 'A shopkeeper sees your features and refuses to serve you. People are staring.', [C('Leave quietly', 'leave'), C('Stand your ground', 'stand'), C('Win them over', 'charm')]),
  resolve: (L, k) => { if (k === 'leave') { stress(L, 6); return 'You leave. It stings more than you show.'; }
    if (k === 'stand') { stress(L, -2); if (R.chance(.4)) { hurt(L, 8, 'a street fight'); return 'Words turn into shoving. You walk away bruised but unbowed.'; } return 'You refuse to move until they serve you. They do, eventually.'; }
    if (R.chance(clamp(.25 + (L.st.cha - 8) * .05, .05, .9))) { grow(L, 'cha', .4); return 'By the end of the conversation the shopkeeper is laughing and gives you a discount.'; } stress(L, 8); return 'They are not interested in being won over.'; } });

/* ---------- milestones ---------- */
EV({ id: 'coming_of_age', title: 'Coming of age', milestone: true, ages: [15, 15], w: 0, icon: 'crown', cond: (L) => L.age === 15,
  fire: (L) => { const gift = Math.round(L.family.funds * 0.15); if (gift > 0) { L.family.funds -= gift; money(L, gift); }
    return card('Coming of age', `You turn 15: an adult in the human kingdoms. ${L.people.some(p => p.alive && ['mother','father','guardian'].includes(p.role)) ? 'Your family throws a small celebration' + (gift ? ` and presses ${gift} gold into your hand` : '') + '.' : 'You mark the day alone' + (gift ? `, with the ${gift} gold your family left you` : '') + '.'} Jobs, the guild, and the open road are yours now. What calls to you?`,
      [C('Find steady work', 'work', { sub: 'A head start on job interviews' }), C('Join the Adventurer Guild', 'guild', { sub: 'Training and a little gold' }), C('Keep studying', 'study', { sub: 'A boost to your books' }), C('See the world', 'world', { sub: 'Travel money' })]); },
  resolve: (L, k) => { L.flags.path = k;
    if (k === 'work') { L.flags.workBoost = 1; grow(L, 'cha', .5); return 'You put on your best clothes and start knocking on doors.'; }
    if (k === 'guild') { money(L, 20); addSkillXp(L, L.sword.styleChosen ? L.sword.primary : 'fund', 25); return 'You sharpen your blade and head for the guild hall.'; }
    if (k === 'study') { L.read = clamp(L.read + 15, 0, 100); grow(L, 'int', .6); return 'Your family’s library becomes your second home.'; }
    money(L, 40); return 'You pack a bag and study the maps.'; } });
EV({ id: 'race_coming', title: 'Your people’s coming of age', milestone: true, ages: [16, 999], w: 0, icon: 'crown', cond: (L) => RACE[L.race].coming > 15 && L.age === RACE[L.race].coming,
  fire: (L) => { stress(L, -10); return `You turn ${L.age}, the age your people consider adulthood. Your elders hold a quiet ceremony in your honor.`; } });
EV({ id: 'adult18', title: 'Grown', milestone: true, ages: [18, 999], w: 0, icon: 'heart', cond: (L) => L.age === Math.max(18, RACE[L.race].coming),
  fire: (L) => `You are a grown adult in every land. Dating, marriage, and starting a family are open to you now.` });

/* ---------- adolescence & adulthood ---------- */
EV({ id: 'ranoa_letter', title: 'A letter from Ranoa', ages: [10, 18], w: 6, icon: 'scroll', cond: (L) => !L.edu.done.includes('ranoa') && L.edu.school !== 'ranoa' && (L.mana.cap >= 2500 || L.mana.chantless || bestMagic(L) >= 4),
  fire: (L) => card('A letter from Ranoa', 'A letter sealed with a silver star arrives: Ranoa University of Magic offers you a place in its special-student class, free of charge.', [C('Accept and travel to Sharia', 'go'), C('Decline for now', 'no')]),
  resolve: (L, k) => { if (k === 'no') return 'You tuck the letter away. Maybe someday.'; L.town = 'sharia'; if (!L.visited.includes('central')) L.visited.push('central'); refreshBoards(L); L.edu.school = 'ranoa'; L.edu.yrs = 0; L.edu.free = true; log(L, 'You enroll at Ranoa University as a special student.', 'good'); return 'You travel to the Magic City and enroll as a special student.'; } });
EV({ id: 'sanctum_invite', title: 'An invitation north', ages: [10, 30], w: 4, icon: 'sword', cond: (L) => L.edu.school !== 'sanctum' && ((L.ranks.sg || 0) >= 3 || ['sword_talent','god_swordsman','sword_saint_soul'].some(t => L.traits.includes(t))),
  fire: (L) => card('An invitation north', 'A swordsman in a snow-dusted coat finds you. The Sword Sanctum has heard of you and wants to see you swing.', [C('Go north', 'go'), C('Decline', 'no')]),
  resolve: (L, k) => { if (k === 'no') return 'You decline. The swordsman shrugs and leaves.'; L.town = 'sanctum'; refreshBoards(L); L.edu.school = 'sanctum'; L.edu.yrs = 0; log(L, 'You begin training at the Sword Sanctum.', 'good'); return 'You trek north into the snow and begin training at the Sanctum.'; } });
EV({ id: 'north_wanderer', title: 'A one-armed swordsman', ages: [12, 40], w: .5, icon: 'sword', cond: (L) => !L.people.some(p => p.skill && p.skill.k === 'ng' && p.role === 'mentor'),
  fire: (L) => card('A one-armed swordsman', 'A wandering swordsman with one arm beats three thugs using a chair, a cloak, and a handful of sand. He notices you watching.', [C('Ask him to teach you', 'ask'), C('Keep your distance', 'no')]),
  resolve: (L, k) => { if (k === 'no') return 'He tips his hat and wanders on.'; const p = npc(L, { role: 'mentor', age: R.i(40, 60), op: 25, skill: { k: 'ng', r: 5 }, job: 'Wandering North God Style master', tags: ['witty','stern'], sex: 'm' }); return `${p.name} grins. “There are no dirty tricks, only lost fights.” He becomes your North God Style mentor (King rank).`; } });
EV({ id: 'aura_veteran', title: 'A veteran’s lesson', ages: [15, 40], w: .6, icon: 'bolt', cond: (L) => L.aura.stage >= 1,
  fire: (L) => { L.aura.ctrl = clamp(L.aura.ctrl + 10, 0, 100); auraStageCheck(L); return 'An old soldier shows you how to fold your aura tight instead of letting it leak. Aura control +10.'; } });
EV({ id: 'tavern_brawl', title: 'Tavern brawl', ages: [16, 70], w: .7, once: false, icon: 'fist', wkey: 'fight',
  fire: (L) => card('Tavern brawl', 'Two mercenaries start throwing chairs. One of them aims a chair at you.', [C('Join in', 'fight'), C('Calm everyone down', 'calm'), C('Slip out the back', 'leave')]),
  resolve: (L, k) => {
    if (k === 'fight') { if (R.chance(clamp(.3 + power(L) / 120, .1, .95))) { fame(L, 2); return 'You end the brawl standing on a table. The barkeep pours you a free drink.'; } hurt(L, R.i(6, 14), 'a tavern brawl'); return 'You wake up in the gutter with a black eye.'; }
    if (k === 'calm') { if (R.chance(clamp(.25 + (L.st.cha - 8) * .05, .05, .9))) { grow(L, 'cha', .4); fame(L, 1); return 'You talk both sides down. Everyone buys you a round.'; } hurt(L, 5, 'a flying chair'); return 'A chair hits you mid-sentence.'; }
    return 'You finish your drink outside in peace.'; } });
EV({ id: 'bandits', title: 'Bandits on the road', ages: [15, 80], w: .6, once: false, icon: 'sword',
  fire: (L) => card('Bandits on the road', 'Five bandits step out of the trees and demand everything you carry.', [C('Fight', 'fight'), C('Pay them off', 'pay'), C('Run for it', 'run')]),
  resolve: (L, k) => {
    if (k === 'fight') { const c = questChance(L, { danger: 26, type: 'hunt' }); if (R.chance(c)) { const g = R.i(10, 40); money(L, g); fame(L, 2); addSkillXp(L, L.sword.styleChosen ? L.sword.primary : bestElement(L), 15, true); return `You scatter the bandits and take their purse (+${g} gold).`; } const d = hurt(L, R.i(12, 28), 'bandits'); money(L, -L.gold * .3); return `They overwhelm you (−${d} health) and take a third of your gold.`; }
    if (k === 'pay') { money(L, -L.gold * .4); return 'You hand over most of your coin. They let you go.'; }
    if (R.chance(clamp(.3 + (L.st.agi - 8) * .05, .1, .9))) return 'You outrun them through the trees.'; hurt(L, 10, 'bandits'); money(L, -L.gold * .3); return 'They catch you.'; } });
EV({ id: 'noble_ball', title: 'An invitation to a ball', ages: [12, 70], w: .8, once: false, icon: 'crown', cond: (L) => L.family.cls >= 3 || L.fame >= 150,
  fire: (L) => card('An invitation to a ball', 'Candles, music, and every important family in the realm.', [C('Dance the night away', 'dance'), C('Work the room', 'network'), C('Leave early', 'leave')]),
  resolve: (L, k) => {
    if (k === 'dance') { grow(L, 'cha', .5); if (L.age >= 18) { const r = actMeet(L, 'love'); return 'You dance until your feet hurt. ' + r; } actMeet(L, 'friend'); return 'You dance badly and make a new friend.'; }
    if (k === 'network') { fame(L, 4); L.flags.workBoost = 1; return 'You trade favors and compliments. Doors will open for you.'; }
    stress(L, -5); return 'You slip out to the gardens and enjoy the quiet.'; } });
EV({ id: 'beggar', title: 'A child in the street', ages: [6, 99], w: .5, once: false, icon: 'coin',
  fire: (L) => card('A child in the street', 'A thin child holds out a cup on a cold morning.', [C('Give 5 gold', 'give', { disabled: L.gold < 5, hint: 'Needs 5 gold' }), C('Share your food', 'food'), C('Walk on', 'walk')]),
  resolve: (L, k) => { if (k === 'give') { money(L, -5); L.st.luck += .3; stress(L, -4); return 'The child stares at the coins, then at you, and runs off grinning.'; } if (k === 'food') { stress(L, -3); return 'You share your bread. The child eats it in three bites.'; } return 'You walk on.'; } });
EV({ id: 'found_coins', title: 'Lucky find', ages: [5, 99], w: .7, once: false, icon: 'coin',
  fire: (L) => { const g = Math.round(R.i(3, 15) * (1 + L.st.luck / 20) * (1 + pct(L, 'loot'))); money(L, g); return `You find a pouch of ${g} gold in the gutter.`; } });
EV({ id: 'investment', title: 'A merchant’s pitch', ages: [16, 80], w: .6, once: false, icon: 'coin', cond: (L) => L.gold >= 50,
  fire: (L) => card('A merchant’s pitch', 'A merchant swears that a shipment of spice from Begaritt will double your money by spring.', [C('Invest 50 gold', 'in'), C('Pass', 'pass')]),
  resolve: (L, k) => { if (k === 'pass') return 'You keep your coin.'; money(L, -50); if (R.chance(clamp(.45 + L.st.luck * .01, .1, .9))) { money(L, 110); return 'The spice sells. You get 110 gold back.'; } return 'The ship never arrives. Neither does the merchant.'; } });
EV({ id: 'plague', title: 'Sickness', ages: [3, 99], w: .35, once: false, icon: 'drop',
  fire: (L) => { if (pct(L, 'sick') < 0 && R.chance(.6)) return 'A sickness sweeps through town. You barely notice it.';
    return card('Sickness', 'A wasting sickness sweeps through town, and you wake up burning with fever.', [C('Rest it out', 'rest'), C('Pay a healer 30 gold', 'pay', { disabled: L.gold < 30, hint: 'Needs 30 gold' }), C('Cure yourself with detox magic', 'detox', { disabled: rankOf(L, 'detox') < 2, hint: 'Needs Intermediate detox' })]); },
  resolve: (L, k) => { if (k === 'pay') { money(L, -30); hurt(L, 5, 'sickness'); return 'The healer’s spell burns the sickness out of you.'; } if (k === 'detox') { addSkillXp(L, 'detox', 25); fame(L, 3); return 'You purge it from your blood, then go door to door doing the same for your neighbors.'; } const d = hurt(L, R.i(12, 30), 'sickness'); return `It takes weeks to recover (−${d} health).`; } });
EV({ id: 'stampede', title: 'Monster stampede', ages: [10, 80], w: .5, once: false, icon: 'paw', cond: (L) => TOWN[L.town].size <= 2,
  fire: (L) => card('Monster stampede', 'Horns sound from the watchtower: a stampede of beasts is heading straight for the village.', [C('Hold the gate', 'fight'), C('Help everyone evacuate', 'evac')]),
  resolve: (L, k) => {
    if (k === 'fight') { if (R.chance(questChance(L, { danger: 30, type: 'defense' }))) { fame(L, 8); money(L, 25); return 'You hold the gate until dawn. The village names a bench after you.'; } const d = hurt(L, R.i(15, 30), 'a monster stampede'); return `You are trampled before reinforcements arrive (−${d} health).`; }
    fame(L, 3); grow(L, 'cha', .3); return 'You get everyone out in time. Nobody dies.'; } });
EV({ id: 'war', title: 'War', ages: [15, 70], w: 1, once: false, icon: 'sword', cond: (L) => inTag(L, 'war') || (L.job && ['soldier','mercenary','knight'].includes(L.job.id)),
  fire: (L) => card('War', 'The border erupts into open war. Soldiers march through the streets day and night.', [C('Take up arms', 'fight'), C('Tend the wounded', 'heal', { disabled: rankOf(L, 'heal') < 1, hint: 'Needs healing magic' }), C('Flee the fighting', 'flee')]),
  resolve: (L, k) => {
    if (k === 'flee') { stress(L, 15); return 'You run with the refugees. You are safe, and ashamed of how relieved you feel.'; }
    if (k === 'heal') { addSkillXp(L, 'heal', 60); fame(L, 6); stress(L, 15); if (earn(L, 'war_veteran')) unlock(L, 'war_vet'); return 'You work in the field hospital for months. You save more lives than you can count.'; }
    const c = questChance(L, { danger: 40, type: 'defense' });
    if (R.chance(c)) { fame(L, 12); money(L, 60); addSkillXp(L, L.sword.styleChosen ? L.sword.primary : bestElement(L), 50, true); if (earn(L, 'war_veteran')) unlock(L, 'war_vet'); stress(L, 12); return 'You survive the campaign with honors and a sack of pay.'; }
    if (R.chance(.25 * (1 - pct(L, 'deathSave')))) { L.hp = 0; L.deathCause = 'killed in battle'; return 'You fall in battle.'; }
    const d = hurt(L, R.i(20, 40), 'war wounds'); if (earn(L, 'war_veteran')) unlock(L, 'war_vet'); return `You survive, barely (−${d} health).`; } });
EV({ id: 'assassin', title: 'Knife in the dark', ages: [6, 90], w: .25, once: false, icon: 'fist', wkey: 'assassin', cond: (L) => BG[L.bg].ex.assassins || pct(L, 'x') || L.traits.includes('archmage_blood') || L.fame >= 400,
  fire: (L) => card('Knife in the dark', 'You wake to a shadow at your bedside and the glint of a blade.', [C('Fight', 'fight'), C('Shout for the guards', 'shout'), C('Roll out the window', 'flee')]),
  resolve: (L, k) => {
    const c = k === 'fight' ? questChance(L, { danger: 30, type: 'hunt' }) : k === 'shout' ? .6 : clamp(.3 + L.st.agi * .03, .1, .9);
    if (R.chance(c)) { fame(L, 3); return k === 'fight' ? 'You disarm the assassin. Whoever sent them will try again.' : 'You escape. The assassin vanishes into the night.'; }
    if (R.chance(.15 * (1 - pct(L, 'deathSave'))) && L.age >= 15) { L.hp = 0; L.deathCause = 'assassinated'; return 'The blade finds its mark.'; }
    const d = hurt(L, R.i(15, 35), 'an assassin’s blade'); stress(L, 15); return `You survive with a deep wound (−${d} health).`; } });
EV({ id: 'church_recruit', title: 'The church takes interest', ages: [8, 60], w: .4, wkey: 'church', icon: 'heart', cond: (L) => !isDemonRace(L) && (rankOf(L, 'heal') >= 2 || ['holy_vessel','miracle_healer','saint_miracles','pious'].some(t => L.traits.includes(t))),
  fire: (L) => card('The church takes interest', 'A cardinal of the Millis church visits. They have heard of your healing gift and want you to serve the faith.', [C('Serve the church', 'join'), C('Politely refuse', 'no')]),
  resolve: (L, k) => { if (k === 'join') { addSkillXp(L, 'heal', 50); addSkillXp(L, 'barrier', 30); fame(L, 6); L.flags.church = 1; return 'You join the church’s healers. Your skill grows quickly, and so does the church’s claim on your time.'; } return 'The cardinal smiles thinly. “The faith is patient.”'; } });
EV({ id: 'admirer', title: 'A secret admirer', ages: [18, 70], w: .5, once: false, icon: 'heart', wkey: 'admirer', cond: (L) => L.age >= Math.max(18, RACE[L.race].coming) && !L.spouse,
  fire: (L) => card('A secret admirer', 'Someone keeps leaving flowers at your door with unsigned notes.', [C('Wait up to meet them', 'meet'), C('Ignore it', 'ignore')]),
  resolve: (L, k) => { if (k === 'ignore') return 'The flowers stop after a while.'; const r = actMeet(L, 'love'); const p = L.people[L.people.length - 1]; relGain(L, p, 25); return r.replace('At a festival you meet', 'The admirer turns out to be'); } });
EV({ id: 'spirit', title: 'A spirit in the lamplight', ages: [8, 99], w: .4, once: false, icon: 'star', wkey: 'spirit',
  fire: (L) => card('A spirit in the lamplight', 'A small glowing spirit drifts out of your lamp and studies you curiously.', [C('Offer a contract', 'pact'), C('Banish it', 'banish')]),
  resolve: (L, k) => { if (k === 'pact') { if (magicBlock(L, 'summon')) { L.flags.spiritPact = 1; stress(L, -4); return 'The spirit agrees to stay. It hums at night and keeps the bad dreams away.'; } addSkillXp(L, 'summon', 50); return 'The spirit binds itself to you. Summoning +50 XP.'; } return 'It fades with a hurt little flicker.'; } });
EV({ id: 'misfortune', title: 'Bad luck', ages: [6, 99], w: .3, once: false, icon: 'drop', wkey: 'misfortune',
  fire: (L) => { const r = R.i(0, 2); if (r === 0) { money(L, -L.gold * .2); return 'A pickpocket lifts your purse. A fifth of your gold is gone.'; } if (r === 1) { hurt(L, R.i(5, 12), 'a nasty fall'); return 'You slip on wet stairs and land badly.'; } stress(L, 10); return 'Everything goes wrong this month, one small disaster at a time.'; } });
EV({ id: 'family_woe', title: 'Bad news from home', ages: [6, 99], w: .3, once: false, icon: 'drop', wkey: 'familyWoe', cond: (L) => L.people.some(p => p.alive && isFamily(p)),
  fire: (L) => { const p = R.pick(L.people.filter(p => p.alive && isFamily(p))); stress(L, 8 * (1 + pct(L, 'grief'))); return `${p.name} is hurt in an accident. They recover, slowly.`; } });
EV({ id: 'dragon_awaken', title: 'The blood awakens', ages: [12, 60], w: 2, icon: 'flame', cond: (L) => L.traits.includes('dragon_blood') && !L.dragonAwake && (L.hp < maxHp(L) * 0.5 || L.aura.stage >= 2 || L.age >= 20),
  fire: (L) => card('The blood awakens', 'Heat roars through your veins. Scales ripple along your arms, and your heartbeat sounds like distant thunder.', [C('Embrace it', 'yes'), C('Force it back down', 'no')]),
  resolve: (L, k) => { if (k === 'no') { stress(L, 10); return 'You clench your teeth until it fades. It will come back.'; } L.dragonAwake = true; L.st.str += 6; L.st.agi += 4; L.bonusHp = (L.bonusHp || 0) + 40; heal(L, 40); fame(L, 40); return 'Your dragon blood awakens. Strength, agility, and health surge, and every dragon for a hundred miles turns its head.'; } });

/* ---------- canon-flavored rare encounters ---------- */
EV({ id: 'demon_empress', title: 'A hungry empress', ages: [8, 999], w: .25, icon: 'crown',
  cond: (L) => true, wfn: (L) => (inCont(L, 'demon') ? 8 : 1) * (L.town === 'rikarisu' ? 1.6 : 1),
  fire: (L) => card('A hungry empress', `A tiny woman in an extravagant, slightly torn gown staggers out of an alley and collapses in front of you. “I am Kishirika Kishirisu, the Great Emperor of the Demon World,” she announces from the ground, “and I have not eaten in four days.”`,
    [C(L.age < 15 ? 'Share your lunch with her' : 'Buy her a feast (up to 20 gold)', 'feed'), C('Toss her a coin', 'coin'), C('Step around her', 'walk')]),
  resolve: (L, k) => {
    if (k === 'walk') return 'You step around her. Behind you, a stomach growls like thunder.';
    if (k === 'coin') { money(L, -1); L.st.luck += .5; return 'She bites the coin to check it, beams, and disappears toward the nearest bakery.'; }
    if (L.age >= 15) money(L, -Math.min(20, L.gold));
    unlock(L, 'demon_feast'); fame(L, 5);
    const eyes = ['eye_foresight','eye_clairvoyance','eye_manasight','eye_appraisal'];
    const have = (id) => L.traits.includes(id) || L.earned.includes(id);
    if (eyes.every(have)) { stress(L, -10); return 'She eats everything in sight, then frowns at your eyes. “You already have them all! Greedy child.” She pats your head anyway.'; }
    return { text: 'She eats three plates without breathing, then fixes you with a grin. “A meal deserves a reward. Choose an eye!”', next: card('Choose a Demon Eye', 'She plucks a glowing eye from the air like a marble and waits.',
      [C('Eye of Foresight', 'eye_foresight', { sub: TRAIT.eye_foresight.up, disabled: have('eye_foresight') }), C('Eye of Clairvoyance', 'eye_clairvoyance', { sub: TRAIT.eye_clairvoyance.up, disabled: have('eye_clairvoyance') }), C('Eye of Mana Sight', 'eye_manasight', { sub: TRAIT.eye_manasight.up, disabled: have('eye_manasight') }), C('Eye of Appraisal', 'eye_appraisal', { sub: TRAIT.eye_appraisal.up, disabled: have('eye_appraisal') })], { pick: 1 }, 'eye') };
  },
  resolve2: (L, k) => { earn(L, k, 'A gift from the Demon Empress.'); L.mana.revealed = true; return `It stings for a moment, then the world opens. You now have the ${TRAIT[k].name}. Practice mana control to tame the headaches.`; } });
EV({ id: 'superd', title: 'The green-haired warrior', ages: [6, 999], w: .35, icon: 'spear', wfn: (L) => inCont(L, 'demon') ? 6 : 1, cond: (L) => L.race !== 'superd',
  fire: (L) => card('The green-haired warrior', 'A tall warrior with emerald hair, a white spear, and a red gem on his forehead steps between you and a pack of wolves. The townsfolk behind you scream “Superd!” and run.', [C('Trust him', 'trust'), C('Run with the others', 'run'), C('Shout for the guards', 'report')]),
  resolve: (L, k) => {
    if (k === 'run') return 'You run. When you look back, every wolf is dead and the warrior is gone.';
    if (k === 'report') { stress(L, 8); return 'The guards chase him off. He doesn’t fight back. You notice he was protecting you, too late.'; }
    const p = ruijerd(L); if (p.role === 'other') p.role = 'friend'; relGain(L, p, 20); remember(p, L, 'Stood beside him when the town ran');
    L.flags.found_superd_camp = 1;
    earn(L, 'superd_trust', 'He teaches you to feel danger before it arrives.'); unlock(L, 'superd');
    return `You stay. The warrior, Ruijerd, cuts down the pack in seconds. He is gentle with children and hates anyone who harms them. He travels with you for a while.`; } });
EV({ id: 'holy_beast', title: 'Poachers in the forest', ages: [8, 999], w: 3, icon: 'paw', cond: (L) => L.town === 'doldia' || L.town === 'silverleaf',
  fire: (L) => card('Poachers in the forest', 'You find a white pup tangled in a net. Three poachers argue over who gets to sell it. The pup’s eyes glow faintly gold.', [C('Fight the poachers', 'fight'), C('Sneak the pup away', 'sneak'), C('Run to the village for help', 'help')]),
  resolve: (L, k) => {
    const ok = k === 'fight' ? R.chance(questChance(L, { danger: 24, type: 'hunt' })) : k === 'sneak' ? R.chance(clamp(.3 + L.st.agi * .04, .1, .95)) : R.chance(.8);
    if (!ok) { hurt(L, R.i(8, 18), 'poachers'); return 'The poachers catch you. Beastfolk warriors arrive just in time, but the pup is gone and you are bruised.'; }
    earn(L, 'holy_beast_bond', 'The Holy Beast remembers who saved it.'); unlock(L, 'holy_beast'); fame(L, 10);
    L.flags.found_silverleaf = 1;
    return 'The pup is the Holy Beast of the Great Forest. The Beastfolk honor you, and the pup refuses to leave your side.'; } });
EV({ id: 'dragon_god', title: 'The silver-haired man', ages: [15, 999], w: .06, icon: 'flame', wkey: 'dragonGod',
  wfn: (L) => evtMul(L, 'dragon'),
  fire: (L) => card('The silver-haired man', 'A man with silver hair and golden eyes blocks the road. His presence is so terrifying that birds fall silent for a mile. He looks at you as if he’s trying to remember something.', [C('Draw your weapon', 'fight'), C('Speak to him honestly', 'talk'), C('Back away slowly', 'flee')]),
  resolve: (L, k) => {
    if (k === 'flee') { stress(L, 10); return 'He lets you go without a word. Your hands shake for an hour.'; }
    unlock(L, 'dragon_god');
    if (k === 'talk') { const trust = L.manGodNo >= 1 || L.manGod === 0; if (trust) { earn(L, 'dragon_mark', 'The Dragon God marks you as an ally against the Man-God.'); fame(L, 30); return 'The man is Orsted, the Dragon God. When you mention the faceless figure in your dreams, his eyes narrow. “Then we share an enemy.”'; } stress(L, 10); return 'He studies you for a long time. “You smell of the Man-God.” He leaves without another word.'; }
    const surv = clamp(.35 + pct(L, 'deathSave') + power(L) / 1000, .2, .98);
    if (!R.chance(surv)) { L.hp = 0; L.deathCause = 'struck down by the Dragon God'; return 'You never see the blow coming.'; }
    const d = hurt(L, R.i(40, 70), 'a fight with the Dragon God'); earn(L, 'dragon_mark', 'You survived a blow from the Dragon God.'); fame(L, 40);
    return `He breaks you in a single strike (−${d} health), then pauses. “Interesting.” He leaves you alive.`; } });
EV({ id: 'mangod', title: 'A dream of white', kind: 'Dream', ages: [10, 999], w: .5, once: false, icon: 'eye', wkey: 'manGod', cond: (L) => (L.arc.mangod || 0) >= 2 && !L.earned.includes('mangod_rejector') && !L.earned.includes('dragon_mark') && L.manGod < 4,
  fire: (L) => { const v = R.i(0, 2); const adv = ['Go to the market tomorrow and buy the third book from the left.', 'Take the second quest on the guild board tomorrow. Trust me.', 'Lend your savings to the next stranger who asks. It will come back to you.'][v];
    return card('A dream of white', `You stand in an endless white void. A figure with a blurred, smiling face greets you warmly. “I’m the Man-God. I’d like to help you.” Then: “${adv}”`, [C('Follow the advice', 'follow'), C('Refuse', 'refuse')], { v }); },
  resolve: (L, k, d) => {
    if (k === 'refuse') { L.manGodNo++; if (L.manGodNo >= 3) { earn(L, 'mangod_rejector', 'The white dreams stop.'); unlock(L, 'mangod_no'); return 'For the third time, you say no. The smile flickers. You never dream of white again.'; } return 'The figure keeps smiling. “Suit yourself. I’ll be back.”'; }
    L.manGod++;
    if (d.v === 0) { const g = addSkillXp(L, bestElement(L), 60); L.read = clamp(L.read + 15, 0, 100); return `The book is a lost grimoire. Your magic jumps (+${g} XP).`; }
    if (d.v === 1) { money(L, 80); fame(L, 4); return 'The quest goes perfectly. You earn 80 gold and some fame.'; }
    money(L, -L.gold * .5); stress(L, 6); return 'You lend half your savings to a stranger. It has not come back yet.'; } });
EV({ id: 'displacement', title: 'The Sky Turns White', arc: 'displaced', ch: 1, kind: 'Turning Point', ages: [7, 30], w: .6, icon: 'star', wfn: (L) => L.flags.fittoaDoom ? 8 : 1, cond: (L) => inTag(L, 'fittoa') && !L.flags.displacedOnce,
  fire: (L) => { const home = L.town; L.flags.displacedOnce = 1; L.flags.displaced = home; L.arc.displaced = 1; L.arcYear.displaced = L.age;
    const dest = R.pick(TOWNS.filter(t => t.cont !== 'central' && t.cont !== 'heaven' && !['superd_camp','silverleaf'].includes(t.id)));
    L.town = dest.id; if (!L.visited.includes(dest.cont)) L.visited.push(dest.cont);
    L.people.filter(p => p.alive && isFamily(p)).forEach(p => { if (R.chance(.85)) p.lost = true; });
    if (L.job) L.job = null; if (L.edu.school) L.edu.school = null; refreshBoards(L);
    stress(L, 30);
    return card('The Sky Turns White', `A blinding white light swallows the sky over Fittoa. When it fades, you are lying in the dirt in ${dest.name}, on the ${CONT[dest.cont].name}. Your family is nowhere to be seen. The whole region has been scattered across the world.`, [C('Get up and find a way home', 'ok')]); },
  resolve: (L) => 'You don’t know where your family is. You only know which way is home. (Travel back to Fittoa to complete the journey; you can travel at any age while displaced.)' });
EV({ id: 'seven_powers', title: 'One of the Seven', ages: [14, 9999], w: 0, milestone: true, icon: 'crown', cond: (L) => !L.earned.includes('seven_powers') && power(L) >= META.world.seven[6].power,
  fire: (L) => { const pw = power(L); const seats = META.world.seven; let seat = 7; for (let i = 0; i < 7; i++) if (pw >= seats[i].power) { seat = i + 1; break; }
    const old = seats[seat - 1]; seats[seat - 1] = { seat, title: old.title, name: L.name + ' ' + L.sur, power: pw, player: true };
    earn(L, 'seven_powers', `You displace ${old.name} as the ${old.title}.`); unlock(L, 'seven'); fame(L, 200);
    return `Word spreads across every continent: you are now ranked among the Seven Great Powers, seat ${seat}, taking the title of ${old.title} from ${old.name}.`; } });
EV({ id: 'retire', title: 'Retirement', ages: [60, 999], w: .8, once: false, icon: 'sun', cond: (L) => L.job && L.job.yrs >= 1,
  fire: (L) => card('Retirement', `You’ve worked as ${JOB[L.job.id].ladder[L.job.lvl]} for a long time. Your joints suggest it might be time to stop.`, [C('Retire with a pension', 'yes'), C('Keep working', 'no')]),
  resolve: (L, k) => { if (!L.job) return 'You already left work behind.'; if (k === 'yes') { const p = salary(L) * 3; money(L, p); L.job = null; stress(L, -20); return `You retire with a farewell party and a ${p} gold pension.`; } return 'You’re not done yet.'; } });
EV({ id: 'elder_reflection', title: 'Looking back', ages: [55, 9999], w: .5, once: false, icon: 'sun',
  fire: (L) => { stress(L, -10); return `You sit in the sun and think about the long road behind you. ${L.epithet ? 'They still call you “' + L.epithet + '.” ' : ''}It has been a life worth living.`; } });
EV({ id: 'festival', title: 'Festival', ages: [2, 9999], w: .6, once: false, icon: 'sun',
  fire: (L) => { stress(L, -8); return R.pick(['The harvest festival fills the square with music and roasted chestnuts.', 'Lanterns float over the river during the spring festival.', 'A traveling circus comes to town. You don’t sleep for excitement.']); } });
EV({ id: 'guild_rescue', title: 'A party in trouble', ages: [15, 80], w: .7, once: false, icon: 'sword', cond: (L) => L.guild.reg,
  fire: (L) => card('A party in trouble', 'A bloodied adventurer stumbles into the guild hall: their party is trapped in a ravine by a wyvern.', [C('Lead a rescue', 'go'), C('It’s not your problem', 'no')]),
  resolve: (L, k) => { if (k === 'no') { stress(L, 4); return 'Someone else goes. You hear later that they made it, mostly.'; }
    if (R.chance(questChance(L, { danger: QUEST_DANGER[Math.min(6, L.guild.rank + 1)], type: 'hunt' }))) { L.guild.pts += 15; fame(L, 10); const p = actMeet(L, 'adventurer'); const np = L.people[L.people.length - 1]; relGain(L, np, 30); return 'You drive off the wyvern and carry the wounded out. The guild master shakes your hand. ' + p; }
    const d = hurt(L, R.i(15, 30), 'a wyvern'); return `The wyvern wins this round (−${d} health). Everyone gets out alive, at least.`; } });
EV({ id: 'job_praise', title: 'Praise at work', ages: [12, 99], w: 1.2, once: false, icon: 'star', cond: (L) => !!L.job,
  fire: (L) => { L.job.perf = clamp(L.job.perf + 12, 0, 100); return 'Your boss praises your work in front of everyone.'; } });
EV({ id: 'job_conflict', title: 'Trouble at work', ages: [12, 99], w: 1, once: false, icon: 'bolt', cond: (L) => !!L.job,
  fire: (L) => card('Trouble at work', 'A coworker takes credit for your work in front of the boss.', [C('Call them out', 'call'), C('Let it go', 'let'), C('Quietly gather proof', 'proof')]),
  resolve: (L, k) => { if (!L.job) return 'It doesn\u2019t matter anymore.'; if (k === 'call') { if (R.chance(.5)) { L.job.perf += 10; return 'The boss believes you. Your coworker is reassigned.'; } L.job.perf -= 10; stress(L, 8); return 'It turns into a shouting match. Nobody wins.'; } if (k === 'let') { stress(L, 6); return 'You let it go. It eats at you for weeks.'; } L.job.perf += 6; grow(L, 'int', .2); return 'You keep receipts. Next time, you’ll be ready.'; } });
EV({ id: 'grandchild', title: 'A grandchild', ages: [36, 9999], w: 2, once: false, icon: 'heart', cond: (L) => L.people.some(p => p.alive && p.role === 'child' && p.age >= 20 && !p.hasKid),
  fire: (L) => { const c = R.pick(L.people.filter(p => p.alive && p.role === 'child' && p.age >= 20 && !p.hasKid)); c.hasKid = true; const g = npc(L, { role: 'grandchild', age: 0, sur: L.sur, op: 60, met: L.age, race: c.race }); unlock(L, 'grandparent'); stress(L, -12); return `${c.name} has a baby: your grandchild ${g.name}.`; } });
EV({ id: 'lost_woods', title: 'Lost in the woods', ages: [4, 12], w: .7, icon: 'tree', cond: (L) => TOWN[L.town].size <= 2,
  fire: (L) => card('Lost in the woods', 'Chasing a rabbit, you wander too far. Every tree looks the same and the sun is going down.', [C('Follow the stream', 'stream'), C('Climb a tree to look', 'climb'), C('Shout for help', 'shout')]),
  resolve: (L, k) => { if (k === 'climb') { if (R.chance(clamp(.4 + L.st.agi * .05, .1, .95))) { grow(L, 'agi', .4); return 'From the treetop you spot the smoke from your chimney.'; } hurt(L, 6, 'a fall'); return 'A branch snaps. You limp home after dark.'; }
    if (k === 'stream') { L.st.luck += .2; return 'The stream leads you straight back to the mill. You feel very clever.'; } const p = parentOf(L); if (p) relGain(L, p, 5); return `${p ? p.name : 'A neighbor'} finds you by lantern light and carries you home.`; } });
EV({ id: 'heaven_duty', title: 'Sacred duty', ages: [10, 999], w: 2, icon: 'star', cond: (L) => L.race === 'heavenfolk' && inCont(L, 'heaven'),
  fire: (L) => card('Sacred duty', 'The temple elders ask you to keep the night vigil at the sky altar.', [C('Keep the vigil', 'yes'), C('Excuse yourself', 'no')]),
  resolve: (L, k) => { if (k === 'yes') { addSkillXp(L, 'barrier', 30); stress(L, -6); fame(L, 2); return 'Under the stars, the barrier wards hum along with your heartbeat.'; } return 'The elders are disappointed.'; } });
EV({ id: 'labyrinth_rumor', title: 'Labyrinth rumors', ages: [14, 70], w: .3, icon: 'scroll', cond: (L) => !inCont(L, 'begaritt') && !L.earned.includes('laby_conqueror'),
  fire: (L) => 'Travelers talk about Rapan, a desert city on the Begaritt Continent built around labyrinths full of mana crystals. Guild quests there pay well, if you survive.' });
