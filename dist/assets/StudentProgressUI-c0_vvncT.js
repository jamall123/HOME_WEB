import{t as n}from"./ProgressController-4Uacnm3Z.js";import{n as s,t as i}from"./ReportGenerator-DGWhhGX1.js";var d=class{constructor(){this.engine=null}async init(t){this.engine=t,this.injectTab()}injectTab(){const t=document.getElementById("student-tabs");if(!t)return;const e=document.createElement("button");e.className="tab-btn",e.dataset.target="tab-content-progress",e.innerHTML='<i class="fas fa-chart-line"></i> تقدمي',t.appendChild(e);const a=document.createElement("div");a.id="tab-content-progress",a.className="tab-content",document.getElementById("student-dashboard")?.appendChild(a),e.addEventListener("click",()=>{document.querySelectorAll("#student-tabs .tab-btn").forEach(r=>r.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(r=>r.classList.remove("active")),e.classList.add("active"),a.classList.add("active"),this.renderDashboard(a)})}async renderDashboard(t){t.innerHTML='<div style="text-align:center; padding: 2rem;"><i class="fas fa-spinner fa-spin fa-2x"></i> جاري جلب الإحصائيات...</div>';try{const e=await n.fetchStudentDashboardData(this.engine.currentUser.uid);t.innerHTML=`
                <div style="padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2 style="margin:0;"><i class="fas fa-trophy" style="color:var(--accent)"></i> لوحة تقدمي</h2>
                        <button class="btn btn-primary" id="btn-download-progress"><i class="fas fa-download"></i> تقرير</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--accent); font-size: 2rem;">${e.completionPercentage}%</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">نسبة الإنجاز</p>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--accent); font-size: 2rem;">${e.attendanceMinutes}</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">دقائق الحضور</p>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--accent); font-size: 2rem;">${e.calculatedScore}</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">نقاط التفاعل</p>
                        </div>
                    </div>

                    <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                        <h3 style="margin-top:0;">نشاطاتي الأخيرة</h3>
                        <canvas id="student-activity-chart" width="400" height="200" style="width: 100%; max-width: 100%;"></canvas>
                    </div>
                </div>
            `,document.getElementById("btn-download-progress").addEventListener("click",()=>{i.generateStudentReport([[e.completedLessons.length,e.completionPercentage,e.attendanceMinutes,e.downloadedResources,e.calculatedScore]])}),setTimeout(()=>{s.renderBarChart("student-activity-chart",[10,20,15,30,e.attendanceMinutes%50],["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس"],"#3498db")},100)}catch(e){t.innerHTML='<div style="color:var(--danger); padding: 1rem;">حدث خطأ أثناء تحميل البيانات</div>',console.error(e)}}},l=new d;export{l as StudentProgressUI};
