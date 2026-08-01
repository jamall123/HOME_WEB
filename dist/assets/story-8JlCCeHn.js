import"./ThemeManager-Df5bj4E3.js";import{t as r}from"./GlobalController-Df_3lCaU.js";/* empty css             */var w=class{constructor(){this.db=window.firebase?window.firebase.firestore():null}async getStories(e="all",i=50){if(!this.db)return r.error("StoriesService: Firebase not initialized."),[];try{let t=this.db.collection("successStories").where("isPublished","==",!0);return e!=="all"&&(t=t.where("category","==",e)),t=t.orderBy("createdAt","desc").limit(i),(await t.get()).docs.map(s=>({id:s.id,...s.data()}))}catch(t){throw r.error("StoriesService: Error fetching stories",t),t}}async getStoryById(e){if(!this.db)return null;try{const i=await this.db.collection("successStories").doc(e).get();return i.exists?{id:i.id,...i.data()}:null}catch(i){throw r.error("StoriesService: Error fetching story",i),i}}},o=new w,S=class{constructor(){this.grid=document.getElementById("storiesGrid")}escapeHtml(e){if(!e)return"";const i=document.createElement("div");return i.textContent=e,i.innerHTML}renderLoading(){this.grid&&(this.grid.innerHTML='<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>')}renderEmpty(){this.grid&&(this.grid.innerHTML='<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد قصص بعد في هذا التصنيف.</p></div>')}renderError(){this.grid&&(this.grid.innerHTML='<div class="error-state">حدث خطأ في تحميل القصص.</div>')}renderStories(e){if(!this.grid)return;const i=document.createDocumentFragment();e.forEach(t=>{const s=(t.personName||"؟").split(" ").slice(0,2).map(b=>b[0]).join(""),n=t.publishedAt?new Date(t.publishedAt.seconds*1e3).toLocaleDateString("ar-SD",{year:"numeric",month:"long"}):"",m=(t.story||"").replace(/<[^>]*>/g,"").slice(0,180)+"…",c=document.createElement("article");c.className="story-card glass-card";const l=t.coverImage||t.image||t.cover||t.personAvatar,h=l?`<img src="${this.escapeHtml(l)}" alt="${this.escapeHtml(t.personName||"")}" loading="lazy" decoding="async" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;">`:"",p=t.metricValue?`
                <div class="story-metric">
                    <div class="metric-number">${this.escapeHtml(t.metricValue.toString())}+</div>
                    <div class="metric-label">${this.escapeHtml(t.metricLabel||"إنجاز")}</div>
                </div>
            `:"",v=t.keyAchievement?`<p class="story-key"><i class="fas fa-star"></i> ${this.escapeHtml(t.keyAchievement)}</p>`:"",g=t.category?`<span class="story-category">${this.escapeHtml(t.category)}</span>`:"",f=n?`<span><i class="fas fa-calendar"></i> ${n}</span>`:"",u=t.profileLink?`<a href="${encodeURI(t.profileLink)}" target="_blank" class="cta-button secondary" style="margin-top: 15px; text-align: center; font-size: 0.9rem; padding: 0.5rem;"><i class="fas fa-external-link-alt"></i> مشاهدة ملف الحرفي</a>`:"";c.innerHTML=`
                <div class="story-cover">
                    ${h}
                    <div class="story-overlay">
                        ${p}
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
                    ${v}
                    <p class="story-excerpt">${this.escapeHtml(m)}</p>
                    <div class="story-meta">
                        ${g}
                        ${f}
                    </div>
                    ${u}
                </div>
            `,i.appendChild(c)}),this.grid.innerHTML="",this.grid.appendChild(i)}renderSingleStory(e){const i=document.getElementById("postContent");if(!i)return;document.getElementById("pageTitle").textContent=(e.seoTitle||e.title)+" | Jhome",e.publishedAt&&new Date(e.publishedAt.seconds*1e3).toLocaleDateString("ar-SD",{year:"numeric",month:"long",day:"numeric"});const t=(e.personName||"؟").split(" ").slice(0,2).map(n=>n[0]).join(""),s=e.coverImage||e.image||e.cover||e.personAvatar;i.innerHTML=`
            <div class="post-cover">
                ${s?`<img src="${this.escapeHtml(s)}" alt="Cover" loading="lazy" decoding="async">`:'<div class="fallback-cover-logo"><span>J</span><span>home</span></div>'}
            </div>
            
            <div class="jhome-story-header">
                <div class="jhome-story-avatar">
                    <div class="initials">${this.escapeHtml(t)}</div>
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
        `}},a=new S,y=class{constructor(){this.sessionId=this._getOrCreateSessionId()}_getOrCreateSessionId(){let e=sessionStorage.getItem("jhome_sid");return e||(e="s_"+Date.now()+"_"+Math.random().toString(36).slice(2,9),sessionStorage.setItem("jhome_sid",e)),e}async trackEvent(e,i={}){try{if(!window.firebase)return;await window.firebase.app().functions(window.FUNCTIONS_REGION||"us-central1").httpsCallable("trackEventCallable")({eventName:e,eventData:i,sessionId:this.sessionId})}catch(t){r.warn("APIService","trackEvent failed",t)}}async submitContact(e){if(!window.firebase)throw new Error("Firebase not initialized");return await window.firebase.app().functions(window.FUNCTIONS_REGION||"us-central1").httpsCallable("submitContactCallable")(e)}async subscribeNewsletter(e){if(!window.firebase)throw new Error("Firebase not initialized");return await window.firebase.app().functions(window.FUNCTIONS_REGION||"us-central1").httpsCallable("subscribeNewsletterCallable")(e)}},d=new y,k=class{constructor(){this.currentCategory="all"}async init(){this.setupEventListeners(),await this.loadStories()}setupEventListeners(){const e=document.getElementById("storiesFilters");e&&e.addEventListener("click",i=>{const t=i.target.closest(".filter-btn");t&&(document.querySelectorAll(".filter-btn").forEach(s=>s.classList.remove("active")),t.classList.add("active"),this.currentCategory=t.dataset.category||"all",this.loadStories())})}async loadStories(){a.renderLoading();try{const e=await o.getStories(this.currentCategory);e.length===0?a.renderEmpty():a.renderStories(e),d.trackEvent("stories_view",{count:e.length,category:this.currentCategory})}catch(e){r.error("StoriesController: Failed to load stories",e),a.renderError()}}async initSingleStory(){const e=new URLSearchParams(window.location.search).get("id");if(!e){a.renderError("لم يتم تحديد قصة.");return}try{const i=await o.getStoryById(e);if(!i){a.renderError("عذراً، القصة غير موجودة.");return}a.renderSingleStory(i),d.trackEvent("story_view",{storyId:e})}catch(i){r.error("StoriesController: Failed to load story",i),a.renderError("حدث خطأ في تحميل القصة.")}}},C=new k;document.addEventListener("DOMContentLoaded",()=>{C.initSingleStory()});
