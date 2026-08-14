const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/CommandBus-CmL-FE1k.js","assets/UserRepository-ocB0OZO4.js","assets/rolldown-runtime-BQ-_32WO.js","assets/CourseRepository-D1vEm8Os.js","assets/EventBus-4Q0tYHVL.js","assets/courseRoom-B9evgojT.js","assets/modulepreload-polyfill-CWIbYaaI.js","assets/firebase-config-DkUYsNQt.js","assets/CurriculumRepository-DPGGAD1M.js","assets/courseRoom-Dd8DccWn.css","assets/sudanFree-CgE2LGLP.css","assets/MediaEngine-B27jAUlJ.js","assets/MediaRepository-fAWIynNJ.js"])))=>i.map(i=>d[i]);
import{n as h,r as x,t as w}from"./CourseRepository-D1vEm8Os.js";import{i as C,r as B}from"./EventBus-4Q0tYHVL.js";import{i as p,l as M,t as I}from"./courseRoom-B9evgojT.js";import{t as k}from"./MediaRepository-fAWIynNJ.js";import"./InstructorAnalyticsUI-BGaenirU.js";import{t as S}from"./MediaEngine-B27jAUlJ.js";var v={get db(){return x.getFirestore()},get storage(){return x.getStorage()},async updateProfile(e,i){if(!e)throw new Error("No UID provided");await this.db.collection(h.COLLECTIONS.USERS).doc(e).set(i,{merge:!0})},async updateCourseProfile(e,i){if(!e)throw new Error("No courseId provided");await this.db.collection(h.COLLECTIONS.COURSES).doc(e).set({instructor:i.name||null,instructorSpecialty:i.specialty||null,instructorBio:i.bio||null,instructorPhoto:i.photo||null},{merge:!0})},uploadMedia(e,i,t=null){return new Promise((s,n)=>{const o=this.storage.ref().child(`${i}/${Date.now()}_${e.name}`).put(e);o.on("state_changed",a=>{t&&t(a.bytesTransferred/a.totalBytes*100)},a=>n(a),async()=>{s(await o.snapshot.ref.getDownloadURL())})})},async updateTeachingMode(e,i){const t={updatedAt:x.getFirestoreFieldValue().serverTimestamp()};for(const[s,n]of Object.entries(i))if(s==="metadata"&&typeof n=="object")for(const[o,a]of Object.entries(n))t[`metadata.${o}`]=a;else t[s]=n;try{await this.db.collection(h.COLLECTIONS.ACTIVE_SESSIONS).doc(e).update(t)}catch{const n={...i,updatedAt:x.getFirestoreFieldValue().serverTimestamp()};await this.db.collection(h.COLLECTIONS.ACTIVE_SESSIONS).doc(e).set(n,{merge:!0})}},async addChannelMessage(e,i){if(!e)throw new Error("No courseId provided");await this.db.collection(h.COLLECTIONS.COURSES).doc(e).collection(h.COLLECTIONS.CHANNEL_MESSAGES).add(i)},async updateClassroomState(e,i){await this.db.collection(h.COLLECTIONS.ACTIVE_SESSIONS).doc(e).set({permissions:i,updatedAt:x.getFirestoreFieldValue().serverTimestamp()},{merge:!0})},async getResources(e){return(await this.db.collection(h.COLLECTIONS.LESSON_RESOURCES).where("courseId","==",e).get()).docs.map(i=>({id:i.id,...i.data()}))},async dispatchCommand(e){const{commandBus:i}=await p(async()=>{const{commandBus:t}=await import("./CommandBus-CmL-FE1k.js");return{commandBus:t}},__vite__mapDeps([0,1,2,3]));return i.dispatch(e)},async postAnnouncement(e,i){await this.db.collection(h.COLLECTIONS.LESSON_ANNOUNCEMENTS).add({courseId:e,...i,timestamp:x.getFirestoreFieldValue().serverTimestamp()})}},L=class{constructor(){}async updateProfile(e,i){await v.updateProfile(e,i)}async updateCourseProfile(e,i){await v.updateCourseProfile(e,i)}uploadMedia(e,i,t=null){return v.uploadMedia(e,i,t)}async updateTeachingMode(e,i){await v.updateTeachingMode(e,i)}async addChannelMessage(e,i,t){i&&(t.lessonId=i),await v.addChannelMessage(e,t)}async updateClassroomState(e,i){await v.updateClassroomState(e,i)}async getResources(e){return await v.getResources(e)}async postAnnouncement(e,i){await v.postAnnouncement(e,i)}},g=new L,y={show({icon:e="📢",title:i="تأكيد",body:t="",okLabel:s="تأكيد",cancelLabel:n="إلغاء",danger:o=!1}={}){return new Promise(a=>{const r=document.getElementById("room-confirm-overlay"),l=document.getElementById("confirm-icon"),u=document.getElementById("confirm-title"),c=document.getElementById("confirm-body"),d=document.getElementById("confirm-ok-btn"),f=document.getElementById("confirm-cancel-btn");if(!r){a(!0);return}l&&(l.textContent=e),u&&(u.textContent=i),c&&(c.textContent=t),d&&(d.textContent=s),f&&(f.textContent=n),d&&(d.className=o?"btn-confirm-ok danger-ok":"btn-confirm-ok");const b=E=>{r.classList.remove("active"),d.onclick=null,f.onclick=null,a(E)};d.onclick=()=>b(!0),f.onclick=()=>b(!1),r.onclick=E=>{E.target===r&&b(!1)},r.classList.add("active")})},alert({icon:e="ℹ️",title:i="تنبيه",body:t="",okLabel:s="حسناً"}={}){return new Promise(n=>{const o=document.getElementById("room-confirm-overlay");if(!o){n();return}document.getElementById("confirm-icon").textContent=e,document.getElementById("confirm-title").textContent=i,document.getElementById("confirm-body").textContent=t,document.getElementById("confirm-ok-btn").textContent=s,document.getElementById("confirm-cancel-btn").style.display="none";const a=document.getElementById("confirm-ok-btn");a.className="btn-confirm-ok";const r=()=>{o.classList.remove("active"),a.onclick=null,document.getElementById("confirm-cancel-btn").style.display="",n()};a.onclick=()=>r(),o.onclick=l=>{l.target===o&&r()},o.classList.add("active")})}},A={show({title:e="بيانات الدرس",body:i="يرجى إدخال عنوان وتفاصيل الدرس الجديد",okLabel:t="حفظ",cancelLabel:s="إلغاء"}={}){return new Promise(n=>{const o=document.getElementById("room-prompt-overlay"),a=document.getElementById("prompt-title"),r=document.getElementById("prompt-body"),l=document.getElementById("prompt-input-title"),u=document.getElementById("prompt-input-desc"),c=document.getElementById("prompt-ok-btn"),d=document.getElementById("prompt-cancel-btn");if(!o){n({title:null,description:null});return}a&&(a.textContent=e),r&&(r.textContent=i),c&&(c.textContent=t),d&&(d.textContent=s),l.value="",u.value="";const f=b=>{o.classList.remove("active"),c.onclick=null,d.onclick=null,n(b?{title:l.value.trim()||null,description:u.value.trim()||""}:{title:null,description:null})};c.onclick=()=>f(!0),d.onclick=()=>f(!1),o.classList.add("active"),l.focus()})}};window.RoomConfirmDialog=y;window.RoomPromptDialog=A;var _=class{init(e){this.controller=e,this.cacheDOM(),this.renderDashboardLayout(),this.attachListeners()}cacheDOM(){this.mountPoint=document.getElementById("instructor-dashboard-mount"),this.tabBtn=document.getElementById("tab-btn-instructor-side")}renderDashboardLayout(){this.mountPoint&&(this.tabBtn&&(this.tabBtn.style.display="flex"),this.mountPoint.innerHTML=`
            <div class="instructor-workspace" style="display: flex; flex-direction: column; height: 100%; gap: 0; overflow: hidden;">

                <!-- ══ Top Navigation Tabs ══ -->
                <div style="display: flex; gap: 0.3rem; padding: 0.7rem 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(0,0,0,0.15); flex-shrink: 0; overflow-x: auto; scrollbar-width: none;">
                    <button class="inst-nav btn btn-sm btn-primary" data-view="dashboard" style="border-radius: 20px; padding: 0.35rem 0.9rem; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fas fa-sliders-h"></i> التحكم
                    </button>
                    <button class="inst-nav btn btn-sm btn-dark" data-view="students" style="border-radius: 20px; padding: 0.35rem 0.9rem; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fas fa-users"></i> الطلاب
                    </button>
                    <button class="inst-nav btn btn-sm btn-dark" data-view="resources" style="border-radius: 20px; padding: 0.35rem 0.9rem; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fas fa-folder-open"></i> الموارد
                    </button>
                    <button class="inst-nav btn btn-sm btn-dark" data-view="profile" style="border-radius: 20px; padding: 0.35rem 0.9rem; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fas fa-user-tie"></i> ملفي
                    </button>
                </div>

                <!-- ══ Scrollable Views Container ══ -->
                <div style="flex: 1; overflow-y: auto; overflow-x: hidden;">

                    <!-- ═══════════════════════════════════════
                         VIEW 1: CONTROL CENTER (DASHBOARD)
                         ═══════════════════════════════════════ -->
                    <div id="inst-view-dashboard" class="inst-view" style="display: flex; flex-direction: column; gap: 1rem; padding: 0.9rem;">

                        <!-- Stats Strip -->
                        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
                            <div>
                                <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.2rem;">متصل الآن</div>
                                <div style="display: flex; align-items: center; gap: 0.4rem;">
                                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite;"></div>
                                    <span id="inst-stat-online" style="font-size: 1.5rem; font-weight: bold; color: white; line-height: 1;">0</span>
                                    <span style="color: var(--text-secondary); font-size: 0.82rem;">طالب</span>
                                </div>
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="window.InstructorAPI.endCurrentLesson()" style="border-radius: 8px; font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                <i class="fas fa-flag-checkered"></i> إنهاء الدرس
                            </button>
                        </div>

                        <!-- ══ Teaching Mode Selector ══ -->
                        <div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
                                <i class="fas fa-chalkboard-teacher" style="color: var(--primary-color);"></i> وضع التدريس
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem;">
                                <!-- Video Mode Button -->
                                <button class="inst-mode-btn" data-mode="video" onclick="window.InstructorAPI.setMode('video')"
                                    style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;font-size:0.68rem;color:var(--text-secondary);font-family:var(--font-ar);">
                                    <i class="fas fa-video" style="font-size:1.1rem;color:#60a5fa;"></i>
                                    <span>فيديو</span>
                                </button>
                                <!-- Live Mode Button -->
                                <button class="inst-mode-btn" data-mode="live" onclick="window.InstructorAPI.setMode('live')"
                                    style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;font-size:0.68rem;color:var(--text-secondary);font-family:var(--font-ar);">
                                    <i class="fas fa-satellite-dish" style="font-size:1.1rem;color:#f87171;"></i>
                                    <span>بث حي</span>
                                </button>
                                <!-- Slides Mode Button -->
                                <button class="inst-mode-btn" data-mode="slides" onclick="window.InstructorAPI.setMode('slides')"
                                    style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;font-size:0.68rem;color:var(--text-secondary);font-family:var(--font-ar);">
                                    <i class="fas fa-images" style="font-size:1.1rem;color:#34d399;"></i>
                                    <span>شرائح</span>
                                </button>
                                <!-- Audio Mode Button -->
                                <button class="inst-mode-btn" data-mode="audio" onclick="window.InstructorAPI.setMode('audio')"
                                    style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;font-size:0.68rem;color:var(--text-secondary);font-family:var(--font-ar);">
                                    <i class="fas fa-podcast" style="font-size:1.1rem;color:#a78bfa;"></i>
                                    <span>صوت</span>
                                </button>
                                <!-- Channel Mode Button -->
                                <button class="inst-mode-btn" data-mode="channel" onclick="window.InstructorAPI.setMode('channel')"
                                    style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;font-size:0.68rem;color:var(--text-secondary);font-family:var(--font-ar);">
                                    <i class="fas fa-bullhorn" style="font-size:1.1rem;color:#fbbf24;"></i>
                                    <span>قناة</span>
                                </button>
                            </div>
                        </div>

                        <!-- ══════════════════════════════════════════════════
                             MODE WORKSPACES — each mode gets its own section
                             ══════════════════════════════════════════════════ -->

                        <!-- ─── VIDEO MODE WORKSPACE ─── -->
                        <div id="mode-ws-video" class="mode-workspace"
                            style="background: linear-gradient(135deg, rgba(96,165,250,0.06) 0%, rgba(15,23,42,0.4) 100%); border: 1px solid rgba(96,165,250,0.25); border-radius: 14px; overflow: hidden;">
                            <!-- Header -->
                            <div style="background: rgba(96,165,250,0.1); padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid rgba(96,165,250,0.15);">
                                <i class="fas fa-video" style="color: #60a5fa;"></i>
                                <span style="font-weight: bold; font-size: 0.9rem; color: #60a5fa;">إدارة الفيديو</span>
                            </div>
                            <div style="padding: 0.9rem;">


                                <!-- Recorded Panel -->
                                <div id="v-panel-recorded">
                                    <button class="btn btn-sm btn-dark" id="btn-video-upload" onclick="window.InstructorAPI.promptVideoUpload()"
                                        style="width: 100%; margin-bottom: 0.6rem; border-radius: 8px; border: 1px dashed rgba(96,165,250,0.4);">
                                        <i class="fas fa-cloud-upload-alt" style="color:#60a5fa;"></i> رفع فيديو
                                    </button>
                                    <div style="display: flex; gap: 0.4rem; margin-bottom: 0.6rem;">
                                        <button class="btn btn-sm btn-dark" onclick="window.InstructorAPI.playVideo()" style="flex:1;color:#34d399;border-radius:8px;">
                                            <i class="fas fa-play"></i> تشغيل
                                        </button>
                                        <button class="btn btn-sm btn-dark" onclick="window.InstructorAPI.pauseVideo()" style="flex:1;color:#fbbf24;border-radius:8px;">
                                            <i class="fas fa-pause"></i> إيقاف
                                        </button>
                                    </div>
                                    <!-- Video Management Panel (shown after upload) -->
                                    <div id="video-management-panel" style="display:none; background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(96,165,250,0.25);padding:0.75rem;animation:fadeIn 0.3s ease;">
                                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                                            <i class="fas fa-film" style="color:#60a5fa;font-size:0.85rem;"></i>
                                            <span id="current-video-name" style="font-size:0.8rem;color:var(--text-secondary);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">فيديو محمّل</span>
                                            <span style="font-size:0.7rem;background:rgba(52,211,153,0.15);color:#34d399;padding:0.15rem 0.5rem;border-radius:99px;border:1px solid rgba(52,211,153,0.3);">✔ مرفوع</span>
                                        </div>
                                        <video id="current-video-preview" controls muted style="width:100%;border-radius:8px;max-height:110px;background:#000;margin-bottom:0.5rem;" preload="metadata"></video>
                                        <div style="display:flex;gap:0.4rem;">
                                            <button class="btn btn-sm" onclick="window.InstructorAPI.replaceVideo()" style="flex:1;border-radius:7px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;font-size:0.78rem;">
                                                <i class="fas fa-exchange-alt"></i> تغيير
                                            </button>
                                            <button class="btn btn-sm" onclick="window.InstructorAPI.deleteVideo()" style="flex:1;border-radius:7px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-size:0.78rem;">
                                                <i class="fas fa-trash"></i> حذف
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- ─── LIVE MODE WORKSPACE ─── -->
                        <div id="mode-ws-live" class="mode-workspace"
                            style="display:none; background: linear-gradient(135deg, rgba(248,113,113,0.06) 0%, rgba(15,23,42,0.4) 100%); border: 1px solid rgba(248,113,113,0.25); border-radius: 14px; overflow: hidden;">
                            <!-- Header -->
                            <div style="background:rgba(248,113,113,0.12);padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem;border-bottom:1px solid rgba(248,113,113,0.2);">
                                <i class="fas fa-satellite-dish" style="color:#f87171;"></i>
                                <span style="font-weight:bold;font-size:0.9rem;color:#f87171;">البث المباشر</span>
                                <span id="live-on-badge" style="display:none;margin-right:auto;background:#ef4444;color:white;font-size:0.65rem;padding:0.15rem 0.5rem;border-radius:99px;font-weight:bold;animation:pulse 1s infinite;">● LIVE</span>
                            </div>
                            <div style="padding:0.9rem;">
                                <!-- Status indicator -->
                                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:1.2rem;text-align:center;margin-bottom:1rem;">
                                    <i class="fas fa-satellite-dish" style="font-size:2.5rem;color:#f87171;margin-bottom:0.5rem;display:block;"></i>
                                    <div id="live-ws-status" style="font-size:0.85rem;color:var(--text-secondary);">البث غير نشط حالياً</div>
                                    <div id="live-ws-timer" style="font-size:1.8rem;font-weight:bold;font-family:monospace;color:#f87171;margin-top:0.3rem;display:none;">00:00</div>
                                </div>
                                <!-- Start / Stop buttons -->
                                <button id="btn-start-agora-live" onclick="window.InstructorAPI.startAgoraLiveDedicated()" style="width:100%;margin-bottom:0.6rem;border-radius:10px;padding:0.75rem;background:linear-gradient(135deg,#f87171,#ef4444);border:none;color:white;font-weight:bold;font-size:0.9rem;cursor:pointer;">
                                    <i class="fas fa-satellite-dish"></i> بدء البث الحي
                                </button>
                                <button id="btn-stop-agora-live" onclick="window.InstructorAPI.stopAgoraLiveDedicated()" style="display:none;width:100%;margin-bottom:0.6rem;border-radius:10px;padding:0.75rem;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);color:#f87171;font-weight:bold;font-size:0.9rem;cursor:pointer;">
                                    <i class="fas fa-stop-circle"></i> إنهاء البث
                                </button>
                                <!-- Mic / Camera controls -->
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.4rem;">
                                    <button class="btn btn-sm btn-dark" id="btn-live-mic" onclick="window.InstructorAPI.toggleAgoraMic()" style="border-radius:8px;">
                                        <i class="fas fa-microphone"></i> المايك
                                    </button>
                                    <button class="btn btn-sm btn-dark" id="btn-live-cam" onclick="window.InstructorAPI.switchAgoraCamera()" style="border-radius:8px;">
                                        <i class="fas fa-sync-alt"></i> الكاميرا
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- ─── SLIDES MODE WORKSPACE ─── -->
                        <div id="mode-ws-slides" class="mode-workspace"
                            style="display:none; background: linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(15,23,42,0.4) 100%); border: 1px solid rgba(52,211,153,0.25); border-radius: 14px; overflow: hidden;">
                            <!-- Header -->
                            <div style="background:rgba(52,211,153,0.1);padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem;border-bottom:1px solid rgba(52,211,153,0.2);">
                                <i class="fas fa-images" style="color:#34d399;"></i>
                                <span style="font-weight:bold;font-size:0.9rem;color:#34d399;">إدارة الشرائح</span>
                            </div>
                            <div style="padding:0.9rem;display:flex;flex-direction:column;gap:0.75rem;">
                                <!-- Upload Button -->
                                <button class="btn btn-sm btn-dark" onclick="document.getElementById('inst-slides-upload').click()"
                                    style="width:100%;border-radius:8px;border:1px dashed rgba(52,211,153,0.4);padding:0.6rem;">
                                    <i class="fas fa-cloud-upload-alt" style="color:#34d399;"></i> إضافة صور للمعرض
                                </button>
                                <input type="file" id="inst-slides-upload" multiple accept="image/*" style="display:none;" onchange="window.InstructorAPI.uploadSlides(event)">

                                <!-- Gallery -->
                                <div id="inst-slides-gallery"
                                    style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.4rem;max-height:150px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:8px;padding:0.4rem;min-height:40px;">
                                    <!-- Images injected by JS -->
                                </div>

                                <!-- Layout Selector -->
                                <div>
                                    <label style="font-size:0.78rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">قالب العرض:</label>
                                    <select id="inst-slides-layout" class="form-input" style="width:100%;padding:0.4rem 0.6rem;font-size:0.82rem;" onchange="window.InstructorAPI.handleSlideLayoutChange(event)">
                                        <option value="slides-layout-1">صورة واحدة (Full)</option>
                                        <option value="slides-layout-2">صورتان (1×2)</option>
                                        <option value="slides-layout-3">٣ صور (كبيرة + ٢ صغار)</option>
                                        <option value="slides-layout-4">٤ صور (شبكة 2×2)</option>
                                        <option value="slides-layout-5">٥ صور (شبكة 3×2)</option>
                                    </select>
                                </div>

                                <!-- Present Button -->
                                <button onclick="window.InstructorAPI.presentSelectedSlides()"
                                    style="width:100%;border-radius:8px;padding:0.65rem;background:linear-gradient(135deg,#34d399,#10b981);border:none;color:#0f172a;font-weight:bold;font-size:0.88rem;cursor:pointer;">
                                    <i class="fas fa-tv"></i> عرض الصور المحددة
                                </button>

                                <!-- Audio Controls -->
                                <div style="display:flex;gap:0.4rem;">
                                    <button class="btn btn-sm btn-dark" id="btn-slides-mic-start" onclick="window.InstructorAPI.startSlidesAudio()"
                                        style="flex:1;border-radius:8px;color:#a78bfa;border-color:rgba(167,139,250,0.3);">
                                        <i class="fas fa-microphone"></i> بدء الشرح الصوتي
                                    </button>
                                    <button class="btn btn-sm btn-danger" id="btn-slides-mic-stop" onclick="window.InstructorAPI.stopSlidesAudio()"
                                        style="display:none;flex:1;border-radius:8px;">
                                        <i class="fas fa-microphone-slash"></i> إيقاف الصوت
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- ─── AUDIO MODE WORKSPACE ─── -->
                        <div id="mode-ws-audio" class="mode-workspace"
                            style="display:none; background: linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(15,23,42,0.4) 100%); border: 1px solid rgba(167,139,250,0.25); border-radius: 14px; overflow: hidden;">
                            <!-- Header -->
                            <div style="background:rgba(167,139,250,0.1);padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem;border-bottom:1px solid rgba(167,139,250,0.2);">
                                <i class="fas fa-podcast" style="color:#a78bfa;"></i>
                                <span style="font-weight:bold;font-size:0.9rem;color:#a78bfa;">البث الصوتي فقط</span>
                            </div>
                            <div style="padding:0.9rem;">
                                <!-- Status -->
                                <div style="text-align:center;background:rgba(0,0,0,0.3);border-radius:12px;padding:1.5rem;margin-bottom:1rem;">
                                    <div id="audio-mic-icon" style="font-size:3rem;color:#a78bfa;margin-bottom:0.5rem;">
                                        <i class="fas fa-podcast"></i>
                                    </div>
                                    <div id="audio-ws-status" style="font-size:0.85rem;color:var(--text-secondary);">البث الصوتي غير نشط</div>
                                    <div id="audio-ws-timer" style="font-size:1.6rem;font-weight:bold;font-family:monospace;color:#a78bfa;margin-top:0.3rem;display:none;">00:00</div>
                                </div>
                                <!-- Start / Stop -->
                                <button id="btn-audio-start" onclick="window.InstructorAPI.startAudioOnly()"
                                    style="width:100%;margin-bottom:0.5rem;border-radius:10px;padding:0.75rem;background:linear-gradient(135deg,#a78bfa,#7c3aed);border:none;color:white;font-weight:bold;font-size:0.9rem;cursor:pointer;">
                                    <i class="fas fa-microphone"></i> بدء البث الصوتي
                                </button>
                                <button id="btn-audio-stop" onclick="window.InstructorAPI.stopAudioOnly()"
                                    style="display:none;width:100%;border-radius:10px;padding:0.75rem;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#f87171;font-weight:bold;font-size:0.9rem;cursor:pointer;">
                                    <i class="fas fa-stop-circle"></i> إيقاف البث الصوتي
                                </button>
                            </div>
                        </div>

                        <!-- ─── CHANNEL MODE WORKSPACE ─── -->
                        <div id="mode-ws-channel" class="mode-workspace"
                            style="display:none; background: linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(15,23,42,0.4) 100%); border: 1px solid rgba(251,191,36,0.25); border-radius: 14px; overflow: hidden;">
                            <!-- Header -->
                            <div style="background:rgba(251,191,36,0.1);padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem;border-bottom:1px solid rgba(251,191,36,0.2);">
                                <i class="fas fa-bullhorn" style="color:#fbbf24;"></i>
                                <span style="font-weight:bold;font-size:0.9rem;color:#fbbf24;">قناة البث للطلاب</span>
                            </div>
                            <div style="padding:0.9rem;display:flex;flex-direction:column;gap:0.75rem;">
                                <!-- Text Message -->
                                <div>
                                    <textarea id="inst-channel-text" class="form-input"
                                        style="width:100%;height:80px;padding:0.6rem;resize:none;font-size:0.88rem;border-radius:8px;font-family:var(--font-ar);"
                                        placeholder="اكتب رسالتك للطلاب..."></textarea>
                                    <button onclick="window.InstructorAPI.sendChannelMessage()"
                                        style="width:100%;margin-top:0.4rem;border-radius:8px;padding:0.6rem;background:linear-gradient(135deg,#fbbf24,#f59e0b);border:none;color:#0f172a;font-weight:bold;font-size:0.88rem;cursor:pointer;">
                                        <i class="fas fa-paper-plane"></i> إرسال النص
                                    </button>
                                </div>
                                <!-- Divider -->
                                <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:0.6rem;">
                                    <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:0.5rem;text-align:center;">— إرسال مرفقات —</div>
                                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;">
                                        <!-- Image -->
                                        <button onclick="document.getElementById('inst-channel-image').click()"
                                            style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.7rem 0.3rem;border-radius:10px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);cursor:pointer;font-size:0.72rem;color:#34d399;font-family:var(--font-ar);">
                                            <i class="fas fa-image" style="font-size:1.3rem;"></i>
                                            <span>صورة</span>
                                        </button>
                                        <input type="file" id="inst-channel-image" accept="image/*" style="display:none;" onchange="window.InstructorAPI.sendChannelImage(event)">

                                        <!-- Video -->
                                        <button onclick="document.getElementById('inst-channel-video').click()"
                                            style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.7rem 0.3rem;border-radius:10px;background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.2);cursor:pointer;font-size:0.72rem;color:#60a5fa;font-family:var(--font-ar);">
                                            <i class="fas fa-video" style="font-size:1.3rem;"></i>
                                            <span>فيديو</span>
                                        </button>
                                        <input type="file" id="inst-channel-video" accept="video/*" style="display:none;" onchange="window.InstructorAPI.sendChannelVideo(event)">

                                        <!-- Voice Recording -->
                                        <button id="btn-channel-voice" onclick="window.InstructorAPI.toggleChannelVoice()"
                                            style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.7rem 0.3rem;border-radius:10px;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.2);cursor:pointer;font-size:0.72rem;color:#a78bfa;font-family:var(--font-ar);">
                                            <i class="fas fa-microphone" style="font-size:1.3rem;"></i>
                                            <span>تسجيل</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ══ Room Management Section ══ -->
                        <div>
                            <div style="font-size:0.72rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:0.6rem;display:flex;align-items:center;gap:0.4rem;">
                                <i class="fas fa-cogs" style="color:var(--primary-color);"></i> إدارة الغرفة
                            </div>
                            <div style="display:flex;flex-direction:column;gap:0.5rem;">
                                <div style="background:rgba(255,255,255,0.02);padding:0.75rem 1rem;border:1px solid rgba(255,255,255,0.06);border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
                                    <span style="font-size:0.85rem;"><i class="fas fa-comment-slash" style="color:var(--text-secondary);margin-left:0.4rem;"></i> إغلاق الدردشة</span>
                                    <label class="switch"><input type="checkbox" id="inst-toggle-chat"><span class="slider"></span></label>
                                </div>
                                <div style="background:rgba(255,255,255,0.02);padding:0.75rem 1rem;border:1px solid rgba(255,255,255,0.06);border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
                                    <span style="font-size:0.85rem;"><i class="fas fa-lock" style="color:var(--text-secondary);margin-left:0.4rem;"></i> منع تحميل الموارد</span>
                                    <label class="switch"><input type="checkbox" id="inst-toggle-resources"><span class="slider"></span></label>
                                </div>
                            </div>
                        </div>

                    </div> <!-- end inst-view-dashboard -->


                    <!-- ═══════════════════════════════════════
                         VIEW 2: STUDENTS MANAGEMENT
                         ═══════════════════════════════════════ -->
                    <div id="inst-view-students" class="inst-view" style="display:none;padding:0.9rem;">
                        <h3 style="font-size:1rem;margin-bottom:1rem;">
                            <i class="fas fa-users" style="color:var(--primary-color);"></i> إدارة الطلاب
                        </h3>
                        <div id="instructor-student-list" style="display: flex; flex-direction: column; gap: 0.8rem;">
                            <div style="text-align:center;padding:2rem;color:var(--text-secondary);background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">جاري التحميل...</div>
                        </div>
                    </div>


                    <!-- ═══════════════════════════════════════
                         VIEW 3: RESOURCES MANAGEMENT
                         ═══════════════════════════════════════ -->
                     <div id="inst-view-resources" class="inst-view" style="display:none; flex-direction:column; height:100%; overflow:hidden;">
                        
                        <!-- Section Header -->
                        <div style="padding: 0.75rem 0.9rem 0.5rem; flex-shrink:0; border-bottom: 1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:0.5rem;">
                            <i class="fas fa-folder-open" style="color:var(--primary-color); font-size:0.9rem;"></i>
                            <span style="font-size:0.88rem; font-weight:600;">إدارة الموارد</span>
                        </div>

                        <!-- Scrollable Content Area -->
                        <div style="flex:1; overflow-y:auto; padding: 0.75rem 0.9rem; display:flex; flex-direction:column; gap: 0.75rem;">

                            <!-- Upload Dropzone (Compact) -->
                            <div id="inst-resource-dropzone" 
                                 onclick="document.getElementById('inst-new-resource-file').click();"
                                 style="display:flex; align-items:center; gap:0.75rem; padding:0.75rem; background:rgba(255,255,255,0.03); border:1.5px dashed rgba(255,255,255,0.18); border-radius:10px; cursor:pointer; transition:all 0.2s;"
                                 onmouseover="this.style.borderColor='var(--primary-color)'; this.style.background='rgba(255,255,255,0.07)';"
                                 onmouseout="this.style.borderColor='rgba(255,255,255,0.18)'; this.style.background='rgba(255,255,255,0.03)';">
                                <i class="fas fa-cloud-upload-alt" style="font-size:1.6rem; color:var(--primary-color); flex-shrink:0;"></i>
                                <div>
                                    <div style="font-size:0.82rem; font-weight:600; margin-bottom:0.1rem;">اختر ملفات أو اسحبها</div>
                                    <div style="font-size:0.7rem; color:var(--text-secondary);">PDF, صور, فيديو, مستندات · أقصى 100MB</div>
                                </div>
                                <input type="file" id="inst-new-resource-file" style="display:none;" multiple>
                            </div>

                            <!-- File Preview (hidden until files selected) -->
                            <div id="inst-resource-preview-container" style="display:none; background:rgba(0,0,0,0.25); border-radius:10px; border:1px solid rgba(255,255,255,0.07); overflow:hidden;">
                                <div style="padding: 0.5rem 0.75rem; background:rgba(255,255,255,0.04); font-size:0.75rem; color:var(--text-secondary); display:flex; align-items:center; gap:0.4rem;">
                                    <i class="fas fa-list"></i> الملفات المختارة
                                </div>
                                <div id="inst-resource-preview-list" style="max-height:120px; overflow-y:auto; padding:0.4rem 0.5rem;"></div>
                                <div style="padding:0.5rem;">
                                    <button id="inst-resource-upload-btn" class="btn btn-primary" style="width:100%; border-radius:8px; font-family:var(--font-ar); font-size:0.85rem; padding:0.5rem;">
                                        <i class="fas fa-upload"></i> بدء الرفع
                                    </button>
                                </div>
                            </div>

                            <!-- Active Upload Queue -->
                            <div id="inst-resource-list" style="display:flex; flex-direction:column; gap:0.4rem;"></div>

                            <!-- ── Published Resources (Instructor view with delete) ── -->
                            <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:0.6rem;">
                                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
                                    <span style="font-size:0.72rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">
                                        <i class="fas fa-paperclip" style="margin-left:0.3rem;"></i> الملفات المنشورة
                                    </span>
                                    <span id="inst-res-count-badge" style="font-size:0.68rem; background:rgba(255,255,255,0.08); padding:0.1rem 0.5rem; border-radius:10px; color:var(--text-secondary);">0</span>
                                </div>
                                <div id="inst-uploaded-resources-list" style="display:flex; flex-direction:column; gap:0.4rem;">
                                    <div style="text-align:center; padding:1rem 0; color:var(--text-secondary); font-size:0.8rem;">
                                        <i class="fas fa-inbox" style="font-size:1.5rem; opacity:0.3; display:block; margin-bottom:0.4rem;"></i>
                                        لا توجد ملفات منشورة
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                    <!-- ═══════════════════════════════════════
                         VIEW 4: INSTRUCTOR PROFILE
                         ═══════════════════════════════════════ -->
                    <div id="inst-view-profile" class="inst-view" style="display:none;padding:0.9rem;">
                        <h3 style="font-size:1rem;margin-bottom:1rem;">
                            <i class="fas fa-user-tie" style="color:var(--primary-color);"></i> الملف الشخصي
                        </h3>
                        <form id="inst-profile-form" style="display:grid;gap:1rem;background:rgba(255,255,255,0.02);padding:1.2rem;border-radius:12px;border:1px solid rgba(255,255,255,0.06);">
                            <div>
                                <label style="font-size:0.8rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">الاسم الكامل</label>
                                <input type="text" id="inst-prof-name" class="form-input" placeholder="الاسم الكامل" style="width:100%;">
                            </div>
                            <div>
                                <label style="font-size:0.8rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">التخصص الدقيق</label>
                                <input type="text" id="inst-prof-spec" class="form-input" placeholder="مثال: أستاذ رياضيات" style="width:100%;">
                            </div>
                            <div>
                                <label style="font-size:0.8rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">نبذة تعريفية</label>
                                <textarea id="inst-prof-bio" class="form-input" placeholder="تحدث عن خبراتك..." rows="3" style="width:100%;"></textarea>
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;">
                                <div>
                                    <label style="font-size:0.8rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">صورة شخصية</label>
                                    <input type="file" id="inst-prof-photo" class="form-input" accept="image/*" style="width:100%;font-size:0.78rem;padding:0.4rem;">
                                </div>
                                <div>
                                    <label style="font-size:0.8rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">السيرة الذاتية (PDF)</label>
                                    <input type="file" id="inst-prof-cv" class="form-input" accept=".pdf" style="width:100%;font-size:0.78rem;padding:0.4rem;">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width:100%;border-radius:8px;">
                                <i class="fas fa-save"></i> حفظ البيانات
                            </button>
                        </form>
                    </div>

                </div><!-- end scrollable views container -->

            </div><!-- end instructor-workspace -->
        `)}toggleVideoTabUI(e){const i=document.getElementById("v-tab-recorded"),t=document.getElementById("v-tab-live");if(e==="recorded"){i&&(i.className="btn btn-sm btn-primary"),t&&(t.className="btn btn-sm btn-dark");const s=document.getElementById("v-panel-recorded"),n=document.getElementById("v-panel-live");s&&(s.style.display="block"),n&&(n.style.display="none")}else{i&&(i.className="btn btn-sm btn-dark"),t&&(t.className="btn btn-sm btn-primary");const s=document.getElementById("v-panel-recorded"),n=document.getElementById("v-panel-live");s&&(s.style.display="none"),n&&(n.style.display="block")}}_switchModeWorkspace(e){this.mountPoint.querySelectorAll(".mode-workspace").forEach(s=>s.style.display="none");const i=this.mountPoint.querySelector(`#mode-ws-${e}`);i&&(i.style.display="block",i.style.animation="fadeIn 0.25s ease"),this.mountPoint.querySelectorAll(".inst-mode-btn").forEach(s=>{s.style.borderColor="rgba(255,255,255,0.06)",s.style.background="rgba(255,255,255,0.03)",s.style.color="var(--text-secondary)",s.style.transform="scale(1)"});const t=this.mountPoint.querySelector(`.inst-mode-btn[data-mode="${e}"]`);t&&(t.style.borderColor="var(--primary-color)",t.style.background="rgba(99,102,241,0.18)",t.style.color="white",t.style.transform="scale(1.04)")}attachListeners(){if(!this.mountPoint)return;p(async()=>{const{eventBus:t,Events:s}=await import("./EventBus-4Q0tYHVL.js").then(n=>n.n);return{eventBus:t,Events:s}},__vite__mapDeps([4,2])).then(({eventBus:t,Events:s})=>{t.subscribe(s.BROADCAST_STARTED,n=>{const o=document.getElementById("btn-start-agora-live"),a=document.getElementById("btn-stop-agora-live");o&&(o.style.display="none"),a&&(a.style.display="block");const r=document.getElementById("live-on-badge");r&&(r.style.display="inline");const l=document.getElementById("live-ws-status");l&&(l.textContent="البث نشط الآن");const u=document.getElementById("float-btn-mic"),c=document.getElementById("float-btn-cam"),d=document.getElementById("float-btn-stop");u&&(u.style.display="inline-flex"),c&&(c.style.display="inline-flex"),d&&(d.style.display="inline-flex"),this._startTimer("live-ws-timer"),p(async()=>{const{NotificationManager:f}=await import("./courseRoom-B9evgojT.js").then(b=>b.c);return{NotificationManager:f}},__vite__mapDeps([5,2,6,7,3,1,4,8,9,10])).then(({NotificationManager:f})=>{const b=n.metrics,E=`زمن فتح الكاميرا: ${b.camTime.toFixed(0)}ms | الاتصال: ${b.joinTime.toFixed(0)}ms | النشر: ${b.publishTime.toFixed(0)}ms`;f.show(E,"info",5e3)})})}),window.InstructorAPI={setMode:t=>{this.controller.setTeachingMode(t),this._switchModeWorkspace(t),this._updateFloatBar(t)},endCurrentLesson:async()=>{await y.show({icon:"🏁",title:"إنهاء الدرس الحالي",body:"هل أنت متأكد من إنهاء الدرس الحالي وبدء دورة درس جديدة؟",okLabel:"نعم، إنهاء",danger:!0})&&p(async()=>{const{CurriculumController:t}=await import("./courseRoom-B9evgojT.js").then(s=>s.n);return{CurriculumController:t}},__vite__mapDeps([5,2,6,7,3,1,4,8,9,10])).then(({CurriculumController:t})=>t.endCurrentLesson())},toggleVideoTab:t=>this.toggleVideoTabUI(t),handleSlideLayoutChange:t=>this.controller.handleSlideLayoutChange(t),uploadSlides:t=>this.controller.uploadSlides(t),presentSelectedSlides:()=>this.controller.presentSelectedSlides(),startSlidesAudio:()=>{this.controller.startSlidesAudio();const t=document.getElementById("float-btn-mic"),s=document.getElementById("float-btn-stop");t&&(t.style.display="inline-flex"),s&&(s.style.display="inline-flex")},stopSlidesAudio:()=>{this.controller.stopSlidesAudio();const t=document.getElementById("float-btn-mic"),s=document.getElementById("float-btn-stop");t&&(t.style.display="none"),s&&(s.style.display="none")},startAudioOnly:()=>{this.controller.startAudioOnly(),document.getElementById("audio-ws-status").textContent="البث الصوتي نشط الآن...";const t=document.getElementById("float-btn-mic"),s=document.getElementById("float-btn-stop");t&&(t.style.display="inline-flex"),s&&(s.style.display="inline-flex"),this._startTimer("audio-ws-timer")},stopAudioOnly:()=>{this.controller.stopAudioOnly(),document.getElementById("audio-ws-status").textContent="البث الصوتي غير نشط";const t=document.getElementById("float-btn-mic"),s=document.getElementById("float-btn-stop");t&&(t.style.display="none"),s&&(s.style.display="none"),this._stopTimer("audio-ws-timer")},promptVideoUpload:()=>this.controller.promptVideoUpload(),playVideo:()=>this.controller.playVideo(),pauseVideo:()=>this.controller.pauseVideo(),deleteVideo:async()=>{await y.show({icon:"🗑️",title:"حذف الفيديو",body:"هل أنت متأكد من حذف الفيديو الحالي؟",okLabel:"نعم، احذف",danger:!0})&&await this.controller.deleteVideo()},replaceVideo:async()=>{await y.show({icon:"🔄",title:"تغيير الفيديو",body:"سيتم استبدال الفيديو الحالي بفيديو جديد. هل تريد المتابعة؟",okLabel:"نعم، تغيير"})&&await this.controller.replaceVideo()},startAgoraLive:async()=>{await y.show({icon:"📡",title:"بدء البث الحي",body:`سيتم بدء البث الحي للطلاب. 

⚠️ يرجى عدم إغلاق المتصفح أو التبويبة فجأة أثناء البث حتى لا تفقد التسجيل.
💡 إذا كانت المحاضرة طويلة جداً (أكثر من ساعتين)، يُفضل إنهاؤها وبدء بث جديد لضمان جودة رفع التسجيل.

هل أنت جاهز لبدء البث؟`,okLabel:"بدء البث"})&&(this.controller.startAgoraLive().catch(async t=>{await y.alert({icon:"❌",title:"خطأ",body:"تعذر بدء البث: "+t.message})}),document.getElementById("btn-start-agora").style.display="none",document.getElementById("btn-stop-agora").style.display="block",document.getElementById("instructor-float-bar")&&(document.getElementById("float-btn-mic").style.display="inline-flex",document.getElementById("float-btn-cam").style.display="inline-flex",document.getElementById("float-btn-stop").style.display="inline-flex"))},stopAgoraLive:async()=>{if(!await y.show({icon:"⏹",title:"إنهاء البث",body:"هل تريد إنهاء البث الحي الآن؟",okLabel:"إنهاء البث",danger:!0}))return;this.controller.stopAgoraLive();const t=document.getElementById("btn-start-agora"),s=document.getElementById("btn-stop-agora");t&&(t.style.display="block"),s&&(s.style.display="none"),document.getElementById("float-btn-mic").style.display="none",document.getElementById("float-btn-cam").style.display="none",document.getElementById("float-btn-stop").style.display="none"},startAgoraLiveDedicated:async()=>{await y.show({icon:"📡",title:"بدء البث الحي",body:`سيبدأ البث الحي للطلاب. 

⚠️ يرجى عدم إغلاق المتصفح أو التبويبة فجأة أثناء البث حتى لا تفقد التسجيل.
💡 إذا كانت المحاضرة طويلة جداً (أكثر من ساعتين)، يُفضل إنهاؤها وبدء بث جديد لضمان جودة رفع التسجيل.

هل أنت جاهز لبدء البث؟`,okLabel:"بدء البث"})&&this.controller.startAgoraLive().catch(async t=>{await y.alert({icon:"❌",title:"خطأ",body:"تعذر بدء البث: "+t.message})})},stopAgoraLiveDedicated:async()=>{await y.show({icon:"⏹",title:"إنهاء البث",body:"هل تريد إنهاء البث الحي الآن؟",okLabel:"إنهاء البث",danger:!0})&&(this.controller.stopAgoraLive(),document.getElementById("btn-start-agora-live").style.display="block",document.getElementById("btn-stop-agora-live").style.display="none",document.getElementById("live-on-badge").style.display="none",document.getElementById("live-ws-status").textContent="البث غير نشط حالياً",document.getElementById("float-btn-mic").style.display="none",document.getElementById("float-btn-cam").style.display="none",document.getElementById("float-btn-stop").style.display="none",this._stopTimer("live-ws-timer"))},toggleAgoraMic:async()=>{const t=S.toggleMic(),s=["btn-agora-mic","btn-live-mic"],n=document.getElementById("float-btn-mic");s.forEach(o=>{const a=document.getElementById(o);a&&(a.innerHTML=t?'<i class="fas fa-microphone-slash"></i> مكتوم':'<i class="fas fa-microphone"></i> المايك',t?a.classList.add("btn-danger"):a.classList.remove("btn-danger"))}),n&&(n.innerHTML=t?'<i class="fas fa-microphone-slash"></i><span class="fb-label"> مكتوم</span>':'<i class="fas fa-microphone"></i><span class="fb-label"> المايك</span>',t?n.classList.add("active"):n.classList.remove("active"))},switchAgoraCamera:async()=>{S.switchCamera()},sendChannelMessage:async()=>{const t=document.getElementById("inst-channel-text"),s=t?t.value.trim():"";if(!s){await y.alert({icon:"✏️",title:"الرسالة فارغة",body:"يرجى كتابة رسالة قبل الإرسال."});return}await y.show({icon:"📢",title:"تأكيد إرسال الرسالة",body:s.length>120?s.slice(0,120)+"...":s,okLabel:"إرسال"})&&this.controller.sendChannelMessage()},sendChannelImage:async t=>{const s=t.target.files[0];s&&(await y.show({icon:"🖼️",title:"إرسال صورة",body:`هل تريد إرسال الصورة "${s.name}" للطلاب؟`,okLabel:"إرسال الصورة"})?this.controller.sendChannelImage(t):t.target.value="")},sendChannelVideo:async t=>{const s=t.target.files[0];s&&(await y.show({icon:"🎬",title:"إرسال فيديو",body:`هل تريد إرسال الفيديو "${s.name}" للطلاب؟`,okLabel:"إرسال الفيديو"})?this.controller.sendChannelVideo(t):t.target.value="")},toggleChannelVoice:()=>this.controller.toggleChannelVoice()},this._wireFloatBar(),this._updateFloatBar("video");const e=this.mountPoint.querySelectorAll(".inst-nav");e.forEach(t=>{t.addEventListener("click",s=>{const n=s.currentTarget.getAttribute("data-view");e.forEach(a=>{a.classList.remove("btn-primary"),a.classList.add("btn-dark")}),s.currentTarget.classList.remove("btn-dark"),s.currentTarget.classList.add("btn-primary"),this.mountPoint.querySelectorAll(".inst-view").forEach(a=>a.style.display="none");const o=this.mountPoint.querySelector(`#inst-view-${n}`);o&&(o.style.display="flex"),n==="dashboard"&&o&&(o.style.flexDirection="column")})});const i=this.mountPoint.querySelector("#inst-profile-form");i&&i.addEventListener("submit",async t=>{t.preventDefault();const s=i.querySelector('button[type="submit"]'),n=s.innerHTML;s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...',s.disabled=!0;const o={name:document.getElementById("inst-prof-name").value.trim(),specialty:document.getElementById("inst-prof-spec").value.trim(),bio:document.getElementById("inst-prof-bio").value.trim()},a=document.getElementById("inst-prof-photo").files[0],r=document.getElementById("inst-prof-cv").files[0];try{a&&(s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري رفع الصورة...',o.photo=await g.uploadMedia(a,`profiles/${this.controller.engine.currentUser.uid}`)),r&&(s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري رفع السيرة...',o.cv=await g.uploadMedia(r,`profiles/${this.controller.engine.currentUser.uid}`)),s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...',await this.controller.updateProfile(o),s.innerHTML='<i class="fas fa-check"></i> تم الحفظ بنجاح',setTimeout(()=>{s.innerHTML=n,s.disabled=!1},3e3)}catch(l){await y.alert({icon:"❌",title:"خطأ",body:"حدث خطأ: "+(l.message||"")}),s.innerHTML=n,s.disabled=!1}})}_startTimer(e){this._stopTimer(e);const i=document.getElementById(e);if(!i)return;i.style.display="block";let t=0;this._timers=this._timers||{},this._timers[e]=setInterval(()=>{t++;const s=String(Math.floor(t/60)).padStart(2,"0"),n=String(t%60).padStart(2,"0");i.textContent=`${s}:${n}`},1e3)}_stopTimer(e){this._timers&&this._timers[e]&&(clearInterval(this._timers[e]),delete this._timers[e]);const i=document.getElementById(e);i&&(i.style.display="none",i.textContent="00:00")}_updateFloatBar(e){const i=document.getElementById("instructor-float-bar"),t=document.getElementById("float-mode-label"),s=document.getElementById("float-mode-text");if(!i)return;i.classList.add("visible");const n={video:{cls:"mode-video",icon:"fa-video",text:"فيديو"},link:{cls:"mode-video",icon:"fa-link",text:"رابط"},live:{cls:"mode-live",icon:"fa-satellite-dish",text:"بث حي"},slides:{cls:"mode-slides",icon:"fa-images",text:"شرائح"},audio:{cls:"mode-audio",icon:"fa-podcast",text:"صوت فقط"},channel:{cls:"mode-channel",icon:"fa-bullhorn",text:"قناة"}},o=n[e]||n.video;t&&(t.className=`float-bar-mode-label ${o.cls}`,t.innerHTML=`<i class="fas ${o.icon}"></i>`),s&&(s.textContent=o.text);const a=document.getElementById("float-btn-mic"),r=document.getElementById("float-btn-cam"),l=document.getElementById("float-btn-stop");a&&(a.style.display="none"),r&&(r.style.display="none"),l&&(l.style.display="none"),e==="live"?(a&&(a.style.display="inline-flex"),r&&(r.style.display="inline-flex"),l&&(l.style.display="inline-flex")):e==="audio"&&(a&&(a.style.display="inline-flex"),l&&(l.style.display="inline-flex"))}_wireFloatBar(){const e=document.getElementById("float-btn-mic"),i=document.getElementById("float-btn-cam"),t=document.getElementById("float-btn-stop");e&&e.addEventListener("click",()=>window.InstructorAPI.toggleAgoraMic()),i&&i.addEventListener("click",()=>window.InstructorAPI.switchAgoraCamera()),t&&t.addEventListener("click",async()=>{const s=document.getElementById("float-mode-text")?.textContent;s==="بث حي"?window.InstructorAPI.stopAgoraLiveDedicated():s==="صوت فقط"?window.InstructorAPI.stopAudioOnly():s==="شرائح"&&window.InstructorAPI.stopSlidesAudio()})}},T=new _,P=class{init(e){this.controller=e}async setMode(e,i={}){const t={mode:e,metadata:i};await g.updateTeachingMode(this.controller.engine.courseId,t)}},m=new P,R=class{constructor(){this.controller=null}init(e){this.controller=e,this.attachListeners()}attachListeners(){const e=document.getElementById("inst-toggle-chat"),i=document.getElementById("inst-toggle-resources");e&&e.addEventListener("change",async t=>{const s=t.target.checked;await g.updateClassroomState(this.controller.engine.courseId,{chatLocked:s})}),i&&i.addEventListener("change",async t=>{const s=t.target.checked;await g.updateClassroomState(this.controller.engine.courseId,{resourcesLocked:s})})}},V=new R,z=class{constructor(){this.controller=null,this.unsubscribe=null}init(e){this.controller=e,this.startListening()}startListening(){this.activeStudentsMap=new Map,this.unsubscribe=M.listenToActiveUsers(this.controller.engine.courseId,e=>{const i=document.getElementById("instructor-student-list");if(!i)return;const t=Date.now(),s=[];if(this.activeStudentsMap.clear(),e.forEach(o=>{if(o.lastSeen){const a=o.lastSeen.toMillis?o.lastSeen.toMillis():t;t-a<9e4&&(s.push(o),o.userId&&this.activeStudentsMap.set(o.userId,o))}else s.push(o),o.userId&&this.activeStudentsMap.set(o.userId,o)}),s.length===0){i.innerHTML='<div style="text-align: center; padding: 2rem; color: var(--text-secondary); background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;">لا يوجد طلاب متصلين حالياً.</div>';return}const n=document.createDocumentFragment();s.forEach(o=>{const a=document.createElement("div");a.style.cssText="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px;",a.innerHTML=`
                    <div style="display: flex; flex-direction: column; gap: 0.2rem; flex: 1 1 150px; min-width: 0;">
                        <div style="font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${o.name||o.userName||"طالب مجهول"}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${o.device||"غير معروف"}</div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.2rem; flex: 1 1 100px; min-width: 0;">
                        <span style="color: var(--success); font-size: 0.85rem;"><i class="fas fa-circle"></i> متصل</span>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${o.sessionDurationMinutes||0} دقيقة</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; flex-shrink: 0;">
                        <button class="btn btn-sm btn-info btn-student-details" data-uid="${o.userId||""}" title="التفاصيل"><i class="fas fa-info-circle"></i></button>
                        <button class="btn btn-sm btn-success btn-student-unmute" data-uid="${o.userId||""}" title="إعطاء المايك (Unmute)"><i class="fas fa-microphone"></i></button>
                        <button class="btn btn-sm btn-dark btn-student-mute" data-uid="${o.userId||""}" title="كتم (Mute)"><i class="fas fa-microphone-slash"></i></button>
                        <button class="btn btn-sm btn-dark btn-student-kick" data-uid="${o.userId||""}" title="إزالة (Kick)" style="color: var(--danger);"><i class="fas fa-sign-out-alt"></i></button>
                    </div>
                `,n.appendChild(a)}),i.innerHTML="",i.appendChild(n),this.delegationAdded||(i.addEventListener("click",o=>{const a=o.target.closest(".btn-student-details");if(a){const c=a.getAttribute("data-uid"),d=this.activeStudentsMap.get(c);d&&this.showDetailsModal(d);return}const r=o.target.closest(".btn-student-unmute");if(r){const c=r.getAttribute("data-uid"),d=this.activeStudentsMap.get(c);confirm("هل تريد السماح لهذا الطالب بالتحدث وإعطائه المايك؟")&&this.controller.allowStudentMic(c,d?d.name:"الطالب");return}const l=o.target.closest(".btn-student-mute");if(l){const c=l.getAttribute("data-uid");confirm("هل أنت متأكد من سحب صلاحية الميكروفون من هذا الطالب؟")&&this.controller.revokeStudentMic(c);return}const u=o.target.closest(".btn-student-kick");if(u){const c=u.getAttribute("data-uid");confirm("هل أنت متأكد من طرد هذا الطالب من الغرفة؟")&&this.controller.kickStudent(c);return}}),this.delegationAdded=!0)})}showDetailsModal(e){let i=document.getElementById("inst-student-details-modal");i||(i=document.createElement("div"),i.id="inst-student-details-modal",i.style.cssText="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:99999; display:flex; align-items:center; justify-content:center;",i.innerHTML=`
                <div class="glass-panel" style="width: 400px; padding: 2rem; border-radius: 12px; position: relative;">
                    <button id="inst-student-close-btn" style="position:absolute; top:1rem; left:1rem; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
                    <h3 style="margin-top:0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:1rem; margin-bottom:1rem;">تفاصيل الطالب</h3>
                    <div id="inst-student-details-content"></div>
                </div>
            `,document.body.appendChild(i),document.getElementById("inst-student-close-btn").addEventListener("click",()=>{i.style.display="none"}),i.addEventListener("click",s=>{s.target===i&&(i.style.display="none")}));const t=document.getElementById("inst-student-details-content");t.innerHTML=`
            <div style="margin-bottom: 0.8rem;"><strong>الاسم:</strong> ${e.userName||"غير متوفر"}</div>
            <div style="margin-bottom: 0.8rem;"><strong>الحالة:</strong> متصل</div>
            <div style="margin-bottom: 0.8rem;"><strong>المدة:</strong> ${e.sessionDurationMinutes||0} دقيقة</div>
            <div style="margin-bottom: 0.8rem;"><strong>الجهاز:</strong> ${e.device||"غير معروف"}</div>
            <div style="margin-bottom: 0.8rem;"><strong>الدرس الحالي:</strong> ${e.currentLessonId||"غير محدد"}</div>
        `,i.style.display="flex"}destroy(){this.unsubscribe&&this.unsubscribe();const e=document.getElementById("inst-student-details-modal");e&&e.remove()}},O=new z,D=class{init(e){this.controller=e}},N=new D,H=class{constructor(){this.controller=null,this.unsubscribePresence=null,this.onlineCount=0}init(e){this.controller=e,this.startListening()}startListening(){const e=this.controller.engine.courseId;this.unsubscribePresence=M.listenToActiveUsers(e,i=>{const t=Date.now();let s=0;i.forEach(n=>{if(n.lastSeen){const o=n.lastSeen.toMillis?n.lastSeen.toMillis():t;t-o<9e4&&s++}else s++}),this.onlineCount=s,this.updateUI()})}updateUI(){const e=document.getElementById("inst-stat-online");e&&(e.innerText=this.onlineCount)}destroy(){this.unsubscribePresence&&this.unsubscribePresence()}},U=new H,$=class{constructor(){this.engine=null,this.isInitialized=!1,this.activeSessionsUnsubscribe=null,this.activeLessonId=null}init(e){if(!this.isInitialized){if(this.engine=e,!this.engine.isInstructor){console.error("SECURITY VIOLATION: Non-instructor attempting to initialize InstructorController.");return}C.subscribe(B.PLAY_LECTURE,i=>{i&&i.id&&(this.activeLessonId=i.id)}),T.init(this),m.init(this),V.init(this),O.init(this),N.init(this),U.init(this),this.isInitialized=!0,this.restoreVideoManagementPanel(),this.listenForHandRaises()}}async updateProfile(e){try{await g.updateProfile(this.engine.currentUser.uid,e),await g.updateCourseProfile(this.engine.courseId,e)}catch(i){throw console.error("Profile update failed",i),i}}async promptVideoUpload(){const e=document.createElement("input");e.type="file",e.accept="video/mp4,video/webm,video/ogg",e.onchange=async i=>{const t=i.target.files[0];if(!t)return;const s=document.getElementById("btn-video-upload");s&&(s.disabled=!0,s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الرفع...');try{const n=await g.uploadMedia(t,`courses/${this.engine.courseId}/videos`);await w.updateCourse(this.engine.courseId,{activeVideoUrl:n}),await m.setMode("video",{isLive:!1,videoUrl:n,status:"playing",timestamp:0}),this._showVideoManagementPanel(n,t.name)}catch(n){alert("فشل رفع الفيديو: "+n.message)}finally{s&&(s.disabled=!1,s.innerHTML='<i class="fas fa-upload"></i> رفع فيديو')}},e.click()}async deleteVideo(){try{const e=(await w.getCourse(this.engine.courseId))?.activeVideoUrl;if(e)try{await k.deleteStorageObjectByUrl(e),console.log("[InstructorController] Deleted temporary active video file")}catch(i){console.warn("[InstructorController] Storage delete failed (may have already been removed):",i.message)}await w.clearActiveVideo(this.engine.courseId),await m.setMode("video",{isLive:!1,videoUrl:null,status:"paused"}),this._hideVideoManagementPanel()}catch(e){alert("فشل حذف الفيديو: "+e.message)}}async replaceVideo(){try{const e=(await w.getCourse(this.engine.courseId))?.activeVideoUrl;if(e)try{await k.deleteStorageObjectByUrl(e),console.log("[InstructorController] Deleted temporary active video file")}catch(i){console.warn("[InstructorController] Could not delete video file from storage",i)}}catch{}this.promptVideoUpload()}_showVideoManagementPanel(e,i){const t=document.getElementById("video-management-panel");if(!t)return;const s=document.getElementById("current-video-name"),n=document.getElementById("current-video-preview");s&&(s.textContent=i||"فيديو محمّل"),n&&(n.src=e,this._attachVideoSyncListeners(n)),t.style.display="block",t.style.animation="fadeIn 0.3s ease"}_attachVideoSyncListeners(e){this._removeVideoSyncListeners(),this._videoTarget=e,this._videoHandlers={play:()=>m.setMode("video",{status:"playing",timestamp:e.currentTime}),pause:()=>m.setMode("video",{status:"paused",timestamp:e.currentTime}),seeked:()=>m.setMode("video",{timestamp:e.currentTime}),timeupdate:(()=>{let i=0;return()=>{const t=Date.now();t-i>2e3&&!e.paused&&(m.setMode("video",{status:"playing",timestamp:e.currentTime}),i=t)}})()},this._videoTarget&&(this._videoTarget.addEventListener("play",this._videoHandlers.play),this._videoTarget.addEventListener("pause",this._videoHandlers.pause),this._videoTarget.addEventListener("seeked",this._videoHandlers.seeked),this._videoTarget.addEventListener("timeupdate",this._videoHandlers.timeupdate))}_removeVideoSyncListeners(){this._videoTarget&&this._videoHandlers&&(this._videoTarget.removeEventListener("play",this._videoHandlers.play),this._videoTarget.removeEventListener("pause",this._videoHandlers.pause),this._videoTarget.removeEventListener("seeked",this._videoHandlers.seeked),this._videoTarget.removeEventListener("timeupdate",this._videoHandlers.timeupdate)),this._videoHandlers=null,this._videoTarget=null}_hideVideoManagementPanel(){const e=document.getElementById("video-management-panel");e&&(e.style.display="none"),this._removeVideoSyncListeners()}async restoreVideoManagementPanel(){try{const e=(await w.getCourse(this.engine.courseId))?.activeVideoUrl;e&&this._showVideoManagementPanel(e,"فيديو محمّل مسبقاً")}catch{}}async playVideo(){const e=document.getElementById("current-video-preview");e&&e.play().catch(i=>console.warn("Play prevented",i))}async pauseVideo(){const e=document.getElementById("current-video-preview");e&&e.pause()}async startAgoraLive(){try{const{MediaEngine:e}=await p(async()=>{const{MediaEngine:i}=await import("./MediaEngine-B27jAUlJ.js").then(t=>t.n);return{MediaEngine:i}},__vite__mapDeps([11,2,4,5,6,7,3,1,8,9,10,12]));await e.startLiveWebRTC(this.engine.courseId),await m.setMode("live",{isLive:!0})}catch(e){console.error("[InstructorController] Failed to start live stream:",e);const{NotificationManager:i}=await p(async()=>{const{NotificationManager:t}=await import("./courseRoom-B9evgojT.js").then(s=>s.c);return{NotificationManager:t}},__vite__mapDeps([5,2,6,7,3,1,4,8,9,10]));throw i.show("تعذر بدء البث المباشر: "+e.message,"error"),e}}async stopAgoraLive(){const{MediaEngine:e}=await p(async()=>{const{MediaEngine:i}=await import("./MediaEngine-B27jAUlJ.js").then(t=>t.n);return{MediaEngine:i}},__vite__mapDeps([11,2,4,5,6,7,3,1,8,9,10,12]));await m.setMode("video",{isLive:!1}),e.stopLiveWebRTC(this.engine.courseId)}async toggleAgoraMic(){const{MediaEngine:e}=await p(async()=>{const{MediaEngine:t}=await import("./MediaEngine-B27jAUlJ.js").then(s=>s.n);return{MediaEngine:t}},__vite__mapDeps([11,2,4,5,6,7,3,1,8,9,10,12])),i=e.toggleMic();document.getElementById("btn-agora-mic").innerHTML=i?'<i class="fas fa-microphone-slash"></i> تم الكتم':'<i class="fas fa-microphone"></i> كتم المايك'}async switchAgoraCamera(){const{MediaEngine:e}=await p(async()=>{const{MediaEngine:i}=await import("./MediaEngine-B27jAUlJ.js").then(t=>t.n);return{MediaEngine:i}},__vite__mapDeps([11,2,4,5,6,7,3,1,8,9,10,12]));e.switchCamera()}async setTeachingMode(e,i={}){const{MediaEngine:t}=await p(async()=>{const{MediaEngine:r}=await import("./MediaEngine-B27jAUlJ.js").then(l=>l.n);return{MediaEngine:r}},__vite__mapDeps([11,2,4,5,6,7,3,1,8,9,10,12]));this.isSlidesAudioActive=!1;const s=document.getElementById("btn-slides-mic-start"),n=document.getElementById("btn-slides-mic-stop");s&&(s.style.display="inline-block"),n&&(n.style.display="none"),this.isAudioOnlyActive=!1;const o=document.getElementById("btn-audio-start"),a=document.getElementById("btn-audio-stop");if(o&&(o.style.display="inline-block"),a&&(a.style.display="none"),t.agoraClient||t._isPublishing)try{await t.stopLiveWebRTC(this.engine.courseId)}catch{}await m.setMode(e,i),e==="slides"&&this.loadSlidesGallery()}async loadSlidesGallery(){try{const e=await w.getCourse(this.engine.courseId)||{};this.courseSlides=e.slidesGallery||[],this.renderSlidesGallery()}catch(e){console.error("Failed to load slides gallery",e)}}renderSlidesGallery(){const e=document.getElementById("inst-slides-gallery");e&&(e.innerHTML="",this.selectedSlides=[],this.courseSlides.forEach((i,t)=>{const s=document.createElement("img");s.src=i,s.style.width="100%",s.style.height="60px",s.style.objectFit="cover",s.style.borderRadius="4px",s.style.cursor="pointer",s.style.border="2px solid transparent",s.onclick=()=>{if(this.selectedSlides.includes(i))this.selectedSlides=this.selectedSlides.filter(n=>n!==i),s.style.borderColor="transparent";else{const n=document.getElementById("inst-slides-layout"),o=n?n.value:"slides-layout-1";let a=1;if(o==="slides-layout-2"?a=2:o==="slides-layout-3"?a=3:o==="slides-layout-4"?a=4:o==="slides-layout-5"&&(a=5),this.selectedSlides.length>=a){const r=this.selectedSlides.shift();e.querySelectorAll("img").forEach(l=>{l.src===r&&(l.style.borderColor="transparent")})}this.selectedSlides.push(i),s.style.borderColor="#34d399"}},e.appendChild(s)}))}async uploadSlides(e){const i=Array.from(e.target.files);if(i.length)try{const t=i.map(n=>g.uploadMedia(n,`courses/${this.engine.courseId}/slides`)),s=await Promise.all(t);await w.addSlidesToGallery(this.engine.courseId,s),await this.loadSlidesGallery(),alert("تم رفع الصور بنجاح.")}catch(t){console.error("Failed to upload slides:",t),alert("فشل رفع الصور: "+t.message)}}handleSlideLayoutChange(e){const i=e.target.value;let t=1;if(i==="slides-layout-2"?t=2:i==="slides-layout-3"?t=3:i==="slides-layout-4"?t=4:i==="slides-layout-5"&&(t=5),this.selectedSlides&&this.selectedSlides.length>t){const s=this.selectedSlides.length-t,n=this.selectedSlides.splice(0,s),o=document.getElementById("inst-slides-gallery");o&&o.querySelectorAll("img").forEach(a=>{n.includes(a.src)&&(a.style.borderColor="transparent")})}}async presentSelectedSlides(){if(!this.selectedSlides||this.selectedSlides.length===0){alert("يرجى اختيار صورة واحدة على الأقل للعرض.");return}const e=document.getElementById("inst-slides-layout"),i=e?e.value:"slides-layout-1";await m.setMode("slides",{slides:this.selectedSlides,layout:i,audioStream:this.isSlidesAudioActive||!1})}async startSlidesAudio(){const{MediaEngine:e}=await p(async()=>{const{MediaEngine:i}=await import("./MediaEngine-B27jAUlJ.js").then(t=>t.n);return{MediaEngine:i}},__vite__mapDeps([11,2,4,5,6,7,3,1,8,9,10,12]));this.isSlidesAudioActive=!0,document.getElementById("btn-slides-mic-start").style.display="none",document.getElementById("btn-slides-mic-stop").style.display="block",await m.setMode("slides",{slides:this.selectedSlides||[],layout:document.getElementById("inst-slides-layout")?.value||"slides-layout-1",audioStream:!0}),e.startAudioOnlyWebRTC(this.engine.courseId)}async stopSlidesAudio(){const{MediaEngine:e}=await p(async()=>{const{MediaEngine:i}=await import("./MediaEngine-B27jAUlJ.js").then(t=>t.n);return{MediaEngine:i}},__vite__mapDeps([11,2,4,5,6,7,3,1,8,9,10,12]));this.isSlidesAudioActive=!1,document.getElementById("btn-slides-mic-start").style.display="block",document.getElementById("btn-slides-mic-stop").style.display="none",await m.setMode("slides",{slides:this.selectedSlides||[],layout:document.getElementById("inst-slides-layout")?.value||"slides-layout-1",audioStream:!1}),e.stopLiveWebRTC(this.engine.courseId)}async startAudioOnly(){const{MediaEngine:e}=await p(async()=>{const{MediaEngine:i}=await import("./MediaEngine-B27jAUlJ.js").then(t=>t.n);return{MediaEngine:i}},__vite__mapDeps([11,2,4,5,6,7,3,1,8,9,10,12]));this.isAudioOnlyActive=!0,document.getElementById("btn-audio-start").style.display="none",document.getElementById("btn-audio-stop").style.display="block",await m.setMode("audio",{audioStream:!0}),e.startAudioOnlyWebRTC(this.engine.courseId)}async stopAudioOnly(){const{MediaEngine:e}=await p(async()=>{const{MediaEngine:i}=await import("./MediaEngine-B27jAUlJ.js").then(t=>t.n);return{MediaEngine:i}},__vite__mapDeps([11,2,4,5,6,7,3,1,8,9,10,12]));this.isAudioOnlyActive=!1,document.getElementById("btn-audio-start").style.display="block",document.getElementById("btn-audio-stop").style.display="none",await m.setMode("audio",{audioStream:!1}),e.stopLiveWebRTC(this.engine.courseId)}async sendChannelMessage(){const e=document.getElementById("inst-channel-text");if(!e||!e.value.trim())return;const i=e.value.trim();e.value="";const t={type:"text",content:i,timestamp:Date.now()};try{await g.addChannelMessage(this.engine.courseId,this.activeLessonId,t),await m.setMode("channel",{lastMessage:t})}catch(s){console.error("Failed to send channel text:",s)}}async sendChannelImage(e){const i=e.target.files[0];if(i){e.target.value="";try{const t={type:"image",content:await g.uploadMedia(i,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await g.addChannelMessage(this.engine.courseId,this.activeLessonId,t),await m.setMode("channel",{lastMessage:t})}catch(t){console.error("Failed to upload channel image:",t),alert("فشل رفع الصورة: "+t.message)}}}async sendChannelVideo(e){const i=e.target.files[0];if(i){e.target.value="";try{const t={type:"video",content:await g.uploadMedia(i,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await g.addChannelMessage(this.engine.courseId,this.activeLessonId,t),await m.setMode("channel",{lastMessage:t})}catch(t){console.error("Failed to upload channel video:",t),alert("فشل رفع الفيديو: "+t.message)}}}async toggleChannelVoice(){const e=document.getElementById("btn-channel-voice");if(this.isRecordingVoice)this.mediaRecorder.stop(),this.audioStream.getTracks().forEach(i=>i.stop()),this.audioCtx&&(this.audioCtx.close().catch(i=>console.warn(i)),this.audioCtx=null),this.isRecordingVoice=!1,e.innerHTML='<i class="fas fa-microphone"></i> تسجيل صوتي',e.classList.replace("btn-danger","btn-dark"),this.audioStream&&(this.audioStream.getTracks().forEach(i=>i.stop()),this.audioStream=null);else try{this.audioStream=await navigator.mediaDevices.getUserMedia({audio:{noiseSuppression:!0,echoCancellation:!0,autoGainControl:!0,channelCount:1,sampleRate:44100}});const i=window.AudioContext||window.webkitAudioContext;this.audioCtx=new i;const t=this.audioCtx.createMediaStreamSource(this.audioStream),s=this.audioCtx.createBiquadFilter();s.type="highpass",s.frequency.value=85;const n=this.audioCtx.createBiquadFilter();n.type="lowpass",n.frequency.value=9e3;const o=this.audioCtx.createDynamicsCompressor();o.threshold.value=-40,o.knee.value=30,o.ratio.value=10,o.attack.value=.005,o.release.value=.1,t.connect(s),s.connect(n),n.connect(o);const a=this.audioCtx.createMediaStreamDestination();o.connect(a),this.mediaRecorder=new MediaRecorder(a.stream),this.audioChunks=[],this.mediaRecorder.ondataavailable=r=>{r.data.size>0&&this.audioChunks.push(r.data)},this.mediaRecorder.onstop=async()=>{const r=new Blob(this.audioChunks,{type:"audio/webm"}),l=new File([r],`audio_${Date.now()}.webm`,{type:"audio/webm"});try{const u={type:"audio",content:await g.uploadMedia(l,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await g.addChannelMessage(this.engine.courseId,this.activeLessonId,u),await m.setMode("channel",{lastMessage:u})}catch(u){console.error("Failed to upload audio:",u);const{NotificationManager:c}=await p(async()=>{const{NotificationManager:d}=await import("./courseRoom-B9evgojT.js").then(f=>f.c);return{NotificationManager:d}},__vite__mapDeps([5,2,6,7,3,1,4,8,9,10]));c.show("فشل رفع المقطع الصوتي: "+u.message,"error")}},this.mediaRecorder.start(),this.isRecordingVoice=!0,e.innerHTML='<i class="fas fa-stop-circle"></i> إيقاف التسجيل',e.classList.replace("btn-dark","btn-danger")}catch(i){console.error("Error accessing microphone:",i);const{NotificationManager:t}=await p(async()=>{const{NotificationManager:s}=await import("./courseRoom-B9evgojT.js").then(n=>n.c);return{NotificationManager:s}},__vite__mapDeps([5,2,6,7,3,1,4,8,9,10]));t.show("لم نتمكن من الوصول إلى الميكروفون. يرجى التأكد من منح الصلاحيات.","error")}}showHandRaiseNotification(e,i){const t=document.getElementById("hand-raise-toasts");if(!t)return;const s=document.createElement("div");s.className="hand-raise-toast",s.dataset.uid=i,s.innerHTML=`
            <div class="toast-icon">✋</div>
            <div class="toast-info">
                <div class="toast-name">${e}</div>
                <div class="toast-desc">يطلب الكلام في الدرس</div>
            </div>
            <button class="toast-allow-btn" data-uid="${i}">سماح</button>
        `,s.querySelector(".toast-allow-btn").addEventListener("click",()=>{this.allowStudentMic(i,e),s.remove()}),t.appendChild(s),setTimeout(()=>{s.parentNode&&s.remove()},15e3)}async allowStudentMic(e,i){try{await I.setSessionState(this.engine.courseId,{[`micPermissions.${e}`]:!0});const{NotificationManager:t}=await p(async()=>{const{NotificationManager:s}=await import("./courseRoom-B9evgojT.js").then(n=>n.c);return{NotificationManager:s}},__vite__mapDeps([5,2,6,7,3,1,4,8,9,10]));t.show(`تم السماح لـ ${i} بالكلام`,"success")}catch(t){console.error("[InstructorController] allowStudentMic failed:",t)}}async revokeStudentMic(e){try{await I.revokeMicPermission(this.engine.courseId,e),NotificationManager.show("تم سحب صلاحية الميكروفون بنجاح","success")}catch(i){console.error("[InstructorController] revoke mic error",i),NotificationManager.show("حدث خطأ أثناء سحب الصلاحية","error")}}async kickStudent(e){try{await I.kickStudent(this.engine.courseId,e),NotificationManager.show("تم طرد الطالب من الغرفة بنجاح","success")}catch(i){console.error("[InstructorController] kick student error",i),NotificationManager.show("حدث خطأ أثناء محاولة طرد الطالب","error")}}listenForHandRaises(){this._handRaiseUnsubscribe=I.onHandRaisesSnapshot(this.engine.courseId,e=>{e.forEach(i=>{if(i.type==="added"){const t=i.doc.data();this.showHandRaiseNotification(t.name||"طالب",i.doc.id)}})})}showHandRaiseNotification(e,i){const t=document.getElementById("hand-raise-toasts");if(!t)return;const s=document.createElement("div");s.className="hand-raise-toast",s.style.cssText="background:rgba(0,0,0,0.8); border:1px solid var(--primary-color); border-radius:10px; padding:1rem; display:flex; flex-direction:column; gap:0.5rem; animation: slideInRight 0.3s ease;",s.innerHTML=`
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold; color:var(--text-primary);"><i class="fas fa-hand-paper" style="color:var(--primary-color);"></i> ${e} يطلب الكلام</span>
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                <button class="btn btn-sm btn-primary" style="flex:1;" onclick="InstructorController.handleHandRaise('${i}', '${e}', true, this.parentElement.parentElement)">قبول</button>
                <button class="btn btn-sm btn-dark" style="flex:1;" onclick="InstructorController.handleHandRaise('${i}', '${e}', false, this.parentElement.parentElement)">رفض</button>
            </div>
        `,t.appendChild(s),setTimeout(()=>{s.parentElement&&(s.style.animation="slideOutRight 0.3s ease forwards",setTimeout(()=>s.remove(),300),I.cancelMicRequest(this.engine.courseId,i).catch(()=>{}))},2e4)}async handleHandRaise(e,i,t,s){s&&(s.style.animation="slideOutRight 0.3s ease forwards",setTimeout(()=>s.remove(),300));try{await I.cancelMicRequest(this.engine.courseId,e),t&&await this.allowStudentMic(e,i)}catch(n){console.error("[InstructorController] handleHandRaise error:",n)}}destroy(){this._handRaiseUnsubscribe&&(this._handRaiseUnsubscribe(),this._handRaiseUnsubscribe=null),this.activeSessionsUnsubscribe&&(this.activeSessionsUnsubscribe(),this.activeSessionsUnsubscribe=null),this._removeVideoSyncListeners(),this.isInitialized=!1,this.engine=null}},J=new $;export{J as InstructorController};
