(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))h(l);new MutationObserver(l=>{for(const c of l)if(c.type==="childList")for(const u of c.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&h(u)}).observe(document,{childList:!0,subtree:!0});function a(l){const c={};return l.integrity&&(c.integrity=l.integrity),l.referrerPolicy&&(c.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?c.credentials="include":l.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function h(l){if(l.ep)return;l.ep=!0;const c=a(l);fetch(l.href,c)}})();const w={anthropicKey:"bb_anthropic_key",githubToken:"bb_github_token",githubOwner:"bb_github_owner",githubRepo:"bb_github_repo",githubBranch:"bb_github_branch",emailAddress:"bb_email"};function x(){return{anthropicKey:localStorage.getItem(w.anthropicKey)??"",githubToken:localStorage.getItem(w.githubToken)??"",githubOwner:localStorage.getItem(w.githubOwner)??"",githubRepo:localStorage.getItem(w.githubRepo)??"",githubBranch:localStorage.getItem(w.githubBranch)??"main",emailAddress:localStorage.getItem(w.emailAddress)??""}}function ge(t){for(const[n,a]of Object.entries(w)){const h=t[n];h!==void 0&&localStorage.setItem(a,h)}}function fe(){const t=x();return!!(t.anthropicKey&&t.githubToken&&t.githubOwner&&t.githubRepo)}function ye(t){const n=t.paragraphs.map(a=>a.clean||a.raw).filter(Boolean).join(`

`);return`# ${t.name}

${n}
`}const be="https://api.github.com";async function H(t,n={}){const{githubToken:a,githubOwner:h,githubRepo:l}=x(),c=await fetch(`${be}/repos/${h}/${l}${t}`,{...n,headers:{Authorization:`Bearer ${a}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...n.headers??{}}});if(!c.ok){const u=await c.json().catch(()=>({}));throw new Error((u==null?void 0:u.message)??`GitHub ${c.status}`)}return c.json()}function z(t){return btoa(unescape(encodeURIComponent(t)))}async function J(t,n,a,h){let l;try{l=(await H(`/contents/${t}`)).sha}catch{}await H(`/contents/${t}`,{method:"PUT",body:JSON.stringify({message:a,content:n,branch:h,...l?{sha:l}:{}})})}async function ve(){try{return(await H("/contents/scenes")).filter(n=>n.name.endsWith(".json")).map(n=>n.name.replace(".json",""))}catch{return[]}}async function we(t){try{const n=await H(`/contents/scenes/${t}.json`),a=decodeURIComponent(escape(atob(n.content.replace(/\s/g,""))));return JSON.parse(a)}catch{return null}}async function V(t){const{githubBranch:n}=x();await J(`scenes/${t.slug}.json`,z(JSON.stringify(t,null,2)),`Update scene: ${t.name}`,n),await J(`scenes/${t.slug}.md`,z(ye(t)),`Update markdown: ${t.name}`,n)}async function Ee(t){const n=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),a={name:t,slug:n,created_at:new Date().toISOString(),paragraphs:[]};return await V(a),a}function Be(t){t.innerHTML=`
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
  `;const n=document.getElementById("new-name"),a=document.getElementById("create-btn");if(a.addEventListener("click",()=>l()),n.addEventListener("keydown",c=>{c.key==="Enter"&&l()}),!fe()){document.getElementById("scenes-container").innerHTML=`
      <div class="empty-state">
        <p>Configure your settings to get started.</p>
        <a href="#/settings" class="btn-primary">Open Settings →</a>
      </div>
    `;return}h();async function h(){const c=document.getElementById("scenes-container");if(c)try{const u=await ve();if(!u.length){c.innerHTML='<div class="empty-state"><p>No scenes yet. Create your first one below.</p></div>';return}c.className="scenes-list",c.innerHTML=u.map(f=>`
        <a href="#/scenes/${f}" class="scene-card">
          <span class="scene-name">${Le(f)}</span>
          <span>→</span>
        </a>
      `).join("")}catch(u){c.innerHTML=`<div class="error-state">${u.message}</div>`}}async function l(){const c=n.value.trim();if(c){a.disabled=!0,a.textContent="…";try{const u=await Ee(c);location.hash=`#/scenes/${u.slug}`}catch(u){alert("Error: "+u.message),a.disabled=!1,a.textContent="Create"}}}}function Le(t){return t.replace(/-/g," ").replace(/\b\w/g,n=>n.toUpperCase())}const Ie="https://api.anthropic.com/v1/messages";async function Q(t,n,a=1024){var u;const{anthropicKey:h}=x(),l=await fetch(Ie,{method:"POST",headers:{"x-api-key":h,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","content-type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:a,system:t,messages:[{role:"user",content:n}]})});if(!l.ok){const f=await l.json().catch(()=>({}));throw new Error(((u=f==null?void 0:f.error)==null?void 0:u.message)??`Claude API error ${l.status}`)}return(await l.json()).content[0].text.trim()}async function Se(t,n=""){const a=n?`Previous context:
${n}

---

New dictation to clean up:
${t}`:`Clean up this dictated text:
${t}`;return Q(ke,a,1024)}async function xe(t){try{return(await Q($e,t,300)).split(`
`).filter(Boolean)}catch{return[]}}const ke=`You are a prose editor working with a novelist on a draft manuscript.

Your job is to clean up raw dictated or typed text into polished, readable prose. You must:
- Fix grammar, punctuation, and sentence flow
- Remove dictation artifacts ("um", "uh", repeated words, false starts)
- Preserve the author's voice, style, and all narrative choices
- Never advance the plot, add new events, or invent details
- Keep every idea present in the raw input — just express it cleanly
- Preserve the paragraph structure of the input: one polished paragraph for each input paragraph
- If the input has no paragraph breaks, output a single paragraph
- Return ONLY the cleaned prose — no commentary, no meta-text, no "Here is the cleaned version:"

Output one or more prose paragraphs, each separated by a blank line. Nothing else.`,$e=`You are a writing coach helping a novelist get back into their story.

Given recent draft content, generate 3 short questions that will help the writer re-engage with the scene. Questions should be about character motivation, sensory details, or what happens next. Be specific to the actual content — no generic advice.

Output exactly 3 questions, one per line, no numbering, no extra text.`;function Te(t){const n=x();t.innerHTML=`
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
            <input type="password" id="s-anthropic" value="${L(n.anthropicKey)}" placeholder="sk-ant-…" autocomplete="off">
          </label>
        </section>

        <section class="settings-section">
          <h2>GitHub Storage</h2>
          <p class="settings-help">Scenes save as <code>.json</code> + <code>.md</code> files. <a href="https://github.com/settings/tokens/new?scopes=repo&description=BookBuddy" target="_blank" rel="noopener">Create a token →</a></p>
          <label class="field">
            <span>Personal Access Token</span>
            <input type="password" id="s-gh-token" value="${L(n.githubToken)}" placeholder="ghp_…" autocomplete="off">
          </label>
          <label class="field">
            <span>Owner</span>
            <input type="text" id="s-gh-owner" value="${L(n.githubOwner)}" placeholder="your-username">
          </label>
          <label class="field">
            <span>Repository</span>
            <input type="text" id="s-gh-repo" value="${L(n.githubRepo)}" placeholder="my-novel">
          </label>
          <label class="field">
            <span>Branch</span>
            <input type="text" id="s-gh-branch" value="${L(n.githubBranch)}" placeholder="main">
          </label>
        </section>

        <section class="settings-section">
          <h2>Daily Email</h2>
          <p class="settings-help">Set <code>ANTHROPIC_API_KEY</code>, <code>RESEND_API_KEY</code>, and <code>EMAIL_ADDRESS</code> as secrets in your GitHub repo to enable the daily questions workflow.</p>
          <label class="field">
            <span>Your Email</span>
            <input type="email" id="s-email" value="${L(n.emailAddress)}" placeholder="you@example.com">
          </label>
        </section>

        <button class="btn-primary full-width" id="s-save">Save</button>
      </div>
    </div>
  `,document.getElementById("s-save").addEventListener("click",()=>{ge({anthropicKey:B("s-anthropic"),githubToken:B("s-gh-token"),githubOwner:B("s-gh-owner"),githubRepo:B("s-gh-repo"),githubBranch:B("s-gh-branch")||"main",emailAddress:B("s-email")}),M("Settings saved")})}function B(t){return document.getElementById(t).value.trim()}function L(t){return t.replace(/"/g,"&quot;")}function M(t){const n=document.createElement("div");n.className="toast",n.textContent=t,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("toast-show")),setTimeout(()=>{n.classList.remove("toast-show"),setTimeout(()=>n.remove(),300)},2200)}async function Ae(t,n){t.innerHTML=`
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
  `;let a=null,h=null,l=!1;const c=new Set;try{a=await we(n)}catch(e){t.innerHTML=`<div class="error-state">Failed to load: ${e.message}</div>`;return}if(!a){t.innerHTML='<div class="error-state">Scene not found.</div>';return}document.getElementById("scene-title").textContent=a.name,u(),ee(),le(),pe(),ue(),de();function u(){var o;const e=document.getElementById("draft-paras");if(!a.paragraphs.length){e.innerHTML='<p class="draft-empty">Start writing below.</p>';return}e.innerHTML=a.paragraphs.map(f).join(""),c.forEach(s=>{const r=e.querySelector(`[data-pid="${s}"]`);if(!r)return;const i=r.querySelector(".para-polished"),d=r.querySelector(".para-original"),p=r.querySelector(".para-inner");!i||!d||!p||(i.style.transition="none",d.style.transition="none",p.style.transition="none",p.style.height=d.scrollHeight+"px",r.classList.add("is-swiped"),requestAnimationFrame(()=>{i.style.transition="",d.style.transition="",p.style.transition=""}))}),h&&((o=e.querySelector(`[data-pid="${h}"]`))==null||o.classList.add("is-editing")),e.querySelectorAll(".para-edit-btn").forEach(s=>{s.addEventListener("click",r=>{var d;r.stopPropagation();const i=(d=s.closest("[data-pid]"))==null?void 0:d.dataset.pid;i&&ie(i)})}),e.querySelectorAll(".para-delete-btn").forEach(s=>{let r=null;s.addEventListener("click",i=>{var p;if(i.stopPropagation(),!s.classList.contains("is-confirming")){s.classList.add("is-confirming"),r=setTimeout(()=>s.classList.remove("is-confirming"),2e3);return}r&&clearTimeout(r);const d=(p=s.closest("[data-pid]"))==null?void 0:p.dataset.pid;d&&re(d)})})}function f(e){const o=e.type==="ai"&&e.raw&&e.raw!==e.clean,s=`
      <button class="para-edit-btn" title="Edit paragraph">✎</button>
      <button class="para-delete-btn" title="Delete paragraph">✕</button>`;return o?`
        <div class="para-wrap ai-para" data-pid="${e.pid}">
          <div class="para-inner">
            <div class="para-polished">
              <div class="accent-bar accent-amber"></div>
              <p class="para-text">${O(e.clean)}</p>
            </div>
            <div class="para-original">
              <div class="accent-bar accent-blue"></div>
              <p class="para-text para-orig-text">${O(e.raw)}</p>
            </div>
          </div>
          ${s}
        </div>`:`
      <div class="para-wrap" data-pid="${e.pid}">
        <p class="para-text">${O(e.clean||e.raw)}</p>
        ${s}
      </div>`}function ee(){const e=document.getElementById("compose-input"),o=document.getElementById("compose-add"),s=document.getElementById("compose-polish");e.addEventListener("input",()=>{R(e);const r=e.value.trim().length>0;o.disabled=!r,s.disabled=!r}),o.addEventListener("click",ne),s.addEventListener("click",te),document.getElementById("cancel-edit-btn").addEventListener("click",P),document.getElementById("commit-review-btn").addEventListener("click",se),document.getElementById("discard-review-btn").addEventListener("click",ae)}function R(e){e.style.height="auto",e.style.height=Math.min(e.scrollHeight,200)+"px"}async function te(){const o=document.getElementById("compose-input").value.trim();if(o){k(!0);try{const s=a.paragraphs.slice(-3).map(i=>i.clean||i.raw).join(`

`),r=await Se(o,s);oe(r)}catch(s){M("AI error: "+s.message),k(!1)}}}function ne(){const o=document.getElementById("compose-input").value.trim();o&&(h?Y(h,o,o,"typed"):ce({pid:crypto.randomUUID(),raw:o,clean:o,type:"typed",created_at:new Date().toISOString()}),K())}function se(){const e=document.getElementById("compose-input"),o=document.getElementById("review-text"),s=e.value.trim(),r=o.innerText.trim();D(),k(!1);const i=r.split(/\n\n+/).map(m=>m.trim()).filter(Boolean),d=s.split(/\n\n+/).map(m=>m.trim()).filter(Boolean),p=new Date().toISOString();h?Y(h,s,r,"ai"):(i.forEach((m,y)=>{a.paragraphs.push({pid:crypto.randomUUID(),raw:d[y]??"",clean:m,type:"ai",created_at:p})}),u(),U(),$()),K()}function ae(){D(),k(!1)}function k(e){const o=document.getElementById("compose-input"),s=document.getElementById("compose-add"),r=document.getElementById("compose-polish");o.disabled=e,s.disabled=e,r.disabled=e,r.textContent=e?"…":"Polish ✦"}function K(){const e=document.getElementById("compose-input");e.value="",e.style.height="",e.disabled=!1,document.getElementById("compose-add").disabled=!0,document.getElementById("compose-add").textContent="Add",document.getElementById("compose-polish").disabled=!0,document.getElementById("compose-polish").textContent="Polish ✦",P()}function oe(e){const o=document.getElementById("review-sheet");document.getElementById("review-text").innerText=e,o.classList.remove("hidden"),requestAnimationFrame(()=>requestAnimationFrame(()=>o.classList.add("is-visible")))}function D(){const e=document.getElementById("review-sheet");e.classList.remove("is-visible"),e.addEventListener("transitionend",()=>e.classList.add("hidden"),{once:!0})}function ie(e){var d,p;const o=a.paragraphs.find(m=>m.pid===e);if(!o)return;h=e;const s=document.getElementById("compose-input");s.value=o.clean||o.raw,R(s);const r=document.getElementById("compose-add"),i=document.getElementById("compose-polish");r.textContent="Save",r.disabled=!1,i.disabled=!1,document.getElementById("edit-banner").classList.remove("hidden"),document.querySelectorAll(".para-wrap").forEach(m=>m.classList.remove("is-editing")),(d=document.querySelector(`[data-pid="${e}"]`))==null||d.classList.add("is-editing"),s.focus(),s.setSelectionRange(s.value.length,s.value.length),(p=document.getElementById("composer"))==null||p.scrollIntoView({behavior:"smooth",block:"nearest"})}function P(){h=null,document.getElementById("edit-banner").classList.add("hidden"),document.querySelectorAll(".para-wrap").forEach(e=>e.classList.remove("is-editing")),document.getElementById("compose-add").textContent="Add"}function re(e){a.paragraphs=a.paragraphs.filter(o=>o.pid!==e),c.delete(e),h===e&&P(),u(),$()}function Y(e,o,s,r){const i=a.paragraphs.findIndex(d=>d.pid===e);i!==-1&&(a.paragraphs[i]={...a.paragraphs[i],raw:o,clean:s,type:r},c.delete(e),u(),$())}function ce(e){a.paragraphs.push(e),u(),U(),$()}function $(){l||!a||(l=!0,V(a).then(()=>M("Saved")).catch(e=>M("Save failed: "+e.message)).finally(()=>{l=!1}))}function U(){const e=document.getElementById("draft-scroll");e&&(e.scrollTop=e.scrollHeight)}function le(){const e=document.getElementById("draft-scroll");let o=0,s=0,r=0,i=null,d=null,p=null,m=null,y=0,W=0,T=0,_=0,I=!1;const F=()=>document.querySelectorAll(".para-wrap");e.addEventListener("touchstart",b=>{const g=b.target.closest(".ai-para");g&&(i=g.querySelector(".para-polished"),d=g.querySelector(".para-original"),p=g.querySelector(".para-inner"),!(!i||!d||!p)&&(m=g,o=b.touches[0].clientX,s=b.touches[0].clientY,r=Date.now(),y=p.offsetWidth,W=g.classList.contains("is-swiped")?-y:0,T=i.scrollHeight,_=d.scrollHeight,I=!1))},{passive:!0}),e.addEventListener("touchmove",b=>{if(!i||!d||!p||!m)return;const g=b.touches[0].clientX-o,q=b.touches[0].clientY-s;if(!I){if(Math.abs(g)<6&&Math.abs(q)<6)return;if(Math.abs(q)>Math.abs(g)){i=d=p=m=null;return}I=!0,i.style.transition="none",d.style.transition="none",p.style.transition="none",p.style.height=p.offsetHeight+"px",F().forEach(v=>{v!==m&&v.classList.add("dimmed")})}const E=Math.max(-y,Math.min(0,W+g)),X=Math.abs(E)/y;i.style.transform=`translateX(${E}px)`,d.style.transform=`translateX(calc(100% + ${E}px))`,p.style.height=T+(_-T)*X+"px"},{passive:!0}),e.addEventListener("touchend",b=>{if(!i||!d||!p||!m)return;if(!I){i=d=p=m=null;return}const g=b.changedTouches[0].clientX-o,E=Math.abs(g)/Math.max(1,Date.now()-r)>.4?12:y*.28,v=m.classList.contains("is-swiped")?!(g>E):g<-E,G=v?-y:0,he=v?_:T,S=i,A=d,C=p,j=m;i=d=p=m=null,I=!1;const N="0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)";S.style.transition=`transform ${N}`,A.style.transition=`transform ${N}`,C.style.transition=`height ${N}`,S.style.transform=`translateX(${G}px)`,A.style.transform=`translateX(calc(100% + ${G}px))`,C.style.height=he+"px",S.addEventListener("transitionend",()=>{j.classList.toggle("is-swiped",v),v?c.add(j.dataset.pid):c.delete(j.dataset.pid),S.style.transform="",S.style.transition="",A.style.transform="",A.style.transition="",C.style.transition="",v||(C.style.height=""),F().forEach(me=>me.classList.remove("dimmed"))},{once:!0})},{passive:!0})}function de(){const e=window.visualViewport;if(!e)return;const o=document.getElementById("composer"),s=document.getElementById("review-sheet"),r=document.getElementById("draft-scroll"),i=()=>{const d=Math.max(0,window.innerHeight-(e.offsetTop+e.height));o.style.bottom=`${d}px`,s.style.bottom=`${d}px`,r.style.paddingBottom=`${o.offsetHeight+d+16}px`};e.addEventListener("resize",i),e.addEventListener("scroll",i),i()}function pe(){const e=document.getElementById("theme-btn"),o=()=>{const s=document.documentElement.classList.contains("dark");e.textContent=s?"☀":"☾"};o(),e.addEventListener("click",()=>{const s=document.documentElement,r=s.classList.contains("dark");s.classList.toggle("dark",!r),s.classList.toggle("light",r),localStorage.setItem("bb_theme",r?"light":"dark"),o()})}function ue(){document.getElementById("warmup-btn").addEventListener("click",async()=>{const e=document.getElementById("warmup-panel"),o=document.getElementById("warmup-body");e.classList.remove("hidden"),o.innerHTML='<p class="muted-text">Thinking…</p>';const s=a.paragraphs.slice(-5).map(i=>i.clean||i.raw).join(`

`),r=await xe(s);o.innerHTML=r.length?r.map(i=>`<p class="warmup-q">${O(i)}</p>`).join(""):'<p class="muted-text">Could not generate prompts.</p>'}),document.getElementById("close-warmup").addEventListener("click",()=>{document.getElementById("warmup-panel").classList.add("hidden")})}}function O(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const Ce=localStorage.getItem("bb_theme");Ce==="light"&&document.documentElement.classList.replace("dark","light");function Z(){const t=location.hash.slice(1)||"/",n=document.getElementById("app");n.innerHTML="";const a=t.match(/^\/scenes\/(.+)$/);if(a){Ae(n,a[1]);return}if(t==="/settings"){Te(n);return}Be(n)}window.addEventListener("hashchange",Z);Z();
