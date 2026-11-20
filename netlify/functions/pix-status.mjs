// A tela de checkout consulta aqui se o PIX foi pago. O código de rastreio só é liberado depois do pagamento.
import { getStore } from "@netlify/blobs";
import { garantirCodigo } from "../lib/codigo.mjs";

const sha = async (t) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map((x) => x.toString(16).padStart(2, "0")).join("");
const PAID = ["approved", "preparing", "shipped", "delivered"];

export default async (req) => {
  const u = new URL(req.url), ref = u.searchParams.get("ref") || "", t = u.searchParams.get("t") || "";
  const o = /^BCK-[A-Z0-9-]{8,40}$/.test(ref) ? await getStore("orders").get(ref, { type: "json" }) : null;
  const ok = o && o.pollToken && t.length >= 16 && (await sha(t)) === (await sha(o.pollToken));
  const out = ok ? { status: o.status, ...(PAID.includes(o.status) ? { trackCode: await garantirCodigo(ref, o) } : {}) } : { status: "unknown" };
  return new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
};
