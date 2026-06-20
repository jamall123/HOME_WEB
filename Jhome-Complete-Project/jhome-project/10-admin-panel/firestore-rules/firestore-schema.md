# Firestore Schema — Jhome Website CMS

> هذا هو الهيكل الذي سيستخدمه الموقع ولوحة التحكم لتخزين المحتوى الديناميكي.

---

## المجموعات (Collections)

### 1. `posts` — المدونات والأخبار

```javascript
{
  id: "auto-generated",
  title: "عنوان المقال",
  slug: "عنوان-في-الرابط",        // يُولّد تلقائياً من العنوان
  excerpt: "ملخص قصير",            // 150-200 حرف
  content: "محتوى HTML كامل",      // من محرر النصوص
  coverImage: "https://...",        // صورة رئيسية
  authorId: "user_id",
  authorName: "جمال أحمد إبراهيم",
  category: "تقنية" | "أخبار" | "قصص نجاح" | "رؤية" | "إعمار",
  tags: ["sudfree", "jhome", "ai"],
  status: "draft" | "published" | "archived",
  isFeatured: false,                // هل يظهر في الرئيسية؟
  views: 0,
  readingTime: 5,                   // دقائق
  language: "ar" | "en",
  seoTitle: "",
  seoDescription: "",
  publishedAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Indexes المطلوبة:**
- `status` ASC + `publishedAt` DESC
- `category` ASC + `publishedAt` DESC
- `isFeatured` ASC + `publishedAt` DESC

---

### 2. `successStories` — قصص النجاح

```javascript
{
  id: "auto-generated",
  title: "عنوان القصة",
  slug: "...",
  personName: "اسم الشخص/المؤسسة",
  personRole: "حرفي سباكة",
  personCity: "الخرطوم",
  personAvatar: "https://...",
  coverImage: "https://...",
  story: "محتوى القصة (HTML)",
  keyAchievement: "حقق 200 طلب في 3 أشهر",
  metricValue: 200,
  metricLabel: "عميل سعيد",
  category: "حرفي" | "متجر" | "موظف" | "عميل",
  isApproved: false,               // موافقة الأدمن قبل النشر
  isPublished: false,
  submittedAt: Timestamp,
  approvedAt: Timestamp,
  publishedAt: Timestamp,
  views: 0,
  shares: 0
}
```

---

### 3. `storySubmissions` — قصص المستخدمين قبل المراجعة

```javascript
{
  id: "auto-generated",
  submitterName: "...",
  submitterEmail: "...",
  submitterPhone: "...",
  title: "...",
  story: "...",
  category: "...",
  attachments: ["url1", "url2"],   // صور اختيارية
  status: "pending" | "approved" | "rejected",
  reviewerNotes: "",
  submittedAt: Timestamp,
  reviewedAt: Timestamp,
  ipAddress: "..."                 // للحماية من السبام
}
```

---

### 4. `contactMessages` — رسائل التواصل

```javascript
{
  id: "auto-generated",
  name: "...",
  email: "...",
  phone: "...",
  subject: "...",
  message: "...",
  status: "new" | "read" | "replied" | "archived",
  notes: "",                        // ملاحظات الأدمن
  receivedAt: Timestamp,
  repliedAt: Timestamp,
  ipAddress: "..."
}
```

---

### 5. `pageContent` — محتوى الصفحات القابل للتعديل

```javascript
{
  // Document ID = اسم الصفحة (مثل "home", "about", "projects")
  pageKey: "home",
  sections: {
    hero: {
      title: "...",
      subtitle: "...",
      primaryButtonText: "...",
      primaryButtonLink: "...",
      secondaryButtonText: "...",
      secondaryButtonLink: "...",
      backgroundImage: "..."
    },
    about: {
      title: "...",
      content: "..."
    },
    contact: {
      email: "...",
      phone: "...",
      whatsapp: "...",
      address: "..."
    },
    social: {
      facebook: "...",
      twitter: "...",
      instagram: "...",
      youtube: "...",
      telegram: "...",
      tiktok: "..."
    }
  },
  updatedAt: Timestamp,
  updatedBy: "user_id"
}
```

---

### 6. `media` — مكتبة الوسائط

```javascript
{
  id: "auto-generated",
  filename: "...",
  originalName: "...",
  url: "https://firebasestorage...",
  thumbnailUrl: "...",
  mimeType: "image/jpeg",
  size: 102400,                     // بالبايت
  width: 1920,
  height: 1080,
  altText: "",
  uploadedBy: "user_id",
  uploadedAt: Timestamp,
  // للصور المرفوعة من قصص المستخدمين (لها صلاحية محدودة)
  folder: "general" | "stories" | "blog" | "avatars"
}
```

---

### 7. `admins` — صلاحيات الأدمن

```javascript
{
  // Document ID = Firebase Auth UID
  uid: "...",
  email: "...",
  displayName: "...",
  role: "super_admin" | "editor" | "viewer",
  permissions: [
    "posts.create", "posts.edit", "posts.delete", "posts.publish",
    "stories.approve", "stories.publish",
    "messages.read", "messages.reply",
    "media.upload", "media.delete",
    "analytics.view"
  ],
  isActive: true,
  lastLoginAt: Timestamp,
  createdAt: Timestamp
}
```

---

### 8. `analytics` — إحصائيات الزيارات

```javascript
// Collection: pageViews
{
  page: "/",
  date: "2026-06-19",
  views: 145,
  uniqueVisitors: 98
}

// Collection: events
{
  eventName: "post_view" | "story_submit" | "contact_form_submit" | "app_download_click",
  eventData: { postId: "...", source: "..." },
  timestamp: Timestamp,
  sessionId: "...",
  userAgent: "...",
  ipAddress: "...",
  country: "SD"
}
```

---

### 9. `newsletter` — المشتركين في النشرة

```javascript
{
  id: "auto-generated",
  email: "...",
  name: "",
  isActive: true,
  subscribedAt: Timestamp,
  unsubscribedAt: Timestamp,
  source: "footer" | "blog" | "popup"
}
```

---

## قواعد الأمان (Firestore Security Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ----- المساعد: هل المستخدم أدمن؟ -----
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isActive == true;
    }

    function isSuperAdmin() {
      return isAdmin() &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin';
    }

    // ----- الموقع يقرأ فقط المحتوى المنشور -----
    match /posts/{postId} {
      allow read: if resource.data.status == 'published';
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    match /successStories/{storyId} {
      allow read: if resource.data.isPublished == true;
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    // أي زائر يقدر يرسل قصة أو رسالة
    match /storySubmissions/{submissionId} {
      allow create: if request.resource.data.keys().hasAll(['submitterName', 'submitterEmail', 'title', 'story'])
                    && request.resource.data.title.size() > 3
                    && request.resource.data.story.size() > 20;
      allow read, update, delete: if isAdmin();
    }

    match /contactMessages/{messageId} {
      allow create: if request.resource.data.keys().hasAll(['name', 'email', 'message'])
                    && request.resource.data.message.size() > 5;
      allow read, update, delete: if isAdmin();
    }

    match /pageContent/{pageKey} {
      allow read: if true;  // الكل يقدر يقرأ إعدادات الموقع
      allow write: if isAdmin();
    }

    match /media/{mediaId} {
      allow read: if true;
      // الأدمن فقط يرفع صور
      allow create: if isAdmin() && request.resource.data.size < 10 * 1024 * 1024; // 10MB
      allow update, delete: if isSuperAdmin();
    }

    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if isSuperAdmin();
    }

    // الزوار لا يقرؤون الإحصائيات مباشرة - يتم عبر Cloud Functions
    match /analytics/{document=**} {
      allow read, write: if isAdmin();
    }

    match /analytics/{document=**} {
      allow create: if request.resource.data.keys().hasAll(['eventName', 'timestamp']);
      allow read: if isAdmin();
    }

    match /newsletter/{emailId} {
      allow create: if request.resource.data.keys().hasAll(['email'])
                    && request.resource.data.email.matches('.*@.*\\..*');
      allow read, update, delete: if isAdmin();
    }
  }
}
```

---

## التخزين (Firebase Storage Rules)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    match /media/{allPaths=**} {
      // الأدمن فقط يرفع
      allow read: if true;
      allow write: if request.auth != null &&
                      exists(/databases/(default)/documents/admins/$(request.auth.uid)) &&
                      request.resource.size < 10 * 1024 * 1024;
    }

    // رفع المرفقات من قبل الزوار (لقصص النجاح مثلاً)
    match /submissions/{submissionId}/{fileName} {
      allow read: if false;  // لا أحد يقرأ مباشرة إلا من خلال الأدمن
      allow write: if request.resource.size < 5 * 1024 * 1024
                    && (request.resource.contentType.matches('image/.*'));
    }
  }
}
```

---

## ملاحظات مهمة

1. **التواقيت (Timestamps):** دائماً تخزن كـ `serverTimestamp()` لضمان الدقة.
2. **الأمان:** لا تثق أبداً في الـ Frontend — تحقق في Cloud Functions قبل أي تعديل حساس.
3. **الصور:** استخدم Firebase Hosting CDN مع صور محسّنة (WebP, صور متعددة الأحجام).
4. **الأرشفة:** لا تحذف أبداً، استخدم `status: "archived"`.
5. **اللغات:** حالياً عربي، البنية جاهزة لإضافة إنجليزي بتعبئة حقل `language`.

---

**التالي:** بناء Cloud Functions للتكامل مع الموقع.