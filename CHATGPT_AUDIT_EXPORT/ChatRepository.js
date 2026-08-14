/**
 * @file ChatRepository.js
 * @purpose Enterprise Data Layer for Chat and Messaging.
 * @responsibilities
 *  - Read and write messages to course chats.
 *  - Manage message streams via snapshots.
 * @collectionsUsed Constants.COLLECTIONS.COURSE_CHATS, Constants.COLLECTIONS.CHANNEL_MESSAGES
 * @cloudFunctionsUsed None
 * @snapshotListeners onMessagesSnapshot
 * @transactions None
 * @publicAPI sendMessage, onMessagesSnapshot, getMessages
 * @futureMigrationPlan Replace ChatService db.collection calls with ChatRepository.
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class ChatRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `ChatRepository.${method}`);
        throw enhancedError;
    }

    async sendMessage(messageData) {
        try {
            const db = FirebaseManager.getFirestore();
            const ref = await db.collection(Constants.COLLECTIONS.COURSE_CHATS).add({
                ...messageData,
                timestamp: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
            });
            return ref.id;
        } catch (error) {
            this._handleError(error, 'sendMessage');
        }
    }

    async getMessages(lessonId, channel, limit = 30) {
        try {
            const db = FirebaseManager.getFirestore();
            const snapshot = await db.collection(Constants.COLLECTIONS.COURSE_CHATS)
                .where('lessonId', '==', lessonId)
                .where('channel', '==', channel)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
        } catch (error) {
            this._handleError(error, 'getMessages');
        }
    }

    async getCourseMessages(courseId) {
        try {
            const db = FirebaseManager.getFirestore();
            const snapshot = await db.collection(Constants.COLLECTIONS.COURSE_CHATS)
                .where('courseId', '==', courseId)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getCourseMessages');
        }
    }

    onMessagesSnapshot(lessonId, channel, callback, limit = 30) {
        try {
            const db = FirebaseManager.getFirestore();
            return db.collection(Constants.COLLECTIONS.COURSE_CHATS)
                .where('lessonId', '==', lessonId)
                .where('channel', '==', channel)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .onSnapshot(snapshot => {
                    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse());
                }, error => {
                    this._handleError(error, 'onMessagesSnapshot');
                });
        } catch (error) {
            this._handleError(error, 'onMessagesSnapshot');
        }
    }

    onCourseChannelMessagesSnapshot(courseId, callback) {
        try {
            const db = FirebaseManager.getFirestore();
            return db.collection(Constants.COLLECTIONS.COURSES).doc(courseId)
                .collection(Constants.COLLECTIONS.CHANNEL_MESSAGES)
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    callback(snapshot.docChanges());
                }, error => {
                    this._handleError(error, 'onCourseChannelMessagesSnapshot');
                });
        } catch (error) {
            this._handleError(error, 'onCourseChannelMessagesSnapshot');
        }
    }

    async setTypingStatus(courseId, channel, userId, userName, isTyping) {
        try {
            const db = FirebaseManager.getFirestore();
            const ref = db.collection(Constants.COLLECTIONS.COURSES).doc(courseId)
                .collection(Constants.SUBCOLLECTIONS.TYPING_STATUS).doc(`${channel}_${userId}`);
                
            if (isTyping) {
                await ref.set({
                    userId,
                    userName,
                    channel,
                    timestamp: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
                });
            } else {
                await ref.delete();
            }
        } catch (error) {
            this._handleError(error, 'setTypingStatus');
        }
    }

    subscribeToTyping(courseId, channel, callback) {
        try {
            const db = FirebaseManager.getFirestore();
            return db.collection(Constants.COLLECTIONS.COURSES).doc(courseId)
                .collection(Constants.SUBCOLLECTIONS.TYPING_STATUS)
                .where('channel', '==', channel)
                .onSnapshot(snapshot => {
                    const typingUsers = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.timestamp) {
                            const age = Date.now() - data.timestamp.toMillis();
                            if (age < 5000) {
                                typingUsers.push(data.userName);
                            }
                        }
                    });
                    callback(typingUsers);
                }, error => {
                    this._handleError(error, 'subscribeToTyping');
                });
        } catch (error) {
            this._handleError(error, 'subscribeToTyping');
        }
    }

    async toggleReaction(msgId, reactionType, userId) {
        if (!userId) return;
        try {
            const db = FirebaseManager.getFirestore();
            const msgRef = db.collection(Constants.COLLECTIONS.COURSE_CHATS).doc(msgId);
            
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(msgRef);
                if (!doc.exists) return;
                
                const data = doc.data();
                const oppositeType = reactionType === 'like' ? 'heart' : 'like';
                const byKey    = reactionType + 'dBy';   // 'likedBy' or 'heartedBy'
                const oppByKey = oppositeType + 'dBy';   // opposite key

                let byArr    = Array.isArray(data[byKey])    ? [...data[byKey]]    : [];
                let oppByArr = Array.isArray(data[oppByKey]) ? [...data[oppByKey]] : [];

                const alreadyReacted = byArr.includes(userId);

                if (alreadyReacted) {
                    // Toggle OFF: remove own reaction
                    byArr = byArr.filter(id => id !== userId);
                } else {
                    // Toggle ON: add this, remove opposite
                    byArr.push(userId);
                    oppByArr = oppByArr.filter(id => id !== userId);
                }

                transaction.update(msgRef, {
                    [byKey]:    byArr,
                    [oppByKey]: oppByArr,
                    [`reactions.like`]:  null,  // deprecated counter
                    [`reactions.heart`]: null,
                    reactions: {
                        like:  (byKey === 'likedBy'   ? byArr : oppByArr).length,
                        heart: (byKey === 'heartedBy' ? byArr : oppByArr).length,
                        likedBy:   byKey === 'likedBy'   ? byArr : oppByArr,
                        heartedBy: byKey === 'heartedBy' ? byArr : oppByArr
                    }
                });
            });
        } catch (error) {
            this._handleError(error, 'toggleReaction');
        }
    }

    async toggleCourseChannelReaction(courseId, msgId, reactionType) {
        try {
            const db = FirebaseManager.getFirestore();
            const msgRef = db.collection(Constants.COLLECTIONS.COURSES).doc(courseId)
                           .collection(Constants.COLLECTIONS.CHANNEL_MESSAGES).doc(msgId);
            
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(msgRef);
                if (!doc.exists) return;
                
                const data = doc.data();
                const reactions = data.reactions || { like: 0, heart: 0 };
                
                reactions[reactionType] = (reactions[reactionType] || 0) + 1;
                
                transaction.update(msgRef, { reactions: reactions });
            });
        } catch (error) {
            this._handleError(error, 'toggleCourseChannelReaction');
        }
    }
}

export const ChatRepository = new ChatRepositoryClass();
