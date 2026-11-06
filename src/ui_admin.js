/* ===================== ADMIN CONSOLE ===================== */
const ADMIN_TABS = [
  ['cheats', 'Cheats', 'bolt'], ['character', 'Character', 'user'], ['stats', 'Stats', 'target'], ['skills', 'Skills', 'crown'],
  ['traits', 'Traits', 'gem'], ['people', 'People', 'people'], ['world', 'World', 'globe'], ['career', 'Career', 'work'],
  ['items', 'Items', 'shield'], ['story', 'Story', 'flag'], ['events', 'Events', 'scroll'], ['legacy', 'Legacy', 'trophy'], ['inspect', 'Inspector', 'eye'],
];
/* canon characters the console can summon (they keep their canon protections: never romanceable) */
const CANON_CAST = [
  { id: 'roxy', name: 'Roxy Migurdia', make: (L) => roxy(L) },
  { id: 'ghislaine', name: 'Ghislaine Dedoldia', make: (L) => ghislaine(L) },
  { id: 'ruijerd', name: 'Ruijerd Superdia', make: (L) => ruijerd(L) },
  { id: 'zanoba', name: 'Zanoba Shirone', make: (L) => canonNpc(L, { name: 'Zanoba', sur: 'Shirone', race: 'human', sex: 'm', age: Math.max(19, L.age + 4), op: 10, role: 'friend', job: 'Third prince of Shirone', tags: ['curious', 'loyal'], look: { hair: '#3b2a20', eyes: '#5b3a24', skin: '#e8c0a1', style: 0 }, bio: 'A prince of Shirone and a Divine Child cursed with monstrous strength. Would trade his crown for the perfect figurine.' }) },
  { id: 'cliff', name: 'Cliff Grimoire', make: (L) => canonNpc(L, { name: 'Cliff', sur: 'Grimoire', race: 'human', sex: 'm', age: Math.max(11, L.age), op: 0, role: 'friend', job: 'Priest prodigy of the Millis church', tags: ['proud', 'serious'], look: { hair: '#c9a25b', eyes: '#3f6fa8', skin: '#f3d6c1', style: 1 }, bio: 'Grandson of a Millis cardinal and a genuine genius of magic. Insufferably proud. Secretly lonely.' }) },
  { id: 'nanahoshi', name: 'Nanahoshi Shizuka', make: (L) => canonNpc(L, { name: 'Nanahoshi', sur: 'Shizuka', race: 'human', sex: 'f', age: Math.max(18, L.age + 2), op: 0, role: 'friend', job: 'Researcher known as the Silent Seven Star', tags: ['serious', 'shy'], look: { hair: '#1c1714', eyes: '#3a2a22', skin: '#f3d6c1', style: 6 }, bio: 'A masked researcher from somewhere no map shows. She has no mana at all, and she is trying to build a way home.' }) },
  { id: 'ariel', name: 'Ariel Anemoi Asura', make: (L) => canonNpc(L, { name: 'Ariel', sur: 'Anemoi Asura', race: 'human', sex: 'f', age: Math.max(18, L.age + 2), op: 10, role: 'friend', job: 'Second Princess of Asura', tags: ['witty', 'proud'], look: { hair: '#efe2b0', eyes: '#3f6fa8', skin: '#f6e2d3', style: 2 }, bio: 'The second princess of Asura. Charming, calculating, and determined to rule the kingdom her brother’s faction stole.' }) },
  { id: 'orsted', name: 'Orsted, the Dragon God', make: (L) => canonNpc(L, { name: 'Orsted', sur: '', race: 'dragon', sex: 'm', age: 1000, op: 20, role: 'mentor', skill: { k: 'ng', r: 7 }, job: 'The Dragon God', tags: ['stern', 'serious'], look: { hair: '#d9dde0', eyes: '#d8a520', skin: '#f0dccd', style: 0 }, bio: 'The Dragon God, second of the Seven Great Powers. A curse makes nearly everyone fear him on sight.' }) },
  { id: 'badigadi', name: 'Badigadi, Immortal Demon King', make: (L) => canonNpc(L, { name: 'Badigadi', sur: '', race: 'demonkin', sex: 'm', age: 3000, op: 20, role: 'friend', job: 'Immortal Demon King', tags: ['cheerful', 'playful'], power: 120, bio: 'An immortal Demon King who cannot be killed and does not seem to mind. Loves feasts, fights, and his fiancée, the Demon Empress.' }) },
  { id: 'reida', name: 'Reida Reya, the Water God', make: (L) => canonNpc(L, { name: 'Reida', sur: 'Reya', race: 'human', sex: 'f', age: 70, op: 15, role: 'mentor', skill: { k: 'wg', r: 7 }, job: 'The Water God', tags: ['stern', 'witty'], bio: 'The Water God, master of the counterattack school. She looks like a kindly grandmother until the moment she draws.' }) },
  { id: 'gal', name: 'Gal Farion, the Sword God', make: (L) => canonNpc(L, { name: 'Gal', sur: 'Farion', race: 'human', sex: 'm', age: 55, op: 0, role: 'mentor', skill: { k: 'sg', r: 7 }, job: 'The Sword God', tags: ['proud', 'hot-tempered'], bio: 'Master of the Sword Sanctum and the fastest blade alive. Bored by almost everyone. Not, perhaps, by you.' }) },
  { id: 'kishirika', name: 'Kishirika Kishirisu', make: (L) => canonNpc(L, { name: 'Kishirika', sur: 'Kishirisu', race: 'demonkin', sex: 'f', age: 1300, op: 25, role: 'friend', job: 'The Great Demon Empress', tags: ['cheerful', 'playful'], look: { hair: '#7c4fc0', eyes: '#d8a520', skin: '#d7c3e6', style: 3 }, bio: 'The Great Demon Empress of the Demon Continent. Looks like a child, laughs like a tyrant, and gives Demon Eyes to anyone who feeds her.' }) },
];
const CANON = Object.fromEntries(CANON_CAST.map(c => [c.id, c]));
const ADM_ROLES = [['friend', 'Friend'], ['rival', 'Rival'], ['mentor', 'Mentor'], ['party', 'Party member'], ['other', 'Acquaintance'], ['student', 'Student']];
const EVF_NAMES = [['quiet', 'Quiet: story arcs only'], ['normal', 'Normal'], ['more', 'More events'], ['max', 'Maximum: three a year']];

function admField(id, label, v, o) { o = o || {}; return `<label class="field"><span>${label}</span><input type="${o.type || 'number'}" id="ad-${id}" value="${esc(v)}"${o.type === 'text' ? ` maxlength="${o.max || 24}"` : ' inputmode="numeric"'}${o.step ? ` step="${o.step}"` : ''}></label>`; }
function admSel(a2, k, opts, cur, o) { o = o || {}; return `<select data-a2="${a2}"${k ? ` data-k="${k}"` : ''}${o.id ? ` id="${o.id}"` : ''}${o.label ? ` aria-label="${esc(o.label)}"` : ''}>${opts.map(([v, t]) => `<option value="${esc(v)}"${String(cur) === String(v) ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`; }
function admSearch(target, ph) { return `<label class="adm-search">${icon('target')}<input type="search" data-filter="${target}" placeholder="${esc(ph)}" aria-label="${esc(ph)}"></label>`; }
function admToggle(on, a, k, label, sub) { return `<button class="toggle${on ? ' on' : ''}" data-a="${a}" data-k="${k}" role="switch" aria-checked="${!!on}"><span><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span><i></i></button>`; }
const admBox = (title, body, o) => `<section class="adm-box${o && o.cls ? ' ' + o.cls : ''}"><h3>${title}</h3>${body}</section>`;
function townOptions(cur) {
  return CONTINENTS.map(c => `<optgroup label="${esc(c.name)}">${TOWNS.filter(t => t.cont === c.id).map(t => `<option value="${t.id}"${t.id === cur ? ' selected' : ''}>${esc(t.name)} · ${esc(t.realm)}</option>`).join('')}</optgroup>`).join('');
}

function adminPage(L) {
  const secs = L ? ADMIN_TABS : ADMIN_TABS.filter(t => t[0] === 'legacy');
  const sec = secs.some(t => t[0] === UI.adminSec) ? UI.adminSec : secs[0][0];
  const strip = L ? `<div class="adm-strip">
      <span class="adm-pill${L.admin ? ' on' : ''}">${icon(L.admin ? 'alert' : 'check')}${L.admin ? 'Admin-edited life' : 'Untouched life'}</span>
      <span>Age <b class="num">${L.age}</b></span><span data-tip="term:lifespan">Lifespan <b class="num">${fmt(L.lifespan)}</b>${effLifespan(L) !== L.lifespan ? ` <small>(${fmt(effLifespan(L))} with mastery)</small>` : ''}</span>
      <span>Power <b class="num">${Math.round(power(L))}</b></span><span>Actions <b class="num">${L.ap}/${L.apMax}</b></span><span>Gold <b class="num">${fmt(L.gold)}</b></span><span>LP <b class="num">${fmt(META.lp)}</b></span></div>` : `<p class="note">${icon('info')}Begin a life to edit it. Legacy tools work any time.</p>`;
  const tabs = `<div class="adm-tabs" role="tablist">${secs.map(([id, name, ic]) => `<button role="tab" aria-selected="${sec === id}" class="${sec === id ? 'on' : ''}" data-a="adsec" data-v="${id}">${icon(ic)}<span>${name}</span></button>`).join('')}</div>`;
  let body = '';
  try { body = ADMIN_SECS[sec](L); } catch (err) { console.error(err); body = `<p class="empty">This section could not be drawn: ${esc(err.message)}</p>`; }
  return `${strip}${tabs}<div class="adm-body">${body}</div>`;
}

const ADMIN_SECS = {
  cheats(L) {
    const ch = L.cheats || {};
    return admBox('Toggles', `<div class="toggles">
        ${admToggle(L.god, 'adcheat', 'god', 'God mode', 'You cannot die from wounds, illness, or age')}
        ${admToggle(ch.noOld, 'adcheat', 'noOld', 'No old age', 'Age never kills you and your body never declines')}
        ${admToggle(ch.infAp, 'adcheat', 'infAp', 'Endless actions', 'Actions never run out')}
        ${admToggle(ch.infSp, 'adcheat', 'infSp', 'Endless social points', 'Social points never run out')}
        ${admToggle(ch.noStress, 'adcheat', 'noStress', 'Serene', 'Stress always stays at zero')}
        ${admToggle(ch.sureTrial, 'adcheat', 'sureTrial', 'Guaranteed trials', 'Every rank trial and god challenge succeeds')}
        ${admToggle(ch.sureQuest, 'adcheat', 'sureQuest', 'Guaranteed quests', 'Every guild quest succeeds')}
        ${admToggle(ch.sureSocial, 'adcheat', 'sureSocial', 'Irresistible', 'Hiring, promotions, invites, and asking someone out (adults only) almost always work')}
      </div>`) +
      admBox('Multipliers', `<div class="adgrid">
        <label class="field"><span>Experience</span>${admSel('adcheatsel', 'xp', [1, 2, 3, 5, 10, 100].map(n => [n, '×' + n]), ch.xp || 1)}</label>
        <label class="field"><span>Gold earned</span>${admSel('adcheatsel', 'gold', [1, 2, 5, 10, 100].map(n => [n, '×' + n]), ch.gold || 1)}</label>
        <label class="field"><span>Event frequency</span>${admSel('adcheatsel', 'evf', EVF_NAMES, ch.evf || 'normal')}</label>
      </div>`) +
      `<div class="btn-row">${btn('Clear every cheat', 'adcheatclear', { cls: 'danger' })}</div>`;
  },
  character(L) {
    const lk = L.look || {};
    const sel = (k, opts) => admSel('adlooks', k, opts, lk[k]);
    const races = RACES.map(r => [r.id, r.name]), bgs = BACKGROUNDS.map(b => [b.id, b.name]);
    return `<div class="adm-split"><div class="adm-por">${lifePortrait(L)}<button class="btn small" data-a="adlookr">${icon('dice')}<span>Randomize look</span></button></div><div>` +
      admBox('Identity', `<div class="adgrid">${admField('name', 'Given name', L.name, { type: 'text', max: 18 })}${admField('sur', 'Family name', L.sur, { type: 'text', max: 18 })}${admField('epi', 'Epithet', L.epithet || '', { type: 'text', max: 30 })}${admField('gen', 'Generation', L.gen || 1)}${admField('lifespan', 'Natural lifespan', L.lifespan)}</div>
        <div class="btn-row">${btn('Apply', 'adchar', { cls: 'primary' })}</div>`) +
      admBox('Origins', `<div class="adgrid">
        <label class="field"><span>Race</span>${admSel('adrace', '', races, L.race)}</label>
        <label class="field"><span>Family background</span>${admSel('adbg', '', bgs, L.bg)}</label>
        <label class="field"><span>Hometown</span><select data-a2="adhome">${townOptions(L.home || L.town)}</select></label>
        <label class="field"><span>Birth season</span>${admSel('adseason', '', SEASONS.map(x => [x.id, x.name]), L.season)}</label>
        <label class="field"><span>Birth omen</span>${admSel('adomen', '', OMENS.map(o => [o.id, o.name]), L.omen)}</label>
        <label class="field"><span>Vow</span>${admSel('advow', '', [['', 'No vow'], ...VOWS.map(v => [v.id, v.name])], L.vow || '')}</label>
      </div><p class="note">${icon('info')}Changing race rescales your lifespan to the new race’s range.</p>`) +
      admBox('Appearance', `<div class="adgrid">
        <label class="field"><span>Hair</span><input type="color" data-a2="adlookc" data-k="hair" value="${esc(lk.hair || '#3b2a20')}"></label>
        <label class="field"><span>Eyes</span><input type="color" data-a2="adlookc" data-k="eyes" value="${esc(lk.eyes || '#3f6fa8')}"></label>
        <label class="field"><span>Skin</span><input type="color" data-a2="adlookc" data-k="skin" value="${esc(lk.skin || '#f3d6c1')}"></label>
        <label class="field"><span>Hairstyle</span>${sel('style', HAIR_STYLES.map((n, i) => [i, n]))}</label>
        <label class="field"><span>Face</span>${sel('face', FACE_SHAPES.map((n, i) => [i, n]))}</label>
        <label class="field"><span>Brows</span>${sel('brow', BROW_SHAPES.map((n, i) => [i, n]))}</label>
        <label class="field"><span>Eyes shape</span>${sel('eye', EYE_SHAPES.map((n, i) => [i, n]))}</label>
        <label class="field"><span>Mark</span>${sel('mark', Object.entries(MARK_NAMES))}</label>
        <label class="field"><span>Facial hair</span>${sel('beard', Object.entries(BEARD_NAMES))}</label>
      </div>`) + `</div></div>`;
  },
  stats(L) {
    const f = admField;
    const inj = L.injuries.length ? `<div class="chips">${L.injuries.map((x, i) => `<button class="tchip" data-a="adinj" data-i="${i}"><span>${esc(x)}</span><small>heal</small></button>`).join('')}</div>` : '<p class="muted">No lasting injuries.</p>';
    return admBox('Attributes', `<div class="adgrid">${['str', 'agi', 'int', 'cha', 'looks', 'luck'].map(k => f(k, STAT_FULL[k], Math.round(L.st[k]))).join('')}</div>`) +
      admBox('Body and mind', `<div class="adgrid">${f('hp', 'Health', Math.round(L.hp))}${f('bhp', 'Bonus max health', L.bonusHp || 0)}${f('stress', 'Stress', Math.round(L.stress))}${f('read', 'Reading', Math.round(L.read))}${f('ap', 'Actions left', L.ap)}${f('sp', 'Social left', L.sp)}</div>`) +
      admBox('Mana and aura', `<div class="adgrid">${f('mcap', 'Mana capacity', Math.round(L.mana.cap))}${f('mctrl', 'Mana control', Math.round(L.mana.ctrl))}${f('mpot', 'Mana potential ×100', Math.round(L.mana.pot * 100))}${f('meff', 'Mana efficiency', Math.round(L.mana.eff))}${f('chant', 'Silent casting progress', Math.round(L.mana.chant))}${f('acomp', 'Aura talent ×100', Math.round(L.aura.compat * 100))}${f('acap', 'Aura capacity', Math.round(L.aura.cap))}${f('actrl', 'Aura control', Math.round(L.aura.ctrl))}</div>`) +
      admBox('Wealth and standing', `<div class="adgrid">${f('gold', 'Gold', Math.round(L.gold))}${f('funds', 'Family funds', Math.round(L.family.funds))}${f('fame', 'Fame', Math.round(L.fame))}${f('craft', 'Craft skill', Math.round(L.craft || 0))}${f('gpts', 'Guild points', L.guild.pts || 0)}${L.job ? f('perf', 'Job performance', Math.round(L.job.perf)) : ''}
        <label class="field"><span>Family wealth</span>${admSel('adwealth', '', ['Destitute', 'Poor', 'Modest', 'Comfortable', 'Rich', 'Royal'].map((n, i) => [i, n]), L.family.wealth)}</label></div>`) +
      `<div class="btn-row">${btn('Apply every field', 'adstats', { cls: 'primary', icon: 'check' })}${btn('Raise every attribute to 20', 'admaxstats')}${btn('Full heal, no stress', 'adheal')}${btn('Reveal hidden potential', 'adreveal')}</div>` +
      admBox('Lasting injuries', inj);
  },
  skills(L) {
    const row = (k, n, xp) => `<div class="adskill"><span>${n}</span><input type="number" id="adx-${k}" value="${Math.round(xp)}" inputmode="numeric" aria-label="${esc(n)} XP"><select data-a2="adrank" data-k="${k}" aria-label="${esc(n)} rank">${RANKS.map((r, i) => `<option value="${i}" ${rankOf(L, k) === i ? 'selected' : ''}>${r}</option>`).join('')}</select></div>`;
    return `<p class="note">${icon('info')}Pick a rank to jump straight to it, or type exact experience and press Apply. Rank thresholds: ${RANK_XP.slice(1).map((x, i) => `${RANKS[i + 1]} ${fmt(x)}`).join(' · ')}.</p>` +
      admBox('Magic', `<div class="adskill head"><span>Discipline</span><span>XP</span><span>Rank</span></div>${MAGIC.map(m => row(m.id, m.name + ' magic', L.magic[m.id] || 0)).join('')}`) +
      admBox('Swordsmanship', `<div class="adskill head"><span>Discipline</span><span>XP</span><span>Rank</span></div>${STYLES.map(s => row(s.id, s.name, L.sword[s.id] || 0)).join('')}
        <div class="adskill"><span>Fundamentals</span><input type="number" id="adx-fund" value="${Math.round(L.sword.fund || 0)}" inputmode="numeric" aria-label="Fundamentals XP"><span class="muted">${L.sword.styleChosen ? 'Merged into your style' : 'Before a style'}</span></div>
        <div class="adskill"><span>Primary style</span><span></span>${admSel('adstylesel', '', [['', L.sword.styleChosen ? '—' : 'Not chosen'], ...STYLES.map(s => [s.id, s.name])], L.sword.primary || '')}</div>`) +
      admBox('Aura and guild', `<div class="adskill"><span>Battle Aura</span><span></span><select data-a2="adaura">${AURA_STAGES.map((a, i) => `<option value="${i}" ${L.aura.stage === i ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
        <div class="adskill"><span>Guild rank</span><span></span><select data-a2="adguild">${GUILD_RANKS.map((g, i) => `<option value="${i}" ${L.guild.rank === i && L.guild.reg ? 'selected' : ''}>${g}</option>`).join('')}</select></div>`) +
      `<div class="btn-row">${btn('Apply exact XP', 'adxp', { cls: 'primary', icon: 'check' })}${btn('Grant silent casting', 'adchant')}${btn('Master everything', 'admaxall', { cls: 'gold', icon: 'crown' })}${btn('Reset every skill', 'adresetskills', { cls: 'danger' })}</div>`;
  },
  traits(L) {
    const tf = UI.adminTF || 'admin';
    const list = TRAITS.filter(t => tf === 'all' || t.tier === tf);
    const chips = (ids) => ids.map(id => `<button class="tchip tier-${TRAIT[id].tier}" data-a="adrm" data-id="${id}" data-tip="trait:${id}"><i class="gem"></i><span>${esc(TRAIT[id].name)}</span><small>remove</small></button>`).join('');
    return admBox(`Born traits <small>${L.traits.length} of 3</small>`, `<div class="chips">${chips(L.traits) || '<span class="muted">None</span>'}</div>`) +
      admBox('Earned traits', `<div class="chips">${chips(L.earned) || '<span class="muted">None</span>'}</div>`) +
      `<div class="btn-row">${btn('Re-roll born traits', 'adtraitroll', { icon: 'dice' })}${btn('Clear born traits', 'adtraitclear')}${btn('Grant every earned trait', 'adearnall', { cls: 'gold' })}</div>` +
      admBox('Add a trait', `<div class="segs wrap">${[{ id: 'all', name: 'All' }, ...TIERS, { id: 'earned', name: 'Earned' }].map(t => `<button class="${tf === t.id ? 'on' : ''}" data-a="adtf" data-v="${t.id}">${t.name}</button>`).join('')}</div>
        ${admSearch('#adm-traits', 'Search traits by name or effect')}
        <div class="stack" id="adm-traits">${list.map(t => { const has = L.traits.includes(t.id) || L.earned.includes(t.id); return `<div class="row"><div class="r-main"><b data-tip="trait:${t.id}">${esc(t.name)}</b><small>${tierName(t.tier)} · ${esc(t.up)}${t.down && t.down !== 'None' ? ' · ' + esc(t.down) : ''}</small></div><div class="r-side">${btn(has ? 'Has it' : 'Add', 'adadd', { data: { id: t.id }, disabled: has, cls: 'small' })}</div></div>`; }).join('')}</div>`);
  },
  people(L) {
    const alive = L.people.filter(p => p.alive), dead = L.people.filter(p => !p.alive);
    const famRoles = ['mother', 'father', 'sibling', 'twin', 'child', 'grandchild', 'guardian', 'spouse'];
    const prow = (p) => {
      const fam = famRoles.includes(p.role);
      const canMarry = !L.spouse && p.alive && canRomance(L, p) && p.role !== 'spouse';
      return `<div class="adp${p.alive ? '' : ' dead'}"><span class="pmini">${npcPortrait(p, true)}</span>
        <div class="adp-main"><b>${esc(p.name)} ${esc(p.sur || '')}</b><small>${esc(ROLE_NAMES[p.role] || p.role)} · ${RACE[p.race] ? RACE[p.race].name : p.race} · ${p.alive ? 'age ' + p.age : 'died at ' + p.age}${p.canon ? ' · canon' : ''}</small></div>
        <div class="adp-ctl">
          <label class="mini-f"><span>Opinion</span><input type="number" id="adp-op-${p.id}" value="${p.op}" min="-100" max="100"></label>
          <label class="mini-f"><span>Age</span><input type="number" id="adp-age-${p.id}" value="${p.age}" min="0"></label>
          ${fam ? '' : `<label class="mini-f"><span>Role</span>${admSel('adprole', p.id, ADM_ROLES, p.role)}</label>`}
          <div class="adp-btns">${btn('Save', 'adpsave', { data: { id: p.id }, cls: 'small primary' })}${btn(p.alive ? 'Kill' : 'Revive', 'adplive', { data: { id: p.id }, cls: 'small' })}${canMarry ? btn('Marry', 'admarry', { data: { id: p.id }, cls: 'small gold' }) : ''}${btn('Remove', 'adprm', { data: { id: p.id }, cls: 'small danger' })}</div>
        </div></div>`;
    };
    const skills = [['', 'No skill'], ...MAGIC.map(m => [m.id, m.name + ' magic']), ...STYLES.map(s => [s.id, s.name])];
    return admBox('Summon a canon character', `<div class="field-row">${admSel('', '', CANON_CAST.map(c => [c.id, c.name]), 'roxy', { id: 'ad-canon', label: 'Canon character' })}${btn('Summon', 'adcanon', { cls: 'small primary' })}</div><p class="note">${icon('info')}Canon characters keep their story roles and are never romance options.</p>`) +
      admBox('Create a person', `<div class="adgrid">
        <label class="field"><span>Role</span>${admSel('', '', ADM_ROLES, 'friend', { id: 'ad-prole' })}</label>
        <label class="field"><span>Race</span>${admSel('', '', RACES.map(r => [r.id, r.name]), L.race, { id: 'ad-prace' })}</label>
        <label class="field"><span>Sex</span>${admSel('', '', [['f', 'Female'], ['m', 'Male']], 'f', { id: 'ad-psex' })}</label>
        ${admField('page', 'Age', Math.max(1, L.age))}${admField('pop', 'Opinion', 30)}${admField('pname', 'Name (optional)', '', { type: 'text', max: 18 })}
        <label class="field"><span>Skill</span>${admSel('', '', skills, '', { id: 'ad-pskill' })}</label>
        <label class="field"><span>Skill rank</span>${admSel('', '', RANKS.map((r, i) => [i, r]).slice(1), 3, { id: 'ad-prank' })}</label>
      </div><div class="btn-row">${btn('Create', 'adspawn', { cls: 'primary', icon: 'plus' })}${btn(L.spouse ? 'Have a child' : 'Adopt a child', 'adchild', { disabled: L.age < 18, tip: L.age < 18 ? 'Available once you are an adult' : '' })}</div>`) +
      admBox(`Everyone in your life <small>${alive.length} living · ${dead.length} gone</small>`, `${admSearch('#adm-people', 'Search people')}<div class="stack" id="adm-people">${[...alive, ...dead].map(prow).join('') || '<p class="empty">Nobody yet.</p>'}</div>`);
  },
  world(L) {
    const seven = (META.world.seven || []).map((s, i) => `<li><b>${ROMANS[s.seat || i + 1]}.</b> ${esc(s.title || '')} <span class="muted">· ${esc(s.name || '')}</span></li>`).join('');
    return admBox('Teleport', `<div class="field-row"><label class="field grow"><span>Current town</span><select data-a2="adtown">${townOptions(L.town)}</select></label></div>
        <div class="btn-row">${btn('Mark all five continents visited', 'advisitall', { icon: 'globe' })}</div>`) +
      admBox('Calendar', `<div class="field-row">${admField('year', 'World year', L.year)}${btn('Set', 'adyear', { cls: 'small' })}</div><p class="muted">Age, story timing, and the world all follow the year. Skipping time is in the Story tab.</p>`) +
      admBox('Laplace’s return', `<p class="muted">${META.world.laplaceYear ? `The Demon God is foretold to return in year ${META.world.laplaceYear} (${META.world.laplaceYear > L.year ? META.world.laplaceYear - L.year + ' years from now' : 'already here'}).` : 'Nobody has heard the Dragon God’s warning yet.'}</p><div class="btn-row">${btn('Bring Laplace back this year', 'adlaplace', { cls: 'danger', icon: 'flame' })}</div>`) +
      admBox('The Seven Great Powers', `${seven ? `<ol class="plain seven">${seven}</ol>` : ''}<div class="btn-row">${btn(L.earned.includes('seven_powers') ? 'You hold a seat' : 'Claim a seat for yourself', 'adseven', { disabled: L.earned.includes('seven_powers'), cls: 'gold', icon: 'crown' })}</div>`);
  },
  career(L) {
    const jobs = JOBS.map(j => [j.id, `${j.name} (${j.cat})`]);
    const cur = L.job ? JOB[L.job.id] : null;
    return admBox('Work', `<p class="muted">${cur ? `Currently ${esc(cur.ladder[L.job.lvl])} (${esc(cur.name)}), year ${L.job.yrs + 1}, performance ${Math.round(L.job.perf)}.` : 'Unemployed.'}</p>
        <div class="adgrid"><label class="field"><span>Career</span>${admSel('', '', jobs, cur ? cur.id : JOBS[0].id, { id: 'ad-job' })}</label>
        <label class="field"><span>Rung on the ladder</span>${admSel('', '', [0, 1, 2, 3, 4, 5].map(i => [i, i === 0 ? 'Entry' : 'Rung ' + (i + 1)]), L.job ? L.job.lvl : 0, { id: 'ad-joblvl' })}</label></div>
        <div class="btn-row">${btn('Assign job', 'adjobset', { cls: 'primary' })}${L.job ? btn('Quit job', 'adjobquit') : ''}</div>`) +
      admBox('School', `<p class="muted">${L.edu.school ? `Enrolled at ${esc(SCHOOL[L.edu.school].name)}, year ${L.edu.yrs + 1}.` : 'Not enrolled.'} Finished: ${L.edu.done.length ? L.edu.done.map(id => esc(SCHOOL[id] ? SCHOOL[id].name : id)).join(', ') : 'none'}.</p>
        <div class="field-row"><label class="field grow"><span>School</span>${admSel('', '', SCHOOLS.map(s => [s.id, s.name]), L.edu.school || SCHOOLS[0].id, { id: 'ad-school' })}</label>${btn('Enroll', 'adenroll', { cls: 'small' })}</div>
        <div class="btn-row">${btn('Graduate now', 'adgrad', { disabled: !L.edu.school })}${btn('Leave school', 'adleave', { disabled: !L.edu.school })}</div>`) +
      admBox('Boards', `<div class="btn-row">${btn('Refresh job and quest boards', 'adboards', { icon: 'scroll' })}</div>`);
  },
  items(L) {
    return SLOTS_GEAR.map(([slot, name]) => { const curId = L.gear[slot]; return admBox(`${name} <small>${curId && ITEM[curId] ? esc(ITEM[curId].name) : 'empty'}</small>`,
      `<div class="stack">${ITEMS.filter(i => i.slot === slot).map(i => `<div class="row"><div class="r-main"><b>${esc(i.name)}</b><small>${esc(i.desc)}${i.power ? ' · +' + i.power + ' power' : ''}</small></div><div class="r-side">${curId === i.id ? `<span class="tagc on">Equipped</span>${btn('Remove', 'adunequip', { data: { slot }, cls: 'small' })}` : btn('Equip', 'adequip', { data: { id: i.id }, cls: 'small' })}</div></div>`).join('')}</div>`); }).join('') + admBox(`Patronage <small>${Object.keys(L.works || {}).length} of ${WORKS.length} funded</small>`, `<div class="stack">${WORKS.map(w => { const on = (L.works || {})[w.id] != null; return `<div class="row"><div class="r-main"><b>${esc(w.name)}</b><small>${esc(w.eff)}</small></div><div class="r-side">${btn(on ? 'Unfund' : 'Fund free', 'adwork', { data: { id: w.id }, cls: 'small' + (on ? ' ghost' : '') })}</div></div>`; }).join('')}</div>`);
  },
  story(L) {
    const arcs = ARCS.map(a => { const s = (L.arc[a.id] || 0); const nx = arcNext(L, a);
      return `<div class="adskill wide"><span>${esc(a.name)}<small>${s >= 99 ? 'Complete' : s < 0 ? 'Closed' : nx ? 'Next: ' + esc(nx.title) : ''}</small></span><select data-a2="adarc" data-k="${a.id}" aria-label="${esc(a.name)} stage">${[0, ...a.chapters.map((c, i) => i + 1)].map(i => `<option value="${i}" ${(s >= 99 ? a.chapters.length : Math.max(0, s)) === i ? 'selected' : ''}>${i === 0 ? 'Not begun' : i === a.chapters.length ? 'Complete' : 'After chapter ' + ROMANS[i]}</option>`).join('')}</select>${btn('Play next', 'adarcfire', { data: { k: a.id }, cls: 'small', disabled: !nx })}</div>`; }).join('');
    return admBox('Story arcs', `${arcs}<p class="note">${icon('info')}“Play next” opens the next chapter now, even if its usual conditions are not met.</p><div class="btn-row">${btn('Reset every arc', 'adarcreset')}${btn('Complete every arc', 'adarcdone', { cls: 'gold' })}</div>`) +
      admBox('Time', `<p class="muted">Skipping years picks the first open choice in every event along the way.</p><div class="btn-row">${[1, 5, 10, 25, 50, 100].map(n => btn(`Skip ${n} year${n > 1 ? 's' : ''}`, 'adskip', { data: { n } })).join('')}</div>
        <div class="field-row">${admField('age', 'Set age directly', L.age)}${btn('Set', 'adage', { cls: 'small' })}</div>
        <div class="btn-row">${btn('Refill actions and social points', 'adrefill')}${btn('End this life now', 'confirm', { data: { c: 'endlife' }, cls: 'danger' })}</div>`);
  },
  events(L) {
    const evs = EVENTS.filter(e => !e.isArc).slice().sort((x, y) => (x.kind || '').localeCompare(y.kind || '') || x.title.localeCompare(y.title));
    const cdLeft = (e) => e.cd && L.flags['cd_' + e.id] !== undefined ? Math.max(0, e.cd - (L.age - L.flags['cd_' + e.id])) : 0;
    return `<div class="btn-row">${btn('Clear every cooldown', 'adcd')}${btn('Allow one-time events again', 'adonce')}</div>` +
      admBox(`Every event <small>${evs.length}</small>`, `${admSearch('#adm-events', 'Search events by title, kind, or id')}<div class="stack" id="adm-events">${evs.map(e => { const seen = !!L.flags['ev_' + e.id], cd = cdLeft(e);
        return `<div class="row"><div class="r-main"><b>${esc(titleCase(e.title))}</b><small>${esc(e.kind || (e.milestone ? 'Milestone' : 'Event'))} · ages ${e.ages[0]}–${e.ages[1] > 900 ? 'any' : e.ages[1]}${e.once === false ? ' · repeats' : ''}${seen ? ' · seen' : ''}${cd ? ` · rests ${cd} more yr` : ''} · <code>${e.id}</code></small></div><div class="r-side">${btn('Fire', 'adfire', { data: { id: e.id }, cls: 'small' })}</div></div>`; }).join('')}</div>`);
  },
  legacy(L) {
    const lvls = UPG_CATS.map(([cid, cname]) => `<p class="lbl">${esc(cname)}</p>${UPGRADES.filter(u => u.cat === cid).map(u => `<div class="adskill"><span data-tip="upg:${u.id}">${esc(u.name)}</span><span class="muted">${fmt(u.cost)} LP</span>${admSel('adupglv', u.id, Array.from({ length: u.max + 1 }, (_, i) => [i, i === 0 ? 'Not owned' : u.max > 1 ? 'Level ' + i : 'Owned']), META.upg[u.id] || 0)}</div>`).join('')}`).join('');
    const achs = ACHIEVEMENTS.map(a => `<div class="row${META.ach[a.id] ? ' got' : ''}"><div class="r-main"><b data-tip="ach:${a.id}">${esc(a.name)}</b><small>${esc(a.cat)} · ${esc(a.desc)}</small></div><div class="r-side">${btn(META.ach[a.id] ? 'Revoke' : 'Grant', 'adach', { data: { id: a.id }, cls: 'small' })}</div></div>`).join('');
    return admBox(`Legacy Points <small>${fmt(META.lp)}</small>`, `<div class="btn-row">${[100, 1000, 10000, 100000].map(n => btn('+' + fmt(n), 'adlp', { data: { n }, cls: 'small' })).join('')}</div><div class="field-row">${admField('lp', 'Set exactly', META.lp)}${btn('Set', 'adlpset', { cls: 'small' })}</div>`) +
      admBox(`Legacy perks <small>${UPGRADES.filter(u => META.upg[u.id]).length} of ${UPGRADES.length} owned</small>`, `<div class="btn-row">${btn('Unlock every perk', 'adupg', { cls: 'gold' })}${btn('Refund every perk', 'adrefund')}${btn(META.unlimitedRerolls ? 'Unlimited re-rolls on' : 'Unlimited fate re-rolls', 'adrerolls', { disabled: !!META.unlimitedRerolls })}</div>${acc('adm.perks', 'Set each perk’s level', lvls, { icon: 'gem' })}`) +
      admBox(`Achievements <small>${Object.keys(META.ach).length} of ${ACHIEVEMENTS.length}</small>`, `<p class="muted">Granting here skips the rewards. Earn them in play to collect LP, gold, and XP.</p><div class="btn-row">${btn('Grant all', 'adachall')}${btn('Revoke all', 'adachnone', { cls: 'danger' })}</div>${acc('adm.achs', 'Grant or revoke one', `${admSearch('#adm-achs', 'Search achievements')}<div class="stack" id="adm-achs">${achs}</div>`, { icon: 'trophy' })}`) +
      (L ? admBox('This life’s goals', `<p class="muted">${(L.goalsDone || []).length} of ${GOALS.length} complete.</p><div class="btn-row">${btn('Complete every goal', 'adgoalsall')}${btn('Reset goals', 'adgoalsreset')}</div>`) : '') +
      admBox('Hall of Lives', `<p class="muted">${META.hall.length} lives remembered.</p><div class="btn-row">${btn('Clear the Hall of Lives', 'adhallclear', { cls: 'danger', disabled: !META.hall.length })}</div>`);
  },
  inspect(L) {
    const M = mods(L);
    const rows = [];
    for (const k in M) {
      const v = M[k];
      if (k === 'xp' || k === 'st' || k === 'evt') { for (const s in v) rows.push([`${k}.${s}`, v[s]]); }
      else rows.push([k, v]);
    }
    const fmtv = (k, v) => typeof v !== 'number' ? esc(String(v)) : (Math.abs(v) < 5 && !Number.isInteger(v) ? (v > 0 ? '+' : '') + Math.round(v * 100) + '%' : (v > 0 ? '+' : '') + v);
    const flags = Object.entries(L.flags).filter(([k]) => !k.startsWith('ev_') && !k.startsWith('cd_'));
    const json = JSON.stringify(L, null, 1);
    return admBox(`Active modifiers <small>${rows.length}</small>`, rows.length ? `<table class="tbl mods"><tbody>${rows.sort().map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td class="num">${fmtv(k, v)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">None.</p>') +
      admBox(`Story flags <small>${flags.length}</small>`, flags.length ? `<div class="chips">${flags.map(([k, v]) => `<button class="tchip" data-a="adflag" data-k="${esc(k)}"><span>${esc(k)} = ${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</span><small>clear</small></button>`).join('')}</div>` : '<p class="muted">None.</p>') +
      admBox('Counters', Object.keys(L.cnt || {}).length ? `<table class="tbl"><tbody>${Object.entries(L.cnt).map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td class="num">${esc(v)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">None.</p>') +
      admBox(`Raw life data <small>${fmt(json.length / 1024)} KB</small>`, `<textarea id="adjson" class="code" readonly rows="10">${esc(json)}</textarea><div class="btn-row">${btn('Copy', 'adcopyjson', { icon: 'scroll' })}</div>`);
  },
};

/* ---------- handlers ---------- */
function admDone(L, title, sub) { if (L) { L.admin = true; _modCache.key = ''; saveGame(); } else saveMeta(); render(); if (title) toast('note', title, sub || ''); }
const adv$ = (id) => { const el = $('#' + id); return el ? el.value : ''; };
const adn$ = (id, d) => { const el = $('#' + id); if (!el || el.value === '') return d; const v = +el.value; return isFinite(v) ? v : d; };
const HA = {
  adwork: (d) => { const L = UI.L; if (!L.works) L.works = {}; const w = WORK[d.id]; if (!w) return; if (L.works[w.id] != null) delete L.works[w.id]; else { L.works[w.id] = L.age; fame(L, w.fame); } admDone(L, w.name, L.works[w.id] != null ? 'Funded for free' : 'Removed'); },
  adsec: (d) => { UI.adminSec = d.v; UI.resetScroll = { cscroll: 1 }; render(); },
  adcheat: (d) => { const L = UI.L; if (d.k === 'god') L.god = !L.god; else { L.cheats = L.cheats || {}; L.cheats[d.k] = !L.cheats[d.k]; if (d.k === 'infAp' && L.cheats.infAp) L.ap = Math.max(L.ap, 1); if (d.k === 'infSp' && L.cheats.infSp) L.sp = Math.max(L.sp, 1); if (d.k === 'noStress') L.stress = 0; } admDone(L); },
  adcheatclear: () => { const L = UI.L; L.cheats = {}; L.god = false; admDone(L, 'Cheats cleared', 'The world plays fair again.'); },
  adchar: () => { const L = UI.L; const n = adv$('ad-name').trim(), s = adv$('ad-sur').trim(); if (n) L.name = n.slice(0, 18); if (s) L.sur = s.slice(0, 18); L.epithet = adv$('ad-epi').trim().slice(0, 30); L.gen = clamp(Math.round(adn$('ad-gen', L.gen || 1)), 1, 999); L.lifespan = clamp(Math.round(adn$('ad-lifespan', L.lifespan)), 1, 99999); admDone(L, 'Identity updated', `${L.name} ${L.sur}${L.epithet ? ' “' + L.epithet + '”' : ''}`); },
  adlookr: () => { const L = UI.L; L.look = randLook(L.race, L.sex); admDone(L); },
  adstats: () => { const L = UI.L; const g = (id, d) => adn$('ad-' + id, d);
    ['str', 'agi', 'int', 'cha', 'looks', 'luck'].forEach(k => L.st[k] = Math.max(0, g(k, L.st[k])));
    L.bonusHp = g('bhp', L.bonusHp || 0); L.hp = clamp(g('hp', L.hp), 1, maxHp(L)); L.stress = clamp(g('stress', L.stress), 0, 100); L.read = clamp(g('read', L.read), 0, 100);
    L.ap = Math.max(0, g('ap', L.ap)); L.apMax = Math.max(L.apMax || 0, L.ap); L.sp = Math.max(0, g('sp', L.sp)); L.spMax = Math.max(L.spMax || 0, L.sp);
    L.mana.cap = Math.max(0, g('mcap', L.mana.cap)); L.mana.ctrl = clamp(g('mctrl', L.mana.ctrl), 0, 100); L.mana.pot = Math.max(0.05, g('mpot', L.mana.pot * 100) / 100); L.mana.eff = clamp(g('meff', L.mana.eff), 0, 100);
    L.mana.chant = clamp(g('chant', L.mana.chant), 0, 100); if (L.mana.chant >= 100 && !L.mana.chantless) { L.mana.chantless = true; earn(L, 'silent_caster'); }
    L.aura.compat = Math.max(0, g('acomp', L.aura.compat * 100) / 100); L.aura.cap = Math.max(0, g('acap', L.aura.cap)); L.aura.ctrl = clamp(g('actrl', L.aura.ctrl), 0, 100);
    L.gold = Math.max(0, g('gold', L.gold)); L.family.funds = Math.max(0, g('funds', L.family.funds)); L.fame = Math.max(0, g('fame', L.fame)); L.craft = Math.max(0, g('craft', L.craft || 0)); L.guild.pts = Math.max(0, g('gpts', L.guild.pts || 0));
    if (L.job) L.job.perf = clamp(g('perf', L.job.perf), 0, 100);
    if (L.aura.compat <= 0 && L.aura.cap > 0) L.aura.compat = 1; auraStageCheck(L); admDone(L, 'Stats applied', ''); },
  admaxstats: () => { const L = UI.L; ['str', 'agi', 'int', 'cha', 'looks', 'luck'].forEach(k => L.st[k] = Math.max(L.st[k], 20)); admDone(L, 'Every attribute raised', 'All six attributes are now at least 20.'); },
  adinj: (d) => { const L = UI.L; L.injuries.splice(+d.i, 1); admDone(L); },
  adxp: () => { const L = UI.L;
    for (const m of MAGIC) { const v = Math.max(0, adn$('adx-' + m.id, L.magic[m.id] || 0)); L.magic[m.id] = v; L.ranks[m.id] = rankOfXp(v); }
    let best = null, bv = 0;
    for (const s of STYLES) { const v = Math.max(0, adn$('adx-' + s.id, L.sword[s.id] || 0)); L.sword[s.id] = v; L.ranks[s.id] = rankOfXp(v); if (v > bv) { bv = v; best = s.id; } }
    L.sword.fund = Math.max(0, adn$('adx-fund', L.sword.fund || 0));
    if (best && !L.sword.styleChosen) { L.sword.styleChosen = true; L.sword.primary = best; }
    admDone(L, 'Experience applied', 'Ranks follow the exact experience you entered.'); },
  admaxall: () => { const L = UI.L; for (const m of MAGIC) { L.magic[m.id] = RANK_XP[7]; L.ranks[m.id] = 7; } for (const s of STYLES) { L.sword[s.id] = RANK_XP[7]; L.ranks[s.id] = 7; }
    if (!L.sword.styleChosen) { L.sword.styleChosen = true; L.sword.primary = 'sg'; }
    if (L.aura.compat <= 0) L.aura.compat = 1; L.aura.stage = 6; L.aura.cap = Math.max(L.aura.cap, AURA_CAP[6]); L.aura.ctrl = 100; L.aura.known = true;
    L.mana.cap = Math.max(L.mana.cap, 20000); L.mana.ctrl = 100; L.mana.chant = 100; L.mana.chantless = true; L.mana.revealed = true;
    ['rank_saint', 'rank_king', 'rank_emperor', 'rank_god'].forEach(a => unlock(L, a)); admDone(L, 'Mastery of everything', 'God rank in every discipline, Legendary Aura, and silent casting.'); },
  adresetskills: () => { const L = UI.L; L.magic = {}; L.sword = { fund: 0, sg: 0, wg: 0, ng: 0, primary: null, styleChosen: false }; L.ranks = {}; L.aura.stage = 0; L.aura.cap = 0; L.aura.ctrl = 0; L.mana.chantless = false; L.mana.chant = 0; L.trials = {}; admDone(L, 'Skills reset', ''); },
  adtraitroll: () => { const L = UI.L; L.traits = rollBornTraits({ race: L.race, bg: L.bg, season: L.season, omen: L.omen, parents: [] }, [], true).traits; admDone(L, 'Born traits re-rolled', L.traits.map(id => TRAIT[id].name).join(', ')); },
  adtraitclear: () => { const L = UI.L; L.traits = []; admDone(L); },
  adearnall: () => { const L = UI.L; for (const t of TRAITS) if (t.tier === 'earned' && !L.earned.includes(t.id)) L.earned.push(t.id); admDone(L, 'Every earned trait granted', ''); },
  adcanon: () => { const L = UI.L; const c = CANON[adv$('ad-canon')]; if (!c) return; const p = c.make(L); if (!p.alive) { p.alive = true; delete p.diedAt; } p.met = p.met === undefined ? L.age : p.met; admDone(L, `${p.name} joins your story`, p.job || ''); },
  adspawn: () => { const L = UI.L; const role = adv$('ad-prole') || 'friend', race = adv$('ad-prace') || L.race, sex = adv$('ad-psex') || 'f';
    const o = { role, race, sex, age: clamp(Math.round(adn$('ad-page', L.age)), 0, 5000), op: clamp(Math.round(adn$('ad-pop', 30)), -100, 100), sur: rsurname(race), met: L.age };
    const nm = adv$('ad-pname').trim(); if (nm) o.name = nm.slice(0, 18);
    const sk = adv$('ad-pskill'); if (sk) o.skill = { k: sk, r: clamp(+adv$('ad-prank') || 1, 1, 7) };
    if (role === 'student' || role === 'mentor') o.noRomance = true;
    if (role === 'mentor') o.job = 'Mentor';
    const p = npc(L, o); if (p.skill) p.power = p.skill.r * 8; admDone(L, `${p.name} ${p.sur} enters your life`, ROLE_NAMES[role] || role); },
  adchild: () => { const L = UI.L; if (L.age < 18) return; const sp = L.spouse && person(L, L.spouse); const c = addChild(L, sp && sp.alive ? sp : { race: L.race, traits: [] }, !(sp && sp.alive)); admDone(L, `${c.name} joins the family`, ''); },
  adpsave: (d) => { const L = UI.L; const p = person(L, d.id); if (!p) return; p.op = clamp(Math.round(adn$('adp-op-' + p.id, p.op)), -100, 100); p.age = Math.max(0, Math.round(adn$('adp-age-' + p.id, p.age))); relChecks(L, p); admDone(L, `${p.name} updated`, ''); },
  adplive: (d) => { const L = UI.L; const p = person(L, d.id); if (!p) return; p.alive = !p.alive; if (!p.alive) { p.diedAt = L.age; if (L.spouse === p.id) L.spouse = null; if (L.partner === p.id) L.partner = null; } else delete p.diedAt; admDone(L, `${p.name} ${p.alive ? 'lives again' : 'is gone'}`, ''); },
  adprm: (d) => { const L = UI.L; if (L.spouse === d.id) L.spouse = null; if (L.partner === d.id) L.partner = null; L.people = L.people.filter(x => x.id !== d.id); admDone(L); },
  admarry: (d) => { const L = UI.L; const p = person(L, d.id); if (!p || L.spouse || !canRomance(L, p)) { toast('note', 'Not possible', 'Both of you must be adults, free to marry, and not family.'); return; }
    L.spouse = p.id; if (L.partner === p.id) L.partner = null; p.role = 'spouse'; p.op = Math.max(p.op, 70); log(L, `You marry ${p.name}.`, 'love'); unlock(L, 'married'); admDone(L, 'Married', `${p.name} ${p.sur}`); },
  advisitall: () => { const L = UI.L; L.visited = CONTINENTS.map(c => c.id); earn(L, 'wanderer'); unlock(L, 'wanderer'); admDone(L, 'Every continent visited', ''); },
  adyear: () => { const L = UI.L; const y = clamp(Math.round(adn$('ad-year', L.year)), 1, 99999); L.year = y; META.world.year = y; saveMeta(); admDone(L, 'The calendar turns', 'Year ' + y); },
  adlaplace: () => { const L = UI.L; META.world.laplaceYear = L.year; saveMeta(); admDone(L, 'The Demon God stirs', 'The Second Laplace War can begin at your next birthday.'); },
  adseven: () => { const L = UI.L; earn(L, 'seven_powers'); unlock(L, 'seven'); admDone(L, 'One of the Seven', ''); },
  adjobset: () => { const L = UI.L; const j = JOB[adv$('ad-job')]; if (!j) return; const lvl = clamp(+adv$('ad-joblvl') || 0, 0, j.ladder.length - 1); L.job = { id: j.id, lvl, perf: 70, yrs: 0 }; L.cnt.jobs = (L.cnt.jobs || 0) + 1; unlock(L, 'first_job'); if (lvl === j.ladder.length - 1) unlock(L, 'career_top'); admDone(L, 'New position', j.ladder[lvl]); },
  adjobquit: () => { const L = UI.L; quitJob(L); admDone(L); },
  adenroll: () => { const L = UI.L; const s = SCHOOL[adv$('ad-school')]; if (!s) return; L.edu.school = s.id; L.edu.yrs = 0; L.edu.free = false; log(L, `You enroll at ${s.name}.`, 'good'); admDone(L, 'Enrolled', s.name); },
  adgrad: () => { const L = UI.L; const s = SCHOOL[L.edu.school]; if (!s) return; L.edu.done.push(s.id); L.edu.school = null; log(L, `You graduate from ${s.name}!`, 'good'); unlock(L, 'graduate'); if (s.id === 'ranoa') { earn(L, 'ranoa_grad'); unlock(L, 'ranoa_grad'); } admDone(L, 'Graduated', s.name); },
  adleave: () => { const L = UI.L; leaveSchool(L); admDone(L); },
  adboards: () => { const L = UI.L; refreshBoards(L); admDone(L, 'Boards refreshed', ''); },
  adequip: (d) => { const L = UI.L; const it = ITEM[d.id]; if (!it) return; L.gear[it.slot] = it.id; admDone(L, 'Equipped', it.name); },
  adunequip: (d) => { const L = UI.L; delete L.gear[d.slot]; admDone(L); },
  adarcfire: (d) => { const L = UI.L; const a = ARC[d.k]; const e = a && arcNext(L, a); if (!e) return; L.admin = true; const before = L.queue.length; if (!fireEvent(L, e)) { toast('note', 'Nothing happened', 'This chapter needs different circumstances.'); return; } L.arcYear[a.id] = L.age; UI.sheet = L.queue.length > before ? { type: 'event' } : null; saveGame(); render(); },
  adarcreset: () => { const L = UI.L; L.arc = {}; L.arcYear = {}; admDone(L, 'Story arcs reset', ''); },
  adarcdone: () => { const L = UI.L; for (const a of ARCS) L.arc[a.id] = 99; admDone(L, 'Every arc marked complete', ''); },
  adcd: () => { const L = UI.L; for (const k of Object.keys(L.flags)) if (k.startsWith('cd_')) delete L.flags[k]; admDone(L, 'Cooldowns cleared', ''); },
  adonce: () => { const L = UI.L; for (const e of EVENTS) if (!e.milestone && !e.isArc) delete L.flags['ev_' + e.id]; admDone(L, 'One-time events can happen again', ''); },
  adlpset: () => { META.lp = Math.max(0, Math.round(adn$('ad-lp', META.lp))); admDone(UI.L, 'Legacy Points set', fmt(META.lp) + ' LP'); },
  adrefund: () => { const back = upgSpent(); META.lp += back; META.upg = {}; _modCache.key = ''; admDone(UI.L, 'Every perk refunded', `+${fmt(back)} LP`); },
  adach: (d) => { if (META.ach[d.id]) delete META.ach[d.id]; else META.ach[d.id] = { at: Date.now(), who: 'Admin' }; saveMeta(); render(); },
  adachall: () => { for (const a of ACHIEVEMENTS) if (!META.ach[a.id]) META.ach[a.id] = { at: Date.now(), who: 'Admin' }; saveMeta(); render(); toast('note', 'Every achievement granted', 'Without rewards.'); },
  adachnone: () => { META.ach = {}; saveMeta(); render(); },
  adgoalsall: () => { const L = UI.L; L.goalsDone = GOALS.map(g => g.id); admDone(L, 'Every goal complete', ''); },
  adgoalsreset: () => { const L = UI.L; L.goalsDone = []; admDone(L, 'Goals reset', ''); },
  adhallclear: () => { META.hall = []; saveMeta(); render(); },
  adflag: (d) => { const L = UI.L; delete L.flags[d.k]; admDone(L); },
  adcopyjson: () => { const ta = $('#adjson'); if (!ta) return; const done = () => toast('note', 'Copied', 'Life data is on your clipboard.'); try { navigator.clipboard.writeText(ta.value).then(done, () => ta.select()); } catch (e) { ta.select(); } },
};
const HA2 = {
  adcheatsel: (el) => { const L = UI.L; L.cheats = L.cheats || {}; const k = el.dataset.k; L.cheats[k] = k === 'evf' ? el.value : +el.value; admDone(L); },
  adrace: (el) => { const L = UI.L; const a = RACE[L.race], b = RACE[el.value]; if (!b) return; const f = (L.lifespan || 70) / ((a.life[0] + a.life[1]) / 2); L.race = b.id; L.lifespan = Math.round(f * (b.life[0] + b.life[1]) / 2); admDone(L, 'Race changed', `${b.name}, natural lifespan about ${fmt(L.lifespan)}`); },
  advow: (el) => { const L = UI.L; L.vow = VOW[el.value] ? el.value : null; L.admin = true; admDone(L, L.vow ? 'Vow taken' : 'Vow released', L.vow ? VOW[L.vow].name : 'You are free of any vow'); },
  adbg: (el) => { const L = UI.L; const b = BG[el.value]; if (!b) return; L.bg = b.id; L.family.wealth = b.wealth; L.family.cls = b.cls; admDone(L, 'Family background changed', b.name); },
  adhome: (el) => { const L = UI.L; L.home = el.value; admDone(L); },
  adseason: (el) => { const L = UI.L; L.season = el.value; admDone(L); },
  adomen: (el) => { const L = UI.L; L.omen = el.value; admDone(L); },
  adlookc: (el) => { const L = UI.L; L.look = Object.assign({}, L.look, { [el.dataset.k]: el.value }); admDone(L); },
  adlooks: (el) => { const L = UI.L; const k = el.dataset.k; L.look = Object.assign({}, L.look, { [k]: ['mark', 'beard'].includes(k) ? el.value : +el.value }); admDone(L); },
  adwealth: (el) => { const L = UI.L; L.family.wealth = clamp(+el.value, 0, 5); admDone(L); },
  adstylesel: (el) => { const L = UI.L; const k = el.value; if (!STYLE[k]) return; if (!L.sword.styleChosen) chooseStyle(L, k); else L.sword.primary = k; admDone(L, 'Primary style', STYLE[k].name); },
  adprole: (el) => { const L = UI.L; const p = person(L, el.dataset.k); if (!p) return; p.role = el.value; if (['student', 'mentor'].includes(p.role)) p.noRomance = true; admDone(L); },
  adtown: (el) => { const L = UI.L; const t = TOWN[el.value]; if (!t) return; L.town = t.id; if (!L.towns.includes(t.id)) L.towns.push(t.id); if (!L.visited.includes(t.cont)) L.visited.push(t.cont); refreshBoards(L); log(L, `In a blink, you stand in ${t.name}.`, 'big'); admDone(L, 'Teleported', `${t.name}, ${t.realm}`); },
  adupglv: (el) => { const u = UPG[el.dataset.k]; if (!u) return; const v = clamp(+el.value, 0, u.max); if (v) META.upg[u.id] = v; else delete META.upg[u.id]; _modCache.key = ''; saveMeta(); if (UI.L) saveGame(); render(); },
};
/* live search inside admin lists (no re-render, so the field keeps focus) */
document.addEventListener('input', (e) => {
  const f = e.target.closest && e.target.closest('[data-filter]'); if (!f) return;
  const box = $(f.dataset.filter); if (!box) return;
  const q = f.value.trim().toLowerCase();
  for (const r of box.children) r.hidden = !!q && !r.textContent.toLowerCase().includes(q);
});
