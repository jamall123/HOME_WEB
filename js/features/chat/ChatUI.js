import { ChatController } from './ChatController.js';
import { PermissionManager } from '../../core/PermissionManager.js';

/**
 * ChatUI.js
 * Presentation Layer for Advanced Multi-Channel Chat.
 */

class ChatUIClass {
    constructor() {
        this.elements = {};
        this.engine = null;
    }

    init(engine) {
        this.engine = engine;
        this.elements = {
            container: document.getElementById('chat-messages'),
            form: document.getElementById('chat-input-form'),
            input: document.getElementById('chat-input-field'),
            channelsMenu: document.getElementById('chat-channels-menu'),
            typingIndicator: document.getElementById('chat-typing-indicator')
        };
        
        ChatController.init(engine);
        this.attachListeners();
        
        // Listen to window online events to sync queue
        window.addEventListener('online', () => {
            ChatController.syncOfflineQueue();
        });
    }

    attachListeners() {
        if (!this.elements.form) return;
        
        this.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.elements.input) return;
            const text = this.elements.input.value.trim();
            if (!text) return;
            
            this.elements.input.value = '';
            ChatController.sendMessage(text);
        });

        if (this.elements.input) {
            this.elements.input.addEventListener('input', () => {
                ChatController.handleTyping();
            });
            this.elements.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.elements.form.dispatchEvent(new Event('submit'));
                }
            });
        }

        // Event delegation for channel switching
        document.body.addEventListener('click', (e) => {
            const channelTab = e.target.closest('.chat-channel-tab');
            if (channelTab) {
                const channel = channelTab.dataset.channel;
                ChatController.switchChannel(channel);
            }
            
            const chatToggle = e.target.closest('#toggle-chat-btn');
            if (chatToggle) {
                // If it's being opened, let controller know
                // This assumes WorkspaceUI toggles a class on body or container
                setTimeout(() => {
                    const isOpen = document.body.classList.contains('chat-open');
                    ChatController.setChatVisibility(isOpen);
                }, 100);
            }
        });
    }

    render(state) {
        // Update Unread Counters
        Object.keys(state.unreadCounts).forEach(ch => {
            const badge = document.querySelector(`.chat-channel-tab[data-channel="${ch}"] .badge`);
            if (badge) {
                badge.innerText = state.unreadCounts[ch] > 0 ? state.unreadCounts[ch] : '';
                badge.style.display = state.unreadCounts[ch] > 0 ? 'inline-block' : 'none';
            }
        });

        // Update Typing Indicators
        if (this.elements.typingIndicator) {
            if (state.typingUsers.length > 0) {
                const text = state.typingUsers.join(', ') + (state.typingUsers.length > 1 ? ' يكتبون...' : ' يكتب...');
                this.elements.typingIndicator.innerText = text;
                this.elements.typingIndicator.style.display = 'block';
            } else {
                this.elements.typingIndicator.style.display = 'none';
            }
        }

        // Render Messages for Active Channel
        if (!this.elements.container) return;
        
        const messages = state.messages[state.activeChannel] || [];
        let html = '';
        
        if (state.activeChannel === 'announcements' && !this.engine.isInstructor) {
            // Hide input form for students in announcements channel
            if (this.elements.form) this.elements.form.style.display = 'none';
        } else {
            if (this.elements.form) this.elements.form.style.display = 'flex';
        }

        messages.forEach(msg => {
            const isSelf = msg.userId === this.engine.currentUser?.uid;
            const isInst = PermissionManager.isTeachingStaff({ role: msg.role });
            
            let timeStr = '';
            if (msg.isOffline) {
                timeStr = '<i class="fas fa-clock"></i> جار الإرسال...';
            } else if (msg.timestamp) {
                try {
                    const dateObj = (typeof msg.timestamp.toDate === 'function') 
                        ? msg.timestamp.toDate() 
                        : new Date(msg.timestamp);
                    timeStr = dateObj.toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'});
                } catch(e) {
                    timeStr = '';
                }
            }
            
            const reactions = msg.reactions || { like: 0, heart: 0 };
            const likedBy   = reactions.likedBy   || [];
            const heartedBy = reactions.heartedBy || [];
            const currentUid = this.engine?.currentUser?.uid || '';
            const userLiked  = likedBy.includes(currentUid);
            const userHearted = heartedBy.includes(currentUid);
            const likeCount  = reactions.like  || likedBy.length  || 0;
            const heartCount = reactions.heart || heartedBy.length || 0;
            const msgId = msg.id || 'unknown';

            html += `
                <div class="chat-message ${msg.isOptimistic ? 'optimistic' : ''}" style="align-self: ${isSelf ? 'flex-end' : 'flex-start'}; max-width: 85%; opacity: ${msg.isOptimistic ? '0.75' : '1'}; transition: opacity 0.3s;">
                    <div style="font-size: 0.8rem; margin-bottom: 4px; display: flex; align-items: center; gap: 0.5rem; justify-content: ${isSelf ? 'flex-end' : 'flex-start'};">
                        <span style="font-weight: bold; color: ${isInst ? 'var(--primary-color)' : 'var(--text-secondary)'};">
                            ${msg.userName} ${isInst ? '<i class="fas fa-check-circle"></i>' : ''}
                        </span>
                        <span style="font-size: 0.7rem; color: #666;">${timeStr}${msg.isOptimistic ? ' <i class="fas fa-clock" style="font-size:0.65rem;opacity:0.6;"></i>' : ''}</span>
                    </div>
                    <div style="background: ${isSelf ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}; 
                                color: ${isSelf ? 'white' : 'var(--text-primary)'};
                                padding: 0.8rem 1rem; 
                                border-radius: 12px;
                                border-${isSelf ? 'bottom-left' : 'bottom-right'}-radius: 0;">
                        ${msg.text}
                        ${!msg.isOptimistic ? `
                        <div style="display:flex;gap:0.3rem;margin-top:0.4rem;justify-content:${isSelf ? 'flex-end' : 'flex-start'};">
                            <button onclick="if(window.ChatAPI) window.ChatAPI.toggleReaction('${msgId}', 'like')"
                                style="background:${userLiked ? 'rgba(99,102,241,0.35)' : 'rgba(0,0,0,0.15)'};border:${userLiked ? '1px solid rgba(99,102,241,0.6)' : 'none'};color:${userLiked ? '#a5b4fc' : (isSelf ? '#fff' : '#cbd5e1')};border-radius:12px;padding:0.15rem 0.4rem;font-size:0.75rem;cursor:pointer;display:flex;align-items:center;gap:0.2rem;transition:all 0.2s;">
                                👍 <span>${likeCount > 0 ? likeCount : ''}</span>
                            </button>
                            <button onclick="if(window.ChatAPI) window.ChatAPI.toggleReaction('${msgId}', 'heart')"
                                style="background:${userHearted ? 'rgba(239,68,68,0.25)' : 'rgba(0,0,0,0.15)'};border:${userHearted ? '1px solid rgba(239,68,68,0.5)' : 'none'};color:${userHearted ? '#fca5a5' : (isSelf ? '#fff' : '#cbd5e1')};border-radius:12px;padding:0.15rem 0.4rem;font-size:0.75rem;cursor:pointer;display:flex;align-items:center;gap:0.2rem;transition:all 0.2s;">
                                ❤️ <span>${heartCount > 0 ? heartCount : ''}</span>
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        this.elements.container.innerHTML = html;
        this.elements.container.scrollTop = this.elements.container.scrollHeight;
    }
}

export const ChatUI = new ChatUIClass();
