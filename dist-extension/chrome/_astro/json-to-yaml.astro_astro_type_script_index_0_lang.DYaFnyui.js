import{i as e,n as t,r as n,t as r}from"./ui.CwCbUQFq.js";var i=/^[A-Za-z_][\w ./-]*$/,a=/^(true|false|yes|no|on|off|null|~|y|n)$/i;function o(e){if(e===null)return`null`;if(typeof e==`number`||typeof e==`boolean`)return String(e);let t=String(e);return t===``||a.test(t)||/^[\d.+-]/.test(t)||!i.test(t)||/\s$/.test(t)?JSON.stringify(t):t}var s=e=>i.test(e)&&!a.test(e)?e:JSON.stringify(e);function c(e,t=2,n=0){let r=` `.repeat(t*n);if(Array.isArray(e))return e.length?e.map(e=>{if(e&&typeof e==`object`&&Object.keys(e).length){let i=c(e,t,n+1).replace(/^\s+/,``);return`${r}- ${i}`}return`${r}- ${c(e,t,n+1)}`}).join(`
`):`[]`;if(e&&typeof e==`object`){let i=Object.entries(e);return i.length?i.map(([e,i])=>i&&typeof i==`object`&&Object.keys(i).length?`${r}${s(e)}:\n${c(i,t,n+1)}`:typeof i==`string`&&i.includes(`
`)?`${r}${s(e)}: |\n${i.split(`
`).map(e=>`${r}${` `.repeat(t)}${e}`).join(`
`)}`:`${r}${s(e)}: ${c(i,t,n+1)}`).join(`
`):`{}`}return o(e)}n(`jy-tool`,()=>{let n=r(`jy-in`),i=r(`jy-doc`),a=2,o=()=>{let e=r(`jy-error`),t=n.value.trim();try{let n;try{n=[JSON.parse(t)]}catch(e){let r=t.split(`
`).filter(e=>e.trim());if(r.length<2)throw e;n=r.map((e,t)=>{try{return JSON.parse(e)}catch{throw Error(`Line ${t+1} is not valid JSON.`)}})}let o=n.map(e=>c(e,a)).join(`
---
`);r(`jy-out`).textContent=`${i.checked||n.length>1?`---
`:``}${o}\n`,e.hidden=!0}catch(t){e.textContent=t.message,e.hidden=!1}};e(r(`jy-indent`),e=>(a=Number(e),o())),[n,i].forEach(e=>e.addEventListener(`input`,o)),t(r(`jy-copy`),()=>r(`jy-out`).textContent??``),o()});