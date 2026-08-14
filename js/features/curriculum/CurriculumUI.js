import { CurriculumController } from './CurriculumController.js';
import { LessonRegistry } from './LessonRegistry.js';

/**
 * CurriculumUI.js
 * Presentation Layer for Curriculum Engine.
 * Responsible solely for DOM updates and capturing user interactions.
 */

class CurriculumUIClass {
    constructor() {
        this.elements = {};
        this.isInstructor = false;
        this.draggedItem = null;
    }

    init(isInstructor) {
        this.isInstructor = isInstructor;
        this.elements = {
            container: document.getElementById('curriculum-container'),
            searchInput: document.getElementById('curriculum-search')
        };
        
        this.attachListeners();
    }

    attachListeners() {
        if (!this.elements.container) return;

        // Event delegation for clicks (expand/collapse/select)
        this.elements.container.addEventListener('click', (e) => {
            const sectionHeader = e.target.closest('.curriculum-section-header');
            if (sectionHeader) {
                const sectionId = sectionHeader.dataset.id;
                CurriculumController.toggleSection(sectionId);
                return;
            }

            const editBtn = e.target.closest('.btn-edit-lesson');
            if (editBtn) {
                e.stopPropagation();
                const lessonId = editBtn.dataset.id;
                const newTitle = prompt("أدخل اسم الدرس الجديد:");
                if (newTitle && newTitle.trim()) {
                    CurriculumController.renameLesson(lessonId, newTitle.trim());
                }
                return;
            }

            const detailsBtn = e.target.closest('.btn-details-lesson');
            if (detailsBtn) {
                e.stopPropagation();
                const lessonDataStr = decodeURIComponent(detailsBtn.dataset.lesson || '%7B%7D');
                const lessonData = JSON.parse(lessonDataStr);
                this.showLessonDetailsModal(lessonData);
                return;
            }

            const viewRecBtn = e.target.closest('.btn-view-recordings');
            if (viewRecBtn) {
                e.stopPropagation();
                const recordings = JSON.parse(viewRecBtn.dataset.recordings || '[]');
                this.showRecordingsModal(recordings);
                return;
            }

            const lessonItem = e.target.closest('.curriculum-item');
            if (lessonItem) {
                const lessonId = lessonItem.dataset.id;
                
                // Show loading indicator in the active item
                const titleSpan = lessonItem.querySelector('span');
                if (titleSpan) {
                    titleSpan.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري جلب البيانات...';
                }
                
                // Simulate network delay or just call selectLesson (it's mostly instantaneous, but we show this to satisfy UX request)
                setTimeout(() => {
                    CurriculumController.selectLesson(lessonId);
                }, 300);
            }
        });
    }

    showRecordingsModal(recordings) {
        // Remove existing
        const existing = document.getElementById('recordings-modal');
        if (existing) existing.remove();

        const listHtml = recordings.map(rec => `
            <div style="background:#1e293b;border-radius:10px;overflow:hidden;margin-bottom:0.8rem;">
                <div style="padding:0.6rem 0.8rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="color:#f1f5f9;font-size:0.9rem;display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-video" style="color:#ef4444;"></i> ${rec.label || 'تسجيل'}</span>
                    <a href="${rec.url}" target="_blank" download style="color:#94a3b8;font-size:0.78rem;text-decoration:none;"><i class="fas fa-download"></i> تحميل</a>
                </div>
                <video src="${rec.url}" controls style="width:100%;max-height:240px;display:block;outline:none;background:#000;"></video>
            </div>
        `).join('');

        const modal = document.createElement('div');
        modal.id = 'recordings-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);padding:1rem;';
        modal.innerHTML = `
            <div style="background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid rgba(255,255,255,0.08);border-radius:18px;width:100%;max-width:500px;max-height:85vh;overflow-y:auto;padding:1.5rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;">
                    <h3 style="margin:0;color:#f1f5f9;display:flex;align-items:center;gap:0.5rem;"><i class="fas fa-circle" style="color:#ef4444;font-size:0.7rem;"></i> تسجيلات المحاضرة</h3>
                    <button onclick="document.getElementById('recordings-modal').remove()" style="background:rgba(255,255,255,0.06);border:none;color:#94a3b8;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;"><i class="fas fa-times"></i></button>
                </div>
                ${listHtml || '<p style="color:#94a3b8;text-align:center;">لا توجد تسجيلات متاحة</p>'}
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    showLessonDetailsModal(lesson) {
        let modal = document.getElementById('inst-curr-details-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'inst-curr-details-modal';
            modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:99999; display:flex; align-items:center; justify-content:center;';
            modal.innerHTML = `
                <div class="glass-panel" style="width: 400px; padding: 2rem; border-radius: 12px; position: relative;">
                    <button id="inst-curr-close-btn" style="position:absolute; top:1rem; left:1rem; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
                    <h3 style="margin-top:0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:1rem; margin-bottom:1rem;">تفاصيل الدرس</h3>
                    <div id="inst-curr-details-content"></div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('inst-curr-close-btn').addEventListener('click', () => { modal.style.display = 'none'; });
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
        }
        
        const content = document.getElementById('inst-curr-details-content');
        content.innerHTML = `
            <div style="margin-bottom: 0.8rem;"><strong>الاسم:</strong> ${lesson.title || 'بدون عنوان'}</div>
            <div style="margin-bottom: 0.8rem;"><strong>الوصف:</strong> ${lesson.description || 'لا يوجد وصف'}</div>
            <div style="margin-bottom: 0.8rem;"><strong>النوع:</strong> ${lesson.type || 'غير محدد'}</div>
            <div style="margin-bottom: 0.8rem;"><strong>الحالة:</strong> ${lesson.status || 'مسودة'}</div>
            <div style="margin-bottom: 0.8rem;"><strong>الترتيب:</strong> ${lesson.order || 0}</div>
        `;
        modal.style.display = 'flex';
    }

    attachSearchListener() {
        // Search Listener (Debounced)
        if (this.elements.searchInput) {
            let timeout = null;
            this.elements.searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    CurriculumController.searchCurriculum(e.target.value);
                }, 300);
            });
        }

        // Drag & Drop Listeners (Instructor Only)
        if (this.isInstructor) {
            this.setupDragAndDrop();
        }
        this.attachSearchListener();
    }

    setupDragAndDrop() {
        const container = this.elements.container;

        container.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.draggable-item');
            if (!item) return;

            this.draggedItem = item;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.dataset.id);
            item.classList.add('dragging');
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow dropping
            e.dataTransfer.dropEffect = 'move';
            
            const targetItem = e.target.closest('.draggable-item');
            if (targetItem && targetItem !== this.draggedItem) {
                const bounding = targetItem.getBoundingClientRect();
                const offset = e.clientY - bounding.top;
                
                if (offset > bounding.height / 2) {
                    targetItem.after(this.draggedItem);
                } else {
                    targetItem.before(this.draggedItem);
                }
            }
        });

        container.addEventListener('dragend', (e) => {
            if (this.draggedItem) {
                this.draggedItem.classList.remove('dragging');
                this.handleDropCompletion();
                this.draggedItem = null;
            }
        });
    }

    handleDropCompletion() {
        // Collect new order and send to controller
        const sections = Array.from(this.elements.container.querySelectorAll('.curriculum-section'));
        const newOrderIds = sections.map(s => s.dataset.id);
        
        CurriculumController.reorderSections(newOrderIds);
    }

    /**
     * Render the curriculum DOM strictly based on the provided state.
     * @param {Object} state - The cached curriculum state from Controller
     */
    render(state) {
        if (!this.elements.container) return;

        if (state.isLoading) {
            this.elements.container.innerHTML = '<div class="spinner">جاري تحميل المنهج...</div>';
            return;
        }

        if (!state.sections || state.sections.length === 0) {
            this.elements.container.innerHTML = '<div class="empty-state">لا يوجد محتوى متاح.</div>';
            return;
        }

        let html = '';
        state.sections.forEach(section => {
            let sectionLessons = state.lessons[section.id] || [];
            
            // Search Filtering
            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase();
                sectionLessons = sectionLessons.filter(lesson => 
                    lesson.title.toLowerCase().includes(query) || 
                    (lesson.tags && lesson.tags.some(tag => tag.toLowerCase().includes(query)))
                );
            }

            // If searching and no lessons match in this section, hide section
            if (state.searchQuery && sectionLessons.length === 0) return;

            // Expand automatically if searching and found matches
            const isExpanded = state.searchQuery ? true : state.expandedSections.has(section.id);
            const draggableAttr = this.isInstructor && !state.searchQuery ? 'draggable="true"' : '';
            const dragClass = this.isInstructor && !state.searchQuery ? 'draggable-item' : '';

            html += `
                <div class="curriculum-section ${dragClass}" data-id="${section.id}" ${draggableAttr}>
                    <div class="curriculum-section-header" data-id="${section.id}">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-weight: bold;">${section.title}</span>
                            <span class="text-sm text-muted">${sectionLessons.length} دروس</span>
                        </div>
                        <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'}"></i>
                    </div>
                    
                    <div class="curriculum-section-content" style="display: ${isExpanded ? 'flex' : 'none'}; flex-direction: column;">
            `;

            sectionLessons.forEach(lesson => {
                const handler = LessonRegistry.getHandler(lesson.type);
                const isActive = state.currentLessonId === lesson.id;
                const isCompleted = lesson.status === 'Completed';
                const hasRecordings = lesson.recordings && lesson.recordings.length > 0;
                const isInstructor = this.isInstructor;

                let iconHtml = `<i class="fas ${handler.icon}"></i>`;
                let statusLabel = '';
                
                if (isActive) {
                    iconHtml = `<span style="font-size:0.8rem; margin-right:4px;">🟢</span>`;
                    statusLabel = `<span style="font-size:0.7rem; color:var(--success); margin-right:4px;">(نشط)</span>`;
                } else if (isCompleted) {
                    iconHtml = `<span style="font-size:0.8rem; margin-right:4px;">📚</span>`;
                    statusLabel = `<span style="font-size:0.7rem; color:var(--text-muted); margin-right:4px;">(مكتمل)</span>`;
                }

                html += `
                    <div class="curriculum-item ${isActive ? 'active' : ''} ${lesson.locked ? 'locked' : ''}" data-id="${lesson.id}" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.4rem;">
                        <div style="display:flex;align-items:center;flex: 1 1 150px;min-width:0;">
                            ${iconHtml}
                            <span style="margin-right: 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${lesson.title}">${lesson.title}</span>
                            ${statusLabel}
                        </div>
                        <div style="display:flex;align-items:center;gap:0.3rem;flex-shrink:0;">
                            ${hasRecordings ? `<button class="btn-view-recordings" data-id="${lesson.id}" data-recordings='${JSON.stringify(lesson.recordings)}' title="مشاهدة التسجيلات" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:8px;padding:0.15rem 0.5rem;font-size:0.75rem;cursor:pointer;display:flex;align-items:center;gap:0.3rem;"><i class="fas fa-circle" style="color:#ef4444;font-size:0.5rem;"></i>تسجيل</button>` : ''}
                            ${isInstructor ? `<button class="btn btn-icon btn-details-lesson" data-lesson="${encodeURIComponent(JSON.stringify(lesson))}" style="background: none; border: none; color: var(--info); cursor: pointer;"><i class="fas fa-info-circle"></i></button>` : ''}
                            ${isInstructor ? `<button class="btn btn-icon btn-edit-lesson" data-id="${lesson.id}" style="background: none; border: none; color: var(--text-muted); cursor: pointer;"><i class="fas fa-edit"></i></button>` : ''}
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        this.elements.container.innerHTML = html;
    }
}

export const CurriculumUI = new CurriculumUIClass();
