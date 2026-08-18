/* ==========================================================================
   PyJourney — Chapter Assessments
   كل فصل له اختبار يجمع: معرفة، قراءة كود، تصحيح أخطاء، كتابة كود.
   ========================================================================== */

const Quizzes = {

  ch00: {
    chapter: "ch00",
    title: "اختبار: قبل أن تبدأ",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "البرمجة هي…",
        options: [
          { text: "كتابة تعليمات مرتّبة ينفّذها الكمبيوتر", correct: true, why: "هذا جوهر البرمجة." },
          { text: "إصلاح الأجهزة", correct: false, why: "هذه صيانة." },
          { text: "تصميم واجهات فقط", correct: false, why: "التصميم جزء وليس الكل." },
        ],
      },
      {
        type: "mc",
        prompt: "من يحوّل الكود إلى ما يفهمه الكمبيوتر؟",
        options: [
          { text: "المترجم Interpreter", correct: true, why: "المترجم يقرأ كودنا وينفّذه." },
          { text: "الشاشة", correct: false, why: "الشاشة تعرض فقط." },
          { text: "لوحة المفاتيح", correct: false, why: "تدخل النص فقط." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'print("أهلاً")',
        options: [
          { text: "أهلاً", correct: true, why: "print يعرض النص." },
          { text: '"أهلاً"', correct: false, why: "علامات الاقتباس لا تظهر في الناتج." },
          { text: "خطأ", correct: false, why: "الكود صحيح." },
        ],
      },
      {
        type: "tf",
        prompt: "Python سميت بهذا الاسم نسبةً إلى ثعبان.",
        answer: false,
        why: "سميت نسبةً إلى فرقة Monty Python الكوميدية.",
      },
    ],
  },

  ch01: {
    chapter: "ch01",
    title: "اختبار: أول خطوات Python",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "أي كود يعرض الرقم 10؟",
        options: [
          { text: "print(10)", correct: true, why: "الرقم بدون اقتباس." },
          { text: 'print("10")', correct: false, why: "نص وليس رقمًا، لكنه يظهر متشابهًا." },
          { text: "show(10)", correct: false, why: "لا توجد دالة show." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'print(2 + 3 * 2)',
        options: [
          { text: "8", correct: true, why: "الضرب قبل الجمع: 3*2=6 ثم +2=8." },
          { text: "10", correct: false, why: "لا تُحسب من اليسار لليمين بلا أولوية." },
          { text: "7", correct: false, why: "الأولوية للضرب." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'print("7" + "3")',
        options: [
          { text: "73", correct: true, why: "نصان يُلصقان." },
          { text: "10", correct: false, why: "ليسا رقمين." },
          { text: "خطأ", correct: false, why: "الكود صحيح." },
        ],
      },
      {
        type: "mc",
        prompt: "ماذا يفعل السطر الذي يبدأ بـ # ؟",
        options: [
          { text: "تعليق يتجاهله Python", correct: true, why: "ملاحظة لك وليست للكمبيوتر." },
          { text: "أمر تنفيذ خاص", correct: false, why: "لا يُنفَّذ." },
          { text: "يسبب خطأ", correct: false, why: "يُتجاهل تمامًا." },
        ],
      },
    ],
  },

  ch02: {
    chapter: "ch02",
    title: "اختبار: المتغيرات",
    passPercent: 70,
    questions: [
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'x = 10\nx = 20\nprint(x)',
        options: [
          { text: "20", correct: true, why: "آخر قيمة هي المستخدمة." },
          { text: "10", correct: false, why: "استُبدلت القيمة." },
          { text: "30", correct: false, why: "لا تُجمع القيم." },
        ],
      },
      {
        type: "mc",
        prompt: "ماذا تفعل علامة = في x = 5؟",
        options: [
          { text: "تضع 5 داخل المتغير x", correct: true, why: "إسناد." },
          { text: "تقارن x بالعدد 5", correct: false, why: "المقارنة ==." },
          { text: "تساوي رياضيًا", correct: false, why: "معناها إسناد." },
        ],
      },
      {
        type: "mc",
        prompt: "أي اسم متغير صحيح؟",
        options: [
          { text: "total_price", correct: true, why: "حروف وشرطة سفلية." },
          { text: "2price", correct: false, why: "لا يبدأ برقم." },
          { text: "total price", correct: false, why: "لا مسافات." },
        ],
      },
      {
        type: "mc",
        prompt: "ماذا يعيد input() دائمًا؟",
        options: [
          { text: "نصًا String", correct: true, why: "حتى الأرقام تُقرأ كنص." },
          { text: "رقمًا", correct: false, why: "لا، نص دائمًا." },
          { text: "لا شيء", correct: false, why: "يعيد ما كتبه المستخدم." },
        ],
      },
    ],
  },

  ch03: {
    chapter: "ch03",
    title: "اختبار: أنواع البيانات",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ما نوع القيمة 3.5؟",
        options: [
          { text: "float", correct: true, why: "عدد عشري." },
          { text: "int", correct: false, why: "الصحيح بدون فاصلة." },
          { text: "str", correct: false, why: "ليس بين اقتباس." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'print(int("7") + int("3"))',
        options: [
          { text: "10", correct: true, why: "تحويلان ثم جمع." },
          { text: "73", correct: false, why: "لو بلا تحويل لكان لصقًا." },
          { text: "خطأ", correct: false, why: "الكود صحيح." },
        ],
      },
      {
        type: "mc",
        prompt: "لماذا يحدث TypeError في: \"العدد \" + 10؟",
        options: [
          { text: "جمع نص مع رقم بـ +", correct: true, why: "يتطلب نفس النوع." },
          { text: "الرقم كبير", correct: false, why: "الحجم ليس مشكلة." },
          { text: "النص عربي", correct: false, why: "اللغة ليست مشكلة." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'print(bool(0))',
        options: [
          { text: "False", correct: true, why: "الصفر يتحول إلى False." },
          { text: "True", correct: false, why: "الصفر يعتبر False." },
          { text: "0", correct: false, why: "bool تعيد True أو False." },
        ],
      },
    ],
  },

  ch04: {
    chapter: "ch04",
    title: "اختبار: العمليات",
    passPercent: 70,
    questions: [
      {
        type: "po",
        prompt: "ما ناتج print(10 % 3)؟",
        options: [
          { text: "1", correct: true, why: "باقي قسمة 10 على 3." },
          { text: "3", correct: false, why: "هذا ناتج //." },
          { text: "0", correct: false, why: "الباقي هو 1." },
        ],
      },
      {
        type: "mc",
        prompt: "ما الفرق بين = و == ؟",
        options: [
          { text: "= إسناد، == مقارنة", correct: true, why: "فرق أساسي." },
          { text: "لا فرق", correct: false, why: "الفرق كبير." },
          { text: "== إسناد، = مقارنة", correct: false, why: "العكس." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج print(True or False)؟",
        options: [
          { text: "True", correct: true, why: "يكفي صحة أحدهما." },
          { text: "False", correct: false, why: "or تعيد True هنا." },
          { text: "خطأ", correct: false, why: "الكود صحيح." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج print(2 ** 4)؟",
        options: [
          { text: "16", correct: true, why: "2 مرفوعة للقوة 4." },
          { text: "8", correct: false, why: "هذا 2*4 وليس الأس." },
          { text: "6", correct: false, why: "الأس وليس الجمع." },
        ],
      },
    ],
  },
  ch05: {
    chapter: "ch05",
    title: "اختبار: النصوص",
    passPercent: 70,
    questions: [
      {
        type: "po",
        prompt: "ما ناتج print(\"hello\"[1])؟",
        options: [
          { text: "e", correct: true, why: "الفهرس 1 هو الحرف الثاني." },
          { text: "h", correct: false, why: "h فهرسه 0." },
          { text: "l", correct: false, why: "l فهرسه 2." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج print(\"hello\"[-1])؟",
        options: [
          { text: "o", correct: true, why: "-1 هو آخر حرف." },
          { text: "h", correct: false, why: "h هو الأول." },
          { text: "خطأ", correct: false, why: "الكود صحيح." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج print(\"Hello\".upper())؟",
        options: [
          { text: "HELLO", correct: true, why: "upper تحوّل لحروف كبيرة." },
          { text: "hello", correct: false, why: "هذه lower." },
          { text: "Hello", correct: false, why: "تتغير كل الحروف." },
        ],
      },
      {
        type: "mc",
        prompt: "ما ناتج print(len(\"abc\"))؟",
        options: [
          { text: "3", correct: true, why: "ثلاثة حروف." },
          { text: "2", correct: false, why: "len يعدّ كل الحروف." },
          { text: "خطأ", correct: false, why: "الكود صحيح." },
        ],
      },
    ],
  },

  ch06: {
    chapter: "ch06",
    title: "اختبار: الشروط",
    passPercent: 70,
    questions: [
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'x = 5\nif x > 3:\n    print("أ")\nelse:\n    print("ب")',
        options: [
          { text: "أ", correct: true, why: "5 أكبر من 3." },
          { text: "ب", correct: false, why: "الشرط صحيح." },
          { text: "أ و ب", correct: false, why: "ينفذ أحدهما فقط." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'x = 15\nif x > 10:\n    print("أ")\nelif x > 5:\n    print("ب")',
        options: [
          { text: "أ", correct: true, why: "أول شرط صحيح." },
          { text: "ب", correct: false, why: "لا يتحقق بعد شرط صحيح." },
          { text: "أ و ب", correct: false, why: "ينفذ الأول فقط." },
        ],
      },
      {
        type: "mc",
        prompt: "ماذا تعني elif؟",
        options: [
          { text: "وإلا إذا", correct: true, why: "اختصار else if." },
          { text: "نهاية الشروط", correct: false, why: "النهاية else." },
          { text: "شرط إجباري", correct: false, why: "اختيارية." },
        ],
      },
      {
        type: "mc",
        prompt: "ما الذي يحدد محتوى كتلة if؟",
        options: [
          { text: "المسافة البادئة", correct: true, why: "indentation." },
          { text: "الأقواس", correct: false, why: "هذه لغات أخرى." },
          { text: "لا شيء", correct: false, why: "المسافة ضرورية." },
        ],
      },
    ],
  },

  ch07: {
    chapter: "ch07",
    title: "اختبار: الحلقات",
    passPercent: 70,
    questions: [
      {
        type: "po",
        prompt: "ما ناتج range(3)؟",
        options: [
          { text: "0, 1, 2", correct: true, why: "من 0 إلى 2." },
          { text: "1, 2, 3", correct: false, why: "تبدأ من 0." },
          { text: "0, 1, 2, 3", correct: false, why: "النهاية غير مشمولة." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'n = 1\nwhile n <= 2:\n    print(n)\n    n = n + 1',
        options: [
          { text: "1\n2", correct: true, why: "تطبع 1 ثم 2." },
          { text: "1", correct: false, why: "تستمر ما دام الشرط." },
          { text: "1\n2\n3", correct: false, why: "الشرط يتوقف عند 2." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'for i in range(3):\n    if i == 1:\n        continue\n    print(i)',
        options: [
          { text: "0\n2", correct: true, why: "continue تتخطى 1." },
          { text: "0\n1\n2", correct: false, why: "تخطينا 1." },
          { text: "0", correct: false, why: "تستمر الحلقة بعد التخطي." },
        ],
      },
      {
        type: "mc",
        prompt: "ما الفرق بين break و continue؟",
        options: [
          { text: "break توقف، continue تتجاوز دورة", correct: true, why: "الفرق الجوهري." },
          { text: "لا فرق", correct: false, why: "الفرق كبير." },
          { text: "continue توقف الحلقة", correct: false, why: "العكس." },
        ],
      },
    ],
  },
  ch08: {
    chapter: "ch08",
    title: "اختبار: القوائم",
    passPercent: 70,
    questions: [
      {
        type: "po",
        prompt: "ما ناتج print([10, 20, 30][1])؟",
        options: [
          { text: "20", correct: true, why: "الفهرس 1 هو العنصر الثاني." },
          { text: "10", correct: false, why: "10 فهرسه 0." },
          { text: "30", correct: false, why: "30 فهرسه 2." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'x = [1]\nx.append(2)\nprint(len(x))',
        options: [
          { text: "2", correct: true, why: "أضفنا عنصرًا للواحد." },
          { text: "1", correct: false, why: "append تضيف عنصرًا." },
          { text: "3", correct: false, why: "عنصران فقط." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج print(2 in [1, 2, 3])؟",
        options: [
          { text: "True", correct: true, why: "2 موجود في القائمة." },
          { text: "False", correct: false, why: "2 موجود فعلًا." },
          { text: "خطأ", correct: false, why: "الكود صحيح." },
        ],
      },
      {
        type: "mc",
        prompt: "ماذا تفعل sort()؟",
        options: [
          { text: "ترتب القائمة تصاعديًا", correct: true, why: "هذا دور sort." },
          { text: "تعكس القائمة", correct: false, why: "العكس هو reverse." },
          { text: "تحذف القائمة", correct: false, why: "لا تحذف." },
        ],
      },
    ],
  },

  ch09: {
    chapter: "ch09",
    title: "اختبار: Tuples",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ما الفرق بين tuple و list؟",
        options: [
          { text: "tuple غير قابلة للتغيير", correct: true, why: "هذا الفرق الجوهري." },
          { text: "لا فرق", correct: false, why: "الفرق مهم." },
          { text: "list أسرع دائمًا", correct: false, why: "الفرق ليس السرعة." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج print((1, 2, 3)[2])؟",
        options: [
          { text: "3", correct: true, why: "الفهرس 2 هو الثالث." },
          { text: "2", correct: false, why: "2 فهرسه 1." },
          { text: "خطأ", correct: false, why: "الكود صحيح." },
        ],
      },
      {
        type: "mc",
        prompt: "متى نختار tuple؟",
        options: [
          { text: "للبيانات الثابتة التي لا تتغير", correct: true, why: "immutability تحميها." },
          { text: "للبيانات المتغيرة", correct: false, why: "المتغيرة تحتاج list." },
          { text: "دائمًا", correct: false, why: "الاختيار يعتمد على الحالة." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج len((5, 6, 7))؟",
        options: [
          { text: "3", correct: true, why: "ثلاثة عناصر." },
          { text: "2", correct: false, why: "يوجد ثلاثة." },
          { text: "خطأ", correct: false, why: "الكود صحيح." },
        ],
      },
    ],
  },

  ch10: {
    chapter: "ch10",
    title: "اختبار: المجموعات",
    passPercent: 70,
    questions: [
      {
        type: "po",
        prompt: "ما ناتج len(set([5, 5, 5]))؟",
        options: [
          { text: "1", correct: true, why: "التكرار يُحذف." },
          { text: "3", correct: false, why: "قيمة واحدة فقط." },
          { text: "0", correct: false, why: "توجد قيمة." },
        ],
      },
      {
        type: "mc",
        prompt: "ما الخاصية الأساسية للمجموعة؟",
        options: [
          { text: "لا تكرار فيها", correct: true, why: "التفرد هو الأساس." },
          { text: "مرتبة دائمًا", correct: false, why: "الترتيب غير مضمون." },
          { text: "مثل القائمة", correct: false, why: "الفرق هو التفرد." },
        ],
      },
      {
        type: "mc",
        prompt: "ماذا تفعل union؟",
        options: [
          { text: "تدمج مجموعتين بلا تكرار", correct: true, why: "الاتحاد." },
          { text: "تأخذ المشترك", correct: false, why: "المشترك هو intersection." },
          { text: "تحذف مجموعة", correct: false, why: "لا تحذف." },
        ],
      },
    ],
  },

  ch11: {
    chapter: "ch11",
    title: "اختبار: القواميس",
    passPercent: 70,
    questions: [
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'd = {"a": 1, "b": 2}\nprint(d["a"] + d["b"])',
        options: [
          { text: "3", correct: true, why: "1 + 2 = 3." },
          { text: "12", correct: false, why: "القيم أرقام." },
          { text: "خطأ", correct: false, why: "الكود صحيح." },
        ],
      },
      {
        type: "mc",
        prompt: "ما الذي يميز القاموس؟",
        options: [
          { text: "كل قيمة مرتبطة بمفتاح", correct: true, why: "key: value." },
          { text: "قيم مرقمة", correct: false, why: "هذه القائمة." },
          { text: "لا تكرار", correct: false, why: "هذه المجموعة." },
        ],
      },
      {
        type: "mc",
        prompt: "ماذا تعيد keys()؟",
        options: [
          { text: "مفاتيح القاموس", correct: true, why: "keys = مفاتيح." },
          { text: "قيم القاموس", correct: false, why: "القيم values." },
          { text: "الأزواج", correct: false, why: "الأزواج items." },
        ],
      },
      {
        type: "mc",
        prompt: "كيف نتجنب KeyError عند الوصول؟",
        options: [
          { text: "استخدام get()", correct: true, why: "get تعيد قيمة افتراضية." },
          { text: "حذف المفتاح", correct: false, why: "الحذف لا يحل المشكلة." },
          { text: "لا طريقة", correct: false, why: "get هي الحل." },
        ],
      },
    ],
  },

  ch12: {
    chapter: "ch12",
    title: "اختبار: الدوال",
    passPercent: 70,
    questions: [
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'def f(x):\n    return x + 1\nprint(f(5))',
        options: [
          { text: "6", correct: true, why: "5 + 1." },
          { text: "5", correct: false, why: "أضفنا 1." },
          { text: "f(5)", correct: false, why: "تطبع القيمة المرجعة." },
        ],
      },
      {
        type: "mc",
        prompt: "ما الفرق بين print و return؟",
        options: [
          { text: "print يعرض، return يعيد قيمة", correct: true, why: "الفرق الجوهري." },
          { text: "لا فرق", correct: false, why: "الفرق كبير." },
          { text: "return يعرض", correct: false, why: "العرض هو print." },
        ],
      },
      {
        type: "mc",
        prompt: "متى ينفَّذ كود الدالة؟",
        options: [
          { text: "عند استدعائها", correct: true, why: "الاستدعاء ينفّذ." },
          { text: "عند تعريفها", correct: false, why: "التعريف لا ينفّذ." },
          { text: "تلقائيًا", correct: false, why: "لا بد من الاستدعاء." },
        ],
      },
      {
        type: "mc",
        prompt: "ما هو المتغير المحلي؟",
        options: [
          { text: "معرّف داخل دالة ولا يُرى خارجها", correct: true, why: "النطاق المحلي." },
          { text: "معرّف في كل البرنامج", correct: false, why: "هذا العام." },
          { text: "بلا اسم", correct: false, why: "كل المتغيرات لها أسماء." },
        ],
      },
    ],
  },

  ch13: {
    chapter: "ch13",
    title: "اختبار: الأخطاء",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "متى يحدث NameError؟",
        options: [
          { text: "استخدام اسم غير معرّف", correct: true, why: "متغير غير موجود." },
          { text: "خلط أنواع", correct: false, why: "هذا TypeError." },
          { text: "قسمة على صفر", correct: false, why: "هذا ZeroDivisionError." },
        ],
      },
      {
        type: "mc",
        prompt: "من أين نبدأ قراءة traceback؟",
        options: [
          { text: "آخر سطر (نوع الخطأ)", correct: true, why: "النوع في الأسفل." },
          { text: "أول سطر", correct: false, why: "الأول للمكان." },
          { text: "المنتصف", correct: false, why: "البداية من النهاية." },
        ],
      },
      {
        type: "mc",
        prompt: "ما أفضل خطوة أولى عند الخطأ؟",
        options: [
          { text: "قراءة الرسالة بعناية", correct: true, why: "الرسالة تخبرك بالمشكلة." },
          { text: "حذف الكود", correct: false, why: "لا تحل المشكلة." },
          { text: "تعديل كل شيء", correct: false, why: "المنهجية أفضل." },
        ],
      },
    ],
  },

  ch14: {
    chapter: "ch14",
    title: "اختبار: معالجة الأخطاء",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ماذا يحدث عند خطأ داخل try؟",
        options: [
          { text: "ينتقل التنفيذ إلى except", correct: true, why: "هذا دور try/except." },
          { text: "ينهار البرنامج", correct: false, why: "except تمنع ذلك." },
          { text: "يعاد try", correct: false, why: "لا إعادة تلقائية." },
        ],
      },
      {
        type: "po",
        prompt: "ما ناتج هذا الكود؟",
        code: 'try:\n    x = 1 / 0\nexcept:\n    print("خطأ")',
        options: [
          { text: "خطأ", correct: true, why: "القسمة على صفر تُلتقط." },
          { text: "لا شيء", correct: false, why: "except تطبع." },
          { text: "0", correct: false, why: "القسمة على صفر خطأ." },
        ],
      },
      {
        type: "mc",
        prompt: "متى نستخدم try/except؟",
        options: [
          { text: "للأخطاء المتوقعة كمدخلات المستخدم", correct: true, why: "هذا الاستخدام الصحيح." },
          { text: "لإخفاء كل الأخطاء", correct: false, why: "لا نخفي الأخطاء الحقيقية." },
          { text: "أبدًا", correct: false, why: "مفيدة جدًا." },
        ],
      },
    ],
  },

  ch15: {
    chapter: "ch15",
    title: "اختبار: الملفات",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ماذا تعني \"w\" عند فتح ملف؟",
        options: [
          { text: "الكتابة", correct: true, why: "w = write." },
          { text: "القراءة", correct: false, why: "القراءة r." },
          { text: "الإضافة", correct: false, why: "الإضافة a." },
        ],
      },
      {
        type: "mc",
        prompt: "لماذا نستخدم with؟",
        options: [
          { text: "إغلاق الملف تلقائيًا بأمان", correct: true, why: "هذا دور with." },
          { text: "تسريع القراءة", correct: false, why: "الهدف الأمان." },
          { text: "إضافة محتوى", correct: false, why: "الإضافة وضع a." },
        ],
      },
      {
        type: "mc",
        prompt: "ماذا تفعل \"a\" عند فتح ملف؟",
        options: [
          { text: "الإضافة دون مسح المحتوى", correct: true, why: "a = append." },
          { text: "مسح المحتوى", correct: false, why: "المسح في w." },
          { text: "القراءة فقط", correct: false, why: "القراءة r." },
        ],
      },
    ],
  },

  ch16: {
    chapter: "ch16",
    title: "اختبار: JSON",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ماذا تفعل json.dumps؟",
        options: [
          { text: "تحوّل بيانات Python إلى نص JSON", correct: true, why: "dumps = إلى نص." },
          { text: "تحوّل JSON إلى Python", correct: false, why: "هذه loads." },
          { text: "تحذف بيانات", correct: false, why: "لا تحذف." },
        ],
      },
      {
        type: "mc",
        prompt: "أين يُستخدم JSON؟",
        options: [
          { text: "تواصل المواقع (APIs)", correct: true, why: "لغة تبادل البيانات." },
          { text: "تصميم الصور", correct: false, why: "لا علاقة." },
          { text: "تسريع الأجهزة", correct: false, why: "لا علاقة." },
        ],
      },
      {
        type: "mc",
        prompt: "بماذا يشبه JSON؟",
        options: [
          { text: "القواميس والقوائم", correct: true, why: "نفس البنية تقريبًا." },
          { text: "الصور", correct: false, why: "ليس صورًا." },
          { text: "الصوت", correct: false, why: "ليس صوتًا." },
        ],
      },
    ],
  },

  ch17: {
    chapter: "ch17",
    title: "اختبار: الوحدات",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ماذا تفعل import math؟",
        options: [
          { text: "تستورد وحدة الرياضيات", correct: true, why: "import يجلب الوحدة." },
          { text: "تنشئ وحدة", correct: false, why: "يجلب الموجود." },
          { text: "تحذف وحدة", correct: false, why: "لا تحذف." },
        ],
      },
      {
        type: "mc",
        prompt: "ما هي المكتبة القياسية؟",
        options: [
          { text: "وحدات جاهزة مع Python", correct: true, why: "Standard Library." },
          { text: "مكتبة مدفوعة", correct: false, why: "مجانية." },
          { text: "مكتبة صور", correct: false, why: "مجالات كثيرة." },
        ],
      },
    ],
  },

  ch18: {
    chapter: "ch18",
    title: "اختبار: OOP",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ما هو الـ class؟",
        options: [
          { text: "قالب تصنع منه كائنات", correct: true, why: "تعريف class." },
          { text: "كائن واحد", correct: false, why: "الكائن object." },
          { text: "دالة عادية", correct: false, why: "أكثر من دالة." },
        ],
      },
      {
        type: "mc",
        prompt: "ماذا تفعل __init__؟",
        options: [
          { text: "تجهز خصائص الكائن عند إنشائه", correct: true, why: "دالة البناء." },
          { text: "تحذف الكائن", correct: false, why: "لا تحذف." },
          { text: "تطبع الكائن", correct: false, why: "ليست للطباعة." },
        ],
      },
      {
        type: "mc",
        prompt: "إلى ماذا تشير self؟",
        options: [
          { text: "الكائن نفسه", correct: true, why: "self = الكائن." },
          { text: "الكلاس", correct: false, why: "الكلاس هو class." },
          { text: "دالة أخرى", correct: false, why: "ليست دالة." },
        ],
      },
    ],
  },

  ch19: {
    chapter: "ch19",
    title: "اختبار: Python المتوسط",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ما الفرق بين sort و sorted؟",
        options: [
          { text: "sorted تعيد قائمة جديدة دون تغيير الأصلية", correct: true, why: "sort تعدّل في مكانها." },
          { text: "لا فرق", correct: false, why: "الفرق مهم." },
          { text: "sorted أبطأ", correct: false, why: "الفرق ليس السرعة." },
        ],
      },
      {
        type: "mc",
        prompt: "ما هي list comprehension؟",
        options: [
          { text: "بناء قائمة بحلقة في سطر", correct: true, why: "صيغة مختصرة." },
          { text: "دالة جاهزة", correct: false, why: "صيغة لا دالة." },
          { text: "نوع بيانات", correct: false, why: "ليست نوعًا." },
        ],
      },
    ],
  },

  ch20: {
    chapter: "ch20",
    title: "اختبار: Python المتقدم",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "بماذا يُكتب generator بدل return؟",
        options: [
          { text: "yield", correct: true, why: "yield تنتج قيمًا." },
          { text: "print", correct: false, why: "للعرض فقط." },
          { text: "break", correct: false, why: "للحلقات." },
        ],
      },
      {
        type: "mc",
        prompt: "ما فائدة type hints؟",
        options: [
          { text: "توضيح الأنواع", correct: true, why: "للوضوح." },
          { text: "تسريع الكود", correct: false, why: "لا تغيّر الأداء." },
          { text: "إلزامية", correct: false, why: "اختيارية." },
        ],
      },
    ],
  },

  ch21: {
    chapter: "ch21",
    title: "اختبار: الاختبار",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ماذا يفعل assert عند فشل الشرط؟",
        options: [
          { text: "يرمي AssertionError", correct: true, why: "يفشل بصوت عالٍ." },
          { text: "يتجاهل", correct: false, why: "لا يتجاهل." },
          { text: "يصلح الكود", correct: false, why: "لا يصلح." },
        ],
      },
      {
        type: "mc",
        prompt: "ما هي Edge Cases؟",
        options: [
          { text: "الحالات الطرفية كصفر وسالب", correct: true, why: "الحواف." },
          { text: "الحالات العادية", correct: false, why: "العادية ليست حوافًا." },
          { text: "أخطاء", correct: false, why: "ليست أخطاء." },
        ],
      },
    ],
  },

  ch22: {
    chapter: "ch22",
    title: "اختبار: الكود النظيف",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ماذا يعني DRY؟",
        options: [
          { text: "لا تكرر نفسك", correct: true, why: "Don't Repeat Yourself." },
          { text: "اكتب مرتين", correct: false, why: "العكس." },
          { text: "احذف التعليقات", correct: false, why: "لا علاقة." },
        ],
      },
      {
        type: "mc",
        prompt: "متى تستخدم دالة؟",
        options: [
          { text: "عند تكرار نفس الكود", correct: true, why: "الدالة تمنع التكرار." },
          { text: "للكود الطويل فقط", correct: false, why: "التكرار هو المعيار." },
          { text: "أبدًا", correct: false, why: "الدوال أساسية." },
        ],
      },
    ],
  },

  ch23: {
    chapter: "ch23",
    title: "اختبار: العالم الحقيقي",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ماذا يعني CLI؟",
        options: [
          { text: "برامج سطر الأوامر", correct: true, why: "Command Line Interface." },
          { text: "واجهة رسومية", correct: false, why: "هذه GUI." },
          { text: "لغة أخرى", correct: false, why: "أسلوب واجهة." },
        ],
      },
      {
        type: "mc",
        prompt: "ما أفضل طريقة لتحويل المعرفة لمهارة؟",
        options: [
          { text: "بناء مشاريع حقيقية", correct: true, why: "المشاريع تثبت المهارة." },
          { text: "قراءة فقط", correct: false, why: "القراءة لا تكفي." },
          { text: "حفظ الكود", correct: false, why: "الحفظ لا يبني مهارة." },
        ],
      },
    ],
  },

  ch24: {
    chapter: "ch24",
    title: "اختبار: المشاريع",
    passPercent: 70,
    questions: [
      {
        type: "mc",
        prompt: "ما أفضل طريقة لبناء مشروع كبير؟",
        options: [
          { text: "تقسيمه إلى مراحل ودوال صغيرة", correct: true, why: "مهارة المبرمج." },
          { text: "كتابته دفعة واحدة", correct: false, why: "التقسيم أفضل." },
          { text: "نسخ كود جاهز", correct: false, why: "النسخ لا يبني مهارة." },
        ],
      },
      {
        type: "mc",
        prompt: "لماذا نحسب المتوسط بقسمة المجموع على len؟",
        options: [
          { text: "لأن المتوسط = المجموع ÷ العدد", correct: true, why: "تعريف المتوسط." },
          { text: "لأن الضرب أسرع", correct: false, why: "القسمة هي الصحيحة." },
          { text: "لا سبب", correct: false, why: "هناك سبب واضح." },
        ],
      },
    ],
  },
};

window.Quizzes = Quizzes;
