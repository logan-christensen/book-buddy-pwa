(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))u(d);new MutationObserver(d=>{for(const p of d)if(p.type==="childList")for(const c of p.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&u(c)}).observe(document,{childList:!0,subtree:!0});function s(d){const p={};return d.integrity&&(p.integrity=d.integrity),d.referrerPolicy&&(p.referrerPolicy=d.referrerPolicy),d.crossOrigin==="use-credentials"?p.credentials="include":d.crossOrigin==="anonymous"?p.credentials="omit":p.credentials="same-origin",p}function u(d){if(d.ep)return;d.ep=!0;const p=s(d);fetch(d.href,p)}})();const $={anthropicKey:"bb_anthropic_key",githubToken:"bb_github_token",githubOwner:"bb_github_owner",githubRepo:"bb_github_repo",githubBranch:"bb_github_branch",emailAddress:"bb_email"};function O(){return{anthropicKey:localStorage.getItem($.anthropicKey)??"",githubToken:localStorage.getItem($.githubToken)??"",githubOwner:localStorage.getItem($.githubOwner)??"",githubRepo:localStorage.getItem($.githubRepo)??"",githubBranch:localStorage.getItem($.githubBranch)??"main",emailAddress:localStorage.getItem($.emailAddress)??""}}function fe(t){for(const[n,s]of Object.entries($)){const u=t[n];u!==void 0&&localStorage.setItem(s,u)}}function ve(){const t=O();return!!(t.anthropicKey&&t.githubToken&&t.githubOwner&&t.githubRepo)}function ye(t){const n=t.paragraphs.map(s=>s.clean||s.raw).filter(Boolean).join(`

`);return`# ${t.name}

${n}
`}const be="https://api.github.com";async function A(t,n={}){const{githubToken:s,githubOwner:u,githubRepo:d}=O(),p=await fetch(`${be}/repos/${u}/${d}${t}`,{...n,headers:{Authorization:`Bearer ${s}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...n.headers??{}}});if(!p.ok){const c=await p.json().catch(()=>({}));throw new Error((c==null?void 0:c.message)??`GitHub ${p.status}`)}return p.json()}function ee(t){return btoa(unescape(encodeURIComponent(t)))}async function te(t,n,s,u){let d;try{d=(await A(`/contents/${t}`)).sha}catch{}await A(`/contents/${t}`,{method:"PUT",body:JSON.stringify({message:s,content:n,branch:u,...d?{sha:d}:{}})})}async function we(){try{return(await A("/contents/scenes")).filter(n=>n.name.endsWith(".json")).map(n=>n.name.replace(".json",""))}catch{return[]}}async function Ee(t){try{const n=await A(`/contents/scenes/${t}.json`),s=decodeURIComponent(escape(atob(n.content.replace(/\s/g,""))));return JSON.parse(s)}catch{return null}}async function ne(t){const{githubBranch:n}=O();await te(`scenes/${t.slug}.json`,ee(JSON.stringify(t,null,2)),`Update scene: ${t.name}`,n),await te(`scenes/${t.slug}.md`,ee(ye(t)),`Update markdown: ${t.name}`,n)}async function Le(t){const{githubBranch:n}=O();async function s(u){try{const d=await A(`/contents/${u}`);await A(`/contents/${u}`,{method:"DELETE",body:JSON.stringify({message:`Delete scene: ${t}`,sha:d.sha,branch:n})})}catch{}}await s(`scenes/${t}.json`),await s(`scenes/${t}.md`)}async function Be(t){const n=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),s={name:t,slug:n,created_at:new Date().toISOString(),paragraphs:[]};return await ne(s),s}function Ie(t){t.innerHTML=`
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
  `;const n=document.getElementById("new-name"),s=document.getElementById("create-btn");if(s.addEventListener("click",()=>p()),n.addEventListener("keydown",c=>{c.key==="Enter"&&p()}),!ve()){document.getElementById("scenes-container").innerHTML=`
      <div class="empty-state">
        <p>Configure your settings to get started.</p>
        <a href="#/settings" class="btn-primary">Open Settings →</a>
      </div>
    `;return}u();async function u(){const c=document.getElementById("scenes-container");if(c)try{const h=await we();if(!h.length){c.innerHTML='<div class="empty-state"><p>No scenes yet. Create your first one below.</p></div>';return}c.className="scenes-list",c.innerHTML=h.map(L=>`
        <div class="scene-card" data-slug="${L}">
          <a href="#/scenes/${L}" class="scene-card-link">
            <span class="scene-name">${xe(L)}</span>
          </a>
          <span class="scene-card-arrow">→</span>
          <button class="scene-delete-btn">Delete</button>
        </div>
      `).join(""),d(c)}catch(h){c.innerHTML=`<div class="error-state">${h.message}</div>`}}function d(c){let h=null,L=!1;function H(v){P(),v.classList.add("is-armed")}function P(){c.querySelectorAll(".scene-card.is-armed").forEach(v=>{v.classList.remove("is-armed");const g=v.querySelector(".scene-delete-btn");g.textContent="Delete",g.classList.remove("is-confirming")})}c.addEventListener("touchstart",v=>{L=!1;const g=v.target.closest(".scene-card");g&&(h=setTimeout(()=>{L||H(g)},500))},{passive:!0}),c.addEventListener("touchmove",()=>{L=!0,h&&(clearTimeout(h),h=null)},{passive:!0}),c.addEventListener("touchend",()=>{h&&(clearTimeout(h),h=null)},{passive:!0}),c.addEventListener("contextmenu",v=>{const g=v.target.closest(".scene-card");g&&(v.preventDefault(),H(g))}),c.addEventListener("click",v=>{const g=v.target.closest(".scene-card");g!=null&&g.classList.contains("is-armed")&&(v.target.closest(".scene-delete-btn")||(P(),v.preventDefault()))},!0),c.addEventListener("click",v=>{var x;const g=v.target.closest(".scene-delete-btn");if(!g)return;if(v.preventDefault(),!g.classList.contains("is-confirming")){g.textContent="Sure?",g.classList.add("is-confirming");return}const q=(x=g.closest("[data-slug]"))==null?void 0:x.dataset.slug;q&&(g.textContent="…",g.disabled=!0,Le(q).then(()=>u()).catch(D=>{alert("Delete failed: "+D.message),u()}))}),document.addEventListener("pointerdown",v=>{c.contains(v.target)||P()})}async function p(){const c=n.value.trim();if(c){s.disabled=!0,s.textContent="…";try{const h=await Be(c);location.hash=`#/scenes/${h.slug}`}catch(h){alert("Error: "+h.message),s.disabled=!1,s.textContent="Create"}}}}function xe(t){return t.replace(/-/g," ").replace(/\b\w/g,n=>n.toUpperCase())}const Se="https://api.anthropic.com/v1/messages";async function se(t,n,s=1024){var c;const{anthropicKey:u}=O(),d=await fetch(Se,{method:"POST",headers:{"x-api-key":u,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","content-type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:s,system:t,messages:[{role:"user",content:n}]})});if(!d.ok){const h=await d.json().catch(()=>({}));throw new Error(((c=h==null?void 0:h.error)==null?void 0:c.message)??`Claude API error ${d.status}`)}return(await d.json()).content[0].text.trim()}async function ke(t,n=""){const s=n?`Previous context:
${n}

---

New dictation to clean up:
${t}`:`Clean up this dictated text:
${t}`;return se(Te,s,1024)}async function $e(t){try{return(await se(Ce,t,300)).split(`
`).filter(Boolean)}catch{return[]}}const Te=`You are a prose editor working with a novelist on a draft manuscript.

Your job is to clean up raw dictated or typed text into polished, readable prose. You must:
- Fix grammar, punctuation, and sentence flow
- Remove dictation artifacts ("um", "uh", repeated words, false starts)
- Preserve the author's voice, style, and all narrative choices
- Never advance the plot, add new events, or invent details
- Keep every idea present in the raw input — just express it cleanly
- Preserve the paragraph structure of the input: one polished paragraph for each input paragraph
- If the input has no paragraph breaks, output a single paragraph
- Return ONLY the cleaned prose — no commentary, no meta-text, no "Here is the cleaned version:"

Output one or more prose paragraphs, each separated by a blank line. Nothing else.`,Ce=`You are a writing coach helping a novelist get back into their story.

Given recent draft content, generate 3 short questions that will help the writer re-engage with the scene. Questions should be about character motivation, sensory details, or what happens next. Be specific to the actual content — no generic advice.

Output exactly 3 questions, one per line, no numbering, no extra text.`;function Me(t){const n=O();t.innerHTML=`
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
            <input type="password" id="s-anthropic" value="${M(n.anthropicKey)}" placeholder="sk-ant-…" autocomplete="off">
          </label>
        </section>

        <section class="settings-section">
          <h2>GitHub Storage</h2>
          <p class="settings-help">Scenes save as <code>.json</code> + <code>.md</code> files. <a href="https://github.com/settings/tokens/new?scopes=repo&description=BookBuddy" target="_blank" rel="noopener">Create a token →</a></p>
          <label class="field">
            <span>Personal Access Token</span>
            <input type="password" id="s-gh-token" value="${M(n.githubToken)}" placeholder="ghp_…" autocomplete="off">
          </label>
          <label class="field">
            <span>Owner</span>
            <input type="text" id="s-gh-owner" value="${M(n.githubOwner)}" placeholder="your-username">
          </label>
          <label class="field">
            <span>Repository</span>
            <input type="text" id="s-gh-repo" value="${M(n.githubRepo)}" placeholder="my-novel">
          </label>
          <label class="field">
            <span>Branch</span>
            <input type="text" id="s-gh-branch" value="${M(n.githubBranch)}" placeholder="main">
          </label>
        </section>

        <section class="settings-section">
          <h2>Daily Email</h2>
          <p class="settings-help">Set <code>ANTHROPIC_API_KEY</code>, <code>RESEND_API_KEY</code>, and <code>EMAIL_ADDRESS</code> as secrets in your GitHub repo to enable the daily questions workflow.</p>
          <label class="field">
            <span>Your Email</span>
            <input type="email" id="s-email" value="${M(n.emailAddress)}" placeholder="you@example.com">
          </label>
        </section>

        <button class="btn-primary full-width" id="s-save">Save</button>
      </div>
    </div>
  `,document.getElementById("s-save").addEventListener("click",()=>{fe({anthropicKey:C("s-anthropic"),githubToken:C("s-gh-token"),githubOwner:C("s-gh-owner"),githubRepo:C("s-gh-repo"),githubBranch:C("s-gh-branch")||"main",emailAddress:C("s-email")}),U("Settings saved")})}function C(t){return document.getElementById(t).value.trim()}function M(t){return t.replace(/"/g,"&quot;")}function U(t){const n=document.createElement("div");n.className="toast",n.textContent=t,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("toast-show")),setTimeout(()=>{n.classList.remove("toast-show"),setTimeout(()=>n.remove(),300)},2200)}async function Ae(t,n){t.innerHTML=`
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

      <div id="para-menu" class="para-menu hidden">
        <button id="para-menu-edit" class="para-menu-item">✎  Edit</button>
        <button id="para-menu-delete" class="para-menu-item para-menu-delete">✕  Delete</button>
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
  `;let s=null,u=null,d=!1;const p=new Set;try{s=await Ee(n)}catch(e){t.innerHTML=`<div class="error-state">Failed to load: ${e.message}</div>`;return}if(!s){t.innerHTML='<div class="error-state">Scene not found.</div>';return}document.getElementById("scene-title").textContent=s.name,c(),L(),le(),de(),pe(),me(),ue();function c(){var a;const e=document.getElementById("draft-paras");if(!s.paragraphs.length){e.innerHTML='<p class="draft-empty">Start writing below.</p>';return}e.innerHTML=s.paragraphs.map(h).join(""),p.forEach(i=>{const r=e.querySelector(`[data-pid="${i}"]`);if(!r)return;const o=r.querySelector(".para-polished"),l=r.querySelector(".para-original"),m=r.querySelector(".para-inner");!o||!l||!m||(o.style.transition="none",l.style.transition="none",m.style.transition="none",m.style.height=l.scrollHeight+"px",r.classList.add("is-swiped"),requestAnimationFrame(()=>{o.style.transition="",l.style.transition="",m.style.transition=""}))}),u&&((a=e.querySelector(`[data-pid="${u}"]`))==null||a.classList.add("is-editing"))}function h(e){return e.type==="ai"&&e.raw&&e.raw!==e.clean?`
        <div class="para-wrap ai-para" data-pid="${e.pid}">
          <div class="para-inner">
            <div class="para-polished">
              <div class="accent-bar accent-amber"></div>
              <p class="para-text">${K(e.clean)}</p>
            </div>
            <div class="para-original">
              <div class="accent-bar accent-blue"></div>
              <p class="para-text para-orig-text">${K(e.raw)}</p>
            </div>
          </div>
        </div>`:`
      <div class="para-wrap" data-pid="${e.pid}">
        <p class="para-text">${K(e.clean||e.raw)}</p>
      </div>`}function L(){const e=document.getElementById("compose-input"),a=document.getElementById("compose-add"),i=document.getElementById("compose-polish");e.addEventListener("input",()=>{H(e);const r=e.value.trim().length>0;a.disabled=!r,i.disabled=!r}),a.addEventListener("click",v),i.addEventListener("click",P),document.getElementById("cancel-edit-btn").addEventListener("click",W),document.getElementById("commit-review-btn").addEventListener("click",g),document.getElementById("discard-review-btn").addEventListener("click",q)}function H(e){e.style.height="auto",e.style.height=Math.min(e.scrollHeight,200)+"px"}async function P(){const a=document.getElementById("compose-input").value.trim();if(a){x(!0);try{const i=s.paragraphs.slice(-3).map(o=>o.clean||o.raw).join(`

`),r=await ke(a,i);ie(r)}catch(i){U("AI error: "+i.message),x(!1)}}}function v(){const a=document.getElementById("compose-input").value.trim();a&&(u?z(u,a,a,"typed"):ce({pid:crypto.randomUUID(),raw:a,clean:a,type:"typed",created_at:new Date().toISOString()}),D())}function g(){const e=document.getElementById("compose-input"),a=document.getElementById("review-text"),i=e.value.trim(),r=a.innerText.trim();J(),x(!1);const o=r.split(/\n\n+/).map(f=>f.trim()).filter(Boolean),l=i.split(/\n\n+/).map(f=>f.trim()).filter(Boolean),m=new Date().toISOString();u?z(u,i,r,"ai"):(o.forEach((f,w)=>{s.paragraphs.push({pid:crypto.randomUUID(),raw:l[w]??"",clean:f,type:"ai",created_at:m})}),c(),V(),j()),D()}function q(){J(),x(!1)}function x(e){const a=document.getElementById("compose-input"),i=document.getElementById("compose-add"),r=document.getElementById("compose-polish");a.disabled=e,i.disabled=e,r.disabled=e,r.textContent=e?"…":"Polish ✦"}function D(){const e=document.getElementById("compose-input");e.value="",e.style.height="",e.disabled=!1,document.getElementById("compose-add").disabled=!0,document.getElementById("compose-add").textContent="Add",document.getElementById("compose-polish").disabled=!0,document.getElementById("compose-polish").textContent="Polish ✦",W()}function ie(e){const a=document.getElementById("review-sheet");document.getElementById("review-text").innerText=e,a.classList.remove("hidden"),requestAnimationFrame(()=>requestAnimationFrame(()=>a.classList.add("is-visible")))}function J(){const e=document.getElementById("review-sheet");e.classList.remove("is-visible"),e.addEventListener("transitionend",()=>e.classList.add("hidden"),{once:!0})}function oe(e){var l,m;const a=s.paragraphs.find(f=>f.pid===e);if(!a)return;u=e;const i=document.getElementById("compose-input");i.value=a.clean||a.raw,H(i);const r=document.getElementById("compose-add"),o=document.getElementById("compose-polish");r.textContent="Save",r.disabled=!1,o.disabled=!1,document.getElementById("edit-banner").classList.remove("hidden"),document.querySelectorAll(".para-wrap").forEach(f=>f.classList.remove("is-editing")),(l=document.querySelector(`[data-pid="${e}"]`))==null||l.classList.add("is-editing"),i.focus(),i.setSelectionRange(i.value.length,i.value.length),(m=document.getElementById("composer"))==null||m.scrollIntoView({behavior:"smooth",block:"nearest"})}function W(){u=null,document.getElementById("edit-banner").classList.add("hidden"),document.querySelectorAll(".para-wrap").forEach(e=>e.classList.remove("is-editing")),document.getElementById("compose-add").textContent="Add"}function re(e){s.paragraphs=s.paragraphs.filter(a=>a.pid!==e),p.delete(e),u===e&&W(),c(),j()}function z(e,a,i,r){const o=s.paragraphs.findIndex(l=>l.pid===e);o!==-1&&(s.paragraphs[o]={...s.paragraphs[o],raw:a,clean:i,type:r},p.delete(e),c(),j())}function ce(e){s.paragraphs.push(e),c(),V(),j()}function j(){d||!s||(d=!0,ne(s).then(()=>U("Saved")).catch(e=>U("Save failed: "+e.message)).finally(()=>{d=!1}))}function V(){const e=document.getElementById("draft-scroll");e&&(e.scrollTop=e.scrollHeight)}function le(){const e=document.getElementById("draft-scroll");let a=0,i=0,r=0,o=null,l=null,m=null,f=null,w=0,y=0,E=0,S=0,k=!1;const N=()=>document.querySelectorAll(".para-wrap");e.addEventListener("touchstart",B=>{const b=B.target.closest(".ai-para");b&&(o=b.querySelector(".para-polished"),l=b.querySelector(".para-original"),m=b.querySelector(".para-inner"),!(!o||!l||!m)&&(f=b,a=B.touches[0].clientX,i=B.touches[0].clientY,r=Date.now(),w=m.offsetWidth,y=b.classList.contains("is-swiped")?-w:0,E=o.scrollHeight,S=l.scrollHeight,k=!1))},{passive:!0}),e.addEventListener("touchmove",B=>{if(!o||!l||!m||!f)return;const b=B.touches[0].clientX-a,F=B.touches[0].clientY-i;if(!k){if(Math.abs(b)<6&&Math.abs(F)<6)return;if(Math.abs(F)>Math.abs(b)){o=l=m=f=null;return}k=!0,o.style.transition="none",l.style.transition="none",m.style.transition="none",m.style.height=m.offsetHeight+"px",N().forEach(I=>{I!==f&&I.classList.add("dimmed")})}const T=Math.max(-w,Math.min(0,y+b)),Q=Math.abs(T)/w;o.style.transform=`translateX(${T}px)`,l.style.transform=`translateX(calc(100% + ${T}px))`,m.style.height=E+(S-E)*Q+"px"},{passive:!0}),e.addEventListener("touchend",B=>{if(!o||!l||!m||!f)return;if(!k){o=l=m=f=null;return}const b=B.changedTouches[0].clientX-a,T=Math.abs(b)/Math.max(1,Date.now()-r)>.4?12:w*.28,I=f.classList.contains("is-swiped")?!(b>T):b<-T,Z=I?-w:0,he=I?S:E,_=o,R=l,Y=m,X=f;o=l=m=f=null,k=!1;const G="0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)";_.style.transition=`transform ${G}`,R.style.transition=`transform ${G}`,Y.style.transition=`height ${G}`,_.style.transform=`translateX(${Z}px)`,R.style.transform=`translateX(calc(100% + ${Z}px))`,Y.style.height=he+"px",_.addEventListener("transitionend",()=>{X.classList.toggle("is-swiped",I),I?p.add(X.dataset.pid):p.delete(X.dataset.pid),_.style.transform="",_.style.transition="",R.style.transform="",R.style.transition="",Y.style.transition="",I||(Y.style.height=""),N().forEach(ge=>ge.classList.remove("dimmed"))},{once:!0})},{passive:!0})}function de(){const e=document.getElementById("para-menu"),a=document.getElementById("para-menu-edit"),i=document.getElementById("para-menu-delete"),r=document.getElementById("draft-scroll");let o=null,l=null,m=!1;function f(y,E,S){o=S,i.textContent="✕  Delete",i.classList.remove("is-confirming"),e.classList.remove("hidden"),requestAnimationFrame(()=>{const{offsetWidth:k,offsetHeight:N}=e;e.style.left=Math.min(y,window.innerWidth-k-8)+"px",e.style.top=Math.min(E,window.innerHeight-N-8)+"px"})}function w(){e.classList.add("hidden"),o=null}r.addEventListener("touchstart",y=>{m=!1;const E=y.target.closest("[data-pid]");if(!E)return;const S=E.dataset.pid;l=setTimeout(()=>{m||f(y.touches[0].clientX,y.touches[0].clientY,S)},500)},{passive:!0}),r.addEventListener("touchmove",()=>{m=!0,l&&(clearTimeout(l),l=null)},{passive:!0}),r.addEventListener("touchend",()=>{l&&(clearTimeout(l),l=null)},{passive:!0}),r.addEventListener("contextmenu",y=>{const E=y.target.closest("[data-pid]");E&&(y.preventDefault(),f(y.clientX,y.clientY,E.dataset.pid))}),a.addEventListener("click",()=>{o&&oe(o),w()}),i.addEventListener("click",()=>{if(!i.classList.contains("is-confirming")){i.textContent="✕  Sure?",i.classList.add("is-confirming");return}o&&re(o),w()}),document.addEventListener("pointerdown",y=>{!e.classList.contains("hidden")&&!e.contains(y.target)&&w()})}function ue(){const e=window.visualViewport;if(!e)return;const a=document.getElementById("composer"),i=document.getElementById("review-sheet"),r=document.getElementById("draft-scroll"),o=()=>{const l=Math.max(0,window.innerHeight-(e.offsetTop+e.height));a.style.bottom=`${l}px`,i.style.bottom=`${l}px`,r.style.paddingBottom=`${a.offsetHeight+l+16}px`};e.addEventListener("resize",o),e.addEventListener("scroll",o),o()}function pe(){const e=document.getElementById("theme-btn"),a=()=>{const i=document.documentElement.classList.contains("dark");e.textContent=i?"☀":"☾"};a(),e.addEventListener("click",()=>{const i=document.documentElement,r=i.classList.contains("dark");i.classList.toggle("dark",!r),i.classList.toggle("light",r),localStorage.setItem("bb_theme",r?"light":"dark"),a()})}function me(){document.getElementById("warmup-btn").addEventListener("click",async()=>{const e=document.getElementById("warmup-panel"),a=document.getElementById("warmup-body");e.classList.remove("hidden"),a.innerHTML='<p class="muted-text">Thinking…</p>';const i=s.paragraphs.slice(-5).map(o=>o.clean||o.raw).join(`

`),r=await $e(i);a.innerHTML=r.length?r.map(o=>`<p class="warmup-q">${K(o)}</p>`).join(""):'<p class="muted-text">Could not generate prompts.</p>'}),document.getElementById("close-warmup").addEventListener("click",()=>{document.getElementById("warmup-panel").classList.add("hidden")})}}function K(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const Oe=localStorage.getItem("bb_theme");Oe==="light"&&document.documentElement.classList.replace("dark","light");function ae(){const t=location.hash.slice(1)||"/",n=document.getElementById("app");n.innerHTML="";const s=t.match(/^\/scenes\/(.+)$/);if(s){Ae(n,s[1]);return}if(t==="/settings"){Me(n);return}Ie(n)}window.addEventListener("hashchange",ae);ae();
