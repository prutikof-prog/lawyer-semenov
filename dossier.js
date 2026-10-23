'use strict';
const menuButton=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
function closeMenu(){nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
document.querySelector('#year').textContent=new Date().getFullYear();
// Photographic wool sections follow the curve; the shadow is drawn independently.
const svgs=[...document.querySelectorAll('[data-thread]')];
function drawThreads(){for(const svg of svgs){const box=svg.getBoundingClientRect();if(!box.width)continue;const pins=[...svg.parentElement.querySelectorAll('.pin')];const points=pins.map(pin=>{const r=pin.getBoundingClientRect();return{x:r.x+r.width/2-box.x,y:r.y+r.height/2-box.y}});const key=[box.width,box.height,...points.flatMap(p=>[p.x.toFixed(1),p.y.toFixed(1)])].join(',');if(key===svg.dataset.shape)continue;svg.dataset.shape=key;svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);const id=svg.dataset.thread;let out=`<defs><radialGradient id="pin-${id}" cx="30%" cy="25%"><stop stop-color="#f5ab86"/><stop offset=".35" stop-color="#ca4931"/><stop offset="1" stop-color="#6b2016"/></radialGradient></defs>`;
const edges=id==='hero'?(innerWidth<=620?[[2,3],[4,5]]:[[0,2],[2,3],[1,4],[4,5]]):points.slice(1).map((_,i)=>[i,i+1]);
for(const [ia,ib] of edges){const a=points[ia],b=points[ib];if(!a||!b)continue;let route=[a,b];if(id==='steps'&&b.y-a.y>100){const side=innerWidth<=620?8:box.width-5;route=[a,{x:side,y:a.y},{x:side,y:b.y},b]};const lengths=route.slice(1).map((p,i)=>Math.hypot(p.x-route[i].x,p.y-route[i].y));const length=lengths.reduce((x,y)=>x+y,0);const curve=t=>{let at=t*length;for(let i=0;i<lengths.length;i++){if(at<=lengths[i]||i===lengths.length-1){const f=at/lengths[i],p=route[i],q=route[i+1];return{x:p.x+(q.x-p.x)*f,y:p.y+(q.y-p.y)*f+Math.sin(Math.PI*f)*Math.min(7,lengths[i]*.015)}}at-=lengths[i]}};const samples=Math.max(2,Math.ceil(length/12));const d=Array.from({length:samples+1},(_,i)=>{const p=curve(i/samples);return(i?'L':'M')+p.x+','+p.y}).join(' ');out+=`<path d="${d}" fill="none" stroke="#0c0907aa" stroke-width="7" transform="translate(3 7)" style="filter:blur(2.5px)"/><path d="${d}" fill="none" stroke="#32140c77" stroke-width="5" transform="translate(1 3)"/>`;
const n=Math.max(1,Math.ceil(length/27));for(let j=0;j<n;j++){const p=curve(j/n),q=curve((j+1)/n),w=Math.hypot(q.x-p.x,q.y-p.y)+.7,angle=Math.atan2(q.y-p.y,q.x-p.x)*180/Math.PI;const sw=w*200/14,sx=(j*sw)%Math.max(1,2172-sw);out+=`<g transform="translate(${p.x} ${p.y}) rotate(${angle})"><svg x="0" y="-7" width="${w}" height="14" viewBox="${sx} 260 ${sw} 200" preserveAspectRatio="none"><image href="assets/yarn.png" width="2172" height="724"/></svg></g>`;}}
for(const p of points){out+=`<ellipse cx="${p.x+3}" cy="${p.y+5}" rx="8" ry="7" fill="#0007" style="filter:blur(2px)"/><circle cx="${p.x}" cy="${p.y}" r="7.5" fill="url(#pin-${id})"/><path d="M${p.x-5},${p.y+1}q4,7 9,1" fill="none" stroke="#d55239" stroke-width="2"/>`;}svg.innerHTML=out;}}
let raf=0,until=0,lastDraw=0;
function followMotion(now){if(now-lastDraw>30){drawThreads();lastDraw=now}if(now<until)raf=requestAnimationFrame(followMotion);else raf=0}
function animateConnections(){until=performance.now()+500;if(!raf)raf=requestAnimationFrame(followMotion)}
document.querySelectorAll('.paper,.polaroid').forEach(el=>{el.addEventListener('pointerenter',animateConnections);el.addEventListener('pointerleave',animateConnections)});
window.addEventListener('load',drawThreads);document.fonts.ready.then(drawThreads);
new ResizeObserver(()=>animateConnections()).observe(document.querySelector('.scene'));
new ResizeObserver(()=>animateConnections()).observe(document.querySelector('.steps'));
document.querySelector('#cookie-settings')?.addEventListener('click',()=>{try{localStorage.removeItem('pns-cookie-consent')}catch{}location.reload()});
