import"./firebase-config-teItJWtm.js";import"./GlobalController-DC8vr5AO.js";import{t as o}from"./Logger-D7Tvbo4W.js";var v=class{constructor(){this.db=window.firebase?window.firebase.firestore():null}async getProjects(){if(!this.db)return o.error("ProjectsService: Firebase not initialized."),[];try{return(await this.db.collection("projects").get()).docs.map(e=>({id:e.id,...e.data()}))}catch(e){throw o.error("ProjectsService: Error loading projects",e),e}}},y=new v,h=class{constructor(){this.grid=document.getElementById("projects-grid")}escapeHtml(e){if(!e)return"";const s=document.createElement("div");return s.textContent=e,s.innerHTML}renderError(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">حدث خطأ أثناء تحميل المنتجات.</p></div>')}renderEmpty(){this.grid&&(this.grid.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">لا توجد منتجات مضافة حالياً.</p></div>')}renderProjects(e){if(!this.grid)return;const s=document.createDocumentFragment();e.forEach((t,a)=>{const d=(a+1)*100,i=t.status==="مباشر",c=i?"var(--success)":"var(--warning)",l=i?"white":"#000",p=i?"var(--primary-color)":"var(--warning)",m=i?`<a href="${this.escapeHtml(t.link||"#")}" class="btn btn-primary" style="margin-top: auto; width: 100%;">استعراض التفاصيل</a>`:'<button class="btn btn-secondary" style="margin-top: auto; width: 100%; cursor: not-allowed;" disabled>قريباً</button>',g=i?"linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(20, 184, 166, 0.1))":"linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))",u=i?`<div style="width: 150px; height: 300px; background: var(--bg-surface); border: 6px solid #1E293B; border-radius: 20px; box-shadow: var(--elevation-3); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                       <i class="${this.escapeHtml(t.icon||"fas fa-handshake")}" style="font-size: 2.5rem; color: var(--text-primary); margin-bottom: 1rem;"></i>
                   </div>`:`<i class="${this.escapeHtml(t.icon||"fas fa-cubes")}" style="font-size: 8rem; color: var(--text-tertiary); opacity: 0.5;"></i>`,r=document.createElement("div");r.className=`glass-panel animate-fade-up delay-${d}`,r.style.padding="0",r.style.overflow="hidden",r.style.display="flex",r.style.flexDirection="column",i||(r.style.opacity="0.7"),r.innerHTML=`
                <div style="background: ${g}; padding: 3rem; display: flex; justify-content: center; position: relative;">
                    <span style="position: absolute; top: 1rem; right: 1rem; background: ${c}; color: ${l}; padding: 0.25rem 1rem; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 600;">${this.escapeHtml(t.status)}</span>
                    ${u}
                </div>
                <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
                    <h2 class="display-2" style="font-size: 2rem; margin-bottom: 0.5rem;">${this.escapeHtml(t.title)}</h2>
                    <p class="text-muted" style="margin-bottom: 1.5rem;">${this.escapeHtml(t.description)}</p>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span class="caption-meta">نسبة الإنجاز</span>
                            <span class="caption-meta en-text">${t.progress||0}%</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${t.progress||0}%; height: 100%; background: ${p};"></div>
                        </div>
                    </div>

                    ${m}
                </div>
            `,s.appendChild(r)}),this.grid.innerHTML="",this.grid.appendChild(s)}},n=new h,b=class{async init(){try{const e=await y.getProjects();e.length===0?n.renderEmpty():n.renderProjects(e)}catch(e){o.error("ProjectsController: Initialization failed",e),n.renderError()}}},f=new b;document.addEventListener("DOMContentLoaded",()=>{f.init()});
