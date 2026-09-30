import{i as e,n as t,r as n,t as r}from"./ui.CwCbUQFq.js";var i={nginx:`nginx.conf (inside server {})`,apache:`.htaccess`,netlify:`_redirects`,vercel:`vercel.json`,caddy:`Caddyfile`},a=e=>e.replace(/[.+?^${}()|[\]\\]/g,`\\$&`);function o(e){let t=[],n=[];return e.split(`
`).forEach((e,r)=>{let i=e.trim();if(!i||i.startsWith(`#`))return;let[a,o,s]=i.split(/\s+/),c=s?Number(s):301;if(!a?.startsWith(`/`)||!o||![301,302,307,308].includes(c))return n.push(r+1);t.push({from:a.replace(/\*$/,``),to:o,code:c,wild:a.endsWith(`*`)})}),{rules:t,bad:n}}var s={nginx:(e,t)=>[t?`if ($host ~* ^www\\.(.+)$) {
    return 301 https://$1$request_uri;
}`:``,...e.map(e=>e.wild?`location ~ ^${a(e.from)}(.*)$ {\n    return ${e.code} ${e.to.replace(`:splat`,`$1`)};\n}`:`location = ${e.from} {\n    return ${e.code} ${e.to};\n}`)].filter(Boolean).join(`

`),apache:(e,t)=>[`RewriteEngine On`,t?`RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
RewriteCond %{HTTP_HOST} ^(?:www\\.)?(.+)$ [NC]
RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]`:``,...e.map(e=>`RewriteRule ^${a(e.from.slice(1))}${e.wild?`(.*)`:``}$ ${e.to.replace(`:splat`,`$1`)} [L,R=${e.code}]`)].filter(Boolean).join(`
`),netlify:(e,t)=>[t?`http://www.example.com/* https://example.com/:splat 301!
https://www.example.com/* https://example.com/:splat 301!`:``,...e.map(e=>`${e.from}${e.wild?`*`:``}  ${e.to}  ${e.code}`)].filter(Boolean).join(`
`),vercel:e=>JSON.stringify({redirects:e.map(e=>({source:e.wild?`${e.from.replace(/\/$/,``)}/:path*`:e.from,destination:e.to.replace(`:splat`,`:path*`),...e.code===301||e.code===308?{permanent:!0}:e.code===302||e.code===307?{permanent:!1}:{}}))},null,2),caddy:(e,t)=>[t?`www.example.com {
    redir https://example.com{uri} permanent
}
`:``,`example.com {`,...e.map(e=>e.wild?`    redir ${e.from}* ${e.to.replace(`:splat`,`{http.request.uri.path.0}`)} ${e.code}`:`    redir ${e.from} ${e.to} ${e.code}`),`}`].filter(Boolean).join(`
`)};n(`rd-tool`,()=>{let n=r(`rd-in`),a=r(`rd-www`),c=r(`rd-error`),l=`nginx`,u=()=>{let{rules:e,bad:t}=o(n.value);r(`rd-out`).textContent=s[l](e,a.checked),r(`rd-file`).textContent=i[l],c.hidden=!t.length,c.textContent=t.length?`Line ${t.join(`, `)}: use "/old /new" with an optional 301, 302, 307 or 308.`:``};e(r(`rd-target`),e=>(l=e,u())),n.addEventListener(`input`,u),a.addEventListener(`change`,u),t(r(`rd-copy`),()=>r(`rd-out`).textContent??``),u()});