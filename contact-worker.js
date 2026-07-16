// KoalaSave Contact Form Worker
// Deploy to Cloudflare Workers
// Sends contact form submissions to support@koalasave.com via Brevo API

export default {
  async fetch(request, env, ctx) {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { name, email, message } = await request.json();

      // Validate required fields
      if (!name || !email || !message) {
        return new Response('Missing required fields', { status: 400 });
      }

      // Send email via Brevo API
      const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: 'KoalaSave Contact', email: 'cqionglei@gmail.com' },
          to: [{ name: 'KoalaSave Support', email: 'support@koalasave.com' }],
          replyTo: { name: name, email: email },
          subject: `KoalaSave Contact: ${name}`,
          htmlContent: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
          `,
        }),
      });

      if (brevoResponse.ok) {
        return new Response('OK', { status: 200 });
      } else {
        const errorText = await brevoResponse.text();
        console.error('Brevo API error:', errorText);
        return new Response('Failed to send email', { status: 500 });
      }
    } catch (err) {
      console.error('Worker error:', err);
      return new Response('Internal error', { status: 500 });
    }
  },
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
