/* BELDARI SAMAJ SEWA – frontend app. Data layer = Store (localStorage). Swap Store.load/save for API calls later. */
const $ = (s, r = document) => r.querySelector(s);
const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const NAME = 'BELDARI SAMAJ SEWA';
const A = (window.A = {});

/* ---------- toast / modal ---------- */
function toast(m, t = '') { const d = document.createElement('div'); d.className = 'toast ' + t; d.textContent = m; $('#toasts').append(d); setTimeout(() => d.remove(), 3200); }
A.open = src => { const m = $('#modal'); m.className = ''; m.innerHTML = `<button class="btn x">✕ Close</button><img src="${e(src)}" alt="">`; m.hidden = false; m.onclick = () => (m.hidden = true); };

/* ---------- store ---------- */
const Store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('bss_' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('bss_' + k, JSON.stringify(v)); return true; } catch { toast('Device storage is full. Use smaller or fewer files.', 'err'); return false; } }
};
const C = { posts: [], events: [], members: [], notes: [], photos: [], albums: [] };
const R = { on: false };
const save = k => { const ok = Store.set(k, C[k]); sync(k); return ok || R.on; };
const S = { key: sessionStorage.getItem('bss_key') || '', admin: sessionStorage.getItem('bss_admin') === '1', q: '', cat: '', cm: 0, after: null, pend: {} };
async function api(path, opt = {}) { const r = await fetch('/api' + path, { ...opt, headers: { ...(opt.headers || {}), 'x-admin-key': S.key } }); if (!r.ok) throw new Error(r.status); return r; }
async function sync(k) { if (!R.on || !S.admin) return; try { await api('/data/' + k, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(C[k]) }); } catch (err) { toast(err.message === '401' ? 'Server rejected the admin key. Log out and log in again with your current password.' : 'Could not save to the server (' + err.message + '). Saved on this device only.', 'err'); } }
async function upImg(dataUrl) { const blob = await (await fetch(dataUrl)).blob(); const r = await api('/img', { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: blob }); return (await r.json()).url; }
const readIds = () => Store.get('read', []);
const unread = () => C.notes.filter(n => !readIds().includes(n.id)).length;

const SEED = [{"id": "p1", "type": "political", "title": "टाटा सफारी गाडी र सरकारी सुविधाबारे जनताका प्रश्न", "cat": "Public question", "date": "2026-11-01", "loc": "वार्ड नम्बर ४, बेलदारी", "desc": "टाटा सफारी गाडी र सरकारी सुविधाबारे अहिले जनतामाझ विभिन्न प्रश्न उठिरहेका छन्। 🤔\n\nजालन्धरका मेयरले प्रयोग गरिरहेको सफारी गाडी सरकारी हो कि व्यक्तिगत स्रोतबाट खरिद गरिएको हो? जनताले यो कुरा जान्न चाहेका छन्।\n\nजनताको पैसाबाट चल्ने सरकार र जनप्रतिनिधिको हरेक सुविधामा पारदर्शिता हुनुपर्छ। आखिर, जनताको पैसा हो भने हिसाब पनि जनताले पाउनुपर्छ!\n\nवार्ड नम्बर ४ मा बेलदारी, सडक, नाली र अन्य विकासका काम कहिले अगाडि बढ्छन्? जनतालाई गाडीको चर्चा मात्र होइन, आफ्नो वार्डमा वास्तविक विकास पनि चाहिएको छ।\n\n👉 मेयरज्यू, जनताको प्रश्नको जवाफ दिनुहोस् र विकासलाई प्राथमिकता दिनुहोस्!", "images": ["poster.jpg"], "og": "og-p1.jpg", "videos": [], "status": "published", "author": "BELDARI SAMAJ SEWA", "time": "10:00"}, {"id": "p2", "type": "political", "title": "सडकको अवस्था: विकास कहाँ छ?", "cat": "Road conditions", "date": "2026-11-01", "loc": "बेलदारी", "desc": "अहिलेको मेयर जलन्धर सिंहको कार्यकालको ४ वर्ष ६ महिना बितिसक्दा पनि बेलडाँडी गाउँको विकासको अवस्था हेर्दा दुःख लाग्छ। आखिर अहिलेसम्म गाउँमा के-कस्तो विकास गर्नुभएको छ? एकपटक गाउँका सडकहरूको अवस्था हेर्नुहोस्, बाटोको हालत कस्तो छ, जनताले कति दुःख भोगिरहेका छन्!\n\nमेयरज्यू, तपाईं कहाँ निदाउनुभएको छ? जनताले विकासको आशा गरेका छन्, भाषण होइन काम चाहेका छन्। कृपया जनताको समस्यालाई गम्भीरतापूर्वक लिनुहोस् र गाउँको विकासमा ध्यान दिनुहोस्।\n\nजनतालाई जवाफ चाहिएको छ, विकासको अनुभूति चाहिएको छ!", "images": ["road.jpg", "person.jpg"], "og": "og-p2.jpg", "videos": [], "status": "published", "author": "BELDARI SAMAJ SEWA", "time": "10:00"}];
async function load() {
  for (const k of Object.keys(C)) C[k] = Store.get(k, []);
  let seed = SEED; try { seed = await (await fetch('posts.json', { cache: 'no-cache' })).json(); } catch (err) { }
  let remotePosts = false;
  await Promise.all(Object.keys(C).map(async k => { try { const r = await fetch('/api/data/' + k, { cache: 'no-store' }); if (!r.ok || !/json/.test(r.headers.get('content-type') || '')) return; const j = await r.json(); R.on = true; if (Array.isArray(j.items)) { C[k] = j.items; if (k === 'posts') remotePosts = true; Store.set(k, j.items); } } catch (err) { } }));
  if (!remotePosts) { const hidden = Store.get('hidden', []); for (const s of seed) if (!C.posts.some(p => p.id === s.id) && !hidden.includes(s.id)) C.posts.push(s); }
  fetch('hero.mp4', { method: 'HEAD' }).then(r => { if (r.ok && /video/.test(r.headers.get('content-type') || '')) { const v = $('#bgv'); v.src = 'hero.mp4'; v.play().catch(() => {}); } }).catch(() => {});
}

/* ---------- helpers ---------- */
const NAV = [['home', '🏠', 'Home'], ['political', '🏛️', 'Political Updates'], ['social', '🤝', 'Social Service'], ['gallery', '🖼️', 'Photo Gallery'], ['videos', '🎬', 'Video Gallery'], ['news', '🔔', 'News & Notices'], ['events', '📅', 'Events'], ['members', '👥', 'Members'], ['search', '🔍', 'Search'], ['about', 'ℹ️', 'About Us'], ['contact', '✉️', 'Contact'], ['profile', '👤', 'Profile'], ['settings', '⚙️', 'Settings'], ['privacy', '🔒', 'Privacy'], ['admin', '🛠️', 'Admin']];
A.go = p => { location.hash = '#/' + p; };
const pub = () => C.posts.filter(p => p.status !== 'draft').sort((a, b) => ((b.date || '') + (b.time || '')).localeCompare((a.date || '') + (a.time || '')));
const ofType = t => pub().filter(p => p.type === t);
const empty = (i, t, s = '') => `<div class="glass empty"><b>${i}</b><p><strong>${t}</strong></p><p>${s}</p></div>`;
const thumb = p => p.images?.[0] ? `<img src="${e(p.images[0])}" alt="" loading="lazy">` : p.videos?.[0] ? `<video src="${e(p.videos[0])}#t=0.5" preload="metadata" muted></video>` : '📰';
const card = p => `<article class="glass card" tabindex="0" onclick="A.go('post/${p.id}')" onkeydown="if(event.key==='Enter')A.go('post/${p.id}')"><div class="th">${thumb(p)}<span class="tg ${p.type}">${e(p.cat || p.type)}</span></div><div class="bd"><h3>${e(p.title)}</h3><p>${e(p.desc)}</p><div class="row" style="justify-content:space-between"><span class="meta">✍ ${e(p.author || NAME)} · 🕒 ${e(p.date)}${p.time ? ' ' + e(p.time) : ''}</span><button class="btn sm sec" onclick="event.stopPropagation();A.sheet('${p.id}')">⤴ Share</button></div></div></article>`;
const leadHTML = p => `<article class="lead" tabindex="0" onclick="A.go('post/${p.id}')"><div style="position:absolute;inset:0">${thumb(p)}</div><div class="ov"><span class="tg ${p.type}">${e(p.cat || p.type)}</span><h2>${e(p.title)}</h2><span class="meta">✍ ${e(p.author || NAME)} · 🕒 ${e(p.date)}${p.time ? ' ' + e(p.time) : ''}</span></div></article>`;
function ticker() { const it = [...C.notes.slice(0, 4).map(n => n.title), ...pub().slice(0, 5).map(p => p.title)]; const t = it.length ? it.join('   ◆   ') : NAME + ' — सेवा • सहयोग • समर्पण'; return `<div class="ticker"><b>🔴 ताजा खबर</b><div class="mq"><span>${e(t)}</span></div></div>`; }
const sec = (t, link, body) => `<h2 class="sec">${t}${link ? `<a onclick="A.go('${link}')">View all</a>` : ''}</h2>${body}`;
const cards = (l, em) => l.length ? `<div class="grid">${l.map(card).join('')}</div>` : em;
const albumsAll = () => ['Social service', 'Political', 'Village events', ...C.albums.map(a => a.name)];
const allPhotos = () => [...C.posts.filter(p => p.status !== 'draft').flatMap(p => (p.images || []).map(src => ({ src, album: p.type === 'political' ? 'Political' : p.type === 'social' ? 'Social service' : 'Village events', caption: p.title, post: p.id, date: p.date }))), ...C.photos.map(p => ({ ...p, own: 1 }))];
const allVideos = () => [...C.posts.filter(p => p.status !== 'draft').flatMap(p => (p.videos || []).map(src => ({ src, type: p.type, title: p.title, date: p.date, post: p.id })))];
async function sha(s) { if (!crypto.subtle) return 'x' + btoa(unescape(encodeURIComponent(s))); const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function cred() { let c = Store.get('cred'); if (!c) { c = { u: 'admin', h: await sha('admin@beldari'), a: await sha('beldari') }; Store.set('cred', c); } return c; }

/* ---------- public views ---------- */
const V = {};
const SLIDES = [
  { img: 'ram.jpg', h: 'सेवा • सहयोग • समर्पण', p: 'बेलदारी समाज सेवा — गाउँको सेवा, एकता र विकासका लागि हामी सँगै छौं।' },
  { img: 'logo.jpg', h: 'गाउँको सेवा, सबैको साथ', p: 'समाचार, सेवा कार्य, फोटो र कार्यक्रम एकै ठाउँमा।', logo: 1 }
];
function heroSlider() {
  return `<section class="tpl" aria-roledescription="carousel">${SLIDES.map((s, i) => `<div class="tslide ${i === 0 ? 'on' : ''} ${s.logo ? 'lg' : ''}"><img src="${s.img}" alt=""><div class="tmask"></div><div class="ttx"><h2>${s.h}</h2><p>${s.p}</p><div class="row"><button class="tb dark" onclick="A.go('contact')">JOIN TODAY →</button><button class="tb light" onclick="A.go('social')">VIEW SERVICE →</button></div></div></div>`).join('')}<button class="tar l" aria-label="Previous" onclick="A.slide(-1)">‹</button><button class="tar r" aria-label="Next" onclick="A.slide(1)">›</button></section>`;
}
A.slide = d => { const l = document.querySelectorAll('.tslide'); if (!l.length) return; let i = [...l].findIndex(x => x.classList.contains('on')); l[i].classList.remove('on'); l[(i + d + l.length) % l.length].classList.add('on'); };
V.home = () => {
  const ps = pub(); const emg = C.notes.filter(n => n.kind === 'Emergency').slice(0, 1);
  const sc = ($('.bg .anim') || { outerHTML: '' }).outerHTML.replace('class="anim"', 'class="anim hs"');
  return `${heroSlider()}<!--TK--><section class="glass hero"><div class="tx"><h1>स्वागत छ, ${NAME}</h1><span class="tag">सेवा • सहयोग • समर्पण</span><p>एकअर्कालाई सहयोग गरौं — बेलदारी गाउँको समाचार, सेवा कार्य र जनताका आवाज एकै ठाउँमा।</p></div>${sc}</section>
  ${emg.map(n => `<div class="glass pad" style="border-left:6px solid var(--err);margin-bottom:12px"><span class="badge emergency">Emergency</span> <b>${e(n.title)}</b><p>${e(n.msg)}</p></div>`).join('')}
  ${ps[0] ? leadHTML(ps[0]) : ''}
  ${ps.length > 1 ? sec('Top stories', '', cards(ps.slice(1, 5), '')) : ''}
  <h2 class="sec">Quick access</h2><div class="quick">${NAV.slice(1, 9).map(([k, i, l]) => `<a class="glass" onclick="A.go('${k}')"><span>${i}</span>${l.split(' ')[0]}</a>`).join('')}</div>
  ${sec('Latest announcements', 'news', C.notes.length ? `<div class="list">${C.notes.slice(0, 3).map(noteRow).join('')}</div>` : empty('📢', 'No announcements yet', 'New village notices will appear here.'))}
  ${sec('Political updates', 'political', cards(ofType('political').slice(0, 3), empty('🏛️', 'No political updates yet')))}
  ${sec('Social service', 'social', cards(ofType('social').slice(0, 3), empty('🤝', 'No social service activities yet')))}
  ${sec('Latest photos', 'gallery', galGrid(allPhotos().slice(0, 6), empty('🖼️', 'No photos yet')))}
  ${sec('Upcoming events', 'events', upcoming().length ? `<div class="list">${upcoming().slice(0, 3).map(evRow).join('')}</div>` : empty('📅', 'No upcoming events'))}`;
};
function feed(type, label, note) {
  const cats = [...new Set(ofType(type).map(p => p.cat).filter(Boolean))];
  S.type = type;
  return `<h1>${label}</h1><p class="meta" style="margin:4px 0 10px">${note}</p>
  <div class="row" style="margin-bottom:10px"><input style="flex:1" placeholder="Search ${label.toLowerCase()}…" value="${e(S.q)}" oninput="A.q(this.value)" aria-label="Search"></div>
  <div class="chips" style="margin-bottom:12px"><button class="btn sm sec ${!S.cat ? 'on' : ''}" onclick="A.cat('')">All</button>${cats.map(c => `<button class="btn sm sec ${S.cat === c ? 'on' : ''}" onclick="A.cat('${e(c).replace(/'/g, '')}')">${e(c)}</button>`).join('')}</div><div id="list">${feedList()}</div>`;
}
function feedList() { const q = S.q.toLowerCase(); const l = ofType(S.type).filter(p => (!S.cat || p.cat === S.cat) && (!q || (p.title + p.desc).toLowerCase().includes(q))); return cards(l, empty('🔎', 'Nothing found', 'Try another search or category.')); }
A.q = v => { S.q = v; $('#list').innerHTML = feedList(); };
A.cat = c => { S.cat = c; render(true); };
V.political = () => feed('political', 'Political Updates', 'Information from different viewpoints. Each post shows the views of the person who published it.');
V.social = () => feed('social', 'Social Service', 'Charity, food and clothes, medical help, education, cleaning and plantation, development.');
const shareUrl = id => (/^https?:/.test(location.protocol) ? location.origin + '/p/' + id : location.href.split('#')[0] + '#/post/' + id);
function links(id) {
  const p = C.posts.find(x => x.id === id) || {}; const u = shareUrl(id), eu = encodeURIComponent(u), et = encodeURIComponent(p.title || NAME);
  return [['WhatsApp', '#25d366', '💬', `https://wa.me/?text=${et}%20${eu}`], ['Facebook', '#1877f2', 'f', `https://www.facebook.com/sharer/sharer.php?u=${eu}`], ['X / Twitter', '#111', '𝕏', `https://twitter.com/intent/tweet?text=${et}&url=${eu}`], ['Telegram', '#229ed9', '✈', `https://t.me/share/url?url=${eu}&text=${et}`],
    ['Instagram', 'linear-gradient(45deg,#f9a825,#dd2a7b,#8134af)', '📷', 'https://www.instagram.com/', 1], ['TikTok', '#000', '♪', 'https://www.tiktok.com/', 1], ['Messenger', '#0084ff', '✉', 'https://www.messenger.com/', 1]];
}
const lk = (id, x) => x[4] ? `<button class="sb" title="${x[0]}" style="background:${x[1]}" onclick="A.ext('${id}','${x[0]}','${x[3]}')">${x[2]}</button>` : `<a class="sb" title="${x[0]}" style="background:${x[1]}" href="${x[3]}" target="_blank" rel="noopener">${x[2]}</a>`;
const shareBar = id => `<div class="row sbar"><b>Share:</b>${links(id).slice(0, 4).map(x => lk(id, x)).join('')}<button class="sb" style="background:var(--royal)" title="Copy link" onclick="A.copy('${id}')">🔗</button><button class="btn sm sec" onclick="A.sheet('${id}')">More</button></div>`;
A.copy = async id => { const u = id.startsWith('http') ? id : shareUrl(id); try { await navigator.clipboard.writeText(u); } catch { const t = document.createElement('textarea'); t.value = u; document.body.append(t); t.select(); try { document.execCommand('copy'); } catch { } t.remove(); } toast('Link copied'); };
A.ext = async (id, name, url) => { await A.copy(id); toast(`Link copied. Paste it in ${name}.`); window.open(url, '_blank', 'noopener'); };
A.sheet = id => {
  const p = C.posts.find(x => x.id === id); if (!p) return; const m = $('#modal'); const u = shareUrl(id);
  m.className = 'sh'; m.onclick = ev => { if (ev.target === m) m.hidden = true; };
  m.innerHTML = `<div class="sheet"><b>Share this story</b><div class="sgrid">${links(id).map(x => `<div>${lk(id, x)}<span>${x[0]}</span></div>`).join('')}<div><button class="sb" style="background:var(--royal)" onclick="A.copy('${id}')">🔗</button><span>Copy link</span></div></div><input readonly value="${e(u)}" onclick="this.select()" aria-label="Link">${navigator.share ? `<button class="btn" onclick="navigator.share({title:'${e(p.title).replace(/'/g, '')}',url:'${u}'}).catch(()=>{})">Share with other apps</button>` : ''}<button class="btn sec" onclick="$('#modal').hidden=true">Close</button></div>`; m.hidden = false;
};
V.post = id => {
  const p = C.posts.find(x => x.id === id);
  if (!p || (p.status === 'draft' && !S.admin)) return `<div class="glass empty"><b>📰</b><p><strong>यो समाचार अहिले उपलब्ध छैन</strong></p><p>Please check the latest stories.</p><button class="btn" onclick="A.go('home')">Go to home</button></div>`;
  document.title = p.title + ' | ' + NAME; const rel = pub().filter(x => x.id !== p.id && x.type === p.type).slice(0, 3);
  return `<article class="glass pad post"><span class="tg ${p.type}">${e(p.cat || p.type)}</span>${p.status === 'draft' ? ' <span class="badge draft">Draft</span>' : ''}<h1 class="hl">${e(p.title)}</h1><p class="meta byline">✍ Written by <b>${e(p.author || NAME)}</b><br>📅 ${e(p.date)}${p.time ? ' · 🕒 ' + e(p.time) : ''}${p.loc ? ' · 📍 ' + e(p.loc) : ''}</p>
  ${(p.images || []).map(s => `<img class="big" src="${e(s)}" alt="" onclick="A.open(this.src)">`).join('')}${(p.videos || []).map(s => `<video controls playsinline src="${e(s)}"></video>`).join('')}
  <p class="txt">${e(p.desc)}</p>${(p.docs || []).map(d => `<p>📎 ${e(d)}</p>`).join('')}${shareBar(p.id)}<button class="btn sec" onclick="history.back()">← Back</button></article>${rel.length ? sec('Related stories', '', cards(rel, '')) : ''}`;
};
function galGrid(l, em) { return l.length ? `<div class="gal">${l.map(p => `<img src="${e(p.src)}" alt="${e(p.caption)}" loading="lazy" onclick="A.open(this.src)">`).join('')}</div>` : em; }
V.gallery = () => {
  const al = ['All', ...albumsAll()]; const sel = S.cat || 'All'; const l = allPhotos().filter(p => sel === 'All' || p.album === sel);
  return `<h1>Photo Gallery</h1><div class="chips" style="margin:10px 0">${al.map(a => `<button class="btn sm sec ${a === sel ? 'on' : ''}" onclick="A.cat('${a === 'All' ? '' : a}')">${a}</button>`).join('')}</div>
  ${S.admin ? `<button class="btn sm" onclick="A.go('admin/photos/edit/new')">+ Add photos</button>` : ''}${l.length ? `<div class="gal" style="margin-top:10px">${l.map(p => `<div><img src="${e(p.src)}" alt="${e(p.caption)}" loading="lazy" onclick="A.open(this.src)">${S.admin && p.own ? `<div class="row" style="margin:-4px 0 8px"><button class="btn sm sec" onclick="A.go('admin/photos/edit/${p.id}')">Edit</button><button class="btn sm red" onclick="A.del('photos','${p.id}')">Delete</button></div>` : ''}</div>`).join('')}</div>` : empty('🖼️', 'No photos in this album', 'Photos from posts and uploads appear here.')}`;
};
V.videos = () => {
  const q = S.q.toLowerCase(); const l = allVideos().filter(v => (!S.cat || v.type === S.cat) && (!q || v.title.toLowerCase().includes(q)));
  return `<h1>Video Gallery</h1><input style="margin:10px 0" placeholder="Search videos…" value="${e(S.q)}" oninput="S_q(this.value)"><div class="chips" style="margin-bottom:12px">${[['', 'All'], ['social', 'Social service'], ['political', 'Political']].map(([k, l]) => `<button class="btn sm sec ${S.cat === k ? 'on' : ''}" onclick="A.cat('${k}')">${l}</button>`).join('')}</div>
  ${l.length ? `<div class="grid">${l.map(v => `<div class="glass card"><div class="th"><video controls playsinline preload="metadata" src="${e(v.src)}#t=0.5"></video></div><div class="bd"><span class="badge">${v.type}</span><h3>${e(v.title)}</h3><span class="meta">${e(v.date)}</span></div></div>`).join('')}</div>` : empty('🎬', 'No videos yet', 'Videos attached to posts appear here.')}`;
};
window.S_q = v => { S.q = v; clearTimeout(S.t); S.t = setTimeout(() => render(true), 300); };
const kinds = ['Emergency', 'Meeting', 'Event', 'Public information'];
const noteRow = n => `<div class="glass item" onclick="A.read('${n.id}')" style="cursor:pointer">${readIds().includes(n.id) ? '' : '<span class="dot" title="Unread"></span>'}<div class="grow"><span class="badge ${n.kind === 'Emergency' ? 'emergency' : ''}">${e(n.kind)}</span> <b>${e(n.title)}</b><span class="meta">${e(n.date)}</span><p style="white-space:normal">${e(n.msg)}</p></div></div>`;
A.read = id => { const r = readIds(); if (!r.includes(id)) { r.push(id); Store.set('read', r); render(true); } };
A.readAll = () => { Store.set('read', C.notes.map(n => n.id)); render(true); };
V.news = () => `<div class="row" style="justify-content:space-between"><h1>News & Notices</h1>${unread() ? '<button class="btn sm sec" onclick="A.readAll()">Mark all read</button>' : ''}</div><p class="meta" style="margin:6px 0 12px">Announcements, emergency notices, meetings and public information. Full history is kept below.</p>
  ${C.notes.length ? `<div class="list">${C.notes.map(noteRow).join('')}</div>` : empty('🔔', 'No notifications yet', 'Village notices will show here.')}${ofType('news').length ? sec('Village news', '', cards(ofType('news'), '')) : ''}`;
const upcoming = () => C.events.filter(x => x.date >= today()).sort((a, b) => a.date.localeCompare(b.date));
const evRow = x => `<div class="glass item">${x.image ? `<img class="av" style="border-radius:12px" src="${e(x.image)}" alt="">` : '<div class="av" style="border-radius:12px">📅</div>'}<div class="grow"><b>${e(x.title)}</b><span class="meta">${e(x.date)} · ${e(x.time || '')} · 📍 ${e(x.loc || '')}</span><p style="white-space:normal;font-size:.88rem">${e(x.desc || '')}</p></div></div>`;
V.events = () => {
  const d = new Date(); d.setMonth(d.getMonth() + S.cm, 1); const y = d.getFullYear(), m = d.getMonth(), n = new Date(y, m + 1, 0).getDate();
  const has = day => C.events.some(x => x.date === `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  const past = C.events.filter(x => x.date < today()).sort((a, b) => b.date.localeCompare(a.date));
  return `<h1>Events & Programs</h1><div class="glass" style="margin:10px 0"><div class="row" style="justify-content:space-between;padding:10px 14px"><button class="btn sm sec" onclick="S.cm--;render(true)">‹</button><b>${d.toLocaleString('en', { month: 'long', year: 'numeric' })}</b><button class="btn sm sec" onclick="S.cm++;render(true)">›</button></div>
  <div class="cal">${'SMTWTFS'.split('').map(x => `<span class="hd">${x}</span>`).join('')}${'<span></span>'.repeat(new Date(y, m, 1).getDay())}${Array.from({ length: n }, (_, i) => `<span class="${has(i + 1) ? 'ev' : ''}">${i + 1}</span>`).join('')}</div></div>
  ${sec('Upcoming', '', upcoming().length ? `<div class="list">${upcoming().map(evRow).join('')}</div>` : empty('📅', 'No upcoming events'))}${sec('Previous events', '', past.length ? `<div class="list">${past.map(evRow).join('')}</div>` : empty('🗓️', 'No previous events'))}`;
};
V.members = () => {
  const q = S.q.toLowerCase(); const l = C.members.filter(m => !q || (m.name + m.role).toLowerCase().includes(q));
  return `<h1>Community Members</h1><input style="margin:10px 0" placeholder="Search by name or designation…" value="${e(S.q)}" oninput="S_q(this.value)">${l.length ? `<div class="list">${l.map(m => `<div class="glass item">${m.photo ? `<img class="av" src="${e(m.photo)}" alt="">` : `<div class="av">${e((m.name || '?')[0])}</div>`}<div class="grow"><b>${e(m.name)}</b><span class="meta">${e(m.role)}</span>${m.phone ? `<a href="tel:${e(m.phone)}">📞 ${e(m.phone)}</a>` : ''}</div></div>`).join('')}</div>` : empty('👥', 'No members found', 'Admins can add members from the admin panel.')}`;
};
V.search = () => {
  const q = S.q.toLowerCase(); const r = q ? [...pub().filter(p => (p.title + p.desc).toLowerCase().includes(q)), ] : [];
  return `<h1>Search</h1><input style="margin:10px 0" autofocus placeholder="Search posts, events, members, notices…" value="${e(S.q)}" oninput="S_q(this.value)">${!q ? empty('🔍', 'Type to search') : ''}
  ${q ? sec('Posts', '', cards(r, empty('🔎', 'No posts match'))) : ''}${q ? sec('Events', '', `<div class="list">${C.events.filter(x => (x.title + x.desc).toLowerCase().includes(q)).map(evRow).join('') || empty('📅', 'No events match')}</div>`) : ''}
  ${q ? sec('Members', '', `<div class="list">${C.members.filter(x => (x.name + x.role).toLowerCase().includes(q)).map(m => `<div class="glass item"><div class="av">${e(m.name[0])}</div><div class="grow"><b>${e(m.name)}</b><span class="meta">${e(m.role)}</span></div></div>`).join('') || empty('👥', 'No members match')}</div>`) : ''}`;
};
V.about = () => `<div class="glass pad"><img src="logo.jpg" alt="${NAME}" style="width:140px;border-radius:50%;display:block;margin:auto"><h1 style="text-align:center">About ${NAME}</h1><p style="margin-top:10px">${NAME} बेलदारी गाउँको सामाजिक सेवा संस्था हो। हाम्रो मूल मन्त्र: <b>सेवा • सहयोग • समर्पण</b>। यो एपमा गाउँका सूचना, सेवा कार्य, कार्यक्रम, फोटो/भिडियो र जनताका विषयहरू राखिन्छन्।</p></div>`;
const MAIL = 'info.beldarisamajsewa@gmail.com', FB = 'https://www.facebook.com/profile.php?id=61593609923542';
const fbLogo = '<svg viewBox="0 0 36 36" width="48" height="48" aria-hidden="true"><path fill="#0866FF" d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 34h5.5l.681 1.87Z"/><path fill="#fff" d="M13.651 35.471v-11.97H9.936V18h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18h5.883l-1.008 5.5h-4.867v12.37a18.183 18.183 0 0 1-6.53-.399Z"/></svg>';
const follow = () => `<a href="${FB}" target="_blank" rel="noopener" title="Facebook" aria-label="Facebook" style="display:inline-block;line-height:0;transition:transform .2s" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform=''">${fbLogo}</a>`;
V.contact = () => `<div class="glass pad"><h1>Contact</h1><div style="display:grid;gap:14px;margin:14px 0"><div><b>✉️ Email</b><br><a href="mailto:${MAIL}" style="color:var(--royal);word-break:break-all">${MAIL}</a></div>${follow()}</div>
<h2 class="sec" style="margin-top:6px">Send us a message</h2><form onsubmit="A.msg(event)"><div class="two"><label>Name<input name="n" required></label><label>Phone / email<input name="c" required></label></div><label>Message<textarea name="m" rows="4" required></textarea></label><button class="btn">Send message by email</button></form></div>`;
A.msg = ev => { ev.preventDefault(); const f = Object.fromEntries(new FormData(ev.target)); const m = Store.get('msgs', []); m.push({ ...f, date: today() }); Store.set('msgs', m); ev.target.reset(); toast('Opening your email app…'); location.href = `mailto:${MAIL}?subject=${encodeURIComponent('Message from ' + f.n)}&body=${encodeURIComponent(f.m + '\n\nContact: ' + f.c)}`; };
V.profile = () => { const p = Store.get('profile', {}); return `<div class="glass pad"><h1>My Profile</h1><form onsubmit="A.prof(event)"><label>Name<input name="n" value="${e(p.n)}"></label><label>Phone<input name="p" value="${e(p.p)}"></label><label>Ward / address<input name="w" value="${e(p.w)}"></label><button class="btn">Save profile</button></form></div>`; };
A.prof = ev => { ev.preventDefault(); const f = Object.fromEntries(new FormData(ev.target)); Store.set('profile', f); toast('Profile saved'); };
V.settings = () => `<div class="glass pad"><h1>Settings</h1><form><label>Text size<select onchange="A.ts(this.value)">${['16', '18', '20'].map(s => `<option ${Store.get('ts', '16') === s ? 'selected' : ''}>${s}</option>`)}</select></label><label><span><input type="checkbox" style="width:auto" ${Store.get('nt', true) ? 'checked' : ''} onchange="Store_s('nt',this.checked)"> Show notification badges</span></label><button type="button" class="btn red" onclick="A.reset()">Clear all data on this device</button></form></div>`;
window.Store_s = (k, v) => Store.set(k, v);
A.ts = v => { Store.set('ts', v); document.documentElement.style.fontSize = v + 'px'; };
A.reset = () => { if (confirm('Delete all locally saved posts, events, members and settings?')) { Object.keys(localStorage).filter(k => k.startsWith('bss_')).forEach(k => localStorage.removeItem(k)); sessionStorage.clear(); location.hash = '#/home'; location.reload(); } };
V.privacy = () => `<div class="glass pad"><h1>Privacy & Information</h1><p>This version stores content only on your own device (browser storage). Nothing is sent to any server. When online storage is added, this page will describe what is collected and why.</p><p style="margin-top:8px">Posts show the views of those who publish them. ${NAME} does not endorse any party.</p></div>`;
V.menu = () => `<h1>All sections</h1><div class="grid" style="margin-top:10px">${NAV.map(([k, i, l]) => `<a class="glass item" onclick="A.go('${k}')" style="cursor:pointer"><span style="font-size:1.6rem">${i}</span><b>${l}</b></a>`).join('')}</div>`;
V.nf = () => { setTimeout(() => A.go('home'), 0); return ''; };

/* ---------- admin ---------- */
const postF = () => [{ k: 'type', l: 'Section', t: 'select', o: ['political', 'social', 'news'] }, { k: 'title', l: 'Post title', r: 1 }, { k: 'author', l: 'Written by (author name)', d: 'me', r: 1 }, { k: 'cat', l: 'Category', list: ['News', 'Announcement', 'Event', 'Public question', 'Road conditions', 'Charity', 'Food & clothes', 'Medical help', 'Education', 'Cleaning', 'Tree plantation', 'Development'] }, { k: 'desc', l: 'Description', t: 'textarea', r: 1 }, { k: 'date', l: 'Date', t: 'date', d: 'today' }, { k: 'time', l: 'Time', t: 'time', d: 'now' }, { k: 'loc', l: 'Location' }, { k: 'images', l: 'Photos', t: 'img', m: 1 }, { k: 'videos', l: 'Videos', t: 'vid', m: 1 }, { k: 'docs', l: 'Documents', t: 'doc', m: 1 }];
const CFG = {
  posts: { s: 'post', l: 'Posts', f: postF, row: p => [p.title, `${p.type} · ${p.author || ''} · ${p.date} ${p.time || ''}`, p.status === 'draft' ? '<span class="badge draft">Draft</span>' : ''] },
  notes: { s: 'notification', l: 'Notifications', f: () => [{ k: 'title', l: 'Title', r: 1 }, { k: 'kind', l: 'Type', t: 'select', o: kinds }, { k: 'msg', l: 'Message', t: 'textarea', r: 1 }, { k: 'date', l: 'Date', t: 'date', d: 'today' }], row: n => [n.title, `${n.kind} · ${n.date}`, ''] },
  events: { s: 'event', l: 'Events', f: () => [{ k: 'title', l: 'Event name', r: 1 }, { k: 'date', l: 'Date', t: 'date', r: 1 }, { k: 'time', l: 'Time', t: 'time' }, { k: 'loc', l: 'Location' }, { k: 'desc', l: 'Description', t: 'textarea' }, { k: 'image', l: 'Image', t: 'img' }], row: x => [x.title, `${x.date} · ${x.loc || ''}`, ''] },
  members: { s: 'member', l: 'Members', f: () => [{ k: 'name', l: 'Name', r: 1 }, { k: 'role', l: 'Designation' }, { k: 'phone', l: 'Contact number', t: 'tel' }, { k: 'photo', l: 'Photo', t: 'img' }], row: m => [m.name, m.role || '', ''] },
  photos: { s: 'photos', l: 'Gallery photos', f: () => [{ k: 'album', l: 'Album', t: 'select', o: albumsAll() }, { k: 'caption', l: 'Caption' }, { k: 'src', l: 'Photos', t: 'img', m: 1 }], row: p => [p.caption || 'Photo', p.album, ''], thumb: 'src' },
  albums: { s: 'album', l: 'Albums', f: () => [{ k: 'name', l: 'Album name', r: 1 }], row: a => [a.name, 'Custom album', ''] }
};
function formHTML(fields, v) {
  return fields.map(f => {
    const val = e(v[f.k] ?? (f.d === 'today' ? today() : f.d === 'now' ? new Date().toTimeString().slice(0, 5) : f.d === 'me' ? Store.get('author', '') : ''));
    if (f.t === 'textarea') return `<label>${f.l}<textarea name="${f.k}" rows="6" ${f.r ? 'required' : ''}>${val}</textarea></label>`;
    if (f.t === 'select') return `<label>${f.l}<select name="${f.k}">${f.o.map(o => `<option ${o == v[f.k] ? 'selected' : ''}>${e(o)}</option>`).join('')}</select></label>`;
    if (['img', 'vid', 'doc'].includes(f.t)) return `<label>${f.l}<input type="file" name="${f.k}" data-k="${f.k}" data-t="${f.t}" data-m="${f.m ? 1 : ''}" accept="${f.t === 'img' ? 'image/*' : f.t === 'vid' ? 'video/*' : '.pdf,.doc,.docx,.xls,.xlsx,.txt'}" ${f.m ? 'multiple' : ''}></label><div class="prev" id="pv-${f.k}"></div>`;
    return `<label>${f.l}<input type="${f.t || 'text'}" name="${f.k}" value="${val}" ${f.list ? `list="dl-${f.k}"` : ''} ${f.r ? 'required' : ''}></label>${f.list ? `<datalist id="dl-${f.k}">${f.list.map(o => `<option>${o}</option>`).join('')}</datalist>` : ''}`;
  }).join('');
}
const shrink = file => new Promise(res => { const r = new FileReader(); r.onload = () => { const i = new Image(); i.onload = () => { const k = Math.min(1, 1280 / Math.max(i.width, i.height)); const c = document.createElement('canvas'); c.width = i.width * k; c.height = i.height * k; c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .82)); }; i.onerror = () => res(null); i.src = r.result; }; r.readAsDataURL(file); });
function showPrev(k, t, vals) { const box = $('#pv-' + k); if (!box) return; box.innerHTML = (vals || []).map(s => t === 'img' ? `<img src="${e(s)}" alt="">` : t === 'vid' ? `<video src="${e(s)}" muted controls></video>` : `<span class="badge">📎 ${e(s)}</span>`).join(''); }
function formView(tab, id) {
  const cfg = CFG[tab]; const item = id === 'new' ? {} : C[tab].find(x => x.id === id) || {}; S.pend = {};
  S.after = () => {
    cfg.f().filter(f => ['img', 'vid', 'doc'].includes(f.t)).forEach(f => { const cur = item[f.k]; showPrev(f.k, f.t, cur ? [].concat(cur) : []); });
    $('#f').querySelectorAll('input[type=file]').forEach(inp => inp.onchange = async () => {
      const t = inp.dataset.t, k = inp.dataset.k, files = [...inp.files]; let out = [];
      if (t === 'img') { showPrev(k, 'doc', ['Uploading…']); out = []; for (const f of files) { const d = await shrink(f); if (!d) continue; if (R.on) { try { out.push(await upImg(d)); continue; } catch (err) { toast('Server upload failed. Saved on this device only.', 'err'); } } out.push(d); } } else if (t === 'vid') out = files.map(f => URL.createObjectURL(f)); else out = files.map(f => f.name);
      if (t === 'vid' && files.length) toast('Video preview works for this session. Permanent video storage needs the online server.');
      S.pend[k] = inp.dataset.m ? out : out[0]; showPrev(k, t, out);
    });
    $('#f').onsubmit = ev => {
      ev.preventDefault(); const st = ev.submitter?.dataset.st; const d = Object.fromEntries([...new FormData(ev.target)].filter(([k, v]) => typeof v === 'string'));
      cfg.f().filter(f => ['img', 'vid', 'doc'].includes(f.t)).forEach(f => { d[f.k] = S.pend[f.k] !== undefined ? S.pend[f.k] : item[f.k] ?? (f.m ? [] : ''); });
      if (tab === 'photos') { const l = [].concat(d.src || []); if (!l.length) return toast('Choose at least one photo', 'err'); if (item.id) C.photos = C.photos.filter(x => x.id !== item.id); l.forEach(s => C.photos.unshift({ id: uid(), album: d.album, caption: d.caption, src: s, date: today() })); }
      else { const rec = { ...item, ...d, id: item.id || uid() }; if (tab === 'posts') { rec.status = st; Store.set('author', rec.author); } const i = C[tab].findIndex(x => x.id === rec.id); i < 0 ? C[tab].unshift(rec) : (C[tab][i] = rec); if (tab === 'notes') toast('Notification sent to all users on this device'); }
      if (!save(tab)) return; toast(tab === 'posts' ? (st === 'draft' ? 'Draft saved' : 'Published') : 'Saved'); A.go('admin/' + tab);
    };
  };
  return `<div class="glass pad"><h1>${id === 'new' ? 'New' : 'Edit'} ${cfg.s}</h1><form id="f" style="margin-top:12px">${formHTML(cfg.f(), item)}<div class="row">${tab === 'posts' ? '<button class="btn" data-st="published">Publish</button><button class="btn sec" data-st="draft">Save draft</button>' : '<button class="btn" data-st="x">Save</button>'}<button type="button" class="btn sec" onclick="history.back()">Cancel</button></div></form></div>`;
}
A.del = (tab, id) => { if (!confirm('Delete this item? This cannot be undone.')) return; C[tab] = C[tab].filter(x => x.id !== id); if (tab === 'posts') Store.set('hidden', [...Store.get('hidden', []), id]); save(tab); toast('Deleted'); render(true); };
A.exp = () => { const b = new Blob([JSON.stringify(C.posts.filter(p => p.status !== 'draft'), null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'posts.json'; a.click(); };
const TABS = [['overview', 'Dashboard'], ['posts', 'Posts'], ['notes', 'Notifications'], ['events', 'Events'], ['members', 'Members'], ['photos', 'Gallery'], ['albums', 'Albums'], ['account', 'Account']];
V.admin = (tab = 'overview', act, id) => {
  if (!S.admin) return loginView(tab);
  const bar = `<div class="row" style="justify-content:space-between"><h1>Admin</h1><button class="btn sm sec" onclick="A.logout()">Log out</button></div><div class="chips" style="margin:10px 0">${TABS.map(([k, l]) => `<button class="btn sm sec ${k === tab ? 'on' : ''}" onclick="A.go('admin/${k}')">${l}</button>`).join('')}</div>`;
  if (act === 'edit') return bar + formView(tab, id);
  if (tab === 'account') return bar + accountView();
  if (tab === 'overview') {
    const st = [['Posts', C.posts.length], ['Published', C.posts.filter(p => p.status !== 'draft').length], ['Drafts', C.posts.filter(p => p.status === 'draft').length], ['Political', C.posts.filter(p => p.type === 'political').length], ['Social', C.posts.filter(p => p.type === 'social').length], ['Photos', allPhotos().length], ['Videos', allVideos().length], ['Events', C.events.length], ['Members', C.members.length], ['Notices', C.notes.length]];
    return bar + `<div class="stats">${st.map(([l, n]) => `<div class="glass"><b>${n}</b>${l}</div>`).join('')}</div><div class="row" style="margin-top:14px"><button class="btn" onclick="A.go('admin/posts/edit/new')">+ New post</button><button class="btn sec" onclick="A.go('admin/notes/edit/new')">Send notification</button><button class="btn sec" onclick="A.exp()">Export posts.json</button></div><p class="meta" style="margin-top:10px">Export posts.json and put it in <code>data/</code> before deploying so shared links show a preview on Facebook and WhatsApp.</p>`;
  }
  const cfg = CFG[tab]; if (!cfg) return V.nf();
  return bar + `<div class="row" style="justify-content:space-between;margin-bottom:10px"><h2>${cfg.l}</h2><button class="btn sm" onclick="A.go('admin/${tab}/edit/new')">+ New</button></div>` + (C[tab].length ? `<div class="list">${C[tab].map(x => { const [a, b, c] = cfg.row(x); const im = x[cfg.thumb || 'image'] || x.photo || (x.images && x.images[0]); return `<div class="glass item">${im ? `<img class="av" style="border-radius:10px" src="${e(im)}" alt="">` : ''}<div class="grow"><b>${e(a)}</b><span class="meta">${e(b)}</span></div>${c}${tab === 'posts' ? `<button class="btn sm sec" onclick="A.go('post/${x.id}')">View</button>` : ''}${tab !== 'albums' && tab !== 'photos' || tab === 'albums' ? `<button class="btn sm sec" onclick="A.go('admin/${tab}/edit/${x.id}')">Edit</button>` : ''}<button class="btn sm red" onclick="A.del('${tab}','${x.id}')">Delete</button></div>`; }).join('')}</div>` : empty('📭', `No ${cfg.l.toLowerCase()} yet`, 'Use “New” to add the first one.'));
};
function loginView(tab) {
  if (tab === 'forgot') return `<div class="glass pad" style="max-width:420px;margin:auto"><h1>Forgot username or password</h1><form onsubmit="A.forgot(event)" style="margin-top:10px"><label>Recovery answer<input name="a" required placeholder="Your recovery answer"></label><label>New password<input name="p" type="password" minlength="6" required></label><button class="btn">Show username & reset password</button><button type="button" class="btn sec" onclick="A.go('admin')">Back to login</button></form></div>`;
  return `<div class="glass pad" style="max-width:420px;margin:auto"><div style="text-align:center"><img src="logo.jpg" style="width:90px;border-radius:50%" alt=""><h1>Admin login</h1></div><form onsubmit="A.login(event)" style="margin-top:10px"><label>Username<input name="u" autocomplete="username" required></label><label>Password<input name="p" type="password" autocomplete="current-password" required></label><button class="btn">Log in</button><a onclick="A.go('admin/forgot')" style="cursor:pointer;color:var(--royal);text-align:center">Forgot username or password?</a></form></div>`;
}
A.login = async ev => { ev.preventDefault(); const f = Object.fromEntries(new FormData(ev.target)); const c = await cred(); if (f.u === c.u && (await sha(f.p)) === c.h) { S.admin = true; S.key = await sha(f.p); sessionStorage.setItem('bss_admin', '1'); sessionStorage.setItem('bss_key', S.key); toast('Welcome, admin'); A.go('admin/overview'); } else toast('Wrong username or password', 'err'); };
A.logout = () => { S.admin = false; S.key = ''; sessionStorage.removeItem('bss_admin'); sessionStorage.removeItem('bss_key'); A.go('home'); };
A.forgot = async ev => { ev.preventDefault(); const f = Object.fromEntries(new FormData(ev.target)); const c = await cred(); if ((await sha(f.a.trim().toLowerCase())) !== c.a) return toast('Recovery answer is incorrect', 'err'); c.h = await sha(f.p); Store.set('cred', c); alert('Your username is: ' + c.u + '\nYour password has been reset.'); A.go('admin'); };
function accountView() { return `<div class="glass pad"><h2>Change username or password</h2><form onsubmit="A.acct(event)" style="margin-top:10px"><label>Current password<input name="cp" type="password" required></label><label>New username (leave empty to keep)<input name="u"></label><label>New password (leave empty to keep)<input name="p" type="password" minlength="6"></label><label>New recovery answer (leave empty to keep)<input name="a"></label><button class="btn">Save changes</button></form></div>`; }
A.acct = async ev => { ev.preventDefault(); const f = Object.fromEntries(new FormData(ev.target)); const c = await cred(); if ((await sha(f.cp)) !== c.h) return toast('Current password is wrong', 'err'); if (f.u) c.u = f.u.trim(); if (f.p) c.h = await sha(f.p); if (f.a) c.a = await sha(f.a.trim().toLowerCase()); Store.set('cred', c); if (f.p && R.on) { try { await api('/key', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: c.h }) }); S.key = c.h; sessionStorage.setItem('bss_key', c.h); } catch (err) { toast('Password changed here, but the server key was not updated.', 'err'); } } ev.target.reset(); toast('Account updated'); };

/* ---------- shell / router ---------- */
const TOP = [['HOME', 'home'], ['POLITICAL', 'political'], ['SERVICE', 'social'], ['GALLERY', [['Photo Gallery', 'gallery'], ['Video Gallery', 'videos']]], ['NEWS', [['News & Notices', 'news'], ['Events', 'events'], ['Search', 'search']]], ['PAGES', [['Members', 'members'], ['About Us', 'about'], ['Contact', 'contact'], ['Profile', 'profile'], ['Settings', 'settings'], ['Privacy', 'privacy'], ['Admin', 'admin']]]];
function topnav(cur) {
  return `<div class="tn"><button class="gb" onclick="A.go('menu')" aria-label="Menu">▦</button><nav>${TOP.map(([l, t]) => Array.isArray(t) ? `<div><a class="m ${t.some(x => x[1] === cur) ? 'on' : ''}">${l} ▾</a><div class="dm">${t.map(([n, k]) => `<a onclick="A.go('${k}')">${n}</a>`).join('')}</div></div>` : `<div><a class="m ${cur === t ? 'on' : ''}" onclick="A.go('${t}')">${l}</a></div>`).join('')}</nav>
  <div class="logobox" onclick="A.go('home')"><img src="logo.jpg" alt=""><b>BELDARI SAMAJ SEWA</b></div>
  <div class="tr"><a class="sup2" href="mailto:${MAIL}"><span>✉</span><div><small>GET SUPPORT</small><b>${MAIL}</b></div></a><button class="tb dark" onclick="A.go('contact')">CONTACT US</button><button class="srch" onclick="A.go('search')" aria-label="Search">🔍</button></div></div>`;
}
function shell() {
  const cur = location.hash.slice(2).split('/')[0] || 'home'; const n = unread() && Store.get('nt', true) ? unread() : 0;
  $('#topnav').innerHTML = topnav(cur);
  $('#side').innerHTML = `<div class="lg"><img src="logo.jpg" alt="${NAME}">${NAME}</div>` + NAV.map(([k, i, l]) => `<a class="${cur === k ? 'on' : ''}" onclick="A.go('${k}')"><span>${i} ${l}</span>${k === 'news' && n ? `<span class="badge emergency">${n}</span>` : ''}</a>`).join('');
  $('#tabs').innerHTML = [['home', '🏠', 'Home'], ['political', '🏛️', 'Political'], ['social', '🤝', 'Service'], ['news', '🔔', 'Notices'], ['menu', '☰', 'More']].map(([k, i, l]) => `<a class="${cur === k ? 'on' : ''}" onclick="A.go('${k}')"><span>${i}</span>${l}${k === 'news' && n ? `<b class="n">${n}</b>` : ''}</a>`).join('');
}
function render(keep) {
  const [r0, a, b, c] = location.hash.slice(2).split('/'); const r = r0 || 'home'; S.after = null;
  if (!keep) { S.q = ''; S.cat = ''; S.cm = 0; }
  const fn = V[r] || V.nf; let html;
  try { html = fn(a, b, c); } catch (err) { console.error(err); html = empty('⚠️', 'Something went wrong', 'Please go back and try again.'); }
  const hd = `<header class="glass top"><img src="logo.jpg" alt=""><div><b>${NAME}</b><small>सेवा • सहयोग • समर्पण</small></div><span class="sp"></span><a class="sup hide-m" href="mailto:${MAIL}"><small>GET SUPPORT</small><b>${MAIL}</b></a><button class="tb dark sm hide-m" onclick="A.go('contact')">CONTACT US</button><button class="btn sm sec" onclick="A.go('search')" aria-label="Search">🔍</button></header>`;
  clearInterval(S.tm); if (r === 'home') S.tm = setInterval(() => A.slide(1), 6000); $('#app').innerHTML = hd + (html.includes('<!--TK-->') ? html.replace('<!--TK-->', ticker()) : ticker() + html) + `<footer class="glass pad foot">${follow()}<p class="meta" style="margin-top:8px">✉️ <a href="mailto:${MAIL}">${MAIL}</a></p></footer>`; shell(); if (!keep) scrollTo(0, 0); S.after && S.after();
}
window.S = S; window.render = render;
addEventListener('hashchange', () => render());
document.documentElement.style.fontSize = Store.get('ts', '16') + 'px';
load().catch(console.error).then(() => { try { render(); } catch (err) { console.error(err); } setTimeout(() => $('#splash').classList.add('off'), 400); });
