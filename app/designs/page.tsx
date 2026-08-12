import Link from "next/link";

const demos = [
  {
    href: "/designs/restaurant",
    number: "01",
    type: "Restaurant / online ordering",
    title: "Fold & Flame",
    note: "A warm, editorial restaurant concept with a filterable menu, live cart, pickup totals and checkout demonstration.",
    features: ["Menu filters", "Order bag", "Pickup flow"],
    className: "demo-card-food",
  },
  {
    href: "/designs/salon",
    number: "02",
    type: "Salon / appointment booking",
    title: "Kindred Studio",
    note: "A bold salon concept with service selection, stylist matching, available times, reviews and appointment requests.",
    features: ["Service finder", "Booking flow", "Review layout"],
    className: "demo-card-salon",
  },
];

export default function Designs() {
  return (
    <main className="designs-index">
      <div className="designs-nav shell">
        <Link className="brand" href="/"><span className="brand-logo" />REDVYR<span className="brand-dot">.</span></Link>
        <div><Link href="/plans">Plans</Link><Link href="/about">About</Link></div>
      </div>

      <section className="design-index-hero shell">
        <p className="kicker">INTERACTIVE INDUSTRY CONCEPTS</p>
        <h1>Not just a look.<br /><em>A working idea.</em></h1>
        <div className="design-intro"><p>Open a concept and actually use it. These demos show how a customer could order food, book a service, or contact a business—not just how the homepage might look.</p><span>02 LIVE CONCEPTS<br />MORE INDUSTRIES NEXT</span></div>
      </section>

      <section className="demo-index-grid shell">
        {demos.map((demo) => (
          <article className={demo.className} key={demo.href}>
            <div className="demo-card-top"><span>{demo.number}</span><small>{demo.type}</small></div>
            <div className="demo-card-window" aria-hidden="true">
              <div className="demo-window-bar"><i /><i /><i /><b>REDVYR CONCEPT</b></div>
              {demo.number === "01" ? (
                <div className="food-window"><small>FOLD &amp; FLAME</small><strong>Food made<br />close to fire.</strong><span>MENU&nbsp;&nbsp; STORY&nbsp;&nbsp; VISIT</span><i /></div>
              ) : (
                <div className="salon-window"><small>KINDRED <i>studio</i></small><strong>Good hair.<br /><em>Your way.</em></strong><div><span /><span /></div></div>
              )}
            </div>
            <div className="demo-card-copy"><div><h2>{demo.title}</h2><p>{demo.note}</p></div><ul>{demo.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div>
            <Link href={demo.href}>Open interactive demo <span>↗</span></Link>
          </article>
        ))}
      </section>

      <section className="design-photo-offer shell">
        <div><p className="kicker">TRY YOUR BUSINESS INSTEAD</p><h2>A free homepage direction<br /><em>using your own photos.</em></h2></div>
        <div><p>These concepts use fictional brands. For a serious project, REDVYR can prepare a homepage direction around the business’s real photos, services and personality before the full build is approved.</p><Link href="/plans">Build an estimate <span>↗</span></Link></div>
      </section>
    </main>
  );
}
