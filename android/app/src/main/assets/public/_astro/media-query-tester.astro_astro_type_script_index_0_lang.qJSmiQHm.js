import{i as e,r as t,t as n}from"./ui.CwCbUQFq.js";var r=`body { font: 15px system-ui, sans-serif; margin: 0; background: #f4f6fb; color: #1d2433; }
.page { display: grid; gap: 16px; padding: 16px; }
.nav { display: flex; gap: 12px; flex-direction: column; }
.card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 4px #0002; transition: transform .2s; }
.card:hover { transform: translateY(-2px); }
.hint::after { content: "Phone layout"; }

@media (min-width: 640px) {
  .nav { flex-direction: row; }
  .hint::after { content: "Tablet layout"; }
}

@media (min-width: 1024px) {
  .page { grid-template-columns: 220px 1fr 1fr; }
  .hint::after { content: "Desktop layout"; }
}

@media (max-width: 480px) and (orientation: portrait) {
  .card { padding: 12px; }
}

@media (orientation: landscape) {
  .page { padding: 24px; }
}

@media (prefers-color-scheme: dark) {
  body { background: #14161f; color: #e6e8ef; }
  .card { background: #22263a; box-shadow: none; }
}

@media (hover: none) {
  .card:hover { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}

@media screen and (width >= 1440px) {
  .page { max-width: 1280px; margin: 0 auto; }
}`,i=`<div class="page">
  <nav class="nav card">
    <strong>Acme</strong>
    <span>Products</span>
    <span>Pricing</span>
    <span>Docs</span>
  </nav>
  <main class="card">
    <h1>Ship faster</h1>
    <p class="hint"></p>
  </main>
  <aside class="card">
    <h2>Changelog</h2>
    <p>Dark mode, faster builds and a new CLI.</p>
  </aside>
</div>`,a=e=>{let t=e.trim().match(/^(-?[\d.]+)(px|em|rem)?$/);return t?Number(t[1])*(t[2]===`em`||t[2]===`rem`?16:1):NaN},o=(e,t,n)=>t===`<`?e<n:t===`<=`?e<=n:t===`>`?e>n:t===`>=`?e>=n:e===n,s={"<":`>`,"<=":`>=`,">":`<`,">=":`<=`,"=":`=`},c=(e,t)=>{let n=e.trim().toLowerCase(),r={width:t.width,height:t.height,"aspect-ratio":t.width/t.height},i=n.match(/^([^<>=]+?)\s*(<=|>=|<|>|=)\s*([^<>=]+?)(?:\s*(<=|>=|<|>|=)\s*([^<>=]+))?$/);if(i){let[,e,t,n,c,l]=i;return l===void 0?e.trim()in r?o(r[e.trim()],t,a(n)):o(r[n.trim()],s[t],a(e)):o(a(e),t,r[n.trim()])&&o(r[n.trim()],c,a(l))}let[c,l=``]=n.split(`:`).map(e=>e.trim()),u=t.width>=t.height?`landscape`:`portrait`;switch(c){case`min-width`:return t.width>=a(l);case`max-width`:return t.width<=a(l);case`width`:return t.width===a(l);case`min-height`:return t.height>=a(l);case`max-height`:return t.height<=a(l);case`height`:return t.height===a(l);case`orientation`:return l===u;case`prefers-color-scheme`:return l===t.scheme;case`prefers-reduced-motion`:return l?l===`reduce`===t.motion:t.motion;case`hover`:case`any-hover`:return l?l===`hover`===t.hover:t.hover;case`pointer`:case`any-pointer`:return!l||l===(t.hover?`fine`:`coarse`);case`color`:return!0;default:return!1}},l=(e,t)=>{let n=e.trim().toLowerCase(),r=!1;n.startsWith(`not `)&&(r=!0,n=n.slice(4)),n=n.replace(/^only\s+/,``);let i=n.split(/\s+and\s+/),a=!0;for(let e of i){let n=e.trim();n.startsWith(`(`)?a&&=c(n.replace(/^\(|\)$/g,``),t):a&&=n===`all`||n===`screen`}return r?!a:a},u=(e,t)=>e.split(`,`).some(e=>l(e,t)),d=e=>{let t=[];for(let n of e.matchAll(/@media\s+([^{]+)\{/g))t.push(n[1].trim());return t},f=e=>{let t=new Set;for(let n of e){for(let e of n.matchAll(/(?:min-width|max-width)\s*:\s*([\d.]+(?:px|em|rem)?)/g))t.add(a(e[1]));for(let e of n.matchAll(/width\s*(?:<=|>=|<|>)\s*([\d.]+(?:px|em|rem)?)/g))t.add(a(e[1]));for(let e of n.matchAll(/([\d.]+(?:px|em|rem)?)\s*(?:<=|>=|<|>)\s*width/g))t.add(a(e[1]))}return[...t].filter(e=>!isNaN(e)).sort((e,t)=>e-t)};t(`mq-tool`,()=>{let t=n(`mq-css`),a=n(`mq-html`),o=n(`mq-width`),s=n(`mq-height`);t.value=r,a.value=i;let c={width:393,height:852,scheme:`light`,hover:!1,motion:!1},l=0,p=()=>{c.width=Number(o.value),c.height=Math.max(200,Number(s.value)||800),n(`mq-width-value`).textContent=`${c.width}px`,n(`mq-orientation`).textContent=`${c.width} × ${c.height} · ${c.width>=c.height?`landscape`:`portrait`}`,document.querySelectorAll(`#mq-presets button`).forEach(e=>{e.setAttribute(`aria-pressed`,String(e.dataset.size===`${c.width}x${c.height}`))});let e=d(t.value),r=e.map(e=>{let t=document.createElement(`li`),n=u(e,c);t.dataset.match=String(n);let r=document.createElement(`code`);r.textContent=`@media ${e}`;let i=document.createElement(`span`);return i.className=`mq-badge`,i.textContent=n?`Matches`:`No match`,t.append(r,i),t}),i=n(`mq-list`);if(r.length)i.replaceChildren(...r);else{let e=document.createElement(`li`);e.textContent=`No @media rules found in the CSS.`,i.replaceChildren(e)}n(`mq-count`).textContent=`${r.filter(e=>e.dataset.match===`true`).length} of ${r.length} match`;let m=f(e),h=Math.max(1920,...m.map(e=>e+80)),g=n(`mq-ruler`),_=m.map(e=>{let t=document.createElement(`button`);return t.className=`mq-tick`,t.style.left=`${e/h*100}%`,t.textContent=`${e}`,t.setAttribute(`aria-label`,`Set width to ${e}px`),t.addEventListener(`click`,()=>{o.value=String(e),p()}),t}),v=document.createElement(`span`);v.className=`mq-marker`,v.style.left=`${c.width/h*100}%`,v.setAttribute(`aria-hidden`,`true`),g.replaceChildren(..._,v),clearTimeout(l),l=window.setTimeout(()=>{let e=t.value.replace(/@media\s+([^{]+)\{/g,(e,t)=>u(t,c)?`@media all {`:`@media not all {`),r=n(`mq-frame`);r.style.width=`${c.width}px`,r.style.height=`${Math.min(c.height,720)}px`,r.srcdoc=`<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>${e}</style></head><body>${a.value}</body></html>`},150)};document.querySelectorAll(`#mq-presets button`).forEach(e=>e.addEventListener(`click`,()=>{let[t,n]=e.dataset.size.split(`x`);o.value=t,s.value=n;let r=Number(t)<1024;c.hover=!r,document.querySelectorAll(`#mq-hover button`).forEach(e=>e.setAttribute(`aria-pressed`,String(e.dataset.value===`hover`==!r))),p()})),e(n(`mq-scheme`),e=>(c.scheme=e,p())),e(n(`mq-hover`),e=>(c.hover=e===`hover`,p())),n(`mq-motion`).addEventListener(`change`,e=>(c.motion=e.target.checked,p())),[t,a,o,s].forEach(e=>e.addEventListener(`input`,p)),n(`mq-reset`).addEventListener(`click`,()=>{t.value=r,a.value=i,p()}),p()});