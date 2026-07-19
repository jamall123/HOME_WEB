import"./firebase-config-teItJWtm.js";import"./GlobalController-DC8vr5AO.js";import{t as a}from"./Logger-D7Tvbo4W.js";/* empty css             */var b=class{constructor(){this.db=window.firebase?window.firebase.firestore():null}async getStories(e="all",r=50){if(!this.db)return a.error("StoriesService: Firebase not initialized."),[];try{let t=this.db.collection("successStories").where("isPublished","==",!0);return e!=="all"&&(t=t.where("category","==",e)),(await t.get()).docs.map(i=>({id:i.id,...i.data()})).sort((i,n)=>{const o=i.publishedAt?.seconds||0;return(n.publishedAt?.seconds||0)-o}).slice(0,r)}catch(t){throw a.error("StoriesService: Error fetching stories",t),t}}async getStoryById(e){if(!this.db)return null;try{const r=await this.db.collection("successStories").doc(e).get();return r.exists?{id:r.id,...r.data()}:null}catch(r){throw a.error("StoriesService: Error fetching story",r),r}}},c=new b,y=class{constructor(){this.grid=document.getElementById("storiesGrid")}escapeHtml(e){if(!e)return"";const r=document.createElement("div");return r.textContent=e,r.innerHTML}renderLoading(){this.grid&&(this.grid.innerHTML='<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>')}renderEmpty(){this.grid&&(this.grid.innerHTML='<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد قصص بعد في هذا التصنيف.</p></div>')}renderError(){this.grid&&(this.grid.innerHTML='<div class="error-state">حدث خطأ في تحميل القصص.</div>')}renderStories(e){if(!this.grid)return;const r=document.createDocumentFragment();e.forEach(t=>{const i=(t.personName||"؟").split(" ").slice(0,2).map(f=>f[0]).join(""),n=t.publishedAt?new Date(t.publishedAt.seconds*1e3).toLocaleDateString("ar-SD",{year:"numeric",month:"long"}):"",o=(t.story||"").replace(/<[^>]*>/g,"").slice(0,180)+"…",l=document.createElement("article");l.className="story-card glass-card";const m=t.coverImage?`style="background-image: url('${this.escapeHtml(t.coverImage)}')"`:"",p=t.metricValue?`
                <div class="story-metric">
                    <div class="metric-number">${this.escapeHtml(t.metricValue.toString())}+</div>
                    <div class="metric-label">${this.escapeHtml(t.metricLabel||"إنجاز")}</div>
                </div>
            `:"",g=t.keyAchievement?`<p class="story-key"><i class="fas fa-star"></i> ${this.escapeHtml(t.keyAchievement)}</p>`:"",h=t.category?`<span class="story-category">${this.escapeHtml(t.category)}</span>`:"",v=n?`<span><i class="fas fa-calendar"></i> ${n}</span>`:"",u=t.profileLink?`<a href="${encodeURI(t.profileLink)}" target="_blank" class="cta-button secondary" style="margin-top: 15px; text-align: center; font-size: 0.9rem; padding: 0.5rem;"><i class="fas fa-external-link-alt"></i> مشاهدة ملف الحرفي</a>`:"";l.innerHTML=`
                <div class="story-cover" ${m}>
                    <div class="story-overlay">
                        ${p}
                    </div>
                </div>
                <div class="story-card-body">
                    <div class="story-person">
                        <div class="story-avatar">${this.escapeHtml(i)}</div>
                        <div>
                            <h4>${this.escapeHtml(t.personName||"مستخدم")}</h4>
                            <p class="story-role">${this.escapeHtml(t.personRole||"")} ${t.personCity?"• "+this.escapeHtml(t.personCity):""}</p>
                        </div>
                    </div>
                    <h3 class="story-title">${this.escapeHtml(t.title)}</h3>
                    ${g}
                    <p class="story-excerpt">${this.escapeHtml(o)}</p>
                    <div class="story-meta">
                        ${h}
                        ${v}
                    </div>
                    ${u}
                </div>
            `,r.appendChild(l)}),this.grid.innerHTML="",this.grid.appendChild(r)}renderSingleStory(e){const r=document.getElementById("postContent");if(!r)return;document.getElementById("pageTitle").textContent=(e.seoTitle||e.title)+" | Jhome",e.publishedAt&&new Date(e.publishedAt.seconds*1e3).toLocaleDateString("ar-SD",{year:"numeric",month:"long",day:"numeric"});const t=(e.personName||"؟").split(" ").slice(0,2).map(i=>i[0]).join("");r.innerHTML=`
            <div class="post-cover" ${e.coverImage?`style="background-image: url('${this.escapeHtml(e.coverImage)}'); background-size: cover; background-position: center;"`:""}>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 2rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; align-items: flex-end; gap: 1rem;">
                    <div style="width: 80px; height: 80px; background: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; border: 4px solid var(--bg-surface);">${this.escapeHtml(t)}</div>
                    <div>
                        <h1 style="margin: 0; font-size: 2rem; color: white;">${this.escapeHtml(e.personName)}</h1>
                        <p style="margin: 0; color: rgba(255,255,255,0.8);">${this.escapeHtml(e.personRole||"")}</p>
                    </div>
                </div>
            </div>
            
            <div class="post-body" style="margin-top: 2rem;">
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
                    <h3 style="color: var(--success); margin-bottom: 0.5rem;"><i class="fas fa-trophy"></i> أبرز الإنجازات</h3>
                    <p style="margin: 0; font-size: 1.1rem; font-weight: 500;">${this.escapeHtml(e.keyAchievement)}</p>
                </div>
                
                ${e.story||"<p>لا يوجد تفاصيل للقصة حالياً.</p>"}
                
                ${e.profileLink?`
                <div style="margin-top: 3rem; text-align: center;">
                    <a href="${encodeURI(e.profileLink)}" target="_blank" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem;">
                        <i class="fas fa-external-link-alt"></i> استعراض الحساب وتوظيف الحرفي
                    </a>
                </div>`:""}
            </div>
        `}},s=new y,w=class{constructor(){this.sessionId=this._getOrCreateSessionId()}_getOrCreateSessionId(){let e=sessionStorage.getItem("jhome_sid");return e||(e="s_"+Date.now()+"_"+Math.random().toString(36).slice(2,9),sessionStorage.setItem("jhome_sid",e)),e}async trackEvent(e,r={}){try{if(!window.firebase)return;await window.firebase.app().functions(window.FUNCTIONS_REGION||"us-central1").httpsCallable("trackEventCallable")({eventName:e,eventData:r,sessionId:this.sessionId})}catch(t){a.warn("APIService","trackEvent failed",t)}}async submitContact(e){if(!window.firebase)throw new Error("Firebase not initialized");return await window.firebase.app().functions(window.FUNCTIONS_REGION||"us-central1").httpsCallable("submitContactCallable")(e)}async subscribeNewsletter(e){if(!window.firebase)throw new Error("Firebase not initialized");return await window.firebase.app().functions(window.FUNCTIONS_REGION||"us-central1").httpsCallable("subscribeNewsletterCallable")(e)}},d=new w,S=class{constructor(){this.currentCategory="all"}async init(){this.setupEventListeners(),await this.loadStories()}setupEventListeners(){const e=document.getElementById("storiesFilters");e&&e.addEventListener("click",r=>{const t=r.target.closest(".filter-btn");t&&(document.querySelectorAll(".filter-btn").forEach(i=>i.classList.remove("active")),t.classList.add("active"),this.currentCategory=t.dataset.category||"all",this.loadStories())})}async loadStories(){s.renderLoading();try{const e=await c.getStories(this.currentCategory);e.length===0?s.renderEmpty():s.renderStories(e),d.trackEvent("stories_view",{count:e.length,category:this.currentCategory})}catch(e){a.error("StoriesController: Failed to load stories",e),s.renderError()}}async initSingleStory(){const e=new URLSearchParams(window.location.search).get("id");if(!e){s.renderError("لم يتم تحديد قصة.");return}try{const r=await c.getStoryById(e);if(!r){s.renderError("عذراً، القصة غير موجودة.");return}s.renderSingleStory(r),d.trackEvent("story_view",{storyId:e})}catch(r){a.error("StoriesController: Failed to load story",r),s.renderError("حدث خطأ في تحميل القصة.")}}},C=new S;document.addEventListener("DOMContentLoaded",()=>{C.initSingleStory()});
