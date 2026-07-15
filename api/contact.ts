import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, message } = req.body;
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

  if (!accessKey) {
    console.error('WEB3FORMS_ACCESS_KEY is not defined in environment variables.');
    return res.status(500).json({ error: 'Mail server configuration error' });
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `YigitSite Yeni İletişim Mesajı: ${email}`,
        from_name: 'YigitSite İletişim Formu',
        email: email,
        message: message,
      }),
    });

    const result = await response.json();

    if (result.success) {
      return res.status(200).json({ success: true, message: 'Message sent successfully' });
    } else {
      console.error('Web3Forms Error:', result);
      return res.status(500).json({ error: 'Failed to send message via provider' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
