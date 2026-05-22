(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))p(l);new MutationObserver(l=>{for(const r of l)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&p(d)}).observe(document,{childList:!0,subtree:!0});function a(l){const r={};return l.integrity&&(r.integrity=l.integrity),l.referrerPolicy&&(r.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?r.credentials="include":l.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function p(l){if(l.ep)return;l.ep=!0;const r=a(l);fetch(l.href,r)}})();const v={anthropicKey:"bb_anthropic_key",githubToken:"bb_github_token",githubOwner:"bb_github_owner",githubRepo:"bb_github_repo",githubBranch:"bb_github_branch",emailAddress:"bb_email"};function E(){return{anthropicKey:localStorage.getItem(v.anthropicKey)??"",githubToken:localStorage.getItem(v.githubToken)??"",githubOwner:localStorage.getItem(v.githubOwner)??"",githubRepo:localStorage.getItem(v.githubRepo)??"",githubBranch:localStorage.getItem(v.githubBranch)??"main",emailAddress:localStorage.getItem(v.emailAddress)??""}}function ne(t){for(const[n,a]of Object.entries(v)){const p=t[n];p!==void 0&&localStorage.setItem(a,p)}}function ae(){const t=E();return!!(t.anthropicKey&&t.githubToken&&t.githubOwner&&t.githubRepo)}function se(t){const n=t.paragraphs.map(a=>a.clean||a.raw).filter(Boolean).join(`

`);return`# ${t.name}

${n}
`}const oe="https://api.github.com";async function k(t,n={}){const{githubToken:a,githubOwner:p,githubRepo:l}=E(),r=await fetch(`${oe}/repos/${p}/${l}${t}`,{...n,headers:{Authorization:`Bearer ${a}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...n.headers??{}}});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error((d==null?void 0:d.message)??`GitHub ${r.status}`)}return r.json()}function q(t){return btoa(unescape(encodeURIComponent(t)))}async function N(t,n,a,p){let l;try{l=(await k(`/contents/${t}`)).sha}catch{}await k(`/contents/${t}`,{method:"PUT",body:JSON.stringify({message:a,content:n,branch:p,...l?{sha:l}:{}})})}async function ie(){try{return(await k("/contents/scenes")).filter(n=>n.name.endsWith(".json")).map(n=>n.name.replace(".json",""))}catch{return[]}}async function re(t){try{const n=await k(`/contents/scenes/${t}.json`),a=decodeURIComponent(escape(atob(n.content.replace(/\s/g,""))));return JSON.parse(a)}catch{return null}}async function R(t){const{githubBranch:n}=E();await N(`scenes/${t.slug}.json`,q(JSON.stringify(t,null,2)),`Update scene: ${t.name}`,n),await N(`scenes/${t.slug}.md`,q(se(t)),`Update markdown: ${t.name}`,n)}async function ce(t){const n=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),a={name:t,slug:n,created_at:new Date().toISOString(),paragraphs:[]};return await R(a),a}function le(t){t.innerHTML=`
    <div class="page">
      <header class="page-header">
        <h1>BookBuddy</h1>
        <a href="#/settings" class="icon-btn" title="Settings">⚙</a>
      </header>
      <div class="list-body">
        <div id="scenes-container" class="scenes-loading">
          <span class="spinner"></span>
        </div>
        <div class="new-scene-row">
          <input type="text" id="new-name" class="new-scene-input" placeholder="New scene name…" maxlength="100">
          <button class="btn-primary" id="create-btn">Create</button>
        </div>
      </div>
    </div>
  `;const n=document.getElementById("new-name"),a=document.getElementById("create-btn");if(a.addEventListener("click",()=>l()),n.addEventListener("keydown",r=>{r.key==="Enter"&&l()}),!ae()){document.getElementById("scenes-container").innerHTML=`
      <div class="empty-state">
        <p>Configure your settings to get started.</p>
        <a href="#/settings" class="btn-primary">Open Settings →</a>
      </div>
    `;return}p();async function p(){const r=document.getElementById("scenes-container");if(r)try{const d=await ie();if(!d.length){r.innerHTML='<div class="empty-state"><p>No scenes yet. Create your first one below.</p></div>';return}r.className="scenes-list",r.innerHTML=d.map(g=>`
        <a href="#/scenes/${g}" class="scene-card">
          <span class="scene-name">${de(g)}</span>
          <span>→</span>
        </a>
      `).join("")}catch(d){r.innerHTML=`<div class="error-state">${d.message}</div>`}}async function l(){const r=n.value.trim();if(r){a.disabled=!0,a.textContent="…";try{const d=await ce(r);location.hash=`#/scenes/${d.slug}`}catch(d){alert("Error: "+d.message),a.disabled=!1,a.textContent="Create"}}}}function de(t){return t.replace(/-/g," ").replace(/\b\w/g,n=>n.toUpperCase())}const pe="https://api.anthropic.com/v1/messages";async function K(t,n,a=1024){var d;const{anthropicKey:p}=E(),l=await fetch(pe,{method:"POST",headers:{"x-api-key":p,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","content-type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:a,system:t,messages:[{role:"user",content:n}]})});if(!l.ok){const g=await l.json().catch(()=>({}));throw new Error(((d=g==null?void 0:g.error)==null?void 0:d.message)??`Claude API error ${l.status}`)}return(await l.json()).content[0].text.trim()}async function ue(t,n=""){const a=n?`Previous context:
${n}

---

New dictation to clean up:
${t}`:`Clean up this dictated text:
${t}`;return K(he,a,1024)}async function me(t){try{return(await K(ge,t,300)).split(`
`).filter(Boolean)}catch{return[]}}const he=`You are a prose editor working with a novelist on a draft manuscript.

Your job is to clean up raw dictated or typed text into polished, readable prose. You must:
- Fix grammar, punctuation, and sentence flow
- Remove dictation artifacts ("um", "uh", repeated words, false starts)
- Preserve the author's voice, style, and all narrative choices
- Never advance the plot, add new events, or invent details
- Keep every idea present in the raw input — just express it cleanly
- Split into natural paragraphs where appropriate
- Return ONLY the cleaned prose — no commentary, no meta-text, no "Here is the cleaned version:"

Output one or more prose paragraphs, each separated by a blank line. Nothing else.`,ge=`You are a writing coach helping a novelist get back into their story.

Given recent draft content, generate 3 short questions that will help the writer re-engage with the scene. Questions should be about character motivation, sensory details, or what happens next. Be specific to the actual content — no generic advice.

Output exactly 3 questions, one per line, no numbering, no extra text.`;function fe(t){const n=E();t.innerHTML=`
    <div class="page">
      <header class="page-header">
        <a href="#/" class="back-btn">← Scenes</a>
        <h1>Settings</h1>
      </header>
      <div class="settings-body">

        <section class="settings-section">
          <h2>AI — Anthropic</h2>
          <p class="settings-help">Stored in this browser only. <a href="https://console.anthropic.com" target="_blank" rel="noopener">Get a key →</a></p>
          <label class="field">
            <span>API Key</span>
            <input type="password" id="s-anthropic" value="${w(n.anthropicKey)}" placeholder="sk-ant-…" autocomplete="off">
          </label>
        </section>

        <section class="settings-section">
          <h2>GitHub Storage</h2>
          <p class="settings-help">Scenes save as <code>.json</code> + <code>.md</code> files. <a href="https://github.com/settings/tokens/new?scopes=repo&description=BookBuddy" target="_blank" rel="noopener">Create a token →</a></p>
          <label class="field">
            <span>Personal Access Token</span>
            <input type="password" id="s-gh-token" value="${w(n.githubToken)}" placeholder="ghp_…" autocomplete="off">
          </label>
          <label class="field">
            <span>Owner</span>
            <input type="text" id="s-gh-owner" value="${w(n.githubOwner)}" placeholder="your-username">
          </label>
          <label class="field">
            <span>Repository</span>
            <input type="text" id="s-gh-repo" value="${w(n.githubRepo)}" placeholder="my-novel">
          </label>
          <label class="field">
            <span>Branch</span>
            <input type="text" id="s-gh-branch" value="${w(n.githubBranch)}" placeholder="main">
          </label>
        </section>

        <section class="settings-section">
          <h2>Daily Email</h2>
          <p class="settings-help">Set <code>ANTHROPIC_API_KEY</code>, <code>RESEND_API_KEY</code>, and <code>EMAIL_ADDRESS</code> as secrets in your GitHub repo to enable the daily questions workflow.</p>
          <label class="field">
            <span>Your Email</span>
            <input type="email" id="s-email" value="${w(n.emailAddress)}" placeholder="you@example.com">
          </label>
        </section>

        <button class="btn-primary full-width" id="s-save">Save</button>
      </div>
    </div>
  `,document.getElementById("s-save").addEventListener("click",()=>{ne({anthropicKey:y("s-anthropic"),githubToken:y("s-gh-token"),githubOwner:y("s-gh-owner"),githubRepo:y("s-gh-repo"),githubBranch:y("s-gh-branch")||"main",emailAddress:y("s-email")}),x("Settings saved")})}function y(t){return document.getElementById(t).value.trim()}function w(t){return t.replace(/"/g,"&quot;")}function x(t){const n=document.createElement("div");n.className="toast",n.textContent=t,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("toast-show")),setTimeout(()=>{n.classList.remove("toast-show"),setTimeout(()=>n.remove(),300)},2200)}async function be(t,n){t.innerHTML=`
    <div class="editor-page">
      <header class="editor-header">
        <a href="#/" class="back-btn">←</a>
        <h1 id="scene-title" class="editor-title">Loading…</h1>
        <div class="header-actions">
          <button class="icon-btn" id="theme-btn" title="Toggle theme"></button>
          <button class="icon-btn" id="warmup-btn" title="Writing prompts">✦</button>
        </div>
      </header>

      <div id="draft-scroll" class="draft-scroll">
        <div id="draft-paras"></div>
      </div>

      <div id="composer" class="composer">
        <div id="edit-banner" class="edit-banner hidden">
          <span class="edit-banner-label">Editing paragraph</span>
          <button id="cancel-edit-btn" class="cancel-edit-btn">Cancel</button>
        </div>
        <textarea id="compose-input" class="compose-input" placeholder="Write here…" rows="1"></textarea>
        <div class="compose-actions">
          <button id="compose-add" class="btn-ghost compose-btn" disabled>Add</button>
          <button id="compose-polish" class="btn-amber compose-btn" disabled>Polish ✦</button>
        </div>
      </div>

      <div id="review-sheet" class="review-sheet hidden">
        <div class="review-header">
          <span class="review-ai-label">✦ Polished</span>
          <button class="icon-btn" id="discard-review-btn">✕</button>
        </div>
        <div id="review-text" class="review-text" contenteditable="true" spellcheck="true"></div>
        <div class="review-footer">
          <button id="commit-review-btn" class="btn-amber full-width">Add to draft</button>
        </div>
      </div>

      <div id="warmup-panel" class="sheet hidden">
        <div class="sheet-header">
          <span class="sheet-label">Writing prompts</span>
          <button class="icon-btn" id="close-warmup">✕</button>
        </div>
        <div id="warmup-body" class="warmup-body"></div>
      </div>
    </div>
  `;let a=null,p=null,l=!1;const r=new Set;try{a=await re(n)}catch(e){t.innerHTML=`<div class="error-state">Failed to load: ${e.message}</div>`;return}if(!a){t.innerHTML='<div class="error-state">Scene not found.</div>';return}document.getElementById("scene-title").textContent=a.name,d(),D(),V(),Z(),ee(),Q();function d(){var o;const e=document.getElementById("draft-paras");if(!a.paragraphs.length){e.innerHTML='<p class="draft-empty">Start writing below.</p>';return}e.innerHTML=a.paragraphs.map(g).join(""),r.forEach(i=>{const c=e.querySelector(`[data-pid="${i}"] .para-track`);c&&(c.style.transition="none",c.classList.add("is-open"),requestAnimationFrame(()=>{c.style.transition=""}))}),p&&((o=e.querySelector(`[data-pid="${p}"]`))==null||o.classList.add("is-editing")),e.querySelectorAll(".para-edit-btn").forEach(i=>{i.addEventListener("click",c=>{var u;c.stopPropagation();const s=(u=i.closest("[data-pid]"))==null?void 0:u.dataset.pid;s&&z(s)})})}function g(e){return e.type==="ai"&&e.raw&&e.raw!==e.clean?`
        <div class="para-wrap ai-para" data-pid="${e.pid}">
          <div class="para-outer">
            <div class="para-track">
              <div class="para-face para-polished">
                <div class="accent-bar accent-amber"></div>
                <p class="para-text">${S(e.clean)}</p>
              </div>
              <div class="para-face para-original">
                <div class="accent-bar accent-blue"></div>
                <p class="para-text para-orig-text">${S(e.raw)}</p>
              </div>
            </div>
          </div>
          <button class="para-edit-btn" title="Edit paragraph">✎</button>
        </div>`:`
      <div class="para-wrap" data-pid="${e.pid}">
        <p class="para-text">${S(e.clean||e.raw)}</p>
        <button class="para-edit-btn" title="Edit paragraph">✎</button>
      </div>`}function D(){const e=document.getElementById("compose-input"),o=document.getElementById("compose-add"),i=document.getElementById("compose-polish");e.addEventListener("input",()=>{A(e);const c=e.value.trim().length>0;o.disabled=!c,i.disabled=!c}),o.addEventListener("click",F),i.addEventListener("click",U),document.getElementById("cancel-edit-btn").addEventListener("click",M),document.getElementById("commit-review-btn").addEventListener("click",W),document.getElementById("discard-review-btn").addEventListener("click",G)}function A(e){e.style.height="auto",e.style.height=Math.min(e.scrollHeight,200)+"px"}async function U(){const o=document.getElementById("compose-input").value.trim();if(o){I(!0);try{const i=a.paragraphs.slice(-3).map(s=>s.clean||s.raw).join(`

`),c=await ue(o,i);X(c)}catch(i){x("AI error: "+i.message),I(!1)}}}function F(){const o=document.getElementById("compose-input").value.trim();o&&(p?P(p,o,o,"typed"):J({pid:crypto.randomUUID(),raw:o,clean:o,type:"typed",created_at:new Date().toISOString()}),C())}function W(){const e=document.getElementById("compose-input"),o=document.getElementById("review-text"),i=e.value.trim(),c=o.innerText.trim();O(),I(!1);const s=c.split(/\n\n+/).filter(Boolean),u=new Date().toISOString();p?P(p,i,c,"ai"):(s.forEach((b,m)=>{a.paragraphs.push({pid:crypto.randomUUID(),raw:m===0?i:"",clean:b.trim(),type:"ai",created_at:u})}),d(),_(),$()),C()}function G(){O(),I(!1)}function I(e){const o=document.getElementById("compose-input"),i=document.getElementById("compose-add"),c=document.getElementById("compose-polish");o.disabled=e,i.disabled=e,c.disabled=e,c.textContent=e?"…":"Polish ✦"}function C(){const e=document.getElementById("compose-input");e.value="",e.style.height="",e.disabled=!1,document.getElementById("compose-add").disabled=!0,document.getElementById("compose-add").textContent="Add",document.getElementById("compose-polish").disabled=!0,document.getElementById("compose-polish").textContent="Polish ✦",M()}function X(e){const o=document.getElementById("review-sheet");document.getElementById("review-text").innerText=e,o.classList.remove("hidden"),requestAnimationFrame(()=>requestAnimationFrame(()=>o.classList.add("is-visible")))}function O(){const e=document.getElementById("review-sheet");e.classList.remove("is-visible"),e.addEventListener("transitionend",()=>e.classList.add("hidden"),{once:!0})}function z(e){var u,b;const o=a.paragraphs.find(m=>m.pid===e);if(!o)return;p=e;const i=document.getElementById("compose-input");i.value=o.clean||o.raw,A(i);const c=document.getElementById("compose-add"),s=document.getElementById("compose-polish");c.textContent="Save",c.disabled=!1,s.disabled=!1,document.getElementById("edit-banner").classList.remove("hidden"),document.querySelectorAll(".para-wrap").forEach(m=>m.classList.remove("is-editing")),(u=document.querySelector(`[data-pid="${e}"]`))==null||u.classList.add("is-editing"),i.focus(),i.setSelectionRange(i.value.length,i.value.length),(b=document.getElementById("composer"))==null||b.scrollIntoView({behavior:"smooth",block:"nearest"})}function M(){p=null,document.getElementById("edit-banner").classList.add("hidden"),document.querySelectorAll(".para-wrap").forEach(e=>e.classList.remove("is-editing")),document.getElementById("compose-add").textContent="Add"}function P(e,o,i,c){const s=a.paragraphs.findIndex(u=>u.pid===e);s!==-1&&(a.paragraphs[s]={...a.paragraphs[s],raw:o,clean:i,type:c},r.delete(e),d(),$())}function J(e){a.paragraphs.push(e),d(),_(),$()}function $(){l||!a||(l=!0,R(a).then(()=>x("Saved")).catch(e=>x("Save failed: "+e.message)).finally(()=>{l=!1}))}function _(){const e=document.getElementById("draft-scroll");e&&(e.scrollTop=e.scrollHeight)}function V(){const e=document.getElementById("draft-scroll");let o=0,i=0,c=0,s=null,u=0,b=0,m=!1;e.addEventListener("touchstart",f=>{const h=f.target.closest(".ai-para");h&&(s=h.querySelector(".para-track"),s&&(o=f.touches[0].clientX,i=f.touches[0].clientY,c=Date.now(),u=s.parentElement.offsetWidth,b=s.classList.contains("is-open")?-u:0,m=!1))},{passive:!0}),e.addEventListener("touchmove",f=>{if(!s)return;const h=f.touches[0].clientX-o,T=f.touches[0].clientY-i;if(!m){if(Math.abs(h)<6&&Math.abs(T)<6)return;if(Math.abs(T)>Math.abs(h)){s=null;return}m=!0,s.style.transition="none"}const B=Math.max(-u,Math.min(0,b+h));s.style.transform=`translateX(${B}px)`},{passive:!0}),e.addEventListener("touchend",f=>{var j;if(!s||!m){s=null;return}const h=f.changedTouches[0].clientX-o,B=Math.abs(h)/(Date.now()-c)>.4?12:u*.28,H=s.classList.contains("is-open")?h>-B:h<-B,te=H?-u:0;s.style.transition="transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)",s.style.transform=`translateX(${te}px)`;const L=(j=s.closest("[data-pid]"))==null?void 0:j.dataset.pid;s.addEventListener("transitionend",()=>{s&&(s.style.transition="",s.style.transform="",H?(s.classList.add("is-open"),L&&r.add(L)):(s.classList.remove("is-open"),L&&r.delete(L)))},{once:!0}),s=null,m=!1},{passive:!0})}function Q(){const e=window.visualViewport;if(!e)return;const o=document.getElementById("composer"),i=document.getElementById("review-sheet"),c=document.getElementById("draft-scroll"),s=()=>{const u=Math.max(0,window.innerHeight-(e.offsetTop+e.height));o.style.bottom=`${u}px`,i.style.bottom=`${u}px`,c.style.paddingBottom=`${o.offsetHeight+u+16}px`};e.addEventListener("resize",s),e.addEventListener("scroll",s),s()}function Z(){const e=document.getElementById("theme-btn"),o=()=>{const i=document.documentElement.classList.contains("dark");e.textContent=i?"☀":"☾"};o(),e.addEventListener("click",()=>{const i=document.documentElement,c=i.classList.contains("dark");i.classList.toggle("dark",!c),i.classList.toggle("light",c),localStorage.setItem("bb_theme",c?"light":"dark"),o()})}function ee(){document.getElementById("warmup-btn").addEventListener("click",async()=>{const e=document.getElementById("warmup-panel"),o=document.getElementById("warmup-body");e.classList.remove("hidden"),o.innerHTML='<p class="muted-text">Thinking…</p>';const i=a.paragraphs.slice(-5).map(s=>s.clean||s.raw).join(`

`),c=await me(i);o.innerHTML=c.length?c.map(s=>`<p class="warmup-q">${S(s)}</p>`).join(""):'<p class="muted-text">Could not generate prompts.</p>'}),document.getElementById("close-warmup").addEventListener("click",()=>{document.getElementById("warmup-panel").classList.add("hidden")})}}function S(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const ve=localStorage.getItem("bb_theme");ve==="light"&&document.documentElement.classList.replace("dark","light");function Y(){const t=location.hash.slice(1)||"/",n=document.getElementById("app");n.innerHTML="";const a=t.match(/^\/scenes\/(.+)$/);if(a){be(n,a[1]);return}if(t==="/settings"){fe(n);return}le(n)}window.addEventListener("hashchange",Y);Y();
