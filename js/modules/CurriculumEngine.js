/**
 * CurriculumEngine.js
 * Handles the rendering and state of the expandable curriculum/syllabus in the course room sidebar.
 * Features: Expandable sections, lesson metadata, progress indicators, state tracking.
 */

import { EventBus, Events } from './EventBus.js';
import { StateStore } from './StateStore.js';
import { jhomeDb } from './FirebaseAdapter.js';
import { PermissionEngine } from './PermissionEngine.js';

export const CurriculumEngine = {
    containerSelector: '.room-sidebar-content',

    async init(courseId) {
        if (!courseId) return;

        this.courseId = courseId;
        this.container = document.querySelector(this.containerSelector);
        
        if (!this.container) {
            console.error("Curriculum container not found.");
            return;
        }

        // Restore last opened section from local storage
        this.expandedSections = JSON.parse(localStorage.getItem(`jhome_curriculum_state_${courseId}`) || '[]');

        EventBus.subscribe(Events.ROOM_ENTERED, () => {
            this.loadCurriculum();
        });
    },

    async loadCurriculum() {
        this.container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top:1rem;">جاري تحميل المنهج...</p></div>';

        try {
            // For now, assume lectures are stored flat with a 'section' property, or in an array.
            // The existing architecture stored them in a sub-collection 'lectures'
            const snapshot = await jhomeDb.collection('courses').doc(this.courseId).collection('lectures').orderBy('order', 'asc').get();
            
            if (snapshot.empty) {
                this.container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">لا توجد محاضرات في هذا المنهج حالياً.</div>';
                return;
            }

            const lectures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Group by section
            this.sections = this.groupBySection(lectures);
            
            // Get student progress
            const isInstructor = await PermissionEngine.canBroadcast(this.courseId);
            this.progressData = isInstructor ? {} : await this.getStudentProgress();

            this.render();

        } catch (error) {
            console.error("Error loading curriculum:", error);
            this.container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #EF4444;">حدث خطأ أثناء تحميل المنهج.</div>';
        }
    },

    groupBySection(lectures) {
        const sectionsMap = {};
        lectures.forEach((lec, index) => {
            const secName = lec.section || "المقدمة"; // Default section if none
            if (!sectionsMap[secName]) {
                sectionsMap[secName] = [];
            }
            // Add internal numbering
            lec.globalIndex = index + 1;
            sectionsMap[secName].push(lec);
        });

        // Convert to array preserving order
        return Object.keys(sectionsMap).map(name => ({
            name,
            lectures: sectionsMap[name]
        }));
    },

    async getStudentProgress() {
        // Mock progress retrieval. In a real scenario, this fetches from the enrollments document
        // Or a dedicated progress collection.
        return {};
    },

    toggleSection(sectionName) {
        const index = this.expandedSections.indexOf(sectionName);
        if (index > -1) {
            this.expandedSections.splice(index, 1);
        } else {
            this.expandedSections.push(sectionName);
        }
        
        // Persist state
        localStorage.setItem(`jhome_curriculum_state_${this.courseId}`, JSON.stringify(this.expandedSections));
        
        this.render();
    },

    render() {
        if (!this.sections || this.sections.length === 0) return;

        let html = '<div class="curriculum-wrapper" style="display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem;">';
        
        this.sections.forEach((section, index) => {
            const isExpanded = this.expandedSections.includes(section.name);
            const totalLectures = section.lectures.length;
            
            // Calculate section duration (mock implementation: sum of lecture durations if available)
            const sectionDuration = section.lectures.reduce((acc, lec) => acc + (lec.durationMin || 0), 0);
            const durationText = sectionDuration > 0 ? `<span style="font-size: 0.75rem; color: var(--text-muted);"><i class="far fa-clock"></i> ${sectionDuration} دقيقة</span>` : '';

            html += `
                <div class="curriculum-section" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: var(--radius-md); overflow: hidden;">
                    
                    <!-- Section Header -->
                    <div class="section-header" 
                         style="padding: 1rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: rgba(255,255,255,0.02); transition: background 0.2s;"
                         onclick="window.CurriculumEngine_toggleSection('${section.name.replace(/'/g, "\\'")}')">
                        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                            <h4 style="margin: 0; font-size: 0.95rem; color: #E2E8F0;">${section.name}</h4>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${totalLectures} دروس</span>
                                ${durationText}
                            </div>
                        </div>
                        <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'}" style="color: var(--text-muted); transition: transform 0.3s;"></i>
                    </div>

                    <!-- Section Content -->
                    <div class="section-content" style="display: ${isExpanded ? 'block' : 'none'}; border-top: 1px solid rgba(255,255,255,0.05);">
                        <ul style="list-style: none; padding: 0; margin: 0;">
            `;

            section.lectures.forEach(lec => {
                // Determine status (Completed, Current, Locked)
                let statusIcon = '<i class="far fa-circle" style="color: var(--text-muted);"></i>';
                let statusColor = "var(--text-secondary)";
                let bgStyle = "transparent";

                const progress = this.progressData[lec.id];
                if (progress === 'completed') {
                    statusIcon = '<i class="fas fa-check-circle" style="color: #10B981;"></i>';
                    statusColor = "#10B981";
                } else if (progress === 'current') {
                    statusIcon = '<i class="fas fa-play-circle" style="color: var(--primary-color);"></i>';
                    statusColor = "#fff";
                    bgStyle = "rgba(79, 70, 229, 0.1)";
                } else if (lec.isLocked) {
                    statusIcon = '<i class="fas fa-lock" style="color: #EF4444;"></i>';
                    statusColor = "var(--text-muted)";
                }

                html += `
                    <li style="padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.02); display: flex; align-items: center; gap: 0.8rem; cursor: pointer; background: ${bgStyle}; transition: background 0.2s;"
                        onmouseover="this.style.background='rgba(255,255,255,0.05)'" 
                        onmouseout="this.style.background='${bgStyle}'"
                        onclick="window.CurriculumEngine_openLesson('${lec.id}')">
                        
                        <!-- Progress Indicator -->
                        <div style="width: 20px; text-align: center;">
                            ${statusIcon}
                        </div>
                        
                        <!-- Lesson Details -->
                        <div style="flex: 1; display: flex; flex-direction: column;">
                            <span style="font-size: 0.9rem; color: ${statusColor}; font-weight: ${progress === 'current' ? '600' : '400'};">
                                <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 4px;">${lec.globalIndex}.</span> ${lec.title}
                            </span>
                            ${lec.durationMin ? `<span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;"><i class="fas fa-play" style="font-size: 0.6rem;"></i> ${lec.durationMin} د.</span>` : ''}
                        </div>
                    </li>
                `;
            });

            html += `
                        </ul>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        this.container.innerHTML = html;
    }
};

// Global Bridges for inline onclick attributes
window.CurriculumEngine_toggleSection = (sectionName) => CurriculumEngine.toggleSection(sectionName);
window.CurriculumEngine_openLesson = (lectureId) => EventBus.emit(Events.PLAY_LECTURE, lectureId);
