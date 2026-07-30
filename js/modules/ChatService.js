/**
 * ChatService.js
 * Handles all Firestore operations for multi-channel chat.
 */

class ChatServiceClass {
    constructor() {
        this.db = window.firebase.firestore();
        this.unsubscribeFunctions = {};
    }

    /**
     * Subscribe to a specific channel's messages with pagination.
     */
    subscribeToChannel(lessonId, channel, limit, onSnapshotCallback) {
        if (this.unsubscribeFunctions[channel]) {
            this.unsubscribeFunctions[channel]();
        }

        const query = this.db.collection('course_chats')
            .where('lessonId', '==', lessonId)
            .where('channel', '==', channel)
            .orderBy('timestamp', 'desc') // desc for lazy loading upward
            .limit(limit);

        this.unsubscribeFunctions[channel] = query.onSnapshot((snapshot) => {
            const messages = [];
            snapshot.forEach(doc => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            // Reverse to get chronological order
            onSnapshotCallback(messages.reverse());
        }, (error) => {
            console.error(`[ChatService] Subscribe failed for ${channel}:`, error);
        });
    }

    unsubscribeAll() {
        Object.values(this.unsubscribeFunctions).forEach(unsub => unsub());
        this.unsubscribeFunctions = {};
    }

    async sendMessage(lessonId, userId, userName, role, text, channel, replyToId = null) {
        try {
            const { commandBus } = await import('../core/CommandBus.js');
            await commandBus.dispatch({
                domain: 'academy',
                action: 'createCourseChat',
                payload: {
                    lessonId,
                    userId,
                    text,
                    channel
                }
            });
        } catch (error) {
            console.error("[ChatService] Failed to send message", error);
            throw new Error('SyncError');
        }
    }

    /**
     * Send typing indicator for a specific channel
     */
    async setTypingStatus(courseId, channel, userId, userName, isTyping) {
        try {
            const ref = this.db.collection('courses').doc(courseId)
                .collection('typing_status').doc(`${channel}_${userId}`);
                
            if (isTyping) {
                await ref.set({
                    userId,
                    userName,
                    channel,
                    timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                await ref.delete();
            }
        } catch (error) {
            // console.warn("[ChatService] Failed to set typing status");
        }
    }

    subscribeToTyping(courseId, channel, onSnapshotCallback) {
        return this.db.collection('courses').doc(courseId)
            .collection('typing_status')
            .where('channel', '==', channel)
            .onSnapshot(snapshot => {
                const typingUsers = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // Basic cleanup: ignore if older than 5 seconds
                    if (data.timestamp) {
                        const age = Date.now() - data.timestamp.toMillis();
                        if (age < 5000) {
                            typingUsers.push(data.userName);
                        }
                    }
                });
                onSnapshotCallback(typingUsers);
            });
    }
}

export const ChatService = new ChatServiceClass();
