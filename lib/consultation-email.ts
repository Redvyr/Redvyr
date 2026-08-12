type AddOn = {
  name: string;
  price: number;
  quantity: number;
};

export type ConsultationEmail = {
  reference: string;
  planName: string;
  estimatedTotal: number;
  addOns: AddOn[];
  customerName: string;
  businessName: string;
  email: string;
  phone: string;
  industry: string;
  location: string;
  existingSite: string;
  goals: string;
  paymentPreference: string;
  contactPreference: string;
};

type RuntimeEmailEnv = {
  RESEND_API_KEY?: string;
  CONSULTATION_FROM_EMAIL?: string;
  CONSULTATION_TO_EMAIL?: string;
};

const paymentLabels: Record<string, string> = {
  etransfer: "E-transfer after quote",
  cheque: "Cheque after quote",
  paypal: "PayPal request",
  discuss: "Discuss it first",
};

const contactLabels: Record<string, string> = {
  email: "Email",
  text: "Text message",
  phone: "Phone call",
};

function htmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dollars(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function textEmail(lead: ConsultationEmail) {
  const addOns = lead.addOns.length
    ? lead.addOns.map((item) => `- ${item.name}${item.quantity > 1 ? ` x ${item.quantity}` : ""}: ${dollars(item.price * item.quantity)}`).join("\n")
    : "- None";

  return `NEW REDVYR CONSULTATION

Reference: ${lead.reference}
Starting estimate: ${dollars(lead.estimatedTotal)} CAD
Plan: ${lead.planName}

CUSTOMER
Name: ${lead.customerName}
Business: ${lead.businessName}
Email: ${lead.email}
Phone: ${lead.phone}
Preferred contact: ${contactLabels[lead.contactPreference] ?? lead.contactPreference}

BUSINESS BRIEF
Industry: ${lead.industry}
Location: ${lead.location}
Current website: ${lead.existingSite || "None provided"}
Payment preference: ${paymentLabels[lead.paymentPreference] ?? lead.paymentPreference}

PROJECT DESCRIPTION
${lead.goals}

ADD-ONS
${addOns}

Reply directly to this email to answer ${lead.customerName}.`;
}

function htmlEmail(lead: ConsultationEmail) {
  const row = (label: string, value: string) => `<tr><td style="padding:8px 12px;color:#777;border-bottom:1px solid #e8e4dc;width:155px">${htmlEscape(label)}</td><td style="padding:8px 12px;font-weight:700;border-bottom:1px solid #e8e4dc">${htmlEscape(value)}</td></tr>`;
  const addOns = lead.addOns.length
    ? lead.addOns.map((item) => `<li style="margin:7px 0">${htmlEscape(item.name)}${item.quantity > 1 ? ` × ${item.quantity}` : ""} — <strong>${htmlEscape(dollars(item.price * item.quantity))}</strong></li>`).join("")
    : '<li style="margin:7px 0">No add-ons selected</li>';

  return `<!doctype html><html><body style="margin:0;background:#f3f0e8;color:#121315;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;padding:28px 18px"><div style="background:#121315;color:#fff;padding:26px"><div style="color:#ef493d;font-size:12px;font-weight:800;letter-spacing:1.4px">NEW REDVYR CONSULTATION</div><h1 style="margin:12px 0 4px;font-size:28px">${htmlEscape(lead.businessName)}</h1><p style="margin:0;color:#aaa">${htmlEscape(lead.reference)} · ${htmlEscape(dollars(lead.estimatedTotal))} CAD starting estimate</p></div><div style="background:#fff;padding:18px"><h2 style="font-size:18px">Customer</h2><table style="border-collapse:collapse;width:100%">${row("Name", lead.customerName)}${row("Business", lead.businessName)}${row("Email", lead.email)}${row("Phone", lead.phone)}${row("Preferred contact", contactLabels[lead.contactPreference] ?? lead.contactPreference)}</table><h2 style="font-size:18px;margin-top:26px">Business brief</h2><table style="border-collapse:collapse;width:100%">${row("Plan", lead.planName)}${row("Industry", lead.industry)}${row("Location", lead.location)}${row("Current website", lead.existingSite || "None provided")}${row("Payment", paymentLabels[lead.paymentPreference] ?? lead.paymentPreference)}</table><h2 style="font-size:18px;margin-top:26px">Project description</h2><p style="white-space:pre-wrap;line-height:1.6;background:#f3f0e8;padding:15px">${htmlEscape(lead.goals)}</p><h2 style="font-size:18px;margin-top:26px">Selected add-ons</h2><ul style="padding-left:20px">${addOns}</ul><a href="mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(`Re: ${lead.reference} — ${lead.businessName}`)}" style="display:block;margin-top:28px;background:#ef493d;color:#121315;text-align:center;text-decoration:none;padding:15px;font-weight:800">Reply to ${htmlEscape(lead.customerName)}</a></div></div></body></html>`;
}

export async function sendConsultationEmail(lead: ConsultationEmail) {
  const { env } = await import("cloudflare:workers");
  const runtime = env as unknown as RuntimeEmailEnv;
  const apiKey = runtime.RESEND_API_KEY?.trim();
  const from = runtime.CONSULTATION_FROM_EMAIL?.trim();
  const to = runtime.CONSULTATION_TO_EMAIL?.trim() || "help@redvyr.com";

  if (!apiKey || !from) {
    return { sent: false, reason: "not_configured" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `consultation-${lead.reference}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: lead.email,
      subject: `New consultation — ${lead.businessName} (${lead.reference})`,
      text: textEmail(lead),
      html: htmlEmail(lead),
      tags: [{ name: "reference", value: lead.reference.replaceAll("-", "_") }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Consultation email failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  return { sent: true, reason: "sent" as const };
}
