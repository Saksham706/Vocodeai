/**
 * Builds a responsive, dark-themed HTML email for VocodeAI password reset OTPs.
 */
export function buildPasswordResetEmailHtml({ firstName, otp, logoUrl }) {
  const safeName = (firstName || "Developer").replace(/[<>&"']/g, "");
  const safeOtp = String(otp || "").replace(/[^0-9A-Za-z]/g, "");
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VocodeAI — Password Reset Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#020B08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E2E8F0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#020B08;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#061419;border:1px solid #13313A;border-radius:18px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.55);">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#00F098 0%,#10B981 50%,#FF7A3D 100%);"></td>
          </tr>

          <!-- Header with Logo & Company Name -->
          <tr>
            <td align="center" style="padding:32px 32px 20px;border-bottom:1px solid #0F272E;background-color:#040F13;">
              <img src="${logoUrl}" alt="VocodeAI" width="150" style="display:block;height:auto;max-width:160px;margin:0 auto 10px;" />
              <div style="font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:#00F098;font-weight:600;">
                VocodeAI Security
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 28px;">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:700;color:#FFFFFF;">
                Password Reset Verification
              </h1>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#9EB6AE;">
                Hi <strong style="color:#FFFFFF;">${safeName}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#9EB6AE;">
                We received a request to reset the password for your <strong style="color:#FFFFFF;">VocodeAI</strong> account. Enter the 6-digit verification code below to complete your password reset:
              </p>

              <!-- OTP Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center" style="padding:20px 16px;background-color:#091D24;border:1px solid #16444E;border-radius:12px;">
                    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7C988E;margin-bottom:8px;font-weight:600;">
                      One-Time Verification Code
                    </div>
                    <div style="font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:800;letter-spacing:8px;color:#00F098;line-height:1.2;">
                      ${safeOtp}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#9EB6AE;">
                This code will expire in <strong style="color:#FFFFFF;">10 minutes</strong> and can only be used once.
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#6E8A82;">
                If you did not request a password reset, you can safely ignore this email—your account and cloud workspaces remain secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 32px 26px;background-color:#040F13;border-top:1px solid #0F272E;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#CBD5E1;">
                VocodeAI &mdash; AI-Powered Cloud IDE &amp; Sandbox Platform
              </p>
              <p style="margin:0;font-size:12px;color:#64748B;">
                &copy; ${year} VocodeAI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
