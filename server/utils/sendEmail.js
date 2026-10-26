const nodemailer = require('nodemailer');

/**
 * Dispatch via Brevo HTTPS API (Port 443)
 * Free 300 emails/day, zero outbound port blocks on Render free tier
 */
const sendViaBrevo = async ({ to, code, name, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  try {
    const senderEmail = (process.env.EMAIL_USER || 'nox665reaper@gmail.com').trim();
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey.trim(),
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'CampusTrade IAR', email: senderEmail },
        to: [{ email: to, name: name || 'Student' }],
        subject: `${code} is your CampusTrade verification code`,
        htmlContent,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`[EMAIL SERVICE] Email dispatched via Brevo HTTPS API to ${to} (Message ID: ${data.messageId})`);
      return { success: true, simulated: false, messageId: data.messageId };
    } else {
      console.error(`[BREVO API ERROR]`, data);
      return { success: false, error: data.message || 'Brevo API error' };
    }
  } catch (err) {
    console.error(`[BREVO NETWORK ERROR]`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Dispatch via Resend HTTPS API (Port 443)
 * Free 3,000 emails/month on Render free tier
 */
const sendViaResend = async ({ to, code, name, htmlContent }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CampusTrade <onboarding@resend.dev>',
        to: [to],
        subject: `${code} is your CampusTrade verification code`,
        html: htmlContent,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`[EMAIL SERVICE] Email dispatched via Resend HTTPS API to ${to} (ID: ${data.id})`);
      return { success: true, simulated: false, messageId: data.id };
    } else {
      console.error(`[RESEND API ERROR]`, data);
      return { success: false, error: data.message || 'Resend API error' };
    }
  } catch (err) {
    console.error(`[RESEND NETWORK ERROR]`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Configure Nodemailer transporter.
 * If EMAIL_USER and EMAIL_PASS (App Password) are defined in .env,
 * it delivers genuine emails via Gmail SMTP.
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4, // Force IPv4 routing on cloud hosts (prevents IPv6 connection hang)
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ''), // Strip whitespace from Google 16-character App Passwords
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
};

/**
 * Send 6-digit campus verification OTP email.
 * @param {Object} options - { to, code, name }
 */
const sendVerificationEmail = async ({ to, code, name }) => {
  const transporter = createTransporter();

  // If email credentials are not yet configured in .env, log cleanly and return dev response
  if (!transporter) {
    console.log(`\n==================================================`);
    console.log(`[EMAIL SERVICE - DEV MODE / SIMULATED DISPATCH]`);
    console.log(`To: ${to}`);
    console.log(`Student Name: ${name || 'Student'}`);
    console.log(`Verification OTP: ${code}`);
    console.log(`(To send real Gmails, set EMAIL_USER & EMAIL_PASS in server/.env)`);
    console.log(`==================================================\n`);
    return { success: true, simulated: true, code };
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #1e293b; padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">CampusTrade</h1>
        <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Institute of Advanced Research, Gandhinagar</p>
      </div>
      
      <div style="padding: 32px 24px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">Verify Your Campus Account</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${name || 'Student'}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Welcome to CampusTrade! Please use the following 6-digit verification code to complete your campus account registration:</p>
        
        <div style="background-color: #f1f5f9; border: 2px dashed #3b82f6; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8;">${code}</span>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This verification code is strictly valid for <strong>10 minutes</strong>. If you did not initiate this request, you can safely ignore this email.</p>
        
        <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 18px; text-align: center;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; CampusTrade • Verified Student Marketplace • IAR Gandhinagar</p>
        </div>
      </div>
    </div>
  `;

  // 1. If Brevo API key is configured, send via Brevo HTTPS API (Port 443 - zero block on Render free tier)
  if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim()) {
    const brevoResult = await sendViaBrevo({ to, code, name, htmlContent });
    if (brevoResult && brevoResult.success) {
      return brevoResult;
    }
  }

  // 2. If Resend API key is configured, send via Resend HTTPS API (Port 443 - zero block on Render free tier)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
    const resendResult = await sendViaResend({ to, code, name, htmlContent });
    if (resendResult && resendResult.success) {
      return resendResult;
    }
  }

  const mailOptions = {
    from: `"IAR CampusTrade" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${code} is your CampusTrade verification code`,
    text: `Your CampusTrade verification code is: ${code}. Valid for 10 minutes.`,
    html: htmlContent,
  };

  try {
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            __timeout: true,
            error: 'Google SMTP server did not respond within 8 seconds.',
          }),
        8000
      )
    );

    const raceResult = await Promise.race([sendPromise, timeoutPromise]);
    if (raceResult && raceResult.__timeout) {
      console.warn(`[EMAIL TIMEOUT]`, raceResult.error);
      return { success: false, error: raceResult.error, simulated: true, code };
    }

    console.log(`[EMAIL SERVICE] Real email dispatched to ${to} (Message ID: ${raceResult.messageId})`);
    return { success: true, simulated: false, messageId: raceResult.messageId };
  } catch (error) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send email via Gmail SMTP:`, error.message);
    // Graceful fallback so registration flow doesn't break
    return { success: false, error: error.message, simulated: true, code };
  }
};

module.exports = { sendVerificationEmail };
