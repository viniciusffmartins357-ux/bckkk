// Teste do PIX para o dono da loja (botão "Testar PIX agora" no /admin). Protegido por ADMIN_TOKEN.
// Confere as configurações da Netlify, a chave da PinguPag e (opcional) gera um PIX de teste de R$ 5,00 que NÃO vira pedido.
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const sha = async (t) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map((x) => x.toString(16).padStart(2, "0")).join("");
const clean = (v) => String(v || "").trim().replace(/^["']+|["']+$/g, "").replace(/^x-api-key\s*:\s*/i, "").trim();
const DOC_URL = "https://pagamento-processador.org.ua/gateway/v1/transaction";
function emv(code) { const o = {}; let i = 0; while (i + 4 <= code.length) { const id = code.slice(i, i + 2), len = +code.slice(i + 2, i + 4); if (!(len >= 0)) break; o[id] = code.slice(i + 4, i + 4 + len); i += 4 + len; } return { name: o["59"] || "", city: o["60"] || "" }; }
const findCode = (o) => { if (typeof o === "string") return /^000201/.test(o) ? o : ""; if (o && typeof o === "object") for (const v of Object.values(o)) { const c = findCode(v); if (c) return c; } return ""; };

async function call(url, key, opt = {}) {
  try {
    const r = await fetch(url, { ...opt, headers: { "X-API-Key": key, "Content-Type": "application/json" }, signal: AbortSignal.timeout(20000) });
    const text = await r.text(); let data = null; try { data = JSON.parse(text); } catch {}
    return { status: r.status, ok: r.ok, data, text: text.replace(/pingupag_\S+/gi, "[chave]").slice(0, 300) };
  } catch (e) { return { status: 0, ok: false, data: null, text: "Sem resposta (" + e.name + ")" }; }
}
const motivo = (r) => String(r.data?.error || r.data?.message || r.data?.msg || r.data?.erro || r.data?.detail || (r.data ? JSON.stringify(r.data) : r.text) || "").replace(/pingupag_\S+/gi, "[chave]").slice(0, 300);
const bloqueio = (r) => !r.data && /cloudflare|just a moment|attention required|<html/i.test(r.text);

export default async (req) => {
  const tok = process.env.ADMIN_TOKEN || "";
  if (tok.length < 12 || (await sha(req.headers.get("x-admin-token") || "")) !== (await sha(tok))) return J({ error: "Não autorizado" }, 401);
  if (req.method !== "POST") return J({ error: "Método não permitido" }, 405);
  let b = {}; try { b = await req.json(); } catch {}

  const out = []; const add = (ok, titulo, detalhe) => out.push({ ok, titulo, detalhe });
  const raw = process.env.PINGUPAG_API_KEY || "", key = clean(raw);
  const site = process.env.SITE_URL || process.env.URL || "";
  const API = (process.env.PINGUPAG_API_URL || DOC_URL).trim(), base = API.replace(/\/transaction\/?$/, "");

  if (!key) { add(false, "Chave da PinguPag", "A variável PINGUPAG_API_KEY não existe na Netlify (ou não está liberada para Functions). Crie ou corrija e publique de novo."); return J({ checks: out }); }
  const avisos = [];
  if (raw !== key) avisos.push("tinha espaço, aspas ou \"X-API-Key:\" junto — a loja já ignora isso");
  if (!/^pingupag_/i.test(key)) avisos.push("não começa com \"pingupag_\" — confira se copiou a Chave SECRETA (Secret Key) e não outra informação");
  add(/^pingupag_/i.test(key), "Chave da PinguPag na Netlify", `Encontrada, termina em …${key.slice(-4)} (${key.length} caracteres)${avisos.length ? ". Atenção: " + avisos.join("; ") : ""}.`);
  add(!!process.env.WEBHOOK_TOKEN, "WEBHOOK_TOKEN", process.env.WEBHOOK_TOKEN ? "Configurado." : "Falta criar na Netlify. Sem ele o site não gera o PIX.");
  add(!!site, "Endereço do site", site ? site : "Falta SITE_URL.");
  if (process.env.PINGUPAG_API_URL) add(true, "Endereço da PinguPag", "Personalizado: " + API + " (se não tiver certeza, apague a variável PINGUPAG_API_URL).");

  const s = await call(base + "/seller", key, { method: "GET" });
  if (s.ok && s.data) add(true, "PinguPag aceitou a chave", `Loja: ${s.data.name || s.data.company_name || "(sem nome)"}${s.data.email ? " • " + s.data.email : ""}`);
  else if (bloqueio(s)) { add(false, "PinguPag bloqueou a Netlify", `A proteção do site da PinguPag barrou o pedido (código ${s.status}). Peça ao suporte da PinguPag para liberar chamadas vindas da Netlify.`); return J({ checks: out }); }
  else { add(false, "PinguPag recusou a chave", `Código ${s.status}. Resposta: ${motivo(s) || "(vazia)"}. Se diz "API Key inválida ou loja inativa": ou a chave está errada, ou a sua loja ainda não foi ativada pela PinguPag.`); return J({ checks: out }); }

  if (!b.gerar) return J({ checks: out });
  const sd = s.data || {}, doc = String(sd.document || "").replace(/\D/g, "");
  const body = { amount: 500, description: "Teste da loja BCK BRAZIL", reference: "TESTE-" + Date.now().toString(36).toUpperCase(), source: "api_externa",
    customer: { name: String(sd.name || sd.company_name || "Teste BCK BRAZIL").slice(0, 80), email: sd.email || "contato@bckbrazil.com.br", phone: "21984804314", document: doc || "52998224725" } };
  const t = await call(API, key, { method: "POST", body: JSON.stringify(body) });
  const code = t.data ? findCode(t.data) : "";
  if (t.ok && code) {
    const rec = emv(code), exp = process.env.EXPECTED_MERCHANT || "";
    add(true, "PIX de teste de R$ 5,00 gerado", `Recebedor dentro do PIX: ${rec.name || "?"} / ${rec.city || "?"}. Não precisa pagar; ele não vira pedido.`);
    if (exp && !rec.name.toUpperCase().includes(exp.toUpperCase())) add(false, "Nome do recebedor não confere", `EXPECTED_MERCHANT na Netlify está "${exp}", mas o PIX sai em nome de "${rec.name}". Por segurança o site bloqueia o PIX. Se esse nome for mesmo o da sua conta, troque EXPECTED_MERCHANT para "${rec.name}" (ou apague a variável) e publique de novo.`);
  } else if (bloqueio(t)) add(false, "PinguPag bloqueou a Netlify", `Código ${t.status}. Peça ao suporte da PinguPag para liberar chamadas vindas da Netlify.`);
  else add(false, "PinguPag não gerou o PIX de teste", `Código ${t.status}. Motivo dado pela PinguPag: ${motivo(t) || "(vazio)"}. Mande essa frase para o suporte da PinguPag.`);
  return J({ checks: out });
};
