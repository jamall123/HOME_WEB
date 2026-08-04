import"./ThemeManager-Dt8KBxWK.js";/* empty css              */import"./firebase-config-CVzH6vXx.js";import"./animations-BlPka5LK.js";import{t as o}from"./GlobalController-VjAdDXd5.js";/* empty css             */var S=class{constructor(){this.db=window.firebase?window.firebase.firestore():null}async getStories(e="all",i=50){if(!this.db)return o.error("StoriesService: Firebase not initialized."),[];try{let t=this.db.collection("successStories").where("isPublished","==",!0);return e!=="all"&&(t=t.where("category","==",e)),t=t.orderBy("createdAt","desc").limit(i),(await t.get()).docs.map(s=>({id:s.id,...s.data()}))}catch(t){throw o.error("StoriesService: Error fetching stories",t),t}}async getStoryById(e){if(!this.db)return null;try{const i=await this.db.collection("successStories").doc(e).get();return i.exists?{id:i.id,...i.data()}:null}catch(i){throw o.error("StoriesService: Error fetching story",i),i}}},w=new S,I=class{constructor(){this.grid=document.getElementById("storiesGrid")}escapeHtml(e){if(!e)return"";const i=document.createElement("div");return i.textContent=e,i.innerHTML}renderLoading(){this.grid&&(this.grid.innerHTML='<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>')}renderEmpty(){this.grid&&(this.grid.innerHTML='<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد قصص بعد في هذا التصنيف.</p></div>')}renderError(){this.grid&&(this.grid.innerHTML='<div class="error-state">حدث خطأ في تحميل القصص.</div>')}renderStories(e){if(!this.grid)return;const i=document.createDocumentFragment();e.forEach(t=>{const s=(t.personName||"؟").split(" ").slice(0,2).map(f=>f[0]).join(""),n=t.publishedAt?new Date(t.publishedAt.seconds*1e3).toLocaleDateString("ar-SD",{year:"numeric",month:"long"}):"",a=(t.story||"").replace(/<[^>]*>/g,"").slice(0,180)+"…",c=document.createElement("article");c.className="story-card glass-card";const l=t.coverImage||t.image||t.cover||t.personAvatar,d=l?`<img src="${this.escapeHtml(l)}" alt="${this.escapeHtml(t.personName||"")}" loading="lazy" decoding="async" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;">`:"",m=t.metricValue?`
                <div class="story-metric">
                    <div class="metric-number">${this.escapeHtml(t.metricValue.toString())}+</div>
                    <div class="metric-label">${this.escapeHtml(t.metricLabel||"إنجاز")}</div>
                </div>
            `:"",p=t.keyAchievement?`<p class="story-key"><i class="fas fa-star"></i> ${this.escapeHtml(t.keyAchievement)}</p>`:"",g=t.category?`<span class="story-category">${this.escapeHtml(t.category)}</span>`:"",h=n?`<span><i class="fas fa-calendar"></i> ${n}</span>`:"",v=t.profileLink?`<a href="${encodeURI(t.profileLink)}" target="_blank" class="cta-button secondary" style="margin-top: 15px; text-align: center; font-size: 0.9rem; padding: 0.5rem;"><i class="fas fa-external-link-alt"></i> مشاهدة ملف الحرفي</a>`:"";c.innerHTML=`
                <div class="story-cover">
                    ${d}
                    <div class="story-overlay">
                        ${m}
                    </div>
                </div>
                <div class="story-card-body">
                    <div class="story-person">
                        <div class="story-avatar">${this.escapeHtml(s)}</div>
                        <div>
                            <h4>${this.escapeHtml(t.personName||"مستخدم")}</h4>
                            <p class="story-role">${this.escapeHtml(t.personRole||"")} ${t.personCity?"• "+this.escapeHtml(t.personCity):""}</p>
                        </div>
                    </div>
                    <h3 class="story-title">${this.escapeHtml(t.title)}</h3>
                    ${p}
                    <p class="story-excerpt">${this.escapeHtml(a)}</p>
                    <div class="story-meta">
                        ${g}
                        ${h}
                    </div>
                    ${v}
                </div>
            `,i.appendChild(c)}),this.grid.innerHTML="",this.grid.appendChild(i)}renderSingleStory(e){const i=document.getElementById("postContent");if(!i)return;const t=(e.seoTitle||e.title)+" | Jhome",s=(e.story||"").replace(/<[^>]*>/g,"").slice(0,180),n=e.seoDescription||s,a=e.coverImage||e.image||e.cover||e.personAvatar,c="https://www.sudanfree.com/story.html?id="+encodeURIComponent(e.id||"");document.getElementById("pageTitle").textContent=t;const l=document.getElementById("pageDescription");l&&l.setAttribute("content",n);const d=document.getElementById("ogTitle");d&&d.setAttribute("content",e.seoTitle||e.title);const m=document.getElementById("ogDescription");if(m&&m.setAttribute("content",n),a){const u=document.getElementById("ogImage");u&&u.setAttribute("content",a);const b=document.getElementById("twitterImage");b&&b.setAttribute("content",a)}const p=document.getElementById("canonicalLink");p&&p.setAttribute("href",c);const g=document.getElementById("ogUrl");g&&g.setAttribute("content",c);const h=document.getElementById("twitterTitle");h&&h.setAttribute("content",e.seoTitle||e.title);const v=document.getElementById("twitterDescription");v&&v.setAttribute("content",n),e.publishedAt&&new Date(e.publishedAt.seconds*1e3).toLocaleDateString("ar-SD",{year:"numeric",month:"long",day:"numeric"});const f=(e.personName||"؟").split(" ").slice(0,2).map(u=>u[0]).join("");i.innerHTML=`
            <div class="post-cover">
                ${a?`<img src="${this.escapeHtml(a)}" alt="Cover" loading="lazy" decoding="async">`:'<div class="fallback-cover-logo"><span>J</span><span>home</span></div>'}
            </div>
            
            <div class="jhome-story-header">
                <div class="jhome-story-avatar">
                    <div class="initials">${this.escapeHtml(f)}</div>
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
        `}},r=new I,E=class{constructor(){this.sessionId=this._getOrCreateSessionId()}_getOrCreateSessionId(){let e=sessionStorage.getItem("jhome_sid");return e||(e="s_"+Date.now()+"_"+Math.random().toString(36).slice(2,9),sessionStorage.setItem("jhome_sid",e)),e}async trackEvent(e,i={}){try{if(!window.firebase)return;await window.firebase.app().functions(window.FUNCTIONS_REGION||"us-central1").httpsCallable("trackEventCallable")({eventName:e,eventData:i,sessionId:this.sessionId})}catch(t){o.warn("APIService","trackEvent failed",t)}}async submitContact(e){if(!window.firebase)throw new Error("Firebase not initialized");return await window.firebase.app().functions(window.FUNCTIONS_REGION||"us-central1").httpsCallable("submitContactCallable")(e)}async subscribeNewsletter(e){if(!window.firebase)throw new Error("Firebase not initialized");return await window.firebase.app().functions(window.FUNCTIONS_REGION||"us-central1").httpsCallable("subscribeNewsletterCallable")(e)}},y=new E,k=class{constructor(){this.currentCategory="all"}async init(){this.setupEventListeners(),await this.loadStories()}setupEventListeners(){const e=document.getElementById("storiesFilters");e&&e.addEventListener("click",i=>{const t=i.target.closest(".filter-btn");t&&(document.querySelectorAll(".filter-btn").forEach(s=>s.classList.remove("active")),t.classList.add("active"),this.currentCategory=t.dataset.category||"all",this.loadStories())})}async loadStories(){r.renderLoading();try{const e=await w.getStories(this.currentCategory);e.length===0?r.renderEmpty():r.renderStories(e),y.trackEvent("stories_view",{count:e.length,category:this.currentCategory})}catch(e){o.error("StoriesController: Failed to load stories",e),r.renderError()}}async initSingleStory(){const e=new URLSearchParams(window.location.search).get("id");if(!e){r.renderError("لم يتم تحديد قصة.");return}try{const i=await w.getStoryById(e);if(!i){r.renderError("عذراً، القصة غير موجودة.");return}r.renderSingleStory(i),y.trackEvent("story_view",{storyId:e})}catch(i){o.error("StoriesController: Failed to load story",i),r.renderError("حدث خطأ في تحميل القصة.")}}},C=new k;document.addEventListener("DOMContentLoaded",()=>{C.initSingleStory()});
