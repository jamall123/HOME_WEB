import"./firebase-config-teItJWtm.js";import"./GlobalController-DC8vr5AO.js";import{t as p}from"./Logger-D7Tvbo4W.js";var g=class{constructor(){this.db=window.firebase?window.firebase.firestore():null}async getMediaContent(){if(!this.db)return p.error("BlogService: Firebase not initialized."),[];try{const[t,o]=await Promise.all([this.db.collection("posts").where("status","==","published").get(),this.db.collection("successStories").where("isPublished","==",!0).get()]),a=[];return t.forEach(s=>{const r=s.data(),e=r.publishedAt?.toDate?r.publishedAt.toDate():new Date(0);a.push({type:"post",id:s.id,date:e,data:r})}),o.forEach(s=>{const r=s.data(),e=r.createdAt?.toDate?r.createdAt.toDate():new Date(0);a.push({type:"story",id:s.id,date:e,data:r})}),a.sort((s,r)=>r.date-s.date)}catch(t){throw p.error("BlogService: Error fetching media content:",t),t}}},m=new g,h=class{constructor(){this.grid=document.getElementById("media-grid")}escHtml(t){if(!t)return"";const o=document.createElement("div");return o.textContent=t,o.innerHTML}renderLoading(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">جاري تحميل المحتوى...</p></div>')}renderError(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">حدث خطأ أثناء تحميل المحتوى. يرجى المحاولة لاحقاً.</p></div>')}renderEmpty(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">لا يوجد محتوى متاح حالياً.</p></div>')}renderContent(t){if(!this.grid)return;const o=document.createDocumentFragment();t.forEach(a=>{const s=a.date.getTime()>0?a.date.toLocaleDateString("ar-EG"):"",r=document.createElement("div");if(a.type==="post"){const e=a.data,l=e.excerpt||(e.content?e.content.replace(/<[^>]*>/g,"").slice(0,120)+"...":""),n=this.escHtml(l);let i=e.coverImage||e.image;(!i||i.includes("placeholder.jpg")||i.includes("default-avatar.png")||i.includes("blog-placeholder.jpg"))&&(i="assets/images/favicon.png");let c="";i==="assets/images/favicon.png"?c=`<div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(20, 184, 166, 0.15)); height: 220px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <img src="${i}" style="width: 80px; opacity: 0.7;" alt="Jhome">
                    </div>`:c=`<div style="background: url('${encodeURI(i)}') center/cover no-repeat; height: 220px; position: relative;"></div>`,r.innerHTML=`
                    <a href="${`post.html?slug=${encodeURIComponent(e.slug||a.id)}`}" class="glass-panel course-card" data-card-type="post" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none; text-decoration: none; color: inherit; transition: transform 0.3s ease;">
                        ${c}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                <span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">مقال - ${this.escHtml(e.category||"عام")}</span>
                                <span class="text-muted" style="font-size: 0.85rem;"><i class="fas fa-calendar"></i> ${s}</span>
                            </div>
                            <h3 style="margin-bottom: 10px; font-size: 1.4rem;">${this.escHtml(e.title)}</h3>
                            <p style="margin-bottom: 1.5rem; flex: 1; line-height: 1.6; color: var(--text-secondary);">${n}</p>
                            <span class="btn btn-primary" style="margin-top: auto; display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; color: var(--primary); padding: 0;">
                                قراءة المزيد <i class="fas fa-arrow-left"></i>
                            </span>
                        </div>
                    </a>
                `}else if(a.type==="story"){const e=a.data,l=`story.html?id=${encodeURIComponent(a.id)}`;let n=e.coverImage||e.personAvatar;(!n||n.includes("placeholder.jpg")||n.includes("default-avatar.png")||n.includes("blog-placeholder.jpg"))&&(n="assets/images/favicon.png");let i="";n==="assets/images/favicon.png"?i=`<div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(20, 184, 166, 0.15)); height: 220px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <img src="${n}" style="width: 80px; opacity: 0.7;" alt="Jhome">
                    </div>`:i=`<div style="background: url('${encodeURI(n)}') center/cover no-repeat; height: 220px; position: relative;"></div>`,r.innerHTML=`
                    <div class="glass-panel course-card" data-card-type="story" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none;">
                        ${i}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                                <h3 style="margin: 0; font-size: 1.4rem;">${this.escHtml(e.personName)}</h3>
                                <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10B981; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; white-space: nowrap;">قصة نجاح</span>
                            </div>
                            <p style="color: var(--primary); font-weight: bold; margin-bottom: 10px;">${this.escHtml(e.personRole||"")}</p>
                            
                            <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 15px; border-right: 3px solid var(--primary);">
                                <p class="text-muted" style="margin: 0; font-size: 0.9rem;">
                                    <strong>أهم إنجاز:</strong> ${this.escHtml(e.keyAchievement||"")}
                                </p>
                            </div>
                            
                            <p style="margin-bottom: 1.5rem; line-height: 1.6; flex: 1; color: var(--text-secondary);">${this.escHtml((e.story||"").slice(0,150))}...</p>
                            <a href="${l}" class="btn btn-primary" style="margin-top: auto; display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--primary); padding: 0; border: none; text-decoration: none;">
                                قراءة القصة كاملة <i class="fas fa-arrow-left"></i>
                            </a>
                        </div>
                    </div>
                `}r.firstElementChild&&o.appendChild(r.firstElementChild)}),this.grid.innerHTML="",this.grid.appendChild(o)}},d=new h,u=class{async init(){try{d.renderLoading();const t=await m.getMediaContent();t.length===0?d.renderEmpty():d.renderContent(t)}catch(t){p.error("BlogController: Failed to initialize:",t),d.renderError()}}},v=new u;document.addEventListener("DOMContentLoaded",()=>{v.init()});
