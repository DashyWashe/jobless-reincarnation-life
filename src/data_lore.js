/* ===================== LORE, DESCRIPTIONS, ITEMS, GOALS ===================== */
const TRAIT_LORE = {
  quick_learner: 'Teachers notice you within a week. Lessons stick, but so do the late nights.',
  brawny: 'Thick through the shoulders from the start. Spells come slower to heavy hands.',
  nimble: 'Light on your feet and quick to dodge, if never the strongest in the yard.',
  bookworm: 'You would rather read than run, and your body knows it.',
  charming_smile: 'A smile that opens doors, and makes a few people jealous.',
  hard_worker: 'You never stop. Progress comes steadily, and so does exhaustion.',
  night_owl: 'Your mana hums brightest after dark, at the cost of sleep and health.',
  big_eater: 'A bottomless stomach builds a sturdy body and empties a purse.',
  early_riser: 'Up before the roosters and training while others sleep. Not much fun at dinner.',
  hot_headed: 'Quick to anger and quicker to draw. Fights find you.',
  cautious: 'You check every corner twice. You get hurt less, and you find less.',
  daydreamer: 'Your head is full of designs and shapes, rarely the task in front of you.',
  stubborn: 'You refuse to quit, which serves your body well and your friendships less so.',
  thick_skinned: 'Insults roll off you. So, sometimes, does warmth.',
  sensitive_soul: 'You feel everything deeply, the joy and the strain alike.',
  weak_constitution: 'A sickly body hosts a sharp mind.',
  clumsy_hands: 'Your fingers fumble tools, but mana flows through them easily.',
  light_sleeper: 'The slightest sound wakes you, which has saved your life more than once.',
  penny_pincher: 'Every copper counted, every gift reconsidered.',
  restless: 'You can’t sit still in a classroom, but put you on the road and you come alive.',
  aura_incompat: 'Your body will not carry Battle Aura. All that energy goes into your spells instead.',
  silver_tongue: 'You can talk your way into nearly anything, and people sense it.',
  keen_eyes: 'You spot the ambush, the trap, and the loose stone.',
  iron_stomach: 'Spoiled meat, swamp water, poison: your gut takes it all.',
  natural_swordhand: 'The grip feels right the first time you hold a blade.',
  mana_sensitive: 'Mana pours into you easily. Draining it hurts just as easily.',
  born_leader: 'People fall in behind you without being asked.',
  polyglot: 'Languages, scripts, and dialects come to you like old friends.',
  green_thumb: 'Plants thrive and potions brew right in your care.',
  animal_whisperer: 'Beasts calm in your presence, and strays find your door.',
  lucky_star: 'Fortune likes you, but fortune is fickle.',
  fast_healer: 'Cuts close overnight and bones knit in weeks, with a hearty appetite to match.',
  tough_hide: 'Blows that would floor others leave you bruised and stiff.',
  merchant_instinct: 'You can smell a bargain, and a mark.',
  prodigy_reader: 'You read before you could walk, and the pressure started early.',
  steady_hands: 'Your hands never shake, whether carving wood or closing wounds.',
  pious: 'Faith comes naturally, and the Millis church notices its faithful.',
  night_vision: 'Darkness is merely gray to you. Labyrinths hold fewer surprises.',
  tireless: 'You train past exhaustion, sometimes past your friends’ patience.',
  mana_glutton: 'Your reserves grow fast, but you waste as much as you hold.',
  longevity: 'Your line lives long. Time is the one thing you have plenty of.',
  magic_resistant: 'Hostile magic slides off you, and healing magic does too.',
  rapid_learning: 'You understand on the first explanation.',
  battle_instinct: 'In a fight your body moves before your mind catches up.',
  fire_affinity: 'Flame answers you like a loyal hound.',
  water_affinity: 'Water bends to you as if it remembers your name.',
  earth_affinity: 'Stone and soil shape themselves under your hands.',
  wind_affinity: 'The wind carries your spells farther and faster.',
  aura_affinity: 'Battle Aura floods your body readily once it wakes.',
  healing_hands: 'Wounds close under your touch faster than they should.',
  beautiful: 'Heads turn when you walk by, not always for good reasons.',
  eidetic: 'You remember everything, the lessons and the wounds alike.',
  mana_efficiency: 'You cast more with less, like a well-tuned instrument.',
  iron_will: 'Curses, fear, and doubt find no purchase in your mind.',
  natural_diplomat: 'You find the words that turn enemies into allies.',
  treasure_sense: 'Your eyes drift toward the loose floorboard, the hidden cache, the glint in the river.',
  swift_feet: 'Fast enough that most blows land where you were.',
  barrier_talent: 'Your wards go up quickly and hold strong.',
  sharp_tactician: 'You read battlefields and offices the same way.',
  warm_heart: 'You love freely, and loss cuts you deep.',
  vast_mana: 'Your reserves dwarf those of trained mages, but your body is slight.',
  sword_talent: 'A natural genius with the blade. Spells feel clumsy by comparison.',
  masterwork_hands: 'You can build what others only imagine, including magic tools.',
  aura_exceptional: 'Your aura awakens early and burns hot.',
  mana_perception: 'You see mana moving in the air and in people, which can overwhelm you in crowds.',
  prodigious_growth: 'Everything you train improves faster than it should.',
  ironblood: 'Your blood runs thick and stubborn. Wounds that kill others merely slow you.',
  golden_voice: 'When you speak, rooms fall silent to listen.',
  strategist: 'You see three moves ahead in battle and in business.',
  sage_patience: 'Hours of study feel like minutes.',
  holy_vessel: 'Divine magic pours through you as if you were made for it.',
  shadow_step: 'You move unseen and unheard, a talent certain employers pay well for.',
  beast_blood: 'Something wild runs in your veins. Body and aura grow like a predator’s.',
  fortune_favor: 'Luck clusters around you, with a few dramatic exceptions.',
  spirit_sight: 'You see spirits, and they see you.',
  immovable_stance: 'You meet every strike with a perfect counter. Water God Style suits you.',
  storm_footwork: 'Your first step is already a strike. Sword God Style suits you.',
  tricksters_blade: 'You win by any means necessary. North God Style suits you.',
  gravity_sense: 'You feel the weight of the world as a force you could bend.',
  unbreakable: 'Nothing breaks you, though some say nothing reaches you either.',
  chantless_prodigy: 'Spells form in your hands without a single word. Mages twice your age will envy you.',
  dual_affinity: 'Two elements answer you equally, and you can weave them into one spell.',
  sword_saint_soul: 'You carry a Sword Saint’s instincts from birth.',
  heaven_physique: 'A body built for war: tireless, strong, and quick to heal.',
  prodigy_age: 'A once-in-a-generation talent at everything you touch.',
  archmage_blood: 'Your bloodline has produced archmages for centuries.',
  dragonheart: 'Your heart beats like a war drum. Fear has no hold on you.',
  sovereign_tongue: 'Kings listen when you speak.',
  miracle_healer: 'One day you will restore what others call lost forever.',
  elemental_mutation: 'Your magic carries a storm element no school can teach.',
  eternal_youth: 'Your face will look the same in fifty years.',
  heros_fate: 'Destiny has chosen you, and your deeds spread like wildfire.',
  genius_inventor: 'Your mind turns mana into machines.',
  fortress_body: 'Blades bend against your skin.',
  spirit_speaker: 'Spirits accept your contracts as an equal’s.',
  war_prodigy: 'Battle is a language you were born speaking.',
  lucky_bastard: 'Death keeps missing you by inches.',
  mana_wellspring: 'Mana refills in you like a mountain spring.',
  beast_king: 'Beasts bow to you, and your aura roars.',
  seer_dreams: 'Your dreams show what is coming.',
  dragon_blood: 'The blood of the ancient dragons sleeps in you, waiting to wake.',
  eye_foresight: 'A Demon Eye that shows you a moment into the future. In a duel, that moment is everything.',
  eye_clairvoyance: 'A Demon Eye that sees across great distances and through walls.',
  eye_manasight: 'A Demon Eye that sees mana itself: currents, reserves, and hidden potential.',
  divine_strength: 'A Divine Child, blessed with strength beyond any human limit.',
  divine_memory: 'A Divine Child who forgets nothing, ever.',
  divine_charm: 'A Divine Child whose presence bends hearts.',
  god_swordsman: 'The Sword Gods would trade their titles for your talent.',
  boundless_mana: 'Your mana has no visible bottom.',
  phoenix_soul: 'Your soul burns like a phoenix and returns once from death.',
  aura_monarch: 'Your aura could one day rival the Fighting God’s.',
  timeless: 'Centuries mean little to you.',
  saint_miracles: 'People speak of your healing as miracles.',
  dragon_star: 'Born under the Dragon God’s star, fated to stand against the Man-God.',
  soulsight: 'You see the truth in every heart.',
  laplace_echo: 'A fragment of the Demon God Laplace’s power stirs in you.',
  heavenly_wings: 'Wings unfurl from your back, though you were not born of the Heaven Folk.',
  golden_destiny: 'Gold, glory, and luck flow toward you.',
  past_life: 'You remember a whole life before this one, and every mistake you will not repeat.',
  demon_vigor: 'Your wounds close like an Immortal Demon Lord’s.',
  admin_blessing: 'A blessing from outside the world’s rules.',
  admin_mana: 'Mana without limit.',
  admin_eye: 'Every Demon Eye at once.',
  admin_unkillable: 'Death has been written out of your story.',
  admin_eternal: 'Time simply passes you by.',
  admin_styles: 'Every school of the sword is yours.',
  admin_fortune: 'Luck rewritten in your favor.',
  admin_charisma: 'The world adores you.',
  admin_time: 'More hours in every year.',
  admin_successor: 'The power of a Dragon God, bestowed.',
  admin_legacy: 'Your legacy echoes fivefold.',
  admin_shaper: 'The world bends its requirements for you.',
  eye_appraisal: 'A Demon Eye that reveals the worth and nature of things and people.',
  dragon_mark: 'The Dragon God Orsted has marked you. The Man-God can no longer see you.',
  holy_beast_bond: 'The Holy Beast of the Great Forest walks at your side.',
  superd_trust: 'A Superd warrior taught you to feel danger with your whole body.',
  laby_conqueror: 'You walked out of a labyrinth’s heart alive.',
  displaced_survivor: 'You crossed half the world to get home.',
  silent_caster: 'You cast without chanting.',
  overflow_scar: 'Your body learned to bear mana beyond its limits.',
  mangod_rejector: 'You refused the Man-God three times.',
  sanctum_blade: 'Forged in the snows of the Sword Sanctum.',
  water_disciple: 'A disciple of the Water God’s school.',
  north_heir: 'Heir to the North God’s tricks.',
  ranoa_grad: 'A graduate of Ranoa University of Magic.',
  figurine_master: 'Collectors across the continent want your figurines.',
  poor_healer: 'The poor quarter blesses your name.',
  wanderer: 'You have stood on every continent.',
  war_veteran: 'War left its mark, and its lessons.',
  seven_powers: 'Ranked among the Seven Great Powers.',
  roxy_pupil: 'Taught by Roxy Migurdia, Water Saint. Her lessons stay with you for life.',
  ghislaine_drills: 'Drilled by Ghislaine Dedoldia, Sword King, until your legs gave out.',
  dead_end_legend: 'Your party’s name became a legend on the Demon Continent.',
  orsted_subordinate: 'You serve the Dragon God in his long war against the Man-God.',
  ariel_knight: 'Knighted by the Queen of Asura for loyalty when it mattered.',
  council_officer: 'You served on Ranoa University’s student council.',
  school_master: 'You founded a school whose students will teach students of their own.',
  timeless_soul: 'Two centuries taught you that time is not an enemy.',
  laplace_bane: 'You struck the blow that broke the Demon God in the Second Laplace War.',
};

/* ---------- MECHANICS TEXT (tooltips) ---------- */
const FX_NAMES = { all: 'All training XP', magic: 'Magic XP', attack: 'Attack magic XP', fire: 'Fire magic XP', water: 'Water magic XP', earth: 'Earth magic XP', wind: 'Wind magic XP',
  holy: 'Healing, barrier and detox XP', heal: 'Healing XP', barrier: 'Barrier XP', detox: 'Detox XP', summon: 'Summoning XP', gravity: 'Gravity XP', sword: 'Sword XP (every style)',
  sg: 'Sword God Style XP', wg: 'Water God Style XP', ng: 'North God Style XP', aura: 'Battle Aura XP', study: 'Study XP', body: 'Body training XP', social: 'Social XP', work: 'Work XP', craft: 'Crafting XP' };
const STAT_FULL = { str: 'Strength', agi: 'Agility', int: 'Intelligence', cha: 'Charisma', looks: 'Looks', luck: 'Luck' };
const EVT_NAMES = { rival: 'rival encounters', fight: 'fights', admirer: 'admirers', church: 'attention from the church', duel: 'duel challenges', assassin: 'assassination attempts', manGod: 'Man-God dreams',
  dragon: 'dragon encounters', dragonGod: 'meetings with the Dragon God', misfortune: 'misfortune', familyWoe: 'family misfortune', beast: 'beast encounters', spirit: 'spirit encounters', world: 'world events', intrigue: 'court intrigue', demon: 'demon faction attention', demonHate: 'hostility from demons', accident: 'spell accidents' };
const sgn = (v) => (v > 0 ? '+' : '−') + Math.abs(Math.round(v * 100)) + '%';
/* multipliers read as whole numbers: ×2 stays, ×1.25 becomes +25% */
const mulTxt = (m) => Math.abs(m - Math.round(m)) < 1e-9 && m >= 2 ? `×${Math.round(m)}` : `${m >= 1 ? '+' : '−'}${Math.round(Math.abs(m - 1) * 100)}%`;
function fxLines(fx) {
  const out = [];
  for (const k in fx) {
    const v = fx[k];
    if (k === 'xp') { for (const x in v) out.push({ t: `${FX_NAMES[x] || x} ${sgn(v[x])}`, good: v[x] > 0 }); continue; }
    if (k === 'st') { for (const x in v) out.push({ t: `${v[x] > 0 ? '+' : '−'}${Math.abs(v[x])} ${STAT_FULL[x]} at birth`, good: v[x] > 0 }); continue; }
    if (k === 'evt') { for (const x in v) out.push({ t: v[x] > 1 ? `More ${EVT_NAMES[x] || x}` : v[x] === 0 ? `No more ${EVT_NAMES[x] || x}` : `Fewer ${EVT_NAMES[x] || x}`, good: v[x] <= 1 || ['dragonGod','beast','spirit','admirer'].includes(x), neutral: true }); continue; }
    const map = {
      maxHp: () => ({ t: `${v > 0 ? '+' : '−'}${Math.abs(v)} max health`, good: v > 0 }), regen: () => ({ t: `Regain ${v} health every year`, good: true }),
      life: () => ({ t: `Lifespan ${mulTxt(1 + v)}`, good: v > 0 }), stress: () => ({ t: `Stress taken ${sgn(v)}`, good: v < 0 }),
      injury: () => ({ t: `Injury damage ${sgn(v)}`, good: v < 0 }), income: () => ({ t: `Income ${sgn(v)}`, good: v > 0 }), loot: () => ({ t: `Treasure and quest gold ${sgn(v)}`, good: v > 0 }),
      fame: () => ({ t: v >= 1 ? 'Fame gained ×2' : `Fame gained ${sgn(v)}`, good: v > 0 }), rel: () => ({ t: `Relationship gains ${sgn(v)}`, good: v > 0 }), romance: () => ({ t: `Romance success ${sgn(v)} (adults)`, good: true }),
      heal: () => ({ t: `Healing magic on you ${sgn(v)}`, good: v > 0 }), grief: () => ({ t: `Grief ${sgn(v)}`, good: v < 0 }), manaPot: () => ({ t: `Innate mana potential ${mulTxt(1 + v)}`, good: v > 0 }),
      manaGrow: () => ({ t: `Mana capacity growth ${v >= 1 ? mulTxt(1 + v) : sgn(v)}`, good: v > 0 }), manaEff: () => ({ t: `Mana efficiency ${v > 0 ? '+' : '−'}${Math.abs(Math.round(v * 100))}`, good: v > 0 }),
      chant: () => ({ t: `Chantless discovery ${mulTxt(1 + v)}`, good: true }), auraGrow: () => ({ t: v >= 1 ? 'Battle Aura growth ×2' : `Battle Aura growth ${sgn(v)}`, good: v > 0 }),
      quest: () => ({ t: `Combat power ${v > 0 ? '+' : '−'}${Math.abs(v)}`, good: v > 0 }), ap: () => ({ t: `+${v} actions every year`, good: true }), apEarly: () => ({ t: `+${v} action every year until age 10`, good: true }),
      sp: () => ({ t: `+${v} social points every year`, good: true }), manaWin: () => ({ t: `Mana growth windows last ${v} years longer`, good: true }), auraWin: () => ({ t: `Battle Aura window lasts ${v} years longer`, good: true }),
      auraNone: () => ({ t: 'Battle Aura can never awaken', good: false }), revive: () => ({ t: 'Return from death once per life', good: true }), noDeath: () => ({ t: 'Cannot die until you choose to', good: true }),
      reqCut: () => ({ t: 'Every requirement is halved', good: true }), lp: () => ({ t: `Legacy Points ×${1 + v}`, good: true }), interview: () => ({ t: `Hiring and mentor chances ${sgn(v)}`, good: v > 0 }),
      trial: () => ({ t: `Rank trial success ${sgn(v)}`, good: true }), laby: () => ({ t: `Labyrinth success ${sgn(v)}`, good: true }), party: () => ({ t: `Party loyalty and strength ${sgn(v)}`, good: true }),
      beastRel: () => ({ t: `Relationship gains with Beastfolk ${sgn(v)}`, good: true }), humanRel: () => ({ t: `Relationship gains with humans ${sgn(v)}`, good: v > 0 }), recover: () => ({ t: `Recovery from lasting injuries ${sgn(v)}`, good: true }),
      sick: () => ({ t: 'Resists poison and sickness', good: true }), agiGrow: () => ({ t: `Agility growth ${sgn(v)}`, good: v > 0 }), overHurt: () => ({ t: v < 0 ? 'Overexertion never hurts' : `Overexertion damage ${sgn(v)}`, good: v < 0 }),
      stressChild: () => ({ t: `Stress as a child ${sgn(v)}`, good: false }), earlyRead: () => ({ t: 'Learns to read early (+50% study as a child)', good: true }), earlyAura: () => ({ t: 'Battle Aura can awaken 2 years early', good: true }),
      tools: () => ({ t: 'Can build and sell magic tools', good: true }), gravity: () => ({ t: 'Can learn gravity magic without a teacher', good: true }), seePot: () => ({ t: 'Reveals hidden potential (yours and others’)', good: true }),
      fly: () => ({ t: 'Flight: cheap travel to any continent', good: true }), shadow: () => ({ t: 'Opens spy and assassin careers', good: true }), noBetray: () => ({ t: 'Never betrayed unknowingly', good: true }),
      foresee: () => ({ t: 'Warned before disasters strike', good: true }), ageless: () => ({ t: 'Your looks never fade with age', good: true }), curseRes: () => ({ t: 'Resists curses', good: true }),
      dragonBlood: () => ({ t: 'Dragon bloodline can awaken (big strength, health, and power boost)', good: true }), noStylePenalty: () => ({ t: 'No penalty for training several sword styles', good: true }),
      noOver: () => ({ t: 'Overexertion never hurts', good: true }), deathSave: () => ({ t: `Survive deadly danger ${sgn(v)} more often`, good: true }), party2: null,
    };
    const f = map[k]; if (f) { const r = f(); if (r) out.push(r); }
  }
  return out;
}

/* ---------- SKILL / RANK / STAT DESCRIPTIONS ---------- */
const SKILL_DESC = {
  fire: 'Offensive flame, from a first Fireball to the city-razing spells of the King ranks. The most destructive element: excellent for hunting, war, and labyrinths.',
  water: 'Water and ice: Water Ball, Ice Lance, and storms at Saint rank. Controlled and versatile, the element of many famous tutors.',
  earth: 'Stone Cannon, Quagmire, walls, and pits. It shapes the battlefield and, in patient hands, beautiful figurines worth real money.',
  wind: 'Blades of air and, at the highest ranks, lightning. Fast spells that land before enemies can react.',
  heal: 'Closes wounds, and at Saint rank and above regrows lost limbs. Every adventuring party and the Millis church want healers.',
  barrier: 'Wards, shields, and magic circles that protect parties, castles, and royalty.',
  detox: 'Purges poison and disease. A detox mage can end a plague and save a city.',
  summon: 'Calls familiars, spirits, and magic beasts through binding contracts. Taught almost only at Ranoa University.',
  gravity: 'Bends weight and force themselves. Almost no one alive can teach it.',
  sg: 'Sword God Style. Overwhelming offense and the fastest first strike in the world. Its heart is the Sword Sanctum in the frozen north.',
  wg: 'Water God Style. Perfect defense and counters: blades and even spells are turned back on the attacker. Its great dojo stands in Asura.',
  ng: 'North God Style. Adaptive and ruthless: any weapon, any terrain, any trick. Its masters wander the world.',
  fund: 'Footwork, grip, and balance. Everything you learn here carries into the style you choose.',
};
const RANK_DESC = [
  'No formal training.',
  'Basic forms and spells. Enough to impress a village.',
  'Reliable in a real fight. Most guards and hedge mages stop here.',
  'A professional’s level. Respected adventurers and court guards reach it.',
  'A major achievement. Saints are known across their region and may certify students.',
  'Among the strongest in a whole region. Kings lead armies and found schools.',
  'Only a handful alive. Emperors are treated as national treasures.',
  'One per style. A living legend whose name will outlast kingdoms.',
];
const AURA_DESC = [
  'Your Battle Aura has not awakened. Conditioning during your growth windows builds capacity until it does.',
  'You can feel aura flowing through your body for the first time.',
  'Aura reinforces parts of your body at will: a fist, a leg, a guard.',
  'Aura covers your entire body. You hit harder, move faster, and shrug off blows.',
  'Your aura extends into your weapon. Steel cuts like it is twice as sharp.',
  'Precise, efficient control. You spend aura only where it matters.',
  'An aura so strong it can be seen. Only legends reach this stage.',
];
const STAT_DESC = {
  str: 'Raw physical power. Raises combat power, sword XP gains, and qualifies you for labor and soldier work.',
  agi: 'Speed and reflexes. Raises combat power, sword XP gains, escape chances, and opens courier and spy work.',
  int: 'Learning and reasoning. Needed for scholarly, magical, and political careers and for the Ranoa entrance exam.',
  cha: 'Presence and persuasion. Improves job interviews, relationships, and tense negotiations.',
  looks: 'Appearance. Helps first impressions and romance between adults.',
  luck: 'Fortune’s favor. Improves finds, gambling, rank trials, and narrow escapes.',
};
const MANA_DESC = {
  cap: 'Mana capacity is how much mana you hold. It grows fastest from training in early childhood and is effectively fixed after your growth windows close. Higher magic ranks require large capacity.',
  pot: 'Innate potential multiplies every gain in capacity. It is hidden until a tutor, test, or Demon Eye reveals it.',
  ctrl: 'Mana control improves with practice for life. It eases Demon Eye strain and is needed for refined casting.',
  eff: 'Efficiency is how much of your mana becomes spell. Each point adds to magic XP gains.',
  chant: 'Chantless casting means casting without a spoken incantation. It is easiest to discover as a small child and grows almost impossible later.',
};

/* ---------- ITEMS ---------- */
function I(id, name, slot, price, o) { return Object.assign({ id, name, slot, price, fx: {}, power: 0, minAge: 12, where: 'any', desc: '' }, o || {}); }
const ITEMS = [
  I('practice_sword', 'Practice Sword', 'weapon', 12, { power: 2, minAge: 6, desc: 'A balanced wooden sword. Good for drills, useless against a wyvern.' }),
  I('iron_sword', 'Iron Longsword', 'weapon', 70, { power: 6, desc: 'Plain, reliable iron. The standard sidearm of guards across Asura.' }),
  I('steel_sword', 'Steel Bastard Sword', 'weapon', 280, { power: 10, minAge: 14, where: 'size2', desc: 'Dwarf-forged steel with a hand-and-a-half grip.' }),
  I('wyvern_spear', 'Wyvern-Bone Spear', 'weapon', 650, { power: 13, minAge: 15, where: 'guild', desc: 'Light and vicious. Favored by Demon Continent adventurers.' }),
  I('mithril_blade', 'Mithril Blade', 'weapon', 2400, { power: 18, fx: { xp: { sword: .10 } }, minAge: 16, where: 'size3', desc: 'A blade that holds Battle Aura like water in a cup. Sword XP +10%.' }),
  I('oak_staff', 'Oak Staff', 'staff', 25, { minAge: 4, fx: { xp: { magic: .05 } }, desc: 'A simple focus for a beginning mage. Magic XP +5%.' }),
  I('crystal_staff', 'Mana-Crystal Staff', 'staff', 420, { power: 4, fx: { xp: { magic: .12 }, manaEff: .05 }, where: 'size3', desc: 'Topped with a small mana crystal from Begaritt. Magic XP +12%, efficiency +5.' }),
  I('archmage_staff', 'Archmage’s Staff', 'staff', 3600, { power: 10, fx: { xp: { magic: .25 }, manaEff: .10 }, minAge: 15, where: 'university', desc: 'Commissioned from Ranoa’s artificers. Magic XP +25%, efficiency +10.' }),
  I('tutor_staff', 'Roxy’s Old Staff', 'staff', 0, { unique: true, power: 5, fx: { xp: { water: .25, magic: .10 } }, desc: 'Worn smooth by years of travel. A gift from your first teacher. Water XP +25%, magic XP +10%.' }),
  I('leather', 'Leather Armor', 'armor', 55, { power: 2, fx: { injury: -.10 }, desc: 'Boiled leather. Injury damage −10%.' }),
  I('chainmail', 'Chainmail Hauberk', 'armor', 260, { power: 4, fx: { injury: -.20 }, minAge: 14, where: 'size2', desc: 'Heavy rings of riveted iron. Injury damage −20%.' }),
  I('dragonscale', 'Dragonscale Coat', 'armor', 4800, { power: 9, fx: { injury: -.35 }, minAge: 16, where: 'size3', desc: 'Red wyrm scales on a leather backing. Injury damage −35%.' }),
  I('magic_armor', 'Magic Armor Prototype', 'armor', 12000, { power: 30, fx: { injury: -.45 }, minAge: 18, where: 'university', desc: 'A walking suit of enchanted plate powered by mana crystals. Combat power +30.' }),
  I('luck_charm', 'Migurd Luck Charm', 'trinket', 90, { minAge: 4, fx: { st: { luck: 2 } }, desc: 'Woven blue thread from the Migurd tribe. +2 Luck.' }),
  I('mending_ring', 'Ring of Mending', 'trinket', 380, { fx: { regen: 6 }, where: 'size2', desc: 'A silver ring with a healing glyph. Regain 6 health a year.' }),
  I('saint_pendant', 'Saint’s Pendant', 'trinket', 520, { fx: { stress: -.15 }, where: 'church', desc: 'Blessed in Millishion. Stress taken −15%.' }),
  I('scholars_lens', 'Scholar’s Lens', 'trinket', 300, { fx: { xp: { study: .15 } }, where: 'university', desc: 'A monocle ground from mana glass. Study XP +15%.' }),
  I('room', 'Rented Room', 'home', 40, { minAge: 15, fx: { stress: -.05 }, desc: 'A room of your own above a tavern. Stress taken −5%.' }),
  I('cottage', 'Cottage', 'home', 1100, { minAge: 16, fx: { stress: -.10 }, desc: 'A small house with a garden. Stress taken −10% and rest restores more.' }),
  I('townhouse', 'Townhouse', 'home', 5200, { minAge: 18, fx: { stress: -.18 }, where: 'size3', desc: 'Three floors in the city with a study and a training yard. Stress taken −18%.' }),
  I('manor', 'Manor', 'home', 38000, { minAge: 20, fx: { stress: -.25, fame: .25 }, where: 'size3', desc: 'An estate with servants and land. Stress taken −25%, fame gained +25%.' }),
  I('horse', 'Riding Horse', 'mount', 240, { minAge: 14, desc: 'Halves travel costs on your own continent.' }),
  I('land_dragon', 'Land Dragon Cart', 'mount', 1600, { minAge: 16, where: 'size3', desc: 'A docile land dragon and covered cart. Halves all travel costs.' }),
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));

/* ---------- VOWS: an optional hardship chosen at birth, for more Legacy Points ---------- */
const VOWS = [
  { id: 'poverty', name: 'Vow of Poverty', icon: 'coin', lp: .30, short: 'Keep no more than 300 gold', desc: 'At the end of every year, any gold above 300 is given to people who need it. Generous giving earns a little fame.' },
  { id: 'humility', name: 'Vow of Humility', icon: 'feather', lp: .35, short: 'Fame never rises above 59', desc: 'You will never be more than locally known. The Emperor and God trials need regional fame, so they stay out of reach.' },
  { id: 'solitude', name: 'Vow of Solitude', icon: 'moon', lp: .15, short: 'No romance or marriage', desc: 'You walk this life without a partner or spouse. Friends, family, students, and adopted children are all still welcome.' },
  { id: 'hermit', name: 'Vow of the Hermit', icon: 'leaf', lp: .15, short: 'One fewer social point a year', desc: 'You keep to yourself: one fewer social point every year, but never fewer than one.' },
];
const VOW = Object.fromEntries(VOWS.map(v => [v.id, v]));

/* ---------- PATRONAGE: great works that turn gold into fame, lasting bonuses, and legacy ---------- */
const WK = (id, name, cost, minAge, o) => Object.assign({ id, name, cost, minAge, fame: 0, lp: 0, fameReq: 0 }, o);
const WORKS = [
  WK('well', 'A Village Well', 800, 18, { icon: 'drop', fame: 10, lp: 5, fx: { stress: -.04 }, eff: 'Fame +10 · Stress taken −4%', desc: 'Pay for a stone well in a village that walks miles for water.', done: 'The village names it after you.' }),
  WK('bridge', 'A Stone Bridge', 2500, 20, { icon: 'mountain', fame: 20, lp: 6, fx: { regen: 3 }, eff: 'Fame +20 · Regain 3 health a year', desc: 'Replace a rotten ford with a bridge that will outlast you.', done: 'Merchants stop cursing that river.' }),
  WK('scholarship', 'A Ranoa Scholarship', 4000, 20, { icon: 'book2', fame: 30, lp: 10, fx: { xp: { study: .10, magic: .05 } }, eff: 'Fame +30 · Study XP +10% · Magic XP +5%', desc: 'Endow a scholarship for poor students at Ranoa University of Magic.', done: 'The first students write to thank you.' }),
  WK('hall', 'A Free Training Hall', 7000, 22, { icon: 'sword', fame: 40, lp: 17, fx: { xp: { sword: .08, aura: .08 } }, eff: 'Fame +40 · Sword and Battle Aura XP +8%', desc: 'Build a hall where anyone can learn the sword for free.', done: 'You drop in to spar when you can.' }),
  WK('shrine', 'A Wayside Shrine', 12000, 25, { icon: 'sun', fame: 60, lp: 30, fx: { stress: -.08, regen: 4 }, eff: 'Fame +60 · Stress taken −8% · Regain 4 health a year', desc: 'Raise a shrine and a rest house on a hard road.', done: 'Travelers leave flowers and gossip.' }),
  WK('library', 'The Great Library', 25000, 30, { icon: 'book', fame: 100, lp: 60, fx: { xp: { magic: .10, study: .10 } }, eff: 'Fame +100 · Magic and Study XP +10%', desc: 'Found a library open to every race, with copies of grimoires no one else will lend.', done: 'Scholars from three continents come to read.' }),
  WK('statue', 'A Statue in Your Likeness', 50000, 35, { icon: 'crown', fame: 160, lp: 120, fameReq: 60, fx: { fame: .15 }, eff: 'Fame +160 · Fame gained +15%', desc: 'Commission a bronze statue for the main square.', done: 'The pigeons approve.' }),
  WK('expedition', 'An Expedition Beyond the Map', 90000, 35, { icon: 'ship', fame: 250, lp: 210, fameReq: 150, eff: 'Fame +250 · Charts the Heaven Continent for your Compendium', desc: 'Finance ships, guides, and a dozen brave fools to chart the Heaven Continent and the seas no map shows.', done: 'Months later, the first charts of the Heaven Continent arrive with your name on them.' }),
];
const WORK = Object.fromEntries(WORKS.map(w => [w.id, w]));
WORK.scholarship.lc = 'a scholarship at Ranoa';
const workLc = (w) => w.lc || w.name.toLowerCase();
const SLOTS_GEAR = [['weapon', 'Weapon'], ['staff', 'Focus'], ['armor', 'Armor'], ['trinket', 'Trinket'], ['home', 'Residence'], ['mount', 'Mount']];

/* ---------- ACTIVITIES ---------- */
const ACTIVITIES = [
  { id: 'explore', grp: 'Around town', name: 'Explore the area', minAge: 6, note: 'Wander the streets and wilds. Anything can happen.' },
  { id: 'library', grp: 'Around town', name: 'Read at the library', minAge: 6, size: 2, note: 'Reading and Intelligence, plus a chance to find something unusual.' },
  { id: 'tavern', grp: 'Around town', name: 'Listen for rumors at the tavern', minAge: 15, note: 'Hear news, meet adventurers, and catch wind of opportunities.' },
  { id: 'pray', grp: 'Around town', name: 'Pray at the chapel', minAge: 3, note: 'Quiet your mind. Faith is sometimes rewarded.' },
  { id: 'gamble', grp: 'Around town', name: 'Play dice for 10 gold', minAge: 16, note: 'Luck decides. The house usually wins.' },
  { id: 'groom', grp: 'Around town', name: 'Bathhouse and barber (15 gold)', minAge: 13, size: 2, note: 'Look after yourself. A small, lasting lift to Looks, and a calmer mind.' },
  { id: 'oddjobs', grp: 'Around town', name: 'Run errands for coin', minAge: 8, note: 'A little gold for a lot of walking.' },
  { id: 'spar', grp: 'Training grounds', name: 'Spar at the training grounds', minAge: 8, note: 'Sword XP and bruises. Sometimes a rival shows up.' },
  { id: 'hunt', grp: 'Training grounds', name: 'Hunt in the wilds', minAge: 12, note: 'Pelts, meat, and danger. Uses your combat power.' },
  { id: 'meditate', grp: 'Reflection', name: 'Meditate', minAge: 5, note: 'Mana control and calm. Lowers stress.' },
  { id: 'journal', grp: 'Reflection', name: 'Write in your journal', minAge: 7, note: 'Lowers stress and sharpens the mind.' },
  { id: 'grave', grp: 'Reflection', name: 'Visit a loved one’s grave', minAge: 4, note: 'Grief eases a little each visit.' },
  { id: 'craft', grp: 'Crafts and charity', name: 'Craft, or sculpt figurines with earth magic', minAge: 8, note: 'Crafting XP and income. Earth magic at Intermediate unlocks figurines.' },
  { id: 'healpoor', grp: 'Crafts and charity', name: 'Heal the sick for free', minAge: 8, note: 'Healing XP and fame. Needs Beginner healing.' },
  { id: 'volunteer', grp: 'Crafts and charity', name: 'Volunteer at the orphanage', minAge: 10, note: 'Lowers stress and earns goodwill.' },
];

/* ---------- PEOPLE TEXT ---------- */
const DREAMS = ['wants to join the Holy Knights of Millis', 'dreams of opening a bakery in Ars', 'hopes to study at Ranoa University', 'wants to become an A-rank adventurer', 'plans to inherit the family farm', 'wants to see the Heaven Continent', 'hopes to master the Water God Style', 'dreams of sailing the Ring Sea', 'wants to write a history of the Laplace War', 'hopes to become a court mage', 'wants to open a shop that sells magic tools', 'dreams of a quiet house by a lake', 'wants to find a lost relative', 'hopes to earn a knighthood', 'wants to map every labyrinth in Begaritt'];
const QUIRKS = ['hums when nervous', 'is terrified of spiders', 'never forgets a birthday', 'laughs far too loudly', 'keeps a lucky coin in one boot', 'talks to horses more than people', 'cannot resist sweets', 'collects pressed flowers', 'sleeps through anything', 'is always the first to volunteer', 'argues with priests for fun', 'carves little animals out of wood', 'knows every tavern song by heart', 'reads by candlelight until dawn'];
const TALK_LINES = {
  kind: ['“Did you eat today? Here, take this.”', '“I’m always on your side, you know.”'],
  proud: ['“Naturally, I’m the best at it. But you’re… not bad.”', '“Don’t embarrass me in front of the others.”'],
  shy: ['They mumble something, then smile when you smile back.', 'They talk about their hobby for an hour once they finally get going.'],
  cheerful: ['“Today’s going to be a good day. I can feel it!”', 'Their laugh carries down the whole street.'],
  stern: ['“Hm. You’ve improved. Don’t let it go to your head.”', '“Discipline first. Fun later. Maybe.”'],
  curious: ['“How does mana actually work? Tell me everything.”', 'They pepper you with questions about places you’ve been.'],
  greedy: ['“If you hear about any treasure, you’ll tell me first, right?”', 'They spend half the talk complaining about prices.'],
  loyal: ['“Whatever happens, I’ve got your back.”', '“You can count on me. You always could.”'],
  playful: ['They steal your hat and make you chase them for it.', 'They challenge you to a race and cheat shamelessly.'],
  serious: ['“We should talk about the future.”', 'They ask what you really want out of life, and wait for an honest answer.'],
  gentle: ['They listen without interrupting until you’re done.', 'They bring you tea and sit in comfortable silence.'],
  'hot-tempered': ['“Who said that? Point them out to me.”', 'They rant about a rival until they run out of breath, then grin.'],
  witty: ['“Two mages walk into a tavern…” The joke is terrible. You laugh anyway.', 'Their running commentary on passersby is merciless and hilarious.'],
  dreamy: ['“Do you ever wonder what’s past the edge of the map?”', 'They describe a dream so vividly you can almost see it.'],
};
function relLabel(p) {
  if (!p.alive) return 'Remembered';
  const o = p.op;
  if (p.role === 'rival') return o <= -70 ? 'Nemesis' : 'Rival';
  if (['mother','father','guardian','sibling','twin','child','grandchild'].includes(p.role)) return o >= 80 ? 'Devoted' : o >= 50 ? 'Close' : o >= 20 ? 'Warm' : o >= -20 ? 'Distant' : 'Estranged';
  if (p.role === 'spouse' || p.role === 'partner') return o >= 80 ? 'Deeply in love' : o >= 50 ? 'Happy' : o >= 20 ? 'Steady' : 'Strained';
  if (p.role === 'mentor') return o >= 60 ? 'Trusted student' : o >= 25 ? 'Student' : 'Probationary student';
  return o >= 90 ? 'Best friend' : o >= 60 ? 'Close friend' : o >= 30 ? 'Friend' : o >= 0 ? 'Acquaintance' : o >= -40 ? 'Unfriendly' : 'Enemy';
}

/* ---------- GOALS (per life, rewarded once) ---------- */
function GL(id, grp, name, desc, check, rw) { return { id, grp, name, desc, check, rw }; }
const GOALS = [
  GL('g_words', 'Growth', 'First Words', 'Speak your first words.', L => [(L.cnt.talk || 0) >= 1 ? 1 : 0, 1], { gold: 0, xp: 20, lp: 5 }),
  GL('g_read50', 'Growth', 'Literate', 'Reach Reading 50.', L => [Math.min(50, L.read), 50], { xp: 40, lp: 5 }),
  GL('g_read100', 'Growth', 'Well Read', 'Reach Reading 100.', L => [Math.min(100, L.read), 100], { xp: 120, lp: 15 }),
  GL('g_str15', 'Growth', 'Strong', 'Reach 15 Strength.', L => [Math.min(15, Math.floor(L.st.str)), 15], { xp: 60, lp: 10 }),
  GL('g_agi15', 'Growth', 'Swift', 'Reach 15 Agility.', L => [Math.min(15, Math.floor(L.st.agi)), 15], { xp: 60, lp: 10 }),
  GL('g_int15', 'Growth', 'Brilliant', 'Reach 15 Intelligence.', L => [Math.min(15, Math.floor(L.st.int)), 15], { xp: 60, lp: 10 }),
  GL('g_cha15', 'Growth', 'Magnetic', 'Reach 15 Charisma.', L => [Math.min(15, Math.floor(L.st.cha)), 15], { gold: 60, lp: 10 }),
  GL('g_mana500', 'Magic', 'Mana Well', 'Reach 500 mana capacity.', L => [Math.min(500, L.mana.cap), 500], { xp: 60, lp: 10 }),
  GL('g_mana2000', 'Magic', 'Mana Lake', 'Reach 2,000 mana capacity.', L => [Math.min(2000, L.mana.cap), 2000], { xp: 150, lp: 25 }),
  GL('g_mana6000', 'Magic', 'Mana Sea', 'Reach 6,000 mana capacity.', L => [Math.min(6000, L.mana.cap), 6000], { xp: 400, lp: 60 }),
  GL('g_mag2', 'Magic', 'Spellcaster', 'Reach Intermediate in any magic.', L => [Math.min(2, bestMagic(L)), 2], { xp: 60, gold: 20, lp: 10 }),
  GL('g_mag3', 'Magic', 'Adept', 'Reach Advanced in any magic.', L => [Math.min(3, bestMagic(L)), 3], { xp: 150, gold: 60, lp: 20 }),
  GL('g_mag4', 'Magic', 'Magic Saint', 'Pass a Saint trial in any magic.', L => [Math.min(4, bestMagic(L)), 4], { xp: 400, gold: 200, lp: 50 }),
  GL('g_chant', 'Magic', 'Silent Casting', 'Discover chantless casting.', L => [L.mana.chantless ? 1 : 0, 1], { xp: 200, lp: 40 }),
  GL('g_style', 'Swordsmanship', 'Chosen Path', 'Choose a sword style.', L => [L.sword.styleChosen ? 1 : 0, 1], { xp: 40, lp: 5 }),
  GL('g_sw2', 'Swordsmanship', 'Swordsman', 'Reach Intermediate in any sword style.', L => [Math.min(2, bestSword(L)), 2], { xp: 60, gold: 20, lp: 10 }),
  GL('g_sw3', 'Swordsmanship', 'Blademaster', 'Reach Advanced in any sword style.', L => [Math.min(3, bestSword(L)), 3], { xp: 150, gold: 60, lp: 20 }),
  GL('g_sw4', 'Swordsmanship', 'Sword Saint', 'Pass a Saint trial in any sword style.', L => [Math.min(4, bestSword(L)), 4], { xp: 400, gold: 200, lp: 50 }),
  GL('g_aura1', 'Swordsmanship', 'Awakened', 'Awaken your Battle Aura.', L => [L.aura.stage >= 1 ? 1 : 0, 1], { xp: 80, lp: 15 }),
  GL('g_aura3', 'Swordsmanship', 'Iron Body', 'Reach Full Body Reinforcement.', L => [Math.min(3, L.aura.stage), 3], { xp: 250, lp: 40 }),
  GL('g_friends', 'Bonds', 'Good Company', 'Have 3 friends at 50 relationship or higher.', L => [Math.min(3, L.people.filter(p => p.alive && p.role === 'friend' && p.op >= 50).length), 3], { gold: 30, lp: 10 }),
  GL('g_best', 'Bonds', 'Kindred Spirit', 'Reach 90 relationship with anyone.', L => [L.people.some(p => p.alive && p.op >= 90) ? 1 : 0, 1], { gold: 50, lp: 15 }),
  GL('g_mentor', 'Bonds', 'A True Teacher', 'Gain a mentor.', L => [L.people.some(p => p.alive && p.role === 'mentor') ? 1 : 0, 1], { xp: 60, lp: 10 }),
  GL('g_love', 'Bonds', 'Sweetheart', 'Start dating someone (adults only).', L => [L.partner || L.spouse ? 1 : 0, 1], { gold: 40, lp: 10 }),
  GL('g_married', 'Bonds', 'Vows', 'Get married.', L => [L.spouse ? 1 : 0, 1], { gold: 150, lp: 25 }),
  GL('g_parent', 'Bonds', 'New Life', 'Raise a child.', L => [L.people.some(p => p.role === 'child') ? 1 : 0, 1], { gold: 100, lp: 25 }),
  GL('g_job', 'Fortune', 'Employed', 'Get a job.', L => [L.job || L.cnt.jobs ? 1 : 0, 1], { gold: 30, lp: 5 }),
  GL('g_promo', 'Fortune', 'Promoted', 'Earn a promotion.', L => [(L.cnt.promos || 0) >= 1 ? 1 : 0, 1], { gold: 80, lp: 10 }),
  GL('g_gold500', 'Fortune', 'Savings', 'Hold 500 gold.', L => [Math.min(500, L.gold), 500], { xp: 50, lp: 10 }),
  GL('g_gold5000', 'Fortune', 'Wealthy', 'Hold 5,000 gold.', L => [Math.min(5000, L.gold), 5000], { xp: 150, lp: 30 }),
  GL('g_home', 'Fortune', 'A Place of My Own', 'Buy a cottage or better.', L => [['cottage','townhouse','manor'].includes(L.gear.home) ? 1 : 0, 1], { xp: 60, lp: 20 }),
  GL('g_school', 'Fortune', 'Graduate', 'Graduate from any school.', L => [L.edu.done.length ? 1 : 0, 1], { xp: 120, gold: 50, lp: 20 }),
  GL('g_guild', 'Adventure', 'Adventurer', 'Register at the Adventurer Guild.', L => [L.guild.reg ? 1 : 0, 1], { gold: 30, lp: 5 }),
  GL('g_guildC', 'Adventure', 'Seasoned', 'Reach guild rank C.', L => [Math.min(3, L.guild.reg ? L.guild.rank : 0), 3], { gold: 150, xp: 120, lp: 25 }),
  GL('g_guildA', 'Adventure', 'Elite', 'Reach guild rank A.', L => [Math.min(5, L.guild.reg ? L.guild.rank : 0), 5], { gold: 600, xp: 300, lp: 60 }),
  GL('g_quests', 'Adventure', 'Quest Log', 'Complete 10 quests.', L => [Math.min(10, L.cnt.quests || 0), 10], { gold: 120, xp: 100, lp: 20 }),
  GL('g_travel2', 'Adventure', 'Traveler', 'Set foot on 2 continents.', L => [Math.min(2, L.visited.length), 2], { gold: 40, lp: 10 }),
  GL('g_travel4', 'Adventure', 'Globetrotter', 'Set foot on 4 continents.', L => [Math.min(4, L.visited.length), 4], { gold: 200, lp: 40 }),
  GL('g_fame', 'Adventure', 'Making a Name', 'Reach regional fame.', L => [Math.min(60, Math.floor(L.fame)), 60], { gold: 100, lp: 20 }),
  GL('g_earned', 'Adventure', 'Marked by Deeds', 'Earn 3 traits through your deeds.', L => [Math.min(3, L.earned.length), 3], { xp: 200, lp: 40 }),
  GL('g_arc', 'Adventure', 'A Story Worth Telling', 'Complete any story arc.', L => [Object.values(L.arc || {}).some(v => v >= 99) ? 1 : 0, 1], { xp: 150, gold: 100, lp: 30 }),
  GL('g_arcs3', 'Adventure', 'Saga', 'Complete three story arcs in one life.', L => [Math.min(3, Object.values(L.arc || {}).filter(v => v >= 99).length), 3], { xp: 400, gold: 300, lp: 80 }),
  GL('g_age60', 'The Long Life', 'Silver Years', 'Live to 60.', L => [Math.min(60, L.age), 60], { xp: 100, lp: 20 }),
  GL('g_age100', 'The Long Life', 'A Century', 'Live to 100.', L => [Math.min(100, L.age), 100], { gold: 300, xp: 200, lp: 60 }),
  GL('g_age200', 'The Long Life', 'Two Centuries', 'Live to 200.', L => [Math.min(200, L.age), 200], { gold: 800, xp: 500, lp: 120 }),
  GL('g_grand', 'The Long Life', 'Grandparent', 'Meet a grandchild.', L => [L.people.some(p => p.role === 'grandchild') ? 1 : 0, 1], { gold: 100, lp: 25 }),
  GL('g_teacher', 'The Long Life', 'Teacher', 'Take on three students over your life.', L => [Math.min(3, L.people.filter(p => p.role === 'student').length), 3], { xp: 200, lp: 40 }),
  GL('g_memoir', 'The Long Life', 'Ink and Memory', 'Write your memoirs.', L => [L.flags.memoir ? 1 : 0, 1], { lp: 40 }),
  GL('g_founder', 'The Long Life', 'Founder', 'Complete “A School of Your Own.”', L => [(L.arc || {}).school >= 99 ? 1 : 0, 1], { gold: 500, lp: 80 }),
  GL('g_patron', 'Fortune', 'Patron', 'Fund three works of patronage.', L => [Math.min(3, Object.keys(L.works || {}).length), 3], { lp: 40 }),
];
const GOAL = Object.fromEntries(GOALS.map(g => [g.id, g]));

/* ---------- ACHIEVEMENT REWARDS ---------- */
const RW = { s: { lp: 10, gold: 25, xp: 40 }, m: { lp: 25, gold: 80, xp: 100 }, l: { lp: 60, gold: 250, xp: 250 }, xl: { lp: 150, gold: 1000, xp: 600 } };

/* ---------- STORY ARCS ---------- */
const ARCS = [
  { id: 'tutor', name: 'A Tutor from Afar', blurb: 'A traveling mage answers your family’s notice and changes the course of your childhood.', chapters: [
    ['The Blue-Haired Mage', 'Show promise with magic as a small child in the Central Continent, and a tutor may come.'],
    ['Beyond the Village', 'Keep studying with your tutor. She plans a test outside the village.'],
    ['The Storm Test', 'Your tutor has one final lesson for you.'],
    ['Letters from Shirone', 'Your tutor has moved on. Watch for her letters.']] },
  { id: 'boreas', name: 'The Boreas Household', blurb: 'A noble house in Roa needs a tutor for a child no one can teach.', chapters: [
    ['A Position in Roa', 'Show talent in Fittoa between ages 7 and 10.'],
    ['The Unteachable Young Lady', 'Win over the young lady of House Boreas.'],
    ['Lessons with a Sword King', 'Trade lessons with the household’s Sword King.'],
    ['A Tenth Birthday', 'Celebrate with the household.']] },
  { id: 'displaced', name: 'The Displacement Incident', blurb: 'A catastrophe of light scatters the people of Fittoa across the world.', chapters: [
    ['The Sky Turns White', 'Live in the Fittoa Region of Asura.'],
    ['Stranded', 'Survive wherever the light threw you.'],
    ['Coin for the Road', 'Earn enough gold to keep moving.'],
    ['Across the Sea', 'Reach a port and find a way across.'],
    ['The Search Party', 'Find your family’s trail on the Millis Continent.'],
    ['Home', 'Travel back to Fittoa.']] },
  { id: 'ranoa', name: 'Ranoa University of Magic', blurb: 'The greatest school of magic in the world, and its very strange students.', chapters: [
    ['The Special Students', 'Enroll at Ranoa University in Sharia.'],
    ['Kings of the Back Halls', 'Settle in at the university.'],
    ['The Silent Seven Star', 'Someone in the research tower needs help.'],
    ['The Princess’s Council', 'A royal exile is gathering allies.'],
    ['Commencement', 'Finish your studies.']] },
  { id: 'labyrinth', name: 'The Teleport Labyrinth', blurb: 'A missing family member is found, sealed in crystal deep beneath Begaritt.', chapters: [
    ['A Letter from Begaritt', 'If someone in your family is still missing, news may find you as an adult.'],
    ['Into the Labyrinth', 'Travel to Rapan on the Begaritt Continent.'],
    ['The Guardian', 'Reach the labyrinth’s heart.'],
    ['What Remains', 'Care for the one you rescued.']] },
  { id: 'mangod', name: 'The Man-God’s Game', blurb: 'A smiling god visits your dreams with advice that always seems to help.', chapters: [
    ['The White Void', 'Dreams come to those the Man-God finds interesting.'],
    ['Good Advice', 'Decide whether to trust the voice in your dreams.'],
    ['The Price of Advice', 'Every gift has a cost.'],
    ['The Dragon God’s Offer', 'The Man-God’s enemy has noticed you.']] },
  { id: 'asura', name: 'The Asura Succession', blurb: 'A princess in exile fights for the throne of the richest kingdom in the world.', chapters: [
    ['A Princess in Exile', 'Earn renown, or meet the princess at Ranoa.'],
    ['Knives on the Road', 'Escort the princess toward Ars.'],
    ['The Water God’s Blade', 'Face the rival faction’s champion.'],
    ['Coronation', 'See the princess crowned.']] },
  { id: 'sanctum', name: 'The Snow Sanctum', blurb: 'The frozen home of Sword God Style tests everyone who climbs its stairs.', chapters: [
    ['The Gate in the Snow', 'Train at the Sword Sanctum.'],
    ['Swords of the Sanctum', 'Survive the other disciples.'],
    ['The Sword God’s Eye', 'Catch the attention of the Sword God.']] },
  { id: 'laplace', name: 'Laplace’s Shadow', blurb: 'The Demon God will return one day. Someone has to be ready.', chapters: [
    ['The Dragon God’s Warning', 'Become strong enough that the Dragon God seeks you out.'],
    ['An Alliance for the Future', 'Gather allies and fortune.'],
    ['The Long Preparation', 'Leave the world ready for the war to come.']] },
  { id: 'school', name: 'A School of Your Own', blurb: 'Every master was a student once. Now it is your turn to open the doors.', chapters: [
    ['The Empty Hall', 'Reach Saint rank in any discipline, then find a hall to teach in (300 gold or fame 100).'],
    ['First Students', 'Choose who walks through your doors.'],
    ['The Rival School', 'Teach for three years. Someone will come for your students.'],
    ['Your Name on the Gate', 'Teach for seven years.']] },
  { id: 'longroad', name: 'The Long Road', blurb: 'For those who live long enough to outlive the world they were born into.', chapters: [
    ['Those Who Grow Old', 'Live to 100, or outlive the friends of your youth.'],
    ['The Children of Your Children', 'Live to see your bloodline branch (about 115 years).'],
    ['A World Remade', 'Live for 150 years.'],
    ['The Weight of Years', 'Live for 200 years.']] },
  { id: 'laplace_war', name: 'The Second Laplace War', blurb: 'The Demon God returns, as the Dragon God warned. The whole world goes to war, in your lifetime or your heirs’.', chapters: [
    ['The Demon God Returns', 'Be at least 16 when the foretold year comes (year 500, or 80 years after the Dragon God’s warning).'],
    ['The Gathering of Armies', 'Answer the alliance’s call.'],
    ['The Battle of the Red Sky', 'Stand on the field when Laplace marches.'],
    ['After the War', 'Help the world rebuild.']] },
];
const ARC = Object.fromEntries(ARCS.map(a => [a.id, a]));
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
