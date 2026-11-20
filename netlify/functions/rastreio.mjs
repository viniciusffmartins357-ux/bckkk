// Página /rastreio: o cliente consulta o pedido pelo código de rastreio (liberado após o pagamento).
// Também aceita o jeito antigo (número do pedido + código de acesso) para links que já foram enviados.
import { getStore } from "@netlify/blobs";
import { linhaDoTempo, limparCodigo } from "../lib/rastreio.mjs";
import { garantirCodigo } from "../lib/codigo.mjs";

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const sha = async (t) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map((x) => x.toString(16).padStart(2, "0")).join("");
const PAID = ["approved", "preparing", "shipped", "delivered"];

export default async (req, context) => {
  if (req.method !== "POST") return J({ error: "Método não permitido" }, 405);
  let b; try { b = await req.json(); } catch { return J({ error: "Dados inválidos" }, 400); }

  // Limite: 15 tentativas erradas por IP a cada 15 minutos (evita adivinhar códigos).
  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "?";
  const att = getStore("attempts"), ak = "ip:" + ip, a = (await att.get(ak, { type: "json" })) || { n: 0, t: Date.now() };
  if (Date.now() - a.t > 15 * 60e3) { a.n = 0; a.t = Date.now(); }
  if (a.n >= 15) return J({ error: "Muitas tentativas. Aguarde 15 minutos e tente de novo." }, 429);
  const bad = async () => { a.n++; await att.setJSON(ak, a); return J({ error: "Código de rastreio não encontrado. Confira e tente de novo." }, 404); };

  const orders = getStore("orders");
  let ref = null, o = null;
  if (b.code) {
    const code = limparCodigo(b.code); if (!code) return bad();
    const idx = await getStore("track").get(code, { type: "json" });
    ref = idx?.ref || null; o = ref ? await orders.get(ref, { type: "json" }) : null;
    if (!o || o.trackCode !== code) return bad();
  } else {
    ref = String(b.number || "").trim().toUpperCase();
    const sec = String(b.secret || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^BCK-[A-Z0-9-]{8,40}$/.test(ref) || sec.length < 6 || sec.length > 12) return bad();
    o = await orders.get(ref, { type: "json" });
    if (!o || !o.codeHash || (await sha(ref + ":" + sec)) !== o.codeHash) return bad();
  }
  if (a.n) await att.delete(ak);

  if (o.status === "refunded" || o.status === "chargeback")
    return J({ aviso: "Este pedido foi " + (o.status === "refunded" ? "reembolsado" : "contestado") + ". Fale com a gente pelo WhatsApp se tiver dúvidas." });
  if (!PAID.includes(o.status)) return J({ error: "O pagamento deste pedido ainda não foi confirmado." }, 409);

  const code = await garantirCodigo(ref, o);
  return J({
    code, number: ref, firstName: String(o.customer?.name || "").split(" ")[0], city: o.address?.city || "", state: o.address?.state || "",
    items: (o.items || []).map((i) => ({ n: i.n, s: i.s, q: i.q })), total: o.amount / 100, correios: o.tracking || null,
    ...linhaDoTempo(o),
  });
};
