/**
 * Jhome Cloud Functions
 * ---------------------------
 * هذه الـ Functions تستقبل طلبات الموقع وتربطه مع Firestore + Auth + Storage.
 *
 * النشر:
 *   cd functions
 *   npm install
 *   firebase deploy --only functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const { slugify } = require("./utils/slugify");
const { sendEmail } = require("./utils/email");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// ============================================================
// 1) Public API: قراءة المحتوى المنشور (الموقع يطلب منها)
// ============================================================

// GET /api/posts?limit=10&category=تقنية&featured=true
exports.getPublishedPosts = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const category = req.query.category || null;
      const featured = req.query.featured === "true";
      const slug = req.query.slug || null;

      let query = db.collection("posts").where("status", "==", "published");

      if (category) query = query.where("category", "==", category);
      if (featured) query = query.where("isFeatured", "==", true);
      if (slug) query = query.where("slug", "==", slug);

      const snapshot = await query.orderBy("publishedAt", "desc").limit(limit).get();

      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // زيادة عدد المشاهدات (لو طلبنا منشور واحد)
      if (slug && posts.length > 0) {
        await db.collection("posts").doc(posts[0].id).update({
          views: admin.firestore.FieldValue.increment(1)
        });
      }

      res.json({ success: true, count: posts.length, data: posts });
    } catch (err) {
      console.error("getPublishedPosts error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
});

// GET /api/stories?limit=6&category=حرفي
exports.getPublishedStories = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const limit = parseInt(req.query.limit) || 6;
      const category = req.query.category || null;

      let query = db.collection("successStories").where("isPublished", "==", true);

      if (category) query = query.where("category", "==", category);

      const snapshot = await query.orderBy("publishedAt", "desc").limit(limit).get();
      const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.json({ success: true, count: stories.length, data: stories });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
});

// GET /api/page-content?key=home
exports.getPageContent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const pageKey = req.query.key || "home";
      const doc = await db.collection("pageContent").doc(pageKey).get();

      if (!doc.exists) {
        return res.json({ success: false, error: "Page not found" });
      }

      res.json({ success: true, data: doc.data() });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
});

// ============================================================
// 2) Public API: استقبال النماذج من الموقع
// ============================================================

// POST /api/submit-story
exports.submitStory = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }
    try {
      const { submitterName, submitterEmail, submitterPhone, title, story, category, attachments } = req.body;

      // تحقق أساسي
      if (!submitterName || !submitterEmail || !title || !story) {
        return res.status(400).json({ success: false, error: "حقول مطلوبة ناقصة" });
      }
      if (story.length < 20) {
        return res.status(400).json({ success: false, error: "القصة قصيرة جداً" });
      }

      // تحقق بسيط من الإيميل
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
        return res.status(400).json({ success: false, error: "بريد إلكتروني غير صالح" });
      }

      // حماية بسيطة من السبام (Rate limiting بالـ IP)
      const ipAddress = req.headers["x-forwarded-for"] || req.ip;
      const recentSubmissions = await db.collection("storySubmissions")
        .where("ipAddress", "==", ipAddress)
        .where("submittedAt", ">", admin.firestore.Timestamp.fromDate(new Date(Date.now() - 60 * 60 * 1000)))
        .get();

      if (recentSubmissions.size >= 3) {
        return res.status(429).json({ success: false, error: "كثير من المحاولات، حاول بعد ساعة" });
      }

      const submissionData = {
        submitterName,
        submitterEmail,
        submitterPhone: submitterPhone || "",
        title,
        story,
        category: category || "عام",
        attachments: attachments || [],
        status: "pending",
        reviewerNotes: "",
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress
      };

      await db.collection("storySubmissions").add(submissionData);

      // إشعار الأدمن بالبريد
      await sendEmail({
        to: "admin@jhome.sd",
        subject: `قصة جديدة من ${submitterName}`,
        html: `<h2>قصة جديدة بانتظار المراجعة</h2>
               <p><strong>المرسل:</strong> ${submitterName} (${submitterEmail})</p>
               <p><strong>العنوان:</strong> ${title}</p>
               <p><strong>الفئة:</strong> ${category || "عام"}</p>
               <p>${story.substring(0, 200)}...</p>
               <p><a href="https://admin.jhome.sd/stories">راجع في لوحة التحكم</a></p>`
      });

      res.json({ success: true, message: "تم استلام قصتك، سنراجعها قريباً" });
    } catch (err) {
      console.error("submitStory error:", err);
      res.status(500).json({ success: false, error: "حدث خطأ، حاول لاحقاً" });
    }
  });
});

// POST /api/contact
exports.submitContact = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: "حقول مطلوبة ناقصة" });
      }

      await db.collection("contactMessages").add({
        name, email, phone: phone || "", subject: subject || "",
        message, status: "new", notes: "",
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: req.headers["x-forwarded-for"] || req.ip
      });

      await sendEmail({
        to: "admin@jhome.sd",
        subject: `رسالة جديدة من ${name}: ${subject || "بدون موضوع"}`,
        html: `<p><strong>الاسم:</strong> ${name}</p>
               <p><strong>البريد:</strong> ${email}</p>
               <p><strong>الهاتف:</strong> ${phone || "—"}</p>
               <p><strong>الرسالة:</strong></p>
               <blockquote>${message}</blockquote>`
      });

      res.json({ success: true, message: "تم إرسال رسالتك بنجاح" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
});

// POST /api/newsletter-subscribe
exports.subscribeNewsletter = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { email, name, source } = req.body;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: "بريد غير صالح" });
      }

      const existing = await db.collection("newsletter").where("email", "==", email).limit(1).get();
      if (!existing.empty) {
        await existing.docs[0].ref.update({ isActive: true, unsubscribedAt: null });
        return res.json({ success: true, message: "أنت مشترك بالفعل" });
      }

      await db.collection("newsletter").add({
        email,
        name: name || "",
        isActive: true,
        subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
        source: source || "footer"
      });

      res.json({ success: true, message: "تم الاشتراك بنجاح" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
});

// POST /api/track-event
exports.trackEvent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { eventName, eventData, sessionId } = req.body;
      if (!eventName) {
        return res.status(400).json({ success: false, error: "eventName required" });
      }

      await db.collection("analytics_events").add({
        eventName,
        eventData: eventData || {},
        sessionId: sessionId || "anonymous",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userAgent: req.headers["user-agent"] || "",
        ipAddress: req.headers["x-forwarded-for"] || req.ip
      });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
});

// ============================================================
// 3) Admin API (تتطلب Token أدمن)
// ============================================================

// Helper: تحقق من الـ Token
async function verifyAdminToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");
  const decoded = await auth.verifyIdToken(token);
  const adminDoc = await db.collection("admins").doc(decoded.uid).get();
  if (!adminDoc.exists || !adminDoc.data().isActive) {
    throw new Error("Not authorized");
  }
  return { uid: decoded.uid, ...adminDoc.data() };
}

// POST /api/admin/create-post
exports.createPost = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).json({ success: false });
    try {
      const adminUser = await verifyAdminToken(req);
      const data = req.body;

      const slug = data.slug || slugify(data.title);

      // تحقق من تفرد الـ slug
      const existingSlug = await db.collection("posts").where("slug", "==", slug).limit(1).get();
      const finalSlug = existingSlug.empty ? slug : `${slug}-${Date.now()}`;

      // حساب وقت القراءة التقريبي (200 كلمة / دقيقة للعربي)
      const wordCount = data.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0;
      const readingTime = Math.max(1, Math.ceil(wordCount / 180));

      const post = {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt || "",
        content: data.content || "",
        coverImage: data.coverImage || "",
        authorId: adminUser.uid,
        authorName: adminUser.displayName || "جمال أحمد إبراهيم",
        category: data.category || "عام",
        tags: data.tags || [],
        status: data.status || "draft",
        isFeatured: !!data.isFeatured,
        views: 0,
        readingTime,
        language: data.language || "ar",
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.excerpt,
        publishedAt: data.status === "published" ? admin.firestore.FieldValue.serverTimestamp() : null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const ref = await db.collection("posts").add(post);
      res.json({ success: true, id: ref.id, slug: finalSlug });
    } catch (err) {
      res.status(401).json({ success: false, error: err.message });
    }
  });
});

// PUT /api/admin/update-post/:id
exports.updatePost = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await verifyAdminToken(req);
      const postId = req.query.id;
      if (!postId) return res.status(400).json({ success: false, error: "id required" });

      const updates = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };

      // لو تم النشر لأول مرة
      const existing = await db.collection("posts").doc(postId).get();
      if (existing.exists && existing.data().status !== "published" && updates.status === "published") {
        updates.publishedAt = admin.firestore.FieldValue.serverTimestamp();
      }

      await db.collection("posts").doc(postId).update(updates);
      res.json({ success: true });
    } catch (err) {
      res.status(401).json({ success: false, error: err.message });
    }
  });
});

// DELETE /api/admin/delete-post/:id
exports.deletePost = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await verifyAdminToken(req);
      const postId = req.query.id;
      // أرشفة بدل حذف
      await db.collection("posts").doc(postId).update({
        status: "archived",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true, message: "تم الأرشفة" });
    } catch (err) {
      res.status(401).json({ success: false, error: err.message });
    }
  });
});

// POST /api/admin/approve-story/:submissionId
exports.approveStory = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await verifyAdminToken(req);
      const submissionId = req.query.id;
      const submissionDoc = await db.collection("storySubmissions").doc(submissionId).get();
      if (!submissionDoc.exists) return res.status(404).json({ success: false });

      const submission = submissionDoc.data();

      // إنشاء قصة منشورة من التقديم
      const storyData = {
        title: submission.title,
        slug: slugify(submission.title) + "-" + Date.now(),
        personName: submission.submitterName,
        personRole: req.body.personRole || "مستخدم SudFree",
        personCity: req.body.personCity || "",
        personAvatar: "",
        coverImage: submission.attachments?.[0] || "",
        story: submission.story,
        keyAchievement: req.body.keyAchievement || "",
        metricValue: req.body.metricValue || 0,
        metricLabel: req.body.metricLabel || "",
        category: submission.category,
        isApproved: true,
        isPublished: req.body.publishNow !== false,
        submittedAt: submission.submittedAt,
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        views: 0, shares: 0
      };

      await db.collection("successStories").add(storyData);
      await db.collection("storySubmissions").doc(submissionId).update({
        status: "approved",
        reviewedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // إشعار المرسل
      await sendEmail({
        to: submission.submitterEmail,
        subject: "تمت الموافقة على قصتك في Jhome 🎉",
        html: `<p>مرحباً ${submission.submitterName}،</p>
               <p>يسعدنا إبلاغك أن قصتك "${submission.title}" تمت الموافقة عليها وستُنشر قريباً.</p>
               <p>شكراً لمشاركتك قصتك معنا!</p>
               <p>فريق Jhome</p>`
      });

      res.json({ success: true });
    } catch (err) {
      res.status(401).json({ success: false, error: err.message });
    }
  });
});

// GET /api/admin/dashboard-stats
exports.getDashboardStats = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      await verifyAdminToken(req);

      const [postsCount, storiesCount, pendingCount, messagesCount, subscribersCount] = await Promise.all([
        db.collection("posts").where("status", "==", "published").count().get(),
        db.collection("successStories").where("isPublished", "==", true).count().get(),
        db.collection("storySubmissions").where("status", "==", "pending").count().get(),
        db.collection("contactMessages").where("status", "==", "new").count().get(),
        db.collection("newsletter").where("isActive", "==", true).count().get()
      ]);

      // آخر 7 أيام من الزيارات
      const sevenDaysAgo = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      const recentEvents = await db.collection("analytics_events")
        .where("timestamp", ">", sevenDaysAgo)
        .get();

      const eventsByDay = {};
      recentEvents.docs.forEach(doc => {
        const d = doc.data();
        const day = d.timestamp?.toDate?.().toISOString().split("T")[0] || "unknown";
        eventsByDay[day] = (eventsByDay[day] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          totalPosts: postsCount.data().count,
          totalStories: storiesCount.data().count,
          pendingSubmissions: pendingCount.data().count,
          newMessages: messagesCount.data().count,
          totalSubscribers: subscribersCount.data().count,
          eventsLast7Days: eventsByDay
        }
      });
    } catch (err) {
      res.status(401).json({ success: false, error: err.message });
    }
  });
});