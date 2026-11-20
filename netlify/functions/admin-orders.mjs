// Painel do dono: lista pedidos (com endereço) e atualiza o rastreio. Protegido por ADMIN_TOKEN.
import { getStore } from "@netlify/blobs";
import { linhaDoTempo } from "../lib/rastreio.mjs";
import { garantirCodigo } from "../lib/codigo.mjs";

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const sha = async (t) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map((x) => x.toString(16).padStart(2, "0")).join("");
const PAID = ["approved", "preparing", "shipped", "delivered"]; // código de rastreio só aparece depois de pago
// "approved" = rastreio automático (1 etapa por dia). "delivered" = o dono confirma a entrega.
const SETTABLE = ["approved", "delivered"];

export default async (req) => {
  const tok = process.env.ADMIN_TOKEN || "";
  if (tok.length < 12 || (await sha(req.headers.get("x-admin-token") || "")) !== (await sha(tok))) return J({ error: "Não autorizado" }, 401);
  const store = getStore("orders");

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const all = await Promise.all(blobs.map(async (x) => {
      const o = await store.get(x.key, { type: "json" }); if (!o) return null;
      const pago = PAID.includes(o.status), t = pago ? linhaDoTempo(o) : null;
      return { ref: x.key, ...o, codeHash: undefined, pixCode: undefined, pollToken: undefined, accessCode: undefined,
        trackCode: pago ? await garantirCodigo(x.key, o) : undefined, etapa: t?.atual || null, amanha: t?.amanha || null };
    }));
    return J(all.filter(Boolean).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 300));
  }
  if (req.method === "POST") {
    let b; try { b = await req.json(); } catch { return J({ error: "Dados inválidos" }, 400); }
    const o = await store.get(String(b.ref || ""), { type: "json" });
    if (!o) return J({ error: "Pedido não encontrado" }, 404);
    if (!SETTABLE.includes(b.status)) return J({ error: "Status inválido" }, 400);
    const now = new Date().toISOString();
    const deliveredAt = b.status === "delivered" ? o.deliveredAt || now : null; // remarcar não muda a data
    await store.setJSON(b.ref, { ...o, status: b.status, paidAt: o.paidAt || now, deliveredAt,
      tracking: String(b.tracking || "").trim().slice(0, 40) || null, updatedAt: now });
    return J({ ok: true });
  }
  return J({ error: "Método não permitido" }, 405);
};
