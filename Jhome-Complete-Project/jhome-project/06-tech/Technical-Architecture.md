# الخطة التقنية (Technical Architecture) — Jhome

> **الخطة التقنية الكاملة لمنظومة Jhome من Backend إلى Frontend إلى DevOps.**

---

## الجزء الأول: فلسفة التقنية

### المبادئ

1. **بسيط أولاً، معقد عند الحاجة.** لا تبالغ في الهندسة.
2. **استضف على Firebase** — لا تشغل سيرفرات. أنت لست شركة بنية تحتية.
3. **Flutter في كل مكان** — أقصى استفادة من خبرتك.
4. **OpenAI / Claude APIs** للذكاء الاصطناعي — لا تبنِ نماذج من الصفر.
5. **مجاني أو شبه مجاني** — حافظ على التكلفة منخفضة.

### حزمة التقنية (Tech Stack)

#### Frontend (Apps)
- **Framework:** Flutter 3.x
- **State Management:** Riverpod 2.x
- **UI:** Material 3 + Tailwind-inspired classes
- **Localization:** Arabic (primary), English (secondary)

#### Backend (Server)
- **BaaS:** Firebase
  - Firestore (قاعدة البيانات)
  - Authentication (المصادقة)
  - Storage (تخزين الملفات)
  - Cloud Functions (منطق الخادم)
  - Cloud Messaging (إشعارات Push)
  - Remote Config (تحديثات فورية)
  - App Check (حماية من bots)

#### AI / ML
- **OpenAI GPT-4o** — توليد النصوص، التوصيات، تحليل البلاغات.
- **Anthropic Claude** — للنصوص الطويلة (المقالات، التوثيق).
- **Google Cloud Vision** — تحليل الصور (الأعمال السابقة للحرفي).
- **Whisper API** — تحويل الصوت إلى نص (للمقابلات الصوتية).
- **Embedding API** — البحث الدلالي في المستقبل.

#### DevOps
- **Git:** GitHub
- **CI/CD:** GitHub Actions (free tier)
- **Hosting:** Firebase Hosting
- **Monitoring:** Firebase Crashlytics + Sentry
- **Analytics:** Firebase Analytics + Mixpanel (مستقبلي)

#### أدوات إضافية
- **Figma** للتصميم
- **Notion** للتوثيق الداخلي
- **Linear** لإدارة المهام
- **Slack** للتواصل الداخلي
- **1Password** لكلمات المرور

---

## الجزء الثاني: معمارية SudFree

### قاعدة البيانات (Firestore Schema)

```
sudfree_db/
├── users/                    # كل المستخدمين (عملاء + حرفيون + متاجر)
│   ├── {userId}/
│   │   ├── profile: { ... }
│   │   ├── role: "customer" | "provider" | "shop_owner"
│   │   ├── location: GeoPoint
│   │   └── ...
│
├── services/                 # الخدمات المعروضة
│   ├── {serviceId}/
│   │   ├── providerId
│   │   ├── title, description, category
│   │   ├── pricing
│   │   ├── photos[]
│   │   ├── location
│   │   ├── rating, reviewsCount
│   │   └── ...
│
├── shops/                    # المتاجر
│   ├── {shopId}/
│   │   ├── ownerId
│   │   ├── name, description
│   │   ├── products/ (subcollection)
│   │   ├── openingHours
│   │   └── ...
│
├── orders/                   # الطلبات
│   ├── {orderId}/
│   │   ├── customerId, providerId
│   │   ├── status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled"
│   │   ├── price, payment
│   │   └── ...
│
├── chats/                    # المحادثات
│   ├── {chatId}/
│   │   ├── participants[]
│   │   ├── messages/ (subcollection)
│   │   └── lastMessageAt
│
├── reviews/                  # التقييمات
│   ├── {reviewId}/
│   │   ├── orderId, reviewerId, revieweeId
│   │   ├── rating (1-5)
│   │   ├── comment
│   │   └── photos[]
│
├── notifications/            # الإشعارات
│   ├── {notificationId}/
│   │   ├── userId, type, payload
│   │   └── read: bool
│
└── analytics_events/         # أحداث التحليلات
    └── {eventId}/
```

### Collections إضافية للمنصة الأوسع

```
jhome_platform/
├── posts/                    # مدونات الموقع
├── successStories/           # قصص النجاح
├── storySubmissions/         # تقديمات الزوار
├── contactMessages/          # رسائل التواصل
├── pageContent/              # محتوى صفحات الموقع
├── media/                    # مكتبة الوسائط
├── admins/                   # قائمة الأدمن
└── newsletter/               # المشتركين في النشرة
```

---

## الجزء الثالث: معمارية Firebase Functions

### أنماط الاستخدام

#### 1. Callable Functions (موصى بها للعمليات الحساسة)
- تستدعي من الـ Frontend مباشرة.
- Token المستخدم يُرسل تلقائياً.
- سهلة التحقق من الصلاحيات.

```javascript
// مثال: استدعاء من Flutter
final result = await FirebaseFunctions.instance
    .httpsCallable('createOrder')
    .call({'providerId': 'xxx', 'serviceId': 'yyy'});
```

#### 2. Firestore Triggers
- تنفذ تلقائياً عند تغيير بيانات.
- مثال: عند إنشاء تقييم → حدّث متوسط تقييم الحرفي.

```javascript
exports.onReviewCreated = functions.firestore
    .document('reviews/{reviewId}')
    .onCreate(async (snap, context) => {
      // حدّث متوسط التقييم
    });
```

#### 3. HTTP Functions (للـ Webhooks والتكاملات)
- للربط مع خدمات خارجية (مثلاً: Stripe webhook).

#### 4. Scheduled Functions
- تنفذ في أوقات محددة.
- مثال: كل يوم أحد الساعة 12 صباحاً → نظف الإشعارات القديمة.

---

## الجزء الرابع: الأمان

### المصادقة (Authentication)

- **Firebase Auth** مع Email + Password كافتراضي.
- **OTP via SMS** للسودان (عبر Firebase Phone Auth).
- **OAuth** (Google, Facebook) لتسجيل دخول أسرع.
- **Anonymous Auth** للدخول السريع وتجربة التطبيق.

### التفويض (Authorization)

- **Firestore Security Rules** للتحكم في الوصول على مستوى البيانات.
- **Custom Claims** في Firebase Auth لتعيين الأدوار (role: admin, provider, customer).
- **Cloud Functions** للتحقق من العمليات الحساسة.

### حماية البيانات

- **تشفير البيانات في Transit:** HTTPS إجباري.
- **تشفير في Rest:** Firebase يفعّل هذا تلقائياً.
- **PII Detection:** فحص تلقائي للأرقام الشخصية.
- **GDPR-like compliance:** خيار حذف الحساب وكل البيانات.

### منع الإساءة

- **App Check** للتأكد أن الطلبات تأتي من التطبيق الحقيقي.
- **Rate Limiting** على Cloud Functions.
- **Spam Detection** للنماذج العامة.

---

## الجزء الخامس: الأداء

### استراتيجيات تحسين الأداء

#### 1. Firestore
- **Indexes** صحيحة لكل الاستعلامات.
- **Pagination** بـ `startAfter` للتحميل التدريجي.
- **Subcollections** للبيانات الكبيرة (مثل messages).
- **Composite indexes** للاستعلامات المركبة.

#### 2. الصور
- **Cloud Storage + CDN** من Firebase.
- **ضغط الصور** قبل الرفع (max 1080p).
- **WebP format** للويب.
- **Lazy loading** في القوائم.

#### 3. التطبيق
- **Code splitting** في Flutter Web.
- **Tree shaking** للحذف التلقائي للكود غير المستخدم.
- **Caching** للبيانات التي لا تتغير كثيراً.

#### 4. الموقع
- **Firebase Hosting CDN** عالمي.
- **Pre-rendering** للصفحات العامة.
- **Service Worker** للعمل offline.

---

## الجزء السادس: الذكاء الاصطناعي في Jhome

### حالات الاستخدام (Use Cases)

#### في SudFree (التطبيق):
1. **توصيات الخدمات:** بناءً على موقعك وسجل بحثك.
2. **تحسين أوصاف الخدمات:** يكتبها تلقائياً بناءً على صور العمل.
3. **كشف السلوك المشبوه:** احتيال، سبام، تقييمات مزيفة.
4. **مساعد الدردشة:** يجيب على أسئلة المستخدمين.
5. **الترجمة الفورية:** من العربية للإنجليزية (للمغتربين).

#### في Jhome (الموقع):
1. **توليد ملخص المقالات** تلقائياً.
2. **اقتراح الكلمات المفتاحية** SEO.
3. **تحسين جودة الصور** تلقائياً.
4. **تحليل المشاعر** في التعليقات.

#### في العمليات الداخلية:
1. **كتابة محتوى السوشيال ميديا** (أفكار + مسودات).
2. **تحليل التعليقات** لاكتشاف المشاكل.
3. **توليد التقارير** من البيانات.
4. **مساعدة في الكود** (Cursor, Copilot).

### الـ Prompts الأساسية (محفوظة)

ملف `ai-prompts.md` يحتوي على:
- Prompt لكتابة منشورات السوشيال ميديا.
- Prompt لتحليل تقييم سلبي.
- Prompt لتوليد وصف خدمة.
- Prompt لكتابة مقال مدونة.
- إلخ.

---

## الجزء السابع: CI/CD

### GitHub Actions

#### عند Push لـ main:
1. تشغيل الاختبارات.
2. تشغيل `flutter analyze`.
3. بناء APK (debug).
4. نشر Firestore Rules (إذا تغيرت).

#### عند Tag:
1. بناء APK موقّع.
2. بناء IPA (iOS، لو متاح).
3. نشر على Firebase App Distribution للاختبار.
4. تحديث رقم الإصدار.

#### عند Merge لـ production:
1. نشر Cloud Functions.
2. نشر الموقع.

---

## الجزء الثامن: المراقبة والإنذارات

### Firebase Crashlytics
- تتبع كل الأعطال في التطبيق.
- إنذارات فورية للأخطاء الجديدة.
- ربط الأخطاء بـ Firebase (للمستخدمين المتأثرين).

### Firebase Performance
- تتبع وقت تحميل الشاشات.
- تتبع استجابة الشبكة.
- تحديد bottlenecks.

### Cloud Monitoring
- مراقبة استخدام Cloud Functions.
- إنذارات لو تجاوزت ميزانية معينة.
- تتبع الأخطاء في الـ Logs.

### Sentry (اختياري، للتطبيق)
- تتبع أخطاء أكثر تفصيلاً.
- تسجيل الجلسات (Session Replay).
- ربط بـ GitHub Issues تلقائياً.

---

## الجزء التاسع: خطة التوسع

### من 0 إلى 1000 مستخدم
- كل شيء على Firebase مجاني (Blaze plan).
- لا حاجة للبنية التحتية الخاصة.

### من 1000 إلى 100,000 مستخدم
- راجع أسعار Firebase (ربما تبدأ تدفع قليلاً).
- فكّر في Redis للـ caching.
- فكّر في خوادم CDN مخصصة (Cloudflare مثلاً).

### من 100,000 إلى 1,000,000 مستخدم
- ابدأ فكّر في الـ microservices.
- انقل بعض المنطق لـ Cloud Run أو GKE.
- فريق DevOps مخصص.

---

## الجزء العاشر: قرارات معمارية مهمة

### لماذا Flutter وليس React Native؟
- لأن المؤسس (جمال) عنده خبرة فيه.
- لأن الأداء أفضل على أجهزة الفئة المتوسطة (مهم للسودان).
- لأن كود واحد لكل المنصات.

### لماذا Firebase وليس AWS/Amplify؟
- لأن Firebase أبسط وأسرع في الإعداد.
- لأن حصة مجانية سخية.
- لأن تكامل ممتاز مع Flutter.

### لماذا Firestore وليس Realtime Database؟
- لأن Firestore أحدث وأقوى.
- لأن Firestore يدعم استعلامات أكثر تعقيداً.
- لأن Firestore يدعم offline بشكل أفضل.

### متى نفكر في البنية التحتية الخاصة؟
- عندما تتجاوز التكلفة 1000$/شهر.
- عندما نحتاج تحكم دقيق بالـ latency.
- عندما نوافق على مستثمرين بملايين الدولارات.

---

## الجزء الحادي عشر: ملخص تنفيذي

> **Jhome** تستخدم **Flutter + Firebase** كحزمة تقنية أساسية. النظام **Serverless** بالكامل، يعمل بتكلفة شبه معدومة، قابل للتوسع تلقائياً. الأمان عبر **Firebase Auth + Security Rules + Custom Claims**. الذكاء الاصطناعي عبر **OpenAI + Claude APIs** كخدمات خارجية. المراقبة عبر **Firebase Crashlytics + Cloud Monitoring**.
>
> المنهج: **بسّط أولاً، توسع عند الحاجة.**

---

**التالي:** اقرأ `07-execution/Execution-Roadmap.md` لخطة التنفيذ المرحلية.