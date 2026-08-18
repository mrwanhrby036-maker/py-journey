/* ==========================================================================
   PyJourney — Curriculum (Data-Driven)
   ==========================================================================
   هذا الملف يعرّف المنهج بشكل بيانات منظمة لسهولة التوسعة.

   - `chapters`: الفصول المنفّذة حاليًا بمحتوى ودروس كاملة (تُعرض في الواجهة).
   - `roadmap`:  بقية المنهج المخطط له (تُوثَّق هنا، وتُضاف كدروس في
                 lessons.js ثم يُنقل الفصل إلى `chapters` عند اكتماله).

   لإضافة فصل جديد:
   1) أضف دروسه إلى lessons.js.
   2) انقل تعريف الفصل من `roadmap` إلى `chapters`.
   ========================================================================== */

const Curriculum = {
  brand: "PyJourney",
  tagline: "لا تشاهد البرمجة… مارسها.",

  // الشخصيات الأصلية للمنصة
  characters: {
    nova: { id: "nova", name: "نوفا", role: "المرشدة", color: "nova" },
    code: { id: "code", name: "كود", role: "صديق الكود", color: "code" },
    mix:  { id: "mix",  name: "مكس",  role: "شريك التطبيق", color: "mix" },
  },

  difficulty: ["سهل جدًا", "سهل", "متوسط", "فوق المتوسط", "صعب", "تحدٍّ"],

  // ===== الفصول المنفّذة (بمحتوى حقيقي) =====
  chapters: [
    {
      id: "ch00", num: "00", title: "قبل أن تبدأ",
      desc: "ما هي البرمجة؟ وكيف تفكّر كمبرمج؟",
      lessonIds: ["what-is-programming", "how-computer-works", "what-is-code", "what-is-language", "algorithm-pseudocode", "think-programmer", "what-is-python", "how-to-learn"],
    },
    {
      id: "ch01", num: "01", title: "أول خطوات Python",
      desc: "شغّل أول برنامج واطبع على الشاشة.",
      lessonIds: ["first-program", "print", "strings-basics", "numbers-basics", "comments", "indentation", "reading-errors", "first-exercises"],
    },
    {
      id: "ch02", num: "02", title: "المتغيرات Variables",
      desc: "صناديق تخزّن القيم وتحمل أسماءً.",
      lessonIds: ["what-is-variable", "change-variable", "naming-rules", "multiple-variables", "input"],
    },
    {
      id: "ch03", num: "03", title: "أنواع البيانات Data Types",
      desc: "النص والرقم والمنطق والتحويل بينها.",
      lessonIds: ["types-intro", "conversion", "types-errors"],
    },
    {
      id: "ch04", num: "04", title: "العمليات Operators",
      desc: "العمليات الحسابية والمقارنة والمنطق.",
      lessonIds: ["arithmetic", "comparison", "logical"],
    },
    {
      id: "ch05", num: "05", title: "النصوص Strings",
      desc: "الفهرسة والطول وأدوات التعامل مع النص.",
      lessonIds: ["strings-intro", "string-methods", "string-slicing", "f-strings"],
    },
    {
      id: "ch06", num: "06", title: "الشروط Conditions",
      desc: "اجعل البرنامج يقرّر: if و else و elif.",
      lessonIds: ["if-else", "elif", "nested-conditions", "truthiness"],
    },
    {
      id: "ch07", num: "07", title: "الحلقات Loops",
      desc: "كرّر الأوامر: while و for و range.",
      lessonIds: ["while-loop", "for-loop", "break-continue", "nested-loops", "infinite-loops"],
    },
    {
      id: "ch08", num: "08", title: "القوائم Lists",
      desc: "تخزين مجموعة قيم مرتبة والتعامل معها.",
      lessonIds: ["lists-intro", "list-slicing", "list-methods", "list-iteration", "list-comprehension"],
    },
    {
      id: "ch09", num: "09", title: "Tuples",
      desc: "قوائم غير قابلة للتغيير.",
      lessonIds: ["tuples-intro", "tuple-unpacking"],
    },
    {
      id: "ch10", num: "10", title: "المجموعات Sets",
      desc: "قيم فريدة بلا تكرار.",
      lessonIds: ["sets-intro"],
    },
    {
      id: "ch11", num: "11", title: "القواميس Dictionaries",
      desc: "أزواج مفتاح/قيمة للبيانات المرتبطة.",
      lessonIds: ["dicts-intro", "dict-iteration", "nested-dicts"],
    },
    {
      id: "ch12", num: "12", title: "الدوال Functions",
      desc: "إعادة استخدام الكود: def و return.",
      lessonIds: ["functions-intro", "parameters-return", "default-params", "scope", "lambda"],
    },
    {
      id: "ch13", num: "13", title: "الأخطاء وتصحيحها",
      desc: "قراءة traceback والتصحيح المنهجي.",
      lessonIds: ["error-types", "debugging"],
    },
    {
      id: "ch14", num: "14", title: "معالجة الأخطاء Exceptions",
      desc: "try و except للتعامل الآمن.",
      lessonIds: ["try-except", "raise-finally"],
    },
    {
      id: "ch15", num: "15", title: "الملفات Files",
      desc: "القراءة والكتابة في الملفات.",
      lessonIds: ["files-intro"],
    },
    {
      id: "ch16", num: "16", title: "البيانات المنظّمة JSON",
      desc: "صيغة تبادل البيانات العالمي.",
      lessonIds: ["json-intro"],
    },
    {
      id: "ch17", num: "17", title: "الوحدات Modules",
      desc: "استيراد المكتبات الجاهزة.",
      lessonIds: ["modules-intro"],
    },
    {
      id: "ch18", num: "18", title: "البرمجة الكائنية OOP",
      desc: "class و object وتنظيم الكود.",
      lessonIds: ["oop-intro"],
    },
    {
      id: "ch19", num: "19", title: "Python متوسط",
      desc: "sorted و comprehensions.",
      lessonIds: ["intermediate-intro"],
    },
    {
      id: "ch20", num: "20", title: "Python متقدم",
      desc: "type hints و generators.",
      lessonIds: ["advanced-intro"],
    },
    {
      id: "ch21", num: "21", title: "الاختبار Testing",
      desc: "assertions والتحقق من الكود.",
      lessonIds: ["testing-intro"],
    },
    {
      id: "ch22", num: "22", title: "الكود النظيف",
      desc: "التسمية ومبدأ DRY.",
      lessonIds: ["clean-code"],
    },
    {
      id: "ch23", num: "23", title: "Python في العالم الحقيقي",
      desc: "CLI و APIs ومعالجة البيانات.",
      lessonIds: ["real-world"],
    },
    {
      id: "ch24", num: "24", title: "المشاريع المتدرجة",
      desc: "مشاريع عملية ومشروع التخرج.",
      lessonIds: ["projects-beginner", "projects-intermediate", "capstone"],
    },
  ],

  // كل المنهج مكتمل الآن. يبقى هذا فارغًا للفصول المستقبلية.
  roadmap: [],
};

window.Curriculum = Curriculum;
