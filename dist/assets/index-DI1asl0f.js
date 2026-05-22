(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))u(l);new MutationObserver(l=>{for(const r of l)if(r.type==="childList")for(const p of r.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&u(p)}).observe(document,{childList:!0,subtree:!0});function a(l){const r={};return l.integrity&&(r.integrity=l.integrity),l.referrerPolicy&&(r.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?r.credentials="include":l.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function u(l){if(l.ep)return;l.ep=!0;const r=a(l);fetch(l.href,r)}})();const y={anthropicKey:"bb_anthropic_key",githubToken:"bb_github_token",githubOwner:"bb_github_owner",githubRepo:"bb_github_repo",githubBranch:"bb_github_branch",emailAddress:"bb_email"};function L(){return{anthropicKey:localStorage.getItem(y.anthropicKey)??"",githubToken:localStorage.getItem(y.githubToken)??"",githubOwner:localStorage.getItem(y.githubOwner)??"",githubRepo:localStorage.getItem(y.githubRepo)??"",githubBranch:localStorage.getItem(y.githubBranch)??"main",emailAddress:localStorage.getItem(y.emailAddress)??""}}function ce(t){for(const[n,a]of Object.entries(y)){const u=t[n];u!==void 0&&localStorage.setItem(a,u)}}function le(){const t=L();return!!(t.anthropicKey&&t.githubToken&&t.githubOwner&&t.githubRepo)}function de(t){const n=t.paragraphs.map(a=>a.clean||a.raw).filter(Boolean).join(`

`);return`# ${t.name}

${n}
`}const pe="https://api.github.com";async function T(t,n={}){const{githubToken:a,githubOwner:u,githubRepo:l}=L(),r=await fetch(`${pe}/repos/${u}/${l}${t}`,{...n,headers:{Authorization:`Bearer ${a}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...n.headers??{}}});if(!r.ok){const p=await r.json().catch(()=>({}));throw new Error((p==null?void 0:p.message)??`GitHub ${r.status}`)}return r.json()}function U(t){return btoa(unescape(encodeURIComponent(t)))}async function W(t,n,a,u){let l;try{l=(await T(`/contents/${t}`)).sha}catch{}await T(`/contents/${t}`,{method:"PUT",body:JSON.stringify({message:a,content:n,branch:u,...l?{sha:l}:{}})})}async function ue(){try{return(await T("/contents/scenes")).filter(n=>n.name.endsWith(".json")).map(n=>n.name.replace(".json",""))}catch{return[]}}async function me(t){try{const n=await T(`/contents/scenes/${t}.json`),a=decodeURIComponent(escape(atob(n.content.replace(/\s/g,""))));return JSON.parse(a)}catch{return null}}async function F(t){const{githubBranch:n}=L();await W(`scenes/${t.slug}.json`,U(JSON.stringify(t,null,2)),`Update scene: ${t.name}`,n),await W(`scenes/${t.slug}.md`,U(de(t)),`Update markdown: ${t.name}`,n)}async function he(t){const n=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),a={name:t,slug:n,created_at:new Date().toISOString(),paragraphs:[]};return await F(a),a}function ge(t){t.innerHTML=`
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
  `;const n=document.getElementById("new-name"),a=document.getElementById("create-btn");if(a.addEventListener("click",()=>l()),n.addEventListener("keydown",r=>{r.key==="Enter"&&l()}),!le()){document.getElementById("scenes-container").innerHTML=`
      <div class="empty-state">
        <p>Configure your settings to get started.</p>
        <a href="#/settings" class="btn-primary">Open Settings →</a>
      </div>
    `;return}u();async function u(){const r=document.getElementById("scenes-container");if(r)try{const p=await ue();if(!p.length){r.innerHTML='<div class="empty-state"><p>No scenes yet. Create your first one below.</p></div>';return}r.className="scenes-list",r.innerHTML=p.map(f=>`
        <a href="#/scenes/${f}" class="scene-card">
          <span class="scene-name">${fe(f)}</span>
          <span>→</span>
        </a>
      `).join("")}catch(p){r.innerHTML=`<div class="error-state">${p.message}</div>`}}async function l(){const r=n.value.trim();if(r){a.disabled=!0,a.textContent="…";try{const p=await he(r);location.hash=`#/scenes/${p.slug}`}catch(p){alert("Error: "+p.message),a.disabled=!1,a.textContent="Create"}}}}function fe(t){return t.replace(/-/g," ").replace(/\b\w/g,n=>n.toUpperCase())}const be="https://api.anthropic.com/v1/messages";async function X(t,n,a=1024){var p;const{anthropicKey:u}=L(),l=await fetch(be,{method:"POST",headers:{"x-api-key":u,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","content-type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:a,system:t,messages:[{role:"user",content:n}]})});if(!l.ok){const f=await l.json().catch(()=>({}));throw new Error(((p=f==null?void 0:f.error)==null?void 0:p.message)??`Claude API error ${l.status}`)}return(await l.json()).content[0].text.trim()}async function ye(t,n=""){const a=n?`Previous context:
${n}

---

New dictation to clean up:
${t}`:`Clean up this dictated text:
${t}`;return X(we,a,1024)}async function ve(t){try{return(await X(Ee,t,300)).split(`
`).filter(Boolean)}catch{return[]}}const we=`You are a prose editor working with a novelist on a draft manuscript.

Your job is to clean up raw dictated or typed text into polished, readable prose. You must:
- Fix grammar, punctuation, and sentence flow
- Remove dictation artifacts ("um", "uh", repeated words, false starts)
- Preserve the author's voice, style, and all narrative choices
- Never advance the plot, add new events, or invent details
- Keep every idea present in the raw input — just express it cleanly
- Split into natural paragraphs where appropriate
- Return ONLY the cleaned prose — no commentary, no meta-text, no "Here is the cleaned version:"

Output one or more prose paragraphs, each separated by a blank line. Nothing else.`,Ee=`You are a writing coach helping a novelist get back into their story.

Given recent draft content, generate 3 short questions that will help the writer re-engage with the scene. Questions should be about character motivation, sensory details, or what happens next. Be specific to the actual content — no generic advice.

Output exactly 3 questions, one per line, no numbering, no extra text.`;function Ie(t){const n=L();t.innerHTML=`
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
  `,document.getElementById("s-save").addEventListener("click",()=>{ce({anthropicKey:v("s-anthropic"),githubToken:v("s-gh-token"),githubOwner:v("s-gh-owner"),githubRepo:v("s-gh-repo"),githubBranch:v("s-gh-branch")||"main",emailAddress:v("s-email")}),$("Settings saved")})}function v(t){return document.getElementById(t).value.trim()}function w(t){return t.replace(/"/g,"&quot;")}function $(t){const n=document.createElement("div");n.className="toast",n.textContent=t,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("toast-show")),setTimeout(()=>{n.classList.remove("toast-show"),setTimeout(()=>n.remove(),300)},2200)}async function Be(t,n){t.innerHTML=`
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
  `;let a=null,u=null,l=!1;const r=new Set;try{a=await me(n)}catch(e){t.innerHTML=`<div class="error-state">Failed to load: ${e.message}</div>`;return}if(!a){t.innerHTML='<div class="error-state">Scene not found.</div>';return}document.getElementById("scene-title").textContent=a.name,p(),z(),ae(),oe(),ie(),se();function p(){var s;const e=document.getElementById("draft-paras");if(!a.paragraphs.length){e.innerHTML='<p class="draft-empty">Start writing below.</p>';return}e.innerHTML=a.paragraphs.map(f).join(""),r.forEach(o=>{const c=e.querySelector(`[data-pid="${o}"]`);if(!c)return;const i=c.querySelector(".para-polished"),d=c.querySelector(".para-original");!i||!d||(i.style.transition="none",d.style.transition="none",c.classList.add("is-swiped"),requestAnimationFrame(()=>{i.style.transition="",d.style.transition=""}))}),u&&((s=e.querySelector(`[data-pid="${u}"]`))==null||s.classList.add("is-editing")),e.querySelectorAll(".para-edit-btn").forEach(o=>{o.addEventListener("click",c=>{var d;c.stopPropagation();const i=(d=o.closest("[data-pid]"))==null?void 0:d.dataset.pid;i&&te(i)})})}function f(e){return e.type==="ai"&&e.raw&&e.raw!==e.clean?`
        <div class="para-wrap ai-para" data-pid="${e.pid}">
          <div class="para-inner">
            <div class="para-polished">
              <div class="accent-bar accent-amber"></div>
              <p class="para-text">${k(e.clean)}</p>
            </div>
            <div class="para-original">
              <div class="accent-bar accent-blue"></div>
              <p class="para-text para-orig-text">${k(e.raw)}</p>
            </div>
          </div>
          <button class="para-edit-btn" title="Edit paragraph">✎</button>
        </div>`:`
      <div class="para-wrap" data-pid="${e.pid}">
        <p class="para-text">${k(e.clean||e.raw)}</p>
        <button class="para-edit-btn" title="Edit paragraph">✎</button>
      </div>`}function z(){const e=document.getElementById("compose-input"),s=document.getElementById("compose-add"),o=document.getElementById("compose-polish");e.addEventListener("input",()=>{_(e);const c=e.value.trim().length>0;s.disabled=!c,o.disabled=!c}),s.addEventListener("click",V),o.addEventListener("click",J),document.getElementById("cancel-edit-btn").addEventListener("click",j),document.getElementById("commit-review-btn").addEventListener("click",Q),document.getElementById("discard-review-btn").addEventListener("click",Z)}function _(e){e.style.height="auto",e.style.height=Math.min(e.scrollHeight,200)+"px"}async function J(){const s=document.getElementById("compose-input").value.trim();if(s){S(!0);try{const o=a.paragraphs.slice(-3).map(i=>i.clean||i.raw).join(`

`),c=await ye(s,o);ee(c)}catch(o){$("AI error: "+o.message),S(!1)}}}function V(){const s=document.getElementById("compose-input").value.trim();s&&(u?N(u,s,s,"typed"):ne({pid:crypto.randomUUID(),raw:s,clean:s,type:"typed",created_at:new Date().toISOString()}),H())}function Q(){const e=document.getElementById("compose-input"),s=document.getElementById("review-text"),o=e.value.trim(),c=s.innerText.trim();q(),S(!1);const i=c.split(/\n\n+/).filter(Boolean),d=new Date().toISOString();u?N(u,o,c,"ai"):(i.forEach((m,g)=>{a.paragraphs.push({pid:crypto.randomUUID(),raw:g===0?o:"",clean:m.trim(),type:"ai",created_at:d})}),p(),R(),A()),H()}function Z(){q(),S(!1)}function S(e){const s=document.getElementById("compose-input"),o=document.getElementById("compose-add"),c=document.getElementById("compose-polish");s.disabled=e,o.disabled=e,c.disabled=e,c.textContent=e?"…":"Polish ✦"}function H(){const e=document.getElementById("compose-input");e.value="",e.style.height="",e.disabled=!1,document.getElementById("compose-add").disabled=!0,document.getElementById("compose-add").textContent="Add",document.getElementById("compose-polish").disabled=!0,document.getElementById("compose-polish").textContent="Polish ✦",j()}function ee(e){const s=document.getElementById("review-sheet");document.getElementById("review-text").innerText=e,s.classList.remove("hidden"),requestAnimationFrame(()=>requestAnimationFrame(()=>s.classList.add("is-visible")))}function q(){const e=document.getElementById("review-sheet");e.classList.remove("is-visible"),e.addEventListener("transitionend",()=>e.classList.add("hidden"),{once:!0})}function te(e){var d,m;const s=a.paragraphs.find(g=>g.pid===e);if(!s)return;u=e;const o=document.getElementById("compose-input");o.value=s.clean||s.raw,_(o);const c=document.getElementById("compose-add"),i=document.getElementById("compose-polish");c.textContent="Save",c.disabled=!1,i.disabled=!1,document.getElementById("edit-banner").classList.remove("hidden"),document.querySelectorAll(".para-wrap").forEach(g=>g.classList.remove("is-editing")),(d=document.querySelector(`[data-pid="${e}"]`))==null||d.classList.add("is-editing"),o.focus(),o.setSelectionRange(o.value.length,o.value.length),(m=document.getElementById("composer"))==null||m.scrollIntoView({behavior:"smooth",block:"nearest"})}function j(){u=null,document.getElementById("edit-banner").classList.add("hidden"),document.querySelectorAll(".para-wrap").forEach(e=>e.classList.remove("is-editing")),document.getElementById("compose-add").textContent="Add"}function N(e,s,o,c){const i=a.paragraphs.findIndex(d=>d.pid===e);i!==-1&&(a.paragraphs[i]={...a.paragraphs[i],raw:s,clean:o,type:c},r.delete(e),p(),A())}function ne(e){a.paragraphs.push(e),p(),R(),A()}function A(){l||!a||(l=!0,F(a).then(()=>$("Saved")).catch(e=>$("Save failed: "+e.message)).finally(()=>{l=!1}))}function R(){const e=document.getElementById("draft-scroll");e&&(e.scrollTop=e.scrollHeight)}function ae(){const e=document.getElementById("draft-scroll");let s=0,o=0,c=0,i=null,d=null,m=null,g=0,K=0,E=!1;const Y=()=>document.querySelectorAll(".para-wrap");e.addEventListener("touchstart",b=>{const h=b.target.closest(".ai-para");h&&(i=h.querySelector(".para-polished"),d=h.querySelector(".para-original"),!(!i||!d)&&(m=h,s=b.touches[0].clientX,o=b.touches[0].clientY,c=Date.now(),g=h.querySelector(".para-inner").offsetWidth,K=h.classList.contains("is-swiped")?-g:0,E=!1))},{passive:!0}),e.addEventListener("touchmove",b=>{if(!i||!d||!m)return;const h=b.touches[0].clientX-s,C=b.touches[0].clientY-o;if(!E){if(Math.abs(h)<6&&Math.abs(C)<6)return;if(Math.abs(C)>Math.abs(h)){i=d=m=null;return}E=!0,i.style.transition="none",d.style.transition="none",Y().forEach(O=>{O!==m&&O.classList.add("dimmed")})}const I=Math.max(-g,Math.min(0,K+h));i.style.transform=`translateX(${I}px)`,d.style.transform=`translateX(calc(100% + ${I}px))`},{passive:!0}),e.addEventListener("touchend",b=>{if(!i||!d||!m)return;if(!E){i=d=m=null;return}const h=b.changedTouches[0].clientX-s,I=Math.abs(h)/Math.max(1,Date.now()-c)>.4?12:g*.28,M=m.classList.contains("is-swiped")?!(h>I):h<-I,D=M?-g:0,B=i,x=d,P=m;i=d=m=null,E=!1,B.style.transition="transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)",x.style.transition="transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)",B.style.transform=`translateX(${D}px)`,x.style.transform=`translateX(calc(100% + ${D}px))`,B.addEventListener("transitionend",()=>{P.classList.toggle("is-swiped",M),M?r.add(P.dataset.pid):r.delete(P.dataset.pid),B.style.transform="",B.style.transition="",x.style.transform="",x.style.transition="",Y().forEach(re=>re.classList.remove("dimmed"))},{once:!0})},{passive:!0})}function se(){const e=window.visualViewport;if(!e)return;const s=document.getElementById("composer"),o=document.getElementById("review-sheet"),c=document.getElementById("draft-scroll"),i=()=>{const d=Math.max(0,window.innerHeight-(e.offsetTop+e.height));s.style.bottom=`${d}px`,o.style.bottom=`${d}px`,c.style.paddingBottom=`${s.offsetHeight+d+16}px`};e.addEventListener("resize",i),e.addEventListener("scroll",i),i()}function oe(){const e=document.getElementById("theme-btn"),s=()=>{const o=document.documentElement.classList.contains("dark");e.textContent=o?"☀":"☾"};s(),e.addEventListener("click",()=>{const o=document.documentElement,c=o.classList.contains("dark");o.classList.toggle("dark",!c),o.classList.toggle("light",c),localStorage.setItem("bb_theme",c?"light":"dark"),s()})}function ie(){document.getElementById("warmup-btn").addEventListener("click",async()=>{const e=document.getElementById("warmup-panel"),s=document.getElementById("warmup-body");e.classList.remove("hidden"),s.innerHTML='<p class="muted-text">Thinking…</p>';const o=a.paragraphs.slice(-5).map(i=>i.clean||i.raw).join(`

`),c=await ve(o);s.innerHTML=c.length?c.map(i=>`<p class="warmup-q">${k(i)}</p>`).join(""):'<p class="muted-text">Could not generate prompts.</p>'}),document.getElementById("close-warmup").addEventListener("click",()=>{document.getElementById("warmup-panel").classList.add("hidden")})}}function k(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const Le=localStorage.getItem("bb_theme");Le==="light"&&document.documentElement.classList.replace("dark","light");function G(){const t=location.hash.slice(1)||"/",n=document.getElementById("app");n.innerHTML="";const a=t.match(/^\/scenes\/(.+)$/);if(a){Be(n,a[1]);return}if(t==="/settings"){Ie(n);return}ge(n)}window.addEventListener("hashchange",G);G();
