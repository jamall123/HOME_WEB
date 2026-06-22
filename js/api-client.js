/**
 * api-client.js
 * عميل API للموقع - يتعامل مع Cloud Functions و Firestore
 */

(function () {
  'use strict';

  // تهيئة Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(window.FIREBASE_CONFIG);
  }
  const db = firebase.firestore();
  const functions = firebase.app().functions(window.FUNCTIONS_REGION);

  // ============ Track Event (analytics) ============
  async function trackEvent(eventName, eventData = {}) {
    try {
      const sessionId = getOrCreateSessionId();
      const trackEventFn = functions.httpsCallable('trackEventCallable');
      await trackEventFn({ eventName, eventData, sessionId });
    } catch (err) {
      console.warn('trackEvent failed:', err);
    }
  }

  function getOrCreateSessionId() {
    let sid = sessionStorage.getItem('jhome_sid');
    if (!sid) {
      sid = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem('jhome_sid', sid);
    }
    return sid;
  }

  // ============ Posts (المدونات) ============
  async function getPosts({ limit = 10, category = null, featured = false } = {}) {
    let q = db.collection('posts').where('status', '==', 'published');
    if (category) q = q.where('category', '==', category);
    if (featured) q = q.where('isFeatured', '==', true);
    const snap = await q.get();
    let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (b.publishedAt || b.createdAt || 0) - (a.publishedAt || a.createdAt || 0));
    return docs.slice(0, limit);
  }

  async function getPostBySlug(slug) {
    const snap = await db.collection('posts')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1).get();
    if (snap.empty) return null;
    const post = { id: snap.docs[0].id, ...snap.docs[0].data() };

    // زيادة المشاهدات
    await db.collection('posts').doc(post.id).update({
      views: firebase.firestore.FieldValue.increment(1)
    });
    trackEvent('post_view', { postId: post.id, slug });
    return post;
  }

  // ============ Stories (قصص النجاح) ============
  async function getStories({ limit = 6, category = null } = {}) {
    let q = db.collection('successStories').where('isPublished', '==', true);
    if (category) q = q.where('category', '==', category);
    const snap = await q.get();
    let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (b.publishedAt || b.createdAt || 0) - (a.publishedAt || a.createdAt || 0));
    return docs.slice(0, limit);
  }

  // ============ Page Content (محتوى الصفحات) ============
  async function getPageContent(pageKey = 'home') {
    const doc = await db.collection('pageContent').doc(pageKey).get();
    return doc.exists ? doc.data() : null;
  }

  // ============ Submit Forms (إرسال النماذج) ============
  async function submitStory(data) {
    const fn = functions.httpsCallable('submitStoryCallable');
    return await fn(data);
  }

  async function submitContact(data) {
    const fn = functions.httpsCallable('submitContactCallable');
    return await fn(data);
  }

  async function subscribeNewsletter(data) {
    const fn = functions.httpsCallable('subscribeNewsletterCallable');
    return await fn(data);
  }

  // ============ Format Helpers ============
  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-SD', options);
  }

  function readingTimeBadge(minutes) {
    if (!minutes) return '';
    return `<span class="badge"><i class="fas fa-clock"></i> ${minutes} د قراءة</span>`;
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function truncate(text, maxLen = 150) {
    if (!text) return '';
    return text.length <= maxLen ? text : text.slice(0, maxLen).trim() + '…';
  }

  // تصدير للاستخدام العام
  window.JHomeAPI = {
    trackEvent,
    getPosts,
    getPostBySlug,
    getStories,
    getPageContent,
    submitStory,
    submitContact,
    subscribeNewsletter,
    formatDate,
    readingTimeBadge,
    stripHtml,
    truncate
  };
})();