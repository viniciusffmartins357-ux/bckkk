(() => {
"use strict";
const WA = "5521984804314";
const SOCIAL = { instagram: "https://www.instagram.com/bckbrazil", facebook: "https://www.facebook.com/bckbrazil", tiktok: "https://www.tiktok.com/@bckbrazil", youtube: "https://www.youtube.com/@bckbrazil" }; // troque pelos perfis reais
const CFG = {
  free: 0, bulk: [4, 10], pix: 5, sizes: ["P", "M", "G", "GG", "XG"],
  chart: [["P", 50, 68, 62, "88 a 94"], ["M", 53, 71, 64, "94 a 100"], ["G", 56, 74, 66, "100 a 106"], ["GG", 59, 77, 68, "106 a 112"], ["XG", 62, 80, 70, "112 a 120"]],
  frete: [[24.9, "SP RJ ES MG", 3, 6], [29.9, "PR SC RS", 4, 7], [34.9, "DF GO MT MS", 5, 8], [39.9, "BA SE AL PE PB RN CE PI MA", 6, 10], [49.9, "AC AM AP PA RO RR TO", 8, 14]]
};
const FR = {}; CFG.frete.forEach(([v, u, a, b]) => u.split(" ").forEach(x => (FR[x] = { v, a, b })));
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Fallback acessível: evita ícones de imagem quebrada quando fotos locais ainda não foram publicadas.
document.addEventListener("error", event => {
  const el = event.target;
  if (el && el.tagName === "IMG" && new URL(el.src, location.href).pathname.includes("/img/") && !el.dataset.fallback) {
    el.dataset.fallback = "1";
    el.src = "/imagem-indisponivel.svg";
    el.alt = el.alt ? el.alt + " — foto não disponível" : "Foto do produto não disponível";
    el.classList.add("img-fallback");
    const frame = el.closest(".cimg");
    if (frame) frame.classList.add("no-back");
  }
}, true);
const brl = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const rd = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };

function metaTrack(event, data = {}) {
  if (typeof window.fbq === "function") {
    window.fbq("track", event, data);
  }
}
const qs = new URLSearchParams(location.search);
let CAT = [];
const byId = id => CAT.find(p => p.id == id);
const img = (p, s = "f") => `/img/${p.img}${s}.jpg`;
const off = p => (p.old ? Math.round((1 - p.price / p.old) * 100) : 0);
const IC = {
  cart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
  truck: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  user: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  wa: '<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.5 14.2c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1-3-1.2-5-4.2-5.1-4.4-.1-.2-1.2-1.600-1.200-3s.8-2.100 1.100-2.400c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.500l.9 2.200c.1.200.1.400 0 .5l-.4.600c-.1.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.100 1 2.100 1.300 2.400 1.500.3.100.5.100.6-.1l.9-1.100c.2-.3.4-.2.7-.1l2.100 1c.3.100.5.200.5.300.1.200.1.800-.1 1.400z"/></svg>',
  instagram: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z"/><path d="M17.5 6.5h.01"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  tiktok: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  youtube: '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.400 1.400 49.600 49.600 0 0 1-16.200 0A2 2 0 0 1 2.500 17"/><path d="m10 15 5-3-5-3z"/>'
};
const soc = (n, u, l) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" aria-label="${l}"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg></a>`;

/* ---------- carrinho ---------- */
const Cart = {
  items: () => rd("bck-cart2", []),
  save(v) { wr("bck-cart2", v); badge(); drawer(); },
  add(id, s, q = 1) {
  const v = this.items();
  const k = v.find(i => i.id == id && i.s == s);

  k ? (k.q += q) : v.push({ id: +id, s, q });

  this.save(v);

  const p = byId(id);

  if (p && typeof window.fbq === "function") {
    window.fbq("track", "AddToCart", {
      content_ids: [String(id)],
      content_type: "product",
      content_name: p.name,
      value: Number((p.price * q).toFixed(2)),
      currency: "BRL"
    });
  }
},
  set(i, q) { const v = this.items(); q <= 0 ? v.splice(i, 1) : (v[i].q = Math.min(q, 99)); this.save(v); },
  clear() { this.save([]); },
  totals() {
    let sub = 0, pcs = 0; this.items().forEach(i => { const p = byId(i.id); if (p) { sub += p.price * i.q; pcs += i.q; } });
    const bulk = pcs >= CFG.bulk[0] ? sub * CFG.bulk[1] / 100 : 0; return { sub, pcs, bulk, net: sub - bulk };
  }
};
const badge = () => { const n = Cart.items().reduce((a, i) => a + i.q, 0); $$(".cnt").forEach(e => { e.textContent = n; e.style.display = n ? "grid" : "none"; }); };
function toast(t) { const e = $(".toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("on"), 2200); }

/* ---------- estrutura comum ---------- */
const NAV = [["Todas", "/loja"], ["Agro", "/loja?cat=Agro"], ["Pesca", "/loja?cat=Pesca"], ["Católica", "/loja?cat=Católica"], ["Ofertas", "/loja?oferta=1"], ["Rastreio", "/rastreio"]];
function chrome() {
  const topMsg = "Frete grátis para todo o Brasil • 5% OFF no PIX";
  $("#hd").innerHTML = `<div class="top" id="tp">${topMsg}</div><header class="hd"><div class="row"><a class="logo" href="/"><img src="/img/logo.jpg" alt="BCK BRAZIL" width="48" height="48">BCK <b>BRAZIL</b></a>
  
  <div class="acts">${document.body.dataset.page === "checkout" ? '<span class="secb">🔒 Compra segura</span>' : `<a class="ib trk" href="/rastreio" aria-label="Rastrear pedido">${IC.truck}<span>Rastreio</span></a>`}<button class="ib" id="oc" aria-label="Carrinho">${IC.cart}<span>Carrinho</span><i class="cnt" style="display:none">0</i></button></div></div>
  <nav class="nav" aria-label="Categorias"><ul>${NAV.map(([n, h]) => `<li><a href="${h}" class="${location.pathname.replace(/\.html$/, "") + location.search === h || (h === "/rastreio" && location.pathname.startsWith("/rastreio")) ? "on" : ""}">${n}</a></li>`).join("")}</ul></nav></header>`;
    const pay = ["PIX", "Visa", "Mastercard", "Elo", "Hipercard", "Amex"].map(p => `<span>${p}</span>`).join("");
  $("#ft").innerHTML = `<footer class="ft"><div class="w ft2"><a class="logo" href="/" style="color:#fff"><img src="/img/logo.jpg" alt="" width="48" height="48">BCK <b>BRAZIL</b></a><div class="pay">${pay}</div><a class="btn btn-g" href="${wa("Olá, BCK BRAZIL!")}" target="_blank" rel="noopener">Dúvidas? Fale no WhatsApp</a></div>
  <nav class="w fl2" aria-label="Ajuda"><a href="/rastreio">Rastrear pedido</a><a href="/trocas-e-devolucoes">Trocas e devoluções</a><a href="/privacidade">Privacidade</a><a href="/termos">Termos de uso</a></nav>
  <div class="bar">BCK Pagamentos LTDA • CNPJ 63.231.170/0001-05 • 🔒 Compra segura<br>© ${new Date().getFullYear()} BCK BRAZIL. Todos os direitos reservados.</div></footer>
  <div class="ov" id="ov"></div><aside class="dr" id="dr" aria-label="Carrinho"></aside><div class="md" id="md" role="dialog" aria-modal="true"></div><div class="toast" role="status"></div>`;
  $("#oc").onclick = () => openDr(true); $("#ov").onclick = () => { openDr(false); modal(false); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") { openDr(false); modal(false); } });
  document.addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (b) { e.preventDefault(); ({ sizes, ship: shipModal }[b.dataset.act] || (() => { }))(); } });
  badge(); drawer(); waBtn();
}
/* ---------- botão discreto de WhatsApp ---------- */
function waBtn() {
  const ft = $("#ft"); if (!ft || document.body.dataset.page === "checkout") return;
  ft.insertAdjacentHTML("beforeend", `<a class="wab" href="${wa("Olá, BCK BRAZIL! Tenho uma dúvida.")}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${IC.wa}</a>`);
}
function openDr(on) { $("#dr").classList.toggle("on", on); $("#ov").classList.toggle("on", on || $("#md").classList.contains("on")); document.documentElement.style.overflow = on ? "hidden" : ""; }
function modal(on, html) { const m = $("#md"); if (html != null) m.innerHTML = `<button class="x" aria-label="Fechar" onclick="document.getElementById('ov').click()">×</button>` + html; m.classList.toggle("on", !!on); $("#ov").classList.toggle("on", !!on || $("#dr").classList.contains("on")); }
function drawer() {
  const d = $("#dr"); if (!d) return; const its = Cart.items(), t = Cart.totals(), left = Math.max(0, CFG.free - t.net);
  d.innerHTML = `<header><h3>Meu carrinho</h3><button class="x" id="cx" aria-label="Fechar">×</button></header><div class="bd">${its.length ? `<div class="prog">✅ <b>Frete grátis</b> garantido</div>` + its.map((i, n) => { const p = byId(i.id); if (!p) return ""; return `<div class="li"><img src="${img(p)}" alt=""><div><b>${esc(p.name)}</b><small>Tamanho ${esc(i.s)}</small><div class="q"><button data-m="${n}" aria-label="Menos">−</button><span>${i.q}</span><button data-p="${n}" aria-label="Mais">+</button></div></div><div style="text-align:right"><b>${brl(p.price * i.q)}</b><br><button class="rm" data-r="${n}">remover</button></div></div>`; }).join("") : `<div class="empty"><p style="font-size:42px;margin:0">🛒</p>Seu carrinho está vazio.<br><br><a class="btn" href="/loja">Ver produtos</a></div>`}</div>${its.length ? `<footer><div class="tr"><span>Subtotal</span><span>${brl(t.sub)}</span></div>${t.bulk ? `<div class="tr g"><span>Desconto 4+ peças (${CFG.bulk[1]}%)</span><span>− ${brl(t.bulk)}</span></div>` : t.pcs ? `<div class="tr" style="color:var(--mut);font-size:13px"><span>Leve ${CFG.bulk[0]} peças e ganhe ${CFG.bulk[1]}% OFF</span></div>` : ""}<div class="tr t"><span>Total</span><span>${brl(t.net)}</span></div><small style="color:var(--green);font-weight:700">${brl(t.net * (1 - CFG.pix / 100))} no PIX (${CFG.pix}% OFF)</small><a class="btn btn-w" href="/checkout">Finalizar compra</a><button class="btn btn-o btn-w" id="cc">Continuar comprando</button></footer>` : ""}`;
  $("#cx").onclick = () => openDr(false); if ($("#cc")) $("#cc").onclick = () => openDr(false);
  $$("[data-m]", d).forEach(b => b.onclick = () => Cart.set(+b.dataset.m, Cart.items()[+b.dataset.m].q - 1));
  $$("[data-p]", d).forEach(b => b.onclick = () => Cart.set(+b.dataset.p, Cart.items()[+b.dataset.p].q + 1));
  $$("[data-r]", d).forEach(b => b.onclick = () => Cart.set(+b.dataset.r, 0));
}
function sizes() {
  modal(true, `<h3>Tabela de medidas</h3><p style="color:var(--mut);margin:0 0 12px">Medidas da peça em cm, esticada sobre uma superfície plana. Tolerância de ±2 cm.</p><table class="tbl"><thead><tr><th>Tam.</th><th>Largura</th><th>Comprim.</th><th>Manga</th><th>Seu peito</th></tr></thead><tbody>${CFG.chart.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join("")}</tbody></table><p style="color:var(--mut);font-size:14px">Meça o contorno do peito na parte mais larga. Entre dois tamanhos, escolha o maior para um caimento solto.</p><a class="btn btn-g btn-w" target="_blank" rel="noopener" href="${wa("Olá, BCK BRAZIL! Preciso de ajuda para escolher o tamanho.")}">Tirar dúvida no WhatsApp</a>`);
}
function shipHTML(r, free) { return `<b>${esc(r.cid ? r.cid + "/" : "")}${esc(r.uf)}</b> • CEP ${esc(r.cep)}<br>${free ? '<span class="ok">Frete GRÁTIS</span>' : "Frete: <b>" + brl(r.v) + "</b>"} • enviamos com código de rastreio<br><small style="color:var(--mut)">Estimativa. O valor final é confirmado no checkout.</small>`; }
async function cepLookup(cep) {
  const d = cep.replace(/\D/g, ""); if (d.length !== 8) throw new Error("Digite os 8 números do CEP.");
  const r = await fetch(`https://viacep.com.br/ws/${d}/json/`).then(x => x.json()).catch(() => null);
  if (!r) throw new Error("Não foi possível consultar o CEP agora."); if (r.erro) throw new Error("CEP não encontrado.");
  return { ...r, cep: d.replace(/(\d{5})(\d{3})/, "$1-$2") };
}
function shipWidget(el, extra = 0) {
  el.innerHTML = `<div class="cep"><input inputmode="numeric" maxlength="9" placeholder="Digite seu CEP" aria-label="CEP"><button class="btn btn-d" type="button">Calcular</button></div><div class="res" hidden></div>`;
  const i = $("input", el), o = $(".res", el); i.value = rd("bck-cep", "");
  i.oninput = () => { const v = i.value.replace(/\D/g, "").slice(0, 8); i.value = v.length > 5 ? v.slice(0, 5) + "-" + v.slice(5) : v; };
  const go = async () => { o.hidden = false; o.textContent = "Calculando…"; try { const r = await cepLookup(i.value), f = FR[r.uf]; wr("bck-cep", r.cep); o.innerHTML = shipHTML({ cid: r.localidade, uf: r.uf, cep: r.cep, ...f }, Math.max(Cart.totals().net, extra) >= CFG.free); } catch (e) { o.innerHTML = `<span class="err">${esc(e.message)}</span>`; } };
  $("button", el).onclick = go; i.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); go(); } };
}
function shipModal() { modal(true, `<h3>Calcular frete</h3><p style="color:var(--mut)">Frete grátis em compras a partir de ${brl(CFG.free)}.</p><div id="sw"></div>`); shipWidget($("#sw")); }

/* ---------- componentes ---------- */
const card = p => `<article class="card"><a class="cimg" href="/produto?id=${p.id}" aria-label="${esc(p.name)}">${off(p) ? `<span class="b b-off">-${off(p)}%</span>` : ""}${p.tag === "Mais vendida" ? `<span class="b b-tag">Mais vendida</span>` : ""}<img loading="lazy" src="${img(p)}" alt="${esc(p.name)}"><img class="bk" loading="lazy" src="${img(p, "b")}" alt=""></a><div class="cb"><small>${esc(p.cat)} • UV 50+</small><h3><a href="/produto?id=${p.id}">${esc(p.name)}</a></h3><div class="pr">${p.old ? `<s>${brl(p.old)}</s>` : ""}<b>${brl(p.price)}</b></div><p class="pix">${brl(p.price * (1 - CFG.pix / 100))} no PIX</p><a class="btn btn-d" href="/produto?id=${p.id}">Comprar</a></div></article>`;
const head = (t, l) => `<div class="sh"><h2>${t}</h2>${l ? `<a href="${l[1]}">${l[0]}</a>` : ""}</div>`;

const review = (x, i) => { const m = Array.isArray(x.midia) ? x.midia : [], n = Math.max(1, Math.min(5, x.estrelas || 5)); return `<article class="rvi"><div class="rvh">${x.foto ? `<img class="rva" src="${esc(x.foto)}" alt="" loading="lazy">` : `<span class="rva rvz">${esc((x.nome || "?")[0])}</span>`}<div><b class="rvn">${esc(x.nome)}</b><div class="stars rvs" aria-label="${n} de 5 estrelas">${"★".repeat(n)}<span>${"★".repeat(5 - n)}</span></div>${x.data || x.variacao ? `<small class="rvd">${esc(x.data || "")}${x.data && x.variacao ? " | " : ""}${x.variacao ? "Variação: " + esc(x.variacao) : ""}</small>` : ""}</div></div><p>${esc(x.texto)}</p>${x.cidade ? `<small class="rvd">${esc(x.cidade)}</small>` : ""}${m.length ? `<div class="rvt">${m.map((o, k) => `<button type="button" data-k="${k}" aria-label="${o.tipo === "video" ? "Ver vídeo" : "Ver foto " + k}"><img src="${esc(o.mini || o.capa || o.src)}" alt="" loading="lazy">${o.tipo === "video" ? `<span class="rvdur"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M4 6h11a1 1 0 0 1 1 1v3l4-3v10l-4-3v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/></svg>${esc(o.duracao || "")}</span>` : ""}</button>`).join("")}</div><div class="rvv" hidden></div>` : ""}<button type="button" class="rvu">👍 Útil?</button></article>`; };
function reviewMedia(root, list) {
  $$(".rvi", root).forEach((el, i) => {
    const x = list[i], m = (x && x.midia) || [], box = $(".rvv", el), th = $$(".rvt button", el); let cur = -1;
    const show = (k, auto = true) => { cur = (k + m.length) % m.length; const o = m[cur]; box.classList.toggle("rvland", o.formato === "paisagem"); th.forEach((b, j) => b.classList.toggle("on", j === cur)); box.hidden = false; box.innerHTML = `${o.tipo === "video" ? `<video src="${esc(o.src)}" poster="${esc(o.capa || "")}" controls playsinline preload="metadata"${auto ? " autoplay" : ""}></video>` : `<img src="${esc(o.src)}" alt="Foto enviada por ${esc(x.nome)}">`}${m.length > 1 ? `<button type="button" class="rvp" aria-label="Anterior">‹</button><button type="button" class="rvx" aria-label="Próxima">›</button>` : ""}`; $(".rvp", box) && ($(".rvp", box).onclick = () => show(cur - 1)); $(".rvx", box) && ($(".rvx", box).onclick = () => show(cur + 1)); };
    th.forEach((b, j) => b.onclick = () => { if (j === cur && !box.hidden) { box.hidden = true; box.innerHTML = ""; b.classList.remove("on"); cur = -1; } else show(j); });
    const u = $(".rvu", el); if (u) u.onclick = () => { u.classList.toggle("on"); u.textContent = u.classList.contains("on") ? "👍 Útil (1)" : "👍 Útil?"; };
    if (m.length) show(0, false);
  });
}

/* ---------- páginas ---------- */
const chips = (sel, href) => `<div class="chips">${[["", "Todas"], ["Agro", "Agro"], ["Pesca", "Pesca"], ["Católica", "Católica"]].map(([c, t]) => `<a href="${href(c)}" data-c="${c}" class="${sel === c ? "on" : ""}">${t}</a>`).join("")}</div>`;
const COLS = [["Agro", "Coleção Agro", "Para quem vive o campo de sol a sol.", "af"], ["Pesca", "Coleção Pesca", "Leve, seca rápido e protege na beira d'água.", "tf"], ["Católica", "Coleção Católica", "Fé estampada com proteção UV 50+.", "jf"]];
function home() {
  const all = CAT.slice().sort((a, b) => (b.tag === "Mais vendida") - (a.tag === "Mais vendida") || off(b) - off(a));
  const maxOff = Math.max(0, ...CAT.map(off));
  $("#app").innerHTML = `<section class="hero"><div class="slide on"><div class="w"><div class="hero-copy"><span class="kick">BCK BRAZIL • PROTEÇÃO UV 50+</span><h2>Seu estilo acompanha <em>seu ritmo.</em></h2><p>Camisetas de manga longa para quem vive o Agro, curte a Pesca e carrega sua fé. Encontre seu modelo favorito.</p><div class="hero-actions"><a class="btn" href="/loja">Explorar coleção</a><a class="hero-link" href="/personalizadas">Criar camiseta personalizada <span>→</span></a></div><div class="hero-proof"><span>ESTAMPAS EXCLUSIVAS</span><i></i><span>CONFORTO NO DIA A DIA</span></div></div><div class="pics"><figure><img src="/img/af.jpg" alt="Camiseta da coleção Agro BCK BRAZIL"><figcaption>COLEÇÃO AGRO</figcaption></figure><figure><img src="/img/jf.jpg" alt="Camiseta da coleção Católica BCK BRAZIL"><figcaption>COLEÇÃO CATÓLICA</figcaption></figure></div></div></div></section>
  <section class="ben"><div class="w"><div><b>Frete grátis</b><small>para todo o Brasil</small></div><div><b>${CFG.pix}% OFF no PIX</b><small>aprovado na hora</small></div><div><b>Leve 4, ganhe ${CFG.bulk[1]}%</b><small>desconto automático</small></div><div><b>Troca grátis</b><small>em até 30 dias</small></div></div></section>
  <section class="trust-strip" aria-label="Informações da loja"><div class="w"><a href="/rastreio"><span class="trust-icon">↗</span><span><b>Acompanhe seu pedido</b><small>Consulte o rastreamento</small></span></a><a href="/trocas-e-devolucoes"><span class="trust-icon">↺</span><span><b>Trocas e devoluções</b><small>Veja nossa política</small></span></a><a href="https://wa.me/5521984804314?text=Ol%C3%A1%2C%20BCK%20BRAZIL!%20Tenho%20uma%20d%C3%BAvida." target="_blank" rel="noopener noreferrer"><span class="trust-icon">◌</span><span><b>Atendimento direto</b><small>Fale com a equipe</small></span></a></div></section>
  <section class="sec" id="produtos"><div class="w"><div class="cats3">${COLS.map(([c, t, d, im]) => `<a class="ct" href="#c-${c}"><img src="/img/${im}.jpg" alt="" loading="lazy"><span><b>${t.replace("Coleção ", "")}</b><small>${CAT.filter(p => p.cat === c).length} modelos</small></span></a>`).join("")}</div></div></section>
  ${(() => { const best = all.filter(p => p.tag === "Mais vendida" || off(p) >= 50).slice(0, 4); return best.length ? `<section class="sec col"><div class="w">${head("Mais vendidas", ["Ver todas", "/loja"])}<div class="grid">${best.map(card).join("")}</div></div></section>` : ""; })()}
  ${COLS.map(([c, t, d], i) => { const ps = CAT.filter(p => p.cat === c); return ps.length ? `<section class="sec col${i % 2 ? "" : " alt"}" id="c-${c}"><div class="w"><div class="sh"><div><h2>${t}</h2><p class="shd">${d}</p></div><a href="/loja?cat=${encodeURIComponent(c)}">Ver coleção (${ps.length})</a></div><div class="grid row4">${ps.slice(0, 4).map(card).join("")}</div></div></section>` : ""; }).join("")}
  <section class="sec pzs" id="personalizada"><div class="w"><div class="sh"><div><h2>Camiseta personalizada</h2><p class="shd">Sua fazenda, empresa, família, time ou igreja numa camiseta exclusiva. A gente cria a arte com você pelo WhatsApp.</p></div></div>
  <div class="pzg">${[["p1","Turma e família","Nome, foto e escudo"],["p2","Empresa e comércio","Logo e frase da sua marca"],["p3","Igreja e templo","Camiseta e conjunto com calça"],["p4","Fazenda e agro","Gola com zíper e bandeira"]].map(([im,t,d])=>`<a class="pzc" href="${wa("Olá! Quero uma camiseta personalizada ("+t+"). Pode me ajudar a montar o modelo?")}" target="_blank" rel="noopener"><img src="/img/pz/${im}.jpg" alt="Camiseta personalizada ${t}" loading="lazy"><span><b>${t}</b><small>${d}</small></span></a>`).join("")}</div>
  <ul class="pzl"><li><b>1.</b> Fale com a gente no WhatsApp</li><li><b>2.</b> Mande seu logo, nome ou ideia</li><li><b>3.</b> Receba a arte pronta para aprovar</li></ul>
  <a class="btn pzb" href="${wa("Olá! Quero fazer uma camiseta personalizada. Pode me ajudar a montar o modelo?")}" target="_blank" rel="noopener">Quero a minha personalizada no WhatsApp</a></div></section>
  <div id="rvw"></div>`;
  fetch("/avaliacoes.json").then(r => r.json()).then(a => { a = (a || []).filter(x => x.autorizado === true).slice(0, 4); if (a.length) { $("#rvw").innerHTML = `<section class="sec"><div class="w">${head("Quem comprou, aprova")}<div class="rv">${a.map(review).join("")}</div></div></section>`; reviewMedia($("#rvw"), a); } }).catch(() => { });
}
function loja() {
  let cat = qs.get("cat") || "", q = (qs.get("q") || "").toLowerCase(), of = qs.get("oferta") === "1";
  let L = CAT.filter(p => (!cat || p.cat === cat) && (!of || p.old) && (!q || (p.name + " " + p.cat + " " + p.desc).toLowerCase().includes(q)));
  L.sort((a, b) => off(b) - off(a));
  $("#app").innerHTML = `<div class="w" style="padding-top:28px;padding-bottom:56px"><h1 class="cond" style="font-size:clamp(2.2rem,5vw,3.4rem);margin-bottom:16px">${of ? "Ofertas" : esc(cat || "Todas as camisetas")}</h1>${chips(of ? "x" : cat, c => "/loja" + (c ? "?cat=" + encodeURIComponent(c) : ""))}${L.length ? `<div class="grid">${L.map(card).join("")}</div>` : `<div class="empty"><p style="font-size:42px;margin:0">🔎</p>Nenhum produto encontrado.<br><br><a class="btn" href="/loja">Ver todos</a></div>`}</div>`;
  document.title = (of ? "Ofertas" : cat || "Loja") + " | BCK BRAZIL";
}
function produto() {
  const p = byId(qs.get("id")); if (!p) { $("#app").innerHTML = `<div class="w empty"><h2>Produto não encontrado</h2><br><a class="btn" href="/loja">Voltar à loja</a></div>`; return; }
  document.title = `${p.name} | BCK BRAZIL`; let size = "", qty = 1, cur = "f";
metaTrack("ViewContent", {
  content_ids: [String(p.id)],
  content_type: "product",
  content_name: p.name,
  value: Number(p.price),
  currency: "BRL"
});
  const rel = CAT.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  $("#app").innerHTML = `<div class="w" style="padding-top:24px"><div class="pd"><div class="gal"><div class="th">${["f", "b"].map(s => `<button data-i="${s}" class="${s === "f" ? "on" : ""}" aria-label="Foto ${s === "f" ? "frente" : "costas"}"><img src="${img(p, s)}" alt=""></button>`).join("")}</div><div class="mn" id="mn"><img id="mi" src="${img(p)}" alt="${esc(p.name)}"></div></div>
  <div><small class="cond" style="color:var(--mut);letter-spacing:.14em">${esc(p.cat)} • UV 50+</small><h1>${esc(p.name)}</h1><div class="pr" style="margin-top:10px">${p.old ? `<s>${brl(p.old)}</s>` : ""}<b>${brl(p.price)}</b>${off(p) ? `<span class="off">-${off(p)}%</span>` : ""}</div>
  <div class="pbox"><span style="color:var(--green);font-weight:800">${brl(p.price * (1 - CFG.pix / 100))} no PIX <small>(${CFG.pix}% OFF)</small></span><span>ou em até <b>12x</b> no cartão de crédito</span><span class="ok">🚚 Frete grátis para todo o Brasil</span></div>
  <p style="color:#444">${esc(p.desc)}</p><div><b>Tamanho</b> <button class="lk" data-act="sizes" style="float:right">📏 Tabela de medidas</button><div class="sz" role="radiogroup">${CFG.sizes.map(s => `<button data-s="${s}" role="radio" aria-checked="false">${s}</button>`).join("")}</div><div class="err" id="se"></div></div>
  <button class="btn btn-w" id="bn" style="height:56px;font-size:18px;margin-top:14px">Comprar agora</button><div class="buy"><div class="q"><button id="qm" aria-label="Menos">−</button><span id="qn">1</span><button id="qp" aria-label="Mais">+</button></div><button class="btn btn-o" id="ad" style="flex:1">Adicionar ao carrinho</button></div><p class="kitnote">Leve 4 peças (pode misturar) e ganhe ${CFG.bulk[1]}% OFF automático.</p>
  <ul class="dl"><li>Proteção UV 50+ contra raios UVA e UVB</li><li>Tecido dry-fit leve, que seca rápido</li><li>Frete grátis para todo o Brasil, com rastreio</li><li>Troca grátis do tamanho em até 30 dias</li></ul></div></div>
  ${rel.length ? `<section class="sec" style="padding-top:20px">${head("Monte seu kit e ganhe " + CFG.bulk[1] + "% OFF")}<div class="grid">${rel.map(card).join("")}</div></section>` : ""}</div>`;
    $$("[data-i]").forEach(b => b.onclick = () => { cur = b.dataset.i; $("#mi").src = img(p, cur); $$("[data-i]").forEach(x => x.classList.toggle("on", x === b)); });
  $$("[data-s]").forEach(b => b.onclick = () => { size = b.dataset.s; $("#se").textContent = ""; $$("[data-s]").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); }); });
  $("#qm").onclick = () => { qty = Math.max(1, qty - 1); $("#qn").textContent = qty; }; $("#qp").onclick = () => { qty = Math.min(20, qty + 1); $("#qn").textContent = qty; };
  const need = () => { if (!size) { $("#se").textContent = "Escolha um tamanho."; $(".sz").scrollIntoView({ block: "center", behavior: "smooth" }); return false; } return true; };
  $("#ad").onclick = () => { if (need()) { Cart.add(p.id, size, qty); openDr(true); } };
  $("#bn").onclick = () => { if (need()) { Cart.add(p.id, size, qty); location.href = "/checkout"; } };
  const mn = $("#mn"); mn.onmousemove = e => { const r = mn.getBoundingClientRect(), i = $("#mi"); i.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; i.style.transform = "scale(1.8)"; }; mn.onmouseleave = () => $("#mi").style.transform = "";
}
function pagina() { const m = $("#doc"); if (!m) return; document.title = ($("h1", m)?.textContent || "BCK BRAZIL") + " | BCK BRAZIL"; $$("[data-bck-act]", m).forEach(a => { const k = a.dataset.bckAct; if (k === "acc") a.href = "/rastreio"; else a.dataset.act = k; }); }
function personalizadas() {
  $("#app").innerHTML = `<div class="doc"><h1>Camisetas <span style="color:var(--gold2)">personalizadas</span></h1><p class="bck-lead">Sua marca, sua equipe, seu estilo. Pedidos a partir de 10 unidades.</p><form class="f" id="pf" style="margin-top:22px"><fieldset><legend>Peça seu orçamento</legend><label>Nome ou empresa<input name="n" required></label><div class="two"><label>Nicho<select name="c"><option>Agro</option><option>Pesca</option><option>Católica</option><option>Empresa</option><option>Outro</option></select></label><label>Quantidade<input name="q" type="number" min="1" value="10" required></label></div><label>Conte sua ideia<textarea name="o" rows="4" placeholder="Cores, logo, modelo..." style="width:100%;border:1.5px solid #d8d8d2;border-radius:10px;padding:12px;font:inherit"></textarea></label><button class="btn btn-g btn-w" style="height:52px">Solicitar orçamento no WhatsApp</button></fieldset></form><ul><li>Sublimação total em alta definição</li><li>Descontos progressivos por quantidade</li><li>Atendimento direto pelo WhatsApp</li></ul></div>`;
  $("#pf").onsubmit = e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); window.open(wa(`Olá, BCK BRAZIL! Quero um orçamento de camisetas personalizadas UV 50+:\n\n• Nome/Empresa: ${f.n}\n• Nicho: ${f.c}\n• Quantidade: ${f.q}\n• Detalhes: ${f.o || "-"}`), "_blank"); };
}
const FN = "/.netlify/functions/";
const post = (u, b) => fetch(FN + u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => ({ ok: r.ok, d: await r.json().catch(() => ({})) })).catch(() => ({ ok: false, d: { error: "Sem conexão. Confira sua internet e tente de novo." } }));
const cpfOk = c => { if (!/^\d{11}$/.test(c) || /^(\d)\1+$/.test(c)) return false; for (const n of [9, 10]) { let s = 0; for (let i = 0; i < n; i++) s += c[i] * (n + 1 - i); if (((s * 10) % 11) % 10 != c[n]) return false; } return true; };
function checkout() {
  const its = Cart.items().filter(i => byId(i.id)); document.title = "Finalizar compra | BCK BRAZIL";
  if (!its.length) { $("#app").innerHTML = `<div class="w empty" style="padding:80px 0"><p style="font-size:48px;margin:0">🛒</p><h2>Seu carrinho está vazio</h2><br><a class="btn" href="/#produtos">Escolher camisetas</a></div>`; return; } const checkoutValue = its.reduce((sum, i) => {
  const p = byId(i.id);
  return sum + (p ? p.price * i.q : 0);
}, 0);

metaTrack("InitiateCheckout", {
  content_ids: its.map(i => String(i.id)),
  content_type: "product",
  value: Number(checkoutValue.toFixed(2)),
  currency: "BRL",
  num_items: its.reduce((sum, i) => sum + i.q, 0)
});
  const body = its.map(i => ({ id: i.id, s: i.s, q: i.q })); let pay = "pix", state = "", coupon = "";
  // Estimativa local com as mesmas regras do servidor (o valor final sempre vem do servidor).
  const local = () => { let sub = 0, pcs = 0; its.forEach(i => { sub += byId(i.id).price * i.q; pcs += i.q; }); const bulk = pcs >= CFG.bulk[0] ? sub * CFG.bulk[1] / 100 : 0, c = sub - bulk, pix = c * CFG.pix / 100; return { sub, coupon: 0, bulk, pix, ship: 0, total: Math.round((c - pix) * 100) / 100 }; };
  let tot = local();
  const pcs = its.reduce((a, i) => a + i.q, 0);
  $("#app").innerHTML = `<div class="ck"><form class="f" id="cf" novalidate>
  <fieldset><legend>1. Seus dados</legend><label>Nome completo<input name="name" autocomplete="name" required></label><div class="two"><label>WhatsApp com DDD<input name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="(00) 00000-0000" maxlength="15" required></label><label>E-mail<input name="email" type="email" inputmode="email" autocomplete="email" placeholder="seuemail@exemplo.com" required></label></div><label>CPF<input name="document" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" required><small class="hint">Necessário para gerar o PIX no seu nome.</small></label></fieldset>
  <fieldset><legend>2. Entrega</legend><div class="two"><label>CEP<input name="zipcode" inputmode="numeric" maxlength="9" autocomplete="postal-code" placeholder="00000-000" required></label><a class="nocep" href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener">Não sei meu CEP</a></div><p class="hint" id="cepmsg">Digite o CEP que a gente preenche o endereço.</p>
  <div id="addr" class="addr" hidden><label>Rua<input name="street" autocomplete="address-line1" required></label><div class="two"><label>Número<input name="number" inputmode="numeric" required></label><label>Complemento<input name="complement" autocomplete="address-line2" placeholder="Opcional: apto, bloco"></label></div><label>Bairro<input name="neighborhood" required></label><div class="three"><label>Cidade<input name="city" autocomplete="address-level2" required></label><label>UF<input name="state" maxlength="2" autocomplete="address-level1" required style="text-transform:uppercase"></label></div></div>
  <div class="shipok"><b>🚚 FRETE GRÁTIS para todo o Brasil</b><span>📦 Código de rastreio liberado na hora do pagamento</span><span>🔄 Troca grátis do tamanho em 30 dias</span></div></fieldset>
  <fieldset><legend>3. Pagamento</legend><label class="pm on" data-pm="pix"><input type="radio" name="pm" checked><span><b>PIX <em class="tagoff">${CFG.pix}% OFF</em></b><small>Aprovação na hora. Pague pelo app do seu banco.</small></span></label><label class="pm" data-pm="card"><input type="radio" name="pm"><span><b>Cartão de crédito em até 12x</b><small>Toque aqui e finalize com a gente no WhatsApp, com link de pagamento seguro.</small></span></label></fieldset>
  <div class="err" id="ce" role="alert"></div><button class="btn btn-w btn-pay" id="go"></button>
  <ul class="trust"><li>🔒 Pagamento seguro</li><li>🔄 Troca grátis em 30 dias</li><li>💬 Suporte no WhatsApp</li></ul></form>
  <aside class="sm"><div class="smh"><h3>Seu pedido</h3><span>${pcs} ${pcs === 1 ? "peça" : "peças"}</span></div><div>${its.map(i => { const p = byId(i.id); return `<div class="li" style="grid-template-columns:56px 1fr auto"><img src="${img(p)}" alt="" style="width:56px;height:70px"><div><b>${esc(p.name)}</b><small>Tam. ${esc(i.s)} • ${i.q}x</small></div><b>${brl(p.price * i.q)}</b></div>`; }).join("")}</div>${pcs < CFG.bulk[0] ? `<p class="kitup">Faltam ${CFG.bulk[0] - pcs} ${CFG.bulk[0] - pcs === 1 ? "peça" : "peças"} para ganhar ${CFG.bulk[1]}% OFF. <a href="/#produtos">Adicionar mais</a></p>` : ""}<div id="tt"></div><details class="cpd"><summary>Tem cupom?</summary><div class="cpn"><input id="cp" placeholder="Cupom de desconto"><button class="btn btn-d" id="ca" type="button">Aplicar</button></div></details></aside></div>`;
  const F = $("#cf"), E = F.elements, g = n => E[n].value.trim();
  const total = () => pay === "pix" ? tot.total : Math.round((tot.sub - (tot.coupon || 0) - (tot.bulk || 0)) * 100) / 100;
  const label = () => { $("#go").textContent = pay === "pix" ? `Pagar ${brl(total())} com PIX` : "Finalizar no cartão pelo WhatsApp"; };
  const render = () => { const t = tot; $("#tt").innerHTML = `<div class="tr"><span>Subtotal</span><span>${brl(t.sub)}</span></div>${t.coupon ? `<div class="tr g"><span>Cupom</span><span>− ${brl(t.coupon)}</span></div>` : ""}${t.bulk ? `<div class="tr g"><span>Desconto ${CFG.bulk[0]}+ peças</span><span>− ${brl(t.bulk)}</span></div>` : ""}${pay === "pix" ? `<div class="tr g"><span>Desconto PIX (${CFG.pix}%)</span><span>− ${brl(t.pix)}</span></div>` : ""}<div class="tr"><span>Frete</span><span class="ok">Grátis</span></div><div class="tr t"><span>Total</span><span>${brl(total())}</span></div>${pay === "card" ? `<small style="color:var(--mut)">ou ${brl(tot.total)} no PIX</small>` : ""}`; label(); };
  render();
  let pv; const preview = () => { clearTimeout(pv); pv = setTimeout(async () => { const r = await post("create-pix", { preview: true, items: body, coupon, state }).catch(() => ({})); if (r.ok) { tot = r.d; render(); } }, 150); }; preview();
  $("#ca").onclick = async () => { coupon = $("#cp").value.trim().toUpperCase(); const r = await post("create-pix", { preview: true, items: body, coupon, state }).catch(() => ({})); if (r.ok && r.d.coupon > 0) { tot = r.d; render(); toast("Cupom aplicado!"); } else { coupon = ""; toast("Cupom inválido."); } };
  const showAddr = () => { $("#addr").hidden = false; $("#cepmsg").hidden = true; };
  E.zipcode.oninput = async e => { let v = e.target.value.replace(/\D/g, "").slice(0, 8); e.target.value = v.length > 5 ? v.slice(0, 5) + "-" + v.slice(5) : v; if (v.length === 8) { try { const r = await cepLookup(v); E.street.value = r.logradouro || E.street.value; E.neighborhood.value = r.bairro || E.neighborhood.value; E.city.value = r.localidade; E.state.value = r.uf; state = r.uf; ["street", "neighborhood", "city", "state"].forEach(n => E[n].value && E[n].classList.remove("bad")); preview(); showAddr(); (E.street.value ? E.number : E.street).focus(); } catch { showAddr(); $("#cepmsg").hidden = false; $("#cepmsg").textContent = "Não achamos esse CEP. Confira ou preencha o endereço abaixo."; } } };
  E.state.oninput = e => { state = e.target.value.toUpperCase(); preview(); };
  E.document.oninput = e => { const v = e.target.value.replace(/\D/g, "").slice(0, 11); e.target.value = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4").replace(/(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3").replace(/^(\d{3})(\d{1,3})$/, "$1.$2"); };
  E.phone.oninput = e => { const v = e.target.value.replace(/\D/g, "").slice(0, 11); e.target.value = v.length > 10 ? `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}` : v.length > 6 ? `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}` : v.length > 2 ? `(${v.slice(0, 2)}) ${v.slice(2)}` : v; };
  F.addEventListener("input", e => { if (e.target.classList) e.target.classList.remove("bad"); if (!$(".bad", F)) $("#ce").textContent = ""; });
  const cardWa = () => { const lines = its.map(i => `• ${i.q}x ${byId(i.id).name} (${i.s})`).join("\n"); window.open(wa(`Olá, BCK BRAZIL! Quero finalizar no cartão de crédito:\n\n${lines}\n\nTotal: ${brl(total())}${g("name") ? "\nNome: " + g("name") : ""}${g("zipcode") ? "\nCEP: " + g("zipcode") : ""}`), "_blank"); };
  // O clique no texto do cartão também gera um clique no botão de rádio; só tratamos esse último para abrir o WhatsApp uma vez só.
  $$("[data-pm]").forEach(l => l.onclick = e => { if (e.target.tagName !== "INPUT") return; pay = l.dataset.pm; $$("[data-pm]").forEach(x => x.classList.toggle("on", x === l)); render(); if (pay === "card") cardWa(); });
  const rules = [
    ["name", v => v.length >= 3 && v.includes(" "), "Informe seu nome completo."],
    ["phone", v => /^\d{10,11}$/.test(v.replace(/\D/g, "")), "Confira o WhatsApp com DDD."],
    ["email", v => /^\S+@\S+\.\S+$/.test(v), "Confira o e-mail."],
    ["document", v => cpfOk(v.replace(/\D/g, "")), "Confira o CPF."],
    ["zipcode", v => v.replace(/\D/g, "").length === 8, "Informe o CEP."],
    ["street", v => !!v, "Informe a rua."], ["number", v => !!v, "Informe o número."], ["neighborhood", v => !!v, "Informe o bairro."],
    ["city", v => !!v, "Informe a cidade."], ["state", v => /^[A-Za-z]{2}$/.test(v), "Informe a UF."]
  ];
  F.onsubmit = async e => {
    e.preventDefault(); const er = $("#ce"); er.textContent = ""; $$(".bad", F).forEach(x => x.classList.remove("bad"));
    if (pay === "card") { cardWa(); return; }
    const bad = rules.filter(([n, ok]) => !ok(g(n)));
    if (bad.length) { if (bad.some(([n]) => ["street", "number", "neighborhood", "city", "state"].includes(n))) showAddr(); bad.forEach(([n]) => E[n].classList.add("bad")); er.textContent = bad[0][2]; E[bad[0][0]].focus(); return; }
    const b = $("#go"); b.disabled = true; b.textContent = "Gerando seu PIX…";
    const r = await post("create-pix", { items: body, coupon, publicShareConsent: false, customer: { name: g("name"), email: g("email"), phone: g("phone"), document: g("document") }, address: { street: g("street"), number: g("number"), complement: g("complement"), neighborhood: g("neighborhood"), city: g("city"), state: g("state").toUpperCase(), zipcode: g("zipcode") } }).catch(() => ({ ok: false, d: {} }));
    b.disabled = false; label();
    if (!r.ok) { er.innerHTML = `${esc(r.d.error || "Não foi possível gerar o PIX.")} <a href="${wa("Olá, BCK BRAZIL! Tive um problema para gerar o PIX no site.")}" target="_blank" rel="noopener">Fale com a gente no WhatsApp</a>.`; return; }
    pixModal(r.d);
  };
}
function loadQR(cb) { if (window.QRCode) return cb(); const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"; s.onload = cb; document.head.appendChild(s); }
function pixModal(d) {
  wr("bck-last", { n: d.reference });
  modal(true, `<div class="ps"><h3>Pague com PIX</h3><p style="margin:0;color:var(--mut)">Total <b style="color:#000;font-size:22px">${brl(d.total)}</b> • Pedido ${esc(d.reference)}</p><ol class="steps"><li>Copie o código abaixo</li><li>Abra o app do seu banco e escolha <b>PIX Copia e Cola</b></li><li>Cole o código e confirme</li></ol><div id="qr">${d.qrImage ? `<img alt="QR Code PIX" src="${esc(d.qrImage)}">` : ""}</div><textarea id="pc" readonly rows="3"></textarea><button class="btn btn-w" id="cpb" style="margin:10px 0;height:54px;font-size:17px">Copiar código PIX</button><p id="ps" style="color:var(--mut)">⏳ Aguardando pagamento… esta tela atualiza sozinha.</p><small style="color:var(--mut)">Depois da confirmação, você recebe o código de rastreio do seu pedido.</small></div>`);
  $("#pc").value = d.pixCode; if (!d.qrImage) loadQR(() => { $("#qr").innerHTML = ""; new QRCode($("#qr"), { text: d.pixCode, width: 214, height: 214, correctLevel: QRCode.CorrectLevel.M }); });
  $("#cpb").onclick = function () { try { navigator.clipboard.writeText(d.pixCode); } catch { $("#pc").select(); document.execCommand("copy"); } this.textContent = "Código copiado ✓"; };
  let n = 0; const t = setInterval(async () => {
    if (!$("#md").classList.contains("on") && ++n > 3) { clearInterval(t); return; } if (n > 900) return clearInterval(t);
    const r = await fetch(`${FN}pix-status?ref=${encodeURIComponent(d.reference)}&t=${encodeURIComponent(d.pollToken)}`).then(x => x.json()).catch(() => null); if (!r) return;
    if (["approved", "preparing", "shipped", "delivered"].includes(r.status)) { clearInterval(t); Cart.clear(); pago(r.trackCode || ""); }
    else if (r.status === "failed") { clearInterval(t); $("#ps").innerHTML = '<span class="err">Pagamento não aprovado ou expirado. Gere um novo PIX.</span>'; }
  }, 4000);
  function pago(code) {
    if (code) wr("bck-last", { c: code });
    const box = $("#md .ps"); if (!box) return;
    box.innerHTML = `<div class="okb">✓</div><h3>Pagamento confirmado!</h3><p style="margin:4px 0 0;color:var(--mut)">Obrigado pela compra. Seu pedido já está com a gente.</p>${code ? `<p style="margin:18px 0 6px;font-weight:700">Seu código de rastreio:</p><div class="tcode">${esc(code)}</div><button class="btn btn-o btn-w" id="cpt" style="margin-top:10px">Copiar código</button><a class="btn btn-w" style="margin-top:10px" href="/rastreio?c=${encodeURIComponent(code)}">Rastrear meu pedido</a><small style="display:block;margin-top:12px;color:var(--mut)">Guarde esse código. A situação do pedido atualiza todo dia no menu <b>Rastreio</b>.</small>` : `<a class="btn btn-w" style="margin-top:16px" href="/rastreio">Rastrear meu pedido</a>`}`;
    const b = $("#cpt"); if (b) b.onclick = () => { try { navigator.clipboard.writeText(code); } catch { } b.textContent = "Código copiado ✓"; };
  }
}
const fdia = d => { const [a, m, x] = d.split("-"); return `${x}/${m}`; };
function rastreio() {
  document.title = "Rastrear pedido | BCK BRAZIL"; const last = rd("bck-last", {});
  const old = qs.get("n") && qs.get("c") && /^BCK-/i.test(qs.get("n")); // links antigos: /pedido?n=...&c=...
  const ini = old ? "" : (qs.get("c") || last.c || "");
  $("#app").innerHTML = `<div class="doc tk"><h1>Rastrear <span style="color:var(--gold2)">pedido</span></h1><p class="bck-lead">Digite o código de rastreio que apareceu depois do pagamento (começa com BCK).</p><form class="f tkf" id="lf"><input name="code" aria-label="Código de rastreio" placeholder="BCKXXXXXXXX" autocomplete="off" autocapitalize="characters" maxlength="16" required value="${esc(ini)}"><button class="btn">Rastrear</button></form><div class="err" id="le"></div><div id="lr"></div><p class="tkh">Não achou o código? <a href="${wa("Olá, BCK BRAZIL! Quero rastrear meu pedido.")}" target="_blank" rel="noopener">Fale com a gente no WhatsApp</a>.</p></div>`;
  const show = o => {
    if (o.aviso) { $("#lr").innerHTML = `<div class="bck-card">${esc(o.aviso)}</div>`; return; }
    wr("bck-last", { c: o.code }); $("#lf").elements.code.value = o.code;
    const done = o.passos, last = done.length - 1;
    $("#lr").innerHTML = `<div class="tkc"><div class="tkt"><div><small>Código</small><b>${esc(o.code)}</b></div><div style="text-align:right"><small>Situação</small><b class="${o.entregue ? "ok" : ""}">${esc(o.atual)}</b></div></div>
    <ol class="tl">${done.map((p, i) => `<li class="${i === last ? "now" : "d"}"><i></i><div><b>${esc(p.titulo)}</b><span>${esc(p.texto)}</span></div><time>${fdia(p.data)}</time></li>`).join("")}${o.proximas.map(t => `<li class="nx"><i></i><div><b>${esc(t)}</b></div></li>`).join("")}</ol>
    ${o.entregue ? "" : `<p class="tkh" style="margin:6px 0 0">A situação atualiza uma vez por dia.</p>`}
    ${o.correios ? `<p style="margin:14px 0 0"><b>Código dos Correios:</b> ${esc(o.correios)} — <a href="https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(o.correios)}" target="_blank" rel="noopener">Ver nos Correios</a></p>` : ""}
    <div class="tki"><p style="margin:0 0 6px">Olá, ${esc(o.firstName)}! Entrega em ${esc(o.city)}/${esc(o.state)}.</p>${o.items.map(i => `<div>${i.q}x ${esc(i.n)}${i.s ? " (" + esc(i.s) + ")" : ""}</div>`).join("")}<b style="display:block;margin-top:6px">Total pago: ${brl(o.total)}</b></div></div>`;
  };
  const run = async body => { $("#le").textContent = ""; $("#lr").innerHTML = '<p class="tkh">Buscando…</p>'; const r = await post("rastreio", body); if (!r.ok) { $("#lr").innerHTML = ""; $("#le").textContent = r.d.error || "Não foi possível consultar agora."; return; } show(r.d); };
  $("#lf").onsubmit = e => { e.preventDefault(); run({ code: $("#lf").elements.code.value }); };
  if (old) run({ number: qs.get("n"), secret: qs.get("c") }); else if (ini) run({ code: ini });
}

/* ---------- início ---------- */
(async () => {
  chrome();
  try { CAT = await fetch("/catalog.json").then(r => r.json()); } catch { }
  badge(); drawer();
  const pg = document.body.dataset.page;
  ({ home, loja, produto, checkout, rastreio, pedido: rastreio, personalizadas, pagina }[pg] || (() => { }))();
  window.addEventListener("storage", () => { badge(); drawer(); });
})();
})();
