// Serves article HTML with Open Graph + Twitter tags in the initial source, then sends people to the app.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
exports.handler = async (event) => {
  const host = event.headers['x-forwarded-host'] || event.headers.host;
  const origin = `https://${host}`;
  const id = decodeURIComponent((event.path || '').split('/').filter(Boolean).pop() || '');
  let post = null;
  try {
    const r = await fetch(`${origin}/posts.json`);
    const list = await r.json();
    post = list.find(p => p.id === id && p.status !== 'draft');
  } catch (e) {}
  const site = 'BELDARI SAMAJ SEVA';
  const abs = u => (!u || /^data:|^blob:/.test(u)) ? `${origin}/logo.jpg` : /^https?:/.test(u) ? u : `${origin}/${u.replace(/^\//, '')}`;
  const title = post ? post.title : site;
  const desc = (post ? post.desc : 'सेवा • सहयोग • समर्पण').replace(/\s+/g, ' ').slice(0, 200);
  const img = abs(post && (post.og || (post.images || [])[0]));
  const url = `${origin}/p/${esc(id)}`;
  const html = `<!doctype html><html lang="ne"><head><meta charset="utf-8">
<title>${esc(title)} | ${site}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:site_name" content="${site}"><meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${esc(img)}">
<meta property="og:image:secure_url" content="${esc(img)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(img)}">
<meta http-equiv="refresh" content="0;url=${origin}/#/post/${esc(id)}"></head>
<body><a href="${origin}/#/post/${esc(id)}">${esc(title)}</a></body></html>`;
  return { statusCode: post ? 200 : 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }, body: html };
};
