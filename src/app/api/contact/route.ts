import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const name = formData.get('full-name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string || 'Ej angivet';
    const service = formData.get('service') as string || 'Ej angivet';
    const message = formData.get('message') as string || 'Inget meddelande';
    
    const file = formData.get('file-upload') as File | null;
    
    const attachments = [];
    
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer.toString('base64'),
      });
    }
    
    const htmlContent = `
      <h2>Ny förfrågan från kontaktformuläret</h2>
      <p><strong>Namn:</strong> ${name}</p>
      <p><strong>E-post:</strong> ${email}</p>
      <p><strong>Telefon:</strong> ${phone}</p>
      <p><strong>Tjänst:</strong> ${service}</p>
      <p><strong>Meddelande:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;
    
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Global Construction <formularet@globalconstruction.se>',
        to: ['info@globalconstruction.se'],
        reply_to: email,
        subject: `Ny förfrågan via hemsidan: ${service}`,
        html: htmlContent,
        attachments: attachments.length > 0 ? attachments : undefined,
      })
    });
    
    if (!resendRes.ok) {
        const errorData = await resendRes.text();
        console.error('Resend API error:', errorData);
        return NextResponse.json({ error: 'Kunde inte skicka meddelandet' }, { status: resendRes.status });
    }
    
    const data = await resendRes.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Något gick fel internt' }, { status: 500 });
  }
}
