# PyJourney — تعلّم Python بالممارسة 🐍

منصة تفاعلية بالعربية تعلّمك **Python من الصفر حتى الاحتراف** عبر رحلة تدريبية حقيقية: تكتب الكود بنفسك من أول درس، يشغّل في متصفحك مباشرة، ويراجع تقدّمك تلقائيًا.

> شعارنا: **لا تشاهد البرمجة… مارسها.**

---

## ✨ المميزات

- **25 فصلًا** و **72 درسًا** من الصفر المطلق إلى المتقدم.
- **Python حقيقي داخل المتصفح** عبر Pyodide (WebAssembly) — بدون أي خادم أو API مدفوع.
- **محرر كود كامل** بأرقام أسطر، تشغيل، رسائل خطأ مفسّرة بالعربية.
- **قصّة → حوار → شرح → رسم → "هيا نجرب" → محرر → تشغيل → تحقق** في كل درس.
- **3 مستويات تلميحات + الحل**، مع مراجعة ذكية للمواضيع الضعيفة.
- **اختبارات فصول** (نسبة نجاح 70%) تفتح الفصل التالي.
- **3 شخصيات تعليمية**: نوفا، كود، مكس.
- **نظام XP ومستويات** خفيف يشجّع دون أن يطغى على التعلّم.
- **حفظ التقدّم** محليًا + مزامنة سحابية عبر Firebase.
- **تسجيل دخول وإنشاء حساب** (بريد + كلمة مرور، وGoogle).
- **واجهة RTL** عربية بالكامل، متجاوبة، وموصولة (accessible).

---

## 🚀 التشغيل

كل الملفات في نفس المجلد — لا يحتاج أي بنية مجلدات فرعية.

### الطريقة الأسهل (بدون تثبيت أي شيء)
افتح `index.html` مباشرة في المتصفح (نقر مزدوج). تعمل المصادقة المحلية وحفظ التقدّم محليًا.

> **ملاحظة:** عند الفتح المباشر من القرص، لن تعمل بعض مزايا Firebase (لأنها تتطلب نطاقًا). للاختبار الكامل:

### عبر خادم محلي
```bash
# داخل مجلد المشروع
python3 -m http.server 8080
# ثم افتح http://localhost:8080
```

### النشر على GitHub Pages
1. ارفع **كل ملفات هذا المجلد** إلى مستودع GitHub.
2. Settings → Pages → اختار الفرع والمجلد (Root) → Save.
3. هيطلع لك رابط `https://اسمك.github.io/اسم-المستودع/`.

---

## 🗂️ الملفات

| الملف | الوصف |
|---|---|
| `index.html` | الصفحة الرئيسية (تستدعي كل الملفات مباشرة) |
| `style.css`, `lesson.css`, `editor.css`, `responsive.css`, `auth.css` | التنسيقات |
| `curriculum.js`, `lessons.js`, `quizzes.js` | **المحتوى التعليمي** (25 فصلًا، 72 درسًا، 25 اختبارًا) |
| `interpreter.js` | مترجم بسيط مدمج (fallback) |
| `python-runtime.js` | مشغّل Python عبر Pyodide |
| `progress.js` | التقدّم وXP والمستويات (localStorage) |
| `review.js` | المراجعة الذكية للمواضيع الضعيفة |
| `editor.js` | مكوّن محرر الكود |
| `ui.js` | الأيقونات ومكوّنات العرض |
| `auth.js` | المصادقة والحسابات (Firebase + وضع محلي) |
| `firebase-config.js` | **ضع هنا بيانات مشروعك** في Firebase |
| `app.js` | التوجيه والصفحات ومنطق التمارين |
| `*.png` | صور الدروس والشعارات |

---

## 🔥 إعداد Firebase (اختياري)

بدون إعداد Firebase تعمل المنصة بوضع **الحسابات المحلية** (تجريبية على الجهاز).

لتفعيل الحسابات السحابية وحفظ التقدّم عبر الأجهزة:

1. أنشئ مشروعًا في [Firebase Console](https://console.firebase.google.com).
2. فعّل **Authentication** (بريد + كلمة مرور، وGoogle إن أردت).
3. فعّل **Realtime Database**.
4. انسخ بيانات الويب (Web SDK) وضعها في `firebase-config.js`:

```js
const FirebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

5. ضع **قواعد الأمان** في Realtime Database → Rules (انظر المثال أدناه).

---

## 🔒 قواعد الأمان الموصى بها (Realtime Database)

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('isAdmin').val() === true)",
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('isAdmin').val() === true)",
        "isAdmin": { ".write": "root.child('users').child(auth.uid).child('isAdmin').val() === true" },
        "approved": { ".write": "root.child('users').child(auth.uid).child('isAdmin').val() === true" }
      }
    },
    "adminNotifications": {
      ".read": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
      ".write": "auth != null"
    },
    "deletedEmails": {
      ".read": true,
      ".write": "root.child('users').child(auth.uid).child('isAdmin').val() === true"
    }
  }
}
```

---

## 🧑‍🏫 إضافة محتوى جديد

كل المحتوى **بيانات منظمة** — لا تحتاج تعديل أي كود:

1. أضف الدرس في `lessons.js` (انسخ بنية درس موجود).
2. سجّل معرفه في `curriculum.js` داخل الفصل المناسب.
3. (اختياري) أضف اختبار فصل في `quizzes.js`.

---

## 📄 الترخيص

مشروع تعليمي مفتوح. استخدمه بحرّية للتعلّم والتدريس.
