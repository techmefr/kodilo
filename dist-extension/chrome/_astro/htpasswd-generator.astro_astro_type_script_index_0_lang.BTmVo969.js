import{i as e,n as t,r as n,t as r}from"./ui.CwCbUQFq.js";import{n as i}from"./crypto.D9sWvpjW.js";import{t as a}from"./bcryptjs.iVN69wKK.js";var o={nginx:`location / {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
}`,apache:`<Directory "/var/www/html">
    AuthType Basic
    AuthName "Restricted"
    AuthUserFile /etc/apache2/.htpasswd
    Require valid-user
</Directory>`};n(`hp-tool`,()=>{let n=r(`hp-in`),s=r(`hp-cost`),c=r(`hp-out`),l=`bcrypt`,u=0,d,f=async(e,t)=>{if(l===`sha`){let n=new Uint8Array(await crypto.subtle.digest(`SHA-1`,new TextEncoder().encode(t)));return`${e}:{SHA}${i(n,`base64`)}`}let n=Math.min(14,Math.max(4,Number(s.value)||10));return`${e}:${(await a.hash(t,n)).replace(/^\$2b\$/,`$2y$`)}`},p=async()=>{let e=++u;s.disabled=l!==`bcrypt`;let t=n.value.split(`
`).map(e=>e.trim()).filter(Boolean),r=[];for(let e of t){let t=e.indexOf(`:`);if(t<1){r.push(`# skipped "${e}": use user:password`);continue}r.push(await f(e.slice(0,t),e.slice(t+1)))}e===u&&(c.textContent=r.join(`
`))},m=()=>{clearTimeout(d),d=window.setTimeout(p,250)};e(r(`hp-algo`),e=>{l=e,p()}),e(r(`hp-server`),e=>{r(`hp-conf`).textContent=o[e],r(`hp-conf-title`).textContent=e===`nginx`?`Nginx`:`Apache`}),n.addEventListener(`input`,m),s.addEventListener(`input`,m),t(r(`hp-copy`),()=>c.textContent??``),r(`hp-conf`).textContent=o.nginx,p()});