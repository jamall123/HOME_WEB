export class RoomState {
    constructor() {
        this.state = {
            room: {
                mode: 'video', // video, slides, channel, audio, link
                isLive: false,
                title: '',
                description: '',
                instructor: null
            },
            presentation: {
                videoUrl: null,
                currentSlideUrl: null,
                channelTimestamp: 0,
                slides: [],
                status: 'playing',
                layout: 'slides-layout-1',
                audioStream: false,
                lastChannelMessage: null
            },
            network: {
                lowBandwidth: false,
                isOffline: false
            },
            chat: {
                unreadCount: 0
            },
            layout: {
                activeTab: 'overview',
                sidebarOpen: true
            },
            permissions: {
                chatLocked: false,
                resourcesLocked: false,
                micPermissions: {}
            }
        };
        this.prevState = JSON.parse(JSON.stringify(this.state));
        this.renderQueue = new Set();
        this.isRendering = false;
        
        // Observers
        this.onRenderScheduled = null;
    }

    /**
     * Entry point for all state mutations.
     * @param {Object} partialState - Deep partial object representing changes.
     */
    updateState(partialState) {
        if (!this.validateState(partialState)) {
            return;
        }

        const newState = this.mergeState(this.state, partialState);
        const changes = this.diffState(this.state, newState);
        
        if (Object.keys(changes).length === 0) return;

        this.prevState = JSON.parse(JSON.stringify(this.state));
        this.state = newState;

        Object.keys(changes).forEach(key => this.renderQueue.add(key));

        if (this.onRenderScheduled) {
            this.onRenderScheduled();
        }
        
        this.persistLocalState();
    }

    validateState(partialState) {
        if (partialState.room && partialState.room.mode) {
            const validModes = ['video', 'link', 'slides', 'channel', 'audio', 'archive', 'live'];
            if (!validModes.includes(partialState.room.mode)) return false;
        }
        return true;
    }

    mergeState(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeState(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    diffState(oldState, newState, path = '') {
        const changes = {};
        for (const key in newState) {
            const newPath = path ? `${path}.${key}` : key;
            if (typeof newState[key] === 'object' && newState[key] !== null && !Array.isArray(newState[key])) {
                const nestedDiff = this.diffState(oldState[key] || {}, newState[key], newPath);
                Object.assign(changes, nestedDiff);
            } else if (oldState[key] !== newState[key]) {
                const rootKey = newPath.split('.')[0];
                changes[rootKey] = true;
            }
        }
        return changes;
    }

    persistLocalState() {
        if (this.courseId) {
            localStorage.setItem(`room_state_${this.courseId}`, JSON.stringify({
                layout: this.state.layout
            }));
        }
    }

    restoreLocalState(courseId) {
        this.courseId = courseId;
        try {
            const saved = localStorage.getItem(`room_state_${this.courseId}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.updateState({ layout: parsed.layout });
            }
        } catch (e) {
            console.error("[RoomState] Failed to restore local state", e);
        }
    }
}
