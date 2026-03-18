(function(){
  const c=document.getElementById('stars'),f=document.createDocumentFragment();
  for(let i=0;i<80;i++){
    const s=document.createElement('div');s.className='star';
    const sz=(Math.random()*1.5+0.3).toFixed(1);
    s.style.cssText=`width:${sz}px;height:${sz}px;top:${(Math.random()*100).toFixed(1)}%;left:${(Math.random()*100).toFixed(1)}%;--d:${(Math.random()*4+2).toFixed(1)}s;--delay:-${(Math.random()*6).toFixed(1)}s;--min-op:${(Math.random()*.05+.02).toFixed(2)};--max-op:${(Math.random()*.35+.1).toFixed(2)}`;
    f.appendChild(s);
  }
  c.appendChild(f);
})();
function show(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('nav a').forEach(a=>a.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.getElementById('tab-'+name).classList.add('active');
  window.scrollTo({top:0});
}
function openLb(img){document.getElementById('lbImg').src=img.src;document.getElementById('lb').classList.add('open');}
function closeLb(){document.getElementById('lb').classList.remove('open');}
document.getElementById('lb').addEventListener('click',function(e){if(e.target===this)closeLb();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLb();});
