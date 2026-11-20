# BCK BRAZIL – loja nova (estilo Nuvemshop) + PIX seguro na Netlify

## Segurança do PIX (leia)
A documentação oficial da PinguPag (https://app.pingupag.com/documentation) informa como endereço da API `https://pagamento-processador.org.ua/gateway/v1/transaction`. Por isso este endereço é aceito. (Uma versão anterior deste LEIA-ME dizia que ele não era da PinguPag; isso estava errado, a própria documentação o publica.)
Mesmo assim, quem gera o "copia e cola" decide para qual conta o dinheiro vai. Proteja-se assim:
1. Faça um pedido de teste de valor baixo e abra Logs > Functions > create-pix na Netlify. A linha "PIX gerado para o recebedor: NOME / CIDADE" mostra quem recebe.
2. Confirme que esse nome é o da PinguPag/adquirente da SUA conta e que o valor aparece no seu painel da PinguPag.
3. Cadastre esse nome em `EXPECTED_MERCHANT`. A partir daí o site recusa qualquer PIX com outro recebedor.
4. Se a sua chave já foi enviada em chat ou e-mail, gere uma nova no painel.

## Como publicar
1. Suba esta pasta em um repositório Git e importe na Netlify (arrastar a pasta NÃO ativa as funções do PIX).
2. Em Site configuration > Environment variables, cadastre:
   - `PINGUPAG_API_KEY` – a secret key (nova)
   - `PINGUPAG_PRODUCT_HASH` – opcional (o código envia `source: api_externa`, que dispensa o hash)
   - `PINGUPAG_API_URL` – opcional; se vazio usa o endereço da documentação oficial (acima)
   - `WEBHOOK_TOKEN` – texto longo e aleatório
   - `ADMIN_TOKEN` – texto aleatório com 20+ caracteres (acesso a /admin)
   - `SITE_URL` – ex.: https://seudominio.com.br
   - `EXPECTED_MERCHANT` – (recomendado) parte do nome da sua conta recebedora. O sistema confere o nome dentro do código PIX e recusa se for outro.
   - `COUPONS` – opcional, JSON como {"BCK10":10}
3. Faça novo deploy e teste um pedido de valor baixo (geração, pagamento, webhook e /admin).

## Se aparecer "Não foi possível gerar o PIX"
Essa mensagem quer dizer que o site chegou na PinguPag, mas ela recusou a cobrança. Para ver o motivo:
1. Na Netlify, abra Logs > Functions > create-pix e procure a linha "PinguPag recusou o PIX ... Motivo: ...".
2. Motivos mais comuns:
   - "API Key inválida ou loja inativa": a chave em `PINGUPAG_API_KEY` está errada/antiga, ou a loja ainda não foi liberada pela PinguPag. Copie de novo a Chave Secreta em "Configurações e API" no painel.
   - Variável trocada sem novo deploy: depois de mudar qualquer variável na Netlify, clique em Deploys > Trigger deploy > Deploy site.
   - Conta sem adquirente/limite ou em análise: só a PinguPag resolve (fale com o suporte deles).

## O que mudou na v9
- Painel de pedidos (/admin) ganhou o quadro **Teste do PIX**. Entre com o ADMIN_TOKEN e clique em **Conferir chave**: ele mostra se a Netlify tem a chave, se a PinguPag aceita a chave e o motivo exato quando recusa.
- **Gerar PIX de teste (R$ 5,00)** cria um PIX de teste (não precisa pagar e não vira pedido) e mostra em nome de quem o PIX sai.
- A loja agora ignora aspas ou "X-API-Key:" coladas junto da chave, e guarda no log a resposta da PinguPag mesmo quando ela não vem no formato normal.

## O que mudou na v8
- O log da Netlify agora mostra o motivo exato que a PinguPag deu quando recusa o PIX.
- Espaços ou quebras de linha coladas sem querer na chave da Netlify não atrapalham mais.

## O que mudou na v7
- Avaliação no estilo marketplace na página inicial ("Quem comprou, aprova"): foto de perfil, nome, estrelas, data, variação, texto e miniaturas de vídeo e fotos que abrem num visualizador com setas.
- Para adicionar ou trocar avaliações, edite `avaliacoes.json` (só aparecem as com "autorizado": true). Fotos e vídeos ficam em `img/av/`.

## O que mudou na v6
- Tocar em "Cartão de crédito em até 12x" no checkout já abre o WhatsApp com as camisetas, tamanhos e o total.
- Corrigido: o total no cartão às vezes aparecia com 1 centavo a mais.

## O que mudou na v5 (checkout)
- Tela de pagamento sem menu e sem faixa do topo, com selo "Compra segura" no cabeçalho.
- Total sempre visível (no celular o resumo aparece no topo). O botão mostra o valor: "Pagar R$ X com PIX".
- Endereço aparece só depois do CEP, já preenchido automaticamente. Link "Não sei meu CEP".
- Máscaras de WhatsApp e CPF, conferência do CPF e do e-mail antes de enviar, com o campo errado marcado em vermelho.
- Aviso "Faltam X peças para ganhar 10% OFF" no resumo.
- Cartão: a mensagem do WhatsApp já vai com as camisetas, os tamanhos e o total.
- Janela do PIX com passo a passo (copiar, abrir o banco, colar).
- Corrigido: as linhas de Subtotal/Total do carrinho e do checkout apareciam desalinhadas por um estilo antigo.

## O que mudou na v4 (versão direta para venda)
- Removido o assistente "Zeca" (balão e chat); no lugar, um botão discreto de WhatsApp (some no checkout).
- Removidos: barra de busca, faixa de avisos rotativa, vídeo, bloco "Compra 100% segura", calculadora de frete (o frete já é grátis), trilha de navegação, filtro lateral e ordenação da loja, selos "Novo/Destaque/Lançamento".
- Home: todas as camisetas na primeira tela, com filtro rápido Agro / Pesca / Católica.
- Produto: "Comprar agora" em destaque, frete grátis visível junto do preço e 4 benefícios curtos.
- Checkout: cupom escondido em "Tem cupom?" e removida a caixinha de autorização de avisos de compras.
- Rodapé enxuto: pagamento, WhatsApp e links obrigatórios (pedido, trocas, privacidade, termos). As páginas Sobre, FAQ e Personalizadas continuam no site, só não aparecem no menu.

## O que mudou (v3)
- Loja nova: home com banner, categorias, mais desejadas, promoção 4+ peças, vídeo; página de produto (galeria, zoom, tamanhos, tabela de medidas, frete por CEP); carrinho lateral; checkout em uma tela com PIX em pop-up; acompanhamento de pedido; páginas Sobre, FAQ, Trocas, Privacidade e Termos; personalizadas por WhatsApp.
- Preços agora vêm só do servidor (`catalog.json`). O navegador envia apenas id, tamanho e quantidade, então não dá para alterar o valor.
- Para mudar preços, nomes ou fotos, edite `catalog.json` (vale para loja e checkout).

## Pendências suas
- Perfis reais de Instagram, Facebook, TikTok e YouTube em `app.js` (constante SOCIAL).
- Frete é estimativa por região (`app.js` CFG.frete e `netlify/functions/create-pix.mjs`); mantenha as duas tabelas iguais.
- Tabela de medidas em `app.js` (CFG.chart): confirme com seu fornecedor.
- Os campos enviados à API (amount, description, reference, source, postback_url, customer, address) e a leitura da resposta (qr_code, qr_code_base64, transaction_id) foram conferidos com a documentação da PinguPag. O webhook usa external_id, status, amount e e2e_id, também conforme a documentação. Falta só o teste real.
- Avaliações aparecem só se `avaliacoes.json` tiver registros reais com "autorizado": true.
- Textos legais são modelos: peça revisão jurídica.

## O que mudou na v10 — Rastreio
- Novo item **Rastreio** no menu (e botão com caminhão no topo). Página: /rastreio
- Depois que o PIX é confirmado, o cliente recebe um **código de rastreio** (começa com BCK).
- As etapas avançam sozinhas, **1 por dia** (horário de Brasília), nunca 2 no mesmo dia:
  Pedido recebido → Em produção → Em personalização → Controle de qualidade → Embalado → Enviado → Em trânsito.
- **"Pedido entregue"** só aparece quando você marca "Entregue" no /admin (aparece no dia seguinte se já houve etapa no mesmo dia).
- No /admin: código de rastreio, botão de enviar pelo WhatsApp, etapa de hoje/amanhã e campo opcional do código dos Correios.
- Links antigos /pedido continuam funcionando (vão para /rastreio).
- Se um pedido atrasar, avise o cliente pelo WhatsApp.

## O que mudou na v11 — Vitrine organizada
- Página inicial agora separada por coleções: atalhos Agro / Pesca / Católica com foto, "Mais vendidas" e uma seção por coleção (4 modelos + "Ver coleção").

## O que mudou na v12 — Botão "Comprar" de volta
- Voltou o botão **COMPRAR** embaixo de cada camiseta (na home, na loja e nos "Monte seu kit").
- Ele abre a página da camiseta, onde o cliente escolhe tamanho e quantidade.
- O aviso "Ver detalhes" que aparecia ao passar o mouse na foto foi tirado, porque agora o botão já mostra o caminho.

## O que mudou na v14
- Nova seção "Camiseta personalizada" no fim da página inicial, com 4 exemplos (fotos em img/pz). Cada foto e o botão verde abrem o WhatsApp com mensagem pronta.

## O que mudou na v15
- A seção "Camiseta personalizada" foi subida: agora vem **antes** de "Quem comprou, aprova" (antes ficava depois).
- Nada mais mudou — preços, PIX, rastreio e botão "Comprar" continuam iguais.

## O que mudou na v16
- Adicionados os depoimentos enviados pelo lojista: Roberto, Comitiva Amizade e Carlos, com fotos de perfil e das camisetas recebidas.
- A página inicial agora mostra 4 depoimentos; as fotos na horizontal abrem sem as faixas pretas grandes.
