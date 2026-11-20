
import { getStore } from "@netlify/blobs";

const PIXEL_ID = "1735215124240936";
const API_VERSION = "v26.0";
const PAID = ["approved", "preparing", "shipped", "delivered"];

const sha = async (t) =>
  [...new Uint8Array(await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(t)
  ))].map((x) => x.toString(16).padStart(2, "0")).join("");

async function sendPurchase(ref, order, paidAt) {
  const token = (process.env.META_ACCESS_TOKEN || "").trim();

  if (!token) {
    console.error("META_ACCESS_TOKEN não configurado.");
    return false;
  }

  const email = String(order.customer?.email || "").trim().toLowerCase();
  const phone = String(order.customer?.phone || "").replace(/\D/g, "");

  const user_data = {};

  if (email) user_data.em = [await sha(email)];
  if (phone) user_data.ph = [await sha(phone)];

  if (order.clientUserAgent) {
    user_data.client_user_agent = order.clientUserAgent;
  }

  const items = Array.isArray(order.items) ? order.items : [];

  const event = {
    event_name: "Purchase",
    event_time: Math.floor(new Date(paidAt).getTime() / 1000),
    event_id: `bck_${ref}`,
    action_source: "website",
    event_source_url: order.eventSourceUrl || "https://bckbrasil.netlify.app/",
    user_data,
    custom_data: {
      currency: "BRL",
      value: Number((order.amount / 100).toFixed(2)),
      content_type: "product",
      content_ids: items.map(i => String(i.id)),
      contents: items.map(i => ({
        id: String(i.id),
        quantity: Number(i.q),
        item_price: Number(i.p)
      })),
      num_items: items.reduce((sum, i) => sum + Number(i.q || 0), 0),
      order_id: ref
    }
  };

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error("Erro ao enviar Purchase para Meta:", result.error?.message || response.status);
      return false;
    }

    console.log("Purchase enviado para Meta:", ref);
    return true;
  } catch (e) {
    console.error("Falha de conexão com Meta:", e.message);
    return false;
  }
}

export default async (req) => {
  const ok = new Response("ok", { status: 200 });

  if (req.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }

  const t = new URL(req.url).searchParams.get("t") || "";

  if (!process.env.WEBHOOK_TOKEN || t !== process.env.WEBHOOK_TOKEN) {
    return new Response("Não autorizado", { status: 401 });
  }

  let b;
  try {
    b = await req.json();
  } catch {
    return ok;
  }

  const ref = b.external_id || b.store_reference;

  if (!ref || typeof ref !== "string") return ok;

  const store = getStore("orders");
  const order = await store.get(ref, { type: "json" });

  if (!order) return ok;

  let status = String(b.status || "").toLowerCase();

  if (status === "approved" && Number(b.amount) !== order.amount) {
    console.error("Valor divergente no pedido", ref);
    status = "review";
  }

  const isPaid = PAID.includes(status);
  const wasPaid = PAID.includes(order.status);

  if (wasPaid && status !== "refunded" && status !== "chargeback") {
    if (!isPaid || order.metaPurchaseSentAt) return ok;
  }

  const now = new Date().toISOString();
  const paidAt = order.paidAt || (isPaid ? now : null);

  await store.setJSON(ref, {
    ...order,
    status,
    ...(isPaid ? { paidAt } : {}),
    updatedAt: now,
    e2eId: b.e2e_id || order.e2eId || null
  });

  if (isPaid && !order.metaPurchaseSentAt) {
    const sent = await sendPurchase(ref, order, paidAt);

    if (sent) {
      await store.setJSON(ref, {
        ...order,
        status,
        paidAt,
        updatedAt: now,
        e2eId: b.e2e_id || order.e2eId || null,
        metaPurchaseSentAt: new Date().toISOString()
      });
    }
  }

  return ok;
};
