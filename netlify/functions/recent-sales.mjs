// Public notifications only for paid purchases whose customers explicitly opted in.
// Never includes contact details, CPF, full name, address, order ID, or access code.
import { getStore } from '@netlify/blobs';

const PAID = new Set(['approved','preparing','shipped','delivered']);
const J = (o, status=200) => new Response(JSON.stringify(o), {status, headers: {'content-type':'application/json','cache-control':'public, max-age=30'}});

export default async (req) => {
  if (req.method !== 'GET') return J({error:'Método não permitido'},405);
  try {
    const store = getStore('orders');
    const {blobs} = await store.list();
    const latest = blobs.slice(-100);
    const orders = await Promise.all(latest.map(x => store.get(x.key,{type:'json'})));
    const now = Date.now();
    const sales = orders.filter(o => o?.publicShareConsent === true && PAID.has(o.status) && o.paidAt && now - new Date(o.paidAt).getTime() <= 7*86400000)
      .sort((a,b)=>new Date(b.paidAt)-new Date(a.paidAt)).slice(0,8).map(o=>{
        const mins = Math.max(1,Math.floor((now-new Date(o.paidAt).getTime())/60000));
        const ago = mins<60?`há ${mins} min`:mins<1440?`há ${Math.floor(mins/60)} h`:`há ${Math.floor(mins/1440)} dia(s)`;
        const product = String(o.items?.[0]?.n||'camisetas UV').slice(0,45);
        const name = String(o.customer?.name||'Cliente').trim().split(/\s+/)[0].slice(0,24);
        const city = `${String(o.address?.city||'Brasil').slice(0,40)}/${String(o.address?.state||'').slice(0,2)}`;
        const img = /pesca|peixe/i.test(product)?'/img/tf.jpg':/cat[oó]lic|santa|nossa/i.test(product)?'/img/bf.jpg':'/img/af.jpg';
        return {name,city,product,ago,img};
      });
    return J({sales});
  } catch (e) {
    console.error('Falha ao recuperar vendas autorizadas',e?.message);
    return J({sales:[]});
  }
};
