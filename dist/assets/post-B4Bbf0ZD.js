import"./ThemeManager-Df5bj4E3.js";import{t as s}from"./GlobalController-Df_3lCaU.js";/* empty css             */var c=class{constructor(){this.db=window.firebase?window.firebase.firestore():null}async getPostBySlug(e){if(!this.db)return s.error("PostService: Firebase not initialized."),null;try{const t=await this.db.collection("posts").where("slug","==",e).where("status","==","published").limit(1).get();if(t.empty)return null;const a={id:t.docs[0].id,...t.docs[0].data()},r=`jhome_viewed_post_${a.id}`;return sessionStorage.getItem(r)||(sessionStorage.setItem(r,"1"),this.db.collection("posts").doc(a.id).update({views:window.firebase.firestore.FieldValue.increment(1)}).catch(n=>s.warn("Failed to increment views",n))),a}catch(t){throw s.error("PostService: getPostBySlug error:",t),t}}async getRelatedPosts(e,t){if(!this.db||!e)return[];try{return(await this.db.collection("posts").where("status","==","published").where("category","==",e).orderBy("publishedAt","desc").limit(4).get()).docs.map(a=>({id:a.id,...a.data()})).filter(a=>a.id!==t).slice(0,3)}catch(a){return s.warn("PostService: getRelatedPosts failed",a),[]}}},o=new c,d=class{constructor(){this.container=document.getElementById("postContent"),this.relatedSection=document.getElementById("relatedSection"),this.relatedGrid=document.getElementById("relatedGrid")}escapeHtml(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}renderError(e){this.container&&(this.container.innerHTML=`<div class="error-state">${this.escapeHtml(e)}</div>`)}updateSEO(e){document.getElementById("pageTitle").textContent=(e.seoTitle||e.title)+" | Jhome",document.getElementById("pageDescription").setAttribute("content",e.seoDescription||e.excerpt||""),document.getElementById("ogTitle").setAttribute("content",e.seoTitle||e.title),document.getElementById("ogDescription").setAttribute("content",e.seoDescription||e.excerpt||""),e.coverImage&&document.getElementById("ogImage").setAttribute("content",e.coverImage)}renderPost(e){if(!this.container)return;this.updateSEO(e);const t=e.publishedAt?new Date(e.publishedAt.seconds*1e3).toLocaleDateString("ar-SD",{year:"numeric",month:"long",day:"numeric"}):"",a=e.tags&&e.tags.length?`
          <div class="post-tags">
            ${e.tags.map(l=>`<span class="tag">#${this.escapeHtml(l)}</span>`).join("")}
          </div>
        `:"",r=e.coverImage||e.image||e.cover,n=r?`<img src="${this.escapeHtml(r)}" alt="${this.escapeHtml(e.title)}" fetchpriority="high" decoding="async" onerror="this.style.display='none';">`:'<div class="fallback-cover-logo"><span>J</span><span>home</span></div>';this.container.innerHTML=`
            <div class="post-cover">
                ${n}
            </div>
            <div class="post-meta-top">
                <span class="post-category-badge">${this.escapeHtml(e.category||"عام")}</span>
                <span><i class="fas fa-calendar"></i> ${t}</span>
                ${e.readingTime?`<span><i class="fas fa-clock"></i> ${e.readingTime} دقيقة قراءة</span>`:""}
                <span><i class="fas fa-eye"></i> ${e.views||0} مشاهدة</span>
            </div>
            <h1 class="post-title">${this.escapeHtml(e.title)}</h1>
            ${e.authorName?`<p class="post-author"><i class="fas fa-user"></i> بقلم: ${this.escapeHtml(e.authorName)}</p>`:""}
            <div class="post-body">
                ${e.content||"<p>لا يوجد محتوى.</p>"}
            </div>
            ${a}
            <div class="post-share">
                <span>شارك:</span>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(e.title)}" target="_blank" class="share-btn twitter"><i class="fab fa-twitter"></i></a>
                <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(e.title+" "+window.location.href)}" target="_blank" class="share-btn whatsapp"><i class="fab fa-whatsapp"></i></a>
                <a href="https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(e.title)}" target="_blank" class="share-btn telegram"><i class="fab fa-telegram-plane"></i></a>
            </div>
        `}renderRelated(e){!this.relatedSection||!this.relatedGrid||e.length===0||(this.relatedSection.style.display="block",this.relatedGrid.innerHTML=e.map(t=>`
            <a href="post.html?slug=${encodeURIComponent(t.slug)}" class="related-card glass-card">
                <img src="${t.coverImage||"assets/images/blog-placeholder.jpg"}" alt="${this.escapeHtml(t.title)}" loading="lazy">
                <h4>${this.escapeHtml(t.title)}</h4>
            </a>
        `).join(""))}},i=new d,h=class{async init(){const e=new URLSearchParams(window.location.search).get("slug");if(!e){i.renderError("لم يتم تحديد مقال.");return}try{const t=await o.getPostBySlug(e);if(!t){i.renderError("عذراً، المقال غير موجود.");return}i.renderPost(t),o.getRelatedPosts(t.category,t.id).then(a=>i.renderRelated(a)).catch(a=>s.warn("PostController: Failed to load related",a))}catch(t){s.error("PostController: Failed to load post",t),i.renderError("حدث خطأ في تحميل المقال.")}}},m=new h;document.addEventListener("DOMContentLoaded",()=>{m.init()});
