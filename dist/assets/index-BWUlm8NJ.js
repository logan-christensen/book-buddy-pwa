(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))h(l);new MutationObserver(l=>{for(const c of l)if(c.type==="childList")for(const p of c.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&h(p)}).observe(document,{childList:!0,subtree:!0});function s(l){const c={};return l.integrity&&(c.integrity=l.integrity),l.referrerPolicy&&(c.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?c.credentials="include":l.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function h(l){if(l.ep)return;l.ep=!0;const c=s(l);fetch(l.href,c)}})();const v={anthropicKey:"bb_anthropic_key",githubToken:"bb_github_token",githubOwner:"bb_github_owner",githubRepo:"bb_github_repo",githubBranch:"bb_github_branch",emailAddress:"bb_email"};function x(){return{anthropicKey:localStorage.getItem(v.anthropicKey)??"",githubToken:localStorage.getItem(v.githubToken)??"",githubOwner:localStorage.getItem(v.githubOwner)??"",githubRepo:localStorage.getItem(v.githubRepo)??"",githubBranch:localStorage.getItem(v.githubBranch)??"main",emailAddress:localStorage.getItem(v.emailAddress)??""}}function me(t){for(const[n,s]of Object.entries(v)){const h=t[n];h!==void 0&&localStorage.setItem(s,h)}}function ge(){const t=x();return!!(t.anthropicKey&&t.githubToken&&t.githubOwner&&t.githubRepo)}function fe(t){const n=t.paragraphs.map(s=>s.clean||s.raw).filter(Boolean).join(`

`);return`# ${t.name}

${n}
`}const ye="https://api.github.com";async function M(t,n={}){const{githubToken:s,githubOwner:h,githubRepo:l}=x(),c=await fetch(`${ye}/repos/${h}/${l}${t}`,{...n,headers:{Authorization:`Bearer ${s}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...n.headers??{}}});if(!c.ok){const p=await c.json().catch(()=>({}));throw new Error((p==null?void 0:p.message)??`GitHub ${c.status}`)}return c.json()}function z(t){return btoa(unescape(encodeURIComponent(t)))}async function J(t,n,s,h){let l;try{l=(await M(`/contents/${t}`)).sha}catch{}await M(`/contents/${t}`,{method:"PUT",body:JSON.stringify({message:s,content:n,branch:h,...l?{sha:l}:{}})})}async function be(){try{return(await M("/contents/scenes")).filter(n=>n.name.endsWith(".json")).map(n=>n.name.replace(".json",""))}catch{return[]}}async function ve(t){try{const n=await M(`/contents/scenes/${t}.json`),s=decodeURIComponent(escape(atob(n.content.replace(/\s/g,""))));return JSON.parse(s)}catch{return null}}async function V(t){const{githubBranch:n}=x();await J(`scenes/${t.slug}.json`,z(JSON.stringify(t,null,2)),`Update scene: ${t.name}`,n),await J(`scenes/${t.slug}.md`,z(fe(t)),`Update markdown: ${t.name}`,n)}async function we(t){const n=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),s={name:t,slug:n,created_at:new Date().toISOString(),paragraphs:[]};return await V(s),s}function Ee(t){t.innerHTML=`
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
  `;const n=document.getElementById("new-name"),s=document.getElementById("create-btn");if(s.addEventListener("click",()=>l()),n.addEventListener("keydown",c=>{c.key==="Enter"&&l()}),!ge()){document.getElementById("scenes-container").innerHTML=`
      <div class="empty-state">
        <p>Configure your settings to get started.</p>
        <a href="#/settings" class="btn-primary">Open Settings →</a>
      </div>
    `;return}h();async function h(){const c=document.getElementById("scenes-container");if(c)try{const p=await be();if(!p.length){c.innerHTML='<div class="empty-state"><p>No scenes yet. Create your first one below.</p></div>';return}c.className="scenes-list",c.innerHTML=p.map(f=>`
        <a href="#/scenes/${f}" class="scene-card">
          <span class="scene-name">${Ie(f)}</span>
          <span>→</span>
        </a>
      `).join("")}catch(p){c.innerHTML=`<div class="error-state">${p.message}</div>`}}async function l(){const c=n.value.trim();if(c){s.disabled=!0,s.textContent="…";try{const p=await we(c);location.hash=`#/scenes/${p.slug}`}catch(p){alert("Error: "+p.message),s.disabled=!1,s.textContent="Create"}}}}function Ie(t){return t.replace(/-/g," ").replace(/\b\w/g,n=>n.toUpperCase())}const Be="https://api.anthropic.com/v1/messages";async function Q(t,n,s=1024){var p;const{anthropicKey:h}=x(),l=await fetch(Be,{method:"POST",headers:{"x-api-key":h,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","content-type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:s,system:t,messages:[{role:"user",content:n}]})});if(!l.ok){const f=await l.json().catch(()=>({}));throw new Error(((p=f==null?void 0:f.error)==null?void 0:p.message)??`Claude API error ${l.status}`)}return(await l.json()).content[0].text.trim()}async function Se(t,n=""){const s=n?`Previous context:
${n}

---

New dictation to clean up:
${t}`:`Clean up this dictated text:
${t}`;return Q(xe,s,1024)}async function Le(t){try{return(await Q(ke,t,300)).split(`
`).filter(Boolean)}catch{return[]}}const xe=`You are a prose editor working with a novelist on a draft manuscript.

Your job is to clean up raw dictated or typed text into polished, readable prose. You must:
- Fix grammar, punctuation, and sentence flow
- Remove dictation artifacts ("um", "uh", repeated words, false starts)
- Preserve the author's voice, style, and all narrative choices
- Never advance the plot, add new events, or invent details
- Keep every idea present in the raw input — just express it cleanly
- Split into natural paragraphs where appropriate
- Return ONLY the cleaned prose — no commentary, no meta-text, no "Here is the cleaned version:"

Output one or more prose paragraphs, each separated by a blank line. Nothing else.`,ke=`You are a writing coach helping a novelist get back into their story.

Given recent draft content, generate 3 short questions that will help the writer re-engage with the scene. Questions should be about character motivation, sensory details, or what happens next. Be specific to the actual content — no generic advice.

Output exactly 3 questions, one per line, no numbering, no extra text.`;function $e(t){const n=x();t.innerHTML=`
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
            <input type="password" id="s-anthropic" value="${B(n.anthropicKey)}" placeholder="sk-ant-…" autocomplete="off">
          </label>
        </section>

        <section class="settings-section">
          <h2>GitHub Storage</h2>
          <p class="settings-help">Scenes save as <code>.json</code> + <code>.md</code> files. <a href="https://github.com/settings/tokens/new?scopes=repo&description=BookBuddy" target="_blank" rel="noopener">Create a token →</a></p>
          <label class="field">
            <span>Personal Access Token</span>
            <input type="password" id="s-gh-token" value="${B(n.githubToken)}" placeholder="ghp_…" autocomplete="off">
          </label>
          <label class="field">
            <span>Owner</span>
            <input type="text" id="s-gh-owner" value="${B(n.githubOwner)}" placeholder="your-username">
          </label>
          <label class="field">
            <span>Repository</span>
            <input type="text" id="s-gh-repo" value="${B(n.githubRepo)}" placeholder="my-novel">
          </label>
          <label class="field">
            <span>Branch</span>
            <input type="text" id="s-gh-branch" value="${B(n.githubBranch)}" placeholder="main">
          </label>
        </section>

        <section class="settings-section">
          <h2>Daily Email</h2>
          <p class="settings-help">Set <code>ANTHROPIC_API_KEY</code>, <code>RESEND_API_KEY</code>, and <code>EMAIL_ADDRESS</code> as secrets in your GitHub repo to enable the daily questions workflow.</p>
          <label class="field">
            <span>Your Email</span>
            <input type="email" id="s-email" value="${B(n.emailAddress)}" placeholder="you@example.com">
          </label>
        </section>

        <button class="btn-primary full-width" id="s-save">Save</button>
      </div>
    </div>
  `,document.getElementById("s-save").addEventListener("click",()=>{me({anthropicKey:I("s-anthropic"),githubToken:I("s-gh-token"),githubOwner:I("s-gh-owner"),githubRepo:I("s-gh-repo"),githubBranch:I("s-gh-branch")||"main",emailAddress:I("s-email")}),O("Settings saved")})}function I(t){return document.getElementById(t).value.trim()}function B(t){return t.replace(/"/g,"&quot;")}function O(t){const n=document.createElement("div");n.className="toast",n.textContent=t,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("toast-show")),setTimeout(()=>{n.classList.remove("toast-show"),setTimeout(()=>n.remove(),300)},2200)}async function Te(t,n){t.innerHTML=`
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
  `;let s=null,h=null,l=!1;const c=new Set;try{s=await ve(n)}catch(e){t.innerHTML=`<div class="error-state">Failed to load: ${e.message}</div>`;return}if(!s){t.innerHTML='<div class="error-state">Scene not found.</div>';return}document.getElementById("scene-title").textContent=s.name,p(),ee(),ce(),de(),pe(),le();function p(){var a;const e=document.getElementById("draft-paras");if(!s.paragraphs.length){e.innerHTML='<p class="draft-empty">Start writing below.</p>';return}e.innerHTML=s.paragraphs.map(f).join(""),c.forEach(o=>{const r=e.querySelector(`[data-pid="${o}"]`);if(!r)return;const i=r.querySelector(".para-polished"),d=r.querySelector(".para-original"),u=r.querySelector(".para-inner");!i||!d||!u||(i.style.transition="none",d.style.transition="none",u.style.transition="none",u.style.height=d.scrollHeight+"px",r.classList.add("is-swiped"),requestAnimationFrame(()=>{i.style.transition="",d.style.transition="",u.style.transition=""}))}),h&&((a=e.querySelector(`[data-pid="${h}"]`))==null||a.classList.add("is-editing")),e.querySelectorAll(".para-edit-btn").forEach(o=>{o.addEventListener("click",r=>{var d;r.stopPropagation();const i=(d=o.closest("[data-pid]"))==null?void 0:d.dataset.pid;i&&ie(i)})})}function f(e){return e.type==="ai"&&e.raw&&e.raw!==e.clean?`
        <div class="para-wrap ai-para" data-pid="${e.pid}">
          <div class="para-inner">
            <div class="para-polished">
              <div class="accent-bar accent-amber"></div>
              <p class="para-text">${C(e.clean)}</p>
            </div>
            <div class="para-original">
              <div class="accent-bar accent-blue"></div>
              <p class="para-text para-orig-text">${C(e.raw)}</p>
            </div>
          </div>
          <button class="para-edit-btn" title="Edit paragraph">✎</button>
        </div>`:`
      <div class="para-wrap" data-pid="${e.pid}">
        <p class="para-text">${C(e.clean||e.raw)}</p>
        <button class="para-edit-btn" title="Edit paragraph">✎</button>
      </div>`}function ee(){const e=document.getElementById("compose-input"),a=document.getElementById("compose-add"),o=document.getElementById("compose-polish");e.addEventListener("input",()=>{N(e);const r=e.value.trim().length>0;a.disabled=!r,o.disabled=!r}),a.addEventListener("click",ne),o.addEventListener("click",te),document.getElementById("cancel-edit-btn").addEventListener("click",Y),document.getElementById("commit-review-btn").addEventListener("click",se),document.getElementById("discard-review-btn").addEventListener("click",ae)}function N(e){e.style.height="auto",e.style.height=Math.min(e.scrollHeight,200)+"px"}async function te(){const a=document.getElementById("compose-input").value.trim();if(a){k(!0);try{const o=s.paragraphs.slice(-3).map(i=>i.clean||i.raw).join(`

`),r=await Se(a,o);oe(r)}catch(o){O("AI error: "+o.message),k(!1)}}}function ne(){const a=document.getElementById("compose-input").value.trim();a&&(h?D(h,a,a,"typed"):re({pid:crypto.randomUUID(),raw:a,clean:a,type:"typed",created_at:new Date().toISOString()}),R())}function se(){const e=document.getElementById("compose-input"),a=document.getElementById("review-text"),o=e.value.trim(),r=a.innerText.trim();K(),k(!1);const i=r.split(/\n\n+/).filter(Boolean),d=new Date().toISOString();h?D(h,o,r,"ai"):(i.forEach((u,m)=>{s.paragraphs.push({pid:crypto.randomUUID(),raw:m===0?o:"",clean:u.trim(),type:"ai",created_at:d})}),p(),U(),H()),R()}function ae(){K(),k(!1)}function k(e){const a=document.getElementById("compose-input"),o=document.getElementById("compose-add"),r=document.getElementById("compose-polish");a.disabled=e,o.disabled=e,r.disabled=e,r.textContent=e?"…":"Polish ✦"}function R(){const e=document.getElementById("compose-input");e.value="",e.style.height="",e.disabled=!1,document.getElementById("compose-add").disabled=!0,document.getElementById("compose-add").textContent="Add",document.getElementById("compose-polish").disabled=!0,document.getElementById("compose-polish").textContent="Polish ✦",Y()}function oe(e){const a=document.getElementById("review-sheet");document.getElementById("review-text").innerText=e,a.classList.remove("hidden"),requestAnimationFrame(()=>requestAnimationFrame(()=>a.classList.add("is-visible")))}function K(){const e=document.getElementById("review-sheet");e.classList.remove("is-visible"),e.addEventListener("transitionend",()=>e.classList.add("hidden"),{once:!0})}function ie(e){var d,u;const a=s.paragraphs.find(m=>m.pid===e);if(!a)return;h=e;const o=document.getElementById("compose-input");o.value=a.clean||a.raw,N(o);const r=document.getElementById("compose-add"),i=document.getElementById("compose-polish");r.textContent="Save",r.disabled=!1,i.disabled=!1,document.getElementById("edit-banner").classList.remove("hidden"),document.querySelectorAll(".para-wrap").forEach(m=>m.classList.remove("is-editing")),(d=document.querySelector(`[data-pid="${e}"]`))==null||d.classList.add("is-editing"),o.focus(),o.setSelectionRange(o.value.length,o.value.length),(u=document.getElementById("composer"))==null||u.scrollIntoView({behavior:"smooth",block:"nearest"})}function Y(){h=null,document.getElementById("edit-banner").classList.add("hidden"),document.querySelectorAll(".para-wrap").forEach(e=>e.classList.remove("is-editing")),document.getElementById("compose-add").textContent="Add"}function D(e,a,o,r){const i=s.paragraphs.findIndex(d=>d.pid===e);i!==-1&&(s.paragraphs[i]={...s.paragraphs[i],raw:a,clean:o,type:r},c.delete(e),p(),H())}function re(e){s.paragraphs.push(e),p(),U(),H()}function H(){l||!s||(l=!0,V(s).then(()=>O("Saved")).catch(e=>O("Save failed: "+e.message)).finally(()=>{l=!1}))}function U(){const e=document.getElementById("draft-scroll");e&&(e.scrollTop=e.scrollHeight)}function ce(){const e=document.getElementById("draft-scroll");let a=0,o=0,r=0,i=null,d=null,u=null,m=null,w=0,W=0,$=0,P=0,S=!1;const F=()=>document.querySelectorAll(".para-wrap");e.addEventListener("touchstart",y=>{const g=y.target.closest(".ai-para");g&&(i=g.querySelector(".para-polished"),d=g.querySelector(".para-original"),u=g.querySelector(".para-inner"),!(!i||!d||!u)&&(m=g,a=y.touches[0].clientX,o=y.touches[0].clientY,r=Date.now(),w=u.offsetWidth,W=g.classList.contains("is-swiped")?-w:0,$=i.scrollHeight,P=d.scrollHeight,S=!1))},{passive:!0}),e.addEventListener("touchmove",y=>{if(!i||!d||!u||!m)return;const g=y.touches[0].clientX-a,_=y.touches[0].clientY-o;if(!S){if(Math.abs(g)<6&&Math.abs(_)<6)return;if(Math.abs(_)>Math.abs(g)){i=d=u=m=null;return}S=!0,i.style.transition="none",d.style.transition="none",u.style.transition="none",u.style.height=u.offsetHeight+"px",F().forEach(b=>{b!==m&&b.classList.add("dimmed")})}const E=Math.max(-w,Math.min(0,W+g)),X=Math.abs(E)/w;i.style.transform=`translateX(${E}px)`,d.style.transform=`translateX(calc(100% + ${E}px))`,u.style.height=$+(P-$)*X+"px"},{passive:!0}),e.addEventListener("touchend",y=>{if(!i||!d||!u||!m)return;if(!S){i=d=u=m=null;return}const g=y.changedTouches[0].clientX-a,E=Math.abs(g)/Math.max(1,Date.now()-r)>.4?12:w*.28,b=m.classList.contains("is-swiped")?!(g>E):g<-E,G=b?-w:0,ue=b?P:$,L=i,T=d,A=u,q=m;i=d=u=m=null,S=!1;const j="0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)";L.style.transition=`transform ${j}`,T.style.transition=`transform ${j}`,A.style.transition=`height ${j}`,L.style.transform=`translateX(${G}px)`,T.style.transform=`translateX(calc(100% + ${G}px))`,A.style.height=ue+"px",L.addEventListener("transitionend",()=>{q.classList.toggle("is-swiped",b),b?c.add(q.dataset.pid):c.delete(q.dataset.pid),L.style.transform="",L.style.transition="",T.style.transform="",T.style.transition="",A.style.transition="",b||(A.style.height=""),F().forEach(he=>he.classList.remove("dimmed"))},{once:!0})},{passive:!0})}function le(){const e=window.visualViewport;if(!e)return;const a=document.getElementById("composer"),o=document.getElementById("review-sheet"),r=document.getElementById("draft-scroll"),i=()=>{const d=Math.max(0,window.innerHeight-(e.offsetTop+e.height));a.style.bottom=`${d}px`,o.style.bottom=`${d}px`,r.style.paddingBottom=`${a.offsetHeight+d+16}px`};e.addEventListener("resize",i),e.addEventListener("scroll",i),i()}function de(){const e=document.getElementById("theme-btn"),a=()=>{const o=document.documentElement.classList.contains("dark");e.textContent=o?"☀":"☾"};a(),e.addEventListener("click",()=>{const o=document.documentElement,r=o.classList.contains("dark");o.classList.toggle("dark",!r),o.classList.toggle("light",r),localStorage.setItem("bb_theme",r?"light":"dark"),a()})}function pe(){document.getElementById("warmup-btn").addEventListener("click",async()=>{const e=document.getElementById("warmup-panel"),a=document.getElementById("warmup-body");e.classList.remove("hidden"),a.innerHTML='<p class="muted-text">Thinking…</p>';const o=s.paragraphs.slice(-5).map(i=>i.clean||i.raw).join(`

`),r=await Le(o);a.innerHTML=r.length?r.map(i=>`<p class="warmup-q">${C(i)}</p>`).join(""):'<p class="muted-text">Could not generate prompts.</p>'}),document.getElementById("close-warmup").addEventListener("click",()=>{document.getElementById("warmup-panel").classList.add("hidden")})}}function C(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const Ae=localStorage.getItem("bb_theme");Ae==="light"&&document.documentElement.classList.replace("dark","light");function Z(){const t=location.hash.slice(1)||"/",n=document.getElementById("app");n.innerHTML="";const s=t.match(/^\/scenes\/(.+)$/);if(s){Te(n,s[1]);return}if(t==="/settings"){$e(n);return}Ee(n)}window.addEventListener("hashchange",Z);Z();
