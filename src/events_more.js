/* ===================== MORE EVENTS: everyday life, the wider world, family ===================== */
const evAlive = (L, name) => L.people.find(p => p.alive && p.name === name);
const evFightK = (L) => (L.sword.styleChosen && bestSword(L) >= bestAttack(L)) ? L.sword.primary : (bestMagic(L) > 0 ? bestElement(L) : 'fund');
const evParent = (L, role) => L.people.find(p => p.alive && !p.lost && p.role === role);
const heShe = (p) => p.sex === 'f' ? 'she' : 'he', himHer = (p) => p.sex === 'f' ? 'her' : 'him', hisHer = (p) => p.sex === 'f' ? 'her' : 'his';
const evKids = (L, a, b) => L.people.filter(p => p.alive && p.role === 'child' && p.age >= a && p.age <= b);

/* ---------- infancy & early childhood ---------- */
EV({ id: 'night_lullaby', title: 'A Song in the Dark', kind: 'Family', ages: [0, 2], w: 2.2, icon: 'sun', cond: (L) => !!parentOf(L),
  fire: (L) => { const p = parentOf(L); return card('A Song in the Dark', `Thunder shakes the shutters in the middle of the night. ${p.name} lifts you out of the crib and hums an old northern lullaby, swaying by the window until the storm moves on.`, [C('Fall asleep in their arms', 'sleep'), C('Stare at the lightning, fascinated', 'watch')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid);
    if (k === 'sleep') { if (p) relGain(L, p, 8); stress(L, -6); return 'You sleep more soundly than you ever will again.'; }
    L.flags.stormChild = 1; L.mana.cap += Math.round(12 * L.mana.pot); return 'Every flash makes the mana inside you jump. Something in you wants to answer the sky.'; } });
EV({ id: 'parents_argue', title: 'Raised Voices', kind: 'Family', ages: [3, 10], w: 1.1, icon: 'bolt', cond: (L) => !!evParent(L, 'father') && !!evParent(L, 'mother'),
  fire: (L) => { const f = evParent(L, 'father'), m = evParent(L, 'mother'); const sib = L.people.find(p => p.alive && ['sibling','twin'].includes(p.role) && p.age < L.age + 2);
    return card('Raised Voices', `Through the floorboards you hear ${f.name} and ${m.name} arguing about money, about the future, and about you.`, [C('Walk in and tell a terrible joke', 'joke'), C('Hide under the blankets', 'hide'), C('Take your sibling outside to look at the stars', 'sib', { disabled: !sib, hint: 'Needs a younger sibling' })], { sid: sib && sib.id }); },
  resolve: (L, k, d) => { const f = evParent(L, 'father'), m = evParent(L, 'mother');
    if (k === 'joke') { grow(L, 'cha', .4); [f, m].forEach(p => p && relGain(L, p, 6)); return 'The argument dissolves into tired laughter. Your father ruffles your hair. Your mother pretends she isn’t crying.'; }
    if (k === 'sib') { const s = person(L, d.sid); if (s) { relGain(L, s, 15); remember(s, L, 'Took them stargazing during a bad night'); } stress(L, 3); return 'You name constellations that don’t exist until the house goes quiet.'; }
    stress(L, 6); return 'You fall asleep before it ends. In the morning, both of them are far too cheerful.'; } });
EV({ id: 'humming_stone', title: 'The Humming Stone', kind: 'Discovery', ages: [3, 9], w: 1, icon: 'gem',
  fire: (L) => card('The Humming Stone', 'Digging in the garden, you find a smooth stone that hums when you hold it. Faint lines of light crawl under its surface.', [C('Keep it under your pillow', 'keep'), C('Sell it to the peddler', 'sell'), C('Pour your mana into it', 'mana', { disabled: L.mana.cap < 120, hint: 'Needs 120 mana' })]),
  resolve: (L, k) => {
    if (k === 'keep') { L.st.luck += 1; return 'You sleep with it every night. Good things seem to happen a little more often.'; }
    if (k === 'sell') { L.family.funds += 25; return 'The peddler’s eyes go wide and he pays far too much. Your family eats well this month.'; }
    L.mana.ctrl = clamp(L.mana.ctrl + 6, 0, 100); const g = addSkillXp(L, bestElement(L), 20, true); return `The stone drinks your mana and blazes blue, then goes dark. It was a fragment of mana crystal, and you understand your own power a little better now (+${g} XP, +6 control).`; } });
EV({ id: 'festival_race', title: 'The Festival Footrace', kind: 'Festival', ages: [4, 10], w: 1.3, icon: 'sun',
  fire: (L) => card('The Festival Footrace', 'Every child in the village lines up for the harvest-festival footrace. The prize is a honey cake the size of your head.', [C('Run your fastest', 'run'), C('Sneak in a little wind magic', 'cheat', { disabled: rankOf(L, 'wind') < 1, hint: 'Needs wind magic' }), C('Cheer for your friend instead', 'cheer')]),
  resolve: (L, k) => {
    if (k === 'run') { if (R.chance(clamp(.2 + L.st.agi * .05, .1, .85))) { grow(L, 'agi', .5); fame(L, 1); return 'You win by a nose and eat the entire cake. You regret nothing.'; } grow(L, 'agi', .3); return 'You come in third. The cake goes to a girl who runs like a deer.'; }
    if (k === 'cheat') { if (R.chance(.6)) { addSkillXp(L, 'wind', 15, true); return 'A gust at your back and you fly over the line. Nobody suspects a thing. You feel a little guilty eating the cake.'; } const p = parentOf(L); if (p) relGain(L, p, -8); stress(L, 6); return 'The other parents notice the very convenient wind. You are disqualified and sent home in disgrace.'; }
    const f = L.people.find(p => p.alive && p.role === 'friend' && p.age < 15); if (f) { relGain(L, f, 12); return `${f.name} wins and splits the cake with you right down the middle.`; } actMeet(L, 'friend'); return 'You cheer so loudly for a stranger that they come over afterward to share the cake.'; } });
EV({ id: 'knights_demons', title: 'Knights and Demons', kind: 'Childhood', ages: [5, 11], w: 1.2, icon: 'sword',
  fire: (L) => card('Knights and Demons', 'The village children are playing Knights and Demons. Nobody wants to be the demon. One by one, they all turn to look at you.', [C('Play the demon, gladly', 'demon'), C('Insist on being the knight', 'knight'), C('Change the game so the demon is the hero', 'twist')]),
  resolve: (L, k) => {
    if (k === 'demon') { grow(L, 'cha', .4); actMeet(L, 'friend'); return 'You roar and chase them all over the village. It is the best game anyone can remember.'; }
    if (k === 'knight') { addSkillXp(L, 'fund', 10, true); return 'You save the village from a very small, very offended demon.'; }
    grow(L, 'int', .3); if (L.flags.knowsSuperd || isDemonRace(L)) { L.flags.openMind = 1; return 'In your version the green-haired demon protects the village. The other kids think it’s strange. One of them asks to play it again tomorrow.'; } return 'Your version has a twist ending. Half the kids are furious; the other half demand a sequel.'; } });
EV({ id: 'horned_rabbit', title: 'Something in the Henhouse', kind: 'Danger', ages: [6, 13], w: 1.2, icon: 'paw', cond: (L) => TOWN[L.town].size <= 2,
  fire: (L) => card('Something in the Henhouse', 'Squawking in the night. A horned rabbit the size of a dog has broken into the henhouse, and it is not afraid of you.', [C('Fight it with a stick', 'fight'), C('Blast it with magic', 'magic', { disabled: bestMagic(L) < 1, hint: 'Needs any magic' }), C('Wake the adults', 'wake')]),
  resolve: (L, k) => {
    if (k === 'magic') { const g = addSkillXp(L, bestElement(L), 25, true); L.flags.firstFight = 1; L.family.funds += 5; return `Your first real fight is over in a heartbeat. Rabbit stew for a week (+${g} XP).`; }
    if (k === 'fight') { if (R.chance(clamp(.25 + (L.st.str + L.st.agi) * .03, .1, .9))) { addSkillXp(L, 'fund', 25, true); L.flags.firstFight = 1; L.family.funds += 5; return 'You win, barely, covered in feathers. Your father pretends not to be proud.'; } const d = hurt(L, R.i(6, 12), 'a horned rabbit'); return `It gores your leg and bolts into the dark (−${d} health).`; }
    const p = parentOf(L); if (p) relGain(L, p, 3); return `${p ? p.name : 'A neighbor'} handles it with a pitchfork, then shows you how to set a snare.`; } });
EV({ id: 'wyrm_shadow', title: 'A Shadow Over the Fields', kind: 'Danger', ages: [5, 14], w: .9, icon: 'flame', cond: (L) => TOWN[L.town].size <= 2 && TOWN[L.town].cont === 'central',
  fire: (L) => card('A Shadow Over the Fields', 'A red wyrm sweeps low over the fields, close enough that you can see the scars on its belly. The adults scream for everyone to get inside.', [C('Run inside with the others', 'run'), C('Climb the barn roof to watch', 'watch'), C('Throw a spell at it', 'spell', { disabled: bestMagic(L) < 1, hint: 'Needs any magic' })]),
  resolve: (L, k) => {
    if (k === 'run') return 'The wyrm never even notices the village. Afterward, nobody talks about anything else for a month.';
    if (k === 'watch') { grow(L, 'agi', .3); L.flags.sawWyrm = 1; return 'It banks over the mountains and is gone. You decide, right there on the roof, that one day you will be strong enough to stand in front of one.'; }
    if (R.chance(.3)) { const d = hurt(L, 5, 'falling off a roof'); fame(L, 2); return `The wyrm glances back and roars. You faint and roll off the roof (−${d} health). The village calls you “the kid who shot at a red wyrm” for years.`; }
    const p = parentOf(L); if (p) relGain(L, p, -10); stress(L, 6); return 'Your spell falls a mile short. Your parents are not impressed. You are grounded until spring.'; } });
EV({ id: 'traveling_scholar', title: 'The Traveling Scholar', kind: 'Encounter', ages: [6, 14], w: 1, icon: 'book',
  fire: (L) => card('The Traveling Scholar', 'A scholar from Ranoa sets up a chalkboard in the square. Today’s lecture: the seven ranks of mastery, from Beginner to God, and why almost no one alive ever reaches Saint.', [C('Ask how to become a Saint', 'saint'), C('Ask about the Seven Great Powers', 'seven'), C('Ask if he has any spare books', 'books')]),
  resolve: (L, k) => {
    if (k === 'saint') { grow(L, 'int', .4); L.read = clamp(L.read + 5, 0, 100); return '“Mana capacity is set in childhood,” he says, tapping the board. “Train hard before you turn ten, or never catch up. After that, it is control and craft.” You file this away very carefully.'; }
    if (k === 'seven') { L.flags.knowsSeven = 1; return 'He lists them in order: the Technique God, the Dragon God, the Fighting God, the Demon God, the Death God, the Sword God, and the North God. “Some of them,” he adds, “no one has seen in a hundred years.”'; }
    L.flags.books = 1; L.read = clamp(L.read + 10, 0, 100); return 'He hands you a battered primer on the four attack elements. “Return it to Ranoa someday,” he says, “when you enroll.”'; } });
EV({ id: 'guard_drills', title: 'The Old Guard Captain', kind: 'Training', ages: [6, 12], w: 1, icon: 'sword', cond: (L) => TOWN[L.town].size <= 2,
  fire: (L) => card('The Old Guard Captain', 'The village’s gray-bearded guard captain runs morning drills for anyone who shows up. Most kids quit after a day.', [C('Show up every single morning', 'drill'), C('Go once, then sleep in', 'once')]),
  resolve: (L, k) => { if (k === 'once') return 'You go once. Your arms hurt for three days and you decide that’s enough wisdom for now.';
    const g = addSkillXp(L, 'fund', 40); grow(L, 'str', .4); stress(L, 4); return `By midwinter you are the only one left. The captain nods at you once. From him, that is high praise (+${g} fundamentals).`; } });
EV({ id: 'lost_letter', title: 'A Letter Without a Courier', kind: 'Event', ages: [7, 15], w: .8, icon: 'scroll',
  fire: (L) => card('A Letter Without a Courier', 'You find a soldier’s letter in the mud by the road, addressed to a mother in the next village over.', [C('Walk it there yourself', 'deliver'), C('Read it first', 'read'), C('Leave it where it fell', 'leave')]),
  resolve: (L, k) => {
    if (k === 'deliver') { stress(L, -4); L.st.luck += .5; fame(L, 1); return 'She reads it on the doorstep and bursts into tears: her son is alive. She sends you home with a jar of honey.'; }
    if (k === 'read') { grow(L, 'int', .2); stress(L, -2); return 'It says he’s coming home by spring. You deliver it anyway, and feel strange about knowing first.'; }
    return 'You leave it. The rain does the rest.'; } });
EV({ id: 'smith_bellows', title: 'The Smith’s Bellows', kind: 'Opportunity', ages: [8, 14], w: 1.2, icon: 'gem', cond: (L) => inTag(L, 'forge') || TOWN[L.town].size >= 2,
  fire: (L) => card('The Smith’s Bellows', 'The town blacksmith needs someone to work the bellows and is willing to pay in copper and stories about the dwarven holds.', [C('Take the job', 'work'), C('Ask to learn the craft', 'learn'), C('No, thank you', 'no')]),
  resolve: (L, k) => { if (k === 'no') return 'You leave him to his sparks.';
    if (k === 'work') { L.family.funds += 12; grow(L, 'str', .4); return 'Hot, loud, and wonderful. You come home black with soot and full of stories.'; }
    L.craft = (L.craft || 0) + 25; grow(L, 'int', .2); return 'You learn how steel remembers the shape you give it. Crafting improves.'; } });
EV({ id: 'figurine_order', title: 'A Collector’s Order', kind: 'Opportunity', ages: [10, 9999], w: .8, once: false, icon: 'gem', wkey: 'craft', cond: (L) => rankOf(L, 'earth') >= 2,
  fire: (L) => card('A Collector’s Order', 'A well-dressed merchant saw one of your earth-magic figurines and wants ten more, painted, by the end of the season.', [C('Take the commission', 'yes'), C('Double your price', 'haggle'), C('Decline', 'no')]),
  resolve: (L, k) => { if (k === 'no') return 'He leaves his card, in case you change your mind.';
    const fig = (n) => { L.cnt.fig = (L.cnt.fig || 0) + n; if (L.cnt.fig >= 10 && earn(L, 'figurine_master', 'Collectors across the continent want your work.')) unlock(L, 'figurines'); };
    const pay = (g) => { if (L.age < 15) L.family.funds += g; else money(L, g); };
    if (k === 'yes') { pay(60); addSkillXp(L, 'earth', 25, true); fig(2); return 'Ten tiny knights, each with a different expression. The merchant pays 60 gold and promises more work.'; }
    if (R.chance(clamp(.3 + (L.st.cha - 8) * .04, .1, .8))) { pay(120); fig(2); return 'He gulps, then agrees. 120 gold for ten figurines. You start to understand what your work is worth.'; }
    return 'He laughs and walks away. Perhaps next time.'; } });

/* ---------- the tavern & the road ---------- */
EV({ id: 'merchant_guard', title: 'The Merchant’s Escort', kind: 'Opportunity', ages: [15, 75], w: .8, once: false, icon: 'coin',
  fire: (L) => card('The Merchant’s Escort', 'A nervous spice merchant needs guards for a three-week caravan through bandit country. He is offering good money and terrible food.', [C(`Sign on (${riskLabel(questChance(L, { danger: 22 + Math.min(40, L.age / 2), type: 'escort' }))})`, 'go'), C('Demand double pay', 'double'), C('Pass', 'no')]),
  resolve: (L, k) => { if (k === 'no') return 'You watch the caravan roll out without you.';
    let pay = 40;
    if (k === 'double') { if (!R.chance(clamp(.25 + (L.st.cha - 8) * .04 + L.fame / 800, .1, .85))) return 'He hires someone cheaper. You hear later that the someone cheaper came back with only one boot.'; pay = 80; }
    if (R.chance(questChance(L, { danger: 22 + Math.min(40, L.age / 2), type: 'escort' }))) { money(L, pay); fame(L, 2); addSkillXp(L, evFightK(L), 20, true); return `Bandits hit the caravan on the twelfth night and regret it. You arrive with every crate intact (+${pay} gold).`; }
    const d = hurt(L, R.i(10, 22), 'bandits on the caravan road'); money(L, pay / 2); return `The bandits nearly overrun you (−${d} health). The merchant pays you half, out of guilt.`; } });
EV({ id: 'noble_insult', title: 'An Insult at the Inn', kind: 'Confrontation', ages: [12, 80], w: .8, once: false, icon: 'crown',
  fire: (L) => card('An Insult at the Inn', `A young noble in silk, three guards at his back, announces to the whole room that ${L.family.cls >= 3 ? 'your house is a joke the court tells after dinner' : 'commoners like you ought to eat outside with the horses'}.`, [C('Challenge him to a duel', 'duel'), C('Answer with a sharper insult', 'wit'), C('Ignore him', 'ignore')]),
  resolve: (L, k) => {
    if (k === 'ignore') { stress(L, 4); return 'You finish your meal in silence. He gets bored and leaves. It still stings.'; }
    const mk = () => npc(L, { role: 'rival', age: Math.max(15, L.age + R.i(-2, 3)), op: -35, tags: ['proud','hot-tempered'], job: 'Young noble', noRomance: true });
    if (k === 'duel') { if (L.age < 15) { stress(L, 5); return 'His guards lift you off the floor by your collar and toss you into the street. The noble laughs all the way upstairs.'; }
      if (R.chance(clamp(.35 + (power(L) - 30) / 60, .1, .92))) { fame(L, 4); const r = mk(); remember(r, L, 'Lost a duel to you in front of everyone'); return `One exchange and his sword skitters across the floorboards. ${r.name} ${r.sur} will never forgive you, and the whole inn will never forget it.`; }
      const d = hurt(L, R.i(6, 14), 'a duel at the inn'); stress(L, 6); return `He is better than he looks (−${d} health).`; }
    if (R.chance(clamp(.3 + (L.st.cha + L.st.int - 16) * .03, .1, .9))) { fame(L, 2); grow(L, 'cha', .3); const r = mk(); remember(r, L, 'Was humiliated by your wit'); return 'Your reply is so precise that the barkeep drops a glass laughing. The noble storms out, crimson to the ears.'; }
    const d = hurt(L, 4, 'being thrown out of an inn'); return `The room goes silent. His guards throw you out (−${d} health).`; } });
EV({ id: 'bard_song', title: 'A Song in the Tavern', kind: 'Tavern', ages: [10, 9999], w: .4, once: false, icon: 'star',
  fire: (L) => L.fame >= 60
    ? card('A Song About You', `A traveling bard strikes up a ballad called “${L.epithet || L.name + ' the Bold'}.” It is about you. About half of it is true.`, [C('Correct him, loudly', 'correct'), C('Buy him a drink and let the legend grow', 'drink'), C('Slip out before anyone recognizes you', 'leave')])
    : card('The Ballad of Dead End', 'A bard sings of a party called Dead End, led by a green-haired Superd who protects children and cuts down wicked men. The whole tavern hangs on every word.', [C('Applaud', 'clap'), C('Ask whether the story is true', 'ask'), C('Request something cheerful', 'cheer')]),
  resolve: (L, k) => {
    if (k === 'correct') { stress(L, -3); return 'You correct him on every point. The tavern decides your version is less interesting. The bard keeps his.'; }
    if (k === 'drink') { money(L, -3); fame(L, 5); return 'By the end of the night there are two new verses, a dragon you never fought, and a crowd that wants to shake your hand.'; }
    if (k === 'leave') return 'You slip out. Behind you, the chorus swells.';
    if (k === 'ask') { L.flags.knowsSuperd = 1; return 'He winks. “Truer than the old stories they tell about the Superd, anyway.”'; }
    stress(L, -5); return k === 'clap' ? 'The song ends and the room roars. For a moment, everyone is friends.' : 'He switches to a drinking song about a hapless goblin. Everyone joins in.'; } });
EV({ id: 'old_friend', title: 'A Familiar Face', kind: 'Reunion', ages: [16, 9999], w: .6, once: false, icon: 'people', cond: (L) => L.people.some(p => p.alive && p.role === 'friend' && p.met <= L.age - 5 && !p.lost),
  fire: (L) => { const p = R.pick(L.people.filter(p => p.alive && p.role === 'friend' && p.met <= L.age - 5 && !p.lost));
    return card('A Familiar Face', `Someone at the bar turns around and it’s ${p.name}, your friend from ${p.met <= 12 ? 'childhood' : 'years ago'}, older now${p.job ? ' and working as ' + aOrAn(p.job.toLowerCase()) : ''}.`, [C('Talk until closing time', 'talk'), C('Ask what happened in all those years', 'ask'), C('Pretend you don’t recognize them', 'avoid')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); if (!p) return '';
    if (k === 'avoid') { relGain(L, p, -15); return `${p.name} looks hurt and leaves early.`; }
    if (k === 'ask') { relGain(L, p, 14); remember(p, L, 'Caught up over drinks'); return `${p.name} talks for an hour. ${p.bio || ''}`.trim(); }
    relGain(L, p, 20); stress(L, -8); remember(p, L, 'Talked until closing time'); return `You talk until the barkeep sweeps around your feet. It feels like no time has passed at all.`; } });
EV({ id: 'claim_jumpers', title: 'Claim Jumpers', kind: 'Guild', ages: [15, 80], w: 1, once: false, icon: 'bolt', cond: (L) => L.guild.reg,
  fire: (L) => card('Claim Jumpers', 'A rival party snatches the quest notice you were reaching for and laughs about it. Their leader wears a lot of armor and very little sense.', [C('Race them to the target', 'race'), C('Challenge their leader', 'duel'), C('Let it go. There are other quests.', 'let')]),
  resolve: (L, k) => {
    if (k === 'let') { stress(L, 3); return 'You take a different quest. Theirs goes badly, you hear. Very badly.'; }
    if (k === 'race') { if (R.chance(clamp(.3 + L.st.agi * .03 + power(L) / 200, .1, .9))) { L.guild.pts += 8; money(L, 30); fame(L, 2); return 'You beat them there by a day and are already collecting the bounty when they stumble in. +30 gold.'; } stress(L, 5); return 'They beat you there. Their leader waves the bounty at you on the way out.'; }
    if (R.chance(questChance(L, { danger: 18 + L.guild.rank * 9, type: 'hunt' }))) { fame(L, 4); L.guild.pts += 5; return 'He swings first. He also hits the floor first. The guild hall applauds.'; }
    const d = hurt(L, R.i(8, 16), 'a guild-hall brawl'); return `He is stronger than his sense (−${d} health).`; } });
EV({ id: 'receptionist_tip', title: 'Advice from the Front Desk', kind: 'Guild', ages: [15, 80], w: 1, icon: 'scroll', cond: (L) => L.guild.reg,
  fire: (L) => { L.guild.pts += 3; return 'The guild receptionist has seen a thousand adventurers come and go. She gives you some advice: never take a quest more than one rank above your own, and count your party twice before you leave and once when you come home.'; } });

/* ---------- regional encounters ---------- */
EV({ id: 'holy_knights', title: 'Holy Knights at the Gate', kind: 'Confrontation', ages: [10, 9999], w: .7, once: false, icon: 'fist', cond: (L) => inCont(L, 'millis'),
  fire: (L) => { const rj = L.people.some(p => p.alive && p.race === 'superd' && p.role === 'party');
    return card('Holy Knights at the Gate', `A patrol of Millis Holy Knights stops everyone at the city gate. ${isDemonRace(L) ? 'Their captain’s hand drifts to his sword when he sees your features.' : rj ? 'Their captain’s hand drifts to his sword when he sees Ruijerd.' : 'They are hunting demon smugglers, and you are a stranger.'}`, [C('Answer every question politely', 'polite'), C('Bribe them (15 gold)', 'bribe', { disabled: L.gold < 15, hint: 'Needs 15 gold' }), C('Refuse to be searched', 'refuse')]); },
  resolve: (L, k) => {
    if (k === 'bribe') { money(L, -15); return 'The gold disappears into a gauntlet. The gate opens.'; }
    if (k === 'polite') { if (isDemonRace(L) && R.chance(.5)) { stress(L, 6); return 'They search you twice and make you wait in the sun for hours. Eventually they let you through.'; } return 'They wave you through with a blessing you didn’t ask for.'; }
    if (R.chance(clamp(.25 + (L.st.cha - 8) * .03 + L.fame / 600, .1, .8))) { fame(L, 2); return 'You quote the Holy Country’s own charter at them. The captain, red-faced, lets you pass.'; }
    const d = hurt(L, R.i(5, 10), 'Holy Knights'); money(L, -L.gold * .2); return `You spend a night in the cells and pay a “fine” to leave (−${d} health, a fifth of your gold).`; } });
EV({ id: 'badigadi', title: 'The Laughing Demon King', kind: 'Encounter', ages: [15, 9999], w: 1.2, icon: 'crown', cond: (L) => inCont(L, 'demon'),
  fire: (L) => card('The Laughing Demon King', 'A giant demon with six arms and purple skin bursts into the tavern, laughing so hard the bottles rattle. “I am Badigadi, Demon King! Who here will drink with me?” Nobody moves. He looks straight at you.', [C('Accept the drinking contest', 'drink'), C('Challenge him to arm-wrestling', 'wrestle'), C('Back away very slowly', 'leave')]),
  resolve: (L, k) => {
    if (k === 'leave') return 'He shrugs all six shoulders and challenges the bartender instead.';
    const b = canonNpc(L, { name: 'Badigadi', sur: '', race: 'demonkin', sex: 'm', age: 3000, op: 20, role: 'other', job: 'Immortal Demon King', tags: ['cheerful','playful'], power: 120, bio: 'An immortal Demon King who cannot be killed and does not seem to mind. Loves feasts, fights, and his fiancée, the Demon Empress Kishirika.' });
    if (k === 'wrestle') { relGain(L, b, 25); fame(L, 10); return 'He wins with one arm. And another. And a third, just to make his point. Then he declares you his favorite person on the continent.'; }
    if (R.chance(clamp(.15 + L.st.str * .02, .1, .5))) { relGain(L, b, 30); fame(L, 20); money(L, 50); return 'Somehow, impossibly, he slides under the table first. The tavern erupts. He wakes up, laughs until he cries, and pays you 50 gold for the privilege.'; }
    relGain(L, b, 15); stress(L, 4); return 'You wake up in a hay cart two towns away with no memory of the night and a hat that isn’t yours.'; } });
EV({ id: 'migurd_silence', title: 'A Village Without Words', kind: 'Encounter', ages: [5, 9999], w: 3, icon: 'people', cond: (L) => L.town === 'migurd_village' && L.race !== 'migurd',
  fire: (L) => card('A Village Without Words', 'In the Migurd village, nobody speaks aloud. They talk mind to mind, so you hear only silence and the occasional polite smile. A small boy tugs your sleeve and points at your mouth, fascinated.', [C('Teach him a spoken word', 'teach'), C('Try very hard to hear their thoughts', 'listen'), C('Ask the elders about the Migurd who left', 'roxy')]),
  resolve: (L, k) => {
    if (k === 'teach') { grow(L, 'cha', .3); stress(L, -5); return 'He practices “hello” on every person in the village. By evening, the whole tribe is trying it.'; }
    if (k === 'listen') { L.mana.ctrl = clamp(L.mana.ctrl + 4, 0, 100); return 'Nothing, and then, very faintly, a warmth, like hearing a song through a wall.'; }
    const r = evAlive(L, 'Roxy'); if (r) { relGain(L, r, 10); return 'They show you the house Roxy grew up in. Her parents are still there, still waiting for a letter. You promise to tell her.'; }
    return 'One girl left decades ago because she couldn’t hear the others well. They say she became a great mage. They say it proudly.'; } });
EV({ id: 'forest_rains', title: 'The Great Forest Rains', kind: 'Season', ages: [6, 9999], w: 3, icon: 'drop', cond: (L) => L.town === 'doldia' || L.town === 'silverleaf',
  fire: (L) => card('The Great Forest Rains', 'The rainy season arrives all at once. For three months the roads become rivers and no one leaves the village. Your hosts insist you stay as their guest.', [C('Learn the warriors’ hunting ways', 'hunt'), C('Teach the children your magic', 'teach'), C('Rest and let the rain fall', 'rest')]),
  resolve: (L, k) => {
    if (k === 'hunt') { grow(L, 'agi', .6); const g = addSkillXp(L, evFightK(L), 40, true); const p = npc(L, { role: 'friend', race: 'beastfolk', age: Math.max(10, L.age + R.i(-3, 6)), op: 40, tags: ['loyal','playful'] }); return `You hunt through the drowned forest with ${p.name}, who becomes a friend for life (+${g} XP).`; }
    if (k === 'teach') { grow(L, 'cha', .5); fame(L, 3); return 'By the end of the season, a dozen Beastfolk children can make a water ball. The elders are not sure whether to thank you.'; }
    stress(L, -25); heal(L, 20); return 'You sleep, eat, and listen to the rain for three months. You leave feeling ten years younger.'; } });
EV({ id: 'harbor_storm', title: 'Storm in the Harbor', kind: 'Danger', ages: [12, 9999], w: 1, icon: 'drop', cond: (L) => inTag(L, 'port') || inTag(L, 'sea'),
  fire: (L) => card('Storm in the Harbor', 'A storm slams into the harbor. A fishing boat is breaking apart on the rocks, and there are still people aboard.', [C('Swim out with a rope', 'swim'), C('Calm the waves with water magic', 'water', { disabled: rankOf(L, 'water') < 3, hint: 'Needs Advanced water' }), C('Raise the alarm', 'alarm')]),
  resolve: (L, k) => {
    if (k === 'water') { addSkillXp(L, 'water', 50); fame(L, 10); return 'You stand on the pier and push the sea flat. The fishermen walk to shore on calm water. The Sea Folk sing about it for a year.'; }
    if (k === 'alarm') { fame(L, 1); return 'Your shouting brings half the harbor running. Everyone is saved, eventually.'; }
    if (R.chance(clamp(.3 + (L.st.str + L.st.agi) * .02, .1, .9))) { fame(L, 6); grow(L, 'str', .4); return 'You haul three sailors out of the surf, one at a time. The harbor master shakes your hand for a full minute.'; }
    const d = hurt(L, R.i(12, 24), 'the storm surf'); return `The sea throws you against the rocks (−${d} health). The sailors save themselves, and then save you.`; } });
EV({ id: 'black_sails', title: 'Black Sails', kind: 'Danger', ages: [15, 9999], w: .7, once: false, icon: 'sword', cond: (L) => inTag(L, 'port'),
  fire: (L) => card('Black Sails', 'Pirates hit the docks at dawn, torching warehouses and grabbing anyone who looks rich enough to ransom.', [C('Fight them on the docks', 'fight'), C('Get the townsfolk to safety', 'evac'), C('Hide in a barrel', 'hide')]),
  resolve: (L, k) => {
    if (k === 'fight') { if (R.chance(questChance(L, { danger: 40, type: 'defense' }))) { money(L, 50); fame(L, 8); addSkillXp(L, evFightK(L), 30, true); return 'You cut through the boarding party and the pirates flee for their ships. The harbor guild pays you 50 gold.'; } const d = hurt(L, R.i(12, 26), 'pirates'); return `There are too many of them (−${d} health).`; }
    if (k === 'evac') { fame(L, 4); grow(L, 'cha', .3); return 'You lead a hundred people up the cliff path to safety. Not one is taken.'; }
    if (R.chance(.7)) return 'The barrel smells of herring. The pirates leave. You smell of herring for a week.';
    money(L, -L.gold * .4); return 'They find you, and your purse. You lose two-fifths of your gold.'; } });
EV({ id: 'sandstorm', title: 'Sandstorm', kind: 'Journey', ages: [10, 9999], w: 1.5, icon: 'map', cond: (L) => inCont(L, 'begaritt'),
  fire: (L) => card('Sandstorm', 'Halfway across the dunes the sky turns brown. The caravan master screams for everyone to circle the wagons.', [C('Raise an earth wall around the caravan', 'earth', { disabled: rankOf(L, 'earth') < 2, hint: 'Needs Intermediate earth' }), C('Help tie down the animals', 'help'), C('Ride ahead to find shelter', 'scout')]),
  resolve: (L, k) => {
    if (k === 'earth') { addSkillXp(L, 'earth', 40); fame(L, 5); return 'A curved wall of stone rises from the sand. The storm screams over it for six hours. Inside, the merchants play cards.'; }
    if (k === 'help') { grow(L, 'str', .3); stress(L, 4); return 'You spend the storm holding a terrified camel by the bridle. You both survive. You become friends, sort of.'; }
    if (R.chance(clamp(.35 + L.st.agi * .03, .1, .9))) { fame(L, 3); return 'You find a cave in the rocks and lead the whole caravan in. The caravan master offers you a job on the spot.'; }
    const d = hurt(L, R.i(10, 20), 'the Begaritt desert'); return `You lose the caravan in the sand and wander for two days (−${d} health).`; } });
EV({ id: 'crystal_vein', title: 'A Vein of Mana Crystal', kind: 'Discovery', ages: [12, 9999], w: 1.2, icon: 'gem', cond: (L) => inTag(L, 'labyrinth') || inCont(L, 'begaritt'),
  fire: (L) => card('A Vein of Mana Crystal', 'In a side tunnel you find a vein of raw mana crystal glowing faint blue. It could be worth a fortune, or it could be holding up the ceiling.', [C('Mine it carefully', 'mine'), C('Meditate beside it', 'meditate'), C('Leave it alone', 'leave')]),
  resolve: (L, k) => {
    if (k === 'leave') return 'You mark it on your map and move on. Some things are better left in the dark.';
    if (k === 'meditate') { L.mana.ctrl = clamp(L.mana.ctrl + 6, 0, 100); if (manaPhase(L) < 3) L.mana.cap += Math.round(40 * L.mana.pot); return 'The crystal’s hum settles into your bones. Your mana control sharpens.'; }
    if (R.chance(.7)) { const g = R.i(80, 160); money(L, g); return `You pry loose a fist-sized crystal. A Rapan dealer pays ${g} gold without haggling, which means you should have asked for more.`; }
    const d = hurt(L, R.i(10, 25), 'a tunnel collapse'); return `The ceiling comes down (−${d} health). You dig yourself out with nothing to show for it.`; } });
EV({ id: 'dragon_bones', title: 'Bones of a Dragon', kind: 'Discovery', ages: [12, 9999], w: 1.2, icon: 'flame', cond: (L) => inTag(L, 'dragon') || inCont(L, 'begaritt'),
  fire: (L) => card('Bones of a Dragon', 'Half-buried in the rock lies a dragon skeleton longer than a village street. The empty sockets of its skull still hold the ghost of a glow.', [C('Study the bones', 'study'), C('Pry loose a fang to sell', 'fang'), C('Say a few words for it', 'pray')]),
  resolve: (L, k) => {
    if (k === 'study') { grow(L, 'int', .5); const g = addSkillXp(L, bestElement(L), 40, true); if (!L.flags.gravityHint && R.chance(.2)) { L.flags.gravityHint = 1; return `The bones are arranged around a single point, as if the dragon was pulling the world toward itself. You almost understand something about gravity (+${g} XP).`; } return `Patterns of old mana are etched into the bone. You learn a great deal (+${g} XP).`; }
    if (k === 'fang') { const g = R.i(120, 250); money(L, g); if (R.chance(.2)) { stress(L, 15); return `It sells for ${g} gold, but for months you dream of golden eyes watching you.`; } return `A collector in the next town pays ${g} gold for the fang.`; }
    stress(L, -6); L.st.luck += .5; return 'You say what you can for a creature older than kingdoms. The wind seems to sigh in answer.'; } });
EV({ id: 'water_dojo', title: 'The Water God’s Dojo', kind: 'Encounter', ages: [8, 80], w: 2, icon: 'drop', cond: (L) => inTag(L, 'dojo_water'),
  fire: (L) => card('The Water God’s Dojo', 'The Water God dojo in Ars is quiet, ordered, and terrifying. An old woman in a plain robe watches from the veranda. Everyone bows when she passes. She is Reida Reya, the Water God.', [C('Ask for a single lesson', 'lesson'), C('Watch the disciples train', 'watch'), C('Leave before you embarrass yourself', 'leave')]),
  resolve: (L, k) => {
    if (k === 'leave') return 'You leave. You feel her eyes on your back all the way to the gate.';
    if (k === 'watch') { const g = addSkillXp(L, 'wg', 40); return `You watch from the edge of the yard for a week and learn more about counters than in a year alone (+${g} Water God XP).`; }
    const d = hurt(L, 4, 'a Water God lesson'); const g = addSkillXp(L, 'wg', 90); canonNpc(L, { name: 'Reida', sur: 'Reya', race: 'human', sex: 'f', age: 70, op: 15, role: 'other', skill: { k: 'wg', r: 7 }, job: 'The Water God', tags: ['stern','witty'], bio: 'The Water God, master of the counterattack school. She looks like a kindly grandmother until the moment she draws.' });
    return `She deflects every strike you make with one hand, without looking up from her tea. Then she shows you, slowly, exactly what you did wrong (+${g} Water God XP, −${d} health).`; } });
EV({ id: 'royal_tournament', title: 'The Royal Tournament', kind: 'Competition', ages: [15, 65], w: .8, once: false, icon: 'crown', cond: (L) => inTag(L, 'capital'),
  fire: (L) => card('The Royal Tournament', `The capital of ${TOWN[L.town].realm} holds its great tournament. Swordsmen and mages from three kingdoms have come to compete for gold and a royal audience.`, [C('Enter the sword bracket', 'sword', { disabled: bestSword(L) < 1, hint: 'Needs a sword rank' }), C('Enter the magic bracket', 'magic', { disabled: bestMagic(L) < 1, hint: 'Needs a magic rank' }), C('Bet on the favorite (20 gold)', 'bet', { disabled: L.gold < 20, hint: 'Needs 20 gold' })]),
  resolve: (L, k) => {
    if (k === 'bet') { money(L, -20); if (R.chance(.55)) { money(L, 40); return 'The favorite wins. You double your money.'; } return 'The favorite trips in the first round. So much for that.'; }
    let wins = 0; for (let r = 0; r < 4; r++) { if (R.chance(questChance(L, { danger: 24 + r * 16, type: 'hunt' }))) wins++; else break; }
    addSkillXp(L, k === 'sword' ? (L.sword.styleChosen ? L.sword.primary : 'fund') : bestElement(L), 25 + wins * 15, true);
    if (wins === 4) { money(L, 300); fame(L, 40); return 'You win the whole tournament. The crowd chants your name and a king hands you a purse of 300 gold.'; }
    if (wins >= 2) { money(L, 40 * wins); fame(L, 6 * wins); return `You make it to round ${wins + 1} before falling. A respectable showing (+${40 * wins} gold).`; }
    hurt(L, R.i(4, 10), 'a tournament bout'); return wins ? 'You win one bout and lose the next. Next year.' : 'You go out in the first round to a swordsman half your size.'; } });
EV({ id: 'sealed_letter', title: 'A Sealed Letter', kind: 'Intrigue', ages: [15, 80], w: .8, icon: 'scroll', cond: (L) => inTag(L, 'court') && (L.family.cls >= 2 || L.fame >= 60),
  fire: (L) => card('A Sealed Letter', 'A courtier presses a sealed letter into your hand in a dark corridor: deliver it to a certain lord, speak of it to no one, and you will be rewarded.', [C('Deliver it as asked', 'deliver'), C('Break the seal and read it', 'open'), C('Hand it to the palace guard', 'guard')]),
  resolve: (L, k) => {
    if (k === 'guard') { fame(L, 3); return 'The guard captain reads it and turns pale. Two courtiers vanish from court that week.'; }
    if (k === 'open') { fame(L, 10); money(L, 60); L.flags.courtFavor = 1; return 'It names a time and place for an assassination. You warn the target. A grateful duke pays you 60 gold and remembers your name.'; }
    if (R.chance(.5)) { money(L, 100); L.flags.courtFavor = 1; return 'The lord reads it, smiles thinly, and pays you 100 gold. You will never know what it said.'; }
    stress(L, 15); fame(L, -5); return 'It was part of a plot. You spend a week being questioned by royal investigators before they decide you were only the messenger.'; } });

/* ---------- school ---------- */
EV({ id: 'forbidden_section', title: 'The Forbidden Section', kind: 'Temptation', ages: [10, 9999], w: 1.4, icon: 'book', cond: (L) => L.edu.school === 'ranoa' || L.town === 'sharia',
  fire: (L) => card('The Forbidden Section', 'Behind a locked grate in Ranoa’s library sit the books the faculty won’t let students touch: summoning theory, curse research, and a crumbling treatise on gravity.', [C('Pick the lock at midnight', 'sneak'), C('Ask a professor for permission', 'ask'), C('Stay on the right side of the grate', 'no')]),
  resolve: (L, k) => {
    if (k === 'no') return 'You leave the grate locked. It whispers to you every time you walk by.';
    if (k === 'ask') { if (R.chance(clamp(.2 + (L.st.int + L.st.cha - 16) * .03 + bestMagic(L) * .05, .05, .85))) { L.read = clamp(L.read + 10, 0, 100); grow(L, 'int', .5); return 'The professor studies you for a long moment, then unlocks the grate. “One hour. Touch nothing that moves.”'; } return '“Absolutely not,” says the professor, and starts watching you in the halls.'; }
    if (R.chance(clamp(.3 + (L.st.agi + L.st.int) * .02, .1, .85))) { if (!L.flags.gravityHint && R.chance(.3)) { L.flags.gravityHint = 1; return 'You read the gravity treatise by moonlight. Most of it is nonsense. One page is not.'; } const g = addSkillXp(L, 'summon', 40, true) || addSkillXp(L, bestElement(L), 40, true); return `You read until dawn and sneak out with your head full of forbidden circles (+${g} XP).`; }
    stress(L, 12); if (L.edu.school === 'ranoa' && R.chance(.25)) { L.edu.school = null; return 'You are caught red-handed. Despite your talent, the vice-principal expels you.'; } return 'A night watchman catches you. Three months of cleaning the alchemy labs.'; } });
EV({ id: 'exam_week', title: 'Examination Week', kind: 'School', ages: [8, 40], w: 1.2, once: false, icon: 'hat', cond: (L) => !!L.edu.school,
  fire: (L) => card('Examination Week', `Exams at ${SCHOOL[L.edu.school].name}. Everyone is pale, sleepless, and running on bad tea.`, [C('Study all night, every night', 'study'), C('Form a study group', 'group'), C('Wing it', 'wing')]),
  resolve: (L, k) => {
    if (k === 'study') { grow(L, 'int', .5); L.read = clamp(L.read + 6, 0, 100); stress(L, 8); return 'You take the top marks in your year and sleep for two days afterward.'; }
    if (k === 'group') { grow(L, 'cha', .3); grow(L, 'int', .3); const f = L.people.find(p => p.alive && p.role === 'friend'); if (f) relGain(L, f, 8); else actMeet(L, 'friend'); return 'Your study group passes together, mostly by arguing over the answers until they made sense.'; }
    if (R.chance(.35 + L.st.luck * .01)) { stress(L, -4); return 'Every question is about the one chapter you read. Fate smiles on the lazy.'; } stress(L, 8); grow(L, 'int', .1); return 'You fail two exams and spend the holiday retaking them.'; } });

/* ---------- war, hardship & mercy ---------- */
EV({ id: 'refugees', title: 'Refugees on the Road', kind: 'Hardship', ages: [12, 9999], w: .6, once: false, icon: 'people', cond: (L) => inTag(L, 'war') || (inCont(L, 'central') && TOWN[L.town].size >= 2 && R.chance(.3)),
  fire: (L) => card('Refugees on the Road', 'A column of refugees from the Conflict Zone passes through town, carrying what they can. At the very back, a small child walks alone.', [C('Share your food and coin (20 gold)', 'give', { disabled: L.gold < 20, hint: 'Needs 20 gold' }), C(L.age >= 21 ? 'Take the child in as your own' : 'Help the child find their family', 'child'), C('Keep your distance', 'no')]),
  resolve: (L, k) => {
    if (k === 'no') { stress(L, 4); return 'You watch them pass. You think about the child for a long time.'; }
    if (k === 'give') { money(L, -20); stress(L, -6); fame(L, 2); return 'Twenty gold buys bread for forty people. It is the best money you have ever spent.'; }
    if (L.age >= 21) { const c = addChild(L, { race: L.race, traits: [] }, true); c.age = R.i(3, 8); c.op = 60; remember(c, L, 'Was taken in from a refugee column'); stress(L, -5); return `The child’s name is ${c.name}. They hold your hand all the way home and don’t let go for a month.`; }
    if (R.chance(.7)) { fame(L, 2); stress(L, -6); return 'You find the child’s mother three wagons ahead. She collapses in tears and blesses you in a language you don’t speak.'; }
    stress(L, 6); return 'You search the whole column. No one claims the child. A priest at the chapel promises to take them in.'; } });
EV({ id: 'mercenary_contract', title: 'A Mercenary Contract', kind: 'Opportunity', ages: [16, 60], w: .8, once: false, icon: 'sword', cond: (L) => inTag(L, 'war') || inTag(L, 'military'),
  fire: (L) => card('A Mercenary Contract', 'A mercenary captain with a scarred face offers a season’s contract: hold a border fort, collect a fat purse, and try not to die.', [C(`Sign the contract (${riskLabel(questChance(L, { danger: 34, type: 'defense' }))})`, 'sign'), C('Negotiate better terms', 'haggle'), C('Refuse', 'no')]),
  resolve: (L, k) => {
    if (k === 'no') return 'The captain spits and moves on to the next fool.';
    let pay = 90; if (k === 'haggle') { if (R.chance(clamp(.3 + (L.st.cha - 8) * .04, .1, .85))) pay = 140; else return 'He laughs in your face and hires someone hungrier.'; }
    if (R.chance(questChance(L, { danger: 34, type: 'defense' }))) { money(L, pay); fame(L, 4); addSkillXp(L, evFightK(L), 40, true); if (earn(L, 'war_veteran', 'You held the line.')) unlock(L, 'war_vet'); return `The fort holds through three assaults. You collect ${pay} gold and a scar you’re secretly proud of.`; }
    const d = hurt(L, R.i(15, 30), 'a border siege'); money(L, pay / 3); return `The fort falls in the second month (−${d} health). You escape with a third of your pay.`; } });

/* ---------- mastery & breakthroughs ---------- */
EV({ id: 'aura_flare', title: 'Aura Flare', kind: 'Breakthrough', ages: [12, 9999], w: 1.2, icon: 'bolt', cond: (L) => L.aura.stage >= 1 && L.aura.stage < 5 && bestSword(L) >= 2,
  fire: (L) => card('Aura Flare', 'In the middle of a hard fight, your Battle Aura flares hotter than ever before. For a few heartbeats, everything moves slowly except you.', [C('Chase the feeling, whatever it costs', 'chase'), C('Rein it in and study it', 'rein')]),
  resolve: (L, k) => { if (k === 'chase') { const g = auraTrain(L, 3); const d = hurt(L, R.i(4, 10), 'aura burn'); return `You ride the flare until your muscles scream (+${g} aura, −${d} health).`; } L.aura.ctrl = clamp(L.aura.ctrl + 10, 0, 100); auraStageCheck(L); return 'You fold the heat back inside and hold it there, trembling. Aura control +10.'; } });
EV({ id: 'mana_storm', title: 'Mana Storm', kind: 'Breakthrough', ages: [10, 9999], w: .8, icon: 'drop', cond: (L) => L.mana.cap >= 3000,
  fire: (L) => card('Mana Storm', 'A thunderstorm rolls over the hills, and the mana inside you answers it like a tide pulled by the moon. Your hands crackle.', [C('Release it into the sky', 'release'), C('Hold it in and master it', 'hold')]),
  resolve: (L, k) => { if (k === 'release') { const e = rankOf(L, 'wind') >= rankOf(L, 'water') ? 'wind' : 'water'; const g = addSkillXp(L, e, 60); stress(L, -6); return `Lightning answers your call and splits the sky above the hills (+${g} ${e} XP).`; } L.mana.ctrl = clamp(L.mana.ctrl + 7, 0, 100); const d = hurt(L, 8, 'mana backlash'); return `You hold the storm inside until it bows to you (+7 control, −${d} health).`; } });
EV({ id: 'grimoire_auction', title: 'The Auction House', kind: 'Opportunity', ages: [15, 9999], w: .3, once: false, icon: 'book', cond: (L) => TOWN[L.town].size >= 3 && L.gold >= 150,
  fire: (L) => card('The Auction House', 'An auction house is selling a grimoire supposedly written by a Water King. The bidding opens at 150 gold.', [C('Bid 150 gold', 'bid'), C('Bid 300 gold to win outright', 'big', { disabled: L.gold < 300, hint: 'Needs 300 gold' }), C('Just watch', 'watch')]),
  resolve: (L, k) => {
    if (k === 'watch') return 'A dwarf in a fur coat outbids everyone and leaves cackling.';
    if (k === 'bid' && !R.chance(.45)) return 'A merchant prince outbids you without blinking. You keep your gold.';
    money(L, k === 'big' ? -300 : -150); const g = addSkillXp(L, 'water', k === 'big' ? 140 : 110); L.read = clamp(L.read + 8, 0, 100); return `The grimoire is genuine. The margins are full of a master’s notes (+${g} water XP).`; } });
EV({ id: 'dwarven_forge', title: 'A Dwarven Masterwork', kind: 'Opportunity', ages: [16, 9999], w: 2, icon: 'sword', cond: (L) => L.town === 'ironroot' && L.gold >= 200,
  fire: (L) => card('A Dwarven Masterwork', 'The master smith of Ironroot Hold offers to forge you a weapon the old dwarven way. It will take a year and most of your savings.', [C('Commission a steel bastard sword (200 gold)', 'steel', { disabled: L.gold < 200 || ['steel_sword','mithril_blade'].includes(L.gear.weapon), hint: 'Needs 200 gold' }), C('Commission a mithril blade (1,800 gold)', 'mithril', { disabled: L.gold < 1800 || L.gear.weapon === 'mithril_blade', hint: 'Needs 1,800 gold' }), C('Not today', 'no')]),
  resolve: (L, k) => { if (k === 'no') return 'He shrugs. “The forge will be here. So will I, for another three hundred years.”';
    if (k === 'steel') { money(L, -200); L.gear.weapon = 'steel_sword'; return 'A year later he hands you a steel bastard sword that sings when you swing it. (Equipped: Steel Bastard Sword.)'; }
    money(L, -1800); L.gear.weapon = 'mithril_blade'; unlock(L, 'well_armed'); return 'The mithril blade holds your Battle Aura like water in a cup. The smith refuses to shake your hand: “The sword already thanked me.” (Equipped: Mithril Blade.)'; } });

/* ---------- canon friends ---------- */
EV({ id: 'empress_returns', title: 'The Empress Remembers', kind: 'Encounter', ages: [15, 9999], w: 2, icon: 'eye', cond: (L) => !!L.flags.ev_demon_empress && L.earned.some(t => t.startsWith('eye_')),
  fire: (L) => card('The Empress Remembers', 'Kishirika Kishirisu, Great Emperor of the Demon World, finds you again. She is eating, naturally. “You fed me once, so I’ll tell you a secret for free. Something dangerous is coming for you. I can’t see from where. Isn’t that exciting?”', [C('Ask what kind of danger', 'ask'), C('Buy her another meal (10 gold)', 'feed', { disabled: L.gold < 10, hint: 'Needs 10 gold' }), C('Thank her and leave', 'leave')]),
  resolve: (L, k) => {
    if (k === 'feed') { money(L, -10); L.st.luck += 1; fame(L, 3); return 'She eats four bowls of noodles and gives you a sticky blessing. Your luck feels better already.'; }
    if (k === 'ask') { heal(L, 20); L.st.luck += .5; return '“The kind with teeth,” she says, and cackles. You sleep with one eye open for a month, and are a little better prepared for everything.'; }
    return 'She waves a chopstick at you as you go. “Don’t die! It would be boring.”'; } });
EV({ id: 'ruijerd_farewell', title: 'The Warrior’s Road', kind: 'Farewell', ages: [10, 9999], w: 3, icon: 'spear', cond: (L) => L.people.some(p => p.alive && p.name === 'Ruijerd' && p.role === 'party') && (L.arc.displaced || 0) >= 99,
  fire: (L) => card('The Warrior’s Road', 'By the fire one night, Ruijerd tells you that it is time. You are home now, and somewhere out there are Superd who still need him. He wants to keep searching.', [C('Let him go, with your thanks', 'go'), C('Ask him to stay a little longer', 'stay')]),
  resolve: (L, k) => { const r = evAlive(L, 'Ruijerd');
    if (k === 'stay') { relGain(L, r, 5); return 'He stays. But you both know it won’t be forever.'; }
    r.role = 'friend'; relGain(L, r, 25); remember(r, L, 'Parted ways as family'); earn(L, 'superd_trust', 'He taught you to feel danger before it arrives.');
    return 'At dawn he tightens the strap on his spear and puts a hand on your head, the way he did when you were small. “Be a warrior,” he says. Then he walks into the sunrise.'; } });
EV({ id: 'zanoba_project', title: 'The Prince’s Project', kind: 'Friendship', ages: [13, 9999], w: 2, icon: 'gem', cond: (L) => { const z = evAlive(L, 'Zanoba'); return z && z.op >= 30; },
  fire: (L) => card('The Prince’s Project', 'Zanoba bursts into your room at midnight waving blueprints. He wants to build a moving doll, an automaton powered by mana. “Master! Together we can make history!”', [C('Help him through the night', 'help'), C('Tell him to go to bed', 'bed')]),
  resolve: (L, k) => { const z = evAlive(L, 'Zanoba');
    if (k === 'bed') { relGain(L, z, -5); return 'He goes to bed. You hear him sketching through the wall until sunrise.'; }
    relGain(L, z, 20); remember(z, L, 'Built an automaton together'); const g = addSkillXp(L, 'earth', 50); L.craft = (L.craft || 0) + 30; money(L, 40); return `By morning the little doll takes three wobbling steps and falls on its face. Zanoba weeps with joy. A collector buys the prototype for 40 gold (+${g} earth XP).`; } });
EV({ id: 'cliff_pride', title: 'A Genius’s Pride', kind: 'Friendship', ages: [12, 9999], w: 2, icon: 'hat', cond: (L) => !!evAlive(L, 'Cliff'),
  fire: (L) => card('A Genius’s Pride', 'Cliff Grimoire has locked himself in his workshop for a week, trying to design a magic item that suppresses curses. He refuses all help. He very clearly needs help.', [C('Help without making it obvious', 'sneaky'), C('Tell him he’s being stubborn', 'blunt'), C('Leave him to it', 'leave')]),
  resolve: (L, k) => { const c = evAlive(L, 'Cliff');
    if (k === 'leave') return 'He emerges a month later with a working prototype and a beard. He tells everyone he did it alone.';
    if (k === 'sneaky') { c.role = 'friend'; relGain(L, c, 22); remember(c, L, 'Helped him without saying so'); const g = addSkillXp(L, 'barrier', 30); grow(L, 'int', .4); return `You leave notes in his books, as if by accident. He solves it in a week and pretends not to know. You both know (+${g} barrier XP).`; }
    if (R.chance(.5)) { c.role = 'friend'; relGain(L, c, 18); return 'He yells at you for ten minutes, then hands you a pen. “Fine. Check my arithmetic.”'; } relGain(L, c, -10); return 'He throws you out. Then, at midnight, he knocks on your door with his notes.'; } });
EV({ id: 'nanahoshi_door', title: 'A Door to Another World', kind: 'Turning Point', ages: [16, 9999], w: 2, icon: 'star', cond: (L) => { const n = evAlive(L, 'Nanahoshi'); return n && n.op >= 20 && rankOf(L, 'summon') >= 2; },
  fire: (L) => card('A Door to Another World', 'Nanahoshi has finished her greatest circle. She asks you to stand at its edge and lend your mana while she tries, one more time, to open a door to her world.', [C('Pour everything you have into it', 'all'), C('Lend a careful amount', 'careful'), C('Warn her it’s too dangerous', 'warn')]),
  resolve: (L, k) => { const n = evAlive(L, 'Nanahoshi'); L.flags.nanaSick = 1;
    if (k === 'warn') { relGain(L, n, -10); return 'She does it anyway, without you. The circle fizzles. Three weeks later, she collapses in the tower.'; }
    const g = addSkillXp(L, 'summon', k === 'all' ? 120 : 60); relGain(L, n, 20); if (k === 'all') { L.mana.ctrl = clamp(L.mana.ctrl + 8, 0, 100); hurt(L, 15, 'a failed world-gate'); }
    return `${k === 'all' ? 'For one heartbeat you see it: a city of glass towers and lights in every window.' : 'The circle flares and the air tastes of metal.'} Then the door slams shut. Nanahoshi stares at the scorched floor and says nothing (+${g} summoning XP).`; } });
EV({ id: 'nanahoshi_sick', title: 'The Dry Demon Sickness', kind: 'Turning Point', ages: [16, 9999], w: 4, icon: 'heart', cond: (L) => L.flags.nanaSick === 1 && !!evAlive(L, 'Nanahoshi'),
  fire: (L) => card('The Dry Demon Sickness', 'Nanahoshi collapses. Her body holds no mana at all, and the mana in this world’s air is slowly poisoning her. The only known cure is an herb that grows on the Begaritt Continent.', [C('Cure her with detoxification magic', 'detox', { disabled: rankOf(L, 'detox') < 3, hint: 'Needs Advanced detox' }), C('Buy the herb from a Begaritt trader (80 gold)', 'herb', { disabled: L.gold < 80, hint: 'Needs 80 gold' }), C('Stay at her bedside', 'stay')]),
  resolve: (L, k) => { const n = evAlive(L, 'Nanahoshi'); L.flags.nanaSick = 2;
    if (k === 'detox') { addSkillXp(L, 'detox', 60); relGain(L, n, 35); remember(n, L, 'Saved her life'); fame(L, 10); return 'You draw the poison out of her for three nights straight. On the fourth morning she sits up and asks for rice. There is no rice. She laughs anyway.'; }
    if (k === 'herb') { money(L, -80); relGain(L, n, 30); remember(n, L, 'Bought the herb that saved her'); return 'The herb works. She is weak for a month, then back at her circles, more determined than ever.'; }
    if (R.chance(.55)) { relGain(L, n, 25); return 'The fever breaks on its own after two terrible weeks. She squeezes your hand and does not let go for a long time.'; }
    n.alive = false; n.diedAt = L.age; stress(L, 30 * (1 + pct(L, 'grief'))); log(L, 'Nanahoshi dies far from home.', 'bad'); return 'She dies in the night, far from home, still talking about the city of glass. You keep her mask.'; } });

/* ---------- family life ---------- */
EV({ id: 'parent_surpassed', title: 'Surpassed', kind: 'Family', ages: [14, 70], w: 1.5, icon: 'sword', cond: (L) => L.people.some(p => p.alive && !p.lost && ['father','mother'].includes(p.role) && p.skill && STYLE[p.skill.k] && bestSword(L) > p.skill.r),
  fire: (L) => { const p = L.people.find(p => p.alive && !p.lost && ['father','mother'].includes(p.role) && p.skill && STYLE[p.skill.k] && bestSword(L) > p.skill.r);
    return card('Surpassed', `You spar with ${p.name} in the yard, like old times. This time, ${hisHer(p)} sword ends up in the dirt.`, [C(`Help ${himHer(p)} up`, 'help'), C('Gloat, just a little', 'gloat')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); if (k === 'gloat') { relGain(L, p, 6); return `${p.name} laughs and tackles you into the dirt. Some things never change.`; } relGain(L, p, 20); remember(p, L, 'Was surpassed by you, proudly'); return `“I always knew you would,” ${heShe(p)} says, and ${hisHer(p)} voice cracks only a little.`; } });
EV({ id: 'arranged_match', title: 'An Arranged Match', kind: 'Turning Point', ages: [18, 40], w: 1.2, icon: 'crown', cond: (L) => L.family.cls >= 3 && !L.spouse && !L.partner && L.vow !== 'solitude' && L.age >= Math.max(18, RACE[L.race].coming) && !!parentOf(L),
  fire: (L) => { const sex = R.chance(.5) ? 'm' : 'f'; const p = npc(L, { role: 'other', sex, race: L.race, age: R.i(Math.max(18, L.age - 3), L.age + 3), op: R.i(10, 30), job: 'Heir of a noble house', tags: [R.pick(['proud','gentle','witty','serious','kind']), R.pick(['loyal','curious','shy','cheerful'])] });
    p.age = Math.max(p.age, romanceAge(L, p));
    return card('An Arranged Match', `Your family has arranged a match with ${p.name} of House ${p.sur}, ${p.age}. The alliance would strengthen your house considerably. You have met exactly once, at a dinner, and talked about the weather.`, [C('Accept the match', 'yes', { disabled: !canRomance(L, p) }), C('Ask for a season to court properly', 'court'), C('Refuse', 'no')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid); const par = parentOf(L);
    if (k === 'no') { if (par) relGain(L, par, -20); stress(L, 8); p.role = 'other'; return 'Your family is furious. The other house is insulted. You feel, for the first time in a while, entirely yourself.'; }
    if (k === 'court') { relGain(L, p, 20); remember(p, L, 'Asked to court properly instead of an arranged match'); return `${p.name} seems relieved. You start meeting for long walks. It is awkward, then less awkward, then something else.`; }
    if (!canRomance(L, p)) return 'The match falls through.';
    p.role = 'spouse'; L.spouse = p.id; L.partner = null; relGain(L, p, 15); remember(p, L, 'Married you in an arranged match'); unlock(L, 'married'); L.family.funds += 500; fame(L, 10); if (par) relGain(L, par, 15);
    log(L, `You marry ${p.name} ${p.sur} in a grand ceremony.`, 'love'); return `The wedding fills the cathedral. You don’t love ${p.name} yet. But you are both willing to try, and that turns out to matter more than anyone expected.`; } });
EV({ id: 'anniversary', title: 'An Anniversary', kind: 'Family', ages: [19, 9999], w: 1.1, once: false, icon: 'heart', cond: (L) => { const s = L.spouse && person(L, L.spouse); return s && s.alive; },
  fire: (L) => { const s = person(L, L.spouse); return card('An Anniversary', `Another year with ${s.name}. ${cap1(heShe(s))} has been dropping hints for weeks.`, [C('Plan a surprise trip (30 gold)', 'trip', { disabled: L.gold < 30, hint: 'Needs 30 gold' }), C('Cook their favorite meal', 'cook'), C('Forget entirely', 'forget')], { pid: s.id }); },
  resolve: (L, k, d) => { const s = person(L, d.pid);
    if (k === 'trip') { money(L, -30); relGain(L, s, 18); stress(L, -10); remember(s, L, 'Took them on an anniversary trip'); return `Three days by a lake with nothing to do. ${s.name} says it is the best gift of ${hisHer(s)} life.`; }
    if (k === 'cook') { relGain(L, s, 10); return 'It is slightly burnt. They eat every bite.'; }
    relGain(L, s, -15); stress(L, 5); return 'You forget. You spend the night on the sofa and the next week apologizing.'; } });
EV({ id: 'spouse_fever', title: 'A Fever That Won’t Break', kind: 'Family', ages: [25, 9999], w: .6, once: false, icon: 'drop', cond: (L) => { const s = L.spouse && person(L, L.spouse); return s && s.alive && s.age >= 35 && !s.feverYr; },
  fire: (L) => { const s = person(L, L.spouse); s.feverYr = L.age; return card('A Fever That Won’t Break', `${s.name} has been sick for weeks. The local healer can only shake their head.`, [C('Heal them yourself', 'heal', { disabled: rankOf(L, 'heal') < 3 && rankOf(L, 'detox') < 2, hint: 'Needs Advanced healing or Intermediate detox' }), C('Travel to a famous healer (100 gold)', 'travel', { disabled: L.gold < 100, hint: 'Needs 100 gold' }), C('Stay by their side', 'stay')], { pid: s.id }); },
  resolve: (L, k, d) => { const s = person(L, d.pid);
    if (k === 'heal') { addSkillXp(L, rankOf(L, 'heal') >= 3 ? 'heal' : 'detox', 50); relGain(L, s, 20); remember(s, L, 'Healed them with your own hands'); return 'You work through the night. By dawn the fever has broken, and they are asking for breakfast.'; }
    if (k === 'travel') { money(L, -100); if (R.chance(.85)) { relGain(L, s, 15); return 'The journey is hard, but the healer is everything they said. You bring them home well.'; } }
    if (R.chance(.7)) { relGain(L, s, 15); stress(L, 6); return 'You sit by the bed for nine days. On the tenth, the fever breaks.'; }
    s.alive = false; s.diedAt = L.age; L.spouse = null; stress(L, 40 * (1 + pct(L, 'grief'))); log(L, `${s.name} dies of a fever.`, 'bad'); return `${s.name} dies holding your hand. The house is very quiet afterward.`; } });
EV({ id: 'child_spell', title: 'A First Spell', kind: 'Family', ages: [18, 9999], w: 2, once: false, icon: 'star', cond: (L) => evKids(L, 3, 10).some(c => !c.skill),
  fire: (L) => { const c = R.pick(evKids(L, 3, 10).filter(c => !c.skill)); const e = R.pick(['water','fire','earth','wind']); const what = { water: 'ball of water', fire: 'flickering spark', earth: 'pebble', wind: 'tiny whirlwind' }[e];
    return card('A First Spell', `${c.name} comes running, eyes enormous. A ${what} hovers above ${hisHer(c)} palm for one perfect second. Then it splashes, scorches, or blows everywhere at once.`, [C('Teach them properly from now on', 'teach'), C('Throw a celebration', 'party'), C('Warn them not to overdo it', 'warn')], { pid: c.id, e }); },
  resolve: (L, k, d) => { const c = person(L, d.pid); c.skill = { k: d.e, r: 1 };
    if (k === 'teach') { c.skill.r = 2; relGain(L, c, 15); remember(c, L, 'Taught them magic'); stress(L, 3); return `You give ${c.name} lessons every evening. ${cap1(heShe(c))} is a quick study, faster than you were.`; }
    if (k === 'party') { relGain(L, c, 12); stress(L, -8); return 'The whole family celebrates with cake. The cake is accidentally set on fire. Nobody minds.'; }
    relGain(L, c, 4); return `${c.name} nods seriously and then tries it again behind the barn. Children.`; } });
EV({ id: 'child_leaves', title: 'Leaving the Nest', kind: 'Family', ages: [30, 9999], w: 1.5, once: false, icon: 'map', cond: (L) => evKids(L, 15, 24).some(c => !c.leftHome),
  fire: (L) => { const c = R.pick(evKids(L, 15, 24).filter(c => !c.leftHome)); c.leftHome = true;
    return card('Leaving the Nest', `${c.name} is packing a bag. ${cap1(heShe(c))} wants to register at the Adventurer Guild and see the world, the way you did.`, [C('Give your blessing and your old gear', 'bless'), C('Forbid it', 'forbid'), C('Go along for the first quest', 'go')], { pid: c.id }); },
  resolve: (L, k, d) => { const c = person(L, d.pid);
    if (k === 'bless') { relGain(L, c, 20); c.job = 'Adventurer'; remember(c, L, 'Gave their blessing to adventure'); return `You hand over your old sword and a map covered in your notes. ${c.name} hugs you at the gate and doesn’t look back. You do.`; }
    if (k === 'forbid') { relGain(L, c, -25); if (R.chance(.5)) { c.job = 'Adventurer'; return `${c.name} leaves anyway, in the night. A letter arrives a month later: safe, and still angry.`; } return `${c.name} stays, sullen, and doesn’t speak to you for a season.`; }
    relGain(L, c, 25); c.job = 'Adventurer'; remember(c, L, 'Went on their first quest together'); addSkillXp(L, evFightK(L), 20, true); stress(L, -5); return `You take an easy goblin quest together. ${c.name} saves your life once, slightly, and will never let you forget it.`; } });
EV({ id: 'student_door', title: 'A Student at Your Door', kind: 'Legacy', ages: [25, 9999], w: .6, once: false, icon: 'hat', cond: (L) => bestRankAll(L) >= 4 && L.people.filter(p => p.alive && p.role === 'student').length < 3,
  fire: (L) => { const k = bestSkillName(L); const p = npc(L, { role: 'other', age: R.i(13, 18), op: 25, noRomance: true, race: R.pick([L.race, 'human', 'elf', 'beastfolk', 'dwarf']), tags: [R.pick(['curious','loyal','proud','serious','cheerful']), R.pick(['shy','witty','gentle','hot-tempered'])] });
    const nm = STYLE[k] ? STYLE[k].name : MAGIC_ID[k].name + ' magic';
    return card('A Student at Your Door', `A determined young ${RACE[p.race].name.toLowerCase()} named ${p.name} has walked for weeks to find you. ${cap1(heShe(p))} wants you to teach ${himHer(p)} ${nm}.`, [C('Take them on as your student', 'yes'), C('Test them first', 'test'), C('Turn them away', 'no')], { pid: p.id, k }); },
  resolve: (L, k, d) => { const p = person(L, d.pid);
    if (k === 'no') { p.role = 'other'; stress(L, 2); return `${p.name} bows and leaves. You wonder what ${heShe(p)} will become.`; }
    if (k === 'test' && !R.chance(.6)) { p.role = 'other'; return `${p.name} fails your test, but asks to try again next year. You almost hope ${heShe(p)} does.`; }
    p.role = 'student'; p.skill = { k: d.k, r: 1 }; relGain(L, p, 25); remember(p, L, 'Became your student'); fame(L, 6); META.lp += 5; stress(L, 4);
    return `${p.name} moves into the spare room and practices from dawn until dusk. Teaching, you discover, is a way of learning everything twice.`; } });
EV({ id: 'rival_returns', title: 'An Old Rival Returns', kind: 'Reunion', ages: [18, 9999], w: .8, once: false, icon: 'bolt', cond: (L) => L.people.some(p => p.alive && p.role === 'rival' && !p.returned && L.age - p.met >= 4),
  fire: (L) => { const p = R.pick(L.people.filter(p => p.alive && p.role === 'rival' && !p.returned && L.age - p.met >= 4)); p.returned = true; p.power = Math.max(p.power || 0, Math.round(power(L) * rnd(.8, 1.2)));
    return card('An Old Rival Returns', `${p.name} walks into town years older, scarred, and much stronger. ${cap1(heShe(p))} has come a long way to settle things with you.`, [C('Duel, here and now', 'duel'), C('Offer a drink and a truce', 'truce'), C('Refuse to fight', 'refuse')], { pid: p.id }); },
  resolve: (L, k, d) => { const p = person(L, d.pid);
    if (k === 'refuse') { stress(L, 6); relGain(L, p, -10); return `${p.name} calls you a coward in front of everyone and leaves. It bothers you more than any wound.`; }
    if (k === 'truce') { if (R.chance(clamp(.3 + (L.st.cha - 8) * .04 + (p.op + 50) / 250, .1, .85))) { p.role = 'friend'; p.op = Math.max(p.op, 25); remember(p, L, 'Made peace over a drink'); return `Three drinks in, you are both laughing about the old days. ${p.name} is a rival no longer.`; } stress(L, 4); return `${p.name} knocks the cup out of your hand.`; }
    if (R.chance(clamp(.5 + (power(L) - p.power) / 60, .1, .9))) { fame(L, 8); relGain(L, p, 20); remember(p, L, 'Lost a hard-fought duel to you'); if (R.chance(.4)) { p.role = 'friend'; return `It is the best fight of your life. When ${p.name} finally yields, ${heShe(p)} is grinning. “Again, in ten years.”`; } return `You win. ${p.name} limps away, already planning the next one.`; }
    const dmg = hurt(L, R.i(12, 25), 'a rival’s blade'); stress(L, 8); remember(p, L, 'Finally beat you'); return `${p.name} has been training for this every day (−${dmg} health).`; } });

/* ---------- later life ---------- */
EV({ id: 'road_not_taken', title: 'The Road Not Taken', kind: 'Reflection', ages: [35, 60], w: 1, icon: 'sun',
  fire: (L) => card('The Road Not Taken', 'You wake one morning wondering what would have happened if you had chosen differently, years ago.', [C('Pick up a new discipline', 'learn'), C('Write to an old friend', 'write'), C('Make peace with the life you have', 'peace')]),
  resolve: (L, k) => {
    if (k === 'learn') { const opts = ['fire','water','earth','wind','heal','barrier','fund'].filter(x => (x === 'fund' ? 0 : rankOf(L, x)) <= 1); const x = R.pick(opts.length ? opts : ['heal']); const g = addSkillXp(L, x, 60); return `You start from the beginning, like a child again. It is humbling, and wonderful (+${g} XP).`; }
    if (k === 'write') { const f = R.pick(L.people.filter(p => p.alive && ['friend','mentor','rival'].includes(p.role))); if (f) { relGain(L, f, 15); remember(f, L, 'Received a long letter from you'); return `${f.name} writes back within the month. Ten pages. You read it four times.`; } stress(L, -5); return 'You write the letter, then realize you have no one to send it to. You decide to fix that.'; }
    stress(L, -15); return 'You decide that the life you have is the one you wanted all along. Breakfast tastes better.'; } });
EV({ id: 'council_seat', title: 'A Seat on the Council', kind: 'Honor', ages: [50, 9999], w: 1, icon: 'crown', cond: (L) => L.fame >= 60,
  fire: (L) => card('A Seat on the Council', `The elders of ${TOWN[L.town].name} ask you to join the town council. Mostly it means arguing about road repairs. Sometimes it means much more.`, [C('Accept the seat', 'yes'), C('Decline politely', 'no')]),
  resolve: (L, k) => { if (k === 'no') return 'You decline. The elders understand. The road repairs do not get done.'; fame(L, 10); grow(L, 'cha', .3); stress(L, 4); L.flags.council = 1; return 'You take your seat. Within a year the roads are repaired, the granary is full, and three feuding families are speaking again.'; } });
EV({ id: 'last_journey', title: 'One Last Journey', kind: 'Reflection', ages: [65, 9999], w: 1, icon: 'map', cond: (L) => L.age >= L.lifespan * 0.7,
  fire: (L) => card('One Last Journey', 'Your knees complain on the stairs now. But there is one place you have always meant to see.', [C('The cliffs above Port Zant, where the ocean begins', 'sea'), C('The Great Forest, under the oldest trees', 'forest'), C('Stay home with the people you love', 'home')]),
  resolve: (L, k) => {
    if (k === 'home') { L.people.filter(p => p.alive && (isFamily(p) || p.role === 'spouse')).forEach(p => relGain(L, p, 10)); stress(L, -12); return 'You stay home. The grandchildren climb on you like a tree. It is exactly where you wanted to be.'; }
    stress(L, -22); if (!L.visited.includes('millis')) L.visited.push('millis'); return k === 'sea' ? 'You stand on the cliffs above Zant with the wind in your hair, and watch the sun go down into the sea.' : 'You walk beneath trees that were old when the Laplace War began. You feel very young.'; } });
EV({ id: 'living_legend', title: 'The Children’s Game', kind: 'Fame', ages: [25, 9999], w: 1, icon: 'star', cond: (L) => L.fame >= 400,
  fire: (L) => { fame(L, 5); stress(L, -6); return `Children in ${TOWN[L.town].name} play a game called “${L.epithet || L.name}” now. Somebody always wants to be you. Nobody wants to be your enemies. You watch from a window, and laugh.`; } });
