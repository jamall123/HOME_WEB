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

            const lessonItem = e.target.closest('.curriculum-item');
            if (lessonItem) {
                const lessonId = lessonItem.dataset.id;
                CurriculumController.selectLesson(lessonId);
            }
        });

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
                
                // Let the registry render the item content
                html += `
                    <div class="curriculum-item ${isActive ? 'active' : ''} ${lesson.locked ? 'locked' : ''}" data-id="${lesson.id}">
                        <i class="fas ${handler.icon}"></i>
                        <span style="margin-right: 8px;">${lesson.title}</span>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        this.elements.container.innerHTML = html;
    }
}

export const CurriculumUI = new CurriculumUIClass();
