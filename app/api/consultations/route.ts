import { getDb } from "../../../db";
import { consultations } from "../../../db/schema";
import { sendConsultationEmail } from "../../../lib/consultation-email";

const packages = {
  starter: { name: "Starter", price: 149 },
  business: { name: "Business", price: 249 },
  pro: { name: "Pro", price: 399 },
} as const;

const addOnPrices = {
  extraPage: { name: "Extra page", price: 15, max: 8 },
  booking: { name: "Booking setup", price: 49, max: 1 },
  logo: { name: "Logo mini-kit", price: 39, max: 1 },
  graphics: { name: "Custom graphics", price: 29, max: 1 },
  domain: { name: "Domain setup", price: 25, max: 1 },
  care: { name: "Annual site care", price: 49, max: 1 },
} as const;

type PackageId = keyof typeof packages;
type AddOnId = keyof typeof addOnPrices;

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function fail(error: string, status = 400) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    if (clean(payload.companyWebsite, 200)) {
      return Response.json({ reference: "RV-RECEIVED", estimatedTotal: 0 }, { status: 201 });
    }

    const planId = clean(payload.planId, 20) as PackageId;
    const selectedPackage = packages[planId];
    if (!selectedPackage) return fail("Please choose a valid website package.");

    const customerName = clean(payload.name, 80);
    const businessName = clean(payload.business, 120);
    const email = clean(payload.email, 160).toLowerCase();
    const phone = clean(payload.phone, 30);
    const industry = clean(payload.industry, 80);
    const location = clean(payload.location, 100);
    const existingSite = clean(payload.existingSite, 300);
    const goals = clean(payload.goals, 1200);
    const paymentPreference = clean(payload.paymentPreference, 30);
    const contactPreference = clean(payload.contactPreference, 20);

    if (!customerName || !businessName || !email || !phone || !industry || !location || goals.length < 15) {
      return fail("Please complete every required field and include a short project description.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email address.");
    if (existingSite && !/^https?:\/\//i.test(existingSite)) return fail("The current website must begin with http:// or https://.");

    const rawAddOns = payload.addOns && typeof payload.addOns === "object" ? payload.addOns as Record<string, unknown> : {};
    const selectedAddOns = (Object.keys(addOnPrices) as AddOnId[]).flatMap((id) => {
      const definition = addOnPrices[id];
      const requested = Number(rawAddOns[id] ?? 0);
      const includedWithPlan = planId === "pro" && id === "booking";
      const quantity = includedWithPlan ? 0 : Number.isFinite(requested) ? Math.max(0, Math.min(definition.max, Math.floor(requested))) : 0;
      return quantity ? [{ id, name: definition.name, price: definition.price, quantity }] : [];
    });
    const estimatedTotal = selectedPackage.price + selectedAddOns.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const reference = `RV-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    const db = await getDb();
    await db.insert(consultations).values({
      id: crypto.randomUUID(),
      reference,
      planId,
      planName: selectedPackage.name,
      basePrice: selectedPackage.price,
      addOnsJson: JSON.stringify(selectedAddOns),
      estimatedTotal,
      customerName,
      businessName,
      email,
      phone,
      industry,
      location,
      existingSite,
      goals,
      paymentPreference,
      contactPreference,
    });

    let notificationSent = false;
    try {
      const notification = await sendConsultationEmail({
        reference,
        planName: selectedPackage.name,
        estimatedTotal,
        addOns: selectedAddOns,
        customerName,
        businessName,
        email,
        phone,
        industry,
        location,
        existingSite,
        goals,
        paymentPreference,
        contactPreference,
      });
      notificationSent = notification.sent;
    } catch (notificationError) {
      console.error("Consultation saved but owner notification failed", {
        reference,
        error: notificationError instanceof Error ? notificationError.message : "Unknown email error",
      });
    }

    return Response.json({ reference, estimatedTotal, notificationSent }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const databaseUnavailable = message.includes("no such table") || message.includes("D1 binding");
    return fail(databaseUnavailable ? "Consultation storage is being connected. Please email help@redvyr.com for now." : "The consultation could not be saved. Please try again.", 500);
  }
}
