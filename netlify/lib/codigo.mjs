// Garante que o pedido tem código de rastreio (pedidos antigos ganham um na primeira consulta).
import { getStore } from "@netlify/blobs";
import { novoCodigo } from "./rastreio.mjs";

export async function garantirCodigo(ref, o) {
  if (o.trackCode) return o.trackCode;
  const code = novoCodigo();
  await getStore("track").setJSON(code, { ref });
  await getStore("orders").setJSON(ref, { ...o, trackCode: code });
  o.trackCode = code;
  return code;
}
