"use client";

import Image from "next/image";
import { useState } from "react";

const templates = [
  { id: "restaurant", number: "01", label: "Restaurant", name: "The Pine Table", detail: "Menus, hours, reservations", color: "lime" },
  { id: "trades", number: "02", label: "Trades", name: "Northline Electric", detail: "Services, service area, quote requests", color: "orange" },
  { id: "lodging", number: "03", label: "Lodging", name: "Cedar & Snow", detail: "Rooms, local guide, booking links", color: "blue" },
];

const plans = [
  { name: "Starter", price: "$149", note: "A sharp, focused launch for a new or small business.", features: ["One-page website", "Mobile-ready design", "Contact section", "One revision round"] },
  { name: "Business", price: "$249", note: "A complete online home built around your customers.", featured: true, features: ["Up to 4 pages", "Custom visual direction", "Quote request form", "Two revision rounds"] },
  { name: "Pro", price: "$399", note: "More room, stronger features, and a refined custom build.", features: ["Up to 6 pages", "Booking integration", "Advanced sections", "Three revision rounds"] },
];

function Arrow() { return <span aria-hidden="true">↗</span>; }

export default function Home() {
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const current = templates[active];

  return (
    <main className="home-page">
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Redvyr home"><span className="brand-logo" />REDVYR<span className="brand-dot">.</span></a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? "Close" : "Menu"}</button>
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="/plans" onClick={() => setMenuOpen(false)}>Plans</a>
          <a href="/designs" onClick={() => setMenuOpen(false)}>Designs</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
          <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Let&apos;s talk <Arrow /></a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow"><span /> Web design for growing businesses</div>
        <h1>Websites that<br />mean <em>business.</em></h1>
        <div className="hero-bottom">
          <p>Bold, custom websites made simple—for businesses ready to look professional and grow online.</p>
          <a className="button primary" href="#plans">View plans <Arrow /></a>
        </div>
      </section>

      <section className="proof-strip" aria-label="Service highlights">
        <div className="shell strip-inner"><span>Every screen</span><span className="spark">✦</span><span>Shopping + booking</span><span className="spark">✦</span><span>Tested before launch</span><span className="spark">✦</span><span>Clear starting prices</span></div>
      </section>

      <section className="capabilities shell section" id="capabilities">
        <div className="capabilities-head"><div><p className="kicker">What your website gets</p><h2>More than a page.<br /><i>A working business tool.</i></h2></div><p>Built to look alive, make sense quickly, and give customers an obvious next move.</p></div>

        <div className="capability-grid">
          <article className="cap-card cap-devices">
            <div className="cap-copy"><span>01 / RESPONSIVE</span><h3>Sharp on every screen.</h3><p>Desktop, tablet and phone layouts are designed together.</p></div>
            <Image unoptimized src="/redvyr-assets/responsive-devices.png" alt="Desktop, tablet and phone screens" width={1100} height={987} />
            <b>DESKTOP → MOBILE</b>
          </article>

          <article className="cap-card cap-commerce">
            <div className="cap-copy"><span>02 / CUSTOMER ACTIONS</span><h3>Sell it.<br />Book it.</h3><p>Carts, service requests and booking tools when the business needs them.</p></div>
            <Image unoptimized src="/redvyr-assets/shopping-cart.png" alt="Shopping cart" width={220} height={220} />
            <a href="/designs">Try live demos ↗</a>
          </article>

          <article className="cap-card cap-directions">
            <div className="cap-copy"><span>03 / DESIGN CHOICES</span><h3>More than one way to look good.</h3><p>Compare visual directions, then refine the one that fits.</p></div>
            <Image unoptimized src="/redvyr-assets/rainbow-swoop.png" alt="Colourful design ribbon" width={760} height={289} />
          </article>

          <article className="cap-card cap-code">
            <Image unoptimized src="/redvyr-assets/tested-code.jpg" alt="Web programming code" fill sizes="(max-width: 800px) 100vw, 58vw" />
            <div className="cap-code-shade" />
            <div className="cap-copy"><span>04 / TESTED CODE</span><h3>Checked before anyone clicks.</h3><p>Core pages, forms, links and responsive layouts are reviewed before launch.</p></div>
          </article>

          <article className="cap-card cap-schedule">
            <div className="cap-copy"><span>05 / CLEAR SCHEDULE</span><h3>See progress early.</h3><p>Target: a first homepage direction in about seven days once content is ready.</p></div>
            <Image unoptimized src="/redvyr-assets/project-calendar.png" alt="Project calendar" width={300} height={300} />
          </article>

          <article className="cap-card cap-visible">
            <div className="cap-copy"><span>06 / WEB BASICS</span><h3>Ready to be found.</h3><p>Clean page titles, descriptions, fast contact links and Google-ready structure.</p></div>
            <Image unoptimized src="/redvyr-assets/web-globe.png" alt="Web globe" width={260} height={260} />
          </article>

          <article className="cap-card cap-growth">
            <div className="cap-copy"><span>07 / BUILT TO GROW</span><h3>Start focused.<br />Add more later.</h3></div>
            <Image unoptimized src="/redvyr-assets/growth-chart.png" alt="Growth chart" width={520} height={520} />
            <Image unoptimized className="cap-briefcase" src="/redvyr-assets/business-kit.png" alt="Business toolkit" width={220} height={220} />
          </article>
        </div>
      </section>

      <section className="work shell section" id="work">
        <div className="section-head"><div><p className="kicker">Selected directions</p><h2>Pick a starting point.<br /><i>Make it yours.</i></h2></div><p className="section-copy">These aren’t finished websites with your logo pasted in. They’re visual directions we shape around your actual business, customers, and goals.</p></div>
        <div className="showcase">
          <div className="template-list" role="tablist" aria-label="Template directions">
            {templates.map((item, index) => <button key={item.id} className={active === index ? "active" : ""} onClick={() => setActive(index)} role="tab" aria-selected={active === index}><span>{item.number}</span><strong>{item.label}</strong><small>{item.detail}</small><b>→</b></button>)}
          </div>
          <div className={`browser-mock ${current.color}`} role="tabpanel">
            <div className="browser-bar"><span /><span /><span /><small>redvyr.com/examples/{current.id}</small></div>
            <div className="mock-page">
              <div className="mock-nav"><b>{current.name}</b><span>ABOUT&nbsp;&nbsp; SERVICES&nbsp;&nbsp; CONTACT</span></div>
              <div className="mock-copy"><small>{current.label.toUpperCase()} · WEBSITE CONCEPT</small><h3>{active === 0 ? "Good food. No detours." : active === 1 ? "Powering work that matters." : "Stay close to the wild."}</h3><p>{current.detail}. Simple for customers, easy for you to keep current.</p><a className="mock-demo-link" href={active === 0 ? "/designs/restaurant" : "/designs"}>{active === 0 ? "OPEN LIVE DEMO" : "VIEW DIRECTION"}&nbsp; ↗</a></div>
              <div className="mock-shape"><span>{current.number}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="plans-section" id="plans">
        <div className="shell section"><div className="section-head light"><div><p className="kicker">Simple pricing</p><h2>Know the number<br /><i>before we start.</i></h2></div><p className="section-copy">No mystery invoices. Domain and special software costs are always discussed first and paid separately.</p></div>
          <div className="plans">{plans.map((plan) => <article key={plan.name} className={plan.featured ? "featured" : ""}>{plan.featured && <span className="popular">Best value</span>}<p className="plan-name">{plan.name}</p><div className="price"><small>CAD</small>{plan.price}</div><p className="plan-note">{plan.note}</p><ul>{plan.features.map(f => <li key={f}><span>✓</span>{f}</li>)}</ul><a href="/plans">Build {plan.name} <Arrow /></a></article>)}</div>
          <p className="maintenance">Add extra pages, maintenance, graphics, booking tools, or domain setup when you customize.</p>
        </div>
      </section>

      <section className="process shell section" id="process"><div className="process-intro"><p className="kicker">How it works</p><h2>From idea to online<br />in three clear steps.</h2></div><div className="steps"><article><span>01</span><div><h3>Tell me what you need</h3><p>A quick conversation about your business, customers, content, and the look you want.</p></div></article><article><span>02</span><div><h3>See it take shape</h3><p>You review the design and request changes before anything is considered finished.</p></div></article><article><span>03</span><div><h3>Launch with confidence</h3><p>Your site goes live, works across screen sizes, and is ready to share with customers.</p></div></article></div></section>

      <section className="contact shell" id="contact"><div><p className="kicker">Have a project in mind?</p><h2>Let’s build something<br /><i>worth finding.</i></h2></div><div className="contact-stack"><a className="button dark" href="mailto:help@redvyr.com?subject=Website%20project">help@redvyr.com <Arrow /></a><a href="tel:+12505663732">250-566-3732</a></div></section>
      <footer className="shell"><a className="brand" href="#top"><span className="brand-logo" />REDVYR<span className="brand-dot">.</span></a><p>Independent web design for businesses ready to grow.</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
