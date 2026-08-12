"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type Service = { name:string; time:string; price:string; category:string };
const services: Service[] = [
  {name:"Signature cut",time:"60 min",price:"From $54",category:"Cuts"},
  {name:"Clipper cut",time:"40 min",price:"From $38",category:"Cuts"},
  {name:"Wash + blowout",time:"45 min",price:"From $44",category:"Cuts"},
  {name:"Dimensional colour",time:"150 min",price:"Consultation",category:"Colour"},
  {name:"Balayage",time:"180 min",price:"Consultation",category:"Colour"},
  {name:"Root refresh",time:"110 min",price:"From $89",category:"Colour"},
  {name:"Curl shaping",time:"75 min",price:"From $72",category:"Texture"},
  {name:"Smoothing treatment",time:"120 min",price:"From $140",category:"Texture"},
  {name:"Event styling",time:"60 min",price:"From $65",category:"Texture"},
];
const stylists=[{name:"First available",tag:"Fastest opening",initial:"★"},{name:"Mara",tag:"Colour + balayage",initial:"M"},{name:"Noa",tag:"Cuts + texture",initial:"N"}];
const dates=["Wed 12","Thu 13","Fri 14","Sat 15","Tue 18"];
const times=["9:30 AM","11:00 AM","1:15 PM","3:30 PM","5:00 PM"];

export default function SalonDemo(){
  const [category,setCategory]=useState("Cuts");
  const [open,setOpen]=useState(false);
  const [step,setStep]=useState(1);
  const [service,setService]=useState<Service|null>(null);
  const [stylist,setStylist]=useState("First available");
  const [date,setDate]=useState("");
  const [time,setTime]=useState("");
  const [done,setDone]=useState(false);
  const start=(chosen?:Service)=>{if(chosen)setService(chosen);setStep(chosen?2:1);setDone(false);setOpen(true)};
  const canContinue=step===1?!!service:step===2?!!stylist:step===3?!!date&&!!time:true;
  return <main className="salon-demo">
    <div className="salon-ribbon"><Link href="/designs">← Back to REDVYR designs</Link><span>Interactive concept · fictional salon</span></div>
    <header className="salon-head salon-wrap"><a href="#top" className="salon-logo"><strong>KINDRED</strong><i>studio</i></a><nav><a href="#services">Services</a><a href="#work">Our work</a><a href="#reviews">Reviews</a></nav><button onClick={()=>start()}>Book a visit ↗</button></header>
    <section className="salon-hero" id="top"><div className="salon-wrap salon-hero-grid"><div className="salon-hero-copy"><p>INDEPENDENT HAIR STUDIO · EST. 2021</p><h1>Good hair.<br/><em>Your way.</em></h1><span>Sharp cuts, dimensional colour and honest advice—without the intimidating salon energy.</span><button onClick={()=>start()}>Find an appointment <b>↗</b></button></div><div className="salon-hero-images"><figure><Image unoptimized src="/demo-assets/salon-blue-colour.png" alt="Temporary reference showing vivid blue hair colour" width={689} height={768}/><figcaption>COLOUR / 01</figcaption></figure><figure><Image unoptimized src="/demo-assets/salon-wave-cut.png" alt="Temporary reference showing a textured wavy haircut" width={236} height={419}/><figcaption>CUT / 02</figcaption></figure><b className="scribble">made for<br/>real life</b></div></div><div className="salon-marquee"><span>CUTS</span><i>✦</i><span>COLOUR</span><i>✦</i><span>TEXTURE</span><i>✦</i><span>GOOD ENERGY</span></div></section>
    <section className="salon-services salon-wrap" id="services"><div className="salon-section-head"><p>01 / SERVICES</p><div><h2>Start with what<br/><em>you came for.</em></h2><span>Prices shown are starting points. Colour transformations begin with a consultation.</span></div></div><div className="salon-service-tabs">{["Cuts","Colour","Texture"].map(c=><button className={c===category?"active":""} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div><div className="salon-service-list">{services.filter(s=>s.category===category).map((s,i)=><button key={s.name} onClick={()=>start(s)}><span>0{i+1}</span><strong>{s.name}</strong><small>{s.time}</small><b>{s.price}</b><i>→</i></button>)}</div><button className="help-choice" onClick={()=>start({name:"Complimentary consultation",time:"20 min",price:"Free",category:"Consultation"})}><span>Not sure what to book?</span><b>Start with a free consultation →</b></button></section>
    <section className="salon-work" id="work"><div className="salon-wrap"><div className="work-heading"><p>02 / FRESH WORK</p><h2>A little proof.<br/><em>No stock poses.</em></h2></div><div className="salon-gallery"><figure><Image unoptimized src="/demo-assets/salon-cut-reference.png" alt="Temporary short haircut reference" width={500} height={600}/><figcaption><b>TEXTURED CROP</b><span>Cut / taper</span></figcaption></figure><div className="gallery-type"><strong>YOUR<br/>HAIR<br/>IS THE<br/><i>MOOD.</i></strong><span>↘</span></div><figure><Image unoptimized src="/demo-assets/salon-colour-reference.png" alt="Temporary brunette colour reference" width={597} height={745}/><figcaption><b>WARM BRUNETTE</b><span>Colour / gloss</span></figcaption></figure></div><p className="photo-note">Temporary reference imagery for this private demo. Final client sites use salon-owned or licensed photos.</p></div></section>
    <section className="salon-reviews" id="reviews"><div className="salon-wrap"><p>03 / REVIEW LAYOUT</p><div className="review-title"><h2>People leave<br/><em>feeling good.</em></h2><span>★★★★★<br/><small>Example placement for verified Google reviews</small></span></div><div className="review-grid">{["The booking was simple, the consultation felt honest, and I left knowing exactly how to style it.","They listened before touching anything. The whole appointment felt relaxed and completely personal.","Clear pricing, great advice and a cut that still looks right weeks later."].map((r,i)=><blockquote key={r}><span>“</span><p>{r}</p><footer><b>SAMPLE REVIEW 0{i+1}</b><small>DEMO CONTENT</small></footer></blockquote>)}</div></div></section>
    <section className="salon-close"><div className="salon-wrap"><p>READY WHEN YOU ARE</p><h2>Your next good<br/>hair day starts <em>here.</em></h2><button onClick={()=>start()}>Book a visit ↗</button></div></section>
    <footer className="salon-footer salon-wrap"><strong>KINDRED <i>studio</i></strong><span>Salon website concept by REDVYR</span><a href="#top">Back to top ↑</a></footer>

    <div className={`booking-shade ${open?"open":""}`} onClick={()=>setOpen(false)}/>
    <aside className={`booking-panel ${open?"open":""}`} aria-hidden={!open}><div className="booking-top"><div><p>ONLINE BOOKING · DEMO</p><h2>{done?"Request received":"Reserve your visit"}</h2></div><button onClick={()=>setOpen(false)} aria-label="Close booking">×</button></div>{!done&&<div className="booking-progress">{[1,2,3,4].map(n=><span key={n} className={n<=step?"active":""}>{n}</span>)}</div>}
      {done?<div className="booking-done"><b>✓</b><h3>That was smooth.</h3><p>A real salon could receive this request by email or connect the final button to Square, Fresha, Phorest or another booking platform.</p><div><span>{service?.name}</span><span>{stylist}</span><span>{date} · {time}</span></div><button onClick={()=>setOpen(false)}>Finish demo</button></div>:<div className="booking-body">
        {step===1&&<><p className="booking-label">1 / CHOOSE A SERVICE</p><div className="booking-options">{services.slice(0,6).map(s=><button className={service?.name===s.name?"selected":""} onClick={()=>setService(s)} key={s.name}><span><b>{s.name}</b><small>{s.time}</small></span><strong>{s.price}</strong></button>)}</div></>}
        {step===2&&<><p className="booking-label">2 / CHOOSE A STYLIST</p><div className="stylist-options">{stylists.map(s=><button className={stylist===s.name?"selected":""} onClick={()=>setStylist(s.name)} key={s.name}><i>{s.initial}</i><span><b>{s.name}</b><small>{s.tag}</small></span><strong>→</strong></button>)}</div></>}
        {step===3&&<><p className="booking-label">3 / PICK A TIME</p><div className="date-options">{dates.map(d=><button className={date===d?"selected":""} onClick={()=>setDate(d)} key={d}>{d}</button>)}</div><div className="time-options">{times.map(t=><button className={time===t?"selected":""} onClick={()=>setTime(t)} key={t}>{t}</button>)}</div></>}
        {step===4&&<><p className="booking-label">4 / YOUR DETAILS</p><div className="booking-summary"><span><small>SERVICE</small><b>{service?.name}</b></span><span><small>STYLIST</small><b>{stylist}</b></span><span><small>TIME</small><b>{date} · {time}</b></span></div><form onSubmit={e=>{e.preventDefault();setDone(true)}}><label>Name<input required placeholder="Full name"/></label><label>Email<input required type="email" placeholder="name@example.com"/></label><label>Phone<input required type="tel" placeholder="(250) 555-0000"/></label><label>Anything we should know?<textarea placeholder="Optional notes"/></label><button type="submit">Request appointment ↗</button></form></>}
      </div>}
      {!done&&step<4&&<div className="booking-actions"><button onClick={()=>setStep(Math.max(1,step-1))} disabled={step===1}>Back</button><button onClick={()=>setStep(step+1)} disabled={!canContinue}>Continue →</button></div>}
    </aside>
  </main>
}
