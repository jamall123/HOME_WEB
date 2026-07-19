var c=class{constructor(){this.db=firebase.firestore(),this.storage=firebase.storage()}async updateProfile(t,e){if(!t)throw new Error("No UID provided");await this.db.collection("users").doc(t).set(e,{merge:!0})}uploadMedia(t,e,s=null){return new Promise((n,r)=>{const i=this.storage.ref().child(`${e}/${Date.now()}_${t.name}`).put(t);i.on("state_changed",a=>{s&&s(a.bytesTransferred/a.totalBytes*100)},a=>r(a),async()=>{n(await i.snapshot.ref.getDownloadURL())})})}async updateTeachingMode(t,e){const s={...e,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};await this.db.collection("active_sessions").doc(t).set(s,{merge:!0})}async updateClassroomState(t,e){await this.db.collection("active_sessions").doc(t).set({permissions:e,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:!0})}async getResources(t){return(await this.db.collection("lessonResources").where("courseId","==",t).get()).docs.map(e=>({id:e.id,...e.data()}))}async postAnnouncement(t,e){await this.db.collection("lessonAnnouncements").add({courseId:t,...e,timestamp:firebase.firestore.FieldValue.serverTimestamp()})}},o=new c,d=class{init(t){this.controller=t,this.cacheDOM(),this.renderDashboardLayout(),this.attachListeners()}cacheDOM(){this.mountPoint=document.getElementById("instructor-dashboard-mount"),this.tabBtn=document.getElementById("tab-btn-instructor")}renderDashboardLayout(){this.mountPoint&&(this.tabBtn&&(this.tabBtn.style.display="block"),this.mountPoint.innerHTML=`
            <div class="instructor-workspace" style="display: flex; flex-direction: column; gap: 1rem;">
                <!-- Internal Navigation for Instructor Tools -->
                <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <button class="btn btn-sm btn-primary inst-nav" data-view="dashboard"><i class="fas fa-chart-pie"></i> لوحة القيادة</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="teaching"><i class="fas fa-chalkboard-teacher"></i> التدريس</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="students"><i class="fas fa-users"></i> الطلاب</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="resources"><i class="fas fa-folder-open"></i> الموارد</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="classroom"><i class="fas fa-cogs"></i> إدارة الغرفة</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="profile"><i class="fas fa-user-tie"></i> الملف الشخصي</button>
                </div>

                <!-- Content Area -->
                <div id="inst-view-dashboard" class="inst-view" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <!-- Realtime stats injected by InstructorAnalytics -->
                    <div class="stat-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--text-secondary);">متصل الآن</h4>
                        <span id="inst-stat-online" style="font-size: 1.5rem; font-weight: bold; color: var(--success);">0</span>
                    </div>
                </div>

                <div id="inst-view-teaching" class="inst-view" style="display: none;">
                    <h3>أوضاع التدريس</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <button class="btn btn-dark" onclick="window.InstructorAPI.setMode('video')"><i class="fas fa-video"></i> فيديو مباشر</button>
                        <button class="btn btn-dark" onclick="window.InstructorAPI.setMode('slides')"><i class="fas fa-images"></i> شرائح عرض</button>
                        <button class="btn btn-dark" onclick="window.InstructorAPI.setMode('audio_only')"><i class="fas fa-podcast"></i> صوت فقط</button>
                        <button class="btn btn-dark" onclick="window.InstructorAPI.setMode('channel')"><i class="fas fa-bullhorn"></i> نمط القناة</button>
                    </div>
                </div>

                <div id="inst-view-students" class="inst-view" style="display: none;">
                    <h3>إدارة الطلاب</h3>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem;">
                        <table style="width: 100%; text-align: right; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <th style="padding: 0.5rem;">الاسم</th>
                                    <th style="padding: 0.5rem;">الحالة</th>
                                    <th style="padding: 0.5rem;">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="instructor-student-list">
                                <!-- Populated by StudentManager -->
                                <tr><td colspan="3" style="text-align: center; padding: 1rem;">جاري التحميل...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="inst-view-resources" class="inst-view" style="display: none;">
                    <h3>إدارة الموارد</h3>
                    <!-- Resource upload form -->
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <input type="file" id="inst-new-resource-file" class="form-input" style="flex: 1;">
                        <button class="btn btn-primary"><i class="fas fa-upload"></i> رفع</button>
                    </div>
                    <div id="inst-resource-list"></div>
                </div>

                <div id="inst-view-classroom" class="inst-view" style="display: none;">
                    <h3>إدارة الغرفة</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="stat-card" style="padding: 1rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fas fa-comment-slash"></i> إغلاق الدردشة</span>
                            <label class="switch"><input type="checkbox" id="inst-toggle-chat"><span class="slider"></span></label>
                        </div>
                        <div class="stat-card" style="padding: 1rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fas fa-lock"></i> إغلاق الموارد</span>
                            <label class="switch"><input type="checkbox" id="inst-toggle-resources"><span class="slider"></span></label>
                        </div>
                    </div>
                </div>

                <div id="inst-view-profile" class="inst-view" style="display: none;">
                    <h3>الملف الشخصي (عام)</h3>
                    <form id="inst-profile-form" style="display: grid; gap: 1rem;">
                        <input type="text" id="inst-prof-name" class="form-input" placeholder="الاسم الكامل">
                        <input type="text" id="inst-prof-spec" class="form-input" placeholder="التخصص الدقيق">
                        <textarea id="inst-prof-bio" class="form-input" placeholder="نبذة تعريفية" rows="3"></textarea>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <label style="flex: 1;">صورة شخصية: <input type="file" class="form-input" accept="image/*"></label>
                            <label style="flex: 1;">السيرة الذاتية (CV): <input type="file" class="form-input" accept=".pdf"></label>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;"><i class="fas fa-save"></i> حفظ البيانات</button>
                    </form>
                </div>
            </div>
        `)}attachListeners(){if(!this.mountPoint)return;window.InstructorAPI={setMode:e=>this.controller.setTeachingMode(e)};const t=this.mountPoint.querySelectorAll(".inst-nav");t.forEach(e=>{e.addEventListener("click",s=>{const n=s.currentTarget.getAttribute("data-view");t.forEach(i=>{i.classList.remove("btn-primary"),i.classList.add("btn-dark")}),s.currentTarget.classList.remove("btn-dark"),s.currentTarget.classList.add("btn-primary"),this.mountPoint.querySelectorAll(".inst-view").forEach(i=>i.style.display="none");const r=this.mountPoint.querySelector(`#inst-view-${n}`);r&&(r.style.display="block")})})}},u=new d,b=class{init(t){this.controller=t}async setMode(t,e={}){const s={mode:t,metadata:e};await o.updateTeachingMode(this.controller.engine.courseId,s)}},l=new b,p=class{constructor(){this.controller=null}init(t){this.controller=t,this.attachListeners()}attachListeners(){const t=document.getElementById("inst-toggle-chat"),e=document.getElementById("inst-toggle-resources");t&&t.addEventListener("change",async s=>{const n=s.target.checked;await o.updateClassroomState(this.controller.engine.courseId,{chatLocked:n})}),e&&e.addEventListener("change",async s=>{const n=s.target.checked;await o.updateClassroomState(this.controller.engine.courseId,{resourcesLocked:n})})}},h=new p,m=class{constructor(){this.controller=null,this.unsubscribe=null}init(t){this.controller=t,this.startListening()}startListening(){const t=firebase.firestore();this.unsubscribe=t.collection("courses").doc(this.controller.engine.courseId).collection("connected_users").onSnapshot(e=>{const s=document.getElementById("instructor-student-list");if(!s)return;if(e.empty){s.innerHTML='<tr><td colspan="3" style="text-align: center; padding: 1rem;">لا يوجد طلاب متصلين حالياً.</td></tr>';return}const n=document.createDocumentFragment();e.forEach(r=>{const i=r.data(),a=document.createElement("tr");a.style.borderBottom="1px solid rgba(255,255,255,0.05)",a.innerHTML=`
                        <td style="padding: 0.5rem;">
                            <div style="font-weight: bold;">${i.userName||"طالب مجهول"}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${i.device||"غير معروف"}</div>
                        </td>
                        <td style="padding: 0.5rem;">
                            <span style="color: var(--success); font-size: 0.85rem;"><i class="fas fa-circle"></i> متصل</span>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${i.sessionDurationMinutes||0} دقيقة</div>
                        </td>
                        <td style="padding: 0.5rem; display: flex; gap: 0.5rem;">
                            <button class="btn btn-sm btn-dark" title="كتم (Mute)"><i class="fas fa-microphone-slash"></i></button>
                            <button class="btn btn-sm btn-dark" title="إزالة (Kick)" style="color: var(--danger);"><i class="fas fa-sign-out-alt"></i></button>
                        </td>
                    `,n.appendChild(a)}),s.innerHTML="",s.appendChild(n)})}destroy(){this.unsubscribe&&this.unsubscribe()}},f=new m,g=class{init(t){this.controller=t}},y=new g,v=class{constructor(){this.controller=null,this.unsubscribePresence=null,this.onlineCount=0}init(t){this.controller=t,this.startListening()}startListening(){const t=firebase.firestore(),e=this.controller.engine.courseId;this.unsubscribePresence=t.collection("courses").doc(e).collection("connected_users").onSnapshot(s=>{this.onlineCount=s.size,this.updateUI()})}updateUI(){const t=document.getElementById("inst-stat-online");t&&(t.innerText=this.onlineCount)}destroy(){this.unsubscribePresence&&this.unsubscribePresence()}},w=new v,I=class{constructor(){this.engine=null,this.isInitialized=!1}init(t){this.isInitialized||(this.engine=t,this.engine.isInstructor&&(u.init(this),l.init(this),h.init(this),f.init(this),y.init(this),w.init(this),this.isInitialized=!0))}async updateProfile(t){try{await o.updateProfile(this.engine.currentUser.uid,t)}catch(e){throw e}}async setTeachingMode(t,e={}){await l.setMode(t,e)}},x=new I;export{x as InstructorController};
