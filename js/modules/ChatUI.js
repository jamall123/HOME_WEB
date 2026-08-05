import { ChatController } from './ChatController.js';

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
            channelsMenu: document.getElementById('chat-channels-menu'), // hypothetical element
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
            const text = this.elements.input.value.trim();
            if (!text) return;
            
            this.elements.input.value = '';
            ChatController.sendMessage(text);
        });

        this.elements.input.addEventListener('input', () => {
            ChatController.handleTyping();
        });

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
            const isInst = ['instructor', 'admin', 'supervisor'].includes(msg.role);
            
            // Offline messages show a clock icon
            const timeStr = msg.isOffline 
                ? '<i class="fas fa-clock"></i> جار الإرسال...' 
                : (msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '');
            
            html += `
                <div class="chat-message ${msg.isOffline ? 'offline' : ''}" style="align-self: ${isSelf ? 'flex-end' : 'flex-start'}; max-width: 85%;">
                    <div style="font-size: 0.8rem; margin-bottom: 4px; display: flex; align-items: center; gap: 0.5rem; justify-content: ${isSelf ? 'flex-end' : 'flex-start'};">
                        <span style="font-weight: bold; color: ${isInst ? 'var(--primary-color)' : 'var(--text-secondary)'};">
                            ${msg.userName} ${isInst ? '<i class="fas fa-check-circle"></i>' : ''}
                        </span>
                        <span style="font-size: 0.7rem; color: #666;">${timeStr}</span>
                    </div>
                    <div style="background: ${isSelf ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}; 
                                color: ${isSelf ? 'white' : 'var(--text-primary)'};
                                padding: 0.8rem 1rem; 
                                border-radius: 12px;
                                border-${isSelf ? 'bottom-left' : 'bottom-right'}-radius: 0;
                                opacity: ${msg.isOffline ? '0.7' : '1'};">
                        ${msg.text}
                    </div>
                </div>
            `;
        });
        
        this.elements.container.innerHTML = html;
        this.elements.container.scrollTop = this.elements.container.scrollHeight;
    }
}

export const ChatUI = new ChatUIClass();
