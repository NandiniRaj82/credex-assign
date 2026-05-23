import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "audit@stacklens.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://stacklens.app";

export type SendAuditEmailParams = {
  to: string;
  auditSlug: string;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isHighValue: boolean;
  toolCount: number;
};

/**
 * Sends the transactional audit confirmation email via Resend.
 * Gracefully returns false on failure — email sending is never critical path.
 */
export async function sendAuditEmail(
  params: SendAuditEmailParams
): Promise<boolean> {
  const {
    to,
    auditSlug,
    totalMonthlySavings,
    totalAnnualSavings,
    isHighValue,
    toolCount,
  } = params;

  const resultUrl = `${APP_URL}/results/${auditSlug}`;
  const savingsLine =
    totalMonthlySavings > 0
      ? `We found $${totalMonthlySavings.toFixed(0)}/month ($${totalAnnualSavings.toFixed(0)}/year) in potential savings across your ${toolCount} AI tool${toolCount !== 1 ? "s" : ""}.`
      : `Your AI stack looks well-optimised. We'll notify you when new savings opportunities apply to your setup.`;

  const credexLine = isHighValue
    ? `\n\nGiven the size of your savings opportunity, a member of the Credex team will reach out within 2 business days to walk through how AI infrastructure credits could capture even more of that savings.`
    : "";

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: `StackLens <${FROM}>`,
      to,
      subject: isHighValue
        ? `Your AI Spend Audit — $${totalMonthlySavings.toFixed(0)}/mo savings found`
        : "Your AI Spend Audit — StackLens",
      html: buildEmailHtml({
        resultUrl,
        savingsLine,
        credexLine,
        totalMonthlySavings,
        isHighValue,
      }),
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Failed to send audit email:", err);
    return false;
  }
}

function buildEmailHtml(params: {
  resultUrl: string;
  savingsLine: string;
  credexLine: string;
  totalMonthlySavings: number;
  isHighValue: boolean;
}): string {
  const { resultUrl, savingsLine, credexLine, totalMonthlySavings, isHighValue } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Spend Audit</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:16px;border:1px solid #1e1e2e;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f7a5a,#0ea5e9);padding:32px 40px;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">StackLens</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">AI Spend Audit Report</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${totalMonthlySavings > 0 ? `
              <div style="background:rgba(16,217,160,0.1);border:1px solid rgba(16,217,160,0.3);border-radius:12px;padding:24px;margin-bottom:32px;text-align:center;">
                <p style="margin:0;color:#10d9a0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Potential Monthly Savings</p>
                <p style="margin:8px 0 0;color:#fff;font-size:48px;font-weight:800;">$${totalMonthlySavings.toFixed(0)}</p>
              </div>
              ` : ""}
              <p style="margin:0 0 20px;color:#a1a1b5;font-size:16px;line-height:1.6;">${savingsLine}</p>
              ${credexLine ? `<p style="margin:0 0 20px;color:#a1a1b5;font-size:16px;line-height:1.6;">${credexLine}</p>` : ""}
              <div style="text-align:center;margin:32px 0;">
                <a href="${resultUrl}" style="display:inline-block;background:linear-gradient(135deg,#10d9a0,#0ea5e9);color:#000;font-weight:700;font-size:16px;padding:16px 32px;border-radius:8px;text-decoration:none;">View Your Full Report →</a>
              </div>
              ${isHighValue ? `
              <div style="background:rgba(14,165,233,0.1);border:1px solid rgba(14,165,233,0.3);border-radius:12px;padding:20px;margin-top:24px;">
                <p style="margin:0;color:#0ea5e9;font-size:14px;font-weight:600;">🎯 High-Savings Case</p>
                <p style="margin:8px 0 0;color:#a1a1b5;font-size:14px;">Credex sells discounted AI infrastructure credits — Cursor, Claude, ChatGPT Enterprise, and more — sourced from companies that overforecast. Our team will reach out to show you how to capture more of your savings.</p>
              </div>
              ` : ""}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e1e2e;">
              <p style="margin:0;color:#4a4a6a;font-size:12px;text-align:center;">
                Sent by <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#10d9a0;text-decoration:none;">StackLens</a> · A free tool by <a href="https://credex.rocks" style="color:#10d9a0;text-decoration:none;">Credex</a>
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
