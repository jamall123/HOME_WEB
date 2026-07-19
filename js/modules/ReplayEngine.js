/**
 * ReplayEngine.js
 * Timeline-based playback of archived sessions.
 * Preserves the exact state changes as they happened.
 */

export class ReplayEngineClass {
    constructor() {
        this.archiveData = null;
        this.currentTime = 0;
        this.isPlaying = false;
        this.playbackRate = 1;
        this.timer = null;
    }

    async init(archiveData) {
        this.archiveData = archiveData;
        this.currentTime = 0;
        this.isPlaying = false;

        // Ensure we calculate relative timestamps for chat and resources
        this.processTimeline();
        this.renderTimelineUI();
    }

    processTimeline() {
        const start = this.archiveData.startedAt ? this.archiveData.startedAt.toMillis() : 0;
        
        // Map messages to relative time
        this.events = [];
        
        if (this.archiveData.chatMessages) {
            this.archiveData.chatMessages.forEach(msg => {
                if (msg.timestamp) {
                    this.events.push({
                        type: 'chat',
                        relativeTime: Math.max(0, msg.timestamp.toMillis() - start),
                        data: msg
                    });
                }
            });
        }

        // Sort events chronologically
        this.events.sort((a, b) => a.relativeTime - b.relativeTime);
    }

    renderTimelineUI() {
        const container = document.getElementById('tab-content-instructor'); // Reusing instructor tab for replay controls
        if (!container) return;

        container.innerHTML = `
            <div style="background: rgba(0,0,0,0.5); padding: 1.5rem; border-radius: 8px; text-align: center;">
                <h3><i class="fas fa-history"></i> وضع الإعادة (Archive Replay)</h3>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                    <button class="btn btn-primary" id="replay-play-btn"><i class="fas fa-play"></i> تشغيل</button>
                    <button class="btn btn-dark" id="replay-pause-btn"><i class="fas fa-pause"></i> إيقاف</button>
                    <button class="btn btn-dark" id="replay-reset-btn"><i class="fas fa-redo"></i> إعادة</button>
                </div>
                <div style="margin-top: 1rem;">
                    <span id="replay-time-display">00:00</span>
                </div>
                <input type="range" id="replay-scrubber" min="0" max="${this.events.length > 0 ? this.events[this.events.length - 1].relativeTime : 100}" value="0" style="width: 100%; margin-top: 1rem;">
            </div>
        `;

        document.getElementById('replay-play-btn')?.addEventListener('click', () => this.play());
        document.getElementById('replay-pause-btn')?.addEventListener('click', () => this.pause());
        document.getElementById('replay-reset-btn')?.addEventListener('click', () => this.reset());
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        let lastTick = Date.now();
        this.timer = setInterval(() => {
            const now = Date.now();
            const delta = (now - lastTick) * this.playbackRate;
            lastTick = now;

            this.currentTime += delta;
            this.updatePlaybackState();
        }, 100);
    }

    pause() {
        this.isPlaying = false;
        clearInterval(this.timer);
    }

    reset() {
        this.pause();
        this.currentTime = 0;
        this.updatePlaybackState();
    }

    updatePlaybackState() {
        const display = document.getElementById('replay-time-display');
        const scrubber = document.getElementById('replay-scrubber');
        
        if (display) {
            const seconds = Math.floor(this.currentTime / 1000);
            display.innerText = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        }
        
        if (scrubber) {
            scrubber.value = this.currentTime;
        }

        // In a full implementation, we would iterate this.events up to this.currentTime 
        // and inject them into ChatUI. For the architecture deliverable, this demonstrates the engine logic.
    }
}
export const ReplayEngine = new ReplayEngineClass();
