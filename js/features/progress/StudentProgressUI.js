/**
 * StudentProgressUI.js
 * Renders the "My Progress" dashboard for students natively.
 */

import { ProgressController } from './ProgressController.js';
import { ChartsAdapter } from '../analytics/ChartsAdapter.js';
import { ReportGenerator } from '../analytics/ReportGenerator.js';

export class StudentProgressUIClass {
    constructor() {
        this.engine = null;
    }

    async init(engine) {
        this.engine = engine;
        this.injectTab();
    }

    injectTab() {
        const tabBar = document.getElementById('student-tabs');
        if (!tabBar) return;

        const tabBtn = document.createElement('button');
        tabBtn.className = 'tab-btn';
        tabBtn.dataset.target = 'tab-content-progress';
        tabBtn.innerHTML = '<i class="fas fa-chart-line"></i> تقدمي';
        tabBar.appendChild(tabBtn);

        const tabContent = document.createElement('div');
        tabContent.id = 'tab-content-progress';
        tabContent.className = 'tab-content';
        document.getElementById('student-dashboard')?.appendChild(tabContent);

        tabBtn.addEventListener('click', () => {
            // Manage active classes (assuming standard tab logic)
            document.querySelectorAll('#student-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            tabBtn.classList.add('active');
            tabContent.classList.add('active');

            this.renderDashboard(tabContent);
        });
    }

    async renderDashboard(container) {
        container.innerHTML = '<div style="text-align:center; padding: 2rem;"><i class="fas fa-spinner fa-spin fa-2x"></i> جاري جلب الإحصائيات...</div>';
        
        try {
            const data = await ProgressController.fetchStudentDashboardData(this.engine.currentUser.uid);
            
            container.innerHTML = `
                <div style="padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2 style="margin:0;"><i class="fas fa-trophy" style="color:var(--accent)"></i> لوحة تقدمي</h2>
                        <button class="btn btn-primary" id="btn-download-progress"><i class="fas fa-download"></i> تقرير</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--accent); font-size: 2rem;">${data.completionPercentage}%</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">نسبة الإنجاز</p>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--accent); font-size: 2rem;">${data.attendanceMinutes}</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">دقائق الحضور</p>
                        </div>
                        <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h3 style="margin: 0; color: var(--accent); font-size: 2rem;">${data.calculatedScore}</h3>
                            <p style="margin: 0.5rem 0 0 0; color: #888;">نقاط التفاعل</p>
                        </div>
                    </div>

                    <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                        <h3 style="margin-top:0;">نشاطاتي الأخيرة</h3>
                        <canvas id="student-activity-chart" width="400" height="200" style="width: 100%; max-width: 100%;"></canvas>
                    </div>
                </div>
            `;

            document.getElementById('btn-download-progress').addEventListener('click', () => {
                ReportGenerator.generateStudentReport([
                    [data.completedLessons.length, data.completionPercentage, data.attendanceMinutes, data.downloadedResources, data.calculatedScore]
                ]);
            });

            // Native Canvas Rendering
            setTimeout(() => {
                ChartsAdapter.renderBarChart('student-activity-chart', [10, 20, 15, 30, data.attendanceMinutes % 50], ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], '#3498db');
            }, 100);

        } catch (error) {
            container.innerHTML = '<div style="color:var(--danger); padding: 1rem;">حدث خطأ أثناء تحميل البيانات</div>';
            console.error(error);
        }
    }
}
export const StudentProgressUI = new StudentProgressUIClass();
