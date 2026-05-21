var G=Object.defineProperty;var W=(e,t,n)=>t in e?G(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var S=(e,t,n)=>W(e,typeof t!="symbol"?t+"":t,n);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))c(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&c(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function c(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();const b={anthropicKey:"bb_anthropic_key",githubToken:"bb_github_token",githubOwner:"bb_github_owner",githubRepo:"bb_github_repo",githubBranch:"bb_github_branch",emailAddress:"bb_email"};function E(){return{anthropicKey:localStorage.getItem(b.anthropicKey)??"",githubToken:localStorage.getItem(b.githubToken)??"",githubOwner:localStorage.getItem(b.githubOwner)??"",githubRepo:localStorage.getItem(b.githubRepo)??"",githubBranch:localStorage.getItem(b.githubBranch)??"main",emailAddress:localStorage.getItem(b.emailAddress)??""}}function J(e){for(const[t,n]of Object.entries(b)){const c=e[t];c!==void 0&&localStorage.setItem(n,c)}}function z(){const e=E();return!!(e.anthropicKey&&e.githubToken&&e.githubOwner&&e.githubRepo)}function X(e){const t=e.paragraphs.map(n=>n.clean||n.raw).filter(Boolean).join(`

`);return`# ${e.name}

${t}
`}const Q="https://api.github.com";async function w(e,t={}){const{githubToken:n,githubOwner:c,githubRepo:s}=E(),i=await fetch(`${Q}/repos/${c}/${s}${e}`,{...t,headers:{Authorization:`Bearer ${n}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...t.headers??{}}});if(!i.ok){const o=await i.json().catch(()=>({}));throw new Error((o==null?void 0:o.message)??`GitHub ${i.status}`)}return i.json()}async function x(e){try{return(await w(`/contents/${e}`)).sha}catch{return}}function $(e){return btoa(unescape(encodeURIComponent(e)))}async function V(){try{return(await w("/contents/scenes")).filter(t=>t.name.endsWith(".json")).map(t=>t.name.replace(".json",""))}catch{return[]}}async function Z(e){try{const t=await w(`/contents/scenes/${e}.json`),n=decodeURIComponent(escape(atob(t.content.replace(/\s/g,""))));return JSON.parse(n)}catch{return null}}async function M(e){const{githubBranch:t}=E(),n=`scenes/${e.slug}.json`,c=`scenes/${e.slug}.md`,[s,i]=await Promise.all([x(n),x(c)]);await Promise.all([w(`/contents/${n}`,{method:"PUT",body:JSON.stringify({message:`Update scene: ${e.name}`,content:$(JSON.stringify(e,null,2)),branch:t,...s?{sha:s}:{}})}),w(`/contents/${c}`,{method:"PUT",body:JSON.stringify({message:`Update markdown: ${e.name}`,content:$(X(e)),branch:t,...i?{sha:i}:{}})})])}async function ee(e){const t=e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),n={name:e,slug:t,created_at:new Date().toISOString(),paragraphs:[]};return await M(n),n}function te(e){e.innerHTML=`
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
  `;const t=document.getElementById("new-name"),n=document.getElementById("create-btn");if(n.addEventListener("click",()=>s()),t.addEventListener("keydown",i=>{i.key==="Enter"&&s()}),!z()){document.getElementById("scenes-container").innerHTML=`
      <div class="empty-state">
        <p>Configure your settings to get started.</p>
        <a href="#/settings" class="btn-primary">Open Settings →</a>
      </div>
    `;return}c();async function c(){const i=document.getElementById("scenes-container");if(i)try{const o=await V();if(!o.length){i.innerHTML='<div class="empty-state"><p>No scenes yet. Create your first one below.</p></div>';return}i.className="scenes-list",i.innerHTML=o.map(h=>`
        <a href="#/scenes/${h}" class="scene-card">
          <span class="scene-name">${ne(h)}</span>
          <span>→</span>
        </a>
      `).join("")}catch(o){i.innerHTML=`<div class="error-state">${o.message}</div>`}}async function s(){const i=t.value.trim();if(i){n.disabled=!0,n.textContent="…";try{const o=await ee(i);location.hash=`#/scenes/${o.slug}`}catch(o){alert("Error: "+o.message),n.disabled=!1,n.textContent="Create"}}}}function ne(e){return e.replace(/-/g," ").replace(/\b\w/g,t=>t.toUpperCase())}const ae="https://api.anthropic.com/v1/messages";async function H(e,t,n=1024){var o;const{anthropicKey:c}=E(),s=await fetch(ae,{method:"POST",headers:{"x-api-key":c,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","content-type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:n,system:e,messages:[{role:"user",content:t}]})});if(!s.ok){const h=await s.json().catch(()=>({}));throw new Error(((o=h==null?void 0:h.error)==null?void 0:o.message)??`Claude API error ${s.status}`)}return(await s.json()).content[0].text.trim()}async function C(e,t=""){const n=t?`Previous context:
${t}

---

New dictation to clean up:
${e}`:`Clean up this dictated text:
${e}`;return H(ie,n,1024)}async function se(e){try{return(await H(re,e,300)).split(`
`).filter(Boolean)}catch{return[]}}const ie=`You are a prose editor working with a novelist on a draft manuscript.

Your job is to clean up raw dictated or typed text into polished, readable prose. You must:
- Fix grammar, punctuation, and sentence flow
- Remove dictation artifacts ("um", "uh", repeated words, false starts)
- Preserve the author's voice, style, and all narrative choices
- Never advance the plot, add new events, or invent details
- Keep every idea present in the raw input — just express it cleanly
- Split into natural paragraphs where appropriate
- Return ONLY the cleaned prose — no commentary, no meta-text, no "Here is the cleaned version:"

Output one or more prose paragraphs, each separated by a blank line. Nothing else.`,re=`You are a writing coach helping a novelist get back into their story.

Given recent draft content, generate 3 short questions that will help the writer re-engage with the scene. Questions should be about character motivation, sensory details, or what happens next. Be specific to the actual content — no generic advice.

Output exactly 3 questions, one per line, no numbering, no extra text.`;class oe{constructor(t,n){S(this,"recognition");S(this,"finalTranscript","");S(this,"running",!1);this.onUpdate=t,this.onState=n;const c=window.SpeechRecognition??window.webkitSpeechRecognition;if(!c)throw new Error("Speech recognition not supported in this browser.");this.recognition=new c,this.recognition.continuous=!0,this.recognition.interimResults=!0,this.recognition.lang="en-US",this.recognition.onresult=s=>{let i="";for(let o=s.resultIndex;o<s.results.length;o++){const h=s.results[o][0].transcript;s.results[o].isFinal?this.finalTranscript+=h+" ":i+=h}this.onUpdate(i,this.finalTranscript.trim())},this.recognition.onerror=s=>{s.error!=="aborted"&&this.onState("error",s.error)},this.recognition.onend=()=>{this.running&&this.recognition.start()}}start(){this.finalTranscript="",this.running=!0,this.recognition.start(),this.onState("started")}stop(){return this.running=!1,this.recognition.stop(),this.onState("stopped"),this.finalTranscript.trim()}}function ce(e){const t=E();e.innerHTML=`
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
            <input type="password" id="s-anthropic" value="${v(t.anthropicKey)}" placeholder="sk-ant-…" autocomplete="off">
          </label>
        </section>

        <section class="settings-section">
          <h2>GitHub Storage</h2>
          <p class="settings-help">Scenes save as <code>.json</code> + <code>.md</code> files. <a href="https://github.com/settings/tokens/new?scopes=repo&description=BookBuddy" target="_blank" rel="noopener">Create a token →</a></p>
          <label class="field">
            <span>Personal Access Token</span>
            <input type="password" id="s-gh-token" value="${v(t.githubToken)}" placeholder="ghp_…" autocomplete="off">
          </label>
          <label class="field">
            <span>Owner</span>
            <input type="text" id="s-gh-owner" value="${v(t.githubOwner)}" placeholder="your-username">
          </label>
          <label class="field">
            <span>Repository</span>
            <input type="text" id="s-gh-repo" value="${v(t.githubRepo)}" placeholder="my-novel">
          </label>
          <label class="field">
            <span>Branch</span>
            <input type="text" id="s-gh-branch" value="${v(t.githubBranch)}" placeholder="main">
          </label>
        </section>

        <section class="settings-section">
          <h2>Daily Email</h2>
          <p class="settings-help">Set <code>ANTHROPIC_API_KEY</code>, <code>RESEND_API_KEY</code>, and <code>EMAIL_ADDRESS</code> as secrets in your GitHub repo to enable the daily questions workflow.</p>
          <label class="field">
            <span>Your Email</span>
            <input type="email" id="s-email" value="${v(t.emailAddress)}" placeholder="you@example.com">
          </label>
        </section>

        <button class="btn-primary full-width" id="s-save">Save</button>
      </div>
    </div>
  `,document.getElementById("s-save").addEventListener("click",()=>{J({anthropicKey:y("s-anthropic"),githubToken:y("s-gh-token"),githubOwner:y("s-gh-owner"),githubRepo:y("s-gh-repo"),githubBranch:y("s-gh-branch")||"main",emailAddress:y("s-email")}),f("Settings saved")})}function y(e){return document.getElementById(e).value.trim()}function v(e){return e.replace(/"/g,"&quot;")}function f(e){const t=document.createElement("div");t.className="toast",t.textContent=e,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("toast-show")),setTimeout(()=>{t.classList.remove("toast-show"),setTimeout(()=>t.remove(),300)},2200)}async function le(e,t){e.innerHTML=`
    <div class="editor-page">
      <header class="editor-header">
        <a href="#/" class="back-btn">←</a>
        <h1 id="scene-title" class="editor-title">Loading…</h1>
        <button class="icon-btn" id="warmup-btn" title="Writing prompts">✦</button>
      </header>

      <div id="draft-scroll" class="draft-scroll">
        <div id="draft-paras"></div>
        <div id="state-area"></div>
      </div>

      <div id="action-bar" class="action-bar"></div>

      <div id="compare-sheet" class="sheet hidden">
        <div class="sheet-header">
          <span class="sheet-label">Original dictation</span>
          <button class="icon-btn" id="close-compare">✕</button>
        </div>
        <div id="compare-raw" class="compare-body"></div>
      </div>

      <div id="warmup-panel" class="sheet hidden">
        <div class="sheet-header">
          <span class="sheet-label">Writing prompts</span>
          <button class="icon-btn" id="close-warmup">✕</button>
        </div>
        <div id="warmup-body" class="warmup-body"></div>
      </div>
    </div>
  `;let n=null,c="idle",s=null,i="",o="",h=!1;try{n=await Z(t)}catch(a){e.innerHTML=`<div class="error-state">Failed to load: ${a.message}</div>`;return}if(!n){e.innerHTML='<div class="error-state">Scene not found.</div>';return}document.getElementById("scene-title").textContent=n.name,L(),T(),D(),q();function L(){const a=document.getElementById("draft-paras");if(!n.paragraphs.length){a.innerHTML='<p class="draft-empty">Your draft will appear here.</p>';return}a.innerHTML=n.paragraphs.map(A).join("")}function A(a){const r=a.type==="ai";return`<div class="draft-para-wrap${r?" ai-para":""}" data-pid="${a.pid}">
      ${r?'<div class="ai-accent-bar"></div>':""}
      <p class="draft-para">${I(a.clean||a.raw)}</p>
    </div>`}function T(){const a=document.getElementById("action-bar"),r=document.getElementById("state-area");c==="idle"?(r.innerHTML="",a.innerHTML=`
        <button class="mic-btn" id="mic-btn"><span class="rec-dot"></span></button>
        <button class="type-trigger" id="type-btn">
          <span class="type-placeholder">Type your draft here…</span>
        </button>
      `,document.getElementById("mic-btn").addEventListener("click",P),document.getElementById("type-btn").addEventListener("click",()=>u("typing"))):c==="recording"?(r.innerHTML=`
        <div class="transcript-area">
          <div id="final-text" class="final-text"></div>
          <div id="interim-text" class="interim-text"></div>
        </div>
        <div class="waveform">${"<span></span>".repeat(12)}</div>
      `,a.innerHTML='<button class="stop-btn full-width" id="stop-btn">Stop &amp; clean up</button>',document.getElementById("stop-btn").addEventListener("click",_)):c==="cleaning"?(r.innerHTML='<div class="cleaning-row"><span class="spinner"></span><span>Cleaning up…</span></div>',a.innerHTML=""):c==="reviewing"?(r.innerHTML=`
        <div class="review-wrap">
          <div class="review-label">Cleaned — tap to edit before adding</div>
          <div id="review-text" class="review-text" contenteditable="true">${I(o)}</div>
        </div>
      `,a.innerHTML=`
        <button class="btn-ghost" id="discard-btn">Discard</button>
        <button class="btn-primary" id="commit-btn">Add to draft</button>
      `,document.getElementById("discard-btn").addEventListener("click",N),document.getElementById("commit-btn").addEventListener("click",U)):c==="typing"&&(r.innerHTML=`
        <div class="typing-wrap">
          <div id="type-editor" class="type-editor" contenteditable="true" data-placeholder="Start typing…"></div>
        </div>
      `,setTimeout(()=>{var l;return(l=document.getElementById("type-editor"))==null?void 0:l.focus()},50),a.innerHTML=`
        <button class="btn-ghost" id="cancel-type-btn">Cancel</button>
        <button class="btn-ghost" id="clean-type-btn">Clean up</button>
        <button class="btn-primary" id="save-type-btn">Save as-is</button>
      `,document.getElementById("cancel-type-btn").addEventListener("click",()=>u("idle")),document.getElementById("clean-type-btn").addEventListener("click",j),document.getElementById("save-type-btn").addEventListener("click",R))}function u(a){c=a,T()}function P(){try{s=new oe((a,r)=>{const l=document.getElementById("final-text"),d=document.getElementById("interim-text");l&&(l.textContent=r),d&&(d.textContent=a)},(a,r)=>{a==="error"&&(f(`Mic error: ${r??"unknown"}`),u("idle"))}),s.start(),u("recording")}catch(a){f(a.message)}}async function _(){if(s){if(i=s.stop(),s=null,!i){u("idle");return}u("cleaning");try{const a=n.paragraphs.slice(-3).map(r=>r.clean||r.raw).join(`

`);o=await C(i,a),u("reviewing")}catch(a){f("AI error: "+a.message),u("idle")}}}async function j(){const r=document.getElementById("type-editor").innerText.trim();if(r){i=r,u("cleaning");try{const l=n.paragraphs.slice(-3).map(d=>d.clean||d.raw).join(`

`);o=await C(r,l),u("reviewing")}catch(l){f("AI error: "+l.message),u("idle")}}}async function R(){const r=document.getElementById("type-editor").innerText.trim();r&&(B([{pid:crypto.randomUUID(),raw:r,clean:r,type:"typed",created_at:new Date().toISOString()}]),u("idle"))}function N(){i="",o="",u("idle")}async function U(){const a=document.getElementById("review-text"),r=(a==null?void 0:a.innerText.trim())??o,l=i;i="",o="";const d=r.split(/\n\n+/).filter(Boolean),p=new Date().toISOString(),m=d.map((g,F)=>({pid:crypto.randomUUID(),raw:F===0?l:"",clean:g.trim(),type:"ai",created_at:p}));B(m),u("idle")}function B(a){n.paragraphs.push(...a),L(),Y(),K()}function K(){h||!n||(h=!0,M(n).then(()=>f("Saved")).catch(a=>f("Save failed: "+a.message)).finally(()=>{h=!1}))}function Y(){const a=document.getElementById("draft-scroll");a&&(a.scrollTop=a.scrollHeight)}function D(){const a=document.getElementById("draft-scroll");let r=0,l=0,d=null;a.addEventListener("touchstart",p=>{r=p.touches[0].clientX,l=p.touches[0].clientY,d=p.target.closest(".ai-para")},{passive:!0}),a.addEventListener("touchend",p=>{if(!d)return;const m=p.changedTouches[0].clientX-r,g=p.changedTouches[0].clientY-l;m<-50&&Math.abs(m)>Math.abs(g)&&k(d.dataset.pid),d=null},{passive:!0}),a.addEventListener("click",p=>{const m=p.target.closest(".ai-accent-bar");if(m){const g=m.closest(".draft-para-wrap");g!=null&&g.dataset.pid&&k(g.dataset.pid)}}),document.getElementById("close-compare").addEventListener("click",()=>{document.getElementById("compare-sheet").classList.add("hidden")})}function k(a){const r=n.paragraphs.find(l=>l.pid===a);r&&(document.getElementById("compare-raw").textContent=r.raw||"(no original recorded)",document.getElementById("compare-sheet").classList.remove("hidden"))}function q(){document.getElementById("warmup-btn").addEventListener("click",async()=>{const a=document.getElementById("warmup-panel"),r=document.getElementById("warmup-body");a.classList.remove("hidden"),r.innerHTML='<p class="muted-text">Thinking…</p>';const l=n.paragraphs.slice(-5).map(p=>p.clean||p.raw).join(`

`),d=await se(l);r.innerHTML=d.length?d.map(p=>`<p class="warmup-q">${I(p)}</p>`).join(""):'<p class="muted-text">Could not generate prompts.</p>'}),document.getElementById("close-warmup").addEventListener("click",()=>{document.getElementById("warmup-panel").classList.add("hidden")})}}function I(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function O(){const e=location.hash.slice(1)||"/",t=document.getElementById("app");t.innerHTML="";const n=e.match(/^\/scenes\/(.+)$/);if(n){le(t,n[1]);return}if(e==="/settings"){ce(t);return}te(t)}window.addEventListener("hashchange",O);O();
