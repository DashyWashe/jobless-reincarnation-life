/* ===== RACES ===== */
const RACES = [
  { id:'human', name:'Human', weight:55, coming:15, life:[60,80], manaWin:[5,10], auraWin:[6,15,24,30], pot:1.0, aura:1.0, auraNone:.15,
    tags:{}, st:{}, desc:'Versatile and everywhere. Most careers and kingdoms are built for them.',
    hair:['#3b2a20','#5a3d2b','#1c1714','#c9a25b','#8e3b22','#a4562e','#a9a39a'], eyes:['#5b3a24','#3f6fa8','#4d7b4a','#6e7680','#8a6d3b'], skin:['#f3d6c1','#e8c0a1','#d6a27e','#b57d57','#8c5a3c','#5e3b28'], birth:{buena:6,roa:5,ars:6,sharia:4,shirone:4,border:4,sanctum:1,redwyrm:1,millishion:5,zant:4,rikarisu:1,rapan:2,oasis:1,meadowmere:2} },
  { id:'elf', name:'Elf', weight:6, coming:30, life:[400,600], manaWin:[10,20], auraWin:[10,30,60,90], pot:1.4, aura:.6, auraNone:.35,
    tags:{magic:2,senses:1.5,body:.6,sword:.8}, st:{int:2,agi:1,str:-2}, desc:'Long-lived and gifted with magic. Children grow slowly and few are born.',
    hair:['#d9dde0','#efe2b0','#d8b45c','#9cc7a4'], eyes:['#4d8a5a','#4a78b5','#7d5aa8'], skin:['#f6e2d3','#ead2bf','#dcbfa6'], birth:{silverleaf:8,sharia:1,millishion:1} },
  { id:'dwarf', name:'Dwarf', weight:5, coming:20, life:[180,220], manaWin:[4,8], auraWin:[6,20,45,60], pot:.8, aura:1.2, auraNone:.10,
    tags:{craft:2.5,body:1.5,magic:.7}, st:{str:3,agi:-2}, desc:'Sturdy craftspeople of the mountain holds. Earth magic and the forge come naturally.',
    hair:['#8e3b22','#5a3d2b','#1c1714','#b5652d'], eyes:['#5b3a24','#6e7680'], skin:['#ecc8ad','#d6a27e','#b57d57'], birth:{ironroot:8,ars:1,rapan:1} },
  { id:'halfling', name:'Halfling', weight:5, coming:15, life:[90,110], manaWin:[4,8], auraWin:[6,15,28,35], pot:.9, aura:.8, auraNone:.20,
    tags:{luck:2.5,senses:1.5,body:.8}, st:{agi:3,str:-2,luck:2}, desc:'Small, quick, and famously lucky. They settle the quiet countryside.',
    hair:['#5a3d2b','#7a4a2a','#b88a4a'], eyes:['#5b3a24','#4d7b4a'], skin:['#f3d6c1','#e8c0a1','#d6a27e'], birth:{meadowmere:8,zant:1} },
  { id:'beastfolk', name:'Beastfolk', weight:8, coming:15, life:[70,90], manaWin:[4,6], auraWin:[5,13,26,35], pot:.7, aura:1.6, auraNone:.05,
    tags:{body:2,aura:2,senses:2,magic:.6,mind:.8}, st:{str:2,agi:2,int:-1}, desc:'Keen-sensed warrior clans of the Great Forest, born with the strongest aura affinity.',
    hair:['#7a4a2a','#efe9e0','#1c1714','#c4632f','#8d8d8d'], eyes:['#c8902c','#4d8a5a','#d8a520'], skin:['#f0d2b8','#d6a27e','#a8754f'], birth:{doldia:9,zant:1}, ears:'beast' },
  { id:'migurd', name:'Migurd', weight:4, coming:15, life:[180,220], manaWin:[5,10], auraWin:[6,16,30,40], pot:1.3, aura:.5, auraNone:.45,
    tags:{magic:2,mind:1.3,body:.6}, st:{int:1,str:-2}, desc:'A small demon race who speak mind to mind within their tribe. Many become mages.',
    hair:['#4f7fd0','#3a62b0','#6d9be6','#2d4f8f'], eyes:['#3f6fd0','#2d4f8f'], skin:['#f3e0d0','#ead2bf'], birth:{migurd_village:9,rikarisu:1} },
  { id:'superd', name:'Superd', weight:1, coming:15, life:[800,1200], manaWin:[5,10], auraWin:[6,20,70,100], pot:1.0, aura:1.5, auraNone:.05,
    tags:{sword:1.8,senses:2.5,aura:1.5}, st:{agi:3,str:2,cha:-3}, desc:'Peerless warriors with a forehead gem that senses all life. An old curse makes the world fear them.',
    hair:['#2f8f5a','#3aa36a','#287a4c'], eyes:['#c8902c','#b0412e'], skin:['#efe6dc','#e2d4c6'], birth:{superd_camp:10}, gem:true },
  { id:'demonkin', name:'Demonkin', weight:9, coming:15, life:[100,300], manaWin:[5,10], auraWin:[6,15,28,40], pot:1.2, aura:1.1, auraNone:.15,
    tags:{dark:2,magic:1.3,body:1.2}, st:{}, desc:'The many demon clans. Strong and varied, but distrusted in Millis lands.',
    hair:['#6d3fa0','#9b2335','#e8e4ef','#1c1714','#2f8a8a'], eyes:['#c0392b','#7d3fa8','#d8a520'], skin:['#d8c7d6','#b8b4c8','#e7c9b0','#9aa3b5'], birth:{rikarisu:5,demon_fort:6}, horns:true },
  { id:'seafolk', name:'Sea Folk', weight:3, coming:15, life:[130,170], manaWin:[4,8], auraWin:[6,15,28,40], pot:1.0, aura:1.0, auraNone:.20,
    tags:{magic:1.3,body:1.2}, st:{agi:2}, desc:'Rulers of the ocean routes. They cross the sea freely and favor water magic.',
    hair:['#2a8c8c','#3c9e88','#26517a'], eyes:['#2f9e8c','#3a7fa0'], skin:['#e3ecea','#cfdcd8','#b9cfcb'], birth:{tidereef:9,zant:1}, fins:true },
  { id:'heavenfolk', name:'Heaven Folk', weight:2, coming:20, life:[280,320], manaWin:[5,10], auraWin:[6,20,45,60], pot:1.2, aura:1.0, auraNone:.20,
    tags:{holy:2,senses:1.5}, st:{agi:2}, desc:'Winged people of the Heaven Continent, bound to sacred duties.',
    hair:['#f2f0ea','#efe2b0','#d9dde0'], eyes:['#5aa3d8','#d8a520'], skin:['#f8eadf','#efdccc'], birth:{sky_temple:10}, wings:true },
  { id:'dragon', name:'Dragon-blooded', weight:.3, coming:20, life:[900,1100], manaWin:[10,20], auraWin:[8,25,70,100], pot:1.6, aura:1.6, auraNone:0,
    tags:{dragon:4,aura:2,magic:1.5}, st:{str:3,cha:1}, desc:'Ultra rare descendants of dragons. Immense power sleeps in the blood.',
    hair:['#9b2335','#1c1714','#d9dde0'], eyes:['#d8a520','#c8902c'], skin:['#f0dccd','#e2c6b0'], birth:{redwyrm:5,ars:1,sky_temple:1}, horns:true },
];
const RACE = Object.fromEntries(RACES.map(r => [r.id, r]));

/* ===== CONTINENTS & TOWNS ===== */
const CONTINENTS = [
  { id:'central', name:'Central Continent', blurb:'Asura’s wealth, Ranoa’s magic, the Sword Sanctum, and war-torn borders.' },
  { id:'millis', name:'Millis Continent', blurb:'The Holy Country of Millis, the Great Forest, and busy ports.' },
  { id:'demon', name:'Demon Continent', blurb:'Harsh lands of demon clans and cheap, deadly adventuring.' },
  { id:'begaritt', name:'Begaritt Continent', blurb:'Desert, mana crystals, and the deadliest labyrinths.' },
  { id:'heaven', name:'Heaven Continent', blurb:'Sky-high home of the Heaven Folk. Hard to reach.' },
];
const CONT = Object.fromEntries(CONTINENTS.map(c => [c.id, c]));
const TOWNS = [
  { id:'buena', name:'Buena Village', cont:'central', realm:'Asura Kingdom (Fittoa)', size:1, tags:['rural','fittoa'], note:'Quiet farmland in the Fittoa Region.' },
  { id:'roa', name:'Roa', cont:'central', realm:'Asura Kingdom (Fittoa)', size:3, tags:['fittoa','guild'], note:'Fittoa’s walled seat, home of a great noble house.' },
  { id:'ars', name:'Ars', cont:'central', realm:'Asura Kingdom', size:4, tags:['capital','court','guild','dojo_water','military'], note:'Asura’s royal capital. Wealth, court intrigue, and the Water God dojo.' },
  { id:'sharia', name:'Sharia', cont:'central', realm:'Kingdom of Ranoa', size:3, tags:['university','guild'], note:'The Magic City, home of Ranoa University of Magic.' },
  { id:'shirone', name:'Shirone', cont:'central', realm:'Kingdom of Shirone', size:4, tags:['capital','court','guild','military'], note:'A proud royal capital in the south.' },
  { id:'border', name:'Thornwall', cont:'central', realm:'Conflict Zone', size:2, tags:['war','guild'], note:'A border town in the Conflict Zone. Wars come often.' },
  { id:'sanctum', name:'Sword Sanctum', cont:'central', realm:'Northern Lands', size:1, tags:['sanctum'], note:'Snowbound home of Sword God Style.' },
  { id:'redwyrm', name:'Red Wyrm Foothills', cont:'central', realm:'Red Wyrm Mountains', size:1, tags:['danger','dragon'], note:'Wild hamlets under dragon-haunted peaks.' },
  { id:'ironroot', name:'Ironroot Hold', cont:'central', realm:'Dwarven Holds', size:2, tags:['forge','guild'], note:'A dwarven hold carved into the northern mountains.' },
  { id:'meadowmere', name:'Meadowmere', cont:'central', realm:'Asura Kingdom', size:1, tags:['rural'], note:'Rolling halfling farm country.' },
  { id:'millishion', name:'Millishion', cont:'millis', realm:'Holy Country of Millis', size:4, tags:['capital','church','guild','military','seminary'], note:'The holy capital. Holy Knights, the church, and distrust of demons.' },
  { id:'doldia', name:'Doldia Village', cont:'millis', realm:'Great Forest', size:1, tags:['forest','beast'], note:'A Beastfolk village deep in the Great Forest. The Holy Beast lives here.' },
  { id:'silverleaf', name:'Silverleaf Glade', cont:'millis', realm:'Great Forest', size:1, tags:['forest','elven'], note:'A hidden elven settlement, slow to welcome outsiders.' },
  { id:'zant', name:'Port Zant', cont:'millis', realm:'Holy Country of Millis', size:3, tags:['port','guild'], note:'A sea port bustling with sailors and adventurers.' },
  { id:'tidereef', name:'Tide Reef', cont:'millis', realm:'Sea Folk Realm', size:2, tags:['sea'], note:'A Sea Folk city where the reef meets the shore.' },
  { id:'rikarisu', name:'Rikarisu', cont:'demon', realm:'Demon Continent', size:3, tags:['guild','demon'], note:'A crater city of demon adventurers. Rumors of a hungry empress.' },
  { id:'migurd_village', name:'Migurd Village', cont:'demon', realm:'Migurd Lands', size:1, tags:['demon','rural'], note:'A quiet tribe that speaks without words.' },
  { id:'superd_camp', name:'Superd Refuge', cont:'demon', realm:'Demon Continent wilds', size:1, tags:['demon','hidden'], note:'A hidden camp of the last Superd.' },
  { id:'demon_fort', name:'Clan Stronghold', cont:'demon', realm:'Demon Clan Lands', size:2, tags:['demon','guild'], note:'A fortress of a demon clan ruled by strength.' },
  { id:'rapan', name:'Rapan', cont:'begaritt', realm:'Begaritt', size:3, tags:['labyrinth','guild'], note:'The Labyrinth City, built around mana-crystal dungeons.' },
  { id:'oasis', name:'Sunwell Oasis', cont:'begaritt', realm:'Begaritt', size:1, tags:['desert'], note:'A desert oasis on the caravan roads.' },
  { id:'sky_temple', name:'Sky Temple', cont:'heaven', realm:'Heaven Continent', size:2, tags:['sacred'], note:'A temple city above the clouds.' },
];
const TOWN = Object.fromEntries(TOWNS.map(t => [t.id, t]));
const SIZE_NAMES = ['','Village','Town','City','Capital'];

/* ===== BIRTH BACKGROUNDS (43) =====
   wealth 0-5, cls: 0 commoner,1 wealthy,2 knight,3 noble,4 royal; ex: special effects */
function B(id, name, tier, wealth, cls, desc, o) { return Object.assign({ id, name, tier, wealth, cls, desc, races:null, towns:null, tags:{}, jobs:['Laborer','Laborer'], ex:{} }, o || {}); }
const BACKGROUNDS = [
  // Common
  B('farm','Poor farming household','common',0,0,'Chores from age 6, little money, strong bodies.',{tags:{body:1.4},towns:['rural'],jobs:['Farmer','Farmer'],ex:{chores:1}}),
  B('fishing','Fishing village family','common',0,0,'Up before dawn on the boats. Nimble and weathered.',{tags:{body:1.2},towns:['port','sea','rural'],jobs:['Fisher','Net mender'],ex:{chores:1}}),
  B('miner','Miner’s family','common',0,0,'Dust, lamplight, and strong arms.',{tags:{body:1.4,craft:1.2},towns:['forge','rural','labyrinth'],jobs:['Miner','Ore sorter'],ex:{chores:1}}),
  B('woodcutter','Woodcutter’s cabin','common',0,0,'A cabin at the forest edge, far from schools.',{tags:{body:1.3,senses:1.2},towns:['rural','forest'],jobs:['Woodcutter','Herbalist'],ex:{chores:1}}),
  B('laborer','Laborer’s family','common',0,0,'City work for city wages. Never quite enough.',{tags:{life:1.2},towns:['city','capital'],jobs:['Laborer','Washer']}),
  B('shepherd','Shepherd family','common',0,0,'Hillside flocks and long, quiet days.',{tags:{senses:1.3},towns:['rural'],jobs:['Shepherd','Weaver'],ex:{chores:1}}),
  B('orphan','Street orphan','common',0,0,'No parents, a crowded orphanage, and quick wits.',{tags:{luck:1.5,senses:1.3},towns:['city','capital','port'],jobs:[],ex:{orphan:1}}),
  B('inn','Innkeeper’s family','common',1,0,'Adventurers pass through every night with stories.',{tags:{social:1.4},towns:['guild'],jobs:['Innkeeper','Cook'],ex:{guildTales:1}}),
  B('merchant','Merchant family','common',2,1,'Money for tutors, an eye for bargains, and trade contacts.',{tags:{life:1.3,social:1.2},jobs:['Merchant','Bookkeeper']}),
  B('craftsman','Craftsman’s workshop','common',1,0,'Sawdust, sparks, and an apprenticeship waiting.',{tags:{craft:1.6},jobs:['Blacksmith','Carpenter']}),
  B('baker','Baker’s family','common',1,0,'Warm bread and every neighbor’s gossip.',{tags:{social:1.3},jobs:['Baker','Baker']}),
  B('courier','Courier family','common',1,0,'Always on the road between towns.',{tags:{body:1.2,luck:1.2},jobs:['Courier','Stablehand']}),
  // Uncommon
  B('healer','Village healer’s family','uncommon',1,0,'Early healing-magic exposure, trusted by villagers.',{tags:{holy:2},jobs:['Healer','Herbalist'],ex:{magicStart:'heal'}}),
  B('military','Military household','uncommon',1,0,'Early drills and discipline. A parent may be sent to war.',{tags:{sword:1.5,body:1.3},towns:['capital','city','war'],jobs:['Soldier','Quartermaster'],ex:{swordStart:1}}),
  B('adventurers','Adventurer parents','uncommon',1,0,'Parents who live quest to quest, and teach you both blade and spell.',{tags:{sword:1.3,magic:1.3},towns:['guild'],jobs:['Adventurer','Adventurer'],ex:{swordStart:1,guildTales:1}}),
  B('mercenary','Mercenary camp','uncommon',1,0,'Raised among sellswords. Rough, but you learn to fight.',{tags:{sword:1.6,dark:1.2},towns:['war','guild'],jobs:['Mercenary','Camp cook'],ex:{swordStart:1}}),
  B('hunter','Hunter’s lodge','uncommon',1,0,'Tracking, traps, and reading the wind.',{tags:{senses:1.8},towns:['rural','forest','danger'],jobs:['Hunter','Tanner']}),
  B('church','Devout Millis family','uncommon',1,0,'Prayers, scripture, and a firm view of demons.',{tags:{holy:2},towns:['church','city'],races:['human'],jobs:['Deacon','Scribe'],ex:{church:1}}),
  B('performers','Traveling performers','uncommon',1,0,'A wagon troupe. You grow up on stage and on the road.',{tags:{social:1.8},jobs:['Bard','Acrobat'],ex:{travel:1}}),
  B('sailor','Sailor’s family','uncommon',1,0,'Ships, salt, and ports on every continent.',{tags:{body:1.2,luck:1.2},towns:['port','sea'],jobs:['Sailor','Dockmaster']}),
  B('scribe','Scribe’s household','uncommon',2,0,'Books everywhere. You read before you can run.',{tags:{mind:1.8},towns:['city','capital','university'],jobs:['Scribe','Archivist'],ex:{books:1}}),
  B('knight','Knight’s household','uncommon',2,2,'A sword tutor at home and a path to squire.',{tags:{sword:1.8},jobs:['Knight','Healer'],ex:{swordStart:1,swordTutor:1}}),
  B('alchemist','Alchemist’s shop','uncommon',2,0,'Bubbling flasks, strange smells, and magic ingredients.',{tags:{craft:1.5,magic:1.3},jobs:['Alchemist','Apothecary'],ex:{books:1}}),
  // Rare
  B('professor','Magic professor’s family','rare',3,1,'Spellbooks in every room and a letter for the academy.',{tags:{magic:2,mind:1.5},jobs:['Magic Professor','Researcher'],ex:{books:1,magicStart:'any',academyRec:1}}),
  B('guild_rich','Wealthy merchant guild family','rare',4,1,'Private tutors and connections in every port.',{tags:{social:1.5,life:1.3},towns:['city','capital','port'],jobs:['Guild Master','Merchant'],ex:{tutor:1}}),
  B('demon_clan','Demon clan family','rare',1,0,'Clan trials, clan pride, and suspicion in human lands.',{races:['demonkin','migurd','superd'],tags:{dark:1.5,body:1.3},jobs:['Clan Warrior','Clan Mage'],ex:{clan:1}}),
  B('elven','Isolated elven settlement','rare',1,0,'A long childhood, deep magic, and a closed world.',{races:['elf'],tags:{magic:1.6},towns:['elven'],jobs:['Grove Warden','Spellweaver'],ex:{magicStart:'any'}}),
  B('forge_clan','Dwarven forge clan','rare',2,1,'Generations of master smiths. The forge is your nursery.',{races:['dwarf'],tags:{craft:2.2},towns:['forge'],jobs:['Master Smith','Runecarver']}),
  B('beast_clan','Beastfolk warrior clan','rare',1,0,'Clan trials of strength in the Great Forest.',{races:['beastfolk'],tags:{body:1.5,aura:1.6},towns:['beast'],jobs:['Clan Warrior','Tracker'],ex:{swordStart:1}}),
  B('minor_noble','Minor noble family','rare',3,3,'Private tutors, etiquette lessons, and inheritance politics.',{tags:{social:1.5,mind:1.2},towns:['city','capital','fittoa'],jobs:['Lord','Lady of the house'],ex:{tutor:1,noble:1}}),
  B('court_mage','Court mage’s family','rare',3,1,'A parent serves the crown with magic. Court is your playground.',{tags:{magic:1.8},towns:['capital'],jobs:['Court Mage','Courtier'],ex:{books:1,magicStart:'any'}}),
  B('superd_exile','Superd exile camp','rare',0,0,'The last warriors of a feared race. The training is merciless.',{races:['superd'],tags:{sword:1.6,senses:1.5},towns:['hidden'],jobs:['Superd Warrior','Superd Warrior'],ex:{swordStart:1}}),
  // Epic
  B('major_noble','Major noble dynasty','epic',5,3,'Court access, heavy expectations, and assassination risk.',{tags:{social:1.6},towns:['capital','fittoa'],jobs:['Count','Countess'],ex:{tutor:1,noble:2,assassins:1}}),
  B('exiles','Exiled aristocrats','epic',1,1,'A hidden claim to a title, old enemies, and little money.',{tags:{social:1.3,dark:1.3},jobs:['Exiled Lord','Exiled Lady'],ex:{claim:1,assassins:1}}),
  B('sanctum_line','Sword Sanctum lineage','epic',2,2,'Born into a family of Sword God Style masters.',{tags:{sword:2.4},towns:['sanctum'],jobs:['Sword Saint','Sword Saint'],ex:{swordStart:2,style:'sg',swordTutor:1}}),
  B('water_dojo','Water God dojo family','epic',3,2,'Your family runs a Water God Style dojo in the capital.',{tags:{sword:2.2},towns:['capital'],jobs:['Water Saint','Dojo Keeper'],ex:{swordStart:2,style:'wg',swordTutor:1}}),
  B('holy_knight','Holy Knight family of Millis','epic',3,2,'Holy blades and church politics.',{races:['human'],tags:{holy:1.6,sword:1.6},towns:['church'],jobs:['Holy Knight','Priestess'],ex:{swordStart:1,church:1}}),
  B('demon_lord_kin','Immortal Demon Lord’s kin','epic',3,3,'Distant blood of an Immortal Demon Lord. Immense mana, dangerous politics.',{races:['demonkin'],tags:{magic:2,dark:1.6},towns:['demon'],jobs:['Demon Noble','Demon Noble'],ex:{manaBoost:.5,noble:1}}),
  // Legendary
  B('royal','Royal family','legendary',5,4,'Succession politics from birth. Talent not guaranteed.',{races:['human'],towns:['court'],tags:{social:1.6},jobs:['King','Queen'],ex:{tutor:1,royal:1,assassins:2}}),
  B('heaven_temple','Heaven Folk temple family','legendary',3,2,'Keepers of a sacred temple above the clouds.',{races:['heavenfolk'],tags:{holy:2},towns:['sacred'],jobs:['Temple Keeper','Oracle'],ex:{church:0}}),
  B('archmage_heir','Archmage’s heir','legendary',4,1,'One parent is a King-rank mage. Expectations are crushing.',{tags:{magic:2.5},jobs:['Archmage','Scholar'],ex:{books:1,magicStart:'any',manaBoost:.4,tutor:1}}),
  // Mythic
  B('dragon_line','Ancient dragon bloodline','mythic',2,1,'A dormant dragon bloodline that may awaken years later.',{tags:{dragon:5,aura:1.5},ex:{traitBoost:{dragon_blood:.45}}}),
  B('seven_child','Child of a Great Power','mythic',3,2,'One parent sits among the Seven Great Powers.',{tags:{sword:1.6,magic:1.6,aura:1.4},jobs:['One of the Seven Great Powers','Wanderer'],ex:{swordStart:2,tutor:1,fameStart:50}}),
];
const BG = Object.fromEntries(BACKGROUNDS.map(b => [b.id, b]));

/* ===== SEASONS ===== */
const SEASONS = [
  { id:'spring', name:'Spring', tags:{body:1.2}, fx:{xp:{body:.05}}, note:'+5% body XP' },
  { id:'summer', name:'Summer', tags:{magic:1.1}, fx:{xp:{fire:.10}}, note:'+10% fire magic XP' },
  { id:'autumn', name:'Autumn', tags:{mind:1.2}, fx:{xp:{study:.05}}, note:'+5% study XP' },
  { id:'winter', name:'Winter', tags:{life:1.2}, fx:{xp:{water:.10},maxHp:5}, note:'+10% water magic XP, +5 max health' },
];
const SEASON = Object.fromEntries(SEASONS.map(s => [s.id, s]));

/* ===== BIRTH OMENS ===== luck shifts rarity toward higher tiers */
const OMENS = [
  { id:'clear', name:'Clear Skies', weight:40, luck:0, tags:{}, note:'An ordinary day. No special influence.' },
  { id:'gentle_rain', name:'Gentle Rain', weight:12, luck:0, tags:{social:1.6}, note:'Social traits more likely.' },
  { id:'harvest_moon', name:'Harvest Moon', weight:10, luck:.05, tags:{life:1.5,craft:1.4}, note:'Life and craft traits more likely; family gets a good year.' },
  { id:'falling_star', name:'Falling Star', weight:8, luck:.30, tags:{luck:1.6}, note:'Rarity luck up; luck traits more likely.' },
  { id:'thunder', name:'Thunder at Birth', weight:6, luck:.10, tags:{sword:1.4,magic:1.2}, boost:{wind_affinity:3}, note:'Sword and magic traits more likely; Wind Affinity ×3.' },
  { id:'quake', name:'Earthquake', weight:5, luck:.10, tags:{body:1.6}, boost:{earth_affinity:3}, note:'Body traits more likely; Earth Affinity ×3.' },
  { id:'aurora', name:'Aurora Lights', weight:5, luck:.15, tags:{aura:2.2}, note:'Battle Aura traits much more likely.' },
  { id:'holy_bells', name:'Holy Bells', weight:4, luck:.15, tags:{holy:2.5}, note:'Healing and holy traits much more likely.' },
  { id:'spirit_lights', name:'Spirit Lights', weight:4, luck:.15, tags:{senses:1.6}, boost:{spirit_sight:3,spirit_speaker:3}, note:'Senses traits more likely; spirit traits ×3.' },
  { id:'silent_night', name:'Silent Night', weight:4, luck:.10, tags:{mind:2}, note:'Mind traits much more likely.' },
  { id:'mana_storm', name:'Mana Storm', weight:3, luck:.25, tags:{magic:2.5}, note:'Magic traits much more likely; rarity luck up.' },
  { id:'blood_moon', name:'Blood Moon', weight:2.5, luck:.10, tags:{dark:3}, note:'Dark traits much more likely; misfortune follows.' },
  { id:'twin_comets', name:'Twin Comets', weight:1.5, luck:.80, tags:{}, note:'Big rarity luck boost.' },
  { id:'eclipse', name:'Eclipse', weight:1, luck:.50, tags:{}, tierMult:{mythic:3}, note:'Mythic traits ×3; the Man-God takes notice.' },
  { id:'dragon_roar', name:'Dragon’s Roar', weight:.6, luck:.40, tags:{dragon:6}, note:'Dragon traits ×6.' },
  { id:'prismatic', name:'Prismatic Sky', weight:.1, luck:.5, tags:{}, tierMult:{admin:25}, note:'Admin traits ×25.' },
];
const OMEN = Object.fromEntries(OMENS.map(o => [o.id, o]));

/* ===== BIRTH ORDER ===== */
const BIRTH_ORDERS = [
  { id:'only', name:'Only child', weight:25, note:'Your parents’ full attention; a tutor is more likely.' },
  { id:'first', name:'Firstborn', weight:35, note:'First in line to inherit. Younger siblings arrive later.' },
  { id:'middle', name:'Middle child', weight:15, note:'Older and younger siblings. Good at getting along.' },
  { id:'youngest', name:'Youngest', weight:15, note:'Older siblings to look up to, and little inheritance.' },
  { id:'twin', name:'Twin', weight:7, note:'A twin sibling the same age as you.' },
  { id:'late', name:'Late surprise', weight:3, note:'Older parents and much older siblings.' },
];
const BORDER = Object.fromEntries(BIRTH_ORDERS.map(b => [b.id, b]));

/* ===== NAMES ===== */
const NAMES = {
  human:{ m:['Aldric','Bastian','Cedric','Dorian','Edmund','Felix','Gareth','Hugo','Ivo','Jasper','Kellan','Lucan','Matthias','Nolan','Oswin','Percival','Quentin','Roland','Silas','Theo','Ulric','Viktor','Wendel','Alaric','Benedikt','Corin','Dietrich','Emeric','Florian','Gideon','Henrik','Leon'],
          f:['Adela','Brigitte','Celine','Dorothea','Elise','Freya','Greta','Helena','Ilse','Juliane','Katarina','Liesel','Marlene','Nora','Odile','Petra','Rosalind','Sabine','Theda','Ursula','Vera','Wilma','Alina','Clara','Eira','Ingrid','Lotte','Mira','Rhea','Selma'],
          s:['Ashford','Brennholt','Corvane','Dunmere','Everhart','Falkenrath','Grimwald','Hollowell','Ironsby','Kestrel','Lindqvist','Marrow','Northwood','Oakhelm','Pellar','Ravensworth','Stahlberg','Thornfield','Valebrook','Weisser','Ashgrove','Brightwater'] },
  elf:{ m:['Aelion','Caelir','Elrion','Faelar','Ilyndor','Saelis','Thaliorn','Vaelin','Lorien'], f:['Aeria','Celenwe','Elowen','Ilsevel','Lirien','Naeris','Sylvara','Thessaly','Ysolde'], s:['Moonwhisper','Leafsong','Silverbough','Dawnveil','Starbrook'] },
  dwarf:{ m:['Balgrim','Durik','Gorrin','Haldor','Korgun','Durnan','Hargrim','Torvik','Brannoc'], f:['Brynja','Dagny','Helga','Ketta','Sigrun','Thora','Ragna'], s:['Ironroot','Stonebeard','Anvilhand','Deepdelve','Coalbrow'] },
  halfling:{ m:['Bramble','Cobb','Finnick','Merric','Pip','Tobin','Wendle'], f:['Clover','Daisy','Hazel','Poppy','Rosie','Wren','Juniper'], s:['Thistledown','Underbough','Goodbarrel','Hollowfoot','Applewick'] },
  beastfolk:{ m:['Garo','Kaz','Rowl','Taru','Vargas','Zeth','Bram','Ruuk'], f:['Kiri','Mewa','Rinne','Saya','Tisha','Yuna','Fenna'], s:['Fangcrest','Moonfur','Ashpelt','Swiftclaw','Greymane'] },
  migurd:{ m:['Lovik','Merin','Tovi','Fenn','Olun'], f:['Lilo','Missa','Neri','Pella','Rina','Tesse'], s:['Migurdia'] },
  superd:{ m:['Rugen','Varo','Kesh','Dorn','Talek'], f:['Selra','Vyra','Ishka','Moren'], s:['Superdia'] },
  demonkin:{ m:['Azrak','Belzan','Corvix','Draven','Rhazel','Vexar','Zoltan','Kaim'], f:['Ishra','Kaelith','Lilara','Nyx','Vael','Zirra','Sereth'], s:['Ashhorn','Nightspire','Grimfang','Duskborn','Blackvein'] },
  seafolk:{ m:['Coralin','Mareth','Nerun','Pelan','Brine'], f:['Marina','Nerissa','Oceana','Pearl','Tessa'], s:['Wavecrest','Deepcurrent','Saltmere'] },
  heavenfolk:{ m:['Caelum','Sorin','Zephiel','Aurel'], f:['Aurelia','Celestine','Lumi','Seraphel'], s:['Skyborne','Cloudwhite','Dawnfeather'] },
  dragon:{ m:['Draknar','Vorath','Sygmar','Kaelor'], f:['Ryssa','Vyrenne','Azura','Ignessa'], s:['Wyrmblood','Emberscale','Ashwing'] },
};

/* ===== SKILLS & RANKS ===== */
const RANKS = ['Untrained','Beginner','Intermediate','Advanced','Saint','King','Emperor','God'];
const RANK_XP = [0, 1, 120, 450, 1300, 4000, 11000, 28000];
const MAGIC = [
  { id:'fire', name:'Fire', group:'attack', minAge:2, note:'Attack magic' },
  { id:'water', name:'Water', group:'attack', minAge:2, note:'Attack magic' },
  { id:'earth', name:'Earth', group:'attack', minAge:2, note:'Attack magic; lets you sculpt figurines' },
  { id:'wind', name:'Wind', group:'attack', minAge:2, note:'Attack magic' },
  { id:'heal', name:'Healing', group:'holy', minAge:3, note:'Wounds and regeneration' },
  { id:'barrier', name:'Barrier', group:'holy', minAge:5, note:'Shields and wards' },
  { id:'detox', name:'Detoxification', group:'holy', minAge:5, note:'Poisons and diseases' },
  { id:'summon', name:'Summoning', group:'summon', minAge:10, note:'Needs an academy or a summoner mentor' },
  { id:'gravity', name:'Gravity', group:'gravity', minAge:10, note:'Needs Gravity Sense or a legendary teacher' },
];
const MAGIC_ID = Object.fromEntries(MAGIC.map(m => [m.id, m]));
const STYLES = [
  { id:'sg', name:'Sword God Style', short:'Sword God', phil:'Offense', note:'Explosive speed and devastating first strikes.' },
  { id:'wg', name:'Water God Style', short:'Water God', phil:'Defense', note:'Counters, parries, and deflecting spells.' },
  { id:'ng', name:'North God Style', short:'North God', phil:'Adaptive', note:'Tricks, any weapon, fighting through injuries.' },
];
const STYLE = Object.fromEntries(STYLES.map(s => [s.id, s]));
const AURA_STAGES = ['Unawakened','Aura Sensitivity','Partial Body Reinforcement','Full Body Reinforcement','Weapon Reinforcement','Advanced Aura Control','Legendary Aura Manifestation'];
const AURA_CAP = [0, 40, 160, 450, 1000, 2200, 4500];

const GOD_HOLDERS = { sg:'Gal Farion', wg:'Reida Reya', ng:'Kalman III' };
const SEVEN_POWERS = [
  { seat:1, title:'Technique God', name:'(identity unknown)', power:420 },
  { seat:2, title:'Dragon God', name:'Orsted', power:400 },
  { seat:3, title:'Fighting God', name:'Badigadi', power:330 },
  { seat:4, title:'Demon God', name:'Laplace', power:300 },
  { seat:5, title:'Death God', name:'Randolf', power:250 },
  { seat:6, title:'Sword God', name:'Gal Farion', power:220 },
  { seat:7, title:'North God', name:'Kalman III', power:190 },
];

/* ===== SCHOOLS ===== */
const SCHOOLS = [
  { id:'village', name:'Village School', age:[6,12], cost:8, where:'any', xp:{study:28}, note:'Reading, numbers, friends and rivals.' },
  { id:'academy', name:'City Academy', age:[6,14], cost:45, where:'city', xp:{study:45,social:10}, note:'A better school for wealthier families.' },
  { id:'water_dojo', name:'Water God Dojo', age:[6,99], cost:35, where:'dojo_water', xp:{wg:45}, style:'wg', mentor:{skill:'wg',rank:4}, note:'Water God Style under a Saint instructor.' },
  { id:'sanctum', name:'Sword Sanctum', age:[8,99], cost:0, where:'sanctum', invite:true, xp:{sg:80}, style:'sg', mentor:{skill:'sg',rank:5}, note:'Elite Sword God Style training. Invitation or proven skill only.' },
  { id:'ranoa', name:'Ranoa University of Magic', age:[11,99], cost:120, where:'university', years:5, xp:{magic:60,study:20}, note:'Magic ranks, research, and the special-student class.' },
  { id:'military', name:'Military Academy', age:[12,22], cost:40, where:'military', years:4, xp:{sword:35,body:25,work:10}, note:'Officer path, tactics, and aura drills.' },
  { id:'seminary', name:'Millis Seminary', age:[11,30], cost:0, where:'seminary', years:4, xp:{holy:45,study:10}, note:'Healing and barrier magic, and church influence.' },
  { id:'apprentice', name:'Trade Apprenticeship', age:[11,17], cost:0, where:'any', years:3, xp:{craft:40,work:20}, note:'Learn a trade and walk into a job.' },
];
const SCHOOL = Object.fromEntries(SCHOOLS.map(s => [s.id, s]));

/* ===== JOBS =====
   req: {age,str,agi,int,cha,sword,magic,heal,aura,read,edu,cls,fame,guild,race,shadow}
   where: 'any' | town tag | 'city' (size>=3) | 'capital' */
function J(id, name, cat, ladder, pay, o) { return Object.assign({ id, name, cat, ladder, pay, req:{}, where:'any', skill:'work', risk:0, fame:0 }, o || {}); }
const JOBS = [
  // Common
  J('farmer','Farmer','Common',['Farmhand','Farmer','Landholder'],[14,26,48],{req:{age:12},skill:'body'}),
  J('miner','Miner','Common',['Miner','Shift Boss','Mine Foreman'],[20,34,60],{req:{age:14,str:8},where:'forge',skill:'body',risk:.05}),
  J('fisher','Fisher','Common',['Deckhand','Fisher','Boat Owner'],[16,28,50],{req:{age:12},where:'port',skill:'body',risk:.03}),
  J('blacksmith','Blacksmith','Common',['Apprentice Smith','Blacksmith','Master Smith'],[18,40,90],{req:{age:13,str:7},skill:'craft'}),
  J('carpenter','Carpenter','Common',['Apprentice','Carpenter','Master Builder'],[16,34,70],{req:{age:13},skill:'craft'}),
  J('merchant','Merchant','Common',['Shop Clerk','Merchant','Trade Magnate'],[18,50,180],{req:{age:15,int:8,cha:8},skill:'social'}),
  J('innkeeper','Innkeeper','Common',['Serving Hand','Innkeeper','Inn Owner'],[14,30,60],{req:{age:13},skill:'social'}),
  J('cook','Cook','Common',['Kitchen Hand','Cook','Head Chef'],[14,28,62],{req:{age:12},skill:'craft'}),
  J('servant','Servant','Common',['Servant','Head Servant','Steward'],[12,26,55],{req:{age:12},where:'city',skill:'social'}),
  J('laborer','Laborer','Common',['Laborer','Crew Lead','Foreman'],[12,22,40],{req:{age:12},skill:'body',risk:.03}),
  J('courier','Courier','Common',['Runner','Courier','Courier Master'],[14,26,48],{req:{age:12,agi:7},skill:'body'}),
  // Combat
  J('mercenary','Mercenary','Combat',['Sellsword','Squad Leader','Mercenary Captain'],[30,60,140],{req:{age:15,sword:2},where:'war',skill:'sword',risk:.12,fame:1}),
  J('guard','Town Guard','Combat',['Guard','Watch Sergeant','Captain of the Watch'],[22,40,75],{req:{age:15,sword:1,str:7},skill:'sword',risk:.05}),
  J('soldier','Soldier','Combat',['Soldier','Sergeant','Captain','General'],[20,40,90,260],{req:{age:15,str:7},where:'military',skill:'sword',risk:.08,fame:1}),
  J('knight','Knight','Combat',['Knight','Knight Captain','Knight Commander'],[60,120,260],{req:{age:16,sword:3,cls:2},where:'capital',skill:'sword',risk:.06,fame:2}),
  J('royal_guard','Royal Guard','Combat',['Royal Guard','Royal Guard Captain'],[110,240],{req:{age:18,sword:4,fame:30},where:'court',skill:'sword',risk:.05,fame:3}),
  J('instructor','Sword Instructor','Combat',['Assistant Instructor','Instructor','Dojo Master'],[30,70,150],{req:{age:17,sword:3},skill:'sword',fame:1}),
  J('bounty','Bounty Hunter','Combat',['Bounty Hunter','Veteran Hunter','Legendary Hunter'],[35,80,170],{req:{age:16,sword:2,agi:9},where:'guild',skill:'sword',risk:.14,fame:2}),
  J('delver','Labyrinth Delver','Combat',['Delver','Veteran Delver','Labyrinth Master'],[40,90,220],{req:{age:16,sword:2},where:'labyrinth',skill:'sword',risk:.16,fame:2}),
  J('bodyguard','Bodyguard','Combat',['Bodyguard','Head of Security'],[40,110],{req:{age:16,sword:2,str:9},where:'city',skill:'sword',risk:.08}),
  // Magic
  J('magician','Magician','Magic',['Apprentice Magician','Magician','Senior Magician'],[24,55,120],{req:{age:14,magic:2,read:40},skill:'magic'}),
  J('healer','Healer','Magic',['Healer','Senior Healer','Head Healer'],[26,60,130],{req:{age:14,heal:2},skill:'heal',fame:1}),
  J('alchemist','Alchemist','Magic',['Apprentice Alchemist','Alchemist','Master Alchemist'],[22,55,120],{req:{age:14,int:9,read:50},skill:'craft'}),
  J('enchanter','Enchanter','Magic',['Enchanter','Master Enchanter'],[50,140],{req:{age:16,magic:3,read:60},where:'city',skill:'craft'}),
  J('summoner','Summoner','Magic',['Summoner','Master Summoner'],[60,160],{req:{age:16,summon:2},where:'university',skill:'summon'}),
  J('researcher','Magic Researcher','Magic',['Researcher','Senior Researcher','Professor'],[40,90,200],{req:{age:16,magic:3,int:11,edu:'ranoa'},where:'university',skill:'magic',fame:1}),
  J('court_mage','Court Mage','Magic',['Court Mage','Royal Court Magician'],[140,320],{req:{age:18,magic:4,fame:20},where:'court',skill:'magic',fame:3}),
  J('toolsmith','Magic Tool Specialist','Magic',['Tool Specialist','Artificer'],[60,170],{req:{age:16,read:60,tools:1},where:'city',skill:'craft'}),
  // Political
  J('tax','Tax Collector','Political',['Tax Clerk','Tax Collector','Treasury Officer'],[24,50,110],{req:{age:16,int:9,read:60},where:'city',skill:'work'}),
  J('official','Government Official','Political',['Clerk','Official','Senior Official'],[28,60,130],{req:{age:16,int:10,read:70},where:'city',skill:'work'}),
  J('magistrate','Magistrate','Political',['Deputy Magistrate','Magistrate'],[70,150],{req:{age:22,int:12,cha:9,read:80,cls:1},where:'city',skill:'work',fame:1}),
  J('diplomat','Diplomat','Political',['Envoy','Diplomat','Ambassador'],[60,140,300],{req:{age:20,cha:12,int:10,read:80},where:'capital',skill:'social',fame:2}),
  J('advisor','Noble Advisor','Political',['Advisor','Senior Advisor'],[90,200],{req:{age:20,int:12,cha:10,fame:15},where:'court',skill:'work',fame:2}),
  J('minister','Royal Minister','Political',['Minister','Chancellor'],[260,600],{req:{age:28,int:14,cha:12,cls:3,fame:40},where:'court',skill:'work',fame:4}),
  // Special
  J('assassin','Assassin','Special',['Blade for Hire','Shadow','Nightmaster'],[60,160,400],{req:{age:16,agi:12,sword:2,shadow:1},where:'city',skill:'sword',risk:.18}),
  J('spy','Spy','Special',['Informant','Spy','Spymaster'],[40,110,260],{req:{age:16,agi:9,cha:9},where:'capital',skill:'social',risk:.10}),
  J('broker','Information Broker','Special',['Rumormonger','Broker','Shadow Broker'],[30,90,220],{req:{age:16,int:10,cha:9},where:'city',skill:'social'}),
  J('treasure','Treasure Hunter','Special',['Scavenger','Treasure Hunter','Legendary Hunter'],[20,80,220],{req:{age:16,agi:8},skill:'body',risk:.12,fame:1}),
  J('explorer','Explorer','Special',['Scout','Explorer','Cartographer Royal'],[25,70,160],{req:{age:17,agi:8,read:40},skill:'body',risk:.08,fame:2}),
  J('monster_res','Monster Researcher','Special',['Field Assistant','Monster Researcher'],[30,90],{req:{age:16,int:10,read:60},where:'guild',skill:'study',risk:.06}),
  J('scholar','Independent Scholar','Special',['Scholar','Renowned Scholar'],[20,90],{req:{age:16,int:12,read:80},skill:'study',fame:1}),
  J('priest','Priest','Special',['Acolyte','Priest','Bishop','Cardinal'],[14,40,110,300],{req:{age:15,heal:1},where:'church',skill:'holy',fame:1}),
  J('guild_staff','Guild Officer','Special',['Guild Clerk','Guild Officer','Guild Master'],[24,60,180],{req:{age:16,int:8,guild:2},where:'guild',skill:'work',fame:1}),
];
const JOB = Object.fromEntries(JOBS.map(j => [j.id, j]));

/* ===== GUILD ===== */
const GUILD_RANKS = ['F','E','D','C','B','A','S'];
const GUILD_PTS = [0, 10, 30, 70, 150, 300, 600];
const QUEST_DANGER = [12, 22, 34, 48, 64, 84, 112];
const QUEST_TYPES = [
  { id:'hunt', name:'Hunt', w:5, foes:['horned rabbits','a pack of Assault Dogs','a wild boarlord','a Terminate Boa','a rock ogre','a wyvern','a red wyrm'] },
  { id:'escort', name:'Escort', w:3, foes:['a farmer’s cart','a merchant caravan','a noble’s carriage','a pilgrim band','an envoy','a royal courier','a princess in hiding'] },
  { id:'delivery', name:'Delivery', w:3, foes:['a sealed letter','medicine','a strongbox','a cursed relic','a war report','a dragon egg','a forbidden grimoire'] },
  { id:'explore', name:'Explore', w:2, foes:['an old well','a ruined watchtower','a sunken shrine','a collapsed mine','a lost temple','a fallen sky ship','the edge of the world map'] },
  { id:'gather', name:'Gather', w:3, foes:['herbs','glowcaps','mana-crystal shards','wyvern scales','ghostbloom','phoenix ash','dragon moss'] },
  { id:'defense', name:'Defense', w:2, foes:['a farm','a village','a town gate','a border fort','a city wall','a kingdom’s capital','the last refuge'] },
  { id:'labyrinth', name:'Labyrinth', w:2, foes:['a shallow cave','a minor labyrinth','a twisting labyrinth','a deep labyrinth','a guardian labyrinth','an ancient labyrinth','the Teleport Labyrinth'] },
];

/* ===== LEGACY SHOP =====
   cost = price of the first level; each further level costs cost × grow^level.
   fx = modifiers applied once per owned level (see mods()). Perks without fx are wired by id in the engine. */
const UPG_CATS = [
  ['fate', 'Fate and Birth', 'dice', 'Shape the dice that roll before your first breath.'],
  ['start', 'Beginnings', 'sun', 'Gifts waiting in the cradle.'],
  ['time', 'Time and Energy', 'hourglass', 'More actions and social points every year.'],
  ['growth', 'Growth', 'book', 'Faster progress in every discipline.'],
  ['magic', 'Magic', 'flame', 'Mana, spellcraft, and the road to silent casting.'],
  ['sword', 'Sword and Aura', 'sword', 'Steel, footwork, and Battle Aura.'],
  ['body', 'Body and Longevity', 'heart', 'Health, survival, and how long you live.'],
  ['heart', 'Heart and Renown', 'people', 'Stress, relationships, fame, and leadership.'],
  ['fortune', 'Fortune', 'coin', 'Income, treasure, and the guild.'],
  ['lineage', 'Lineage and Legacy', 'crown', 'What passes to your heirs and your next life.'],
];
const U = (id, name, cat, cost, max, note, o) => Object.assign({ id, name, cat, cost, max, note, grow: max > 1 ? 1.5 : 1 }, o || {});
const UPGRADES = [
  // fate and birth
  U('second_glance', 'Second Glance', 'fate', 30, 5, '+1 fate re-roll on the New Life screen per level.', { grow: 1.35 }),
  U('star_watcher', 'Star Watcher', 'fate', 150, 2, 'Rare birth omens (Mana Storm, Twin Comets, Eclipse, Prismatic Sky…) are twice as likely per level.'),
  U('rarity_luck', 'Rarity Luck', 'fate', 350, 3, 'Better odds on every trait roll (stacks to 3).', { grow: 1.4 }),
  U('fate_chooser', 'Fate Chooser', 'fate', 500, 1, 'Pick 2 of your 3 born traits yourself.'),
  U('chosen_start', 'Chosen Start', 'fate', 600, 1, 'Spend 10 bonus points on your starting stats.'),
  U('fated_rare', 'Thread of Fortune', 'fate', 900, 1, 'At least one born trait is always Rare or better.'),
  U('fated_epic', 'Star-Crossed', 'fate', 2400, 1, 'At least one born trait is always Epic or better.'),
  U('fated_legend', 'Chosen by Heaven', 'fate', 5000, 1, 'At least one born trait is always Legendary or better.'),
  // beginnings
  U('birth_purse', 'Nest Egg', 'start', 25, 5, 'Your family starts every life with +100 gold of savings per level.', { grow: 1.6 }),
  U('lucky_star', 'Lucky Star', 'start', 40, 3, '+1 Luck at birth per level.', { fx: { st: { luck: 1 } } }),
  U('fair_features', 'Fair Features', 'start', 40, 3, '+1 Looks at birth per level.', { fx: { st: { looks: 1 } } }),
  U('sturdy_frame', 'Sturdy Frame', 'start', 60, 3, '+1 Strength at birth per level.', { fx: { st: { str: 1 } } }),
  U('light_feet', 'Light Feet', 'start', 60, 3, '+1 Agility at birth per level.', { fx: { st: { agi: 1 } } }),
  U('sharp_mind', 'Sharp Mind', 'start', 60, 3, '+1 Intelligence at birth per level.', { fx: { st: { int: 1 } } }),
  U('silver_tongue', 'Silver Tongue', 'start', 60, 3, '+1 Charisma at birth per level.', { fx: { st: { cha: 1 } } }),
  U('happy_home', 'Happy Home', 'start', 90, 1, '−30% stress taken as a child.', { fx: { stressChild: -.30 } }),
  U('bedtime_stories', 'Bedtime Stories', 'start', 110, 1, 'Books in the house from birth: learn to read early.', { fx: { earlyRead: 1 } }),
  U('early_start', 'Early Start', 'start', 160, 2, '+1 action every year through age 10, per level.', { grow: 1.6, fx: { apEarly: 1 } }),
  U('old_money', 'Old Money', 'start', 1200, 1, 'Your family is born one wealth tier higher (up to Rich), with savings to match.'),
  // time and energy
  U('extra_activity', 'Extra Activity', 'time', 250, 3, '+1 action every year per level.', { grow: 1.6 }),
  U('social_butterfly', 'Social Butterfly', 'time', 200, 2, '+1 social point every year per level.'),
  U('wellspring', 'Wellspring', 'time', 500, 1, 'Wellness bonus actions come easier: health and stress thresholds are relaxed.'),
  U('tireless', 'Tireless', 'time', 1500, 2, '+1 action every year per level, on top of Extra Activity.', { grow: 1.8, fx: { ap: 1 } }),
  U('avatar', 'Avatar of Legend', 'time', 9999, 1, '+2 actions and +1 social point every year, +25% XP to every discipline, +25% Legacy Points.', { fx: { ap: 2, sp: 1, xp: { all: .25 }, lp: .25 } }),
  // growth
  U('diligence', 'Diligence', 'growth', 75, 3, '+4% XP to every discipline per level.', { fx: { xp: { all: .04 } } }),
  U('scholar_habit', 'Scholar’s Habit', 'growth', 80, 2, '+12% study XP per level.', { fx: { xp: { study: .12 } } }),
  U('morning_drills', 'Morning Drills', 'growth', 80, 2, '+12% body training XP per level.', { fx: { xp: { body: .12 } } }),
  U('good_company', 'Good Company', 'growth', 80, 2, '+12% social XP per level.', { fx: { xp: { social: .12 } } }),
  U('craftsman_hands', 'Craftsman’s Hands', 'growth', 90, 2, '+15% crafting XP per level.', { fx: { xp: { craft: .15 } } }),
  U('quick_study', 'Quick Study', 'growth', 450, 2, '+10% XP to every discipline per level.'),
  U('prodigy_spark', 'Prodigy’s Spark', 'growth', 1600, 1, '+25% XP to every discipline.', { fx: { xp: { all: .25 } } }),
  U('past_life', 'Memories of a Past Life', 'growth', 3200, 1, 'Be reborn remembering: read from birth, +2 actions a year through age 10, +20% XP to everything, +30% progress toward silent casting.', { fx: { earlyRead: 1, apEarly: 2, xp: { all: .20 }, chant: .30 } }),
  U('transcendent', 'Transcendent Talent', 'growth', 6000, 1, '+40% XP to every discipline, +25% mana potential, +20% Battle Aura growth.', { fx: { xp: { all: .40 }, manaPot: .25, auraGrow: .20 } }),
  // magic
  U('mages_focus', 'Mage’s Focus', 'magic', 120, 3, '+6% magic XP per level.', { grow: 1.45, fx: { xp: { magic: .06 } } }),
  U('mana_well', 'Deep Mana Well', 'magic', 140, 3, '+10% mana growth from training per level.', { fx: { manaGrow: .10 } }),
  U('born_mage', 'Born Mage', 'magic', 150, 1, 'Magic awakens at birth: practice mana from age 0 with +25% potential.'),
  U('clean_flow', 'Clean Flow', 'magic', 160, 2, '+5 mana efficiency per level.', { fx: { manaEff: .05 } }),
  U('healers_grace', 'Healer’s Grace', 'magic', 200, 2, '+15% holy magic XP per level (healing, barrier, detox).', { fx: { xp: { holy: .15 } } }),
  U('arcane_blood', 'Arcane Bloodline', 'magic', 200, 1, '+30% mana potential and +15% magic XP every life.'),
  U('chant_sense', 'Chant Sense', 'magic', 220, 2, '+25% progress toward chantless casting per level.', { grow: 1.6, fx: { chant: .25 } }),
  U('elemental_affinity', 'Elemental Affinity', 'magic', 260, 2, '+10% attack magic XP per level (fire, water, earth, wind).', { fx: { xp: { attack: .10 } } }),
  U('long_childhood', 'Long Childhood', 'magic', 300, 2, 'Your mana-growth window stays open one year longer per level.'),
  U('summoners_pact', 'Summoner’s Pact', 'magic', 320, 1, '+20% summoning XP and +10% gravity magic XP.', { fx: { xp: { summon: .20, gravity: .10 } } }),
  // sword and aura
  U('practiced_grip', 'Practiced Grip', 'sword', 120, 3, '+6% sword XP per level.', { grow: 1.45, fx: { xp: { sword: .06 } } }),
  U('steady_nerves', 'Steady Nerves', 'sword', 150, 3, '+3% success on every rank trial per level.', { fx: { trial: .03 } }),
  U('wind_footed', 'Wind-Footed', 'sword', 180, 2, '+15% Agility growth per level.', { fx: { agiGrow: .15 } }),
  U('blade_prodigy', 'Blade Prodigy', 'sword', 200, 1, 'Choose a sword style at 5 instead of 8, +2 Strength and Agility.'),
  U('aura_seed', 'Aura Seed', 'sword', 260, 2, '+12% Battle Aura growth per level.', { grow: 1.6, fx: { auraGrow: .12 } }),
  U('late_bloomer', 'Late Bloomer', 'sword', 300, 2, 'Your Battle Aura training window stays open two years longer per level.', { fx: { auraWin: 2 } }),
  U('dojo_lineage', 'Dojo Lineage', 'sword', 650, 1, '+10% sword XP and +5% success on rank trials.', { fx: { xp: { sword: .10 }, trial: .05 } }),
  // body and longevity
  U('hardy', 'Hardy', 'body', 50, 3, '+10 max health per level.', { fx: { maxHp: 10 } }),
  U('strong_immunity', 'Strong Immunity', 'body', 110, 1, 'Fevers and plagues rarely touch you.', { fx: { sick: -.5 } }),
  U('quick_recovery', 'Quick Recovery', 'body', 140, 2, 'Lasting injuries heal twice as often per level, +2 health a year.', { fx: { recover: 1, regen: 2 } }),
  U('iron_const', 'Iron Constitution', 'body', 150, 1, 'Recover 5 health every year.'),
  U('thick_skin', 'Thick Skin', 'body', 200, 2, '−12% damage and injury taken per level.', { fx: { injury: -.12 } }),
  U('longevity', 'Longevity', 'body', 400, 2, '+10% lifespan for every race per level.'),
  U('second_wind', 'Second Wind', 'body', 650, 2, '+15% chance to survive a deadly blow per level.', { grow: 1.6, fx: { deathSave: .15 } }),
  U('elixir_youth', 'Elixir of Youth', 'body', 1800, 1, '+25% lifespan.', { fx: { life: .25 } }),
  U('ageless_grace', 'Ageless Grace', 'body', 2200, 1, 'Your body and looks do not decline with age.', { fx: { ageless: 1 } }),
  U('guardian_spirit', 'Guardian Spirit', 'body', 2800, 1, 'Return from death once per life.', { fx: { revive: 1 } }),
  // heart and renown
  U('serenity', 'Serenity', 'heart', 50, 3, '−6% stress taken per level.', { fx: { stress: -.06 } }),
  U('warm_heart', 'Warm Heart', 'heart', 70, 3, '+8% relationship gains per level.', { fx: { rel: .08 } }),
  U('calm_mind', 'Calm Mind', 'heart', 120, 1, '−25% stress taken.'),
  U('easy_smile', 'Easy Smile', 'heart', 160, 2, '+6% success when asking someone out (adults only) per level.', { fx: { romance: .06 } }),
  U('famous_name', 'A Name People Remember', 'heart', 180, 2, '+15% fame gains per level.', { grow: 1.6, fx: { fame: .15 } }),
  U('stoic_heart', 'Stoic Heart', 'heart', 240, 1, '−30% grief when someone close to you dies.', { fx: { grief: -.30 } }),
  U('born_leader', 'Born Leader', 'heart', 320, 2, '+10% party strength and +8% invite success per level.', { fx: { party: .10 } }),
  // fortune
  U('thrifty', 'Thrifty', 'fortune', 35, 3, '+5% income per level.', { fx: { income: .05 } }),
  U('good_impressions', 'Good Impressions', 'fortune', 100, 2, '+6% hiring and promotion chance per level.', { fx: { interview: .06 } }),
  U('treasure_nose', 'Treasure Nose', 'fortune', 140, 2, '+15% treasure and found gold per level.', { fx: { loot: .15 } }),
  U('guild_patron', 'Guild Patron', 'fortune', 250, 1, '+5 quest power and +15% quest gold in every life.'),
  U('merchant_blood', 'Merchant’s Blood', 'fortune', 320, 2, '+15% income per level.', { grow: 1.6, fx: { income: .15 } }),
  U('family_fortune', 'Family Fortune', 'fortune', 350, 1, 'Your family starts every life with twice the savings.'),
  U('guild_legend', 'Guild Legend', 'fortune', 900, 1, '+10 quest power, +25% quest gold, +15% labyrinth success.', { fx: { quest: 10, questGold: .25, laby: .15 } }),
  U('royal_stipend', 'Royal Stipend', 'fortune', 1200, 2, '+120 gold every year from age 15, per level.', { grow: 1.8, fx: { stipend: 120 } }),
  U('dragon_hoard', 'Dragon’s Hoard', 'fortune', 4500, 1, '+600 gold every year from age 15 and +25% treasure.', { fx: { stipend: 600, loot: .25 } }),
  // lineage and legacy
  U('estate_keeper', 'Estate Keeper', 'lineage', 120, 1, 'Your heir inherits your whole estate instead of 85%.'),
  U('storied_name', 'Storied Name', 'lineage', 220, 1, 'Your heir keeps 40% of your fame instead of 15%.'),
  U('ambition', 'Ambition', 'lineage', 250, 2, '+25% rewards from life goals per level.', { grow: 1.6 }),
  U('legacy_boost', 'Legacy Boost', 'lineage', 300, 1, '+25% Legacy Points from every life.'),
  U('heirloom', 'Heirloom Trait', 'lineage', 400, 1, 'Name one born trait from your last life; your next birth has a 50% chance to carry it.'),
  U('laurels', 'Laurels', 'lineage', 400, 2, '+25% rewards from achievements per level.', { grow: 1.6 }),
  U('family_teachings', 'Family Teachings', 'lineage', 450, 1, 'When you continue as your child, they inherit 15% of your experience in your best discipline.'),
  U('bloodline_memory', 'Bloodline Memory', 'lineage', 650, 1, 'Born traits pass from parent to child twice as often.'),
  U('chronicler', 'Chronicler', 'lineage', 700, 2, '+15% Legacy Points from every life per level.', { grow: 1.7, fx: { lp: .15 } }),
];
function upgCost(u, lv) { if (lv === undefined) lv = (typeof META !== 'undefined' && META.upg[u.id]) || 0; return lv <= 0 ? u.cost : Math.round(u.cost * Math.pow(u.grow || 1, lv) / 5) * 5; }
function upgSpent() { let t = 0; for (const u of UPGRADES) { const n = Math.min(u.max, META.upg[u.id] || 0); for (let i = 0; i < n; i++) t += upgCost(u, i); } return t; }
const UPG = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

/* ===== ACHIEVEMENTS (account-wide, each pays a one-time reward) ===== */
const ACHIEVEMENTS = [
  ['first_words','Early Talker','Speak your first words before age 2.','s','Growth'],
  ['literate','Bookworm','Reach Reading 100.','s','Growth'],
  ['mana_prodigy','Mana Prodigy','Reach 1,000 mana capacity by age 5.','l','Magic'],
  ['mana_ocean','Ocean of Mana','Reach 10,000 mana capacity.','xl','Magic'],
  ['first_spell','First Spell','Reach Beginner in any magic.','s','Magic'],
  ['chantless','Without a Word','Discover chantless casting.','l','Magic'],
  ['chantless_child','Child Prodigy','Discover chantless casting before age 6.','xl','Magic'],
  ['overflow','Pushed Past the Limit','Survive severe mana overexertion as a child.','m','Magic'],
  ['summoner','Summoner','Reach Intermediate in summoning.','m','Magic'],
  ['gravity','Weight of the World','Reach Beginner in gravity magic.','l','Magic'],
  ['first_style','A Chosen Path','Choose a sword style.','s','Swordsmanship'],
  ['aura_awake','Aura Awakened','Awaken your Battle Aura.','m','Swordsmanship'],
  ['aura_legend','Legendary Aura','Reach Legendary Aura Manifestation.','xl','Swordsmanship'],
  ['tri_style','Three Schools','Reach Advanced in all three sword styles.','l','Swordsmanship'],
  ['dual_saint','Sword and Sorcery','Reach Saint in both a sword style and a magic.','xl','Swordsmanship'],
  ['rank_saint','Saint','Reach Saint rank in any skill.','m','Mastery'],
  ['rank_king','King','Reach King rank in any skill.','l','Mastery'],
  ['rank_emperor','Emperor','Reach Emperor rank in any skill.','xl','Mastery'],
  ['rank_god','God','Reach God rank in any skill.','xl','Mastery'],
  ['married','Married','Marry the person you love.','m','Bonds'],
  ['big_family','Full House','Raise five children.','l','Bonds'],
  ['grandparent','Grandparent','Live to meet a grandchild.','m','Bonds'],
  ['beloved','Beloved','Reach 100 relationship with someone.','m','Bonds'],
  ['nemesis','Nemesis','Reach −100 relationship with a rival.','s','Bonds'],
  ['mentor_found','Student','Gain a mentor.','s','Bonds'],
  ['party_full','Full Party','Lead a party of six.','m','Bonds'],
  ['first_job','First Paycheck','Get your first job.','s','Fortune'],
  ['career_top','Top of the Ladder','Reach the top of a career.','l','Fortune'],
  ['rich','Comfortable','Hold 10,000 gold.','m','Fortune'],
  ['tycoon','Tycoon','Hold 1,000,000 gold.','xl','Fortune'],
  ['homeowner','Homeowner','Buy a cottage or better.','m','Fortune'],
  ['manor_lord','Lord of the Manor','Buy a manor.','l','Fortune'],
  ['benefactor','Benefactor','Fund your first work of patronage.','s','Fortune'],
  ['vow_kept','A Vow Kept','Live to 60 under a vow taken at birth.','l','Legacy'],
  ['great_patron','Pillar of the Realm','Fund every work of patronage in a single life.','xl','Fortune'],
  ['well_armed','Well Armed','Own a Mithril Blade or Dragonscale Coat.','m','Fortune'],
  ['figurines','Figurine Master','Sell 10 figurines.','m','Fortune'],
  ['gambler','Lady Luck','Win big at the dice table.','s','Fortune'],
  ['graduate','Graduate','Graduate from any school.','m','Fortune'],
  ['ranoa_grad','Ranoa Graduate','Graduate from Ranoa University.','l','Fortune'],
  ['guild_reg','Adventurer','Register at the Adventurer Guild.','s','Adventure'],
  ['guild_s','S-Rank','Reach S rank in the Adventurer Guild.','xl','Adventure'],
  ['labyrinth','Labyrinth Conqueror','Clear a labyrinth.','l','Adventure'],
  ['wanderer','Wanderer','Set foot on all five continents.','l','Adventure'],
  ['war_vet','War Veteran','Survive a war.','m','Adventure'],
  ['healer','Healer of the Poor','Heal the sick for free 10 times.','m','Adventure'],
  ['famous','Famous Abroad','Reach international fame.','l','Adventure'],
  ['legend','Living Legend','Reach legendary fame.','xl','Adventure'],
  ['seven','One of the Seven','Earn a seat among the Seven Great Powers.','xl','Adventure'],
  ['demon_feast','Royal Feast','Feed the starving Demon Empress.','m','Story'],
  ['dragon_god','Met the Dragon God','Survive a meeting with the Dragon God.','l','Story'],
  ['holy_beast','Friend of the Forest','Earn the Holy Beast’s bond.','m','Story'],
  ['superd','Green-Haired Ally','Earn a Superd warrior’s trust.','m','Story'],
  ['dead_end','Dead End','Travel with a Superd in your party.','m','Story'],
  ['displaced','Long Way Home','Survive the Displacement Incident and return.','l','Story'],
  ['mangod_no','Not Your Pawn','Refuse the Man-God three times.','l','Story'],
  ['arc_tutor','A Tutor from Afar','Complete the story arc.','m','Story'],
  ['arc_boreas','The Boreas Household','Complete the story arc.','m','Story'],
  ['arc_ranoa','Commencement','Complete the Ranoa University arc.','l','Story'],
  ['arc_labyrinth','The Crystal Heart','Complete the Teleport Labyrinth arc.','l','Story'],
  ['arc_mangod','The Dragon God’s Choice','Complete the Man-God’s Game arc.','l','Story'],
  ['arc_asura','Kingmaker','Complete the Asura Succession arc.','xl','Story'],
  ['arc_sanctum','Snowbound','Complete the Snow Sanctum arc.','l','Story'],
  ['arc_laplace','Watchman of the Ages','Complete Laplace’s Shadow.','xl','Story'],
  ['arc_school','Founder','Complete “A School of Your Own.”','l','Story'],
  ['arc_longroad','The Long Road','Complete “The Long Road.”','xl','Story'],
  ['arc_laplace_war','The War Ends','Complete “The Second Laplace War.”','xl','Story'],
  ['laplace_slayer','Demon God’s Bane','Strike down Laplace with your own hand.','xl','Story'],
  ['royal_birth','Born to Rule','Be born into a royal family.','m','Legacy'],
  ['mythic_birth','Touched by Myth','Be born with a Mythic trait.','m','Legacy'],
  ['admin_birth','System Error','Be born with an Admin trait by pure luck.','xl','Legacy'],
  ['fate_fav','Fate’s Favorite','Be born with three Legendary-or-better traits.','xl','Legacy'],
  ['heir','The Story Continues','Continue your story as your own child.','m','Legacy'],
  ['dynasty','Dynasty','Play five generations of one bloodline.','xl','Legacy'],
  ['ten_lives','Ten Lives','Live ten lives.','l','Legacy'],
  ['centenarian','Centenarian','Live to 100.','m','Legacy'],
  ['bicentennial','Bicentennial','Live to 200.','l','Legacy'],
  ['five_centuries','Five Centuries','Live to 500.','xl','Legacy'],
  ['millennium','Millennium','Live to 1,000.','xl','Legacy'],
  ['phoenix','Rise Again','Return from death with a Phoenix Soul.','m','Legacy'],
  ['world_scholar','Student of the World','Record 100 discoveries in the World Compendium.','l','Legacy'],
  ['all_seen','Nothing Left Unseen','Complete the World Compendium.','xl','Legacy'],
].map(([id, name, desc, rw, cat]) => ({ id, name, desc, rw, cat }));
const ACH = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
