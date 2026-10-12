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

export function buildInquiry(inquiry) {
  const subject = `Creovelo inquiry — ${inquiry.service}`;
  const text = [
    "New Creovelo inquiry",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Brand: ${inquiry.brand}`,
    `Interest: ${inquiry.service}`,
    "",
    "What they want to test:",
    inquiry.goals,
  ].join("\n");
  return { subject, text };
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
  const to = env.CONTACT_INBOX;
  try {
    await env.EMAIL.send({
      from: { name: "Creovelo", email: from },
      to,
      replyTo: inquiry.email,
      subject: message.subject,
      text: message.text,
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
  const from = env.CONTACT_FROM_NAME
    ? `${env.CONTACT_FROM_NAME} <${env.CONTACT_FROM || "hello@creovelo.com"}>`
    : env.CONTACT_FROM || "Creovelo <hello@creovelo.com>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [env.CONTACT_INBOX],
      reply_to: inquiry.email,
      subject: message.subject,
      text: message.text,
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
  if (!env.CONTACT_INBOX) {
    return { ok: false, error: "CONTACT_INBOX is not configured.", status: 503 };
  }
  const message = buildInquiry(inquiry);
  if (await sendWithCloudflare(env, inquiry, message)) return { ok: true };
  if (await sendWithResend(env, inquiry, message)) return { ok: true };
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
