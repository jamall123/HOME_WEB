# دليل النشر الكامل — نظام إدارة محتوى Jhome

> **من الصفر إلى موقع Jhome الديناميكي + لوحة التحكم**

هذا الدليل يشرح خطوة بخطوة كيف تنشر النظام كله.

---

## 📋 المتطلبات الأساسية

1. **حاسوب** مع:
   - نظام Linux / macOS / Windows
   - 8GB RAM على الأقل
   - اتصال إنترنت مستقر

2. **حسابات** (كلها مجانية):
   - حساب Google (gmail) — لإدارة Firebase
   - حساب GitHub — لحفظ الكود
   - حساب Domain (اختياري، للدومين المخصص)

3. **برامج** للتثبيت:
   - Node.js v18 أو أحدث — https://nodejs.org
   - Git — https://git-scm.com
   - Flutter SDK — https://flutter.dev
   - Firebase CLI: `npm install -g firebase-tools`
   - Visual Studio Code (موصى به)

---

## 🚀 الخطوات بالترتيب

### المرحلة 1: إنشاء مشروع Firebase (15 دقيقة)

#### 1.1 افتح Firebase Console
- اذهب إلى https://console.firebase.google.com
- اضغط "Add project" / "إضافة مشروع"
- اسم المشروع: `jhome-sudanfree` (أو أي اسم تختاره)
- فعّل Google Analytics (اختياري)

#### 1.2 فعّل الخدمات المطلوبة
داخل المشروع الجديد:

| الخدمة | الإجراء |
|---|---|
| **Authentication** | اضغط "Get started" → فعّل "Email/Password" |
| **Firestore Database** | اضغط "Create database" → Start in **production mode** → اختر موقع قريب (eur3 أو asia-south1) |
| **Storage** | اضغط "Get started" → production mode |
| **Hosting** | اضغط "Get started" (سنرجع له لاحقاً) |
| **Functions** | تحتاج ترقية لـ Blaze Plan (ادفع فقط حسب الاستخدام، فيه حد مجاني سخي) |

#### 1.3 ترقية لـ Blaze Plan
- اذهب لـ Firebase Console → أيقونة الترس (Project settings) → Usage and billing → "Modify plan" → Blaze
- **لا تقلق من الفاتورة**: Google Cloud فيها رصيد مجاني دائم، ولوحة التحكم ستكلفك أقل من دولار واحد شهرياً في الاستخدام العادي.

#### 1.4 احصل على إعدادات الـ Web
- Project settings → Your apps → اضغط `</>` (Web app)
- سمها `Jhome Website`
- **انسخ القيم** التي ستظهر لك — ستحتاجها لاحقاً:
  - apiKey
  - authDomain
  - projectId
  - storageBucket
  - messagingSenderId
  - appId

#### 1.5 احصل على Service Account JSON (مهم للوحة التحكم)
- Project settings → Service accounts → "Generate new private key"
- احفظ الملف `serviceAccountKey.json` في مكان آمن — ستحتاجه لسكريبت إنشاء أول أدمن.

---

### المرحلة 2: تحضير المشروع محلياً (10 دقائق)

#### 2.1 افتح Terminal
```bash
# استنساخ المشروع (لو رفعته على GitHub) أو أنشئ مجلد جديد
mkdir -p ~/projects/jhome-cms
cd ~/projects/jhome-cms
```

#### 2.2 ضع ملفات النظام
- انسخ كل المجلدات اللي بنيناها:
  - `firestore-rules/`
  - `cloud-functions/`
  - `website-integration/`
  - `flutter-admin/`

#### 2.3 تسجيل الدخول لـ Firebase
```bash
firebase login
```

#### 2.4 ربط المجلد بمشروع Firebase
```bash
cd firestore-rules
firebase use --add
# اختر مشروع jhome-sudanfree
```

#### 2.5 تحديث إعدادات Firebase
**افتح ملف `website-integration/js/firebase-config.js`** وعبّ القيم اللي نسختها من الخطوة 1.4:

```javascript
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",            // ← من Firebase Console
  authDomain: "jhome-sudanfree.firebaseapp.com",
  projectId: "jhome-sudanfree",
  storageBucket: "jhome-sudanfree.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:..."
};
```

**افتح ملف `flutter-admin/lib/firebase_options.dart`** وعب نفس القيم.

---

### المرحلة 3: نشر Firestore Rules والـ Indexes (3 دقائق)

```bash
cd firestore-rules
firebase deploy --only firestore:rules,firestore:indexes,storage
```

سيستغرق دقيقة لإنشاء الـ indexes في الخلفية.

---

### المرحلة 4: نشر Cloud Functions (5-10 دقائق)

```bash
cd ../cloud-functions/functions
npm install
cd ..
firebase deploy --only functions
```

**ملاحظة عن Node version:** لو واجهت خطأ، تأكد أن إصدار Node.js هو 18:
```bash
node --version
# يجب أن يعرض v18.x.x أو أحدث
```

**إعداد البريد الإلكتروني (اختياري لكن موصى به):**

```bash
# لو تستخدم SendGrid
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"

# لو تستخدم Gmail SMTP
firebase functions:config:set gmail.email="your-email@gmail.com"
firebase functions:config:set gmail.password="your-app-password"
```

لإنشاء Gmail App Password:
1. https://myaccount.google.com/security
2. فعّل 2-Step Verification
3. App passwords → أنشئ password جديد → انسخه

---

### المرحلة 5: إنشاء أول حساب أدمن (5 دقائق)

#### 5.1 أنشئ حساب في Authentication
- Firebase Console → Authentication → Users → Add user
- أدخل بريدك وكلمة مرور قوية (مثلاً `Jamal@Jhome2026!`)

#### 5.2 أضفك كـ Super Admin في Firestore
**الطريقة الأسهل: استخدم Node.js Script**

أنشئ ملف `setup-admin.js`:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setup() {
  const email = 'jamal@jhome.sd';  // ← بريدك
  const userRecord = await admin.auth().getUserByEmail(email);
  
  await db.collection('admins').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email: email,
    displayName: 'جمال أحمد إبراهيم',
    role: 'super_admin',
    permissions: [
      'posts.create', 'posts.edit', 'posts.delete', 'posts.publish',
      'stories.approve', 'stories.publish',
      'messages.read', 'messages.reply',
      'media.upload', 'media.delete',
      'analytics.view'
    ],
    isActive: true,
    lastLoginAt: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log('✅ Admin created:', email);
}

setup().catch(console.error);
```

شغّله:
```bash
node setup-admin.js
```

---

### المرحلة 6: نشر الموقع (5 دقائق)

#### 6.1 هيئ مجلد dist
أنشئ مجلد `dist/` داخل `website-integration/` وانسخ كل ملفات الموقع:

```bash
cd website-integration
mkdir -p dist
cp -r *.html dist/
cp -r css dist/
cp -r js dist/
cp -r assets dist/  # لو عندك مجلد أصول
```

#### 6.2 انشر على Firebase Hosting
```bash
firebase deploy --only hosting
```

**النتيجة**: موقعك الآن على:
```
https://jhome-sudanfree.web.app
https://jhome-sudanfree.firebaseapp.com
```

#### 6.3 ربط دومين مخصص (اختياري)
- Firebase Console → Hosting → Add custom domain
- اتبع التعليمات لإضافة سجلات DNS

---

### المرحلة 7: نشر لوحة التحكم (10 دقائق)

#### 7.1 هيئ Flutter
```bash
cd ../flutter-admin
flutter pub get
flutterfire configure --project=jhome-sudanfree
# اختر المنصات: web فقط
```

#### 7.2 ابنِ للويب
```bash
flutter build web --release
```

#### 7.3 انشر على Firebase Hosting (نطاق فرعي مختلف)
ننشرها على `admin.yourdomain.com` أو `jhome-admin.web.app`:

**افتح `firebase.json` الرئيسي** وعدّل:
```json
"hosting": {
  "public": "flutter-admin/build/web",
  "rewrites": [...]
}
```

أو استخدم **multi-site**:
```bash
firebase hosting:site:create jhome-admin
firebase target:apply hosting admin jhome-admin
firebase deploy --only hosting:admin
```

لوحة التحكم ستكون على: `https://jhome-admin.web.app`

---

### المرحلة 8: اختبار النظام (10 دقائق)

#### 8.1 اختبر الموقع
1. افتح `https://jhome-sudanfree.web.app`
2. تأكد أن:
   - ✅ الصفحة الرئيسية تفتح
   - ✅ صفحة المدونة تعمل وتعرض "لا توجد مقالات"
   - ✅ صفحة قصص النجاح تعمل
   - ✅ صفحة تواصل تعمل

#### 8.2 اختبر لوحة التحكم
1. افتح `https://jhome-admin.web.app`
2. سجّل دخول بحساب الأدمن
3. أنشئ مقال اختباري
4. انشره، ثم افتح الموقع وتحقق من ظهوره

#### 8.3 اختبر تقديم قصة
1. من الموقع، اذهب لـ "شاركنا قصتك"
2. املأ النموذج وأرسل
3. ارجع للوحة التحكم → قصص النجاح → موافقة ونشر

---

## 🛠️ مهام بعد النشر

### أضف صفحة المحتوى الافتراضية
من لوحة التحكم → "محتوى الصفحات" → اختر "home" → احفظ (هذا ينشئ المستند).

### أضف المقالات الأولى (5-10 مقالات)
لتبدأ قوية، أنشر هذه المقالات كحد أدنى:
1. "قصة Jhome: من فكرة إلى واقع"
2. "كيف يخدم SudFree المجتمع السوداني"
3. "دليل البدء مع SudFree للحرفيين"
4. "مستقبل التقنية في السودان"
5. "أهمية الثقة في المنصات الرقمية"

### فعّل Google Analytics (اختياري)
داخل Firebase Console → Analytics → Connect

### فعّل SEO
كل مقال عنده `seoTitle` و `seoDescription`. استخدم كلمات مفتاحية مثل:
- "تطبيق سوداني"
- "خدمات السودان"
- "عمل حر السودان"
- "SudFree"

---

## 💰 تقدير التكلفة الشهرية

| الخدمة | الاستخدام المتوقع | التكلفة |
|---|---|---|
| Firebase Hosting | 10 GB نقل بيانات | مجاني |
| Firestore | 50K قراءة / 20K كتابة يومياً | مجاني (ضمن الحصة) |
| Cloud Functions | 2M استدعاء / شهر | مجاني (ضمن الحصة) |
| Cloud Storage | 5 GB تخزين | مجاني |
| **الإجمالي** | — | **$0 — $5/شهر** |

لو تجاوزت الحصة المجانية، ستدفع فعلياً فقط ما استخدمته (Pay as you go).

---

## 🔒 نصائح الأمان المهمة

1. **لا تنشر** ملف `serviceAccountKey.json` على GitHub أبداً.
2. **غيّر كلمة مرور الأدمن** دورياً (كل 3 أشهر).
3. **فعّل 2-Step Verification** على حساب Google المرتبط بـ Firebase.
4. **راجع Firebase Auth → Users** بشكل دوري للتأكد من عدم وجود مستخدمين مشبوهين.
5. **فعّل Cloud Functions Budget Alert** في Google Cloud Console لتنبيهك لو زاد الإنفاق.

---

## 🐛 حل المشاكل الشائعة

### "Permission denied" عند النشر
- تأكد أنك مسجل دخول في Firebase CLI: `firebase login`
- تأكد أنك اخترت المشروع الصحيح: `firebase use`

### "Module not found" في Cloud Functions
- احذف `node_modules/` وأعد `npm install`

### صفحة الموقع بيضاء
- افتح Developer Console في المتصفح (F12)
- تحقق من أخطاء JavaScript
- تأكد من صحة إعدادات Firebase في `firebase-config.js`

### لوحة التحكم لا تتصل بـ Firebase
- تأكد من صحة `firebase_options.dart`
- تأكد من أنك شغّلت `flutterfire configure`

### "Functions deployment failed"
- تأكد من إصدار Node.js (18+)
- تأكد من تفعيل Blaze Plan

---

## 📞 الدعم

- **وثائق Firebase**: https://firebase.google.com/docs
- **وثائق Flutter**: https://docs.flutter.dev
- **مجتمع Firebase**: https://firebase.google.com/community

---

**مبروك! 🎉** عندك الآن موقع Jhome ديناميكي كامل مع لوحة تحكم احترافية.

**التالي:** اقرأ ملف `../11-future-enhancements.md` لمزيد من الميزات التي يمكنك إضافتها لاحقاً.