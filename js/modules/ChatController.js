import { ChatService } from './ChatService.js';
import { NotificationManager } from './NotificationManager.js';

/**
 * ChatController.js
 * Business logic and state management for Multi-Channel Chat.
 */

class ChatControllerClass {
    constructor() {
        this.engine = null;
        this.cache = {
            activeChannel: 'public',
            messages: {
                public: [],
                questions: [],
                announcements: [],
                system: []
            },
            unreadCounts: {
                public: 0,
                questions: 0,
                announcements: 0,
                system: 0
            },
            typingUsers: [],
            isChatOpen: false
        };
        
        this.typingTimeout = null;
        this.typingUnsubscribe = null;
    }

    init(engine) {
        this.engine = engine;
        this.switchChannel('public'); // Default
    }

    setChatVisibility(isOpen) {
        this.cache.isChatOpen = isOpen;
        if (isOpen) {
            this.cache.unreadCounts[this.cache.activeChannel] = 0;
        }
        this.notifyUI();
    }

    switchChannel(channelName) {
        this.cache.activeChannel = channelName;
        this.cache.unreadCounts[channelName] = 0;
        
        ChatService.subscribeToChannel(
            this.engine.courseId, 
            channelName, 
            30, 
            (messages) => this.handleNewMessages(channelName, messages)
        );

        this.setupTypingSubscription(channelName);
        this.notifyUI();
    }

    handleNewMessages(channel, messages) {
        const prevLength = this.cache.messages[channel].length;
        this.cache.messages[channel] = messages;

        // Increment unread count if channel isn't active or chat is closed
        if ((!this.cache.isChatOpen || this.cache.activeChannel !== channel) && messages.length > prevLength) {
            this.cache.unreadCounts[channel] += (messages.length - prevLength);
        } else if (this.cache.isChatOpen && this.cache.activeChannel === channel) {
            this.cache.unreadCounts[channel] = 0;
        }

        this.notifyUI();
    }

    async sendMessage(text, replyToId = null) {
        if (this.isSending) return;
        this.isSending = true;

        const channel = this.cache.activeChannel;
        // Instructor only validation for announcements
        if (channel === 'announcements' && !this.engine.isInstructor) {
            // console.warn("Students cannot post announcements.");
            this.isSending = false;
            return;
        }

        // Room lock validation
        if (this.engine.state.permissions && this.engine.state.permissions.chatLocked && !this.engine.isInstructor) {
            NotificationManager.show("الدردشة مغلقة حالياً من قبل المدرب", "warning");
            this.isSending = false;
            return;
        }

        if (!navigator.onLine) {
            // Queue offline
            this.queueOfflineMessage(text, channel, replyToId);
            setTimeout(() => { this.isSending = false; }, 500);
            return;
        }

        try {
            await ChatService.sendMessage(
                this.engine.courseId,
                this.engine.currentUser.uid,
                this.engine.currentUser.displayName || 'طالب',
                this.engine.isInstructor ? 'instructor' : 'student',
                text,
                channel,
                replyToId
            );
        } catch (error) {
            console.error("SendMessage failed", error);
        } finally {
            // Strict 500ms throttle
            setTimeout(() => { this.isSending = false; }, 500);
        }
    }

    queueOfflineMessage(text, channel, replyToId) {
        const key = `chat_queue_${this.engine.courseId}`;
        const queue = JSON.parse(localStorage.getItem(key) || '[]');
        queue.push({ text, channel, replyToId, timestamp: Date.now() });
        localStorage.setItem(key, JSON.stringify(queue));
        
        // Optimistically render in UI (optional, but requested for offline support)
        this.cache.messages[channel].push({
            id: 'temp_' + Date.now(),
            text: text,
            channel: channel,
            userId: this.engine.currentUser.uid,
            userName: this.engine.currentUser.displayName,
            role: this.engine.isInstructor ? 'instructor' : 'student',
            isOffline: true
        });
        this.notifyUI();
    }

    async syncOfflineQueue() {
        const key = `chat_queue_${this.engine.courseId}`;
        const queue = JSON.parse(localStorage.getItem(key) || '[]');
        if (queue.length === 0 || !navigator.onLine) return;

        for (const msg of queue) {
            await ChatService.sendMessage(
                this.engine.courseId,
                this.engine.currentUser.uid,
                this.engine.currentUser.displayName,
                this.engine.isInstructor ? 'instructor' : 'student',
                msg.text,
                msg.channel,
                msg.replyToId
            );
        }
        localStorage.removeItem(key);
    }

    // Typing Logic
    handleTyping() {
        // Enforce scaling rules
        // Assuming we have totalOnline metric available from PresenceManager
        const totalOnline = document.getElementById('chat-online-count')?.innerText || '0';
        if (parseInt(totalOnline) > 100 && !this.engine.isInstructor) {
            return; // Only instructors broadcast typing in large rooms
        }

        ChatService.setTypingStatus(
            this.engine.courseId, 
            this.cache.activeChannel, 
            this.engine.currentUser.uid, 
            this.engine.currentUser.displayName, 
            true
        );

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            ChatService.setTypingStatus(
                this.engine.courseId, 
                this.cache.activeChannel, 
                this.engine.currentUser.uid, 
                this.engine.currentUser.displayName, 
                false
            );
        }, 3000);
    }

    setupTypingSubscription(channelName) {
        if (this.typingUnsubscribe) this.typingUnsubscribe();
        
        this.typingUnsubscribe = ChatService.subscribeToTyping(this.engine.courseId, channelName, (typingUsers) => {
            // Remove self from typing list
            this.cache.typingUsers = typingUsers.filter(u => u !== this.engine.currentUser.displayName);
            this.notifyUI();
        });
    }

    notifyUI() {
        import('./ChatUI.js').then(({ ChatUI }) => {
            ChatUI.render(this.cache);
        });
    }
}

export const ChatController = new ChatControllerClass();
