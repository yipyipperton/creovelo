const SERVICES = [
  "Creative Testing Sprint",
  "Monthly Creative Partner",
  "Let’s find the right fit",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hits = new Map();

export function clean(value, max) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function headerSafe(value) {
  return clean(value, 200).replace(/[\r\n]+/g, "");
}

export function isAllowedOrigin(origin, requestUrl) {
  if (!origin) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    const sameHost = host === new URL(requestUrl).hostname;
    return (
      sameHost ||
      host === "creovelo.com" ||
      host === "www.creovelo.com" ||
      host.endsWith(".pages.dev") ||
      host.endsWith(".workers.dev") ||
      host === "localhost" ||
      host === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

export function parseContact(input) {
  if (clean(input.company_website, 200)) {
    return { ok: true, ignored: true };
  }

  const name = clean(input.name, 100);
  const email = headerSafe(input.email).toLowerCase();
  const brand = clean(input.brand, 200);
  const service = SERVICES.includes(input.service) ? input.service : "";
  const goals = clean(input.goals, 3000);

  const errors = [];
  if (name.length < 2) errors.push("Please add your name.");
  if (!EMAIL_PATTERN.test(email)) errors.push("Please add a valid email.");
  if (brand.length < 2) errors.push("Please add your brand or website.");
  if (!service) errors.push("Please choose what you are interested in.");
  if (errors.length) return { ok: false, error: errors[0], status: 400 };

  return {
    ok: true,
    inquiry: {
      name,
      email,
      brand,
      service,
      goals: goals || "I would love to discuss the right creative direction.",
    },
  };
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fromAddress(env) {
  const email = env.CONTACT_FROM || "hello@creovelo.com";
  if (email.includes("<")) return email;
  return `Creovelo <${email}>`;
}

function inboxAddress(env) {
  return env.CONTACT_INBOX || "creovelo719@gmail.com";
}

export function buildInquiry(inquiry) {
  const subject = `Creovelo inquiry — ${inquiry.service}`;
  const text = [
    `New inquiry from ${inquiry.name}`,
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Brand: ${inquiry.brand}`,
    `Interest: ${inquiry.service}`,
    "",
    "What they want to test:",
    inquiry.goals,
    "",
    `Reply directly to this email to reach ${inquiry.name}.`,
  ].join("\n");

  const name = escapeHtml(inquiry.name);
  const email = escapeHtml(inquiry.email);
  const brand = escapeHtml(inquiry.brand);
  const service = escapeHtml(inquiry.service);
  const goals = escapeHtml(inquiry.goals).replace(/\n/g, "<br>");
  const mailto = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(`Re: ${subject}`)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f1e8;color:#192114;font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${name} · ${brand} · ${service}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1e8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#f9f8f1;border:1px solid #d8dccb;">
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid #d8dccb;">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6d7558;">New inquiry</p>
              <p style="margin:0;font-size:28px;line-height:1.15;color:#192114;">creo<span style="color:#6d7a49;">velo</span></p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;">
              <h1 style="margin:0 0 8px;font-size:30px;line-height:1.2;font-weight:normal;">${name}</h1>
              <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#5c6450;">
                ${brand} · ${service}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #d8dccb;">
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #d8dccb;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6d7558;width:120px;">Name</td>
                  <td style="padding:14px 0;border-bottom:1px solid #d8dccb;font-size:16px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #d8dccb;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6d7558;">Email</td>
                  <td style="padding:14px 0;border-bottom:1px solid #d8dccb;font-size:16px;"><a href="mailto:${email}" style="color:#192114;text-decoration:underline;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #d8dccb;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6d7558;">Brand</td>
                  <td style="padding:14px 0;border-bottom:1px solid #d8dccb;font-size:16px;">${brand}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #d8dccb;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6d7558;">Interest</td>
                  <td style="padding:14px 0;border-bottom:1px solid #d8dccb;font-size:16px;">${service}</td>
                </tr>
              </table>
              <p style="margin:28px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6d7558;">What they want to test</p>
              <p style="margin:0 0 28px;font-size:17px;line-height:1.65;color:#192114;">${goals}</p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#192114;">
                    <a href="${mailto}" style="display:inline-block;padding:12px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#f9f8f1;text-decoration:none;">Reply to ${name}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6d7558;">
              Sent from creovelo.com. Reply to this email to continue the conversation with ${name}.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export function tooManyRequests(ip) {
  const key = ip || "unknown";
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const recent = (hits.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= 8) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export function json(body, status = 200, origin = "") {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function rawEmail({ from, to, replyTo, subject, text }) {
  const encoded = /[^\x20-\x7E]/.test(subject)
    ? `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`
    : subject;
  return [
    `From: Creovelo <${from}>`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${encoded}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
  ].join("\r\n");
}

async function sendWithCloudflare(env, inquiry, message) {
  if (!env.EMAIL?.send) return false;
  const from = env.CONTACT_FROM || "hello@creovelo.com";
  const to = inboxAddress(env);
  try {
    await env.EMAIL.send({
      from: { name: "Creovelo", email: from },
      to,
      replyTo: inquiry.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return true;
  } catch {
    try {
      const { EmailMessage } = await import("cloudflare:email");
      await env.EMAIL.send(new EmailMessage(
        from,
        to,
        rawEmail({
          from,
          to,
          replyTo: inquiry.email,
          subject: message.subject,
          text: message.text,
        })
      ));
      return true;
    } catch (error) {
      console.error("Cloudflare email failed", error);
      return false;
    }
  }
}

async function sendWithResend(env, inquiry, message) {
  if (!env.RESEND_API_KEY) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(env),
      to: [inboxAddress(env)],
      reply_to: inquiry.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend failed", response.status, detail);
    return false;
  }
  return true;
}

export async function deliverInquiry(env, inquiry) {
  const message = buildInquiry(inquiry);
  if (await sendWithResend(env, inquiry, message)) return { ok: true };
  if (await sendWithCloudflare(env, inquiry, message)) return { ok: true };
  return {
    ok: false,
    error: "Email sending is not set up on this project yet.",
    status: 503,
  };
}

export async function handleContactRequest(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (request.method === "OPTIONS") {
    const headers = {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (origin) headers["Access-Control-Allow-Origin"] = origin;
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, origin);
  }
  if (!isAllowedOrigin(origin, request.url)) {
    return json({ error: "Forbidden." }, 403, origin);
  }

  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "";
  if (tooManyRequests(ip)) {
    return json({ error: "Please wait a bit before sending another inquiry." }, 429, origin);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Please send the form as JSON." }, 400, origin);
  }

  const parsed = parseContact(payload);
  if (parsed.ignored) return json({ ok: true }, 200, origin);
  if (!parsed.ok) return json({ error: parsed.error }, parsed.status, origin);

  const delivered = await deliverInquiry(env, parsed.inquiry);
  if (!delivered.ok) return json({ error: delivered.error }, delivered.status, origin);
  return json({ ok: true }, 200, origin);
}
