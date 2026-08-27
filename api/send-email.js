export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to, subject, html, reply_to, apiKey } = req.body;

    const resendKey = apiKey || process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!resendKey) {
      return res.status(400).json({ error: 'Resend API Key is missing in environment variables.' });
    }

    const fromAddress = from || process.env.VITE_RESEND_FROM_EMAIL || 'Nexora Connect <connect@mail.nexoratechs.xyz>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        reply_to: reply_to || 'contactnexoratechs@gmail.com',
        subject,
        html
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Email API handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
