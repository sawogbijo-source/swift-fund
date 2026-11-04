export async function POST(req) {
  const { amount, userId } = await req.json();
  const deployedUrl = process.env.APP_URL || 'https://YOUR-WEB-APP.web.app';
  const r = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'x-api-key': 'G2QYCWT-RM5M2YD-GQA6SGN-51W4B21',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: 'btc',
      order_id: userId,
      order_description: `Swift Fund deposit $${amount}`,
      ipn_callback_url: `${deployedUrl}/api/nowpayments-webhook`
    })
  });
  return new Response(JSON.stringify(await r.json()), { status: 200 });
}
