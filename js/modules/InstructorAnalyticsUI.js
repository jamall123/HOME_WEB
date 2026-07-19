/**
 * InstructorAnalyticsUI.js
 * Renders the "Analytics Center" dashboard for instructors.
 */

import { ProgressController } from './ProgressController.js';
import { ChartsAdapter } from './ChartsAdapter.js';
import { ReportGenerator } from './ReportGenerator.js';

export class InstructorAnalyticsUIClass {
    constructor() {
        this.engine = null;
    }

    async init(engine) {
        this.engine = engine;
        this.injectTab();
    }

    injectTab() {
        const tabBar = document.getElementById('inst-tabs');
        if (!tabBar) return;

        const tabBtn = document.createElement('button');
        tabBtn.className = 'tab-btn';
        tabBtn.dataset.target = 'tab-content-analytics';
        tabBtn.innerHTML = '<i class="fas fa-chart-pie"></i> مركز الإحصائيات';
        tabBar.appendChild(tabBtn);

        const tabContent = document.createElement('div');
        tabContent.id = 'tab-content-analytics';
        tabContent.className = 'tab-content';
        document.getElementById('instructor-dashboard')?.appendChild(tabContent);

        tabBtn.addEventListener('click', () => {
            document.querySelectorAll('#inst-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            tabBtn.classList.add('active');
            tabContent.classList.add('active');

            this.renderDashboard(tabContent);
        });
    }

    async renderDashboard(container) {
        container.innerHTML = '<div style="text-align:center; padding: 2rem;"><i class="fas fa-spinner fa-spin fa-2x"></i> جاري جلب الإحصائيات...</div>';
        
        try {
            const data = await ProgressController.fetchInstructorDashboardData();
            
            container.innerHTML = `
                <div style="padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2 style="margin:0;"><i class="fas fa-chart-bar" style="color:var(--accent)"></i> أداء الدورة</h2>
                        <button class="btn btn-primary" id="btn-download-course-report"><i class="fas fa-file-excel"></i> تحميل التقرير</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--accent); font-size: 2rem;">${data.activeStudents}</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">الطلاب النشطين</p>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--accent); font-size: 2rem;">${data.averageCompletion}%</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">متوسط الإنجاز</p>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: ${data.healthScore > 70 ? 'var(--accent)' : 'var(--danger)'}; font-size: 2rem;">${data.healthScore}%</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">مؤشر صحة الدورة</p>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--danger); font-size: 2rem;">${data.dropOffRate}%</h3>
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
            `;

            document.getElementById('btn-download-course-report').addEventListener('click', () => {
                ReportGenerator.generateCourseReport([
                    ['Course Wide Data', data.healthScore, data.dropOffRate, data.totalWatchTime]
                ]);
            });

            // Native Canvas Rendering
            setTimeout(() => {
                ChartsAdapter.renderDoughnutChart('course-completion-chart', [data.averageCompletion, 100 - data.averageCompletion], ['#2ecc71', '#e74c3c']);
                ChartsAdapter.renderBarChart('course-resources-chart', [5, 12, 8, 20], ['ملف 1', 'ملف 2', 'ملف 3', 'ملف 4'], '#9b59b6');
            }, 100);

        } catch (error) {
            container.innerHTML = '<div style="color:var(--danger); padding: 1rem;">حدث خطأ أثناء تحميل البيانات</div>';
            console.error(error);
        }
    }
}
export const InstructorAnalyticsUI = new InstructorAnalyticsUIClass();
