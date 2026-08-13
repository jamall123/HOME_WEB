import{s as o}from"./CourseRepository-BkU7rJA0.js";/* empty css              */import"./firebase-config-DkUYsNQt.js";import"./animations-BlPka5LK.js";import{t as c}from"./GlobalController-DTbCEj-T.js";/* empty css             */var h=class{async getPostBySlug(e){try{const t=await c.getPostBySlug(e);if(!t)return null;const a=`jhome_viewed_post_${t.id}`;return sessionStorage.getItem(a)||(sessionStorage.setItem(a,"1"),await c.incrementPostViews(t.id)),t}catch(t){throw o.error("PostService: getPostBySlug error:",t),t}}async getRelatedPosts(e,t){if(!e)return[];try{return await c.getRelatedPosts(e,t)}catch(a){return o.warn("PostService: getRelatedPosts failed",a),[]}}},g=new h,u=class{constructor(){this.container=document.getElementById("postContent"),this.relatedSection=document.getElementById("relatedSection"),this.relatedGrid=document.getElementById("relatedGrid")}escapeHtml(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}renderError(e){this.container&&(this.container.innerHTML=`<div class="error-state">${this.escapeHtml(e)}</div>`)}updateSEO(e){const t=(e.seoTitle||e.title)+" | Jhome",a=e.seoDescription||e.excerpt||"",n="https://www.sudanfree.com/post.html?slug="+encodeURIComponent(e.slug);document.getElementById("pageTitle").textContent=t,document.getElementById("pageDescription").setAttribute("content",a),document.getElementById("ogTitle").setAttribute("content",e.seoTitle||e.title),document.getElementById("ogDescription").setAttribute("content",a),e.coverImage&&document.getElementById("ogImage").setAttribute("content",e.coverImage);const r=document.getElementById("canonicalLink");r&&r.setAttribute("href",n);const i=document.getElementById("ogUrl");i&&i.setAttribute("content",n);const l=document.getElementById("twitterTitle");l&&l.setAttribute("content",e.seoTitle||e.title);const d=document.getElementById("twitterDescription");if(d&&d.setAttribute("content",a),e.coverImage){const m=document.getElementById("twitterImage");m&&m.setAttribute("content",e.coverImage)}}renderPost(e){if(!this.container)return;this.updateSEO(e);const t=e.publishedAt?new Date(e.publishedAt.seconds*1e3).toLocaleDateString("ar-SD",{year:"numeric",month:"long",day:"numeric"}):"",a=e.tags&&e.tags.length?`
          <div class="post-tags">
            ${e.tags.map(i=>`<span class="tag">#${this.escapeHtml(i)}</span>`).join("")}
          </div>
        `:"",n=e.coverImage||e.image||e.cover,r=n?`<img src="${this.escapeHtml(n)}" alt="${this.escapeHtml(e.title)}" fetchpriority="high" decoding="async">`:'<div class="fallback-cover-logo"><span>J</span><span>home</span></div>';this.container.innerHTML=`
            <div class="post-cover">
                ${r}
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
        `).join(""))}},s=new u,p=class{async init(){const e=new URLSearchParams(window.location.search).get("slug");if(!e){s.renderError("لم يتم تحديد مقال.");return}try{const t=await g.getPostBySlug(e);if(!t){s.renderError("عذراً، المقال غير موجود.");return}s.renderPost(t),g.getRelatedPosts(t.category,t.id).then(a=>s.renderRelated(a)).catch(a=>o.warn("PostController: Failed to load related",a))}catch(t){o.error("PostController: Failed to load post",t),s.renderError("حدث خطأ في تحميل المقال.")}}},f=new p;document.addEventListener("DOMContentLoaded",()=>{f.init()});
