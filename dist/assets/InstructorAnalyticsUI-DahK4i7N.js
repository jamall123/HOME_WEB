import{t as i}from"./ProgressController-DoEbpehk.js";import{n,t as s}from"./ReportGenerator-DGWhhGX1.js";var o=class{constructor(){this.engine=null}async init(t){this.engine=t,this.injectTab()}injectTab(){const t=document.getElementById("inst-tabs");if(!t)return;const e=document.createElement("button");e.className="tab-btn",e.dataset.target="tab-content-analytics",e.innerHTML='<i class="fas fa-chart-pie"></i> مركز الإحصائيات',t.appendChild(e);const r=document.createElement("div");r.id="tab-content-analytics",r.className="tab-content",document.getElementById("instructor-dashboard")?.appendChild(r),e.addEventListener("click",()=>{document.querySelectorAll("#inst-tabs .tab-btn").forEach(a=>a.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(a=>a.classList.remove("active")),e.classList.add("active"),r.classList.add("active"),this.renderDashboard(r)})}async renderDashboard(t){t.innerHTML='<div style="text-align:center; padding: 2rem;"><i class="fas fa-spinner fa-spin fa-2x"></i> جاري جلب الإحصائيات...</div>';try{const e=await i.fetchInstructorDashboardData();t.innerHTML=`
                <div style="padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2 style="margin:0;"><i class="fas fa-chart-bar" style="color:var(--accent)"></i> أداء الدورة</h2>
                        <button class="btn btn-primary" id="btn-download-course-report"><i class="fas fa-file-excel"></i> تحميل التقرير</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--accent); font-size: 2rem;">${e.activeStudents}</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">الطلاب النشطين</p>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--accent); font-size: 2rem;">${e.averageCompletion}%</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">متوسط الإنجاز</p>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: ${e.healthScore>70?"var(--accent)":"var(--danger)"}; font-size: 2rem;">${e.healthScore}%</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">مؤشر صحة الدورة</p>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--danger); font-size: 2rem;">${e.dropOffRate}%</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">معدل التسرب</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px;">
                            <h3 style="margin-top:0;">توزيع الإنجاز</h3>
                            <canvas id="course-completion-chart" width="400" height="200" style="width: 100%; max-width: 100%;"></canvas>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px;">
                            <h3 style="margin-top:0;">إحصائيات الملفات (تنزيلات)</h3>
                            <canvas id="course-resources-chart" width="400" height="200" style="width: 100%; max-width: 100%;"></canvas>
                        </div>
                    </div>
                </div>
            `,document.getElementById("btn-download-course-report").addEventListener("click",()=>{s.generateCourseReport([["Course Wide Data",e.healthScore,e.dropOffRate,e.totalWatchTime]])}),setTimeout(()=>{n.renderDoughnutChart("course-completion-chart",[e.averageCompletion,100-e.averageCompletion],["#2ecc71","#e74c3c"]),n.renderBarChart("course-resources-chart",[5,12,8,20],["ملف 1","ملف 2","ملف 3","ملف 4"],"#9b59b6")},100)}catch{t.innerHTML='<div style="color:var(--danger); padding: 1rem;">حدث خطأ أثناء تحميل البيانات</div>'}}},l=new o;export{l as InstructorAnalyticsUI};
