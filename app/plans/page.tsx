"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 149,
    label: "Get online",
    summary: "A focused one-page launch for a new or small business.",
    features: ["One-page custom website", "Mobile-ready layout", "Contact call-to-action", "One revision round"],
  },
  {
    id: "business",
    name: "Business",
    price: 249,
    label: "Best starting point",
    summary: "A complete business website with room to explain what you do.",
    features: ["Up to four pages", "Custom visual direction", "Quote or contact form", "Two revision rounds"],
    featured: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 399,
    label: "More capability",
    summary: "A larger custom build for services, bookings, or stronger content.",
    features: ["Up to six pages", "Booking integration", "Advanced custom sections", "Three revision rounds"],
  },
] as const;

const addOns = [
  { id: "extraPage", name: "Extra page", detail: "Add another focused page to the site.", price: 15, unit: "each", max: 8 },
  { id: "booking", name: "Booking setup", detail: "Connect a booking or appointment tool.", price: 49 },
  { id: "logo", name: "Logo mini-kit", detail: "A clean wordmark, icon, and export set.", price: 39 },
  { id: "graphics", name: "Custom graphics", detail: "A small set of branded web graphics.", price: 29 },
  { id: "domain", name: "Domain setup", detail: "Connect and configure a custom domain.", price: 25 },
  { id: "care", name: "Annual site care", detail: "Minor text and image updates for one year.", price: 49, unit: "year" },
] as const;

type AddOnId = (typeof addOns)[number]["id"];
type Quantities = Record<AddOnId, number>;

const emptyQuantities: Quantities = {
  extraPage: 0,
  booking: 0,
  logo: 0,
  graphics: 0,
  domain: 0,
  care: 0,
};

const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);

export default function PlansPage() {
  const [planId, setPlanId] = useState<(typeof plans)[number]["id"]>("business");
  const [quantities, setQuantities] = useState<Quantities>(emptyQuantities);
  const [consultOpen, setConsultOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ reference: string; estimatedTotal: number } | null>(null);
  const [form, setForm] = useState({
    name: "",
    business: "",
    email: "",
    phone: "",
    industry: "",
    location: "",
    existingSite: "",
    goals: "",
    paymentPreference: "etransfer",
    contactPreference: "email",
    companyWebsite: "",
  });

  const plan = plans.find((item) => item.id === planId) ?? plans[1];
  const selectedAddOns = useMemo(
    () => addOns
      .filter((item) => quantities[item.id] > 0 && !(planId === "pro" && item.id === "booking"))
      .map((item) => ({ ...item, quantity: quantities[item.id] })),
    [planId, quantities],
  );
  const total = plan.price + selectedAddOns.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function choosePlan(nextPlan: (typeof plans)[number]["id"]) {
    setPlanId(nextPlan);
    document.getElementById("scope-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function adjustAddOn(id: AddOnId, amount: number) {
    const item = addOns.find((candidate) => candidate.id === id)!;
    const max = "max" in item ? item.max : 1;
    setQuantities((current) => ({ ...current, [id]: Math.max(0, Math.min(max, current[id] + amount)) }));
  }

  function beginConsultation() {
    setReceipt(null);
    setError("");
    setConsultOpen(true);
  }

  async function submitConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, addOns: quantities, ...form }),
      });
      const data = (await response.json()) as { reference?: string; estimatedTotal?: number; error?: string };
      if (!response.ok || !data.reference || data.estimatedTotal === undefined) {
        throw new Error(data.error || "The consultation could not be saved. Please try again.");
      }
      setReceipt({ reference: data.reference, estimatedTotal: data.estimatedTotal });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="plans-page">
      <nav className="plans-nav plans-shell" aria-label="Main navigation">
        <Link className="brand" href="/"><span className="brand-logo" />REDVYR<span className="brand-dot">.</span></Link>
        <div>
          <Link href="/designs">Designs</Link>
          <Link href="/about">About</Link>
          <button onClick={beginConsultation}>Start a consultation <span>↗</span></button>
        </div>
      </nav>

      <header className="plans-hero plans-shell">
        <div>
          <p className="plans-kicker"><span /> Clear scope. Clear starting price.</p>
          <h1>Pick a plan.<br /><em>Shape the rest.</em></h1>
        </div>
        <div className="plans-hero-copy">
          <p>Build a starting estimate, then send the details for a free consultation. We confirm the scope before any payment is requested.</p>
          <a href="#packages">Compare packages ↓</a>
        </div>
        <span className="plans-scribble" aria-hidden="true">made to fit</span>
      </header>

      <section className="package-section" id="packages">
        <div className="plans-shell">
          <div className="plans-title-row">
            <div><p className="plans-kicker">01 / Choose a foundation</p><h2>Three ways to start.</h2></div>
            <p>Prices are starting estimates in CAD. Your confirmed quote only changes if the project scope changes.</p>
          </div>
          <div className="package-grid">
            {plans.map((item, index) => (
              <article key={item.id} className={`${"featured" in item && item.featured ? "featured" : ""} ${planId === item.id ? "selected" : ""}`}>
                <div className="package-top"><span>0{index + 1}</span><small>{item.label}</small></div>
                <h3>{item.name}</h3>
                <p className="package-price"><sup>CAD</sup>{money(item.price)}</p>
                <p className="package-summary">{item.summary}</p>
                <ul>{item.features.map((feature) => <li key={feature}><span>+</span>{feature}</li>)}</ul>
                <button onClick={() => choosePlan(item.id)}>{planId === item.id ? "Selected" : `Choose ${item.name}`} <span>↘</span></button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="builder-section" id="scope-builder">
        <div className="plans-shell">
          <div className="plans-title-row builder-title">
            <div><p className="plans-kicker">02 / Customize it</p><h2>Build your starting scope.</h2></div>
            <p>Choose only what the business needs. We’ll confirm any third-party costs—such as a domain or booking subscription—before work begins.</p>
          </div>

          <div className="builder-grid">
            <div className="addon-list">
              {addOns.map((item, index) => {
                const quantity = quantities[item.id];
                const isCounter = item.id === "extraPage";
                const included = planId === "pro" && item.id === "booking";
                return (
                  <article className={quantity ? "active" : ""} key={item.id}>
                    <span className="addon-number">0{index + 1}</span>
                    <div><h3>{item.name}</h3><p>{item.detail}</p></div>
                    <strong>+{money(item.price)}{"unit" in item ? <small> / {item.unit}</small> : null}</strong>
                    <div className="addon-control">
                      {included ? <span className="addon-included">Included in Pro ✓</span> : isCounter ? (
                        <><button aria-label="Remove one extra page" onClick={() => adjustAddOn(item.id, -1)}>−</button><b>{quantity}</b><button aria-label="Add one extra page" onClick={() => adjustAddOn(item.id, 1)}>+</button></>
                      ) : (
                        <button className="add-toggle" aria-pressed={Boolean(quantity)} onClick={() => adjustAddOn(item.id, quantity ? -1 : 1)}>{quantity ? "Added ✓" : "Add +"}</button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="estimate-card">
              <div className="estimate-tag">Live estimate</div>
              <div className="estimate-heading"><span>{plan.name}</span><button onClick={() => document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" })}>Change</button></div>
              <p className="estimate-line"><span>{plan.name} website</span><b>{money(plan.price)}</b></p>
              {selectedAddOns.length ? selectedAddOns.map((item) => (
                <p className="estimate-line" key={item.id}><span>{item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</span><b>{money(item.price * item.quantity)}</b></p>
              )) : <p className="estimate-empty">No extras added yet.</p>}
              <div className="estimate-total"><span>Starting estimate<small>CAD · taxes not included</small></span><strong>{money(total)}</strong></div>
              <button className="estimate-cta" onClick={beginConsultation}>Book free consultation <span>↗</span></button>
              <p className="estimate-note">No payment today. We confirm your needs, final quote, and project timing first.</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="payment-process">
        <div className="plans-shell">
          <div className="plans-title-row light"><div><p className="plans-kicker">03 / Consultation to payment</p><h2>A clean handoff.<br /><em>No surprise charge.</em></h2></div><p>Payment happens only after the scope and price are confirmed. E-transfer is the simplest option; cheque and PayPal can also be arranged.</p></div>
          <div className="payment-steps">
            <article><span>01</span><h3>Send the brief</h3><p>Your selections and project details arrive under one REDVYR reference.</p></article>
            <article><span>02</span><h3>Confirm the quote</h3><p>We discuss the layout, content, schedule, and any outside software costs.</p></article>
            <article><span>03</span><h3>Choose payment</h3><p>Pay the agreed deposit by e-transfer, cheque, or a REDVYR-confirmed PayPal request.</p></article>
            <article><span>04</span><h3>Start the build</h3><p>The confirmed scope becomes the checklist for design, review, and launch.</p></article>
          </div>
        </div>
      </section>

      <footer className="plans-footer plans-shell">
        <Link className="brand" href="/"><span className="brand-logo" />REDVYR<span className="brand-dot">.</span></Link>
        <p>Questions? <a href="mailto:help@redvyr.com">help@redvyr.com</a> · <a href="tel:+12505663732">250-566-3732</a></p>
        <Link href="/designs">See live demos ↗</Link>
      </footer>

      <div className={`consult-shade ${consultOpen ? "open" : ""}`} onClick={() => setConsultOpen(false)} />
      <aside className={`consult-panel ${consultOpen ? "open" : ""}`} aria-hidden={!consultOpen} aria-label="Free website consultation">
        <div className="consult-top">
          <div><p>Free project consultation</p><h2>{receipt ? "Request received." : "Tell us what you’re building."}</h2></div>
          <button aria-label="Close consultation" onClick={() => setConsultOpen(false)}>×</button>
        </div>

        {receipt ? (
          <div className="consult-success">
            <span>✓</span>
            <p className="plans-kicker">Saved successfully</p>
            <h3>{receipt.reference}</h3>
            <p>Your {plan.name} estimate of <strong>{money(receipt.estimatedTotal)} CAD</strong> is saved. REDVYR will use your preferred contact method to confirm the scope and next steps.</p>
            <div><b>What happens next</b><small>Review → conversation → confirmed quote → payment instructions</small></div>
            <button onClick={() => setConsultOpen(false)}>Done</button>
          </div>
        ) : (
          <form className="consult-form" onSubmit={submitConsultation}>
            <div className="consult-order">
              <span><small>Selected plan</small><b>{plan.name}</b></span>
              <span><small>Starting estimate</small><b>{money(total)} CAD</b></span>
            </div>
            <label>Your name<input required maxLength={80} autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Business name<input required maxLength={120} autoComplete="organization" value={form.business} onChange={(event) => setForm({ ...form, business: event.target.value })} /></label>
            <label>Email<input required type="email" maxLength={160} autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Phone or text<input required maxLength={30} autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
            <label>Industry<input required maxLength={80} placeholder="Salon, restaurant, trades…" value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} /></label>
            <label>Location<input required maxLength={100} placeholder="Town / province" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
            <label className="full">Current website <small>(optional)</small><input type="url" maxLength={300} placeholder="https://" value={form.existingSite} onChange={(event) => setForm({ ...form, existingSite: event.target.value })} /></label>
            <label className="full">Describe the business and what the website should do<textarea required minLength={15} maxLength={1200} placeholder="What do you offer? What should customers see, book, buy, or understand? Include any must-have pages or features." value={form.goals} onChange={(event) => setForm({ ...form, goals: event.target.value })} /></label>
            <label>Preferred payment<select value={form.paymentPreference} onChange={(event) => setForm({ ...form, paymentPreference: event.target.value })}><option value="etransfer">E-transfer after quote</option><option value="cheque">Cheque after quote</option><option value="paypal">PayPal request</option><option value="discuss">Discuss it first</option></select></label>
            <label>Contact me by<select value={form.contactPreference} onChange={(event) => setForm({ ...form, contactPreference: event.target.value })}><option value="email">Email</option><option value="text">Text</option><option value="phone">Phone call</option></select></label>
            <label className="consult-honey" aria-hidden="true">Company website<input tabIndex={-1} autoComplete="off" value={form.companyWebsite} onChange={(event) => setForm({ ...form, companyWebsite: event.target.value })} /></label>
            {error && <p className="consult-error" role="alert">{error}</p>}
            <button className="consult-submit" disabled={submitting}>{submitting ? "Saving your request…" : "Send consultation request"}<span>↗</span></button>
            <p className="consult-privacy">Submitting does not commit you to a purchase. Your brief is saved under one reference and sent privately to REDVYR for follow-up.</p>
          </form>
        )}
      </aside>
    </main>
  );
}
