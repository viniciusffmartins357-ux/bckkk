// Regras do rastreio automático. Arquivo sem dependências (dá para testar com "node --test testes/").
// - As etapas avançam 1 por dia, contando pelo horário de Brasília, a partir do dia do pagamento.
// - Nunca aparecem 2 atualizações no mesmo dia.
// - "Pedido entregue" só aparece quando o dono marca no painel (/admin).
export const ETAPAS = [
  ["Pedido recebido", "Recebemos seu pagamento e seu pedido já entrou na fila."],
  ["Pedido em produção", "Sua camiseta está sendo produzida."],
  ["Pedido em personalização", "A estampa está sendo aplicada com cuidado."],
  ["Controle de qualidade", "Conferimos costura, estampa e tamanho."],
  ["Pedido embalado", "Seu pedido foi embalado e está pronto para sair."],
  ["Pedido enviado", "Seu pedido saiu da nossa loja."],
  ["Em trânsito", "Seu pedido está a caminho do seu endereço."],
];
export const ENTREGUE = ["Pedido entregue", "Seu pedido foi entregue. Aproveite!"];

const BR = 3 * 3600e3; // Brasília = UTC-3 (sem horário de verão)
/** Dia (AAAA-MM-DD) no horário de Brasília. */
export const dia = (x) => new Date(new Date(x).getTime() - BR).toISOString().slice(0, 10);
const entre = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const soma = (d, n) => new Date(Date.parse(d) + n * 864e5).toISOString().slice(0, 10);

/** Linha do tempo do pedido no momento "agora". */
export function linhaDoTempo(o, agora = new Date()) {
  const ini = dia(o.paidAt || o.createdAt || agora), hoje = dia(agora);
  const passou = Math.max(0, entre(ini, hoje));
  const ultima = ETAPAS.length - 1;
  let limite = Math.min(passou, ultima), diaEntrega = null;
  if (o.deliveredAt) {
    // Etapas já mostradas até o dia em que o dono marcou "entregue" continuam; as seguintes não aparecem.
    const marcado = Math.max(0, entre(ini, dia(o.deliveredAt)));
    const ultimaVista = Math.min(marcado, ultima);
    limite = Math.min(limite, ultimaVista);
    diaEntrega = soma(ini, Math.max(marcado, ultimaVista + 1)); // nunca no mesmo dia de outra etapa
  }
  const passos = [];
  for (let i = 0; i <= limite; i++) passos.push({ titulo: ETAPAS[i][0], texto: ETAPAS[i][1], data: soma(ini, i) });
  const entregue = !!diaEntrega && hoje >= diaEntrega;
  if (entregue) passos.push({ titulo: ENTREGUE[0], texto: ENTREGUE[1], data: diaEntrega, fim: true });
  const proximas = entregue ? [] : [...(o.deliveredAt ? [] : ETAPAS.slice(limite + 1).map((e) => e[0])), ENTREGUE[0]];
  let amanha = null;
  if (!entregue) {
    if (diaEntrega) amanha = soma(hoje, 1) >= diaEntrega ? ENTREGUE[0] : null;
    else if (limite < ultima) amanha = ETAPAS[limite + 1][0];
  }
  return { passos, atual: passos[passos.length - 1].titulo, entregue, proximas, amanha };
}

const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
/** Código de rastreio: "BCK" + 8 caracteres fáceis de ler. */
export const novoCodigo = () => "BCK" + Array.from(crypto.getRandomValues(new Uint8Array(8)), (x) => ABC[x % 32]).join("");
/** Limpa o que o cliente digitou. Aceita com ou sem "BCK", espaços e traços. Devolve null se não for válido. */
export function limparCodigo(t) {
  let c = String(t || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (c.length === 8) c = "BCK" + c;
  return /^BCK[A-Z2-9]{8}$/.test(c) ? c : null;
}
