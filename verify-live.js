const fs = require('fs');
const crypto = require('crypto');

const KEY_ID = 'ff721a25-d41f-47aa-a52a-3ff34667333b';
const privateKey = fs.readFileSync('/Users/myassistant/Documents/projects/kalshi-specialist/kalshi_key.pem', 'utf8');

function sign(method, path, ts) {
  const msg = ts + method + path.split('?')[0];
  const s = crypto.createSign('RSA-SHA256');
  s.update(msg); s.end();
  return s.sign({key: privateKey, padding: crypto.constants.RSA_PKCS1_PSS_PADDING, saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST}, 'base64');
}

async function req(path) {
  const ts = Date.now().toString();
  const res = await fetch('https://api.elections.kalshi.com' + path, {
    headers: {'KALSHI-ACCESS-KEY': KEY_ID, 'KALSHI-ACCESS-TIMESTAMP': ts, 'KALSHI-ACCESS-SIGNATURE': sign('GET', path, ts)}
  });
  return res.json();
}

async function main() {
  const [bal, pos, marks] = await Promise.all([
    req('/trade-api/v2/portfolio/balance'),
    req('/trade-api/v2/portfolio/positions'),
    req('/trade-api/v2/markets?status=open&limit=100')
  ]);
  
  console.log('DIRECT FROM KALSHI API:');
  console.log('  Balance:        $' + (bal.balance/100).toFixed(2));
  console.log('  Portfolio Value: $' + (bal.portfolio_value/100).toFixed(2));
  console.log('  Open Positions:  ' + (pos.positions?.length || 0));
  console.log('  Total Markets:   ' + marks.markets?.length);
  const liquid = marks.markets?.filter(m => m.yes_ask > 0 && m.yes_ask < 100).length;
  console.log('  Liquid Markets:  ' + liquid);
  console.log('');
  console.log('DASHBOARD CACHE:');
  
  const dash = await (await fetch('http://127.0.0.1:4444/api/kalshi/prod')).json();
  console.log('  Balance:         $' + dash.balance?.available);
  console.log('  Markets (cache): ' + dash.markets?.total);
  console.log('  Liquid (cache):  ' + dash.markets?.liquid);
  console.log('  Positions:       ' + dash.positions?.open);
  console.log('');
  console.log(dash.balance?.raw_cents == bal.balance ? '✅ Balance matches LIVE' : '⚠️ Balance may be cached');
}

main().catch(console.error);
