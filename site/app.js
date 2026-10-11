import { spinners } from '../src/catalog.ts';
const $ = s => document.querySelector(s);
const state = { color:'#b5a0ff',size:36,speed:1.2,category:'All',query:'',paused:false,selected:null,language:'react' };
const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function markup(spinner,accessible=false){return `<span class="ss-spinner ss-${spinner.id}${state.paused?' ss-paused':''}" style="--ss-size:${state.size}px;--ss-color:${state.color};--ss-speed:${state.speed}s" ${accessible?'role="status" aria-label="Loading"':'aria-hidden="true"'}>${Array.from({length:spinner.count},(_,i)=>`<span aria-hidden="true" style="--ss-i:${i}"></span>`).join('')}</span>`;}
$('#spinner-nav').innerHTML=spinners.map(s=>`<a href="#${s.id}" data-spinner="${s.id}">${s.name}</a>`).join('');
function render(){
 const visible=spinners.filter(s=>(state.category==='All'||s.category===state.category)&&`${s.name} ${s.category}`.toLowerCase().includes(state.query.toLowerCase()));
 $('#grid').innerHTML=visible.map(s=>`<button class="spinner-card" data-spinner="${s.id}" aria-label="Customize ${s.name}"><span class="card-preview">${markup(s)}</span><span class="card-label"><span>${s.name}</span><span aria-hidden="true">↗</span></span></button>`).join('');
 $('#empty').hidden=visible.length>0;
 $('.grid-hint').hidden=visible.length===0;
}
function updatePreview(){document.querySelectorAll('#grid .ss-spinner, #detail-preview .ss-spinner').forEach(s=>{s.style.setProperty('--ss-size',`${state.size}px`);s.style.setProperty('--ss-color',state.color);s.style.setProperty('--ss-speed',`${state.speed}s`);s.classList.toggle('ss-paused',state.paused);});if(state.selected)updateCode();}
function code(){const s=state.selected;if(!s)return '';if(state.language==='react')return `import { ${s.name} } from 'stefans-spinners';\nimport 'stefans-spinners/styles.css';\n\n<${s.name}\n  size={${state.size}}\n  color="${state.color}"\n  speed={${state.speed}}\n  label="Loading"${state.paused?'\n  paused':''}\n/>`;
 return `<!-- Load styles from the installed npm package via your bundler: -->\n<!-- import 'stefans-spinners/styles.css'; -->\n${markup(s,true).replace(/><span/g,'>\n  <span').replace(/<\/span><\/span>$/,'</span>\n</span>')}`;
}
function updateCode(){$('#code').textContent=code();}
function openDetail(id){const s=spinners.find(s=>s.id===id);if(!s)return;state.selected=s;$('#detail-title').textContent=s.name;$('#detail-category').textContent=s.category;$('#detail-description').textContent=s.description;$('#detail-preview').innerHTML=markup(s);$('#detail-position').textContent=`${spinners.indexOf(s)+1} / ${spinners.length}`;updateCode();if(!$('#detail').open)$('#detail').showModal();document.body.style.overflow='hidden';document.querySelectorAll('#spinner-nav a').forEach(a=>a.classList.toggle('nav-active',a.dataset.spinner===id));}
function route(){const id=location.hash.slice(1);if(spinners.some(s=>s.id===id))openDetail(id);else if($('#detail').open)$('#detail').close();}
document.addEventListener('click',e=>{const target=e.target.closest('[data-spinner]');if(target){e.preventDefault();const id=target.dataset.spinner;history.pushState(null,'',`#${id}`);openDetail(id);$('#sidebar').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');}});
window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
$('#close-detail').onclick=()=>$('#detail').close();
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#detail').addEventListener('close',()=>{document.body.style.overflow='';if(spinners.some(s=>s.id===location.hash.slice(1)))history.replaceState(null,'',location.pathname+location.search);state.selected=null;document.querySelectorAll('#spinner-nav a').forEach(a=>a.classList.remove('nav-active'));});
for(const [id,delta] of [['previous',-1],['next',1]])$('#'+id).onclick=()=>{const s=spinners[(spinners.indexOf(state.selected)+delta+spinners.length)%spinners.length];history.replaceState(null,'',`#${s.id}`);openDetail(s.id);};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{state.category=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{const active=x===b;x.classList.toggle('selected',active);x.setAttribute('aria-pressed',String(active));});render();});
for(const key of ['size','speed','color'])$('#'+key).addEventListener('input',e=>{state[key]=key==='color'?e.target.value:Number(e.target.value);$('#'+key+'-value').textContent=key==='color'?state.color.toUpperCase():`${state[key]} ${key==='size'?'px':'s'}`;updatePreview();});
$('#reset').onclick=()=>{for(const [key,value] of Object.entries({color:'#b5a0ff',size:36,speed:1.2})){$('#'+key).value=value;$('#'+key).dispatchEvent(new Event('input'));}};
$('#pause').onclick=()=>{state.paused=!state.paused;$('#pause').setAttribute('aria-pressed',String(state.paused));$('#pause').innerHTML=state.paused?'<span>▷</span> Play':'<span>Ⅱ</span> Pause';document.body.classList.toggle('paused',state.paused);updatePreview();};
function showSearch(){$('#search-row').hidden=false;$('#sidebar').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');$('#search').focus();$('#search-row').scrollIntoView({block:'center',behavior:'smooth'});}
function closeSearch(){state.query='';$('#search').value='';$('#search-row').hidden=true;render();$('#search-trigger').focus();}
$('#search-trigger').onclick=showSearch;$('#search').oninput=e=>{state.query=e.target.value;render();};$('#close-search').onclick=closeSearch;
$('#clear-search').onclick=()=>{state.query='';$('#search').value='';document.querySelector('[data-filter="All"]').click();};
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();if($('#detail').open)$('#detail').close();showSearch();}if(e.key==='Escape'&&!$('#detail').open&&!$('#search-row').hidden)closeSearch();});
$('#menu').onclick=()=>{$('#sidebar').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String($('#sidebar').classList.contains('open')));};
function setTheme(theme){document.documentElement.dataset.theme=theme;$('#theme').textContent=theme==='dark'?'☼':'☾';$('#theme').setAttribute('aria-label',`Switch to ${theme==='dark'?'light':'dark'} theme`);try{localStorage.setItem('ss-theme',theme);}catch{}}
$('#theme').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');try{if(localStorage.getItem('ss-theme'))setTheme(localStorage.getItem('ss-theme'));}catch{}
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2500);}
async function copy(text,button){try{await navigator.clipboard.writeText(text);const before=button.textContent;button.textContent='Copied!';setTimeout(()=>{if(button.isConnected)button.textContent=before;},1800);if(!$('#detail').open)toast('Copied to clipboard');}catch{toast('Could not copy. Select and copy the code manually.');}}
document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copy(b.dataset.copy,b));
$('#copy-code').onclick=()=>copy(code(),$('#copy-code'));$('#copy-link').onclick=()=>copy(location.href,$('#copy-link'));
$('#copy-quick').onclick=()=>copy("import { Orbit } from 'stefans-spinners';\nimport 'stefans-spinners/styles.css';\n\nexport default function App() {\n  return <Orbit size={32} color=\"currentColor\" />;\n}",$('#copy-quick'));
for(const lang of ['react','html'])$('#'+lang+'-tab').onclick=()=>{state.language=lang;$('#react-tab').setAttribute('aria-pressed',String(lang==='react'));$('#html-tab').setAttribute('aria-pressed',String(lang==='html'));updateCode();};
render();route();
