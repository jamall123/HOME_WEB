import{t as h}from"./CourseRepository-CIYmBoLj.js";/* empty css              */import"./firebase-config-CVzH6vXx.js";import"./animations-BlPka5LK.js";import"./GlobalController-BEZYk1c_.js";import{n as y}from"./enrollment-BPCPHwZE.js";var $=class{async fetchAllCourses(){try{return await h.getAllCourses()}catch(e){throw e}}},x=new $,C=class{constructor(){this.coursesData={}}async init(){await this.renderCourses(),this.setupFiltering()}async renderCourses(){const e=document.getElementById("courses-grid");if(e){e.innerHTML='<div style="text-align:center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 1rem;">جاري تحميل الدورات...</p></div>';try{const o=await x.fetchAllCourses();if(e.innerHTML="",this.coursesData={},!o||o.length===0){e.innerHTML='<div style="text-align:center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;"><p>لا توجد دورات متاحة حالياً.</p></div>';return}const r=document.getElementById("courses-count");r&&(r.innerText=o.length),o.forEach(t=>{this.coursesData[t.id]=t,e.innerHTML+=this.generateCourseCardHtml(t)})}catch{e.innerHTML='<div style="text-align:center; padding: 3rem; color: var(--danger); grid-column: 1 / -1;"><p>حدث خطأ أثناء جلب الدورات.</p></div>'}}}generateCourseCardHtml(e){const o=e.category||"all",r=e.level||"عام",t=e.duration?`${e.duration} يوم`:"غير محدد",s=e.title||"دورة بدون عنوان",i=e.description||"لا يوجد وصف متاح.",a=e.cover||e.coverImage||e.image||e.thumbnail||e.photo,n=a&&a.trim()!==""?a:null,l=!!e.isLive,c=e.price&&e.price>0?e.price:0,p=e.isPaid?'<span class="course-card__badge course-card__badge--paid"><i class="fas fa-crown"></i> دورة مدفوعة</span>':'<span class="course-card__badge course-card__badge--free"><i class="fas fa-gift"></i> مجانية بالكامل</span>',m=l?'<span class="course-card__pill course-card__pill--live"><i class="fas fa-circle"></i> مباشر الآن</span>':"",u=c>0?`<span class="course-price-tag course-price-tag--paid"><i class="fas fa-tag"></i> ${c.toLocaleString("ar-EG")} SDG</span>`:'<span class="course-price-tag course-price-tag--free"><i class="fas fa-check-circle"></i> مجاني</span>';return`
        <article class="course-card" data-category="${o}" style="display: flex; flex-direction: column; background: transparent; border: none; box-shadow: none; overflow: visible;">
            <div class="course-card__media">
                ${n?`<img src="${n}" alt="${s}" loading="lazy" decoding="async" onerror="this.style.display='none';">`:'<div class="fallback-cover-logo"><span>J</span><span>home</span></div>'}
                ${p}
                ${m}
            </div>
            <div class="course-card__content glass-panel" style="margin-top: -30px; position: relative; z-index: 2; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08);">
                <div class="course-card__meta">
                    <span class="caption-meta" style="color: var(--primary-light);">${r}</span>
                    <span class="caption-meta en-text" style="background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">${t}</span>
                </div>
                <h3 class="course-card__title">${s}</h3>
                <p class="course-card__description">${i.substring(0,95)}${i.length>95?"...":""}</p>
                <div class="course-card__footer">
                    ${u}
                </div>
                <div class="course-card__actions">
                    <button class="btn btn-secondary open-course-modal" onclick="openModal('${e.id}')">التفاصيل</button>
                    <a href="course-room.html?type=paid&id=${e.id}" class="btn btn-primary">الدخول إلى الغرفة</a>
                </div>
            </div>
        </article>
        `}setupFiltering(){const e=document.querySelectorAll(".filter-btn");e.length>0&&e.forEach(o=>{o.addEventListener("click",()=>{e.forEach(t=>t.classList.remove("active")),o.classList.add("active");const r=o.getAttribute("data-filter");document.querySelectorAll(".course-card").forEach(t=>{r==="all"||t.getAttribute("data-category")===r?(t.style.display="flex",setTimeout(()=>{t.style.opacity="1",t.style.transform="translateY(0)"},10)):(t.style.opacity="0",t.style.transform="translateY(10px)",setTimeout(()=>{t.style.display="none"},300))})})})}openModal(e){const o=document.getElementById("course-modal"),r=document.getElementById("course-modal-body");if(!o||!r)return;const t=this.coursesData[e];if(t){let s="";t.isPaid?s=`
                <button class="btn btn-secondary" style="flex: 1;" onclick="window.academyController.openEnrollment('${t.title}', true, '${t.id}')">طلب اشتراك <i class="fas fa-credit-card" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${t.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `:s=`
                <button class="btn btn-secondary" style="flex: 1;" onclick="window.academyController.openEnrollment('${t.title}', false, '${t.id}')">طلب انضمام مجاني <i class="fas fa-certificate" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${t.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `;const i=t.cover||t.coverImage||t.image||t.thumbnail||t.photo,a=i&&i.trim()!==""?i:"assets/images/courses/placeholder.jpg",n=t.isPaid?"دورة مدفوعة":"دورة مجانية",l=t.isLive?"الجلسة مفتوحة الآن":"محتوى عملي ومتابعة مستمرة",c=t.level||"عام",p=t.duration?`${t.duration} يوم`:"غير محدد",m=t.students||t.studentsCount||0,u=t.instructorName||t.instructor||"مقدم الدورة",d=t.price&&t.price>0?t.price:0,v=d>0?`${d.toLocaleString("ar-EG")} SDG`:"مجاني",g=d>0?"#34d399":"#60a5fa",b=d>0?"fa-tag":"fa-gift";r.innerHTML=`
                <div class="course-modal-shell">
                    <div class="modal-hero">
                        <img class="modal-hero__image" src="${a}" alt="${t.title}" onerror="this.style.display='none';">
                        <div class="modal-hero__content">
                            <span class="modal-badge"><i class="fas fa-play-circle"></i> ${n}</span>
                            <h2>${t.title}</h2>
                            <p class="body-large" style="margin:0; max-width:560px; color: rgba(255,255,255,0.8);">${l}</p>
                            <div class="modal-cta-stack">
                                ${s}
                            </div>
                        </div>
                    </div>
                    <div class="modal-details-container">
                        <p class="body-large text-muted">${t.description||"لا يوجد وصف متاح."}</p>
                        
                        <div class="course-meta-grid">
                            <div class="meta-item">
                                <i class="fas fa-clock"></i>
                                <span>المدة</span>
                                <strong>${p}</strong>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-signal"></i>
                                <span>المستوى</span>
                                <strong>${c}</strong>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-users"></i>
                                <span>المشتركين</span>
                                <strong>${m} طالب</strong>
                            </div>
                            <div class="meta-item" style="background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.2);">
                                <i class="fas ${b}" style="color: ${g};"></i>
                                <span style="color: ${g};">رسوم الدورة</span>
                                <strong style="color: ${g}; font-size: 1.1rem;">${v}</strong>
                            </div>
                            <button class="meta-item" style="cursor: pointer; background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.3); transition: 0.3s; width: 100%; display: block; font-family: inherit; padding: 1rem; border-radius: var(--radius-md);" onmouseover="this.style.background='rgba(147, 51, 234, 0.2)'" onmouseout="this.style.background='rgba(147, 51, 234, 0.1)'" onclick="window.academyController.openInstructorModal('${t.id}')">
                                <i class="fas fa-chalkboard-teacher" style="color: #D8B4FE;"></i>
                                <span style="color: #A5B4FC;">المقدم</span>
                                <strong style="color: white; margin-top: 0.25rem; display: block;">${u}</strong>
                            </button>
                        </div>
                    </div>
                </div>
            `}else r.innerHTML='<div style="padding: 3rem; text-align: center;">لا توجد تفاصيل لهذه الدورة حالياً.</div>';o.classList.add("active"),document.body.style.overflow="hidden"}closeModal(){const e=document.getElementById("course-modal"),o=document.getElementById("course-modal-body");e&&(e.classList.remove("active"),document.body.style.overflow="auto",setTimeout(()=>{o&&(o.innerHTML="")},400))}openInstructorModal(e){const o=document.getElementById("instructor-modal"),r=document.getElementById("instructor-modal-body");if(!o||!r)return;const t=this.coursesData[e];if(t){let s=t.instructor;const i=typeof s=="object"&&s!==null?s.name||"مقدم الدورة":s||"مقدم الدورة";let a=typeof s=="object"&&s!==null&&s.photo?s.photo:t.instructorPhoto||`https://ui-avatars.com/api/?name=${encodeURIComponent(i)}&background=1E293B&color=A5B4FC`;a&&typeof a=="string"&&a.includes("instructor.png")&&(a=`https://ui-avatars.com/api/?name=${encodeURIComponent(i)}&background=1E293B&color=A5B4FC`);let n=typeof s=="object"&&s!==null&&s.specialty?s.specialty:t.instructorSpecialty||"غير محدد";n&&typeof n=="string"&&n.includes("مبرمج تطبيقات")&&(n="غير محدد");let l=typeof s=="object"&&s!==null&&s.bio?s.bio:t.instructorBio||"لا توجد نبذة تعريفية متوفرة عن مقدم هذه الدورة.";l&&typeof l=="string"&&(l.includes("جمال مؤسس jhome")||l.includes("مهندس برمجيات ذو خبرة"))&&(l="لا توجد نبذة تعريفية متوفرة عن مقدم هذه الدورة."),r.innerHTML=`
                <div style="background: linear-gradient(135deg, #1E293B, #0B162C); border-radius: 20px; overflow: hidden;">
                    <div style="height: 120px; background: url('${a}') center/cover; filter: blur(5px) brightness(0.5);"></div>
                    <div style="padding: 0 2rem 2rem; position: relative;">
                        <img src="${a}" alt="${i}" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid #1E293B; margin-top: -50px; position: relative; z-index: 2; object-fit: cover;">
                        <h3 class="display-3" style="margin-top: 1rem; margin-bottom: 0.2rem;">${i}</h3>
                        <p style="color: var(--primary-light); font-weight: 600; margin-bottom: 1.5rem;">${n}</p>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: #A5B4FC; margin-bottom: 0.5rem; font-size: 1rem;">نبذة تعريفية</h4>
                            <p class="text-muted" style="line-height: 1.6; font-size: 0.95rem;">${l}</p>
                        </div>
                    </div>
                </div>
            `,o.classList.add("active")}}closeInstructorModal(){const e=document.getElementById("instructor-modal");e&&e.classList.remove("active")}openEnrollment(e,o=!0,r=null){y&&y.openEnrollment(e,o,r)}},f=new C;window.academyController=f;document.addEventListener("DOMContentLoaded",()=>{f.init()});
