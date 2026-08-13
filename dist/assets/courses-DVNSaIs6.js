import{t as b}from"./CourseRepository-BkU7rJA0.js";/* empty css              */import"./firebase-config-DkUYsNQt.js";import"./animations-BlPka5LK.js";import"./GlobalController-DTbCEj-T.js";import{n as f}from"./enrollment-Da4rmH6X.js";var $=class{async fetchAllCourses(){try{return await b.getAllCourses()}catch(t){throw console.error("[AcademyService] Failed to fetch courses:",t),t}}},x=new $,E=class{constructor(){this.coursesData={}}async init(){f.init(),await this.renderCourses(),this.setupFiltering(),this._setupModalCloseHandlers()}_setupModalCloseHandlers(){const t=document.getElementById("course-modal");if(t){const e=t.querySelector(".close-modal");e&&e.addEventListener("click",()=>this.closeModal()),t.addEventListener("click",o=>{o.target===t&&this.closeModal()})}const s=document.getElementById("instructor-modal");if(s){const e=s.querySelector(".close-instructor-modal");e&&e.addEventListener("click",()=>this.closeInstructorModal()),s.addEventListener("click",o=>{o.target===s&&this.closeInstructorModal()})}const r=document.getElementById("enrollment-modal");if(r){const e=r.querySelector(".close-enrollment-modal");e&&e.addEventListener("click",()=>{r.classList.remove("active"),document.body.style.overflow="auto"}),r.querySelectorAll(".close-enrollment-modal").forEach(o=>{o.addEventListener("click",()=>{r.classList.remove("active"),document.body.style.overflow="auto"})})}document.addEventListener("keydown",e=>{if(e.key==="Escape"){this.closeModal(),this.closeInstructorModal();const o=document.getElementById("enrollment-modal");o&&(o.classList.remove("active"),document.body.style.overflow="auto")}})}async renderCourses(){const t=document.getElementById("courses-grid");if(t){t.innerHTML='<div style="text-align:center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 1rem;">جاري تحميل الدورات...</p></div>';try{const s=await x.fetchAllCourses();if(t.innerHTML="",this.coursesData={},!s||s.length===0){t.innerHTML='<div style="text-align:center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;"><p>لا توجد دورات متاحة حالياً.</p></div>';return}const r=document.getElementById("courses-count");r&&(r.innerText=s.length),s.forEach(e=>{this.coursesData[e.id]=e,t.innerHTML+=this.generateCourseCardHtml(e)})}catch(s){console.error("[AcademyController]",s),t.innerHTML='<div style="text-align:center; padding: 3rem; color: var(--danger); grid-column: 1 / -1;"><p>حدث خطأ أثناء جلب الدورات.</p></div>'}}}generateCourseCardHtml(t){const s=t.category||"all",r=t.level||"عام",e=t.duration?`${t.duration} يوم`:"غير محدد",o=t.title||"دورة بدون عنوان",i=t.description||"لا يوجد وصف متاح.",a=t.cover||t.coverImage||t.image||t.thumbnail||t.photo,n=a&&a.trim()!==""?a:null,l=!!t.isLive,c=t.price&&t.price>0?t.price:0,p=t.isPaid?'<span class="course-card__badge course-card__badge--paid"><i class="fas fa-crown"></i> دورة مدفوعة</span>':'<span class="course-card__badge course-card__badge--free"><i class="fas fa-gift"></i> مجانية بالكامل</span>',u=l?'<span class="course-card__pill course-card__pill--live"><i class="fas fa-circle"></i> مباشر الآن</span>':"",g=c>0?`<span class="course-price-tag course-price-tag--paid"><i class="fas fa-tag"></i> ${c.toLocaleString("ar-EG")} SDG</span>`:'<span class="course-price-tag course-price-tag--free"><i class="fas fa-check-circle"></i> مجاني</span>';return`
        <article class="course-card" data-category="${s}" style="display: flex; flex-direction: column; background: transparent; border: none; box-shadow: none; overflow: visible;">
            <div class="course-card__media">
                ${n?`<img src="${n}" alt="${o}" loading="lazy" decoding="async" onerror="this.style.display='none';">`:'<div class="fallback-cover-logo"><span>J</span><span>home</span></div>'}
                ${p}
                ${u}
            </div>
            <div class="course-card__content glass-panel" style="margin-top: -30px; position: relative; z-index: 2; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08);">
                <div class="course-card__meta">
                    <span class="caption-meta" style="color: var(--primary-light);">${r}</span>
                    <span class="caption-meta en-text" style="background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">${e}</span>
                </div>
                <h3 class="course-card__title">${o}</h3>
                <p class="course-card__description">${i.substring(0,95)}${i.length>95?"...":""}</p>
                <div class="course-card__footer">
                    ${g}
                </div>
                <div class="course-card__actions">
                    <button class="btn btn-secondary open-course-modal" onclick="openModal('${t.id}')">التفاصيل</button>
                    <a href="course-room.html?type=paid&id=${t.id}" class="btn btn-primary">الدخول إلى الغرفة</a>
                </div>
            </div>
        </article>
        `}setupFiltering(){const t=document.querySelectorAll(".filter-btn");t.length>0&&t.forEach(s=>{s.addEventListener("click",()=>{t.forEach(e=>e.classList.remove("active")),s.classList.add("active");const r=s.getAttribute("data-filter");document.querySelectorAll(".course-card").forEach(e=>{r==="all"||e.getAttribute("data-category")===r?(e.style.display="flex",setTimeout(()=>{e.style.opacity="1",e.style.transform="translateY(0)"},10)):(e.style.opacity="0",e.style.transform="translateY(10px)",setTimeout(()=>{e.style.display="none"},300))})})})}openModal(t){const s=document.getElementById("course-modal"),r=document.getElementById("course-modal-body");if(!s||!r)return;const e=this.coursesData[t];if(e){let o="";e.isPaid?o=`
                <button class="btn btn-secondary" style="flex: 1;" onclick="window.academyController.openEnrollment('${e.title}', true, '${e.id}')">طلب اشتراك <i class="fas fa-credit-card" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${e.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `:o=`
                <button class="btn btn-secondary" style="flex: 1;" onclick="window.academyController.openEnrollment('${e.title}', false, '${e.id}')">طلب انضمام مجاني <i class="fas fa-certificate" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${e.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `;const i=e.cover||e.coverImage||e.image||e.thumbnail||e.photo,a=i&&i.trim()!==""?i:"assets/images/courses/placeholder.jpg",n=e.isPaid?"دورة مدفوعة":"دورة مجانية",l=e.isLive?"الجلسة مفتوحة الآن":"محتوى عملي ومتابعة مستمرة",c=e.level||"عام",p=e.duration?`${e.duration} يوم`:"غير محدد",u=e.students||e.studentsCount||0,g=e.instructorName||e.instructor||"مقدم الدورة",d=e.price&&e.price>0?e.price:0,v=d>0?`${d.toLocaleString("ar-EG")} SDG`:"مجاني",y=d>0?"#34d399":"#60a5fa",h=d>0?"fa-tag":"fa-gift";r.innerHTML=`
                <div class="course-modal-shell">
                    <div class="modal-hero">
                        <img class="modal-hero__image" src="${a}" alt="${e.title}" onerror="this.style.display='none';">
                        <div class="modal-hero__content">
                            <span class="modal-badge"><i class="fas fa-play-circle"></i> ${n}</span>
                            <h2>${e.title}</h2>
                            <p class="body-large" style="margin:0; max-width:560px; color: rgba(255,255,255,0.8);">${l}</p>
                            <div class="modal-cta-stack">
                                ${o}
                            </div>
                        </div>
                    </div>
                    <div class="modal-details-container">
                        <p class="body-large text-muted">${e.description||"لا يوجد وصف متاح."}</p>
                        
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
                                <strong>${u} طالب</strong>
                            </div>
                            <div class="meta-item" style="background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.2);">
                                <i class="fas ${h}" style="color: ${y};"></i>
                                <span style="color: ${y};">رسوم الدورة</span>
                                <strong style="color: ${y}; font-size: 1.1rem;">${v}</strong>
                            </div>
                            <button class="meta-item" style="cursor: pointer; background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.3); transition: 0.3s; width: 100%; display: block; font-family: inherit; padding: 1rem; border-radius: var(--radius-md);" onmouseover="this.style.background='rgba(147, 51, 234, 0.2)'" onmouseout="this.style.background='rgba(147, 51, 234, 0.1)'" onclick="window.academyController.openInstructorModal('${e.id}')">
                                <i class="fas fa-chalkboard-teacher" style="color: #D8B4FE;"></i>
                                <span style="color: #A5B4FC;">المقدم</span>
                                <strong style="color: white; margin-top: 0.25rem; display: block;">${g}</strong>
                            </button>
                        </div>
                    </div>
                </div>
            `}else r.innerHTML='<div style="padding: 3rem; text-align: center;">لا توجد تفاصيل لهذه الدورة حالياً.</div>';s.classList.add("active"),document.body.style.overflow="hidden"}closeModal(){const t=document.getElementById("course-modal"),s=document.getElementById("course-modal-body");t&&(t.classList.remove("active"),document.body.style.overflow="auto",setTimeout(()=>{s&&(s.innerHTML="")},400))}openInstructorModal(t){const s=document.getElementById("instructor-modal"),r=document.getElementById("instructor-modal-body");if(!s||!r)return;const e=this.coursesData[t];if(e){let o=e.instructor;const i=typeof o=="object"&&o!==null?o.name||"مقدم الدورة":o||"مقدم الدورة";let a=typeof o=="object"&&o!==null&&o.photo?o.photo:e.instructorPhoto||`https://ui-avatars.com/api/?name=${encodeURIComponent(i)}&background=1E293B&color=A5B4FC`;a&&typeof a=="string"&&a.includes("instructor.png")&&(a=`https://ui-avatars.com/api/?name=${encodeURIComponent(i)}&background=1E293B&color=A5B4FC`);let n=typeof o=="object"&&o!==null&&o.specialty?o.specialty:e.instructorSpecialty||"غير محدد";n&&typeof n=="string"&&n.includes("مبرمج تطبيقات")&&(n="غير محدد");let l=typeof o=="object"&&o!==null&&o.bio?o.bio:e.instructorBio||"لا توجد نبذة تعريفية متوفرة عن مقدم هذه الدورة.";l&&typeof l=="string"&&(l.includes("جمال مؤسس jhome")||l.includes("مهندس برمجيات ذو خبرة"))&&(l="لا توجد نبذة تعريفية متوفرة عن مقدم هذه الدورة."),r.innerHTML=`
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
            `,s.classList.add("active")}}closeInstructorModal(){const t=document.getElementById("instructor-modal");t&&t.classList.remove("active")}openEnrollment(t,s=!0,r=null){f&&f.openEnrollment(t,s,r)}},m=new E;window.academyController=m;window.openModal=m.openModal.bind(m);document.addEventListener("DOMContentLoaded",()=>{m.init()});
