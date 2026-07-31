const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/CurriculumController-DRRHWXWe.js","assets/rolldown-runtime-BQ-_32WO.js","assets/NotificationManager-DweDfF-8.js","assets/preload-helper-BATLnrmA.js","assets/MediaEngine-XD-W0H6B.js","assets/EventBus-C86EHaQu.js","assets/courseRoom-DsP7y5w8.js","assets/ThemeManager-CfTkPl2F.js","assets/ThemeManager-gkO_wF-V.css","assets/academy-C5avEFtB.js","assets/ChatService-BWPbgAmi.js","assets/courseRoom-DWI9eHFt.css"])))=>i.map(i=>d[i]);
import{t as r}from"./preload-helper-BATLnrmA.js";var p=class{constructor(){this.db=window.firebase.firestore(),this.storage=window.firebase.storage()}async updateProfile(e,t){if(!e)throw new Error("No UID provided");await this.db.collection("users").doc(e).set(t,{merge:!0})}async updateCourseProfile(e,t){if(!e)throw new Error("No courseId provided");await this.db.collection("courses").doc(e).set({instructor:t.name||null,instructorSpecialty:t.specialty||null,instructorBio:t.bio||null,instructorPhoto:t.photo||null},{merge:!0})}uploadMedia(e,t,s=null){return new Promise((i,a)=>{const n=this.storage.ref().child(`${t}/${Date.now()}_${e.name}`).put(e);n.on("state_changed",o=>{s&&s(o.bytesTransferred/o.totalBytes*100)},o=>a(o),async()=>{i(await n.snapshot.ref.getDownloadURL())})})}async updateTeachingMode(e,t){const s={updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()};for(const[i,a]of Object.entries(t))if(i==="metadata"&&typeof a=="object")for(const[n,o]of Object.entries(a))s[`metadata.${n}`]=o;else s[i]=a;await this.db.collection("active_sessions").doc(e).update(s).catch(async i=>{const a={...t,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()};await this.db.collection("active_sessions").doc(e).set(a,{merge:!0})})}async addChannelMessage(e,t){if(!e)throw new Error("No courseId provided");await this.db.collection("courses").doc(e).collection("channelMessages").add(t)}async updateClassroomState(e,t){await this.db.collection("active_sessions").doc(e).set({permissions:t,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:!0})}async getResources(e){return(await this.db.collection("lessonResources").where("courseId","==",e).get()).docs.map(t=>({id:t.id,...t.data()}))}async postAnnouncement(e,t){await(await r(async()=>{const{commandBus:s}=await import("./CommandBus-DFXkkVZW.js");return{commandBus:s}},[])).commandBus.dispatch({domain:"generic",action:"add",payload:{collection:"lessonAnnouncements",data:{courseId:e,...t,timestamp:firebase.firestore.FieldValue.serverTimestamp()}}})}},u=new p,b=class{init(e){this.controller=e,this.cacheDOM(),this.renderDashboardLayout(),this.attachListeners()}cacheDOM(){this.mountPoint=document.getElementById("instructor-dashboard-mount"),this.tabBtn=document.getElementById("tab-btn-instructor-side")}renderDashboardLayout(){this.mountPoint&&(this.tabBtn&&(this.tabBtn.style.display="block"),this.mountPoint.innerHTML=`
            <div class="instructor-workspace" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <!-- Internal Navigation for Instructor Tools -->
                <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); scrollbar-width: none;">
                    <button class="btn btn-sm btn-primary inst-nav" data-view="dashboard" style="border-radius: 20px; padding: 0.4rem 1rem;"><i class="fas fa-sliders-h"></i> مركز التحكم</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="students" style="border-radius: 20px; padding: 0.4rem 1rem;"><i class="fas fa-users"></i> الطلاب</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="resources" style="border-radius: 20px; padding: 0.4rem 1rem;"><i class="fas fa-folder-open"></i> الموارد</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="profile" style="border-radius: 20px; padding: 0.4rem 1rem;"><i class="fas fa-user-tie"></i> الملف الشخصي</button>
                </div>

                <!-- 1. Control Center (Dashboard + Teaching + Classroom) -->
                <div id="inst-view-dashboard" class="inst-view" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    
                    <!-- Stats Section -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 1rem 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <div>
                            <h4 style="margin: 0 0 0.2rem 0; color: var(--text-secondary); font-size: 0.9rem;">متصل الآن بالدرس</h4>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="width: 10px; height: 10px; background: var(--success); border-radius: 50%; box-shadow: 0 0 10px var(--success); animation: pulse 2s infinite;"></div>
                                <span id="inst-stat-online" style="font-size: 1.5rem; font-weight: bold; color: white;">0</span> <span style="color: var(--text-secondary); font-size: 0.9rem;">طالب</span>
                            </div>
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="window.InstructorAPI.endCurrentLesson()" style="border-radius: 8px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);"><i class="fas fa-flag-checkered"></i> إنهاء الدرس الحالي</button>
                    </div>

                    <!-- Teaching Modes -->
                    <div>
                        <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-primary); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-chalkboard-teacher" style="color: var(--primary-color);"></i> أوضاع التدريس</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                            <button class="btn btn-dark inst-mode-btn" data-mode="video" onclick="window.InstructorAPI.setMode('video')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;">
                                <i class="fas fa-video" style="font-size: 1.5rem; color: #60a5fa;"></i> 
                                <span style="font-size: 0.9rem;">فيديو مباشر</span>
                            </button>
                            <button class="btn btn-dark inst-mode-btn" data-mode="slides" onclick="window.InstructorAPI.setMode('slides')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;">
                                <i class="fas fa-images" style="font-size: 1.5rem; color: #34d399;"></i> 
                                <span style="font-size: 0.9rem;">شرائح عرض</span>
                            </button>
                            <button class="btn btn-dark inst-mode-btn" data-mode="audio" onclick="window.InstructorAPI.setMode('audio')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;">
                                <i class="fas fa-podcast" style="font-size: 1.5rem; color: #a78bfa;"></i> 
                                <span style="font-size: 0.9rem;">صوت فقط</span>
                            </button>
                            <button class="btn btn-dark inst-mode-btn" data-mode="channel" onclick="window.InstructorAPI.setMode('channel')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;">
                                <i class="fas fa-bullhorn" style="font-size: 1.5rem; color: #fbbf24;"></i> 
                                <span style="font-size: 0.9rem;">نمط القناة</span>
                            </button>
                        </div>
                        
                        <!-- Video Control Sub-panel -->
                        <div id="inst-video-controls" style="display: none; margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; border: 1px solid rgba(96, 165, 250, 0.2);">
                            <h4 style="color: #60a5fa; margin: 0 0 1rem 0; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-video"></i> تحكم الفيديو والبث</h4>
                            
                            <!-- Tabs for Video / Live -->
                            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; padding: 0.2rem; background: rgba(0,0,0,0.3); border-radius: 8px;">
                                <button class="btn btn-sm btn-primary" id="v-tab-recorded" onclick="window.InstructorAPI.toggleVideoTab('recorded')" style="flex: 1; border-radius: 6px;">مسجل</button>
                                <button class="btn btn-sm btn-dark" id="v-tab-live" onclick="window.InstructorAPI.toggleVideoTab('live')" style="flex: 1; border-radius: 6px;">بث حي</button>
                            </div>
                            
                            <!-- Recorded Video Controls -->
                            <div id="v-panel-recorded" style="display: block;">
                                <button class="btn btn-sm btn-dark" onclick="window.InstructorAPI.promptVideoUpload()" style="width: 100%; margin-bottom: 0.5rem; border-radius: 8px;"><i class="fas fa-upload"></i> رفع / اختيار فيديو</button>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-sm btn-dark" onclick="window.InstructorAPI.playVideo()" style="flex: 1; color: #34d399; border-radius: 8px;"><i class="fas fa-play"></i> تشغيل</button>
                                    <button class="btn btn-sm btn-dark" onclick="window.InstructorAPI.pauseVideo()" style="flex: 1; color: #fbbf24; border-radius: 8px;"><i class="fas fa-pause"></i> إيقاف</button>
                                </div>
                            </div>
                            
                            <!-- Live Stream Controls -->
                            <div id="v-panel-live" style="display: none;">
                                <button class="btn btn-sm btn-primary" id="btn-start-agora" onclick="window.InstructorAPI.startAgoraLive()" style="width: 100%; margin-bottom: 0.5rem; border-radius: 8px;"><i class="fas fa-satellite-dish"></i> بدء البث الحي</button>
                                <button class="btn btn-sm btn-danger" id="btn-stop-agora" onclick="window.InstructorAPI.stopAgoraLive()" style="display: none; width: 100%; margin-bottom: 0.5rem; border-radius: 8px;"><i class="fas fa-stop-circle"></i> إنهاء البث</button>
                                
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-sm btn-dark" id="btn-agora-mic" onclick="window.InstructorAPI.toggleAgoraMic()" style="flex: 1; border-radius: 8px;"><i class="fas fa-microphone"></i> كتم المايك</button>
                                    <button class="btn btn-sm btn-dark" id="btn-agora-cam" onclick="window.InstructorAPI.switchAgoraCamera()" style="flex: 1; border-radius: 8px;"><i class="fas fa-sync-alt"></i> تدوير الكاميرا</button>
                                </div>
                            </div>
                        </div>

                        <!-- Slides Control Sub-panel -->
                        <div id="inst-slides-controls" style="display: none; margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; border: 1px solid rgba(52, 211, 153, 0.2);">
                            <h4 style="color: #34d399; margin: 0 0 1rem 0; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-images"></i> إدارة الشاشة والشرائح</h4>
                            
                            <button class="btn btn-sm btn-dark" onclick="document.getElementById('inst-slides-upload').click()" style="width: 100%; margin-bottom: 1rem; border-radius: 8px;"><i class="fas fa-upload"></i> إضافة صور للمعرض</button>
                            <input type="file" id="inst-slides-upload" multiple accept="image/*" style="display: none;" onchange="window.InstructorAPI.uploadSlides(event)">
                            
                            <div id="inst-slides-gallery" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1rem; max-height: 150px; overflow-y: auto;">
                                <!-- Uploaded images will appear here -->
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">قالب العرض الشاشة:</label>
                                <select id="inst-slides-layout" class="form-input" style="width: 100%; padding: 0.5rem;" onchange="window.InstructorAPI.handleSlideLayoutChange(event)">
                                    <option value="slides-layout-1">صورة واحدة (Full)</option>
                                    <option value="slides-layout-2">صورتان (1x2)</option>
                                    <option value="slides-layout-3">٣ صور (كبيرة و٢ صغار)</option>
                                    <option value="slides-layout-4">٤ صور (شبكة 2x2)</option>
                                    <option value="slides-layout-5">٥ صور (شبكة 3x2)</option>
                                </select>
                            </div>
                            
                            <button class="btn btn-sm btn-primary" onclick="window.InstructorAPI.presentSelectedSlides()" style="width: 100%; margin-bottom: 0.5rem; border-radius: 8px; background: #34d399; color: black; font-weight: bold;"><i class="fas fa-tv"></i> عرض الصور المحددة</button>
                            
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-sm btn-dark" id="btn-slides-mic-start" onclick="window.InstructorAPI.startSlidesAudio()" style="flex: 1; border-radius: 8px; color: #a78bfa;"><i class="fas fa-microphone"></i> بدء الشرح الصوتي</button>
                                <button class="btn btn-sm btn-danger" id="btn-slides-mic-stop" onclick="window.InstructorAPI.stopSlidesAudio()" style="display: none; flex: 1; border-radius: 8px;"><i class="fas fa-microphone-slash"></i> إيقاف الصوت</button>
                            </div>
                        </div>

                        <!-- Audio Control Sub-panel -->
                        <div id="inst-audio-controls" style="display: none; margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; border: 1px solid rgba(167, 139, 250, 0.2);">
                            <h4 style="color: #a78bfa; margin: 0 0 1rem 0; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-podcast"></i> البث الصوتي</h4>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-sm btn-primary" id="btn-audio-start" onclick="window.InstructorAPI.startAudioOnly()" style="flex: 1; border-radius: 8px; background: #a78bfa; color: black; font-weight: bold;"><i class="fas fa-microphone"></i> بدء البث الصوتي</button>
                                <button class="btn btn-sm btn-danger" id="btn-audio-stop" onclick="window.InstructorAPI.stopAudioOnly()" style="display: none; flex: 1; border-radius: 8px;"><i class="fas fa-stop-circle"></i> إنهاء البث</button>
                            </div>
                        </div>

                        <!-- Channel Control Sub-panel -->
                        <div id="inst-channel-controls" style="display: none; margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.2);">
                            <h4 style="color: #fbbf24; margin: 0 0 1rem 0; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-bullhorn"></i> نمط القناة</h4>
                            <div style="margin-bottom: 1rem;">
                                <textarea id="inst-channel-text" class="form-input" style="width: 100%; height: 80px; padding: 0.5rem; resize: none; margin-bottom: 0.5rem;" placeholder="اكتب رسالة نصية..."></textarea>
                                <button class="btn btn-sm btn-primary" onclick="window.InstructorAPI.sendChannelMessage()" style="width: 100%; border-radius: 8px; background: #fbbf24; color: black; font-weight: bold;"><i class="fas fa-paper-plane"></i> إرسال النص</button>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                                <button class="btn btn-sm btn-dark" onclick="document.getElementById('inst-channel-image').click()" style="border-radius: 8px;"><i class="fas fa-image"></i> إرسال صورة</button>
                                <input type="file" id="inst-channel-image" accept="image/*" style="display: none;" onchange="window.InstructorAPI.sendChannelImage(event)">
                                
                                <button class="btn btn-sm btn-dark" onclick="document.getElementById('inst-channel-video').click()" style="border-radius: 8px;"><i class="fas fa-video"></i> إرسال فيديو</button>
                                <input type="file" id="inst-channel-video" accept="video/*" style="display: none;" onchange="window.InstructorAPI.sendChannelVideo(event)">
                                
                                <button class="btn btn-sm btn-dark" id="btn-channel-voice" onclick="window.InstructorAPI.toggleChannelVoice()" style="border-radius: 8px; grid-column: span 2;"><i class="fas fa-microphone"></i> تسجيل صوتي</button>
                            </div>
                        </div>
                    </div>

                    <!-- Room Management -->
                    <div>
                        <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-primary); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-cogs" style="color: var(--primary-color);"></i> إدارة الغرفة</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                            <div style="background: rgba(255,255,255,0.02); padding: 1rem 1.2rem; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.95rem;"><i class="fas fa-comment-slash" style="color: var(--text-secondary); margin-left: 0.5rem;"></i> إغلاق الدردشة للطلاب</span>
                                <label class="switch"><input type="checkbox" id="inst-toggle-chat"><span class="slider"></span></label>
                            </div>
                            <div style="background: rgba(255,255,255,0.02); padding: 1rem 1.2rem; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.95rem;"><i class="fas fa-lock" style="color: var(--text-secondary); margin-left: 0.5rem;"></i> منع تحميل الموارد للطلاب</span>
                                <label class="switch"><input type="checkbox" id="inst-toggle-resources"><span class="slider"></span></label>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- 2. Students Area -->
                <div id="inst-view-students" class="inst-view" style="display: none;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;"><i class="fas fa-users" style="color: var(--primary-color);"></i> إدارة الطلاب</h3>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden;">
                        <table style="width: 100%; text-align: right; border-collapse: collapse; font-size: 0.9rem;">
                            <thead style="background: rgba(255,255,255,0.05);">
                                <tr>
                                    <th style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">الاسم</th>
                                    <th style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">الحالة</th>
                                    <th style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="instructor-student-list">
                                <tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-secondary);">جاري التحميل...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 3. Resources Area -->
                <div id="inst-view-resources" class="inst-view" style="display: none;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;"><i class="fas fa-folder-open" style="color: var(--primary-color);"></i> إدارة الموارد</h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; background: rgba(255,255,255,0.02); padding: 1.2rem; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.2);">
                        <label style="font-size: 0.9rem; color: var(--text-secondary); text-align: center;">رفع ملف جديد للدرس الحالي</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="file" id="inst-new-resource-file" class="form-input" style="flex: 1; padding: 0.5rem; background: rgba(0,0,0,0.2);">
                            <button class="btn btn-primary" style="border-radius: 8px;"><i class="fas fa-upload"></i> رفع</button>
                        </div>
                    </div>
                    <div id="inst-resource-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
                </div>

                <!-- 4. Profile Area -->
                <div id="inst-view-profile" class="inst-view" style="display: none;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;"><i class="fas fa-user-tie" style="color: var(--primary-color);"></i> الملف الشخصي (عام)</h3>
                    <form id="inst-profile-form" style="display: grid; gap: 1.2rem; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">الاسم الكامل</label>
                            <input type="text" id="inst-prof-name" class="form-input" placeholder="الاسم الكامل" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">التخصص الدقيق</label>
                            <input type="text" id="inst-prof-spec" class="form-input" placeholder="مثال: أستاذ رياضيات" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">نبذة تعريفية</label>
                            <textarea id="inst-prof-bio" class="form-input" placeholder="تحدث عن خبراتك..." rows="3" style="width: 100%;"></textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">صورة شخصية</label>
                                <input type="file" id="inst-prof-photo" class="form-input" accept="image/*" style="width: 100%; font-size: 0.8rem; padding: 0.5rem;">
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">السيرة الذاتية (CV)</label>
                                <input type="file" id="inst-prof-cv" class="form-input" accept=".pdf" style="width: 100%; font-size: 0.8rem; padding: 0.5rem;">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; border-radius: 8px; margin-top: 0.5rem;"><i class="fas fa-save"></i> حفظ البيانات</button>
                    </form>
                </div>
            </div>
        `)}toggleVideoTabUI(e){const t=document.getElementById("v-tab-recorded"),s=document.getElementById("v-tab-live");e==="recorded"?(t.className="btn btn-sm btn-primary",s.className="btn btn-sm btn-dark",document.getElementById("v-panel-recorded").style.display="block",document.getElementById("v-panel-live").style.display="none"):(t.className="btn btn-sm btn-dark",s.className="btn btn-sm btn-primary",document.getElementById("v-panel-recorded").style.display="none",document.getElementById("v-panel-live").style.display="block")}attachListeners(){if(!this.mountPoint)return;window.InstructorAPI={setMode:s=>{this.controller.setTeachingMode(s);const i=document.getElementById("inst-video-controls");i&&(i.style.display=s==="video"?"block":"none");const a=document.getElementById("inst-slides-controls");a&&(a.style.display=s==="slides"?"block":"none");const n=document.getElementById("inst-audio-controls");n&&(n.style.display=s==="audio"?"block":"none");const o=document.getElementById("inst-channel-controls");o&&(o.style.display=s==="channel"?"block":"none"),this.mountPoint.querySelectorAll(".inst-mode-btn").forEach(d=>{d.style.borderColor="rgba(255,255,255,0.05)",d.style.background="",d.querySelector("i").style.transform="scale(1)"});const c=this.mountPoint.querySelector(`.inst-mode-btn[data-mode="${s}"]`);c&&(c.style.borderColor="var(--primary-color)",c.style.background="rgba(99, 102, 241, 0.1)",c.querySelector("i").style.transform="scale(1.2)")},endCurrentLesson:()=>{confirm("هل أنت متأكد من إنهاء الدرس الحالي وبدء دورة درس جديدة؟")&&r(async()=>{const{CurriculumController:s}=await import("./CurriculumController-DRRHWXWe.js").then(i=>i.n);return{CurriculumController:s}},__vite__mapDeps([0,1,2,3])).then(({CurriculumController:s})=>s.endCurrentLesson())},toggleVideoTab:s=>this.toggleVideoTabUI(s),handleSlideLayoutChange:s=>this.controller.handleSlideLayoutChange(s),promptVideoUpload:()=>this.controller.promptVideoUpload(),playVideo:()=>this.controller.playVideo(),pauseVideo:()=>this.controller.pauseVideo(),startAgoraLive:()=>{alert("Start button clicked. Attempting to start broadcast..."),this.controller.startAgoraLive().catch(s=>{alert("Controller error: "+s)}),document.getElementById("btn-start-agora").style.display="none",document.getElementById("btn-stop-agora").style.display="block"},stopAgoraLive:()=>{this.controller.stopAgoraLive(),document.getElementById("btn-start-agora").style.display="block",document.getElementById("btn-stop-agora").style.display="none"},toggleAgoraMic:async()=>{const{MediaEngine:s}=await r(async()=>{const{MediaEngine:n}=await import("./MediaEngine.js?v="+Date.now());return{MediaEngine:n}},[]),i=s.toggleMic(),a=document.getElementById("btn-agora-mic");i?(a.innerHTML='<i class="fas fa-microphone-slash"></i> تم الكتم',a.classList.add("btn-danger")):(a.innerHTML='<i class="fas fa-microphone"></i> كتم المايك',a.classList.remove("btn-danger"))},switchAgoraCamera:async()=>{const{MediaEngine:s}=await r(async()=>{const{MediaEngine:i}=await import("./MediaEngine.js?v="+Date.now());return{MediaEngine:i}},[]);s.switchCamera()},uploadSlides:s=>this.controller.uploadSlides(s),presentSelectedSlides:()=>this.controller.presentSelectedSlides(),startSlidesAudio:()=>this.controller.startSlidesAudio(),stopSlidesAudio:()=>this.controller.stopSlidesAudio(),startAudioOnly:()=>this.controller.startAudioOnly(),stopAudioOnly:()=>this.controller.stopAudioOnly(),sendChannelMessage:()=>this.controller.sendChannelMessage(),sendChannelImage:s=>this.controller.sendChannelImage(s),sendChannelVideo:s=>this.controller.sendChannelVideo(s),toggleChannelVoice:()=>this.controller.toggleChannelVoice()};const e=this.mountPoint.querySelectorAll(".inst-nav");e.forEach(s=>{s.addEventListener("click",i=>{const a=i.currentTarget.getAttribute("data-view");e.forEach(o=>{o.classList.remove("btn-primary"),o.classList.add("btn-dark")}),i.currentTarget.classList.remove("btn-dark"),i.currentTarget.classList.add("btn-primary"),this.mountPoint.querySelectorAll(".inst-view").forEach(o=>o.style.display="none");const n=this.mountPoint.querySelector(`#inst-view-${a}`);n&&(n.style.display="block")})});const t=this.mountPoint.querySelector("#inst-profile-form");t&&t.addEventListener("submit",async s=>{s.preventDefault();const i=t.querySelector('button[type="submit"]'),a=i.innerHTML;i.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...',i.disabled=!0;const n={name:document.getElementById("inst-prof-name").value.trim(),specialty:document.getElementById("inst-prof-spec").value.trim(),bio:document.getElementById("inst-prof-bio").value.trim()},o=document.getElementById("inst-prof-photo").files[0],c=document.getElementById("inst-prof-cv").files[0];try{const{InstructorService:d}=await r(async()=>{const{InstructorService:m}=await import("./InstructorService-D2IX2nYy.js");return{InstructorService:m}},[]);o&&(i.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري رفع الصورة...',n.photo=await d.uploadMedia(o,`profiles/${this.controller.engine.currentUser.uid}`)),c&&(i.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري رفع السيرة...',n.cv=await d.uploadMedia(c,`profiles/${this.controller.engine.currentUser.uid}`)),i.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...',await this.controller.updateProfile(n),i.innerHTML='<i class="fas fa-check"></i> تم الحفظ',setTimeout(()=>{i.innerHTML=a,i.disabled=!1},3e3)}catch{alert("حدث خطأ أثناء حفظ البيانات"),i.innerHTML=a,i.disabled=!1}})}},y=new b,g=class{init(e){this.controller=e}async setMode(e,t={}){const s={mode:e,metadata:t};await u.updateTeachingMode(this.controller.engine.courseId,s)}},l=new g,h=class{constructor(){this.controller=null}init(e){this.controller=e,this.attachListeners()}attachListeners(){const e=document.getElementById("inst-toggle-chat"),t=document.getElementById("inst-toggle-resources");e&&e.addEventListener("change",async s=>{const i=s.target.checked;await u.updateClassroomState(this.controller.engine.courseId,{chatLocked:i})}),t&&t.addEventListener("change",async s=>{const i=s.target.checked;await u.updateClassroomState(this.controller.engine.courseId,{resourcesLocked:i})})}},f=new h,v=class{constructor(){this.controller=null,this.unsubscribe=null}init(e){this.controller=e,this.startListening()}startListening(){const e=firebase.firestore();this.unsubscribe=e.collection("courses").doc(this.controller.engine.courseId).collection("connected_users").onSnapshot(t=>{const s=document.getElementById("instructor-student-list");if(!s)return;if(t.empty){s.innerHTML='<tr><td colspan="3" style="text-align: center; padding: 1rem;">لا يوجد طلاب متصلين حالياً.</td></tr>';return}const i=document.createDocumentFragment();t.forEach(a=>{const n=a.data(),o=document.createElement("tr");o.style.borderBottom="1px solid rgba(255,255,255,0.05)",o.innerHTML=`
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
                    `,i.appendChild(o)}),s.innerHTML="",s.appendChild(i)})}destroy(){this.unsubscribe&&this.unsubscribe()}},w=new v,I=class{init(e){this.controller=e}},x=new I,E=class{constructor(){this.controller=null,this.unsubscribePresence=null,this.onlineCount=0}init(e){this.controller=e,this.startListening()}startListening(){const e=firebase.firestore(),t=this.controller.engine.courseId;this.unsubscribePresence=e.collection("courses").doc(t).collection("connected_users").onSnapshot(s=>{this.onlineCount=s.size,this.updateUI()})}updateUI(){const e=document.getElementById("inst-stat-online");e&&(e.innerText=this.onlineCount)}destroy(){this.unsubscribePresence&&this.unsubscribePresence()}},k=new E,M=class{constructor(){this.engine=null,this.isInitialized=!1}init(e){this.isInitialized||(this.engine=e,this.engine.isInstructor&&(y.init(this),l.init(this),f.init(this),w.init(this),x.init(this),k.init(this),this.isInitialized=!0))}async updateProfile(e){try{await u.updateProfile(this.engine.currentUser.uid,e),await u.updateCourseProfile(this.engine.courseId,e)}catch(t){throw t}}async promptVideoUpload(){const e=document.createElement("input");e.type="file",e.accept="video/mp4,video/webm,video/ogg",e.onchange=async t=>{const s=t.target.files[0];if(s)try{const i=await u.uploadMedia(s,`courses/${this.engine.courseId}/videos`);await l.setMode("video",{isLive:!1,videoUrl:i,status:"playing",timestamp:0}),alert("تم رفع الفيديو وتعيينه للعرض بنجاح.")}catch(i){alert("فشل رفع الفيديو: "+i.message)}},e.click()}async playVideo(){await l.setMode("video",{status:"playing"})}async pauseVideo(){await l.setMode("video",{status:"paused"})}async startAgoraLive(){alert("InstructorController: startAgoraLive called");try{const{MediaEngine:e}=await r(async()=>{const{MediaEngine:t}=await import("./MediaEngine.js?v="+Date.now());return{MediaEngine:t}},[]);alert("InstructorController: MediaEngine imported"),await l.setMode("live",{isLive:!0}),alert("InstructorController: TeachingMode set"),e.startLiveWebRTC(this.engine.courseId)}catch(e){throw alert("InstructorController error: "+e.message),e}}async stopAgoraLive(){const{MediaEngine:e}=await r(async()=>{const{MediaEngine:t}=await import("./MediaEngine.js?v="+Date.now());return{MediaEngine:t}},[]);await l.setMode("video",{isLive:!1}),e.stopLiveWebRTC(this.engine.courseId)}async toggleAgoraMic(){const{MediaEngine:e}=await r(async()=>{const{MediaEngine:s}=await import("./MediaEngine.js?v="+Date.now());return{MediaEngine:s}},[]),t=e.toggleMic();document.getElementById("btn-agora-mic").innerHTML=t?'<i class="fas fa-microphone-slash"></i> تم الكتم':'<i class="fas fa-microphone"></i> كتم المايك'}async switchAgoraCamera(){const{MediaEngine:e}=await r(async()=>{const{MediaEngine:t}=await import("./MediaEngine.js?v="+Date.now());return{MediaEngine:t}},[]);e.switchCamera()}async setTeachingMode(e,t={}){await l.setMode(e,t),e==="slides"&&this.loadSlidesGallery()}async loadSlidesGallery(){try{const e=(await window.firebase.firestore().collection("courses").doc(this.engine.courseId).get()).data()||{};this.courseSlides=e.slidesGallery||[],this.renderSlidesGallery()}catch{}}renderSlidesGallery(){const e=document.getElementById("inst-slides-gallery");e&&(e.innerHTML="",this.selectedSlides=[],this.courseSlides.forEach((t,s)=>{const i=document.createElement("img");i.src=t,i.style.width="100%",i.style.height="60px",i.style.objectFit="cover",i.style.borderRadius="4px",i.style.cursor="pointer",i.style.border="2px solid transparent",i.onclick=()=>{if(this.selectedSlides.includes(t))this.selectedSlides=this.selectedSlides.filter(a=>a!==t),i.style.borderColor="transparent";else{const a=document.getElementById("inst-slides-layout"),n=a?a.value:"slides-layout-1";let o=1;if(n==="slides-layout-2"?o=2:n==="slides-layout-3"?o=3:n==="slides-layout-4"?o=4:n==="slides-layout-5"&&(o=5),this.selectedSlides.length>=o){const c=this.selectedSlides.shift();e.querySelectorAll("img").forEach(d=>{d.src===c&&(d.style.borderColor="transparent")})}this.selectedSlides.push(t),i.style.borderColor="#34d399"}},e.appendChild(i)}))}async uploadSlides(e){const t=Array.from(e.target.files);if(t.length)try{const s=t.map(a=>u.uploadMedia(a,`courses/${this.engine.courseId}/slides`)),i=await Promise.all(s);await window.firebase.firestore().collection("courses").doc(this.engine.courseId).update({slidesGallery:window.firebase.firestore.FieldValue.arrayUnion(...i)}),await this.loadSlidesGallery(),alert("تم رفع الصور بنجاح.")}catch(s){alert("فشل رفع الصور: "+s.message)}}handleSlideLayoutChange(e){const t=e.target.value;let s=1;if(t==="slides-layout-2"?s=2:t==="slides-layout-3"?s=3:t==="slides-layout-4"?s=4:t==="slides-layout-5"&&(s=5),this.selectedSlides&&this.selectedSlides.length>s){const i=this.selectedSlides.length-s,a=this.selectedSlides.splice(0,i),n=document.getElementById("inst-slides-gallery");n&&n.querySelectorAll("img").forEach(o=>{a.includes(o.src)&&(o.style.borderColor="transparent")})}}async presentSelectedSlides(){if(!this.selectedSlides||this.selectedSlides.length===0){alert("يرجى اختيار صورة واحدة على الأقل للعرض.");return}const e=document.getElementById("inst-slides-layout"),t=e?e.value:"slides-layout-1";await l.setMode("slides",{slides:this.selectedSlides,layout:t,audioStream:this.isSlidesAudioActive||!1})}async startSlidesAudio(){const{MediaEngine:e}=await r(async()=>{const{MediaEngine:t}=await import("./MediaEngine-XD-W0H6B.js");return{MediaEngine:t}},__vite__mapDeps([4,5,1,6,7,8,9,2,3,10,0,11]));this.isSlidesAudioActive=!0,document.getElementById("btn-slides-mic-start").style.display="none",document.getElementById("btn-slides-mic-stop").style.display="block",await l.setMode("slides",{slides:this.selectedSlides||[],layout:document.getElementById("inst-slides-layout")?.value||"slides-layout-1",audioStream:!0}),e.startAudioOnlyWebRTC(this.engine.courseId)}async stopSlidesAudio(){const{MediaEngine:e}=await r(async()=>{const{MediaEngine:t}=await import("./MediaEngine-XD-W0H6B.js");return{MediaEngine:t}},__vite__mapDeps([4,5,1,6,7,8,9,2,3,10,0,11]));this.isSlidesAudioActive=!1,document.getElementById("btn-slides-mic-start").style.display="block",document.getElementById("btn-slides-mic-stop").style.display="none",await l.setMode("slides",{slides:this.selectedSlides||[],layout:document.getElementById("inst-slides-layout")?.value||"slides-layout-1",audioStream:!1}),e.stopLiveWebRTC(this.engine.courseId)}async startAudioOnly(){const{MediaEngine:e}=await r(async()=>{const{MediaEngine:t}=await import("./MediaEngine-XD-W0H6B.js");return{MediaEngine:t}},__vite__mapDeps([4,5,1,6,7,8,9,2,3,10,0,11]));this.isAudioOnlyActive=!0,document.getElementById("btn-audio-start").style.display="none",document.getElementById("btn-audio-stop").style.display="block",await l.setMode("audio",{audioStream:!0}),e.startAudioOnlyWebRTC(this.engine.courseId)}async stopAudioOnly(){const{MediaEngine:e}=await r(async()=>{const{MediaEngine:t}=await import("./MediaEngine-XD-W0H6B.js");return{MediaEngine:t}},__vite__mapDeps([4,5,1,6,7,8,9,2,3,10,0,11]));this.isAudioOnlyActive=!1,document.getElementById("btn-audio-start").style.display="block",document.getElementById("btn-audio-stop").style.display="none",await l.setMode("audio",{audioStream:!1}),e.stopLiveWebRTC(this.engine.courseId)}async sendChannelMessage(){const e=document.getElementById("inst-channel-text");if(!e||!e.value.trim())return;const t=e.value.trim();e.value="";const s={type:"text",content:t,timestamp:Date.now()};try{const{InstructorService:i}=await r(async()=>{const{InstructorService:a}=await import("./InstructorService-D2IX2nYy.js");return{InstructorService:a}},[]);await i.addChannelMessage(this.engine.courseId,s),await l.setMode("channel",{lastMessage:s})}catch{}}async sendChannelImage(e){const t=e.target.files[0];if(t){e.target.value="";try{const{InstructorService:s}=await r(async()=>{const{InstructorService:a}=await import("./InstructorService-D2IX2nYy.js");return{InstructorService:a}},[]),i={type:"image",content:await s.uploadMedia(t,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await s.addChannelMessage(this.engine.courseId,i),await l.setMode("channel",{lastMessage:i})}catch(s){alert("فشل رفع الصورة: "+s.message)}}}async sendChannelVideo(e){const t=e.target.files[0];if(t){e.target.value="";try{const{InstructorService:s}=await r(async()=>{const{InstructorService:a}=await import("./InstructorService-D2IX2nYy.js");return{InstructorService:a}},[]),i={type:"video",content:await s.uploadMedia(t,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await s.addChannelMessage(this.engine.courseId,i),await l.setMode("channel",{lastMessage:i})}catch(s){alert("فشل رفع الفيديو: "+s.message)}}}async toggleChannelVoice(){const e=document.getElementById("btn-channel-voice");if(this.isRecordingVoice)this.mediaRecorder.stop(),this.isRecordingVoice=!1,e.innerHTML='<i class="fas fa-microphone"></i> تسجيل صوتي',e.classList.replace("btn-danger","btn-dark"),this.audioStream&&(this.audioStream.getTracks().forEach(t=>t.stop()),this.audioStream=null);else try{this.audioStream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.mediaRecorder=new MediaRecorder(this.audioStream),this.audioChunks=[],this.mediaRecorder.ondataavailable=t=>{t.data.size>0&&this.audioChunks.push(t.data)},this.mediaRecorder.onstop=async()=>{const t=new Blob(this.audioChunks,{type:"audio/webm"}),s=new File([t],`audio_${Date.now()}.webm`,{type:"audio/webm"});try{const{InstructorService:i}=await r(async()=>{const{InstructorService:n}=await import("./InstructorService-D2IX2nYy.js");return{InstructorService:n}},[]),a={type:"audio",content:await i.uploadMedia(s,`courses/${this.engine.courseId}/channel`),timestamp:Date.now()};await i.addChannelMessage(this.engine.courseId,a),await l.setMode("channel",{lastMessage:a})}catch(i){alert("فشل رفع المقطع الصوتي: "+i.message)}},this.mediaRecorder.start(),this.isRecordingVoice=!0,e.innerHTML='<i class="fas fa-stop-circle"></i> إيقاف التسجيل',e.classList.replace("btn-dark","btn-danger")}catch{alert("لم نتمكن من الوصول إلى الميكروفون. يرجى التأكد من منح الصلاحيات.")}}},S=new M;export{S as InstructorController,p as n,u as t};
