/**
 * ArchiveManager.js
 * Exposes UI hooks for ending a session and initializing the Room in Archive (Replay) Mode.
 */

import { ArchiveController } from './ArchiveController.js';
import { ReplayEngine } from './ReplayEngine.js';

export class ArchiveManagerClass {
    constructor() {
        this.engine = null;
    }

    init(engine) {
        this.engine = engine;
        ArchiveController.init(engine);

        if (this.engine.isInstructor) {
            this.injectEndSessionButton();
        }

        // Check if we are booting into Archive Mode
        const urlParams = new URLSearchParams(window.location.search);
        const archiveId = urlParams.get('archive');
        if (archiveId) {
            this.bootArchiveMode(archiveId);
        }
    }

    injectEndSessionButton() {
        const classroomTab = document.getElementById('inst-view-classroom');
        if (!classroomTab) return;

        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.style.width = '100%';
        btn.style.marginTop = '2rem';
        btn.style.backgroundColor = 'var(--danger)';
        btn.innerHTML = '<i class="fas fa-power-off"></i> إنهاء الجلسة وأرشفتها';
        
        btn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من إنهاء الجلسة؟ سيتم طرد جميع الطلاب وإرسال الجلسة للأرشيف.')) {
                ArchiveController.endSessionAndArchive();
            }
        });

        classroomTab.appendChild(btn);
    }

    async bootArchiveMode(archiveId) {
        // console.log(`[ArchiveMode] Booting into Read-Only Archive: ${archiveId}`);
        
        // 1. Force state to Archive
        this.engine.updateState({ room: { mode: 'archive', isLive: false } });

        // 2. Load Archive Data
        const archiveData = await ArchiveController.loadArchive(archiveId);
        if (!archiveData) {
            alert('الأرشيف غير موجود أو تالف');
            return;
        }

        // 3. Init Replay Engine
        ReplayEngine.init(archiveData);
        this.renderArchivedResources(archiveData.resources);

        // Disable input
        const chatInput = document.getElementById('chat-input-container');
        if (chatInput) chatInput.style.display = 'none';

        NotificationManager.show("أنت تشاهد نسخة مؤرشفة للقراءة فقط", "info", 0);
    }

    renderArchivedChat(messages) {
        // Implementation depends on ChatUI structure, but essentially we 
        // inject the messages array into the chat UI directly.
        if (window.ChatUI && messages) {
            // Fake a channel switch with static data
            // Since this is read-only, we bypass ChatController logic
        }
    }

    renderArchivedResources(resources) {
        const container = document.getElementById('resources-container');
        if (!container || !resources) return;

        const fragment = document.createDocumentFragment();
        resources.forEach(res => {
            const el = document.createElement('div');
            el.className = 'resource-item';
            el.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem; background: rgba(255,255,255,0.05); margin-bottom: 0.5rem; border-radius: 8px;">
                    <i class="fas fa-file" style="font-size: 2rem; color: var(--primary-color);"></i>
                    <div>
                        <h4 style="margin: 0;">${res.fileName}</h4>
                    </div>
                    <a href="${res.downloadUrl}" target="_blank" class="btn btn-sm btn-primary" style="margin-right: auto;"><i class="fas fa-download"></i></a>
                </div>
            `;
            fragment.appendChild(el);
        });
        container.innerHTML = '';
        container.appendChild(fragment);
    }
}
export const ArchiveManager = new ArchiveManagerClass();
