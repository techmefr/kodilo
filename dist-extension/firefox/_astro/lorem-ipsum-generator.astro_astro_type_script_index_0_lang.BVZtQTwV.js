import{i as e,n as t,r as n,t as r}from"./ui.CwCbUQFq.js";var i=e=>e.trim().split(/\s+/),a=[{id:`latin`,label:`Classic Latin`,group:`Rendering`,lang:`la`,opening:`Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,words:i(`lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore
			et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea
			commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur
			excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum`)},{id:`french`,label:`French accents`,group:`Rendering`,lang:`fr`,words:i(`à où déjà élève forêt cœur œuvre naïf Noël garçon ça hôpital fenêtre château être après très voilà
			crème brûlée août île maïs façade théâtre rêve fête économie éphémère pêcheur sœur bientôt nœud lumière
			était déçu élégant Zoé Hélène aïeul canoë ambiguë dès lès piqûre gîte cloître événement`)},{id:`malagasy`,label:`Malagasy long words`,group:`Rendering`,lang:`mg`,words:i(`fanatanterahana fampandrosoana fahaleovantena fanabeazana fitsaboana fahasalamana fanorenana
			fampianarana fitantanana fandriampahalemana mpampianatra tanàna fianakaviana fahalalahana fifidianana
			fanjakana andrimpanjakana firenena tanindrazana fitiavana fahendrena fahazavana fanantenana fanompoana
			fitondrana fivoarana fiarahamonina fikambanana fampitaovana manorina mampianatra mandroso miaraka
			amin'ny ary ho an'ny izao rehetra fanamafisana fanatsarana`)},{id:`german`,label:`German compounds`,group:`Rendering`,lang:`de`,words:i(`Donaudampfschifffahrtsgesellschaft Rechtsschutzversicherungsgesellschaften
			Kraftfahrzeughaftpflichtversicherung Geschwindigkeitsbegrenzung Arbeitsunfähigkeitsbescheinigung
			Straßenverkehrsordnung Bundesverfassungsgericht Lebensversicherungsvertrag Überraschungsei
			Fußgängerübergang Größenverhältnis Handschuh Weltanschauung Schadenfreude Zeitgeist Gemütlichkeit
			und der die das mit für über ist wird auch nicht sehr schön groß`)},{id:`cyrillic`,label:`Cyrillic`,group:`Rendering`,lang:`ru`,words:i(`съешь же ещё этих мягких французских булок да выпей чаю любовь город работа время жизнь человек
			солнце дорога окно вода лес небо книга слово друг дом сердце мысль путь звезда ветер утро вечер ночь
			мир свет достопримечательность`)},{id:`arabic`,label:`Arabic (RTL)`,group:`Rendering`,lang:`ar`,dir:`rtl`,comma:`،`,words:i(`كتاب مدرسة الشمس القمر بحر سماء طريق مدينة قلب نور صديق بيت ماء وقت حياة عمل كلمة حب أمل جميل
			كبير صغير في من على مع هذا التي كان يوم الطالب المستقبل`)},{id:`japanese`,label:`Japanese (no spaces)`,group:`Rendering`,lang:`ja`,separator:``,comma:`、`,end:`。`,words:i(`東京 桜 春 雨 空 猫 犬 学校 先生 電車 時間 世界 言葉 心 光 夢 花 山 川 海 友達 音楽 映画 天気 今日
			明日 です ます の に は を が と で`)},{id:`emoji`,label:`Emoji & ZWJ`,group:`Rendering`,lang:`en`,words:i(`🚀 ✨ 🎉 🐱 🐶 🌈 🍕 🔥 💡 🧪 👩‍💻 🏳️‍🌈 👨‍👩‍👧‍👦 🇫🇷 🇯🇵 ❤️ 👍🏽 🧑🏿‍🚀 launch ship build deploy
			test render ready`)},{id:`stress`,label:`Stress test (all scripts)`,group:`Rendering`,lang:`und`,words:[]},{id:`cat`,label:`Cat`,group:`Fun`,lang:`en`,words:i(`meow purr knead nap sunbeam catnip hairball whiskers tuna zoomies scratch box keyboard pounce chirp
			hiss loaf biscuits laser dot yarn windowsill ignore human food bowl empty stare blink tail paws mrrp
			feather knock glass off table sprint litter`)},{id:`dog`,label:`Dog`,group:`Fun`,lang:`en`,words:i(`woof bark fetch ball walkies good boy treat sniff tail wag zoomies belly rubs squirrel park leash
			bone dig howl drool puppy eyes snoot boop heckin doggo pupper chase mailman stick splash puddle nap
			couch borf bork blep fluffy paw`)},{id:`elvish`,label:`Elvish`,group:`Fun`,lang:`sjn`,words:i(`elen síla lúmenn omentielvo mellon galad nín anor ithil gil estel amarth aear ondo calen mallorn
			nai hiruvalyë namárië aiya lasse yavië andúnë mereth edhel naur lanthir faroth gwaith eglerio laurië
			taurë lómë silmë fëa alda`)},{id:`pirate`,label:`Pirate`,group:`Fun`,lang:`en`,words:i(`ahoy matey arr avast booty doubloons plank galleon cutlass parrot grog scallywag landlubber
			starboard port bow stern mast sails treasure map island kraken shiver timbers jolly roger crow's nest
			anchor cannon hoist yo ho rum`)},{id:`robot`,label:`Robot`,group:`Fun`,lang:`en`,words:i(`beep boop bzzt compute servo circuit laser sensor protocol 0101 upgrade reboot kernel
			actuator uplink download sequence override unit charge battery gear bolt signal process execute
			error human friend scanning`)}];a.find(e=>e.id===`stress`).words=a.filter(e=>e.group===`Rendering`&&e.id!==`stress`&&e.id!==`japanese`).flatMap(e=>e.words);var o=e=>e[Math.floor(Math.random()*e.length)],s=(e,t)=>e+Math.floor(Math.random()*(t-e+1));function c(e){let t=e.separator??` `,n=e.comma??`,`,r=s(6,14),i=r>8?s(3,r-3):-1,a=Array.from({length:r},(t,r)=>o(e.words)+(r===i?n:``)).join(t);return a.charAt(0).toLocaleUpperCase(e.lang)+a.slice(1)+(e.end??`.`)}function l(e){return Array.from({length:s(3,6)},()=>c(e))}n(`lorem-tool`,()=>{let n=r(`lorem-out`),i=r(`lorem-count`),s=r(`lorem-opening`),u=r(`lorem-opening-wrap`),d=Array.from(document.querySelectorAll(`.lorem-corpora button`)),f=a[0],p=`paragraphs`,m=`text`,h=[],g=()=>{let e=Math.min(100,Math.max(1,Number(i.value)||1)),t=f.separator??` `;h=p===`paragraphs`?Array.from({length:e},()=>l(f)):p===`sentences`?[Array.from({length:e},()=>c(f))]:[[Array.from({length:e},()=>o(f.words)).join(t)]],f.opening&&s.checked&&p!==`words`&&(h[0][0]=f.opening),v()},_=()=>{let e=f.separator??` `,t=h.map(t=>t.join(e));return m===`html`?t.map(e=>`<p>${e}</p>`).join(`
`):t.join(`

`)},v=()=>{let e=f.separator??` `;n.lang=f.lang,n.dir=f.dir??`ltr`,n.classList.toggle(`code`,m===`html`),m===`html`?n.textContent=_():n.replaceChildren(...h.map(t=>{let n=document.createElement(`p`);return n.textContent=t.join(e),n}));let t=h.map(t=>t.join(e)).join(`

`),i=t.split(/\s+/).filter(Boolean).reduce((e,t)=>t.length>e.length?t:e,``);r(`lorem-stats`).textContent=`${[...t].length} characters · longest word ${[...i.replace(/[.,،。、]/g,``)].length}`};d.forEach(e=>e.addEventListener(`click`,()=>{d.forEach(t=>t.setAttribute(`aria-pressed`,String(t===e))),f=a.find(t=>t.id===e.dataset.value),u.hidden=!f.opening,g()})),e(r(`lorem-unit`),e=>{p=e,g()}),e(r(`lorem-format`),e=>{m=e,v()}),i.addEventListener(`input`,g),s.addEventListener(`change`,g),r(`lorem-regen`).addEventListener(`click`,g),t(r(`lorem-copy`),_),g()});