import crypto from 'crypto';

export async function POST(req) {
  const secret = '2f069444-1357-4438-8fde-924937b5bf1d';
  const body = await req.json();
  const sig = req.headers.get ? req.headers.get('x-nowpayments-sig') : req.headers['x-nowpayments-sig'];
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(body, Object.keys(body).sort()))
    .digest('hex');

  if (hash !== sig) {
    return new Response('Invalid signature', { status: 400 });
  }

  if (body.payment_status === 'finished' || body.payment_status === 'confirmed') {
    const final = Number(body.price_amount) * 0.9;
    console.log(`Add $${final} to ${body.order_id}`);
  }

  return new Response('OK', { status: 200 });
}
