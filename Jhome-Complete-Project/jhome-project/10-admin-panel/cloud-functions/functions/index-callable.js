/**
 * Callable Cloud Functions
 * -------------------------
 * هذه الـ Functions تُستخدم من الواجهة عبر firebase.functions().httpsCallable()
 * وهي أكثر أماناً من HTTP Functions العادية.
 *
 * للإضافة إلى index.js، أو انسخ المحتوى في ملف جديد.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { slugify } = require("./utils/slugify");
const { sendEmail } = require("./utils/email");

const db = admin.firestore();
const auth = admin.auth();

// ============ Callable Functions (للواجهة الأمامية) ============

// إرسال قصة من الموقع
exports.submitStoryCallable = functions.https.onCall(async (data, context) => {
  const { submitterName, submitterEmail, submitterPhone, title, story, category, attachments } = data;

  if (!submitterName || !submitterEmail || !title || !story) {
    throw new functions.https.HttpsError('invalid-argument', 'حقول مطلوبة ناقصة');
  }
  if (story.length < 20) {
    throw new functions.https.HttpsError('invalid-argument', 'القصة قصيرة جداً');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
    throw new functions.https.HttpsError('invalid-argument', 'بريد غير صالح');
  }

  // Rate limiting (basic)
  const ipAddress = context.rawRequest?.headers?.['x-forwarded-for'] || 'unknown';
  const oneHourAgo = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 60 * 60 * 1000));
  const recent = await db.collection('storySubmissions')
    .where('ipAddress', '==', ipAddress)
    .where('submittedAt', '>', oneHourAgo)
    .get();
  if (recent.size >= 3) {
    throw new functions.https.HttpsError('resource-exhausted', 'كثير من المحاولات، حاول بعد ساعة');
  }

  await db.collection('storySubmissions').add({
    submitterName, submitterEmail,
    submitterPhone: submitterPhone || '',
    title, story,
    category: category || 'عام',
    attachments: attachments || [],
    status: 'pending',
    reviewerNotes: '',
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    ipAddress
  });

  await sendEmail({
    to: 'admin@jhome.sd',
    subject: `قصة جديدة من ${submitterName}`,
    html: `<h2>قصة جديدة بانتظار المراجعة</h2>
           <p><strong>المرسل:</strong> ${submitterName} (${submitterEmail})</p>
           <p><strong>العنوان:</strong> ${title}</p>
           <p>${story.substring(0, 300)}...</p>`
  });

  return { success: true, message: 'تم استلام قصتك' };
});

exports.submitContactCallable = functions.https.onCall(async (data) => {
  const { name, email, phone, subject, message } = data;
  if (!name || !email || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'حقول ناقصة');
  }
  await db.collection('contactMessages').add({
    name, email,
    phone: phone || '',
    subject: subject || '',
    message,
    status: 'new',
    notes: '',
    receivedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  await sendEmail({
    to: 'admin@jhome.sd',
    subject: `رسالة من ${name}: ${subject || 'بدون موضوع'}`,
    html: `<p>${message}</p><p>— ${name} (${email})</p>`
  });
  return { success: true };
});

exports.subscribeNewsletterCallable = functions.https.onCall(async (data) => {
  const { email, name, source } = data;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'بريد غير صالح');
  }
  const existing = await db.collection('newsletter').where('email', '==', email).limit(1).get();
  if (!existing.empty) {
    await existing.docs[0].ref.update({ isActive: true, unsubscribedAt: null });
    return { success: true, message: 'أنت مشترك بالفعل' };
  }
  await db.collection('newsletter').add({
    email,
    name: name || '',
    isActive: true,
    subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    source: source || 'footer'
  });
  return { success: true, message: 'تم الاشتراك' };
});

exports.trackEventCallable = functions.https.onCall(async (data) => {
  const { eventName, eventData, sessionId } = data;
  if (!eventName) {
    throw new functions.https.HttpsError('invalid-argument', 'eventName required');
  }
  await db.collection('analytics_events').add({
    eventName,
    eventData: eventData || {},
    sessionId: sessionId || 'anonymous',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    userAgent: 'web'
  });
  return { success: true };
});

// ============ Admin Callable Functions (تتطلب تسجيل دخول كأدمن) ============

async function assertAdmin(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
  }
  const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
  if (!adminDoc.exists || !adminDoc.data().isActive) {
    throw new functions.https.HttpsError('permission-denied', 'ليس لديك صلاحية');
  }
  return { uid: context.auth.uid, ...adminDoc.data() };
}

exports.adminCreatePost = functions.https.onCall(async (data, context) => {
  const adminUser = await assertAdmin(context);
  const slug = data.slug || slugify(data.title);
  const existing = await db.collection('posts').where('slug', '==', slug).limit(1).get();
  const finalSlug = existing.empty ? slug : `${slug}-${Date.now()}`;

  const wordCount = (data.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const post = {
    title: data.title,
    slug: finalSlug,
    excerpt: data.excerpt || '',
    content: data.content || '',
    coverImage: data.coverImage || '',
    authorId: adminUser.uid,
    authorName: adminUser.displayName || adminUser.email || 'Admin',
    category: data.category || 'عام',
    tags: data.tags || [],
    status: data.status || 'draft',
    isFeatured: !!data.isFeatured,
    views: 0,
    readingTime,
    language: data.language || 'ar',
    seoTitle: data.seoTitle || data.title,
    seoDescription: data.seoDescription || data.excerpt || '',
    publishedAt: data.status === 'published' ? admin.firestore.FieldValue.serverTimestamp() : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const ref = await db.collection('posts').add(post);
  return { success: true, id: ref.id, slug: finalSlug };
});

exports.adminUpdatePost = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { postId, ...updates } = data;
  if (!postId) throw new functions.https.HttpsError('invalid-argument', 'postId required');

  updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

  const existing = await db.collection('posts').doc(postId).get();
  if (existing.exists && existing.data().status !== 'published' && updates.status === 'published') {
    updates.publishedAt = admin.firestore.FieldValue.serverTimestamp();
  }

  await db.collection('posts').doc(postId).update(updates);
  return { success: true };
});

exports.adminDeletePost = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  await db.collection('posts').doc(data.postId).update({
    status: 'archived',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { success: true };
});

exports.adminApproveStory = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { submissionId, personRole, personCity, keyAchievement, metricValue, metricLabel, publishNow } = data;

  const subDoc = await db.collection('storySubmissions').doc(submissionId).get();
  if (!subDoc.exists) throw new functions.https.HttpsError('not-found', 'لا يوجد');
  const submission = subDoc.data();

  await db.collection('successStories').add({
    title: submission.title,
    slug: slugify(submission.title) + '-' + Date.now(),
    personName: submission.submitterName,
    personRole: personRole || 'مستخدم SudFree',
    personCity: personCity || '',
    personAvatar: '',
    coverImage: submission.attachments?.[0] || '',
    story: submission.story,
    keyAchievement: keyAchievement || '',
    metricValue: metricValue || 0,
    metricLabel: metricLabel || '',
    category: submission.category,
    isApproved: true,
    isPublished: publishNow !== false,
    submittedAt: submission.submittedAt,
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    views: 0, shares: 0
  });

  await db.collection('storySubmissions').doc(submissionId).update({
    status: 'approved',
    reviewedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await sendEmail({
    to: submission.submitterEmail,
    subject: 'تمت الموافقة على قصتك في Jhome 🎉',
    html: `<p>مرحباً ${submission.submitterName}،</p>
           <p>تمت الموافقة على قصتك "${submission.title}". شكراً لمشاركتك!</p>
           <p>— فريق Jhome</p>`
  });

  return { success: true };
});

exports.adminRejectStory = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  await db.collection('storySubmissions').doc(data.submissionId).update({
    status: 'rejected',
    reviewerNotes: data.notes || '',
    reviewedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { success: true };
});

exports.adminUpdatePageContent = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { pageKey, sections } = data;
  await db.collection('pageContent').doc(pageKey).set({
    pageKey,
    sections,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: context.auth.uid
  }, { merge: true });
  return { success: true };
});

exports.adminMarkMessageRead = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  await db.collection('contactMessages').doc(data.messageId).update({
    status: data.status || 'read',
    repliedAt: data.status === 'replied' ? admin.firestore.FieldValue.serverTimestamp() : null
  });
  return { success: true };
});

exports.adminGetDashboardStats = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const [posts, stories, pending, msgs, subs] = await Promise.all([
    db.collection('posts').where('status', '==', 'published').count().get(),
    db.collection('successStories').where('isPublished', '==', true).count().get(),
    db.collection('storySubmissions').where('status', '==', 'pending').count().get(),
    db.collection('contactMessages').where('status', '==', 'new').count().get(),
    db.collection('newsletter').where('isActive', '==', true).count().get()
  ]);

  const sevenDaysAgo = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const events = await db.collection('analytics_events').where('timestamp', '>', sevenDaysAgo).get();
  const byDay = {};
  events.docs.forEach(d => {
    const day = d.data().timestamp?.toDate?.().toISOString().split('T')[0];
    if (day) byDay[day] = (byDay[day] || 0) + 1;
  });

  return {
    success: true,
    data: {
      totalPosts: posts.data().count,
      totalStories: stories.data().count,
      pendingSubmissions: pending.data().count,
      newMessages: msgs.data().count,
      totalSubscribers: subs.data().count,
      eventsLast7Days: byDay
    }
  };
});

exports.adminMakeAdmin = functions.https.onCall(async (data, context) => {
  // Super admin فقط
  const me = await assertAdmin(context);
  if (me.role !== 'super_admin') {
    throw new functions.https.HttpsError('permission-denied', 'سوبر أدمن فقط');
  }
  const { email, role, displayName } = data;
  try {
    const userRecord = await auth.getUserByEmail(email);
    await db.collection('admins').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName: displayName || email,
      role: role || 'editor',
      permissions: [],
      isActive: true,
      lastLoginAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});