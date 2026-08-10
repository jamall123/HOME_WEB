import{s as g}from"./CourseRepository-CIYmBoLj.js";/* empty css              */import"./firebase-config-CVzH6vXx.js";import"./animations-BlPka5LK.js";import{t as m}from"./GlobalController-BEZYk1c_.js";var p="jhome_blog_media_cache_v1",f=180*1e3,y=24,v=class{readCache(){try{const t=sessionStorage.getItem(p);if(!t)return null;const e=JSON.parse(t);return Date.now()-e.timestamp>f?null:e.items.map(a=>({...a,date:new Date(a.date)}))}catch{return null}}writeCache(t){try{sessionStorage.setItem(p,JSON.stringify({timestamp:Date.now(),items:t.map(e=>({...e,date:e.date.toISOString()}))}))}catch{}}async getMediaContent({forceRefresh:t=!1}={}){if(!t){const e=this.readCache();if(e)return e}try{const e=await m.getRecentMediaContent(y);return this.writeCache(e),e}catch(e){throw g.error("BlogService: Error fetching media content:",e),e}}},h=new v,u=class{constructor(){this.grid=document.getElementById("media-grid")}escHtml(t){if(!t)return"";const e=document.createElement("div");return e.textContent=t,e.innerHTML}renderLoading(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">جاري تحميل المحتوى...</p></div>')}renderError(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">حدث خطأ أثناء تحميل المحتوى. يرجى المحاولة لاحقاً.</p></div>')}renderEmpty(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">لا يوجد محتوى متاح حالياً.</p></div>')}renderContent(t){if(!this.grid)return;const e=document.createDocumentFragment();t.forEach(a=>{const n=a.date.getTime()>0?a.date.toLocaleDateString("ar-EG"):"",o=document.createElement("div");if(a.type==="post"){const r=a.data,d=r.excerpt||(r.content?r.content.replace(/<[^>]*>/g,"").slice(0,120)+"...":""),s=this.escHtml(d);let i=r.coverImage||r.image||r.cover;(!i||i.includes("placeholder.jpg")||i.includes("default-avatar.png")||i.includes("blog-placeholder.jpg"))&&(i="fallback");let c="";i==="fallback"?c=`<div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(20, 184, 166, 0.15)); height: 220px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <div style="font-size: 3rem; font-family: var(--font-en, 'Outfit', sans-serif); font-weight: 800; letter-spacing: -1px;">
                            <span style="color: var(--primary, #4f8deb);">J</span><span style="color: var(--text-main, #ffffff);">home</span>
                        </div>
                    </div>`:c=`<img src="${this.escHtml(i)}" alt="${this.escHtml(r.title||"")}" loading="lazy" decoding="async" style="width:100%; height: 220px; object-fit: cover; display:block; position: relative;">`,o.innerHTML=`
                    <a href="${`post.html?slug=${encodeURIComponent(r.slug||a.id)}`}" class="glass-panel course-card" data-card-type="post" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none; text-decoration: none; color: inherit; transition: transform 0.3s ease;">
                        ${c}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                <span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">مقال - ${this.escHtml(r.category||"عام")}</span>
                                <span class="text-muted" style="font-size: 0.85rem;"><i class="fas fa-calendar"></i> ${n}</span>
                            </div>
                            <h3 style="margin-bottom: 10px; font-size: 1.4rem;">${this.escHtml(r.title)}</h3>
                            <p style="margin-bottom: 1.5rem; flex: 1; line-height: 1.6; color: var(--text-secondary);">${s}</p>
                            <span class="btn btn-primary" style="margin-top: auto; display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; color: var(--primary); padding: 0;">
                                قراءة المزيد <i class="fas fa-arrow-left"></i>
                            </span>
                        </div>
                    </a>
                `}else if(a.type==="story"){const r=a.data,d=`story.html?id=${encodeURIComponent(a.id)}`;let s=r.coverImage||r.image||r.cover||r.personAvatar;(!s||s.includes("placeholder.jpg")||s.includes("default-avatar.png")||s.includes("blog-placeholder.jpg"))&&(s="fallback");let i="";s==="fallback"?i=`<div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(20, 184, 166, 0.15)); height: 220px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <div style="font-size: 3rem; font-family: var(--font-en, 'Outfit', sans-serif); font-weight: 800; letter-spacing: -1px;">
                            <span style="color: var(--primary, #4f8deb);">J</span><span style="color: var(--text-main, #ffffff);">home</span>
                        </div>
                    </div>`:i=`<img src="${this.escHtml(s)}" alt="${this.escHtml(r.personName||"")}" loading="lazy" decoding="async" style="width:100%; height: 220px; object-fit: cover; display:block; position: relative;">`,o.innerHTML=`
                    <div class="glass-panel course-card" data-card-type="story" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none;">
                        ${i}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                                <h3 style="margin: 0; font-size: 1.4rem;">${this.escHtml(r.personName)}</h3>
                                <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10B981; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; white-space: nowrap;">قصة نجاح</span>
                            </div>
                            <p style="color: var(--primary); font-weight: bold; margin-bottom: 10px;">${this.escHtml(r.personRole||"")}</p>
                            
                            <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 15px; border-right: 3px solid var(--primary);">
                                <p class="text-muted" style="margin: 0; font-size: 0.9rem;">
                                    <strong>أهم إنجاز:</strong> ${this.escHtml(r.keyAchievement||"")}
                                </p>
                            </div>
                            
                            <p style="margin-bottom: 1.5rem; line-height: 1.6; flex: 1; color: var(--text-secondary);">${this.escHtml((r.story||"").slice(0,150))}...</p>
                            <a href="${d}" class="btn btn-primary" style="margin-top: auto; display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--primary); padding: 0; border: none; text-decoration: none;">
                                قراءة القصة كاملة <i class="fas fa-arrow-left"></i>
                            </a>
                        </div>
                    </div>
                `}o.firstElementChild&&e.appendChild(o.firstElementChild)}),this.grid.innerHTML="",this.grid.appendChild(e)}},l=new u,x=class{async init(){try{l.renderLoading();const t=await h.getMediaContent();t.length===0?l.renderEmpty():l.renderContent(t),this.attachFilters()}catch(t){g.error("BlogController: Failed to initialize:",t),l.renderError()}}attachFilters(){const t=document.querySelectorAll(".blog-filter-btn");t.forEach(e=>{e.addEventListener("click",()=>{const a=e.dataset.filter;t.forEach(n=>{const o=n.dataset.filter===a;n.style.background=o?"var(--primary-color)":"transparent",n.style.color=o?"#fff":"var(--primary-color)",o?n.classList.add("active"):n.classList.remove("active")}),document.querySelectorAll("#media-grid [data-card-type]").forEach(n=>{n.style.display=a==="all"||n.dataset.cardType===a?"":"none"})})})}},b=new x;document.addEventListener("DOMContentLoaded",()=>{b.init()});
