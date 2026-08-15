/**
 * ArchiveManager.js
 * Exposes UI hooks for ending a session and initializing the Room in Archive (Replay) Mode.
 */

import { ArchiveController } from './ArchiveController.js';
import { ReplayEngine } from '../room/ReplayEngine.js';
import { eventBus, Events } from '../../core/EventBus.js';

export class ArchiveManagerClass {
    constructor() {
        this.engine = null;
        this.currentArchiveId = null;
    }

    init(engine) {
        this.engine = engine;
        ArchiveController.init(engine);

        if (this.engine.isInstructor) {
            this.injectEndSessionButton();
        }

        // Listen for lesson selection
        eventBus.subscribe(Events.PLAY_LECTURE, (lesson) => {
            if (lesson.status === 'Completed') {
                this.bootArchiveMode(lesson);
            } else {
                this.exitArchiveMode();
            }
        });

        EventBus.subscribe(Events.DESTROY_ROOM_SESSION, () => {
            this.destroy();
        });

        // Setup Archive Tab Clicks
        this.setupArchiveTabs();
    }

    destroy() {
        this.exitArchiveMode();
    }

    setupArchiveTabs() {
        const tabs = document.querySelectorAll('.btn-archive-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchArchiveTab(mode);
            });
        });
    }

    switchArchiveTab(mode) {
        // Update active class on tabs
        document.querySelectorAll('.btn-archive-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.btn-archive-tab[data-mode="${mode}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.background = 'rgba(255,255,255,0.1)';
            activeTab.style.color = 'white';
        }

        // Hide all layers
        document.querySelectorAll('.renderer-layer').forEach(l => l.classList.remove('active'));

        // Show the target layer
        if (mode === 'video') {
            document.getElementById('layer-video')?.classList.add('active');
        } else if (mode === 'chat') {
            document.getElementById('layer-channel')?.classList.add('active');
        } else if (mode === 'resources') {
            // Re-use the resources tab in the curriculum panel or show a custom layer
            // For now, let's trigger a click on the resources side tab
            const resTab = document.querySelector('.side-tab[data-target="resources"]');
            if (resTab) resTab.click();
        } else if (mode === 'slides') {
            document.getElementById('layer-slides')?.classList.add('active');
        }
    }

    injectEndSessionButton() {
        const checkInterval = setInterval(() => {
            const overviewContent = document.getElementById('side-content-overview');
            if (overviewContent) {
                clearInterval(checkInterval);
                const btn = document.createElement('button');
                btn.className = 'btn btn-primary';
                btn.style.width = '100%';
                btn.style.marginTop = '2rem';
                btn.style.backgroundColor = 'var(--danger)';
                btn.innerHTML = '<i class="fas fa-power-off"></i> إنهاء الدرس وحفظه في الأرشيف';
                
                btn.addEventListener('click', () => {
                    if (confirm('هل أنت متأكد من إنهاء الدرس؟ سيتم حفظ الدردشة والموارد وسجل الدرس كأرشيف.')) {
                        ArchiveController.endSessionAndArchive();
                    }
                });

                overviewContent.appendChild(btn);
            }
        }, 500);
    }

    async bootArchiveMode(lesson) {
        this.currentArchiveId = lesson.id;
        this.currentLesson = lesson;
        
        // 1. Show the Archive Bar
        const archiveBar = document.getElementById('archive-mode-bar');
        if (archiveBar) {
            archiveBar.style.display = 'flex';
        }

        // 2. Disable Inputs (Read-Only)
        const chatInput = document.getElementById('chat-input-form');
        if (chatInput) {
            chatInput.style.pointerEvents = 'none';
            chatInput.style.opacity = '0.5';
            chatInput.querySelector('input').placeholder = 'الدرس مؤرشف (للقراءة فقط)';
        }

        // 3. Load Archive Data
        const archiveData = await ArchiveController.loadArchive(lesson.id);
        if (!archiveData) {
            return;
        }
        
        this.currentArchiveData = archiveData;

        // 4. Update UI with Archived Data
        // Note: Chat messages and Resources are automatically handled 
        // by ChatController and ResourceManager listening to PLAY_LECTURE.

        // Reset to first tab
        this.switchArchiveTab('video');
    }

    switchArchiveTab(mode) {
        // Update active class on tabs
        document.querySelectorAll('.btn-archive-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.btn-archive-tab[data-mode="${mode}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.background = 'rgba(255,255,255,0.1)';
            activeTab.style.color = 'white';
        }

        // Hide all layers
        document.querySelectorAll('.renderer-layer').forEach(l => l.classList.remove('active'));

        // Show the target layer
        if (mode === 'video') {
            const layer = document.getElementById('layer-video');
            if (layer) {
                layer.classList.add('active');
                const videoPlayer = document.getElementById('player-video');
                if (videoPlayer) {
                    if (this.currentLesson && this.currentLesson.recordings && this.currentLesson.recordings.length > 0) {
                        videoPlayer.src = this.currentLesson.recordings[0].url || this.currentLesson.recordings[0].link || '';
                        videoPlayer.style.display = 'block';
                    } else {
                        // Fallback message
                        videoPlayer.style.display = 'none';
                        let msg = layer.querySelector('.archive-no-video');
                        if (!msg) {
                            msg = document.createElement('div');
                            msg.className = 'archive-no-video';
                            msg.style.color = 'rgba(255,255,255,0.5)';
                            msg.innerHTML = '<i class="fas fa-video-slash" style="font-size:3rem; margin-bottom:1rem; display:block;"></i>لا يوجد تسجيل فيديو لهذا الدرس';
                            msg.style.textAlign = 'center';
                            layer.appendChild(msg);
                        }
                    }
                }
            }
        } else if (mode === 'chat') {
            document.getElementById('layer-channel')?.classList.add('active');
        } else if (mode === 'resources') {
            const resTab = document.querySelector('.side-tab[data-target="resources"]');
            if (resTab) resTab.click();
        } else if (mode === 'slides') {
            const layer = document.getElementById('layer-slides');
            if (layer) {
                layer.classList.add('active');
                const slidesContainer = document.getElementById('slides-container');
                if (slidesContainer) {
                    // Try to find slides in resources or lesson data
                    // If slides array exists on lesson, use it, else try to find images in resources
                    const slides = this.currentLesson?.slides || (this.currentArchiveData?.resources || []).filter(r => r.type && r.type.startsWith('image/'));
                    if (slides && slides.length > 0) {
                        slidesContainer.innerHTML = '';
                        slidesContainer.className = `slides-container slides-layout-${Math.min(slides.length, 5)}`;
                        slides.forEach(slide => {
                            const url = slide.downloadUrl || slide.url || slide;
                            const img = document.createElement('img');
                            img.src = url;
                            slidesContainer.appendChild(img);
                        });
                    } else {
                        slidesContainer.innerHTML = '<div style="color:rgba(255,255,255,0.5); text-align:center; width:100%; grid-column:1/-1; padding:3rem;"><i class="fas fa-images" style="font-size:3rem; margin-bottom:1rem; display:block;"></i>لا توجد شرائح لهذا الدرس</div>';
                    }
                }
            }
        }
    }

    exitArchiveMode() {
        this.currentArchiveId = null;
        this.currentArchiveData = null;
        this.currentLesson = null;
        
        // Hide Archive Bar
        const archiveBar = document.getElementById('archive-mode-bar');
        if (archiveBar) {
            archiveBar.style.display = 'none';
        }

        // Re-enable Inputs
        const chatInput = document.getElementById('chat-input-form');
        if (chatInput) {
            chatInput.style.pointerEvents = 'auto';
            chatInput.style.opacity = '1';
            chatInput.querySelector('input').placeholder = 'اكتب رسالتك...';
        }
    }
}
export const ArchiveManager = new ArchiveManagerClass();
