const nodemailer = require('nodemailer');

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
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ''), // Strip whitespace from Google 16-character App Passwords
    },
    // Strict connection timeouts to prevent hanging Render requests
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
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
            error: 'Google SMTP server did not respond within 5 seconds. Google Workspace accounts may block third-party SMTP access; consider using a personal @gmail.com for EMAIL_USER.',
          }),
        5000
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
