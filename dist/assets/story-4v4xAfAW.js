import{r as c,s as d}from"./CourseRepository-CIYmBoLj.js";/* empty css              */import"./firebase-config-CVzH6vXx.js";import"./animations-BlPka5LK.js";import{t as S}from"./GlobalController-BEZYk1c_.js";/* empty css             */var k=class{async getStories(e="all",i=50){try{return await S.getStories(e,i)}catch(t){throw d.error("StoriesService: Error fetching stories",t),t}}async getStoryById(e){try{return await S.getStoryBySlug(e)}catch(i){throw d.error("StoriesService: Error fetching story",i),i}}},I=new k,E=class{constructor(){this.grid=document.getElementById("storiesGrid")}escapeHtml(e){if(!e)return"";const i=document.createElement("div");return i.textContent=e,i.innerHTML}renderLoading(){this.grid&&(this.grid.innerHTML='<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>')}renderEmpty(){this.grid&&(this.grid.innerHTML='<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد قصص بعد في هذا التصنيف.</p></div>')}renderError(){this.grid&&(this.grid.innerHTML='<div class="error-state">حدث خطأ في تحميل القصص.</div>')}renderStories(e){if(!this.grid)return;const i=document.createDocumentFragment();e.forEach(t=>{const o=(t.personName||"؟").split(" ").slice(0,2).map(b=>b[0]).join(""),a=t.publishedAt?new Date(t.publishedAt.seconds*1e3).toLocaleDateString("ar-SD",{year:"numeric",month:"long"}):"",r=(t.story||"").replace(/<[^>]*>/g,"").slice(0,180)+"…",n=document.createElement("article");n.className="story-card glass-card";const l=t.coverImage||t.image||t.cover||t.personAvatar,m=l?`<img src="${this.escapeHtml(l)}" alt="${this.escapeHtml(t.personName||"")}" loading="lazy" decoding="async" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;">`:"",g=t.metricValue?`
                <div class="story-metric">
                    <div class="metric-number">${this.escapeHtml(t.metricValue.toString())}+</div>
                    <div class="metric-label">${this.escapeHtml(t.metricLabel||"إنجاز")}</div>
                </div>
            `:"",p=t.keyAchievement?`<p class="story-key"><i class="fas fa-star"></i> ${this.escapeHtml(t.keyAchievement)}</p>`:"",h=t.category?`<span class="story-category">${this.escapeHtml(t.category)}</span>`:"",v=a?`<span><i class="fas fa-calendar"></i> ${a}</span>`:"",u=t.profileLink?`<a href="${encodeURI(t.profileLink)}" target="_blank" class="cta-button secondary" style="margin-top: 15px; text-align: center; font-size: 0.9rem; padding: 0.5rem;"><i class="fas fa-external-link-alt"></i> مشاهدة ملف الحرفي</a>`:"";n.innerHTML=`
                <div class="story-cover">
                    ${m}
                    <div class="story-overlay">
                        ${g}
                    </div>
                </div>
                <div class="story-card-body">
                    <div class="story-person">
                        <div class="story-avatar">${this.escapeHtml(o)}</div>
                        <div>
                            <h4>${this.escapeHtml(t.personName||"مستخدم")}</h4>
                            <p class="story-role">${this.escapeHtml(t.personRole||"")} ${t.personCity?"• "+this.escapeHtml(t.personCity):""}</p>
                        </div>
                    </div>
                    <h3 class="story-title">${this.escapeHtml(t.title)}</h3>
                    ${p}
                    <p class="story-excerpt">${this.escapeHtml(r)}</p>
                    <div class="story-meta">
                        ${h}
                        ${v}
                    </div>
                    ${u}
                </div>
            `,i.appendChild(n)}),this.grid.innerHTML="",this.grid.appendChild(i)}renderSingleStory(e){const i=document.getElementById("postContent");if(!i)return;const t=(e.seoTitle||e.title)+" | Jhome",o=(e.story||"").replace(/<[^>]*>/g,"").slice(0,180),a=e.seoDescription||o,r=e.coverImage||e.image||e.cover||e.personAvatar,n="https://www.sudanfree.com/story.html?id="+encodeURIComponent(e.id||"");document.getElementById("pageTitle").textContent=t;const l=document.getElementById("pageDescription");l&&l.setAttribute("content",a);const m=document.getElementById("ogTitle");m&&m.setAttribute("content",e.seoTitle||e.title);const g=document.getElementById("ogDescription");if(g&&g.setAttribute("content",a),r){const f=document.getElementById("ogImage");f&&f.setAttribute("content",r);const y=document.getElementById("twitterImage");y&&y.setAttribute("content",r)}const p=document.getElementById("canonicalLink");p&&p.setAttribute("href",n);const h=document.getElementById("ogUrl");h&&h.setAttribute("content",n);const v=document.getElementById("twitterTitle");v&&v.setAttribute("content",e.seoTitle||e.title);const u=document.getElementById("twitterDescription");u&&u.setAttribute("content",a),e.publishedAt&&new Date(e.publishedAt.seconds*1e3).toLocaleDateString("ar-SD",{year:"numeric",month:"long",day:"numeric"});const b=(e.personName||"؟").split(" ").slice(0,2).map(f=>f[0]).join("");i.innerHTML=`
            <div class="post-cover">
                ${r?`<img src="${this.escapeHtml(r)}" alt="Cover" loading="lazy" decoding="async">`:'<div class="fallback-cover-logo"><span>J</span><span>home</span></div>'}
            </div>
            
            <div class="jhome-story-header">
                <div class="jhome-story-avatar">
                    <div class="initials">${this.escapeHtml(b)}</div>
                </div>
                <h1 class="post-title">${this.escapeHtml(e.personName)}</h1>
                <p class="post-author" style="justify-content: center; font-size: 1.2rem; color: var(--primary);">
                    <i class="fas fa-briefcase"></i> ${this.escapeHtml(e.personRole||"")}
                </p>
            </div>
            
            <div class="post-body">
                <div class="jhome-achievement-card">
                    <div class="jhome-achievement-icon"><i class="fas fa-trophy"></i></div>
                    <p class="jhome-achievement-text">${this.escapeHtml(e.keyAchievement)}</p>
                </div>
                
                ${e.story||"<p>لا يوجد تفاصيل للقصة حالياً.</p>"}
                
                ${e.freelancerLink||e.profileLink?`
                <div style="margin-top: 4rem; text-align: center;">
                    <a href="${encodeURI(e.freelancerLink||e.profileLink)}" target="_blank" class="btn btn-primary" style="font-size: 1.2rem; padding: 1.2rem 2.5rem; border-radius: 100px; box-shadow: 0 10px 20px rgba(79, 141, 235, 0.3);">
                        <i class="fas fa-external-link-alt" style="margin-left: 8px;"></i> استعراض الحساب والتواصل
                    </a>
                </div>`:""}

                ${e.socialLinks?`
                <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;">
                    ${e.socialLinks.linkedin?`<a href="${encodeURI(e.socialLinks.linkedin)}" target="_blank" class="share-btn" style="background:#0077b5;"><i class="fab fa-linkedin-in"></i></a>`:""}
                    ${e.socialLinks.twitter?`<a href="${encodeURI(e.socialLinks.twitter)}" target="_blank" class="share-btn" style="background:#000;"><i class="fab fa-x-twitter"></i></a>`:""}
                    ${e.socialLinks.github?`<a href="${encodeURI(e.socialLinks.github)}" target="_blank" class="share-btn" style="background:#333;"><i class="fab fa-github"></i></a>`:""}
                </div>`:""}
            </div>
        `}},s=new E,C=class{constructor(){this.sessionId=this._getOrCreateSessionId()}_getOrCreateSessionId(){let e=sessionStorage.getItem("jhome_sid");return e||(e="s_"+Date.now()+"_"+Math.random().toString(36).slice(2,9),sessionStorage.setItem("jhome_sid",e)),e}async trackEvent(e,i={}){try{if(!c.isInitialized())return;await c.getFunctions().httpsCallable("trackEventCallable")({eventName:e,eventData:i,sessionId:this.sessionId})}catch(t){d.warn("APIService","trackEvent failed",t)}}async submitContact(e){if(!c.isInitialized())throw new Error("Firebase not initialized");return await c.getFunctions().httpsCallable("submitContactCallable")(e)}async subscribeNewsletter(e){if(!c.isInitialized())throw new Error("Firebase not initialized");return await c.getFunctions().httpsCallable("subscribeNewsletterCallable")(e)}},w=new C,$=class{constructor(){this.currentCategory="all"}async init(){this.setupEventListeners(),await this.loadStories()}setupEventListeners(){const e=document.getElementById("storiesFilters");e&&e.addEventListener("click",i=>{const t=i.target.closest(".filter-btn");t&&(document.querySelectorAll(".filter-btn").forEach(o=>o.classList.remove("active")),t.classList.add("active"),this.currentCategory=t.dataset.category||"all",this.loadStories())})}async loadStories(){s.renderLoading();try{const e=await I.getStories(this.currentCategory);e.length===0?s.renderEmpty():s.renderStories(e),w.trackEvent("stories_view",{count:e.length,category:this.currentCategory})}catch(e){d.error("StoriesController: Failed to load stories",e),s.renderError()}}async initSingleStory(){const e=new URLSearchParams(window.location.search).get("id");if(!e){s.renderError("لم يتم تحديد قصة.");return}try{const i=await I.getStoryById(e);if(!i){s.renderError("عذراً، القصة غير موجودة.");return}s.renderSingleStory(i),w.trackEvent("story_view",{storyId:e})}catch(i){d.error("StoriesController: Failed to load story",i),s.renderError("حدث خطأ في تحميل القصة.")}}},L=new $;document.addEventListener("DOMContentLoaded",()=>{L.initSingleStory()});
