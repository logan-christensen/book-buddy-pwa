(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const p of document.querySelectorAll('link[rel="modulepreload"]'))m(p);new MutationObserver(p=>{for(const h of p)if(h.type==="childList")for(const r of h.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&m(r)}).observe(document,{childList:!0,subtree:!0});function s(p){const h={};return p.integrity&&(h.integrity=p.integrity),p.referrerPolicy&&(h.referrerPolicy=p.referrerPolicy),p.crossOrigin==="use-credentials"?h.credentials="include":p.crossOrigin==="anonymous"?h.credentials="omit":h.credentials="same-origin",h}function m(p){if(p.ep)return;p.ep=!0;const h=s(p);fetch(p.href,h)}})();const M={anthropicKey:"bb_anthropic_key",githubToken:"bb_github_token",githubOwner:"bb_github_owner",githubRepo:"bb_github_repo",githubBranch:"bb_github_branch",emailAddress:"bb_email"};function _(){return{anthropicKey:localStorage.getItem(M.anthropicKey)??"",githubToken:localStorage.getItem(M.githubToken)??"",githubOwner:localStorage.getItem(M.githubOwner)??"",githubRepo:localStorage.getItem(M.githubRepo)??"",githubBranch:localStorage.getItem(M.githubBranch)??"main",emailAddress:localStorage.getItem(M.emailAddress)??""}}function ve(t){for(const[n,s]of Object.entries(M)){const m=t[n];m!==void 0&&localStorage.setItem(s,m)}}function be(){const t=_();return!!(t.anthropicKey&&t.githubToken&&t.githubOwner&&t.githubRepo)}function ye(t){const n=t.paragraphs.map(s=>s.clean||s.raw).filter(Boolean).join(`

`);return`# ${t.name}

${n}
`}const we="https://api.github.com";async function q(t,n={}){const{githubToken:s,githubOwner:m,githubRepo:p}=_(),h=await fetch(`${we}/repos/${m}/${p}${t}`,{...n,headers:{Authorization:`Bearer ${s}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...n.headers??{}}});if(!h.ok){const r=await h.json().catch(()=>({}));throw new Error((r==null?void 0:r.message)??`GitHub ${h.status}`)}return h.json()}function se(t){return btoa(unescape(encodeURIComponent(t)))}async function ae(t,n,s,m){let p;try{p=(await q(`/contents/${t}`)).sha}catch{}await q(`/contents/${t}`,{method:"PUT",body:JSON.stringify({message:s,content:n,branch:m,...p?{sha:p}:{}})})}async function Ee(){try{return(await q("/contents/scenes")).filter(n=>n.name.endsWith(".json")).map(n=>n.name.replace(".json",""))}catch{return[]}}async function ie(t){try{const n=await q(`/contents/scenes/${t}.json`),s=decodeURIComponent(escape(atob(n.content.replace(/\s/g,""))));return JSON.parse(s)}catch{return null}}async function Q(t){const{githubBranch:n}=_();await ae(`scenes/${t.slug}.json`,se(JSON.stringify(t,null,2)),`Update scene: ${t.name}`,n),await ae(`scenes/${t.slug}.md`,se(ye(t)),`Update markdown: ${t.name}`,n)}async function Le(t,n){const s=await ie(t);if(!s)throw new Error("Scene not found");s.name=n,await Q(s)}async function Se(t){const{githubBranch:n}=_();async function s(m){try{const p=await q(`/contents/${m}`);await q(`/contents/${m}`,{method:"DELETE",body:JSON.stringify({message:`Delete scene: ${t}`,sha:p.sha,branch:n})})}catch{}}await s(`scenes/${t}.json`),await s(`scenes/${t}.md`)}async function Be(t){const n=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),s={name:t,slug:n,created_at:new Date().toISOString(),paragraphs:[]};return await Q(s),s}function xe(t){t.innerHTML=`
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
  `;const n=document.getElementById("new-name"),s=document.getElementById("create-btn");if(s.addEventListener("click",()=>h()),n.addEventListener("keydown",r=>{r.key==="Enter"&&h()}),!be()){document.getElementById("scenes-container").innerHTML=`
      <div class="empty-state">
        <p>Configure your settings to get started.</p>
        <a href="#/settings" class="btn-primary">Open Settings →</a>
      </div>
    `;return}m();async function m(){const r=document.getElementById("scenes-container");if(r)try{const f=await Ee();if(!f.length){r.innerHTML='<div class="empty-state"><p>No scenes yet. Create your first one below.</p></div>';return}r.className="scenes-list",r.innerHTML=f.map(S=>{const B=Ie(S);return`
          <div class="scene-card" data-slug="${S}" data-name="${B}">
            <a href="#/scenes/${S}" class="scene-card-link">
              <span class="scene-name">${B}</span>
            </a>
            <span class="scene-card-arrow">→</span>
            <div class="scene-card-actions">
              <button class="scene-rename-btn">Rename</button>
              <button class="scene-delete-btn">Delete</button>
            </div>
            <input class="scene-rename-input" type="text" value="${B}" maxlength="100">
            <div class="scene-rename-actions">
              <button class="scene-save-btn">Save</button>
              <button class="scene-cancel-btn">✕</button>
            </div>
          </div>`}).join(""),p(r)}catch(f){r.innerHTML=`<div class="error-state">${f.message}</div>`}}function p(r){let f=null,S=!1;function B(c){T(),c.classList.add("is-armed")}function F(c){c.classList.remove("is-armed"),c.classList.add("is-renaming");const d=c.querySelector(".scene-rename-input");d.value=c.dataset.name??"",d.focus(),d.select()}function T(){r.querySelectorAll(".scene-card.is-armed, .scene-card.is-renaming").forEach(c=>{c.classList.remove("is-armed","is-renaming"),c.querySelector(".scene-delete-btn").textContent="Delete",c.querySelector(".scene-delete-btn").classList.remove("is-confirming")})}r.addEventListener("touchstart",c=>{S=!1;const d=c.target.closest(".scene-card");d&&(f=setTimeout(()=>{S||B(d)},500))},{passive:!0}),r.addEventListener("touchmove",()=>{S=!0,f&&(clearTimeout(f),f=null)},{passive:!0}),r.addEventListener("touchend",()=>{f&&(clearTimeout(f),f=null)},{passive:!0}),r.addEventListener("contextmenu",c=>{const d=c.target.closest(".scene-card");d&&(c.preventDefault(),B(d))}),r.addEventListener("click",c=>{const d=c.target.closest(".scene-card");if(!d)return;const L=c.target.closest(".scene-card-actions, .scene-rename-actions, .scene-rename-input");(d.classList.contains("is-armed")||d.classList.contains("is-renaming"))&&!L&&(T(),c.preventDefault())},!0),r.addEventListener("click",c=>{const d=c.target.closest(".scene-rename-btn");if(!d)return;const L=d.closest(".scene-card");F(L)});async function j(c){const d=c.dataset.slug,I=c.querySelector(".scene-rename-input").value.trim();if(!I||I===c.dataset.name){T();return}const x=c.querySelector(".scene-save-btn");x.textContent="…",x.disabled=!0;try{await Le(d,I),await m()}catch(X){alert("Rename failed: "+X.message),x.textContent="Save",x.disabled=!1}}r.addEventListener("click",c=>{const d=c.target.closest(".scene-save-btn");d&&j(d.closest(".scene-card"))}),r.addEventListener("keydown",c=>{if(c.key!=="Enter")return;const d=c.target.closest(".scene-rename-input");d&&j(d.closest(".scene-card"))}),r.addEventListener("click",c=>{c.target.closest(".scene-cancel-btn")&&T()}),r.addEventListener("click",c=>{var I;const d=c.target.closest(".scene-delete-btn");if(!d)return;if(c.preventDefault(),!d.classList.contains("is-confirming")){d.textContent="Sure?",d.classList.add("is-confirming");return}const L=(I=d.closest("[data-slug]"))==null?void 0:I.dataset.slug;L&&(d.textContent="…",d.disabled=!0,Se(L).then(()=>m()).catch(x=>{alert("Delete failed: "+x.message),m()}))}),document.addEventListener("pointerdown",c=>{r.contains(c.target)||T()})}async function h(){const r=n.value.trim();if(r){s.disabled=!0,s.textContent="…";try{const f=await Be(r);location.hash=`#/scenes/${f.slug}`}catch(f){alert("Error: "+f.message),s.disabled=!1,s.textContent="Create"}}}}function Ie(t){return t.replace(/-/g," ").replace(/\b\w/g,n=>n.toUpperCase())}const ke="https://api.anthropic.com/v1/messages";async function oe(t,n,s=1024){var r;const{anthropicKey:m}=_(),p=await fetch(ke,{method:"POST",headers:{"x-api-key":m,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","content-type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:s,system:t,messages:[{role:"user",content:n}]})});if(!p.ok){const f=await p.json().catch(()=>({}));throw new Error(((r=f==null?void 0:f.error)==null?void 0:r.message)??`Claude API error ${p.status}`)}return(await p.json()).content[0].text.trim()}async function $e(t,n=""){const s=n?`Previous context:
${n}

---

New dictation to clean up:
${t}`:`Clean up this dictated text:
${t}`;return oe(Ce,s,1024)}async function Te(t){try{return(await oe(Ae,t,300)).split(`
`).filter(Boolean)}catch{return[]}}const Ce=`You are a prose editor working with a novelist on a draft manuscript.

Your job is to clean up raw dictated or typed text into polished, readable prose. You must:
- Fix grammar, punctuation, and sentence flow
- Remove dictation artifacts ("um", "uh", repeated words, false starts)
- Preserve the author's voice, style, and all narrative choices
- Never advance the plot, add new events, or invent details
- Keep every idea present in the raw input — just express it cleanly
- Preserve the paragraph structure of the input: one polished paragraph for each input paragraph
- If the input has no paragraph breaks, output a single paragraph
- Return ONLY the cleaned prose — no commentary, no meta-text, no "Here is the cleaned version:"

Output one or more prose paragraphs, each separated by a blank line. Nothing else.`,Ae=`You are a writing coach helping a novelist get back into their story.

Given recent draft content, generate 3 short questions that will help the writer re-engage with the scene. Questions should be about character motivation, sensory details, or what happens next. Be specific to the actual content — no generic advice.

Output exactly 3 questions, one per line, no numbering, no extra text.`;function Me(t){const n=_();t.innerHTML=`
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
            <input type="password" id="s-anthropic" value="${P(n.anthropicKey)}" placeholder="sk-ant-…" autocomplete="off">
          </label>
        </section>

        <section class="settings-section">
          <h2>GitHub Storage</h2>
          <p class="settings-help">Scenes save as <code>.json</code> + <code>.md</code> files. <a href="https://github.com/settings/tokens/new?scopes=repo&description=BookBuddy" target="_blank" rel="noopener">Create a token →</a></p>
          <label class="field">
            <span>Personal Access Token</span>
            <input type="password" id="s-gh-token" value="${P(n.githubToken)}" placeholder="ghp_…" autocomplete="off">
          </label>
          <label class="field">
            <span>Owner</span>
            <input type="text" id="s-gh-owner" value="${P(n.githubOwner)}" placeholder="your-username">
          </label>
          <label class="field">
            <span>Repository</span>
            <input type="text" id="s-gh-repo" value="${P(n.githubRepo)}" placeholder="my-novel">
          </label>
          <label class="field">
            <span>Branch</span>
            <input type="text" id="s-gh-branch" value="${P(n.githubBranch)}" placeholder="main">
          </label>
        </section>

        <section class="settings-section">
          <h2>Daily Email</h2>
          <p class="settings-help">Set <code>ANTHROPIC_API_KEY</code>, <code>RESEND_API_KEY</code>, and <code>EMAIL_ADDRESS</code> as secrets in your GitHub repo to enable the daily questions workflow.</p>
          <label class="field">
            <span>Your Email</span>
            <input type="email" id="s-email" value="${P(n.emailAddress)}" placeholder="you@example.com">
          </label>
        </section>

        <button class="btn-primary full-width" id="s-save">Save</button>
      </div>
    </div>
  `,document.getElementById("s-save").addEventListener("click",()=>{ve({anthropicKey:H("s-anthropic"),githubToken:H("s-gh-token"),githubOwner:H("s-gh-owner"),githubRepo:H("s-gh-repo"),githubBranch:H("s-gh-branch")||"main",emailAddress:H("s-email")}),W("Settings saved")})}function H(t){return document.getElementById(t).value.trim()}function P(t){return t.replace(/"/g,"&quot;")}function W(t){const n=document.createElement("div");n.className="toast",n.textContent=t,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("toast-show")),setTimeout(()=>{n.classList.remove("toast-show"),setTimeout(()=>n.remove(),300)},2200)}async function Oe(t,n){t.innerHTML=`
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
  `;let s=null,m=null,p=!1;const h=new Set;try{s=await ie(n)}catch(e){t.innerHTML=`<div class="error-state">Failed to load: ${e.message}</div>`;return}if(!s){t.innerHTML='<div class="error-state">Scene not found.</div>';return}document.getElementById("scene-title").textContent=s.name,r(),S(),de(),ue(),me(),he(),pe();function r(){var a;const e=document.getElementById("draft-paras");if(!s.paragraphs.length){e.innerHTML='<p class="draft-empty">Start writing below.</p>';return}e.innerHTML=s.paragraphs.map(f).join(""),h.forEach(i=>{const l=e.querySelector(`[data-pid="${i}"]`);if(!l)return;const o=l.querySelector(".para-polished"),u=l.querySelector(".para-original"),g=l.querySelector(".para-inner");!o||!u||!g||(o.style.transition="none",u.style.transition="none",g.style.transition="none",g.style.height=u.scrollHeight+"px",l.classList.add("is-swiped"),requestAnimationFrame(()=>{o.style.transition="",u.style.transition="",g.style.transition=""}))}),m&&((a=e.querySelector(`[data-pid="${m}"]`))==null||a.classList.add("is-editing"))}function f(e){return e.type==="ai"&&e.raw&&e.raw!==e.clean?`
        <div class="para-wrap ai-para" data-pid="${e.pid}">
          <div class="para-inner">
            <div class="para-polished">
              <div class="accent-bar accent-amber"></div>
              <p class="para-text">${U(e.clean)}</p>
            </div>
            <div class="para-original">
              <div class="accent-bar accent-blue"></div>
              <p class="para-text para-orig-text">${U(e.raw)}</p>
            </div>
          </div>
        </div>`:`
      <div class="para-wrap" data-pid="${e.pid}">
        <p class="para-text">${U(e.clean||e.raw)}</p>
      </div>`}function S(){const e=document.getElementById("compose-input"),a=document.getElementById("compose-add"),i=document.getElementById("compose-polish");e.addEventListener("input",()=>{B(e);const l=e.value.trim().length>0;a.disabled=!l,i.disabled=!l}),a.addEventListener("click",T),i.addEventListener("click",F),document.getElementById("cancel-edit-btn").addEventListener("click",G),document.getElementById("commit-review-btn").addEventListener("click",j),document.getElementById("discard-review-btn").addEventListener("click",c)}function B(e){e.style.height="auto",e.style.height=Math.min(e.scrollHeight,200)+"px"}async function F(){const a=document.getElementById("compose-input").value.trim();if(a){d(!0);try{const i=s.paragraphs.slice(-3).map(o=>o.clean||o.raw).join(`

`),l=await $e(a,i);I(l)}catch(i){W("AI error: "+i.message),d(!1)}}}function T(){const a=document.getElementById("compose-input").value.trim();a&&(m?Z(m,a,a,"typed"):le({pid:crypto.randomUUID(),raw:a,clean:a,type:"typed",created_at:new Date().toISOString()}),L())}function j(){const e=document.getElementById("compose-input"),a=document.getElementById("review-text"),i=e.value.trim(),l=a.innerText.trim();x(),d(!1);const o=l.split(/\n\n+/).map(v=>v.trim()).filter(Boolean),u=i.split(/\n\n+/).map(v=>v.trim()).filter(Boolean),g=new Date().toISOString();m?Z(m,i,l,"ai"):(o.forEach((v,w)=>{s.paragraphs.push({pid:crypto.randomUUID(),raw:u[w]??"",clean:v,type:"ai",created_at:g})}),r(),ee(),R()),L()}function c(){x(),d(!1)}function d(e){const a=document.getElementById("compose-input"),i=document.getElementById("compose-add"),l=document.getElementById("compose-polish");a.disabled=e,i.disabled=e,l.disabled=e,l.textContent=e?"…":"Polish ✦"}function L(){const e=document.getElementById("compose-input");e.value="",e.style.height="",e.disabled=!1,document.getElementById("compose-add").disabled=!0,document.getElementById("compose-add").textContent="Add",document.getElementById("compose-polish").disabled=!0,document.getElementById("compose-polish").textContent="Polish ✦",G()}function I(e){const a=document.getElementById("review-sheet");document.getElementById("review-text").innerText=e,a.classList.remove("hidden"),requestAnimationFrame(()=>requestAnimationFrame(()=>a.classList.add("is-visible")))}function x(){const e=document.getElementById("review-sheet");e.classList.remove("is-visible"),e.addEventListener("transitionend",()=>e.classList.add("hidden"),{once:!0})}function X(e){var u,g;const a=s.paragraphs.find(v=>v.pid===e);if(!a)return;m=e;const i=document.getElementById("compose-input");i.value=a.clean||a.raw,B(i);const l=document.getElementById("compose-add"),o=document.getElementById("compose-polish");l.textContent="Save",l.disabled=!1,o.disabled=!1,document.getElementById("edit-banner").classList.remove("hidden"),document.querySelectorAll(".para-wrap").forEach(v=>v.classList.remove("is-editing")),(u=document.querySelector(`[data-pid="${e}"]`))==null||u.classList.add("is-editing"),i.focus(),i.setSelectionRange(i.value.length,i.value.length),(g=document.getElementById("composer"))==null||g.scrollIntoView({behavior:"smooth",block:"nearest"})}function G(){m=null,document.getElementById("edit-banner").classList.add("hidden"),document.querySelectorAll(".para-wrap").forEach(e=>e.classList.remove("is-editing")),document.getElementById("compose-add").textContent="Add"}function ce(e){s.paragraphs=s.paragraphs.filter(a=>a.pid!==e),h.delete(e),m===e&&G(),r(),R()}function Z(e,a,i,l){const o=s.paragraphs.findIndex(u=>u.pid===e);o!==-1&&(s.paragraphs[o]={...s.paragraphs[o],raw:a,clean:i,type:l},h.delete(e),r(),R())}function le(e){s.paragraphs.push(e),r(),ee(),R()}function R(){p||!s||(p=!0,Q(s).then(()=>W("Saved")).catch(e=>W("Save failed: "+e.message)).finally(()=>{p=!1}))}function ee(){const e=document.getElementById("draft-scroll");e&&(e.scrollTop=e.scrollHeight)}function de(){const e=document.getElementById("draft-scroll");let a=0,i=0,l=0,o=null,u=null,g=null,v=null,w=0,b=0,E=0,C=0,A=!1;const N=()=>document.querySelectorAll(".para-wrap");e.addEventListener("touchstart",k=>{const y=k.target.closest(".ai-para");y&&(o=y.querySelector(".para-polished"),u=y.querySelector(".para-original"),g=y.querySelector(".para-inner"),!(!o||!u||!g)&&(v=y,a=k.touches[0].clientX,i=k.touches[0].clientY,l=Date.now(),w=g.offsetWidth,b=y.classList.contains("is-swiped")?-w:0,E=o.scrollHeight,C=u.scrollHeight,A=!1))},{passive:!0}),e.addEventListener("touchmove",k=>{if(!o||!u||!g||!v)return;const y=k.touches[0].clientX-a,J=k.touches[0].clientY-i;if(!A){if(Math.abs(y)<6&&Math.abs(J)<6)return;if(Math.abs(J)>Math.abs(y)){o=u=g=v=null;return}A=!0,o.style.transition="none",u.style.transition="none",g.style.transition="none",g.style.height=g.offsetHeight+"px",N().forEach($=>{$!==v&&$.classList.add("dimmed")})}const O=Math.max(-w,Math.min(0,b+y)),te=Math.abs(O)/w;o.style.transform=`translateX(${O}px)`,u.style.transform=`translateX(calc(100% + ${O}px))`,g.style.height=E+(C-E)*te+"px"},{passive:!0}),e.addEventListener("touchend",k=>{if(!o||!u||!g||!v)return;if(!A){o=u=g=v=null;return}const y=k.changedTouches[0].clientX-a,O=Math.abs(y)/Math.max(1,Date.now()-l)>.4?12:w*.28,$=v.classList.contains("is-swiped")?!(y>O):y<-O,ne=$?-w:0,ge=$?C:E,D=o,Y=u,K=g,z=v;o=u=g=v=null,A=!1;const V="0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)";D.style.transition=`transform ${V}`,Y.style.transition=`transform ${V}`,K.style.transition=`height ${V}`,D.style.transform=`translateX(${ne}px)`,Y.style.transform=`translateX(calc(100% + ${ne}px))`,K.style.height=ge+"px",D.addEventListener("transitionend",()=>{z.classList.toggle("is-swiped",$),$?h.add(z.dataset.pid):h.delete(z.dataset.pid),D.style.transform="",D.style.transition="",Y.style.transform="",Y.style.transition="",K.style.transition="",$||(K.style.height=""),N().forEach(fe=>fe.classList.remove("dimmed"))},{once:!0})},{passive:!0})}function ue(){const e=document.getElementById("para-menu"),a=document.getElementById("para-menu-edit"),i=document.getElementById("para-menu-delete"),l=document.getElementById("draft-scroll");let o=null,u=null,g=!1;function v(b,E,C){o=C,i.textContent="✕  Delete",i.classList.remove("is-confirming"),e.classList.remove("hidden"),requestAnimationFrame(()=>{const{offsetWidth:A,offsetHeight:N}=e;e.style.left=Math.min(b,window.innerWidth-A-8)+"px",e.style.top=Math.min(E,window.innerHeight-N-8)+"px"})}function w(){e.classList.add("hidden"),o=null}l.addEventListener("touchstart",b=>{g=!1;const E=b.target.closest("[data-pid]");if(!E)return;const C=E.dataset.pid;u=setTimeout(()=>{g||v(b.touches[0].clientX,b.touches[0].clientY,C)},500)},{passive:!0}),l.addEventListener("touchmove",()=>{g=!0,u&&(clearTimeout(u),u=null)},{passive:!0}),l.addEventListener("touchend",()=>{u&&(clearTimeout(u),u=null)},{passive:!0}),l.addEventListener("contextmenu",b=>{const E=b.target.closest("[data-pid]");E&&(b.preventDefault(),v(b.clientX,b.clientY,E.dataset.pid))}),a.addEventListener("click",()=>{o&&X(o),w()}),i.addEventListener("click",()=>{if(!i.classList.contains("is-confirming")){i.textContent="✕  Sure?",i.classList.add("is-confirming");return}o&&ce(o),w()}),document.addEventListener("pointerdown",b=>{!e.classList.contains("hidden")&&!e.contains(b.target)&&w()})}function pe(){const e=window.visualViewport;if(!e)return;const a=document.getElementById("composer"),i=document.getElementById("review-sheet"),l=document.getElementById("draft-scroll"),o=()=>{const u=Math.max(0,window.innerHeight-(e.offsetTop+e.height));a.style.bottom=`${u}px`,i.style.bottom=`${u}px`,l.style.paddingBottom=`${a.offsetHeight+u+16}px`};e.addEventListener("resize",o),e.addEventListener("scroll",o),o()}function me(){const e=document.getElementById("theme-btn"),a=()=>{const i=document.documentElement.classList.contains("dark");e.textContent=i?"☀":"☾"};a(),e.addEventListener("click",()=>{const i=document.documentElement,l=i.classList.contains("dark");i.classList.toggle("dark",!l),i.classList.toggle("light",l),localStorage.setItem("bb_theme",l?"light":"dark"),a()})}function he(){document.getElementById("warmup-btn").addEventListener("click",async()=>{const e=document.getElementById("warmup-panel"),a=document.getElementById("warmup-body");e.classList.remove("hidden"),a.innerHTML='<p class="muted-text">Thinking…</p>';const i=s.paragraphs.slice(-5).map(o=>o.clean||o.raw).join(`

`),l=await Te(i);a.innerHTML=l.length?l.map(o=>`<p class="warmup-q">${U(o)}</p>`).join(""):'<p class="muted-text">Could not generate prompts.</p>'}),document.getElementById("close-warmup").addEventListener("click",()=>{document.getElementById("warmup-panel").classList.add("hidden")})}}function U(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const He=localStorage.getItem("bb_theme");He==="light"&&document.documentElement.classList.replace("dark","light");function re(){const t=location.hash.slice(1)||"/",n=document.getElementById("app");n.innerHTML="";const s=t.match(/^\/scenes\/(.+)$/);if(s){Oe(n,s[1]);return}if(t==="/settings"){Me(n);return}xe(n)}window.addEventListener("hashchange",re);re();
