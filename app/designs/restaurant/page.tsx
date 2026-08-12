"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";

type Item = { id:number; name:string; detail:string; price:number; category:string; mark:string; photo?:string };
const items:Item[] = [
  {id:1,name:"Flame-Roasted Wings",detail:"Crisp skin, house spice, charred lemon",price:18,category:"Mains",mark:"WG",photo:"/demo-assets/restaurant-wings.png"},
  {id:2,name:"Firehouse Pepperoni",detail:"Red sauce, mozzarella, crisp pepperoni",price:22,category:"Mains",mark:"PZ",photo:"/demo-assets/restaurant-pizza.png"},
  {id:3,name:"House Garden Salad",detail:"Crisp greens, tomato, carrot, cider dressing",price:13,category:"Mains",mark:"SL",photo:"/demo-assets/restaurant-salad.png"},
  {id:4,name:"Fire-Baked Focaccia",detail:"Rosemary, sea salt, whipped butter",price:9,category:"Small plates",mark:"FC"},
  {id:5,name:"Garden Roots",detail:"Beet, carrot, tahini, toasted seed",price:14,category:"Small plates",mark:"GR"},
  {id:6,name:"House Greens",detail:"Apple, aged cheddar, cider dressing",price:13,category:"Small plates",mark:"HG"},
  {id:9,name:"House Red Soda",detail:"Cold, sparkling and served by the can",price:4,category:"Small plates",mark:"SD",photo:"/demo-assets/restaurant-soda.png"},
  {id:7,name:"Dark Chocolate Torte",detail:"Espresso cream, cocoa nib",price:11,category:"Dessert",mark:"DT"},
  {id:8,name:"Warm Apple Cake",detail:"Brown sugar, vanilla, oat crumble",price:10,category:"Dessert",mark:"AC"},
];
const categories=["Mains","Small plates","Dessert"];
const weeklyHours = [
  {day:"Sunday",hours:"10:00 AM–5:00 PM"},
  {day:"Monday",hours:"10:00 AM–5:00 PM"},
  {day:"Tuesday",hours:"10:00 AM–5:00 PM"},
  {day:"Wednesday",hours:"Closed",closed:true},
  {day:"Thursday",hours:"10:00 AM–5:00 PM"},
  {day:"Friday",hours:"10:00 AM–5:00 PM"},
  {day:"Saturday",hours:"10:00 AM–5:00 PM"},
];

export default function RestaurantDemo(){
  const [category,setCategory]=useState("Mains");
  const [cart,setCart]=useState<Record<number,number>>({});
  const [cartOpen,setCartOpen]=useState(false);
  const [checkout,setCheckout]=useState(false);
  const todayName=new Intl.DateTimeFormat("en-US",{weekday:"long",timeZone:"America/Vancouver"}).format(new Date());
  const count=Object.values(cart).reduce((a,b)=>a+b,0);
  const subtotal=useMemo(()=>items.reduce((sum,item)=>sum+(cart[item.id]||0)*item.price,0),[cart]);
  const tax=subtotal*.05;
  const add=(id:number)=>{setCart(c=>({...c,[id]:(c[id]||0)+1}));setCartOpen(true)};
  const change=(id:number,delta:number)=>setCart(c=>{const next={...c};next[id]=(next[id]||0)+delta;if(next[id]<=0)delete next[id];return next});
  return <main className="restaurant-demo">
    <div className="demo-ribbon"><Link href="/designs">← Back to REDVYR designs</Link><span>Interactive concept · not a real restaurant</span></div>
    <header className="rest-head rest-wrap"><a href="#top" className="rest-logo"><span>F</span><strong>FOLD &amp; FLAME</strong></a><nav><a href="#story">Our story</a><a href="#menu">Menu</a><a href="#visit">Visit</a></nav><button className="bag-button" onClick={()=>setCartOpen(true)} aria-label={`Open bag with ${count} items`}>Bag <b>{count}</b></button></header>
    <section className="rest-hero" id="top">
      <div className="rest-wrap hero-content"><p>NEIGHBOURHOOD KITCHEN · OPEN DAILY</p><h1>Honest food.<br/>Proper <em>heat.</em></h1><div className="hero-row"><span>A short seasonal menu, warm service and an easy way to order before you arrive.</span><a href="#menu">Order for pickup ↓</a></div></div>
      <div className="rest-food-hero" aria-hidden="true">
        <Image unoptimized className="rest-hero-wings" src="/demo-assets/restaurant-wings.png" alt="" width={929} height={700}/>
        <span>FRESH / FAST / LOCAL</span>
      </div>
      <div className="hero-grain"/>
    </section>
    <section className="restaurant-service-strip"><div className="rest-wrap"><span><small>PICKUP</small><b>Order online</b></span><span><small>DINE IN</small><b>Walk-ins welcome</b></span><span><small>HOURS</small><b>10–5 · Wed closed</b></span><a href="#visit">Full weekly hours ↘</a></div></section>
    <section className="rest-story rest-wrap" id="story"><p className="rest-index">01 / THE KITCHEN</p><div><h2>A local room with<br/><i>a point of view.</i></h2><p>Fold &amp; Flame is a fictional neighbourhood kitchen shaped by the seasons. The menu stays focused, the room stays relaxed, and every section gives customers a clear next step.</p><div className="story-notes"><span><b>Real photography</b><small>Built around the restaurant’s own food</small></span><span><b>Useful details</b><small>Menu, hours and location up front</small></span><span><b>Easy ordering</b><small>A clean path from dish to pickup</small></span></div></div></section>
    <section className="menu-section" id="menu"><div className="rest-wrap"><div className="menu-title"><div><p className="rest-index">02 / PICKUP MENU</p><h2>Short menu.<br/><i>Easy decision.</i></h2></div><p>Try the interaction: switch categories, add dishes, adjust quantities and continue to the demonstration checkout.</p></div><div className="menu-tabs" role="tablist">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?"active":""} role="tab" aria-selected={category===c}>{c}</button>)}</div><div className="menu-grid">{items.filter(i=>i.category===category).map(item=><article key={item.id}>{item.photo?<div className="dish-photo"><Image unoptimized src={item.photo} alt={item.name} fill sizes="(max-width: 800px) 100vw, 50vw"/><small>FOLD &amp; FLAME / {item.mark}</small></div>:<div className={`dish-art dish-${item.id}`}><small>SEASONAL PLATE / {item.mark}</small><span>{item.mark}</span><i/></div>}<div className="dish-copy"><div><h3>{item.name}</h3><p>{item.detail}</p></div><strong>${item.price}</strong></div><button onClick={()=>add(item.id)}>Add to pickup bag <span>+</span></button></article>)}</div><p className="restaurant-photo-note">Temporary demo photography. A real client build uses the restaurant’s own licensed food photos.</p></div></section>
    <section className="visit" id="visit"><div className="rest-wrap visit-grid"><div className="visit-intro"><p className="rest-index">03 / COME BY</p><h2>Know before<br/>you go.</h2><p>Clear hours, one obvious closed day, and the details customers normally have to hunt for.</p><div className="visit-contact"><span><small>ADDRESS</small><b>18 Foundry Lane<br/>North District</b></span><span><small>CONTACT</small><b>hello@foldandflame.demo<br/>(250) 555-0147</b></span></div></div><div className="hours-card"><div className="hours-head"><div><small>WEEKLY HOURS</small><h3>Plan your visit.</h3></div><span><i/> Updated weekly</span></div><div className="hours-list">{weeklyHours.map(entry=><div key={entry.day} className={`hours-row ${entry.closed?"closed":""} ${todayName===entry.day?"today":""}`}><div><b>{entry.day}</b>{todayName===entry.day&&<small>Today</small>}</div><span>{entry.hours}</span><strong>{entry.closed?"CLOSED":"OPEN"}</strong></div>)}</div><p>Special and holiday hours would appear here when they change.</p></div></div></section>
    <footer className="rest-footer rest-wrap"><strong>FOLD &amp; FLAME</strong><span>Restaurant website concept by REDVYR</span><a href="#top">Back to top ↑</a></footer>
    <div className={`cart-shade ${cartOpen?"open":""}`} onClick={()=>setCartOpen(false)}/>
    <aside className={`cart-drawer ${cartOpen?"open":""}`} aria-hidden={!cartOpen}><div className="cart-top"><div><p>YOUR ORDER</p><h2>Pickup bag <span>{count}</span></h2></div><button onClick={()=>setCartOpen(false)} aria-label="Close cart">×</button></div><div className="cart-body">{count===0?<div className="empty-bag"><span>□</span><h3>Your bag is empty.</h3><p>Add a plate from the menu to get started.</p><button onClick={()=>setCartOpen(false)}>Browse menu</button></div>:items.filter(i=>cart[i.id]).map(item=><div className="cart-line" key={item.id}><span className={`mini-dish dish-${item.id}`}>{item.mark}</span><div><b>{item.name}</b><small>${item.price.toFixed(2)}</small><div className="qty"><button onClick={()=>change(item.id,-1)}>−</button><span>{cart[item.id]}</span><button onClick={()=>change(item.id,1)}>+</button></div></div><strong>${(item.price*cart[item.id]).toFixed(2)}</strong></div>)}</div>{count>0&&<div className="cart-bottom"><p><span>Subtotal</span><b>${subtotal.toFixed(2)}</b></p><p><span>GST</span><b>${tax.toFixed(2)}</b></p><p className="total"><span>Total</span><b>${(subtotal+tax).toFixed(2)}</b></p><button onClick={()=>setCheckout(true)}>Continue to checkout <span>→</span></button><small>Demo only · no payment will be taken</small></div>}</aside>
    {checkout&&<div className="checkout-modal" role="dialog" aria-modal="true" aria-label="Demo checkout"><div className="checkout-card"><button className="checkout-close" onClick={()=>setCheckout(false)}>×</button><p className="rest-index">DEMO CHECKOUT</p><h2>Almost yours.</h2><p>This screen demonstrates the payment layout. It does not process real orders.</p><form onSubmit={e=>e.preventDefault()}><label>Full name<input placeholder="Customer name"/></label><label>Email<input type="email" placeholder="name@example.com"/></label><label>Pickup time<select defaultValue=""><option value="" disabled>Select a time</option><option>As soon as possible</option><option>In 45 minutes</option><option>In 1 hour</option></select></label><div className="fake-payment"><span>•••• •••• •••• 4242</span><b>VISA</b></div><button type="button" onClick={()=>setCheckout(false)}>Finish demo · ${(subtotal+tax).toFixed(2)}</button></form></div></div>}
  </main>
}
