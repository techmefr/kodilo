import{i as e,r as t,t as n}from"./ui.CwCbUQFq.js";var r={normal:[`Normal`,`Typical trichromatic vision.`,null],protanopia:[`Protanopia`,`No red cones. About 1% of men. Reds look dark and merge with greens.`,[.567,.433,0,.558,.442,0,0,.242,.758]],protanomaly:[`Protanomaly`,`Weak red cones. About 1% of men.`,[.817,.183,0,.333,.667,0,0,.125,.875]],deuteranopia:[`Deuteranopia`,`No green cones. About 1% of men. Red and green are hard to tell apart.`,[.625,.375,0,.7,.3,0,0,.3,.7]],deuteranomaly:[`Deuteranomaly`,`Weak green cones, the most common form. About 5% of men.`,[.8,.2,0,.258,.742,0,0,.142,.858]],tritanopia:[`Tritanopia`,`No blue cones. Rare, under 0.01%. Blue and green, yellow and pink get confused.`,[.95,.05,0,0,.433,.567,0,.475,.525]],tritanomaly:[`Tritanomaly`,`Weak blue cones. Very rare.`,[.967,.033,0,0,.733,.267,0,.183,.817]],achromatopsia:[`Achromatopsia`,`No color vision at all. About 1 in 30,000 people.`,[.299,.587,.114,.299,.587,.114,.299,.587,.114]],achromatomaly:[`Achromatomaly`,`Strongly reduced color vision.`,[.618,.32,.062,.163,.775,.062,.163,.32,.516]]},i=`<div class="card">
  <h2>Deploy status</h2>
  <p>
    <span class="badge ok">Passed</span>
    <span class="badge warn">Flaky</span>
    <span class="badge bad">Failed</span>
  </p>
  <div class="bars">
    <i style="height:70%;background:#e53935"></i>
    <i style="height:45%;background:#43a047"></i>
    <i style="height:85%;background:#fb8c00"></i>
    <i style="height:60%;background:#1e88e5"></i>
  </div>
  <ul class="legend">
    <li><b style="background:#e53935"></b>Errors</li>
    <li><b style="background:#43a047"></b>Success</li>
    <li><b style="background:#fb8c00"></b>Retries</li>
    <li><b style="background:#1e88e5"></b>Queued</li>
  </ul>
  <p class="actions">
    <button class="primary">Deploy</button>
    <button class="danger">Roll back</button>
  </p>
  <p class="error">Required field missing</p>
</div>
<style>
  body { font: 15px system-ui, sans-serif; margin: 16px; background: #f4f6fb; color: #1d2433; }
  .card { background: #fff; border-radius: 14px; padding: 16px 20px; box-shadow: 0 2px 10px #0002; max-width: 420px; }
  h2 { margin: 0 0 10px; font-size: 18px; }
  .badge { padding: 3px 10px; border-radius: 99px; font-size: 13px; font-weight: 600; }
  .ok { background: #c8f7d0; color: #1b7a33; }
  .warn { background: #ffe8b3; color: #9a5b00; }
  .bad { background: #ffd0d0; color: #c62828; }
  .bars { display: flex; align-items: end; gap: 10px; height: 90px; margin: 14px 0 8px; }
  .bars i { flex: 1; border-radius: 6px 6px 0 0; }
  .legend { display: flex; flex-wrap: wrap; gap: 12px; padding: 0; list-style: none; font-size: 13px; }
  .legend b { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
  button { border: 0; border-radius: 8px; padding: 8px 14px; font: inherit; color: #fff; }
  .primary { background: #2e7d32; }
  .danger { background: #d32f2f; }
  .error { color: #e53935; margin: 10px 0 0; font-size: 13px; }
</style>
`;t(`cb-tool`,()=>{let t=`html`,a=``,o=`edit`,s=n(`cb-html`);s.value=i;let c=e=>{let n=t===`image`?a?`<img src="${a}" alt="" style="max-width:100%;height:auto;display:block;margin:auto">`:`<p style="font:15px system-ui;color:#555">Choose an image first.</p>`:s.value,i=r[e][2];return i?`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="cb-sim" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="${[0,1,2].map(e=>`${i[e*3]} ${i[e*3+1]} ${i[e*3+2]} 0 0`).join(` `)+` 0 0 0 1 0`}"/></filter></svg><style>html{filter:url(#cb-sim)}</style>${n}`:n},l=e=>{let t=document.createElement(`figure`),n=document.createElement(`iframe`);n.setAttribute(`sandbox`,``),n.title=`${r[e][0]} preview`,n.srcdoc=c(e);let i=document.createElement(`figcaption`);return i.textContent=r[e][0],t.append(n,i),t},u=()=>{let e=o===`edit`;if(n(`cb-edit`).hidden=!e,n(`cb-view`).hidden=e,s.hidden=t!==`html`,n(`cb-drop`).hidden=t!==`image`,n(`cb-edit-title`).textContent=t===`html`?`HTML`:`Image`,n(`cb-reset`).hidden=t!==`html`,n(`cb-tab-edit`).textContent=t===`html`?`HTML`:`Image`,n(`cb-panel`).setAttribute(`aria-labelledby`,`cb-tab-${o}`),e)return;let i=n(`cb-frames`);i.classList.toggle(`all`,o===`all`),o===`all`?(n(`cb-info`).textContent=`Every vision type side by side.`,i.replaceChildren(...Object.keys(r).map(l))):(n(`cb-info`).textContent=r[o][1],i.replaceChildren(l(o)))},d=Array.from(document.querySelectorAll(`#cb-tabs [role="tab"]`)),f=e=>{d.forEach(t=>{t.setAttribute(`aria-selected`,String(t===e)),t.tabIndex=t===e?0:-1}),o=e.dataset.value,u()};d.forEach((e,t)=>{e.addEventListener(`click`,()=>f(e)),e.addEventListener(`keydown`,e=>{let n=e.key===`ArrowRight`?1:e.key===`ArrowLeft`?-1:0;if(!n)return;e.preventDefault();let r=d[(t+n+d.length)%d.length];r.focus(),f(r)})});let p=0;s.addEventListener(`input`,()=>{clearTimeout(p),p=window.setTimeout(u,200)}),n(`cb-reset`).addEventListener(`click`,()=>{s.value=i,u()}),e(n(`cb-source`),e=>{t=e,u()});let m=e=>{if(!e||!e.type.startsWith(`image/`))return;let t=new FileReader;t.onload=()=>{a=String(t.result),n(`cb-drop-text`).textContent=`${e.name} loaded. Pick a vision tab to compare.`,u()},t.readAsDataURL(e)},h=n(`cb-drop`);n(`cb-file`).addEventListener(`change`,e=>m(e.target.files?.[0])),h.addEventListener(`dragover`,e=>{e.preventDefault(),h.classList.add(`over`)}),h.addEventListener(`dragleave`,()=>h.classList.remove(`over`)),h.addEventListener(`drop`,e=>{e.preventDefault(),h.classList.remove(`over`),m(e.dataTransfer?.files[0])}),u()});