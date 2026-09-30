import{i as e,n as t,r as n,t as r}from"./ui.CwCbUQFq.js";n(`ng-tool`,()=>{let n=e=>r(e).value.trim(),i=e=>r(e).checked,a=`proxy`,o=()=>{let e=n(`ng-domain`).split(/[\s,]+/).filter(Boolean),t=(e[0]??`example.com`).replace(/^www\./,``),o=i(`ng-https`),s=i(`ng-www`)?[t]:e;r(`ng-upstream-field`).hidden=a!==`proxy`,r(`ng-ws-wrap`).hidden=a!==`proxy`,r(`ng-root-field`).hidden=a===`proxy`;let c=[];o&&i(`ng-redirect`)&&c.push(`server {\n    listen 80;\n    listen [::]:80;\n    server_name ${e.join(` `)};\n\n    location /.well-known/acme-challenge/ {\n        root /var/www/certbot;\n    }\n\n    location / {\n        return 301 https://${i(`ng-www`)?t:`$host`}$request_uri;\n    }\n}`),i(`ng-www`)&&e.some(e=>e.startsWith(`www.`))&&c.push(`server {\n    listen ${o?`443 ssl`:`80`};\n    ${o?`listen [::]:443 ssl;
    http2 on;
    `:``}server_name www.${t};\n${o?`    ssl_certificate /etc/letsencrypt/live/${t}/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/${t}/privkey.pem;\n`:``}    return 301 ${o?`https`:`http`}://${t}$request_uri;\n}`);let l=[];l.push(o?`    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;`:`    listen 80;
    listen [::]:80;`),l.push(`    server_name ${s.join(` `)};`),o&&l.push(`\n    ssl_certificate /etc/letsencrypt/live/${t}/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/${t}/privkey.pem;\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ssl_session_cache shared:SSL:10m;`),l.push(`\n    client_max_body_size ${n(`ng-body`)||`10m`};`),a!==`proxy`&&l.push(`    root ${n(`ng-root`)||`/var/www/html`};\n    index ${a===`php`?`index.php index.html`:`index.html`};`),i(`ng-gzip`)&&l.push(`
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;`),i(`ng-headers`)&&l.push(`\n    add_header X-Content-Type-Options "nosniff" always;\n    add_header X-Frame-Options "SAMEORIGIN" always;\n    add_header Referrer-Policy "strict-origin-when-cross-origin" always;${o?`
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`:``}`),a===`proxy`?l.push(`\n    location / {\n        proxy_pass http://${n(`ng-upstream`)||`127.0.0.1:3000`};\n        proxy_http_version 1.1;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;${i(`ng-ws`)?`
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";`:``}\n        proxy_read_timeout 60s;\n    }`):a===`spa`?l.push(`
    location / {
        try_files $uri $uri/ /index.html;
    }`):a===`static`?l.push(`
    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;`):l.push(`
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    }

    location ~ /\\.(?!well-known) {
        deny all;
    }`),i(`ng-cache`)&&a!==`proxy`&&l.push(`
    location ~* \\.(?:css|js|mjs|woff2?|ttf|svg|png|jpe?g|gif|webp|avif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri =404;
    }`),i(`ng-cache`)&&a===`proxy`&&l.push(`
    location ~* \\.(?:css|js|woff2?|png|jpe?g|webp|avif|svg)$ {
        proxy_pass http://`+(n(`ng-upstream`)||`127.0.0.1:3000`)+`;
        expires 7d;
        add_header Cache-Control "public";
    }`),c.push(`server {\n${l.join(`
`)}\n}`),r(`ng-file`).textContent=`/etc/nginx/sites-available/${t}`,r(`ng-out`).textContent=c.join(`

`),r(`ng-cmd`).textContent=`sudo ln -s /etc/nginx/sites-available/${t} /etc/nginx/sites-enabled/\n${o?`sudo certbot certonly --webroot -w /var/www/certbot ${e.map(e=>`-d ${e}`).join(` `)}\n`:``}sudo nginx -t && sudo systemctl reload nginx`};e(r(`ng-kind`),e=>(a=e,o())),document.querySelectorAll(`#ng-tool ~ .fields input, #ng-tool ~ .toolbar input`).forEach(e=>e.addEventListener(`input`,o)),t(r(`ng-copy`),()=>r(`ng-out`).textContent??``),t(r(`ng-cmd-copy`),()=>r(`ng-cmd`).textContent??``),o()});