// Email service using nodemailer or a transactional email provider (e.g. Resend, SendGrid)
// Falls back gracefully if SMTP is not configured

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(opts: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'ResearchCall <noreply@researchcall.ci>';

  if (!apiKey) {
    console.warn('âš ï¸  RESEND_API_KEY not set â€” email not sent:', opts.subject, '->', opts.to);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    return res.ok;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

// â”€â”€â”€ Password Reset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const baseUrl = process.env.APP_BASE_URL ?? 'https://app.researchcall.ci';
  const link = `${baseUrl}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: 'RÃ©initialisation de votre mot de passe â€” ResearchCall',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, sans-serif; background: #F8FAFC; margin: 0; padding: 40px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #E2E8F0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 40px; margin-bottom: 8px;">ðŸ”¬</div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0;">ResearchCall</h1>
          </div>
          <h2 style="font-size: 20px; color: #0F172A; margin-bottom: 16px;">RÃ©initialisation du mot de passe</h2>
          <p style="color: #64748B; line-height: 1.6;">
            Vous avez demandÃ© la rÃ©initialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour crÃ©er un nouveau mot de passe.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background: #3B82F6; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block;">
              RÃ©initialiser mon mot de passe
            </a>
          </div>
          <p style="color: #94A3B8; font-size: 13px; line-height: 1.6;">
            Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandÃ© cette rÃ©initialisation, ignorez cet email.
          </p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #CBD5E1; font-size: 12px; text-align: center;">
            ResearchCall â€” L'agrÃ©gateur d'appels scientifiques de l'Afrique francophone
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

// â”€â”€â”€ Welcome Email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Bienvenue sur ResearchCall, ${firstName} !`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, sans-serif; background: #F8FAFC; margin: 0; padding: 40px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #E2E8F0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 40px; margin-bottom: 8px;">ðŸ”¬</div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0;">ResearchCall</h1>
          </div>
          <h2 style="font-size: 20px; color: #0F172A;">Bienvenue, ${firstName} !</h2>
          <p style="color: #64748B; line-height: 1.6;">
            Votre compte ResearchCall est maintenant actif. Vous allez recevoir des alertes personnalisÃ©es basÃ©es sur vos domaines de recherche.
          </p>
          <div style="background: #EFF6FF; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="color: #1D4ED8; font-weight: 700; margin: 0 0 8px;">ðŸŽ¯ Prochaines Ã©tapes</p>
            <ul style="color: #3B82F6; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 6px;">Configurez vos domaines de recherche</li>
              <li style="margin-bottom: 6px;">Explorez les appels disponibles</li>
              <li style="margin-bottom: 6px;">Activez les notifications push</li>
            </ul>
          </div>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #CBD5E1; font-size: 12px; text-align: center;">
            ResearchCall â€” L'agrÃ©gateur d'appels scientifiques de l'Afrique francophone
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

// â”€â”€â”€ Call Moderation Result â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function sendModerationEmail(
  email: string, firstName: string, callTitle: string, approved: boolean, reason?: string,
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Votre appel a Ã©tÃ© ${approved ? 'approuvÃ©' : 'refusÃ©'} â€” ResearchCall`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, sans-serif; background: #F8FAFC; margin: 0; padding: 40px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #E2E8F0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 40px;">${approved ? 'âœ…' : 'âŒ'}</div>
          </div>
          <h2 style="color: #0F172A;">Bonjour ${firstName},</h2>
          <p style="color: #64748B; line-height: 1.6;">
            Votre appel <strong>"${callTitle}"</strong> a Ã©tÃ© <strong>${approved ? 'approuvÃ© et publiÃ©' : 'refusÃ©'}</strong>.
          </p>
          ${reason ? `<div style="background: #FEF2F2; border-radius: 12px; padding: 16px;"><p style="color: #DC2626; margin: 0;">Motif : ${reason}</p></div>` : ''}
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #CBD5E1; font-size: 12px; text-align: center;">ResearchCall</p>
        </div>
      </body>
      </html>
    `,
  });
}