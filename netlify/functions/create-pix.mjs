// Cria a cobrança PIX na PinguPag. A secret key fica só aqui (variável de ambiente).
import { getStore } from "@netlify/blobs";
import catalog from "../../catalog.json";
import { novoCodigo } from "../lib/rastreio.mjs";

// ENDEREÇO DA API: a documentação oficial da PinguPag (app.pingupag.com/documentation) publica como base
// https://pagamento-processador.org.ua/gateway/v1/transaction. Aceitamos esse host e *.pingupag.com (https).
// A proteção principal contra desvio de dinheiro é EXPECTED_MERCHANT (confere o recebedor dentro do código PIX).
const DOC_URL = "https://pagamento-processador.org.ua/gateway/v1/transaction";
const HOSTS_OK = ["pingupag.com", "pagamento-processador.org.ua"];
function gatewayUrl() {
  const raw = process.env.PINGUPAG_API_URL || DOC_URL;
  try {
    const u = new URL(raw);
    const okHost = HOSTS_OK.some((h) => u.hostname === h || u.hostname.endsWith("." + h));
    if (u.protocol === "https:" && (okHost || process.env.ALLOW_CUSTOM_GATEWAY === "1")) return u.href;
  } catch {}
  return null;
}
// Lê o "copia e cola" (BR Code) e devolve nome/cidade do recebedor (tags 59 e 60).
function emv(code) {
  const o = {}; let i = 0;
  while (i + 4 <= code.length) { const id = code.slice(i, i + 2), len = +code.slice(i + 2, i + 4); if (!(len >= 0)) break; o[id] = code.slice(i + 4, i + 4 + len); i += 4 + len; }
  return { name: o["59"] || "", city: o["60"] || "" };
}
const SIZES = new Set(["P", "M", "G", "GG", "XG", ""]);
const PRICES = new Map(catalog.map((p) => [String(p.id), p]));
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
// Cupons aceitos (código -> % de desconto). Ajuste pela variável COUPONS (JSON) se precisar.
const COUPONS = JSON.parse(process.env.COUPONS || '{"FICA10":10,"BCK5":5,"BCK10":10,"BCK15":15,"BCK20":20}');
const FRETE = {};
[[24.9, "SP RJ ES MG"], [29.9, "PR SC RS"], [34.9, "DF GO MT MS"], [39.9, "BA SE AL PE PB RN CE PI MA"], [49.9, "AC AM AP PA RO RR TO"]]
  .forEach(([v, u]) => u.split(" ").forEach((x) => (FRETE[x] = v)));

const sha = async (t) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map((x) => x.toString(16).padStart(2, "0")).join("");
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (x) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[x % 32]).join("");

const cpfOk = (c) => {
  if (!/^\d{11}$/.test(c) || /^(\d)\1+$/.test(c)) return false;
  for (const n of [9, 10]) { let s = 0; for (let i = 0; i < n; i++) s += c[i] * (n + 1 - i); if (((s * 10) % 11) % 10 != c[n]) return false; }
  return true;
};

// Mesma regra do site: cupom, 10% com 4+ peças, 5% no PIX, frete grátis em todos os pedidos.
function calc(items, coupon, uf) {
  const sub = items.reduce((a, i) => a + i.p * i.q, 0), pcs = items.reduce((a, i) => a + i.q, 0);
  const cp = COUPONS[coupon] || 0, c1 = (sub * cp) / 100, bulk = ((sub - c1) * (pcs >= 4 ? 10 : 0)) / 100;
  const c = sub - c1 - bulk, pix = (c * 5) / 100, ship = 0;
  const cents = Math.round((c - pix + (ship ?? 0)) * 100);
  return { sub, coupon: c1, bulk, pix, ship, total: cents / 100, cents };
}

// Procura no JSON de resposta o copia e cola (começa com 000201) e uma imagem de QR, se vier.
function scan(o, out = {}) {
  if (typeof o === "string") {
    if (!out.code && /^000201/.test(o)) out.code = o;
    else if (!out.img && (/^data:image\//.test(o) || /^https?:\/\/\S+\.(png|jpe?g|svg)(\?|$)/i.test(o))) out.img = o;
    else if (!out.img && /^iVBOR[A-Za-z0-9+/=]{200,}$/.test(o)) out.img = "data:image/png;base64," + o;
  } else if (o && typeof o === "object") for (const v of Object.values(o)) scan(v, out);
  return out;
}

export default async (req) => {
  if (req.method !== "POST") return J({ error: "Método não permitido" }, 405);
  let b; try { b = await req.json(); } catch { return J({ error: "Dados inválidos" }, 400); }

  // Preço e nome vêm SEMPRE do catálogo do servidor (catalog.json). O navegador só informa id, tamanho e quantidade.
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 50).map((i) => {
  const p = PRICES.get(String(i.id));
  return { id: String(i.id), n: p ? p.name : "", s: String(i.s || "").toUpperCase().slice(0, 4), p: p ? p.price : 0, q: Math.floor(Number(i.q)) };
});

if (!items.length || items.some((i) => !i.n || !SIZES.has(i.s) || !(i.q >= 1 && i.q <= 100))) return J({ error: "Carrinho inválido" }, 400);

  const c = b.customer || {}, a = b.address || {};
  const phone = String(c.phone || "").replace(/\D/g, ""), doc = String(c.document || "").replace(/\D/g, ""), zip = String(a.zipcode || "").replace(/\D/g, "");
const coupon = String(b.coupon || "").toUpperCase();
const t = calc(items, coupon, String(a.state || b.state || "").toUpperCase());
  if (String(c.name || "").trim().length < 3) return J({ error: "Informe seu nome completo." }, 400);
  if (!/^\S+@\S+\.\S+$/.test(c.email || "")) return J({ error: "E-mail inválido." }, 400);
  if (!/^\d{10,11}$/.test(phone)) return J({ error: "Telefone inválido (com DDD)." }, 400);
  if (!cpfOk(doc)) return J({ error: "CPF inválido." }, 400);
  if (zip.length !== 8 || !a.street || !a.number || !a.neighborhood || !a.city || t.ship === null) return J({ error: "Endereço incompleto." }, 400);
  if (t.cents < 500) return J({ error: "Valor inválido." }, 400);

  // .trim() evita falha quando a chave é colada na Netlify com espaço ou quebra de linha no fim.
  const key = (process.env.PINGUPAG_API_KEY || "").trim().replace(/^["']+|["']+$/g, "").replace(/^x-api-key\s*:\s*/i, "").trim(), hash = (process.env.PINGUPAG_PRODUCT_HASH || "").trim(), tok = (process.env.WEBHOOK_TOKEN || "").trim(); // hash é opcional com source=api_externa
  const site = process.env.SITE_URL || process.env.URL, API = gatewayUrl();
  const faltando = [["PINGUPAG_API_KEY", key], ["WEBHOOK_TOKEN", tok], ["SITE_URL", site], ["PINGUPAG_API_URL (inválida)", API]].filter(([, v]) => !v).map(([n]) => n);
  if (faltando.length) { console.error("Configuração ausente ou inválida:", faltando.join(", ")); return J({ error: "Pagamento indisponível no momento." }, 500); }

  const reference = "BCK-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const body = {
    amount: t.cents,
    description: items.map((i) => `${i.q}x ${i.n}${i.s ? " (" + i.s + ")" : ""}`).join(", ").slice(0, 120),
    reference, source: "api_externa", ...(hash ? { productHash: hash } : {}),
    postback_url: `${site}/.netlify/functions/pix-webhook?t=${encodeURIComponent(tok)}`,
    customer: { name: String(c.name).trim(), email: c.email.trim(), phone, document: doc },
    address: { street: String(a.street), number: String(a.number), complement: String(a.complement || ""), neighborhood: String(a.neighborhood), city: String(a.city), state: String(a.state).toUpperCase(), zipcode: zip },
  };

  let r, data;
  try {
    r = await fetch(API, { method: "POST", headers: { "X-API-Key": key, "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
    const txt = await r.text(); try { data = JSON.parse(txt); } catch { data = { detail: "Resposta não-JSON: " + txt.replace(/\s+/g, " ").slice(0, 200) }; }
  } catch (e) { console.error("Falha de rede com a PinguPag:", e.name); return J({ error: "Não foi possível falar com o gateway. Tente novamente." }, 502); }

  const found = scan(data);
  if (!r.ok || !found.code) {
    // Mostra no log da Netlify o motivo que a PinguPag deu (ex.: "API Key inválida ou loja inativa").
    const motivo = String(data?.error || data?.message || data?.msg || data?.erro || data?.detail || "").replace(/pingupag_\S+/gi, "[chave]").slice(0, 300);
    console.error("PinguPag recusou o PIX. Status:", r.status, "| Motivo:", motivo || "(sem mensagem)", "| campos:", Object.keys(data || {}).join(","));
    return J({ error: "Não foi possível gerar o PIX. Tente novamente ou fale pelo WhatsApp." }, 502);
  }

  const rec = emv(found.code);
  if (process.env.EXPECTED_MERCHANT && !rec.name.toUpperCase().includes(process.env.EXPECTED_MERCHANT.toUpperCase())) {
    console.error("RECEBEDOR DO PIX DIFERENTE DO ESPERADO:", rec.name, rec.city); // nunca entregue esse PIX ao cliente
    return J({ error: "Não foi possível gerar o PIX. Fale pelo WhatsApp." }, 502);
  }
  console.log("PIX gerado para o recebedor:", rec.name, "/", rec.city);
  const accessCode = newCode(), pollToken = Array.from(crypto.getRandomValues(new Uint8Array(12)), (x) => x.toString(16).padStart(2, "0")).join("");
  const trackCode = novoCodigo(); // só é mostrado ao cliente depois do pagamento
  await getStore("track").setJSON(trackCode, { ref: reference });
  await getStore("orders").setJSON(reference, {
    status: "pending",
clientUserAgent: req.headers.get("user-agent") || "",
eventSourceUrl: site,
trackCode, codeHash: await sha(reference + ":" + accessCode), accessCode, pollToken, pixCode: found.code, amount: t.cents, createdAt: new Date().toISOString(), transactionId: data.transaction_id || data.id || null,
    items, coupon, publicShareConsent: b.publicShareConsent === true, customer: { name: body.customer.name, email: body.customer.email, phone }, address: body.address,
  });
  return J({ reference, pollToken, total: t.total, pixCode: found.code, qrImage: found.img || null });
};
