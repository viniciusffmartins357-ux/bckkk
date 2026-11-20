// Retorna apenas o horário de compras recentes com pagamento aprovado.
// Não expõe nome, contato, endereço, produto, valor ou identificador do pedido.
import { getStore } from "@netlify/blobs";

const PAID = new Set(["approved", "preparing", "shipped", "delivered"]);
const J = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  if (req.method !== "GET") return J({ error: "Método não permitido" }, 405);
  try {
    const store = getStore("orders");
    const { blobs } = await store.list();
    const orders = await Promise.all(blobs.map(async ({ key }) => {
      const order = await store.get(key, { type: "json" });
      if (!order || !PAID.has(order.status)) return null;
      const paidAt = order.paidAt || order.updatedAt || order.createdAt;
      const time = paidAt ? new Date(paidAt).getTime() : NaN;
      if (!Number.isFinite(time) || Date.now() - time > 72 * 60 * 60 * 1000 || time > Date.now() + 60000) return null;
      return { paidAt: new Date(time).toISOString() };
    }));
    return J({ sales: orders.filter(Boolean).sort((a, b) => b.paidAt.localeCompare(a.paidAt)).slice(0, 5) });
  } catch (error) {
    console.error("Falha ao consultar compras recentes:", error?.message || "erro");
    return J({ sales: [] });
  }
};
