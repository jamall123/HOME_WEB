const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/CommandBus-DClewxlX.js","assets/BackendGateway-13kKwOT0.js","assets/CurriculumController-CfN2hRV3.js","assets/rolldown-runtime-BQ-_32WO.js","assets/academy-eizOQ6Pu.js","assets/NotificationManager-yG1gWUIM.js","assets/MediaEngine-DHtI9gzc.js","assets/EventBus-C86EHaQu.js","assets/courseRoom-Cj0v1-lP.js","assets/ThemeManager-Dt8KBxWK.js","assets/firebase-config-CVzH6vXx.js","assets/ChatService-B9sSZW3y.js","assets/courseRoom-BawdEAjX.css","assets/sudanFree-CgE2LGLP.css"])))=>i.map(i=>d[i]);
import{t as d}from"./academy-eizOQ6Pu.js";var v=class{constructor(){this.db=window.firebase.firestore(),this.storage=window.firebase.storage()}async updateProfile(e,s){if(!e)throw new Error("No UID provided");await this.db.collection("users").doc(e).set(s,{merge:!0})}async updateCourseProfile(e,s){if(!e)throw new Error("No courseId provided");await this.db.collection("courses").doc(e).set({instructor:s.name||null,instructorSpecialty:s.specialty||null,instructorBio:s.bio||null,instructorPhoto:s.photo||null},{merge:!0})}uploadMedia(e,s,t=null){return new Promise((i,o)=>{const a=this.storage.ref().child(`${s}/${Date.now()}_${e.name}`).put(e);a.on("state_changed",n=>{t&&t(n.bytesTransferred/n.totalBytes*100)},n=>o(n),async()=>{i(await a.snapshot.ref.getDownloadURL())})})}async updateTeachingMode(e,s){const t={updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()};for(const[i,o]of Object.entries(s))if(i==="metadata"&&typeof o=="object")for(const[a,n]of Object.entries(o))t[`metadata.${a}`]=n;else t[i]=o;await this.db.collection("active_sessions").doc(e).update(t).catch(async i=>{const o={...s,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()};await this.db.collection("active_sessions").doc(e).set(o,{merge:!0})})}async addChannelMessage(e,s){if(!e)throw new Error("No courseId provided");await this.db.collection("courses").doc(e).collection("channelMessages").add(s)}async updateClassroomState(e,s){await this.db.collection("active_sessions").doc(e).set({permissions:s,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:!0})}async getResources(e){return(await this.db.collection("lessonResources").where("courseId","==",e).get()).docs.map(s=>({id:s.id,...s.data()}))}async postAnnouncement(e,s){await(await d(async()=>{const{commandBus:t}=await import("./CommandBus-DClewxlX.js");return{commandBus:t}},__vite__mapDeps([0,1]))).commandBus.dispatch({domain:"generic",action:"add",payload:{collection:"lessonAnnouncements",data:{courseId:e,...s,timestamp:firebase.firestore.FieldValue.serverTimestamp()}}})}},u=new v,m={show({icon:e="📢",title:s="تأكيد",body:t="",okLabel:i="تأكيد",cancelLabel:o="إلغاء",danger:a=!1}={}){return new Promise(n=>{const r=document.getElementById("room-confirm-overlay"),l=document.getElementById("confirm-icon"),f=document.getElementById("confirm-title"),h=document.getElementById("confirm-body"),p=document.getElementById("confirm-ok-btn"),g=document.getElementById("confirm-cancel-btn");if(!r){n(!0);return}l&&(l.textContent=e),f&&(f.textContent=s),h&&(h.textContent=t),p&&(p.textContent=i),g&&(g.textContent=o),p&&(p.className=a?"btn-confirm-ok danger-ok":"btn-confirm-ok");const y=b=>{r.classList.remove("active"),p.onclick=null,g.onclick=null,n(b)};p.onclick=()=>y(!0),g.onclick=()=>y(!1),r.onclick=b=>{b.target===r&&y(!1)},r.classList.add("active")})},alert({icon:e="ℹ️",title:s="تنبيه",body:t="",okLabel:i="حسناً"}={}){return new Promise(o=>{const a=document.getElementById("room-confirm-overlay");if(!a){o();return}document.getElementById("confirm-icon").textContent=e,document.getElementById("confirm-title").textContent=s,document.getElementById("confirm-body").textContent=t,document.getElementById("confirm-ok-btn").textContent=i,document.getElementById("confirm-cancel-btn").style.display="none";const n=document.getElementById("confirm-ok-btn");n.className="btn-confirm-ok";const r=()=>{a.classList.remove("active"),n.onclick=null,document.getElementById("confirm-cancel-btn").style.display="",o()};n.onclick=()=>r(),a.onclick=l=>{l.target===a&&r()},a.classList.add("active")})}},w=class{init(e){this.controller=e,this.cacheDOM(),this.renderDashboardLayout(),this.attachListeners()}cacheDOM(){this.mountPoint=document.getElementById("instructor-dashboard-mount"),this.tabBtn=document.getElementById("tab-btn-instructor-side")}renderDashboardLayout(){this.mountPoint&&(this.tabBtn&&(this.tabBtn.style.display="flex"),this.mountPoint.innerHTML=`
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
        `)}toggleVideoTabUI(e){const s=document.getElementById("v-tab-recorded"),t=document.getElementById("v-tab-live");if(e==="recorded"){s&&(s.className="btn btn-sm btn-primary"),t&&(t.className="btn btn-sm btn-dark");const i=document.getElementById("v-panel-recorded"),o=document.getElementById("v-panel-live");i&&(i.style.display="block"),o&&(o.style.display="none")}else{s&&(s.className="btn btn-sm btn-dark"),t&&(t.className="btn btn-sm btn-primary");const i=document.getElementById("v-panel-recorded"),o=document.getElementById("v-panel-live");i&&(i.style.display="none"),o&&(o.style.display="block")}}_switchModeWorkspace(e){this.mountPoint.querySelectorAll(".mode-workspace").forEach(i=>i.style.display="none");const s=this.mountPoint.querySelector(`#mode-ws-${e}`);s&&(s.style.display="block",s.style.animation="fadeIn 0.25s ease"),this.mountPoint.querySelectorAll(".inst-mode-btn").forEach(i=>{i.style.borderColor="rgba(255,255,255,0.06)",i.style.background="rgba(255,255,255,0.03)",i.style.color="var(--text-secondary)",i.style.transform="scale(1)"});const t=this.mountPoint.querySelector(`.inst-mode-btn[data-mode="${e}"]`);t&&(t.style.borderColor="var(--primary-color)",t.style.background="rgba(99,102,241,0.18)",t.style.color="white",t.style.transform="scale(1.04)")}attachListeners(){if(!this.mountPoint)return;window.InstructorAPI={setMode:t=>{this.controller.setTeachingMode(t),this._switchModeWorkspace(t),this._updateFloatBar(t)},endCurrentLesson:async()=>{await m.show({icon:"🏁",title:"إنهاء الدرس الحالي",body:"هل أنت متأكد من إنهاء الدرس الحالي وبدء دورة درس جديدة؟",okLabel:"نعم، إنهاء",danger:!0})&&d(async()=>{const{CurriculumController:t}=await import("./CurriculumController-CfN2hRV3.js").then(i=>i.n);return{CurriculumController:t}},__vite__mapDeps([2,3,4,5])).then(({CurriculumController:t})=>t.endCurrentLesson())},toggleVideoTab:t=>this.toggleVideoTabUI(t),handleSlideLayoutChange:t=>this.controller.handleSlideLayoutChange(t),uploadSlides:t=>this.controller.uploadSlides(t),presentSelectedSlides:()=>this.controller.presentSelectedSlides(),startSlidesAudio:()=>{this.controller.startSlidesAudio();const t=document.getElementById("float-btn-mic"),i=document.getElementById("float-btn-stop");t&&(t.style.display="inline-flex"),i&&(i.style.display="inline-flex")},stopSlidesAudio:()=>{this.controller.stopSlidesAudio();const t=document.getElementById("float-btn-mic"),i=document.getElementById("float-btn-stop");t&&(t.style.display="none"),i&&(i.style.display="none")},startAudioOnly:()=>{this.controller.startAudioOnly(),document.getElementById("audio-ws-status").textContent="البث الصوتي نشط الآن...";const t=document.getElementById("float-btn-mic"),i=document.getElementById("float-btn-stop");t&&(t.style.display="inline-flex"),i&&(i.style.display="inline-flex"),this._startTimer("audio-ws-timer")},stopAudioOnly:()=>{this.controller.stopAudioOnly(),document.getElementById("audio-ws-status").textContent="البث الصوتي غير نشط";const t=document.getElementById("float-btn-mic"),i=document.getElementById("float-btn-stop");t&&(t.style.display="none"),i&&(i.style.display="none"),this._stopTimer("audio-ws-timer")},promptVideoUpload:()=>this.controller.promptVideoUpload(),playVideo:()=>this.controller.playVideo(),pauseVideo:()=>this.controller.pauseVideo(),deleteVideo:async()=>{await m.show({icon:"🗑️",title:"حذف الفيديو",body:"هل أنت متأكد من حذف الفيديو الحالي؟",okLabel:"نعم، احذف",danger:!0})&&await this.controller.deleteVideo()},replaceVideo:async()=>{await m.show({icon:"🔄",title:"تغيير الفيديو",body:"سيتم استبدال الفيديو الحالي بفيديو جديد. هل تريد المتابعة؟",okLabel:"نعم، تغيير"})&&await this.controller.replaceVideo()},startAgoraLive:async()=>{await m.show({icon:"📡",title:"بدء البث الحي",body:`سيتم بدء البث الحي للطلاب. 

⚠️ يرجى عدم إغلاق المتصفح أو التبويبة فجأة أثناء البث حتى لا تفقد التسجيل.
💡 إذا كانت المحاضرة طويلة جداً (أكثر من ساعتين)، يُفضل إنهاؤها وبدء بث جديد لضمان جودة رفع التسجيل.

هل أنت جاهز لبدء البث؟`,okLabel:"بدء البث"})&&(this.controller.startAgoraLive().catch(async t=>{await m.alert({icon:"❌",title:"خطأ",body:"تعذر بدء البث: "+t.message})}),document.getElementById("btn-start-agora").style.display="none",document.getElementById("btn-stop-agora").style.display="block",document.getElementById("instructor-float-bar")&&(document.getElementById("float-btn-mic").style.display="inline-flex",document.getElementById("float-btn-cam").style.display="inline-flex",document.getElementById("float-btn-stop").style.display="inline-flex"))},stopAgoraLive:async()=>{if(!await m.show({icon:"⏹",title:"إنهاء البث",body:"هل تريد إنهاء البث الحي الآن؟",okLabel:"إنهاء البث",danger:!0}))return;this.controller.stopAgoraLive();const t=document.getElementById("btn-start-agora"),i=document.getElementById("btn-stop-agora");t&&(t.style.display="block"),i&&(i.style.display="none"),document.getElementById("float-btn-mic").style.display="none",document.getElementById("float-btn-cam").style.display="none",document.getElementById("float-btn-stop").style.display="none"},startAgoraLiveDedicated:async()=>{await m.show({icon:"📡",title:"بدء البث الحي",body:`سيبدأ البث الحي للطلاب. 

⚠️ يرجى عدم إغلاق المتصفح أو التبويبة فجأة أثناء البث حتى لا تفقد التسجيل.
💡 إذا كانت المحاضرة طويلة جداً (أكثر من ساعتين)، يُفضل إنهاؤها وبدء بث جديد لضمان جودة رفع التسجيل.

هل أنت جاهز لبدء البث؟`,okLabel:"بدء البث"})&&(this.controller.startAgoraLive().catch(async t=>{await m.alert({icon:"❌",title:"خطأ",body:"تعذر بدء البث: "+t.message})}),document.getElementById("btn-start-agora-live").style.display="none",document.getElementById("btn-stop-agora-live").style.display="block",document.getElementById("live-on-badge").style.display="inline",document.getElementById("live-ws-status").textContent="البث نشط الآن",document.getElementById("float-btn-mic").style.display="inline-flex",document.getElementById("float-btn-cam").style.display="inline-flex",document.getElementById("float-btn-stop").style.display="inline-flex",this._startTimer("live-ws-timer"))},stopAgoraLiveDedicated:async()=>{await m.show({icon:"⏹",title:"إنهاء البث",body:"هل تريد إنهاء البث الحي الآن؟",okLabel:"إنهاء البث",danger:!0})&&(this.controller.stopAgoraLive(),document.getElementById("btn-start-agora-live").style.display="block",document.getElementById("btn-stop-agora-live").style.display="none",document.getElementById("live-on-badge").style.display="none",document.getElementById("live-ws-status").textContent="البث غير نشط حالياً",document.getElementById("float-btn-mic").style.display="none",document.getElementById("float-btn-cam").style.display="none",document.getElementById("float-btn-stop").style.display="none",this._stopTimer("live-ws-timer"))},toggleAgoraMic:async()=>{const{MediaEngine:t}=await d(async()=>{const{MediaEngine:n}=await import("./MediaEngine-DHtI9gzc.js");return{MediaEngine:n}},__vite__mapDeps([6,4,7,3,8,9,10,5,11,2,12,13])),i=t.toggleMic(),o=["btn-agora-mic","btn-live-mic"],a=document.getElementById("float-btn-mic");o.forEach(n=>{const r=document.getElementById(n);r&&(r.innerHTML=i?'<i class="fas fa-microphone-slash"></i> مكتوم':'<i class="fas fa-microphone"></i> المايك',i?r.classList.add("btn-danger"):r.classList.remove("btn-danger"))}),a&&(a.innerHTML=i?'<i class="fas fa-microphone-slash"></i><span class="fb-label"> مكتوم</span>':'<i class="fas fa-microphone"></i><span class="fb-label"> المايك</span>',i?a.classList.add("active"):a.classList.remove("active"))},switchAgoraCamera:async()=>{const{MediaEngine:t}=await d(async()=>{const{MediaEngine:i}=await import("./MediaEngine-DHtI9gzc.js");return{MediaEngine:i}},__vite__mapDeps([6,4,7,3,8,9,10,5,11,2,12,13]));t.switchCamera()},sendChannelMessage:async()=>{const t=document.getElementById("inst-channel-text"),i=t?t.value.trim():"";if(!i){await m.alert({icon:"✏️",title:"الرسالة فارغة",body:"يرجى كتابة رسالة قبل الإرسال."});return}await m.show({icon:"📢",title:"تأكيد إرسال الرسالة",body:i.length>120?i.slice(0,120)+"...":i,okLabel:"إرسال"})&&this.controller.sendChannelMessage()},sendChannelImage:async t=>{const i=t.target.files[0];i&&(await m.show({icon:"🖼️",title:"إرسال صورة",body:`هل تريد إرسال الصورة "${i.name}" للطلاب؟`,okLabel:"إرسال الصورة"})?this.controller.sendChannelImage(t):t.target.value="")},sendChannelVideo:async t=>{const i=t.target.files[0];i&&(await m.show({icon:"🎬",title:"إرسال فيديو",body:`هل تريد إرسال الفيديو "${i.name}" للطلاب؟`,okLabel:"إرسال الفيديو"})?this.controller.sendChannelVideo(t):t.target.value="")},toggleChannelVoice:()=>this.controller.toggleChannelVoice()},this._wireFloatBar(),this._updateFloatBar("video");const e=this.mountPoint.querySelectorAll(".inst-nav");e.forEach(t=>{t.addEventListener("click",i=>{const o=i.currentTarget.getAttribute("data-view");e.forEach(n=>{n.classList.remove("btn-primary"),n.classList.add("btn-dark")}),i.currentTarget.classList.remove("btn-dark"),i.currentTarget.classList.add("btn-primary"),this.mountPoint.querySelectorAll(".inst-view").forEach(n=>n.style.display="none");const a=this.mountPoint.querySelector(`#inst-view-${o}`);a&&(a.style.display="flex"),o==="dashboard"&&a&&(a.style.flexDirection="column")})});const s=this.mountPoint.querySelector("#inst-profile-form");s&&s.addEventListener("submit",async t=>{t.preventDefault();const i=s.querySelector('button[type="submit"]'),o=i.innerHTML;i.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...',i.disabled=!0;const a={name:document.getElementById("inst-prof-name").value.trim(),specialty:document.getElementById("inst-prof-spec").value.trim(),bio:document.getElementById("inst-prof-bio").value.trim()},n=document.getElementById("inst-prof-photo").files[0],r=document.getElementById("inst-prof-cv").files[0];try{const{InstructorService:l}=await d(async()=>{const{InstructorService:f}=await import("./InstructorService-DdxBoioC.js");return{InstructorService:f}},[]);n&&(i.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري رفع الصورة...',a.photo=await l.uploadMedia(n,`profiles/${this.controller.engine.currentUser.uid}`)),r&&(i.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري رفع السيرة...',a.cv=await l.uploadMedia(r,`profiles/${this.controller.engine.currentUser.uid}`)),i.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...',await this.controller.updateProfile(a),i.innerHTML='<i class="fas fa-check"></i> تم الحفظ بنجاح',setTimeout(()=>{i.innerHTML=o,i.disabled=!1},3e3)}catch(l){await m.alert({icon:"❌",title:"خطأ",body:"حدث خطأ: "+(l.message||"")}),i.innerHTML=o,i.disabled=!1}})}_startTimer(e){this._stopTimer(e);const s=document.getElementById(e);if(!s)return;s.style.display="block";let t=0;this._timers=this._timers||{},this._timers[e]=setInterval(()=>{t++;const i=String(Math.floor(t/60)).padStart(2,"0"),o=String(t%60).padStart(2,"0");s.textContent=`${i}:${o}`},1e3)}_stopTimer(e){this._timers&&this._timers[e]&&(clearInterval(this._timers[e]),delete this._timers[e]);const s=document.getElementById(e);s&&(s.style.display="none",s.textContent="00:00")}_updateFloatBar(e){const s=document.getElementById("instructor-float-bar"),t=document.getElementById("float-mode-label"),i=document.getElementById("float-mode-text");if(!s)return;s.classList.add("visible");const o={video:{cls:"mode-video",icon:"fa-video",text:"فيديو"},link:{cls:"mode-video",icon:"fa-link",text:"رابط"},live:{cls:"mode-live",icon:"fa-satellite-dish",text:"بث حي"},slides:{cls:"mode-slides",icon:"fa-images",text:"شرائح"},audio:{cls:"mode-audio",icon:"fa-podcast",text:"صوت فقط"},channel:{cls:"mode-channel",icon:"fa-bullhorn",text:"قناة"}},a=o[e]||o.video;t&&(t.className=`float-bar-mode-label ${a.cls}`,t.innerHTML=`<i class="fas ${a.icon}"></i>`),i&&(i.textContent=a.text);const n=document.getElementById("float-btn-mic"),r=document.getElementById("float-btn-cam"),l=document.getElementById("float-btn-stop");n&&(n.style.display="none"),r&&(r.style.display="none"),l&&(l.style.display="none"),e==="live"?(n&&(n.style.display="inline-flex"),r&&(r.style.display="inline-flex"),l&&(l.style.display="inline-flex")):e==="audio"&&(n&&(n.style.display="inline-flex"),l&&(l.style.display="inline-flex"))}_wireFloatBar(){const e=document.getElementById("float-btn-mic"),s=document.getElementById("float-btn-cam"),t=document.getElementById("float-btn-stop");e&&e.addEventListener("click",()=>window.InstructorAPI.toggleAgoraMic()),s&&s.addEventListener("click",()=>window.InstructorAPI.switchAgoraCamera()),t&&t.addEventListener("click",async()=>{const i=document.getElementById("float-mode-text")?.textContent;i==="بث حي"?window.InstructorAPI.stopAgoraLiveDedicated():i==="صوت فقط"?window.InstructorAPI.stopAudioOnly():i==="شرائح"&&window.InstructorAPI.stopSlidesAudio()})}},I=new w,x=class{init(e){this.controller=e}async setMode(e,s={}){const t={mode:e,metadata:s};await u.updateTeachingMode(this.controller.engine.courseId,t)}},c=new x,E=class{constructor(){this.controller=null}init(e){this.controller=e,this.attachListeners()}attachListeners(){const e=document.getElementById("inst-toggle-chat"),s=document.getElementById("inst-toggle-resources");e&&e.addEventListener("change",async t=>{const i=t.target.checked;await u.updateClassroomState(this.controller.engine.courseId,{chatLocked:i})}),s&&s.addEventListener("change",async t=>{const i=t.target.checked;await u.updateClassroomState(this.controller.engine.courseId,{resourcesLocked:i})})}},k=new E,M=class{constructor(){this.controller=null,this.unsubscribe=null}init(e){this.controller=e,this.startListening()}startListening(){const e=firebase.firestore();this.unsubscribe=e.collection("courses").doc(this.controller.engine.courseId).collection("connected_users").onSnapshot(s=>{const t=document.getElementById("instructor-student-list");if(!t)return;const i=Date.now(),o=[];if(s.forEach(n=>{const r=n.data();if(r.lastSeen){const l=r.lastSeen.toMillis?r.lastSeen.toMillis():i;i-l<9e4&&o.push(r)}else o.push(r)}),o.length===0){t.innerHTML='<tr><td colspan="3" style="text-align: center; padding: 1rem;">لا يوجد طلاب متصلين حالياً.</td></tr>';return}const a=document.createDocumentFragment();o.forEach(n=>{const r=document.createElement("tr");r.style.borderBottom="1px solid rgba(255,255,255,0.05)",r.innerHTML=`
                        <td style="padding: 0.5rem;">
                            <div style="font-weight: bold;">${n.userName||"طالب مجهول"}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${n.device||"غير معروف"}</div>
                        </td>
                        <td style="padding: 0.5rem;">
                            <span style="color: var(--success); font-size: 0.85rem;"><i class="fas fa-circle"></i> متصل</span>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${n.sessionDurationMinutes||0} دقيقة</div>
                        </td>
                        <td style="padding: 0.5rem; display: flex; gap: 0.5rem;">
                            <button class="btn btn-sm btn-dark" title="كتم (Mute)"><i class="fas fa-microphone-slash"></i></button>
                            <button class="btn btn-sm btn-dark" title="إزالة (Kick)" style="color: var(--danger);"><i class="fas fa-sign-out-alt"></i></button>
                        </td>
                    `,a.appendChild(r)}),t.innerHTML="",t.appendChild(a)})}destroy(){this.unsubscribe&&this.unsubscribe()}},B=new M,S=class{init(e){this.controller=e}},A=new S,_=class{constructor(){this.controller=null,this.unsubscribePresence=null,this.onlineCount=0}init(e){this.controller=e,this.startListening()}startListening(){const e=firebase.firestore(),s=this.controller.engine.courseId;this.unsubscribePresence=e.collection("courses").doc(s).collection("connected_users").onSnapshot(t=>{const i=Date.now();let o=0;t.forEach(a=>{const n=a.data();if(n.lastSeen){const r=n.lastSeen.toMillis?n.lastSeen.toMillis():i;i-r<9e4&&o++}else o++}),this.onlineCount=o,this.updateUI()})}updateUI(){const e=document.getElementById("inst-stat-online");e&&(e.innerText=this.onlineCount)}destroy(){this.unsubscribePresence&&this.unsubscribePresence()}},L=new _,C=class{constructor(){this.engine=null,this.isInitialized=!1}init(e){this.isInitialized||(this.engine=e,this.engine.isInstructor&&(I.init(this),c.init(this),k.init(this),B.init(this),A.init(this),L.init(this),this.isInitialized=!0,this.restoreVideoManagementPanel()))}async updateProfile(e){try{await u.updateProfile(this.engine.currentUser.uid,e),await u.updateCourseProfile(this.engine.courseId,e)}catch(s){throw s}}async promptVideoUpload(){const e=document.createElement("input");e.type="file",e.accept="video/mp4,video/webm,video/ogg",e.onchange=async s=>{const t=s.target.files[0];if(!t)return;const i=document.getElementById("btn-video-upload");i&&(i.disabled=!0,i.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الرفع...');try{const o=await u.uploadMedia(t,`courses/${this.engine.courseId}/videos`);await window.firebase.firestore().collection("courses").doc(this.engine.courseId).update({activeVideoUrl:o}),await c.setMode("video",{isLive:!1,videoUrl:o,status:"playing",timestamp:0}),this._showVideoManagementPanel(o,t.name)}catch(o){alert("فشل رفع الفيديو: "+o.message)}finally{i&&(i.disabled=!1,i.innerHTML='<i class="fas fa-upload"></i> رفع فيديو')}},e.click()}async deleteVideo(){const e=window.firebase.firestore().collection("courses").doc(this.engine.courseId);try{const s=(await e.get()).data()?.activeVideoUrl;if(s)try{await window.firebase.storage().refFromURL(s).delete()}catch{}await e.update({activeVideoUrl:window.firebase.firestore.FieldValue.delete()}),await c.setMode("video",{isLive:!1,videoUrl:null,status:"paused"}),this._hideVideoManagementPanel()}catch(s){alert("فشل حذف الفيديو: "+s.message)}}async replaceVideo(){const e=window.firebase.firestore().collection("courses").doc(this.engine.courseId);try{const s=(await e.get()).data()?.activeVideoUrl;if(s)try{await window.firebase.storage().refFromURL(s).delete()}catch{}}catch{}this.promptVideoUpload()}_showVideoManagementPanel(e,s){const t=document.getElementById("video-management-panel");if(!t)return;const i=document.getElementById("current-video-name"),o=document.getElementById("current-video-preview");i&&(i.textContent=s||"فيديو محمّل"),o&&(o.src=e),t.style.display="block",t.style.animation="fadeIn 0.3s ease"}_hideVideoManagementPanel(){const e=document.getElementById("video-management-panel");e&&(e.style.display="none");const s=document.getElementById("current-video-preview");s&&(s.src="")}async restoreVideoManagementPanel(){try{const e=(await window.firebase.firestore().collection("courses").doc(this.engine.courseId).get()).data()?.activeVideoUrl;e&&this._showVideoManagementPanel(e,"فيديو محمّل مسبقاً")}catch{}}async playVideo(){await c.setMode("video",{status:"playing"})}async pauseVideo(){await c.setMode("video",{status:"paused"})}async startAgoraLive(){try{const{MediaEngine:e}=await d(async()=>{const{MediaEngine:s}=await import("./MediaEngine-DHtI9gzc.js");return{MediaEngine:s}},__vite__mapDeps([6,4,7,3,8,9,10,5,11,2,12,13]));await c.setMode("live",{isLive:!0}),await e.startLiveWebRTC(this.engine.courseId)}catch(e){const{NotificationManager:s}=await d(async()=>{const{NotificationManager:t}=await import("./NotificationManager-yG1gWUIM.js").then(i=>i.n);return{NotificationManager:t}},__vite__mapDeps([5,3]));throw s.show("تعذر بدء البث المباشر: "+e.message,"error"),e}}async stopAgoraLive(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:s}=await import("./MediaEngine-DHtI9gzc.js");return{MediaEngine:s}},__vite__mapDeps([6,4,7,3,8,9,10,5,11,2,12,13]));await c.setMode("video",{isLive:!1}),e.stopLiveWebRTC(this.engine.courseId)}async toggleAgoraMic(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:t}=await import("./MediaEngine-DHtI9gzc.js");return{MediaEngine:t}},__vite__mapDeps([6,4,7,3,8,9,10,5,11,2,12,13])),s=e.toggleMic();document.getElementById("btn-agora-mic").innerHTML=s?'<i class="fas fa-microphone-slash"></i> تم الكتم':'<i class="fas fa-microphone"></i> كتم المايك'}async switchAgoraCamera(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:s}=await import("./MediaEngine-DHtI9gzc.js");return{MediaEngine:s}},__vite__mapDeps([6,4,7,3,8,9,10,5,11,2,12,13]));e.switchCamera()}async setTeachingMode(e,s={}){await c.setMode(e,s),e==="slides"&&this.loadSlidesGallery()}async loadSlidesGallery(){try{const e=(await window.firebase.firestore().collection("courses").doc(this.engine.courseId).get()).data()||{};this.courseSlides=e.slidesGallery||[],this.renderSlidesGallery()}catch{}}renderSlidesGallery(){const e=document.getElementById("inst-slides-gallery");e&&(e.innerHTML="",this.selectedSlides=[],this.courseSlides.forEach((s,t)=>{const i=document.createElement("img");i.src=s,i.style.width="100%",i.style.height="60px",i.style.objectFit="cover",i.style.borderRadius="4px",i.style.cursor="pointer",i.style.border="2px solid transparent",i.onclick=()=>{if(this.selectedSlides.includes(s))this.selectedSlides=this.selectedSlides.filter(o=>o!==s),i.style.borderColor="transparent";else{const o=document.getElementById("inst-slides-layout"),a=o?o.value:"slides-layout-1";let n=1;if(a==="slides-layout-2"?n=2:a==="slides-layout-3"?n=3:a==="slides-layout-4"?n=4:a==="slides-layout-5"&&(n=5),this.selectedSlides.length>=n){const r=this.selectedSlides.shift();e.querySelectorAll("img").forEach(l=>{l.src===r&&(l.style.borderColor="transparent")})}this.selectedSlides.push(s),i.style.borderColor="#34d399"}},e.appendChild(i)}))}async uploadSlides(e){const s=Array.from(e.target.files);if(s.length)try{const t=s.map(o=>u.uploadMedia(o,`courses/${this.engine.courseId}/slides`)),i=await Promise.all(t);await window.firebase.firestore().collection("courses").doc(this.engine.courseId).update({slidesGallery:window.firebase.firestore.FieldValue.arrayUnion(...i)}),await this.loadSlidesGallery(),alert("تم رفع الصور بنجاح.")}catch(t){alert("فشل رفع الصور: "+t.message)}}handleSlideLayoutChange(e){const s=e.target.value;let t=1;if(s==="slides-layout-2"?t=2:s==="slides-layout-3"?t=3:s==="slides-layout-4"?t=4:s==="slides-layout-5"&&(t=5),this.selectedSlides&&this.selectedSlides.length>t){const i=this.selectedSlides.length-t,o=this.selectedSlides.splice(0,i),a=document.getElementById("inst-slides-gallery");a&&a.querySelectorAll("img").forEach(n=>{o.includes(n.src)&&(n.style.borderColor="transparent")})}}async presentSelectedSlides(){if(!this.selectedSlides||this.selectedSlides.length===0){alert("يرجى اختيار صورة واحدة على الأقل للعرض.");return}const e=document.getElementById("inst-slides-layout"),s=e?e.value:"slides-layout-1";await c.setMode("slides",{slides:this.selectedSlides,layout:s,audioStream:this.isSlidesAudioActive||!1})}async startSlidesAudio(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:s}=await import("./MediaEngine-DHtI9gzc.js");return{MediaEngine:s}},__vite__mapDeps([6,4,7,3,8,9,10,5,11,2,12,13]));this.isSlidesAudioActive=!0,document.getElementById("btn-slides-mic-start").style.display="none",document.getElementById("btn-slides-mic-stop").style.display="block",await c.setMode("slides",{slides:this.selectedSlides||[],layout:document.getElementById("inst-slides-layout")?.value||"slides-layout-1",audioStream:!0}),e.startAudioOnlyWebRTC(this.engine.courseId)}async stopSlidesAudio(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:s}=await import("./MediaEngine-DHtI9gzc.js");return{MediaEngine:s}},__vite__mapDeps([6,4,7,3,8,9,10,5,11,2,12,13]));this.isSlidesAudioActive=!1,document.getElementById("btn-slides-mic-start").style.display="block",document.getElementById("btn-slides-mic-stop").style.display="none",await c.setMode("slides",{slides:this.selectedSlides||[],layout:document.getElementById("inst-slides-layout")?.value||"slides-layout-1",audioStream:!1}),e.stopLiveWebRTC(this.engine.courseId)}async startAudioOnly(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:s}=await import("./MediaEngine-DHtI9gzc.js");return{MediaEngine:s}},__vite__mapDeps([6,4,7,3,8,9,10,5,11,2,12,13]));this.isAudioOnlyActive=!0,document.getElementById("btn-audio-start").style.display="none",document.getElementById("btn-audio-stop").style.display="block",await c.setMode("audio",{audioStream:!0}),e.startAudioOnlyWebRTC(this.engine.courseId)}async stopAudioOnly(){const{MediaEngine:e}=await d(async()=>{const{MediaEngine:s}=await import("./MediaEngine-DHtI9gzc.js");return{MediaEngine:s}},__vite__mapDeps([6,4,7,3,8,9,10,5,11,2,12,13]));this.isAudioOnlyActive=!1,document.getElementById("btn-audio-start").style.display="block",document.getElementById("btn-audio-stop").style.display="none",await c.setMode("audio",{audioStream:!1}),e.stopLiveWebRTC(this.engine.courseId)}async sendChannelMessage(){const e=document.getElementById("inst-channel-text");if(!e||!e.value.trim())return;const s=e.value.trim();e.value="";const t={type:"text",content:s,timestamp:Date.now()};try{const{InstructorService:i}=await d(async()=>{const{InstructorService:o}=await import("./InstructorService-DdxBoioC.js");return{InstructorService:o}},[]);await i.addChannelMessage(this.engine.courseId,t),await c.setMode("channel",{lastMessage:t})}catch{}}async sendChannelImage(e){const s=e.target.files[0];if(s){e.target.value="";try{const{InstructorService:t}=await d(async()=>{const{InstructorService:o}=await import("./InstructorService-DdxBoioC.js");return{InstructorService:o}},[]),i={type:"image",content:await t.uploadMedia(s,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await t.addChannelMessage(this.engine.courseId,i),await c.setMode("channel",{lastMessage:i})}catch(t){alert("فشل رفع الصورة: "+t.message)}}}async sendChannelVideo(e){const s=e.target.files[0];if(s){e.target.value="";try{const{InstructorService:t}=await d(async()=>{const{InstructorService:o}=await import("./InstructorService-DdxBoioC.js");return{InstructorService:o}},[]),i={type:"video",content:await t.uploadMedia(s,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await t.addChannelMessage(this.engine.courseId,i),await c.setMode("channel",{lastMessage:i})}catch(t){alert("فشل رفع الفيديو: "+t.message)}}}async toggleChannelVoice(){const e=document.getElementById("btn-channel-voice");if(this.isRecordingVoice)this.mediaRecorder.stop(),this.isRecordingVoice=!1,e.innerHTML='<i class="fas fa-microphone"></i> تسجيل صوتي',e.classList.replace("btn-danger","btn-dark"),this.audioStream&&(this.audioStream.getTracks().forEach(s=>s.stop()),this.audioStream=null);else try{this.audioStream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.mediaRecorder=new MediaRecorder(this.audioStream),this.audioChunks=[],this.mediaRecorder.ondataavailable=s=>{s.data.size>0&&this.audioChunks.push(s.data)},this.mediaRecorder.onstop=async()=>{const s=new Blob(this.audioChunks,{type:"audio/webm"}),t=new File([s],`audio_${Date.now()}.webm`,{type:"audio/webm"});try{const{InstructorService:i}=await d(async()=>{const{InstructorService:a}=await import("./InstructorService-DdxBoioC.js");return{InstructorService:a}},[]),o={type:"audio",content:await i.uploadMedia(t,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await i.addChannelMessage(this.engine.courseId,o),await c.setMode("channel",{lastMessage:o})}catch(i){const{NotificationManager:o}=await d(async()=>{const{NotificationManager:a}=await import("./NotificationManager-yG1gWUIM.js").then(n=>n.n);return{NotificationManager:a}},__vite__mapDeps([5,3]));o.show("فشل رفع المقطع الصوتي: "+i.message,"error")}},this.mediaRecorder.start(),this.isRecordingVoice=!0,e.innerHTML='<i class="fas fa-stop-circle"></i> إيقاف التسجيل',e.classList.replace("btn-dark","btn-danger")}catch{const{NotificationManager:t}=await d(async()=>{const{NotificationManager:i}=await import("./NotificationManager-yG1gWUIM.js").then(o=>o.n);return{NotificationManager:i}},__vite__mapDeps([5,3]));t.show("لم نتمكن من الوصول إلى الميكروفون. يرجى التأكد من منح الصلاحيات.","error")}}showHandRaiseNotification(e,s){const t=document.getElementById("hand-raise-toasts");if(!t)return;const i=document.createElement("div");i.className="hand-raise-toast",i.dataset.uid=s,i.innerHTML=`
            <div class="toast-icon">✋</div>
            <div class="toast-info">
                <div class="toast-name">${e}</div>
                <div class="toast-desc">يطلب الكلام في الدرس</div>
            </div>
            <button class="toast-allow-btn" data-uid="${s}">سماح</button>
        `,i.querySelector(".toast-allow-btn").addEventListener("click",()=>{this.allowStudentMic(s,e),i.remove()}),t.appendChild(i),setTimeout(()=>{i.parentNode&&i.remove()},15e3)}async allowStudentMic(e,s){try{await window.firebase.firestore().collection("active_sessions").doc(this.engine.courseId).update({[`micPermissions.${e}`]:!0});const{NotificationManager:t}=await d(async()=>{const{NotificationManager:i}=await import("./NotificationManager-yG1gWUIM.js").then(o=>o.n);return{NotificationManager:i}},__vite__mapDeps([5,3]));t.show(`تم السماح لـ ${s} بالكلام`,"success")}catch{}}async revokeStudentMic(e){try{await window.firebase.firestore().collection("active_sessions").doc(this.engine.courseId).update({[`micPermissions.${e}`]:window.firebase.firestore.FieldValue.delete()})}catch{}}listenForHandRaises(){const e=window.firebase.firestore();this._handRaiseUnsubscribe=e.collection("active_sessions").doc(this.engine.courseId).collection("handRaises").onSnapshot(s=>{s.docChanges().forEach(t=>{if(t.type==="added"){const i=t.doc.data();this.showHandRaiseNotification(i.name||"طالب",t.doc.id)}})},s=>{})}},T=new C;export{T as InstructorController,v as n,u as t};
