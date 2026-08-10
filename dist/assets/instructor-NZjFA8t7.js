const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/CommandBus-BYPPSjjN.js","assets/UserRepository-B2rR5pqP.js","assets/rolldown-runtime-BQ-_32WO.js","assets/CourseRepository-CIYmBoLj.js","assets/courseRoom-Kg4pp4Dx.js","assets/firebase-config-CVzH6vXx.js","assets/EventBus-DfwAvCQ6.js","assets/NotificationManager-yG1gWUIM.js","assets/preload-helper-BATLnrmA.js","assets/CurriculumRepository-4eqn14s-.js","assets/CurriculumProgress-HkEGDNFS.js","assets/StudentProgressRepository-De4oQjql.js","assets/courseRoom-BrFk4XgN.css","assets/sudanFree-CgE2LGLP.css","assets/MediaEngine-DdodmXIB.js","assets/MediaRepository-C4spr4aV.js"])))=>i.map(i=>d[i]);
import{n as y,r as w,t as b}from"./CourseRepository-CIYmBoLj.js";import{t as d}from"./preload-helper-BATLnrmA.js";import{i as k,t as E}from"./courseRoom-Kg4pp4Dx.js";import{t as S}from"./MediaRepository-C4spr4aV.js";import"./InstructorAnalyticsUI-CQ7_9c6q.js";var g={get db(){return w.getFirestore()},get storage(){return w.getStorage()},async updateProfile(e,t){if(!e)throw new Error("No UID provided");await this.db.collection(y.COLLECTIONS.USERS).doc(e).set(t,{merge:!0})},async updateCourseProfile(e,t){if(!e)throw new Error("No courseId provided");await this.db.collection(y.COLLECTIONS.COURSES).doc(e).set({instructor:t.name||null,instructorSpecialty:t.specialty||null,instructorBio:t.bio||null,instructorPhoto:t.photo||null},{merge:!0})},uploadMedia(e,t,i=null){return new Promise((s,n)=>{const o=this.storage.ref().child(`${t}/${Date.now()}_${e.name}`).put(e);o.on("state_changed",a=>{i&&i(a.bytesTransferred/a.totalBytes*100)},a=>n(a),async()=>{s(await o.snapshot.ref.getDownloadURL())})})},async updateTeachingMode(e,t){const i={updatedAt:w.getFirestoreFieldValue().serverTimestamp()};for(const[s,n]of Object.entries(t))if(s==="metadata"&&typeof n=="object")for(const[o,a]of Object.entries(n))i[`metadata.${o}`]=a;else i[s]=n;try{await this.db.collection(y.COLLECTIONS.ACTIVE_SESSIONS).doc(e).update(i)}catch{const n={...t,updatedAt:w.getFirestoreFieldValue().serverTimestamp()};await this.db.collection(y.COLLECTIONS.ACTIVE_SESSIONS).doc(e).set(n,{merge:!0})}},async addChannelMessage(e,t){if(!e)throw new Error("No courseId provided");await this.db.collection(y.COLLECTIONS.COURSES).doc(e).collection(y.COLLECTIONS.CHANNEL_MESSAGES).add(t)},async updateClassroomState(e,t){await this.db.collection(y.COLLECTIONS.ACTIVE_SESSIONS).doc(e).set({permissions:t,updatedAt:w.getFirestoreFieldValue().serverTimestamp()},{merge:!0})},async getResources(e){return(await this.db.collection(y.COLLECTIONS.LESSON_RESOURCES).where("courseId","==",e).get()).docs.map(t=>({id:t.id,...t.data()}))},async dispatchCommand(e){const{commandBus:t}=await d(async()=>{const{commandBus:i}=await import("./CommandBus-BYPPSjjN.js");return{commandBus:i}},__vite__mapDeps([0,1,2,3]));return t.dispatch(e)},async postAnnouncement(e,t){await this.db.collection(y.COLLECTIONS.LESSON_ANNOUNCEMENTS).add({courseId:e,...t,timestamp:w.getFirestoreFieldValue().serverTimestamp()})}},M=class{constructor(){}async updateProfile(e,t){await g.updateProfile(e,t)}async updateCourseProfile(e,t){await g.updateCourseProfile(e,t)}uploadMedia(e,t,i=null){return g.uploadMedia(e,t,i)}async updateTeachingMode(e,t){await g.updateTeachingMode(e,t)}async addChannelMessage(e,t){await g.addChannelMessage(e,t)}async updateClassroomState(e,t){await g.updateClassroomState(e,t)}async getResources(e){return await g.getResources(e)}async postAnnouncement(e,t){await g.postAnnouncement(e,t)}},h=new M,m={show({icon:e="📢",title:t="تأكيد",body:i="",okLabel:s="تأكيد",cancelLabel:n="إلغاء",danger:o=!1}={}){return new Promise(a=>{const r=document.getElementById("room-confirm-overlay"),l=document.getElementById("confirm-icon"),p=document.getElementById("confirm-title"),f=document.getElementById("confirm-body"),u=document.getElementById("confirm-ok-btn"),v=document.getElementById("confirm-cancel-btn");if(!r){a(!0);return}l&&(l.textContent=e),p&&(p.textContent=t),f&&(f.textContent=i),u&&(u.textContent=s),v&&(v.textContent=n),u&&(u.className=o?"btn-confirm-ok danger-ok":"btn-confirm-ok");const I=x=>{r.classList.remove("active"),u.onclick=null,v.onclick=null,a(x)};u.onclick=()=>I(!0),v.onclick=()=>I(!1),r.onclick=x=>{x.target===r&&I(!1)},r.classList.add("active")})},alert({icon:e="ℹ️",title:t="تنبيه",body:i="",okLabel:s="حسناً"}={}){return new Promise(n=>{const o=document.getElementById("room-confirm-overlay");if(!o){n();return}document.getElementById("confirm-icon").textContent=e,document.getElementById("confirm-title").textContent=t,document.getElementById("confirm-body").textContent=i,document.getElementById("confirm-ok-btn").textContent=s,document.getElementById("confirm-cancel-btn").style.display="none";const a=document.getElementById("confirm-ok-btn");a.className="btn-confirm-ok";const r=()=>{o.classList.remove("active"),a.onclick=null,document.getElementById("confirm-cancel-btn").style.display="",n()};a.onclick=()=>r(),o.onclick=l=>{l.target===o&&r()},o.classList.add("active")})}},C=class{init(e){this.controller=e,this.cacheDOM(),this.renderDashboardLayout(),this.attachListeners()}cacheDOM(){this.mountPoint=document.getElementById("instructor-dashboard-mount"),this.tabBtn=document.getElementById("tab-btn-instructor-side")}renderDashboardLayout(){this.mountPoint&&(this.tabBtn&&(this.tabBtn.style.display="flex"),this.mountPoint.innerHTML=`
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
                                <!-- Sub Tabs: Recorded / Live -->
                                <div style="display: flex; gap: 0.3rem; margin-bottom: 0.9rem; background: rgba(0,0,0,0.35); border-radius: 8px; padding: 0.2rem;">
                                    <button class="btn btn-sm btn-primary" id="v-tab-recorded" onclick="window.InstructorAPI.toggleVideoTab('recorded')" style="flex: 1; border-radius: 6px; font-size: 0.8rem;">
                                        <i class="fas fa-film"></i> مسجّل
                                    </button>
                                    <button class="btn btn-sm btn-dark" id="v-tab-live" onclick="window.InstructorAPI.toggleVideoTab('live')" style="flex: 1; border-radius: 6px; font-size: 0.8rem;">
                                        <i class="fas fa-satellite-dish"></i> بث حي
                                    </button>
                                </div>

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
                                        <video id="current-video-preview" controls style="width:100%;border-radius:8px;max-height:110px;background:#000;margin-bottom:0.5rem;" preload="metadata"></video>
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

                                <!-- Live Panel (inside video tab) -->
                                <div id="v-panel-live" style="display:none;">
                                    <button class="btn btn-sm btn-primary" id="btn-start-agora" onclick="window.InstructorAPI.startAgoraLive()" style="width:100%;margin-bottom:0.5rem;border-radius:8px;background:linear-gradient(135deg,#f87171,#ef4444);border:none;">
                                        <i class="fas fa-satellite-dish"></i> بدء البث الحي
                                    </button>
                                    <button class="btn btn-sm btn-danger" id="btn-stop-agora" onclick="window.InstructorAPI.stopAgoraLive()" style="display:none;width:100%;margin-bottom:0.5rem;border-radius:8px;">
                                        <i class="fas fa-stop-circle"></i> إنهاء البث
                                    </button>
                                    <div style="display:flex;gap:0.4rem;">
                                        <button class="btn btn-sm btn-dark" id="btn-agora-mic" onclick="window.InstructorAPI.toggleAgoraMic()" style="flex:1;border-radius:8px;">
                                            <i class="fas fa-microphone"></i> المايك
                                        </button>
                                        <button class="btn btn-sm btn-dark" id="btn-agora-cam" onclick="window.InstructorAPI.switchAgoraCamera()" style="flex:1;border-radius:8px;">
                                            <i class="fas fa-sync-alt"></i> الكاميرا
                                        </button>
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
                        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
                            <table style="width:100%;text-align:right;border-collapse:collapse;font-size:0.88rem;">
                                <thead style="background:rgba(255,255,255,0.05);">
                                    <tr>
                                        <th style="padding:0.8rem 1rem;border-bottom:1px solid rgba(255,255,255,0.06);">الاسم</th>
                                        <th style="padding:0.8rem 1rem;border-bottom:1px solid rgba(255,255,255,0.06);">الحالة</th>
                                        <th style="padding:0.8rem 1rem;border-bottom:1px solid rgba(255,255,255,0.06);">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="instructor-student-list">
                                    <tr><td colspan="3" style="text-align:center;padding:2rem;color:var(--text-secondary);">جاري التحميل...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>


                    <!-- ═══════════════════════════════════════
                         VIEW 3: RESOURCES MANAGEMENT
                         ═══════════════════════════════════════ -->
                    <div id="inst-view-resources" class="inst-view" style="display:none;padding:0.9rem;">
                        <h3 style="font-size:1rem;margin-bottom:1rem;">
                            <i class="fas fa-folder-open" style="color:var(--primary-color);"></i> إدارة الموارد
                        </h3>
                        <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem;background:rgba(255,255,255,0.02);padding:1.2rem;border-radius:12px;border:1px dashed rgba(255,255,255,0.15);">
                            <label style="font-size:0.85rem;color:var(--text-secondary);text-align:center;">رفع ملف جديد للدرس الحالي</label>
                            <div style="display:flex;gap:0.5rem;">
                                <input type="file" id="inst-new-resource-file" class="form-input" style="flex:1;padding:0.5rem;background:rgba(0,0,0,0.2);font-size:0.82rem;">
                                <button class="btn btn-primary" style="border-radius:8px;">
                                    <i class="fas fa-upload"></i> رفع
                                </button>
                            </div>
                        </div>
                        <div id="inst-resource-list" style="display:flex;flex-direction:column;gap:0.5rem;"></div>
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
        `)}toggleVideoTabUI(e){const t=document.getElementById("v-tab-recorded"),i=document.getElementById("v-tab-live");if(e==="recorded"){t&&(t.className="btn btn-sm btn-primary"),i&&(i.className="btn btn-sm btn-dark");const s=document.getElementById("v-panel-recorded"),n=document.getElementById("v-panel-live");s&&(s.style.display="block"),n&&(n.style.display="none")}else{t&&(t.className="btn btn-sm btn-dark"),i&&(i.className="btn btn-sm btn-primary");const s=document.getElementById("v-panel-recorded"),n=document.getElementById("v-panel-live");s&&(s.style.display="none"),n&&(n.style.display="block")}}_switchModeWorkspace(e){this.mountPoint.querySelectorAll(".mode-workspace").forEach(s=>s.style.display="none");const t=this.mountPoint.querySelector(`#mode-ws-${e}`);t&&(t.style.display="block",t.style.animation="fadeIn 0.25s ease"),this.mountPoint.querySelectorAll(".inst-mode-btn").forEach(s=>{s.style.borderColor="rgba(255,255,255,0.06)",s.style.background="rgba(255,255,255,0.03)",s.style.color="var(--text-secondary)",s.style.transform="scale(1)"});const i=this.mountPoint.querySelector(`.inst-mode-btn[data-mode="${e}"]`);i&&(i.style.borderColor="var(--primary-color)",i.style.background="rgba(99,102,241,0.18)",i.style.color="white",i.style.transform="scale(1.04)")}attachListeners(){if(!this.mountPoint)return;window.InstructorAPI={setMode:i=>{this.controller.setTeachingMode(i),this._switchModeWorkspace(i),this._updateFloatBar(i)},endCurrentLesson:async()=>{await m.show({icon:"🏁",title:"إنهاء الدرس الحالي",body:"هل أنت متأكد من إنهاء الدرس الحالي وبدء دورة درس جديدة؟",okLabel:"نعم، إنهاء",danger:!0})&&d(async()=>{const{CurriculumController:i}=await import("./courseRoom-Kg4pp4Dx.js").then(s=>s.n);return{CurriculumController:i}},__vite__mapDeps([4,2,3,5,1,6,7,8,9,10,11,12,13])).then(({CurriculumController:i})=>i.endCurrentLesson())},toggleVideoTab:i=>this.toggleVideoTabUI(i),handleSlideLayoutChange:i=>this.controller.handleSlideLayoutChange(i),uploadSlides:i=>this.controller.uploadSlides(i),presentSelectedSlides:()=>this.controller.presentSelectedSlides(),startSlidesAudio:()=>{this.controller.startSlidesAudio();const i=document.getElementById("float-btn-mic"),s=document.getElementById("float-btn-stop");i&&(i.style.display="inline-flex"),s&&(s.style.display="inline-flex")},stopSlidesAudio:()=>{this.controller.stopSlidesAudio();const i=document.getElementById("float-btn-mic"),s=document.getElementById("float-btn-stop");i&&(i.style.display="none"),s&&(s.style.display="none")},startAudioOnly:()=>{this.controller.startAudioOnly(),document.getElementById("audio-ws-status").textContent="البث الصوتي نشط الآن...";const i=document.getElementById("float-btn-mic"),s=document.getElementById("float-btn-stop");i&&(i.style.display="inline-flex"),s&&(s.style.display="inline-flex"),this._startTimer("audio-ws-timer")},stopAudioOnly:()=>{this.controller.stopAudioOnly(),document.getElementById("audio-ws-status").textContent="البث الصوتي غير نشط";const i=document.getElementById("float-btn-mic"),s=document.getElementById("float-btn-stop");i&&(i.style.display="none"),s&&(s.style.display="none"),this._stopTimer("audio-ws-timer")},promptVideoUpload:()=>this.controller.promptVideoUpload(),playVideo:()=>this.controller.playVideo(),pauseVideo:()=>this.controller.pauseVideo(),deleteVideo:async()=>{await m.show({icon:"🗑️",title:"حذف الفيديو",body:"هل أنت متأكد من حذف الفيديو الحالي؟",okLabel:"نعم، احذف",danger:!0})&&await this.controller.deleteVideo()},replaceVideo:async()=>{await m.show({icon:"🔄",title:"تغيير الفيديو",body:"سيتم استبدال الفيديو الحالي بفيديو جديد. هل تريد المتابعة؟",okLabel:"نعم، تغيير"})&&await this.controller.replaceVideo()},startAgoraLive:async()=>{await m.show({icon:"📡",title:"بدء البث الحي",body:`سيتم بدء البث الحي للطلاب. 

⚠️ يرجى عدم إغلاق المتصفح أو التبويبة فجأة أثناء البث حتى لا تفقد التسجيل.
💡 إذا كانت المحاضرة طويلة جداً (أكثر من ساعتين)، يُفضل إنهاؤها وبدء بث جديد لضمان جودة رفع التسجيل.

هل أنت جاهز لبدء البث؟`,okLabel:"بدء البث"})&&(this.controller.startAgoraLive().catch(async i=>{await m.alert({icon:"❌",title:"خطأ",body:"تعذر بدء البث: "+i.message})}),document.getElementById("btn-start-agora").style.display="none",document.getElementById("btn-stop-agora").style.display="block",document.getElementById("instructor-float-bar")&&(document.getElementById("float-btn-mic").style.display="inline-flex",document.getElementById("float-btn-cam").style.display="inline-flex",document.getElementById("float-btn-stop").style.display="inline-flex"))},stopAgoraLive:async()=>{if(!await m.show({icon:"⏹",title:"إنهاء البث",body:"هل تريد إنهاء البث الحي الآن؟",okLabel:"إنهاء البث",danger:!0}))return;this.controller.stopAgoraLive();const i=document.getElementById("btn-start-agora"),s=document.getElementById("btn-stop-agora");i&&(i.style.display="block"),s&&(s.style.display="none"),document.getElementById("float-btn-mic").style.display="none",document.getElementById("float-btn-cam").style.display="none",document.getElementById("float-btn-stop").style.display="none"},startAgoraLiveDedicated:async()=>{await m.show({icon:"📡",title:"بدء البث الحي",body:`سيبدأ البث الحي للطلاب. 

⚠️ يرجى عدم إغلاق المتصفح أو التبويبة فجأة أثناء البث حتى لا تفقد التسجيل.
💡 إذا كانت المحاضرة طويلة جداً (أكثر من ساعتين)، يُفضل إنهاؤها وبدء بث جديد لضمان جودة رفع التسجيل.

هل أنت جاهز لبدء البث؟`,okLabel:"بدء البث"})&&(this.controller.startAgoraLive().catch(async i=>{await m.alert({icon:"❌",title:"خطأ",body:"تعذر بدء البث: "+i.message})}),document.getElementById("btn-start-agora-live").style.display="none",document.getElementById("btn-stop-agora-live").style.display="block",document.getElementById("live-on-badge").style.display="inline",document.getElementById("live-ws-status").textContent="البث نشط الآن",document.getElementById("float-btn-mic").style.display="inline-flex",document.getElementById("float-btn-cam").style.display="inline-flex",document.getElementById("float-btn-stop").style.display="inline-flex",this._startTimer("live-ws-timer"))},stopAgoraLiveDedicated:async()=>{await m.show({icon:"⏹",title:"إنهاء البث",body:"هل تريد إنهاء البث الحي الآن؟",okLabel:"إنهاء البث",danger:!0})&&(this.controller.stopAgoraLive(),document.getElementById("btn-start-agora-live").style.display="block",document.getElementById("btn-stop-agora-live").style.display="none",document.getElementById("live-on-badge").style.display="none",document.getElementById("live-ws-status").textContent="البث غير نشط حالياً",document.getElementById("float-btn-mic").style.display="none",document.getElementById("float-btn-cam").style.display="none",document.getElementById("float-btn-stop").style.display="none",this._stopTimer("live-ws-timer"))},toggleAgoraMic:async()=>{const{MediaEngine:i}=await d(async()=>{const{MediaEngine:a}=await import("./MediaEngine-DdodmXIB.js");return{MediaEngine:a}},__vite__mapDeps([14,6,2,8,4,3,5,1,7,9,10,11,12,13,15])),s=i.toggleMic(),n=["btn-agora-mic","btn-live-mic"],o=document.getElementById("float-btn-mic");n.forEach(a=>{const r=document.getElementById(a);r&&(r.innerHTML=s?'<i class="fas fa-microphone-slash"></i> مكتوم':'<i class="fas fa-microphone"></i> المايك',s?r.classList.add("btn-danger"):r.classList.remove("btn-danger"))}),o&&(o.innerHTML=s?'<i class="fas fa-microphone-slash"></i><span class="fb-label"> مكتوم</span>':'<i class="fas fa-microphone"></i><span class="fb-label"> المايك</span>',s?o.classList.add("active"):o.classList.remove("active"))},switchAgoraCamera:async()=>{const{MediaEngine:i}=await d(async()=>{const{MediaEngine:s}=await import("./MediaEngine-DdodmXIB.js");return{MediaEngine:s}},__vite__mapDeps([14,6,2,8,4,3,5,1,7,9,10,11,12,13,15]));i.switchCamera()},sendChannelMessage:async()=>{const i=document.getElementById("inst-channel-text"),s=i?i.value.trim():"";if(!s){await m.alert({icon:"✏️",title:"الرسالة فارغة",body:"يرجى كتابة رسالة قبل الإرسال."});return}await m.show({icon:"📢",title:"تأكيد إرسال الرسالة",body:s.length>120?s.slice(0,120)+"...":s,okLabel:"إرسال"})&&this.controller.sendChannelMessage()},sendChannelImage:async i=>{const s=i.target.files[0];s&&(await m.show({icon:"🖼️",title:"إرسال صورة",body:`هل تريد إرسال الصورة "${s.name}" للطلاب؟`,okLabel:"إرسال الصورة"})?this.controller.sendChannelImage(i):i.target.value="")},sendChannelVideo:async i=>{const s=i.target.files[0];s&&(await m.show({icon:"🎬",title:"إرسال فيديو",body:`هل تريد إرسال الفيديو "${s.name}" للطلاب؟`,okLabel:"إرسال الفيديو"})?this.controller.sendChannelVideo(i):i.target.value="")},toggleChannelVoice:()=>this.controller.toggleChannelVoice()},this._wireFloatBar(),this._updateFloatBar("video");const e=this.mountPoint.querySelectorAll(".inst-nav");e.forEach(i=>{i.addEventListener("click",s=>{const n=s.currentTarget.getAttribute("data-view");e.forEach(a=>{a.classList.remove("btn-primary"),a.classList.add("btn-dark")}),s.currentTarget.classList.remove("btn-dark"),s.currentTarget.classList.add("btn-primary"),this.mountPoint.querySelectorAll(".inst-view").forEach(a=>a.style.display="none");const o=this.mountPoint.querySelector(`#inst-view-${n}`);o&&(o.style.display="flex"),n==="dashboard"&&o&&(o.style.flexDirection="column")})});const t=this.mountPoint.querySelector("#inst-profile-form");t&&t.addEventListener("submit",async i=>{i.preventDefault();const s=t.querySelector('button[type="submit"]'),n=s.innerHTML;s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...',s.disabled=!0;const o={name:document.getElementById("inst-prof-name").value.trim(),specialty:document.getElementById("inst-prof-spec").value.trim(),bio:document.getElementById("inst-prof-bio").value.trim()},a=document.getElementById("inst-prof-photo").files[0],r=document.getElementById("inst-prof-cv").files[0];try{const{InstructorService:l}=await d(async()=>{const{InstructorService:p}=await import("./InstructorService-CSJY40jq.js");return{InstructorService:p}},[]);a&&(s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري رفع الصورة...',o.photo=await l.uploadMedia(a,`profiles/${this.controller.engine.currentUser.uid}`)),r&&(s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري رفع السيرة...',o.cv=await l.uploadMedia(r,`profiles/${this.controller.engine.currentUser.uid}`)),s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...',await this.controller.updateProfile(o),s.innerHTML='<i class="fas fa-check"></i> تم الحفظ بنجاح',setTimeout(()=>{s.innerHTML=n,s.disabled=!1},3e3)}catch(l){await m.alert({icon:"❌",title:"خطأ",body:"حدث خطأ: "+(l.message||"")}),s.innerHTML=n,s.disabled=!1}})}_startTimer(e){this._stopTimer(e);const t=document.getElementById(e);if(!t)return;t.style.display="block";let i=0;this._timers=this._timers||{},this._timers[e]=setInterval(()=>{i++;const s=String(Math.floor(i/60)).padStart(2,"0"),n=String(i%60).padStart(2,"0");t.textContent=`${s}:${n}`},1e3)}_stopTimer(e){this._timers&&this._timers[e]&&(clearInterval(this._timers[e]),delete this._timers[e]);const t=document.getElementById(e);t&&(t.style.display="none",t.textContent="00:00")}_updateFloatBar(e){const t=document.getElementById("instructor-float-bar"),i=document.getElementById("float-mode-label"),s=document.getElementById("float-mode-text");if(!t)return;t.classList.add("visible");const n={video:{cls:"mode-video",icon:"fa-video",text:"فيديو"},link:{cls:"mode-video",icon:"fa-link",text:"رابط"},live:{cls:"mode-live",icon:"fa-satellite-dish",text:"بث حي"},slides:{cls:"mode-slides",icon:"fa-images",text:"شرائح"},audio:{cls:"mode-audio",icon:"fa-podcast",text:"صوت فقط"},channel:{cls:"mode-channel",icon:"fa-bullhorn",text:"قناة"}},o=n[e]||n.video;i&&(i.className=`float-bar-mode-label ${o.cls}`,i.innerHTML=`<i class="fas ${o.icon}"></i>`),s&&(s.textContent=o.text);const a=document.getElementById("float-btn-mic"),r=document.getElementById("float-btn-cam"),l=document.getElementById("float-btn-stop");a&&(a.style.display="none"),r&&(r.style.display="none"),l&&(l.style.display="none"),e==="live"?(a&&(a.style.display="inline-flex"),r&&(r.style.display="inline-flex"),l&&(l.style.display="inline-flex")):e==="audio"&&(a&&(a.style.display="inline-flex"),l&&(l.style.display="inline-flex"))}_wireFloatBar(){const e=document.getElementById("float-btn-mic"),t=document.getElementById("float-btn-cam"),i=document.getElementById("float-btn-stop");e&&e.addEventListener("click",()=>window.InstructorAPI.toggleAgoraMic()),t&&t.addEventListener("click",()=>window.InstructorAPI.switchAgoraCamera()),i&&i.addEventListener("click",async()=>{const s=document.getElementById("float-mode-text")?.textContent;s==="بث حي"?window.InstructorAPI.stopAgoraLiveDedicated():s==="صوت فقط"?window.InstructorAPI.stopAudioOnly():s==="شرائح"&&window.InstructorAPI.stopSlidesAudio()})}},L=new C,_=class{init(e){this.controller=e}async setMode(e,t={}){const i={mode:e,metadata:t};await h.updateTeachingMode(this.controller.engine.courseId,i)}},c=new _,A=class{constructor(){this.controller=null}init(e){this.controller=e,this.attachListeners()}attachListeners(){const e=document.getElementById("inst-toggle-chat"),t=document.getElementById("inst-toggle-resources");e&&e.addEventListener("change",async i=>{const s=i.target.checked;await h.updateClassroomState(this.controller.engine.courseId,{chatLocked:s})}),t&&t.addEventListener("change",async i=>{const s=i.target.checked;await h.updateClassroomState(this.controller.engine.courseId,{resourcesLocked:s})})}},B=new A,T=class{constructor(){this.controller=null,this.unsubscribe=null}init(e){this.controller=e,this.startListening()}startListening(){this.unsubscribe=k.listenToActiveUsers(this.controller.engine.courseId,e=>{const t=document.getElementById("instructor-student-list");if(!t)return;const i=Date.now(),s=[];if(e.forEach(o=>{if(o.lastSeen){const a=o.lastSeen.toMillis?o.lastSeen.toMillis():i;i-a<9e4&&s.push(o)}else s.push(o)}),s.length===0){t.innerHTML='<tr><td colspan="3" style="text-align: center; padding: 1rem;">لا يوجد طلاب متصلين حالياً.</td></tr>';return}const n=document.createDocumentFragment();s.forEach(o=>{const a=document.createElement("tr");a.style.borderBottom="1px solid rgba(255,255,255,0.05)",a.innerHTML=`
                        <td style="padding: 0.5rem;">
                            <div style="font-weight: bold;">${o.userName||"طالب مجهول"}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${o.device||"غير معروف"}</div>
                        </td>
                        <td style="padding: 0.5rem;">
                            <span style="color: var(--success); font-size: 0.85rem;"><i class="fas fa-circle"></i> متصل</span>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${o.sessionDurationMinutes||0} دقيقة</div>
                        </td>
                        <td style="padding: 0.5rem; display: flex; gap: 0.5rem;">
                            <button class="btn btn-sm btn-dark" title="كتم (Mute)"><i class="fas fa-microphone-slash"></i></button>
                            <button class="btn btn-sm btn-dark" title="إزالة (Kick)" style="color: var(--danger);"><i class="fas fa-sign-out-alt"></i></button>
                        </td>
                    `,n.appendChild(a)}),t.innerHTML="",t.appendChild(n)})}destroy(){this.unsubscribe&&this.unsubscribe()}},P=new T,V=class{init(e){this.controller=e}},O=new V,R=class{constructor(){this.controller=null,this.unsubscribePresence=null,this.onlineCount=0}init(e){this.controller=e,this.startListening()}startListening(){const e=this.controller.engine.courseId;this.unsubscribePresence=k.listenToActiveUsers(e,t=>{const i=Date.now();let s=0;t.forEach(n=>{if(n.lastSeen){const o=n.lastSeen.toMillis?n.lastSeen.toMillis():i;i-o<9e4&&s++}else s++}),this.onlineCount=s,this.updateUI()})}updateUI(){const e=document.getElementById("inst-stat-online");e&&(e.innerText=this.onlineCount)}destroy(){this.unsubscribePresence&&this.unsubscribePresence()}},z=new R,D=class{constructor(){this.engine=null,this.isInitialized=!1,this.activeSessionsUnsubscribe=null}init(e){this.isInitialized||(this.engine=e,this.engine.isInstructor&&(L.init(this),c.init(this),B.init(this),P.init(this),O.init(this),z.init(this),this.isInitialized=!0,this.restoreVideoManagementPanel(),this.listenForHandRaises()))}async updateProfile(e){try{await h.updateProfile(this.engine.currentUser.uid,e),await h.updateCourseProfile(this.engine.courseId,e)}catch(t){throw t}}async promptVideoUpload(){const e=document.createElement("input");e.type="file",e.accept="video/mp4,video/webm,video/ogg",e.onchange=async t=>{const i=t.target.files[0];if(!i)return;const s=document.getElementById("btn-video-upload");s&&(s.disabled=!0,s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الرفع...');try{const n=await h.uploadMedia(i,`courses/${this.engine.courseId}/videos`);await b.updateCourse(this.engine.courseId,{activeVideoUrl:n}),await c.setMode("video",{isLive:!1,videoUrl:n,status:"playing",timestamp:0}),this._showVideoManagementPanel(n,i.name)}catch(n){alert("فشل رفع الفيديو: "+n.message)}finally{s&&(s.disabled=!1,s.innerHTML='<i class="fas fa-upload"></i> رفع فيديو')}},e.click()}async deleteVideo(){try{const e=(await b.getCourse(this.engine.courseId))?.activeVideoUrl;if(e)try{await S.deleteStorageObjectByUrl(e)}catch{}await b.clearActiveVideo(this.engine.courseId),await c.setMode("video",{isLive:!1,videoUrl:null,status:"paused"}),this._hideVideoManagementPanel()}catch(e){alert("فشل حذف الفيديو: "+e.message)}}async replaceVideo(){try{const e=(await b.getCourse(this.engine.courseId))?.activeVideoUrl;if(e)try{await S.deleteStorageObjectByUrl(e)}catch{}}catch{}this.promptVideoUpload()}_showVideoManagementPanel(e,t){const i=document.getElementById("video-management-panel");if(!i)return;const s=document.getElementById("current-video-name"),n=document.getElementById("current-video-preview");s&&(s.textContent=t||"فيديو محمّل"),n&&(n.src=e,this._attachVideoSyncListeners(n)),i.style.display="block",i.style.animation="fadeIn 0.3s ease"}_attachVideoSyncListeners(e){this._removeVideoSyncListeners(e),this._videoHandlers={play:()=>c.setMode("video",{status:"playing",timestamp:e.currentTime}),pause:()=>c.setMode("video",{status:"paused",timestamp:e.currentTime}),seeked:()=>c.setMode("video",{timestamp:e.currentTime}),timeupdate:(()=>{let t=0;return()=>{const i=Date.now();i-t>2e3&&!e.paused&&(c.setMode("video",{status:"playing",timestamp:e.currentTime}),t=i)}})()},e.addEventListener("play",this._videoHandlers.play),e.addEventListener("pause",this._videoHandlers.pause),e.addEventListener("seeked",this._videoHandlers.seeked),e.addEventListener("timeupdate",this._videoHandlers.timeupdate)}_removeVideoSyncListeners(e){!e||!this._videoHandlers||(e.removeEventListener("play",this._videoHandlers.play),e.removeEventListener("pause",this._videoHandlers.pause),e.removeEventListener("seeked",this._videoHandlers.seeked),e.removeEventListener("timeupdate",this._videoHandlers.timeupdate),this._videoHandlers=null)}_hideVideoManagementPanel(){const e=document.getElementById("video-management-panel");e&&(e.style.display="none");const t=document.getElementById("current-video-preview");this._removeVideoSyncListeners(t)}async restoreVideoManagementPanel(){try{const e=(await b.getCourse(this.engine.courseId))?.activeVideoUrl;e&&this._showVideoManagementPanel(e,"فيديو محمّل مسبقاً")}catch{}}async playVideo(){const e=document.getElementById("current-video-preview");e&&e.play().catch(t=>{})}async pauseVideo(){const e=document.getElementById("current-video-preview");e&&e.pause()}async startAgoraLive(){try{const{MediaEngine:e}=await d(async()=>{const{MediaEngine:t}=await import("./MediaEngine-DdodmXIB.js");return{MediaEngine:t}},__vite__mapDeps([14,6,2,8,4,3,5,1,7,9,10,11,12,13,15]));await c.setMode("live",{isLive:!0}),await e.startLiveWebRTC(this.engine.courseId)}catch(e){const{NotificationManager:t}=await d(async()=>{const{NotificationManager:i}=await import("./NotificationManager-yG1gWUIM.js").then(s=>s.n);return{NotificationManager:i}},__vite__mapDeps([7,2]));throw t.show("تعذر بدء البث المباشر: "+e.message,"error"),e}}async stopAgoraLive(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:t}=await import("./MediaEngine-DdodmXIB.js");return{MediaEngine:t}},__vite__mapDeps([14,6,2,8,4,3,5,1,7,9,10,11,12,13,15]));await c.setMode("video",{isLive:!1}),e.stopLiveWebRTC(this.engine.courseId)}async toggleAgoraMic(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:i}=await import("./MediaEngine-DdodmXIB.js");return{MediaEngine:i}},__vite__mapDeps([14,6,2,8,4,3,5,1,7,9,10,11,12,13,15])),t=e.toggleMic();document.getElementById("btn-agora-mic").innerHTML=t?'<i class="fas fa-microphone-slash"></i> تم الكتم':'<i class="fas fa-microphone"></i> كتم المايك'}async switchAgoraCamera(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:t}=await import("./MediaEngine-DdodmXIB.js");return{MediaEngine:t}},__vite__mapDeps([14,6,2,8,4,3,5,1,7,9,10,11,12,13,15]));e.switchCamera()}async setTeachingMode(e,t={}){await c.setMode(e,t),e==="slides"&&this.loadSlidesGallery()}async loadSlidesGallery(){try{const e=await b.getCourse(this.engine.courseId)||{};this.courseSlides=e.slidesGallery||[],this.renderSlidesGallery()}catch{}}renderSlidesGallery(){const e=document.getElementById("inst-slides-gallery");e&&(e.innerHTML="",this.selectedSlides=[],this.courseSlides.forEach((t,i)=>{const s=document.createElement("img");s.src=t,s.style.width="100%",s.style.height="60px",s.style.objectFit="cover",s.style.borderRadius="4px",s.style.cursor="pointer",s.style.border="2px solid transparent",s.onclick=()=>{if(this.selectedSlides.includes(t))this.selectedSlides=this.selectedSlides.filter(n=>n!==t),s.style.borderColor="transparent";else{const n=document.getElementById("inst-slides-layout"),o=n?n.value:"slides-layout-1";let a=1;if(o==="slides-layout-2"?a=2:o==="slides-layout-3"?a=3:o==="slides-layout-4"?a=4:o==="slides-layout-5"&&(a=5),this.selectedSlides.length>=a){const r=this.selectedSlides.shift();e.querySelectorAll("img").forEach(l=>{l.src===r&&(l.style.borderColor="transparent")})}this.selectedSlides.push(t),s.style.borderColor="#34d399"}},e.appendChild(s)}))}async uploadSlides(e){const t=Array.from(e.target.files);if(t.length)try{const i=t.map(n=>h.uploadMedia(n,`courses/${this.engine.courseId}/slides`)),s=await Promise.all(i);await b.addSlidesToGallery(this.engine.courseId,s),await this.loadSlidesGallery(),alert("تم رفع الصور بنجاح.")}catch(i){alert("فشل رفع الصور: "+i.message)}}handleSlideLayoutChange(e){const t=e.target.value;let i=1;if(t==="slides-layout-2"?i=2:t==="slides-layout-3"?i=3:t==="slides-layout-4"?i=4:t==="slides-layout-5"&&(i=5),this.selectedSlides&&this.selectedSlides.length>i){const s=this.selectedSlides.length-i,n=this.selectedSlides.splice(0,s),o=document.getElementById("inst-slides-gallery");o&&o.querySelectorAll("img").forEach(a=>{n.includes(a.src)&&(a.style.borderColor="transparent")})}}async presentSelectedSlides(){if(!this.selectedSlides||this.selectedSlides.length===0){alert("يرجى اختيار صورة واحدة على الأقل للعرض.");return}const e=document.getElementById("inst-slides-layout"),t=e?e.value:"slides-layout-1";await c.setMode("slides",{slides:this.selectedSlides,layout:t,audioStream:this.isSlidesAudioActive||!1})}async startSlidesAudio(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:t}=await import("./MediaEngine-DdodmXIB.js");return{MediaEngine:t}},__vite__mapDeps([14,6,2,8,4,3,5,1,7,9,10,11,12,13,15]));this.isSlidesAudioActive=!0,document.getElementById("btn-slides-mic-start").style.display="none",document.getElementById("btn-slides-mic-stop").style.display="block",await c.setMode("slides",{slides:this.selectedSlides||[],layout:document.getElementById("inst-slides-layout")?.value||"slides-layout-1",audioStream:!0}),e.startAudioOnlyWebRTC(this.engine.courseId)}async stopSlidesAudio(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:t}=await import("./MediaEngine-DdodmXIB.js");return{MediaEngine:t}},__vite__mapDeps([14,6,2,8,4,3,5,1,7,9,10,11,12,13,15]));this.isSlidesAudioActive=!1,document.getElementById("btn-slides-mic-start").style.display="block",document.getElementById("btn-slides-mic-stop").style.display="none",await c.setMode("slides",{slides:this.selectedSlides||[],layout:document.getElementById("inst-slides-layout")?.value||"slides-layout-1",audioStream:!1}),e.stopLiveWebRTC(this.engine.courseId)}async startAudioOnly(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:t}=await import("./MediaEngine-DdodmXIB.js");return{MediaEngine:t}},__vite__mapDeps([14,6,2,8,4,3,5,1,7,9,10,11,12,13,15]));this.isAudioOnlyActive=!0,document.getElementById("btn-audio-start").style.display="none",document.getElementById("btn-audio-stop").style.display="block",await c.setMode("audio",{audioStream:!0}),e.startAudioOnlyWebRTC(this.engine.courseId)}async stopAudioOnly(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:t}=await import("./MediaEngine-DdodmXIB.js");return{MediaEngine:t}},__vite__mapDeps([14,6,2,8,4,3,5,1,7,9,10,11,12,13,15]));this.isAudioOnlyActive=!1,document.getElementById("btn-audio-start").style.display="block",document.getElementById("btn-audio-stop").style.display="none",await c.setMode("audio",{audioStream:!1}),e.stopLiveWebRTC(this.engine.courseId)}async sendChannelMessage(){const e=document.getElementById("inst-channel-text");if(!e||!e.value.trim())return;const t=e.value.trim();e.value="";const i={type:"text",content:t,timestamp:Date.now()};try{const{InstructorService:s}=await d(async()=>{const{InstructorService:n}=await import("./InstructorService-CSJY40jq.js");return{InstructorService:n}},[]);await s.addChannelMessage(this.engine.courseId,i),await c.setMode("channel",{lastMessage:i})}catch{}}async sendChannelImage(e){const t=e.target.files[0];if(t){e.target.value="";try{const{InstructorService:i}=await d(async()=>{const{InstructorService:n}=await import("./InstructorService-CSJY40jq.js");return{InstructorService:n}},[]),s={type:"image",content:await i.uploadMedia(t,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await i.addChannelMessage(this.engine.courseId,s),await c.setMode("channel",{lastMessage:s})}catch(i){alert("فشل رفع الصورة: "+i.message)}}}async sendChannelVideo(e){const t=e.target.files[0];if(t){e.target.value="";try{const{InstructorService:i}=await d(async()=>{const{InstructorService:n}=await import("./InstructorService-CSJY40jq.js");return{InstructorService:n}},[]),s={type:"video",content:await i.uploadMedia(t,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await i.addChannelMessage(this.engine.courseId,s),await c.setMode("channel",{lastMessage:s})}catch(i){alert("فشل رفع الفيديو: "+i.message)}}}async toggleChannelVoice(){const e=document.getElementById("btn-channel-voice");if(this.isRecordingVoice)this.mediaRecorder.stop(),this.audioStream.getTracks().forEach(t=>t.stop()),this.audioCtx&&(this.audioCtx.close().catch(t=>{}),this.audioCtx=null),this.isRecordingVoice=!1,e.innerHTML='<i class="fas fa-microphone"></i> تسجيل صوتي',e.classList.replace("btn-danger","btn-dark"),this.audioStream&&(this.audioStream.getTracks().forEach(t=>t.stop()),this.audioStream=null);else try{this.audioStream=await navigator.mediaDevices.getUserMedia({audio:{noiseSuppression:!0,echoCancellation:!0,autoGainControl:!0,channelCount:1,sampleRate:44100}});const t=window.AudioContext||window.webkitAudioContext;this.audioCtx=new t;const i=this.audioCtx.createMediaStreamSource(this.audioStream),s=this.audioCtx.createBiquadFilter();s.type="highpass",s.frequency.value=85;const n=this.audioCtx.createBiquadFilter();n.type="lowpass",n.frequency.value=9e3;const o=this.audioCtx.createDynamicsCompressor();o.threshold.value=-40,o.knee.value=30,o.ratio.value=10,o.attack.value=.005,o.release.value=.1,i.connect(s),s.connect(n),n.connect(o);const a=this.audioCtx.createMediaStreamDestination();o.connect(a),this.mediaRecorder=new MediaRecorder(a.stream),this.audioChunks=[],this.mediaRecorder.ondataavailable=r=>{r.data.size>0&&this.audioChunks.push(r.data)},this.mediaRecorder.onstop=async()=>{const r=new Blob(this.audioChunks,{type:"audio/webm"}),l=new File([r],`audio_${Date.now()}.webm`,{type:"audio/webm"});try{const{InstructorService:p}=await d(async()=>{const{InstructorService:u}=await import("./InstructorService-CSJY40jq.js");return{InstructorService:u}},[]),f={type:"audio",content:await p.uploadMedia(l,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await p.addChannelMessage(this.engine.courseId,f),await c.setMode("channel",{lastMessage:f})}catch(p){const{NotificationManager:f}=await d(async()=>{const{NotificationManager:u}=await import("./NotificationManager-yG1gWUIM.js").then(v=>v.n);return{NotificationManager:u}},__vite__mapDeps([7,2]));f.show("فشل رفع المقطع الصوتي: "+p.message,"error")}},this.mediaRecorder.start(),this.isRecordingVoice=!0,e.innerHTML='<i class="fas fa-stop-circle"></i> إيقاف التسجيل',e.classList.replace("btn-dark","btn-danger")}catch{const{NotificationManager:i}=await d(async()=>{const{NotificationManager:s}=await import("./NotificationManager-yG1gWUIM.js").then(n=>n.n);return{NotificationManager:s}},__vite__mapDeps([7,2]));i.show("لم نتمكن من الوصول إلى الميكروفون. يرجى التأكد من منح الصلاحيات.","error")}}showHandRaiseNotification(e,t){const i=document.getElementById("hand-raise-toasts");if(!i)return;const s=document.createElement("div");s.className="hand-raise-toast",s.dataset.uid=t,s.innerHTML=`
            <div class="toast-icon">✋</div>
            <div class="toast-info">
                <div class="toast-name">${e}</div>
                <div class="toast-desc">يطلب الكلام في الدرس</div>
            </div>
            <button class="toast-allow-btn" data-uid="${t}">سماح</button>
        `,s.querySelector(".toast-allow-btn").addEventListener("click",()=>{this.allowStudentMic(t,e),s.remove()}),i.appendChild(s),setTimeout(()=>{s.parentNode&&s.remove()},15e3)}async allowStudentMic(e,t){try{await E.setSessionState(this.engine.courseId,{[`micPermissions.${e}`]:!0});const{NotificationManager:i}=await d(async()=>{const{NotificationManager:s}=await import("./NotificationManager-yG1gWUIM.js").then(n=>n.n);return{NotificationManager:s}},__vite__mapDeps([7,2]));i.show(`تم السماح لـ ${t} بالكلام`,"success")}catch{}}async revokeStudentMic(e){try{await E.revokeMicPermission(this.engine.courseId,e)}catch{}}listenForHandRaises(){this._handRaiseUnsubscribe=E.onHandRaisesSnapshot(this.engine.courseId,e=>{e.forEach(t=>{if(t.type==="added"){const i=t.doc.data();this.showHandRaiseNotification(i.name||"طالب",t.doc.id)}})})}showHandRaiseNotification(e,t){}destroy(){this._handRaiseUnsubscribe&&(this._handRaiseUnsubscribe(),this._handRaiseUnsubscribe=null),this.activeSessionsUnsubscribe&&(this.activeSessionsUnsubscribe(),this.activeSessionsUnsubscribe=null);const e=document.getElementById("current-video-preview");this._removeVideoSyncListeners(e),this.isInitialized=!1,this.engine=null}},q=new D;export{q as InstructorController,M as n,h as t};
