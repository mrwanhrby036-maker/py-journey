/* ==========================================================================
   PyJourney — Smart Review System (Spaced Repetition مبسّط)
   ----------------------------------------------------------------
   يتذكر المواضيع التي أخطأ فيها الطالب ويعرض مراجعة سريعة بعد عدة دروس.
   لا يحتاج أي AI — منطق محلي بسيط.
   ========================================================================== */

const Review = (() => {
  // خريطة المواضيع → أسئلة مراجعة سريعة (بيانات ثابتة)
  const reviewQuestions = {
    "print": {
      label: "print()",
      questions: [
        {
          type: "mc",
          prompt: "كيف نعرض نصًا على الشاشة؟",
          options: [
            { text: 'print("نص")', correct: true },
            { text: "show(نص)", correct: false },
            { text: "display(نص)", correct: false },
          ],
        },
        {
          type: "po",
          prompt: "ما ناتج print(2 + 3)؟",
          options: [
            { text: "5", correct: true },
            { text: "23", correct: false },
            { text: "2 + 3", correct: false },
          ],
        },
      ],
    },
    "variable": {
      label: "المتغيرات",
      questions: [
        {
          type: "po",
          prompt: "ما ناتج x = 10; x = 20; print(x)؟",
          options: [
            { text: "20", correct: true },
            { text: "10", correct: false },
            { text: "30", correct: false },
          ],
        },
        {
          type: "mc",
          prompt: "ماذا تفعل علامة = ؟",
          options: [
            { text: "إسناد قيمة", correct: true },
            { text: "مقارنة", correct: false },
            { text: "جمع", correct: false },
          ],
        },
      ],
    },
    "type": {
      label: "أنواع البيانات",
      questions: [
        {
          type: "mc",
          prompt: "ما نوع القيمة 3.5؟",
          options: [
            { text: "float", correct: true },
            { text: "int", correct: false },
            { text: "str", correct: false },
          ],
        },
        {
          type: "po",
          prompt: "ما ناتج int(\"7\") + int(\"3\")؟",
          options: [
            { text: "10", correct: true },
            { text: "73", correct: false },
            { text: "خطأ", correct: false },
          ],
        },
      ],
    },
    "operator": {
      label: "العمليات",
      questions: [
        {
          type: "po",
          prompt: "ما ناتج 10 % 3؟",
          options: [
            { text: "1", correct: true },
            { text: "3", correct: false },
            { text: "0", correct: false },
          ],
        },
        {
          type: "mc",
          prompt: "ما رمز الأس في Python؟",
          options: [
            { text: "**", correct: true },
            { text: "^", correct: false },
            { text: "^^", correct: false },
          ],
        },
      ],
    },
    "string": {
      label: "النصوص",
      questions: [
        {
          type: "po",
          prompt: "ما ناتج print(\"7\" + \"3\")؟",
          options: [
            { text: "73", correct: true },
            { text: "10", correct: false },
            { text: "خطأ", correct: false },
          ],
        },
        {
          type: "po",
          prompt: "ما ناتج print(\"hello\"[0])؟",
          options: [
            { text: "h", correct: true },
            { text: "e", correct: false },
            { text: "خطأ", correct: false },
          ],
        },
      ],
    },
    "condition": {
      label: "الشروط",
      questions: [
        {
          type: "po",
          prompt: "ما ناتج هذا الكود؟",
          code: 'x = 5\nif x > 3:\n    print("نعم")',
          options: [
            { text: "نعم", correct: true },
            { text: "لا شيء", correct: false },
            { text: "خطأ", correct: false },
          ],
        },
        {
          type: "mc",
          prompt: "ماذا تعني elif؟",
          options: [
            { text: "وإلا إذا", correct: true },
            { text: "نهاية الشروط", correct: false },
            { text: "شرط إجباري", correct: false },
          ],
        },
      ],
    },
    "loop": {
      label: "الحلقات",
      questions: [
        {
          type: "po",
          prompt: "ما ناتج range(3)؟",
          options: [
            { text: "0, 1, 2", correct: true },
            { text: "1, 2, 3", correct: false },
            { text: "0, 1, 2, 3", correct: false },
          ],
        },
        {
          type: "po",
          prompt: "ما ناتج هذا الكود؟",
          code: 'n = 0\nwhile n < 2:\n    n = n + 1\nprint(n)',
          options: [
            { text: "2", correct: true },
            { text: "1", correct: false },
            { text: "0", correct: false },
          ],
        },
      ],
    },
  };

  // إضافة موضوع ضعيف عند الخطأ في تمرين
  function recordFailure(lessonId, topic) {
    Progress.recordWeakTopic(topic);
  }

  // عند النجاح في مراجعة موضوع، يُحذف من القائمة الضعيفة
  function passReview(topic) {
    Progress.clearWeakTopic(topic);
  }

  // توليد جلسة مراجعة من المواضيع الضعيفة
  function buildSession() {
    const weak = Progress.getWeakTopics();
    const topics = Object.keys(weak).filter(t => reviewQuestions[t]);
    if (topics.length === 0) return null;
    // خذ أول موضوع (أو الأعلى تكرارًا)
    topics.sort((a, b) => weak[b].count - weak[a].count);
    const topic = topics[0];
    return {
      topic,
      label: reviewQuestions[topic].label,
      questions: reviewQuestions[topic].questions,
      attempts: weak[topic].count,
    };
  }

  function getTopicLabel(topic) {
    return reviewQuestions[topic] ? reviewQuestions[topic].label : topic;
  }

  return { recordFailure, passReview, buildSession, getTopicLabel };
})();

window.Review = Review;
