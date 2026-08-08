/**
 * ChatService.js
 * Handles all Firestore operations for multi-channel chat.
 */
import { ChatRepository } from '../../repositories/ChatRepository.js';

class ChatServiceClass {
    constructor() {
        this.unsubscribeFunctions = {};
    }

    /**
     * Subscribe to a specific channel's messages with pagination.
     */
    subscribeToChannel(lessonId, channel, limit, onSnapshotCallback) {
        if (this.unsubscribeFunctions[channel]) {
            this.unsubscribeFunctions[channel]();
        }

        this.unsubscribeFunctions[channel] = ChatRepository.onMessagesSnapshot(lessonId, channel, onSnapshotCallback, limit);
    }

    unsubscribeAll() {
        Object.values(this.unsubscribeFunctions).forEach(unsub => unsub());
        this.unsubscribeFunctions = {};
    }

    async sendMessage(courseId, lessonId, userId, userName, role, text, channel, replyToId = null) {
        try {
            const { commandBus } = await import('../../core/CommandBus.js');
            await commandBus.dispatch({
                domain: 'academy_createCourseChat',
                action: 'create',
                payload: {
                    courseId,
                    lessonId,
                    userId,
                    userName,
                    text,
                    channel
                }
            });
        } catch (error) {
            console.warn("[ChatService] API failed, falling back to direct Firestore write", error);
            try {
                await ChatRepository.sendMessage({
                    courseId,
                    lessonId,
                    userId,
                    userName,
                    role,
                    text,
                    channel: channel || 'general',
                    replyToId
                });
            } catch (fallbackError) {
                console.error("[ChatService] Fallback also failed", fallbackError);
                throw new Error('SyncError');
            }
        }
    }

    /**
     * Send typing indicator for a specific channel
     */
    async setTypingStatus(courseId, channel, userId, userName, isTyping) {
        return ChatRepository.setTypingStatus(courseId, channel, userId, userName, isTyping);
    }

    subscribeToTyping(courseId, channel, onSnapshotCallback) {
        return ChatRepository.subscribeToTyping(courseId, channel, onSnapshotCallback);
    }

    async toggleReaction(msgId, reactionType) {
        return ChatRepository.toggleReaction(msgId, reactionType);
    }
}

export const ChatService = new ChatServiceClass();
