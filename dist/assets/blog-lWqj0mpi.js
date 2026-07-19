import"./firebase-config-teItJWtm.js";import"./GlobalController-DC8vr5AO.js";import{t as p}from"./Logger-D7Tvbo4W.js";var g=class{constructor(){this.db=window.firebase?window.firebase.firestore():null}async getMediaContent(){if(!this.db)return p.error("BlogService: Firebase not initialized."),[];try{const[a,s]=await Promise.all([this.db.collection("posts").where("status","==","published").get(),this.db.collection("successStories").where("isPublished","==",!0).get()]),i=[];return a.forEach(t=>{const r=t.data(),e=r.publishedAt?.toDate?r.publishedAt.toDate():new Date(0);i.push({type:"post",id:t.id,date:e,data:r})}),s.forEach(t=>{const r=t.data(),e=r.createdAt?.toDate?r.createdAt.toDate():new Date(0);i.push({type:"story",id:t.id,date:e,data:r})}),i.sort((t,r)=>r.date-t.date)}catch(a){throw p.error("BlogService: Error fetching media content:",a),a}}},m=new g,f=class{constructor(){this.grid=document.getElementById("media-grid")}escHtml(a){if(!a)return"";const s=document.createElement("div");return s.textContent=a,s.innerHTML}renderLoading(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">جاري تحميل المحتوى...</p></div>')}renderError(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">حدث خطأ أثناء تحميل المحتوى. يرجى المحاولة لاحقاً.</p></div>')}renderEmpty(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">لا يوجد محتوى متاح حالياً.</p></div>')}renderContent(a){if(!this.grid)return;const s=document.createDocumentFragment();a.forEach(i=>{const t=i.date.getTime()>0?i.date.toLocaleDateString("ar-EG"):"",r=document.createElement("div");if(i.type==="post"){const e=i.data,d=e.excerpt||(e.content?e.content.replace(/<[^>]*>/g,"").slice(0,120)+"...":""),o=this.escHtml(d);let n=e.coverImage||e.image;(!n||n.includes("placeholder.jpg")||n.includes("default-avatar.png")||n.includes("blog-placeholder.jpg"))&&(n="assets/images/favicon.png");let c="";n==="assets/images/favicon.png"?c=`<div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(20, 184, 166, 0.15)); height: 220px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <img src="${n}" style="width: 80px; opacity: 0.7;" alt="Jhome">
                    </div>`:c=`<div style="background: url('${encodeURI(n)}') center/cover no-repeat; height: 220px; position: relative;"></div>`,r.innerHTML=`
                    <a href="${`post.html?slug=${encodeURIComponent(e.slug||i.id)}`}" class="glass-panel course-card" data-card-type="post" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none; text-decoration: none; color: inherit; transition: transform 0.3s ease;">
                        ${c}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                <span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">مقال - ${this.escHtml(e.category||"عام")}</span>
                                <span class="text-muted" style="font-size: 0.85rem;"><i class="fas fa-calendar"></i> ${t}</span>
                            </div>
                            <h3 style="margin-bottom: 10px; font-size: 1.4rem;">${this.escHtml(e.title)}</h3>
                            <p style="margin-bottom: 1.5rem; flex: 1; line-height: 1.6; color: var(--text-secondary);">${o}</p>
                            <span class="btn btn-primary" style="margin-top: auto; display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; color: var(--primary); padding: 0;">
                                قراءة المزيد <i class="fas fa-arrow-left"></i>
                            </span>
                        </div>
                    </a>
                `}else if(i.type==="story"){const e=i.data,d=`story.html?id=${encodeURIComponent(i.id)}`;let o=e.coverImage||e.personAvatar;(!o||o.includes("placeholder.jpg")||o.includes("default-avatar.png")||o.includes("blog-placeholder.jpg"))&&(o="assets/images/favicon.png");let n="";o==="assets/images/favicon.png"?n=`<div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(20, 184, 166, 0.15)); height: 220px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <img src="${o}" style="width: 80px; opacity: 0.7;" alt="Jhome">
                    </div>`:n=`<div style="background: url('${encodeURI(o)}') center/cover no-repeat; height: 220px; position: relative;"></div>`,r.innerHTML=`
                    <div class="glass-panel course-card" data-card-type="story" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none;">
                        ${n}
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
                            <a href="${d}" class="btn btn-primary" style="margin-top: auto; display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--primary); padding: 0; border: none; text-decoration: none;">
                                قراءة القصة كاملة <i class="fas fa-arrow-left"></i>
                            </a>
                        </div>
                    </div>
                `}r.firstElementChild&&s.appendChild(r.firstElementChild)}),this.grid.innerHTML="",this.grid.appendChild(s)}},l=new f,h=class{async init(){try{l.renderLoading();const a=await m.getMediaContent();a.length===0?l.renderEmpty():l.renderContent(a),this.attachFilters()}catch(a){p.error("BlogController: Failed to initialize:",a),l.renderError()}}attachFilters(){const a=document.querySelectorAll(".blog-filter-btn");a.forEach(s=>{s.addEventListener("click",()=>{const i=s.dataset.filter;a.forEach(t=>{const r=t.dataset.filter===i;t.style.background=r?"var(--primary-color)":"transparent",t.style.color=r?"#fff":"var(--primary-color)",r?t.classList.add("active"):t.classList.remove("active")}),document.querySelectorAll("#media-grid [data-card-type]").forEach(t=>{t.style.display=i==="all"||t.dataset.cardType===i?"":"none"})})})}},u=new h;document.addEventListener("DOMContentLoaded",()=>{u.init()});
