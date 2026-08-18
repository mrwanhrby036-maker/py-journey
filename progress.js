/* ==========================================================================
   PyJourney — Progress System (localStorage)
   ----------------------------------------------------------------
   يحفظ: الدروس المكتملة، درجات الاختبارات، محاولات التمارين، التلميحات،
   المواضيع الضعيفة، المشاريع، ونقاط XP. كل شيء محلي — لا حاجة لتسجيل دخول.
   ========================================================================== */

const Progress = (() => {
  const KEY = "pyjourney-progress-v1";

  const defaults = {
    completedLessons: {},   // { lessonId: true }
    quizScores: {},         // { chapterId: { score, total, passedAt } }
    exerciseAttempts: {},   // { lessonId: attempts }
    hintsUsed: {},          // { lessonId: count }
    weakTopics: {},         // { topic: { count, lastAt } }
    reviewQueue: [],        // قائمة مراجعة
    projectsCompleted: {},
    xp: 0,
    level: 1,
    achievements: {},
    currentLesson: null,
    startedAt: null,
  };

  let data = load();
  const saveListeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.assign({}, defaults, parsed);
      }
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(defaults));
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
    // إشعار المستمعين (مثل مزامنة السحابة في Auth)
    saveListeners.forEach((fn) => { try { fn(data); } catch (e) { /* ignore */ } });
  }

  // تسجيل مستمع يُستدعى عند كل حفظ
  function onSave(fn) { saveListeners.push(fn); }

  // تصدير نسخة كاملة من البيانات (للمزامنة السحابية)
  function exportData() { return JSON.parse(JSON.stringify(data)); }

  // استيراد بيانات (من السحابة مثلًا) مع دمج آمن
  function importData(obj) {
    if (!obj || typeof obj !== "object") return;
    const merged = Object.assign({}, defaults);
    for (const k in obj) {
      if (k in defaults && defaults[k] && typeof defaults[k] === "object" && !Array.isArray(defaults[k])) {
        merged[k] = Object.assign({}, defaults[k], obj[k]);
      } else {
        merged[k] = obj[k];
      }
    }
    data = merged;
    save();
  }

  // ---- قراءة ----
  function isLessonComplete(id) { return !!data.completedLessons[id]; }
  function getQuizScore(chapterId) { return data.quizScores[chapterId] || null; }
  function getAttempts(lessonId) { return data.exerciseAttempts[lessonId] || 0; }
  function getHintsUsed(lessonId) { return data.hintsUsed[lessonId] || 0; }
  function getXP() { return data.xp; }
  function getLevel() { return data.level; }
  function getWeakTopics() { return data.weakTopics; }
  function getReviewQueue() { return data.reviewQueue; }
  function getCurrentLesson() { return data.currentLesson; }
  function hasStarted() { return data.startedAt !== null; }
  function getAll() { return data; }

  // ---- كتابة ----
  function completeLesson(id) {
    if (!data.completedLessons[id]) {
      data.completedLessons[id] = true;
      addXP(20);
    }
    data.currentLesson = id;
    save();
  }

  function setCurrentLesson(id) {
    data.currentLesson = id;
    save();
  }

  function startJourney() {
    if (!data.startedAt) data.startedAt = Date.now();
    save();
  }

  function recordAttempt(lessonId) {
    data.exerciseAttempts[lessonId] = (data.exerciseAttempts[lessonId] || 0) + 1;
    save();
  }

  function recordHint(lessonId) {
    data.hintsUsed[lessonId] = (data.hintsUsed[lessonId] || 0) + 1;
    save();
  }

  function recordQuiz(chapterId, score, total, passed) {
    data.quizScores[chapterId] = {
      score, total, passed, passedAt: Date.now(),
    };
    if (passed) addXP(Math.round(50 * (score / total)));
    save();
  }

  // ---- المواضيع الضعيفة (للنظام الذكي) ----
  function recordWeakTopic(topic) {
    if (!data.weakTopics[topic]) data.weakTopics[topic] = { count: 0, lastAt: Date.now() };
    data.weakTopics[topic].count += 1;
    data.weakTopics[topic].lastAt = Date.now();
    // أضفه لقائمة المراجعة إن لم يكن موجودًا
    if (!data.reviewQueue.includes(topic)) data.reviewQueue.push(topic);
    save();
  }

  function clearWeakTopic(topic) {
    delete data.weakTopics[topic];
    data.reviewQueue = data.reviewQueue.filter(t => t !== topic);
    save();
  }

  // ---- XP & Levels ----
  function addXP(amount) {
    data.xp += amount;
    const newLevel = Math.floor(data.xp / 100) + 1;
    if (newLevel > data.level) {
      data.level = newLevel;
      // إنجاز بسيط عند رفع المستوى
      if (!data.achievements["level" + newLevel]) {
        data.achievements["level" + newLevel] = true;
      }
    }
    save();
  }

  // ---- إحصاءات عامة ----
  function stats() {
    const completedCount = Object.keys(data.completedLessons).length;
    const totalLessons = totalLessonCount();
    const chaptersDone = chaptersCompletedCount();
    return {
      completedLessons: completedCount,
      totalLessons,
      chaptersDone,
      xp: data.xp,
      level: data.level,
      weakCount: Object.keys(data.weakTopics).length,
      quizCount: Object.keys(data.quizScores).length,
    };
  }

  function totalLessonCount() {
    return Curriculum.chapters.reduce((acc, c) => acc + c.lessonIds.length, 0);
  }

  function chaptersCompletedCount() {
    let count = 0;
    for (const ch of Curriculum.chapters) {
      if (ch.lessonIds.every(id => isLessonComplete(id))) count++;
    }
    return count;
  }

  function isChapterComplete(chapterId) {
    const ch = Curriculum.chapters.find(c => c.id === chapterId);
    if (!ch) return false;
    return ch.lessonIds.every(id => isLessonComplete(id));
  }

  // هل نجح الطالب في اختبار الفصل؟
  function isChapterPassed(chapterId) {
    const q = data.quizScores[chapterId];
    return !!(q && q.passed);
  }

  // هل درس مقفول؟ (يُفتح إذا اكتمل الدرس السابق، ونجح في اختبار الفصل السابق)
  function isLessonLocked(lessonId) {
    const flat = flattenedLessons();
    const idx = flat.findIndex(l => l.id === lessonId);
    if (idx <= 0) return false;
    const prev = flat[idx - 1];
    if (prev.chapter !== flat[idx].chapter) {
      // درس أول في فصل جديد → يتطلب إكمال دروس الفصل السابق + اجتياز اختباره
      const prevChapter = Curriculum.chapters.find(c => c.id === prev.chapter);
      if (!prevChapter) return false;
      if (!isChapterComplete(prevChapter.id)) return true;
      const hasQuiz = window.Quizzes && window.Quizzes[prevChapter.id];
      if (hasQuiz && !isChapterPassed(prevChapter.id)) return true;
      return false;
    }
    return !isLessonComplete(prev.id);
  }

  function flattenedLessons() {
    const out = [];
    for (const ch of Curriculum.chapters) {
      for (const id of ch.lessonIds) {
        const lesson = Lessons[id];
        if (lesson) out.push({ id, chapter: ch.id, title: lesson.title });
      }
    }
    return out;
  }

  // الدرس التالي
  function nextLesson(lessonId) {
    const flat = flattenedLessons();
    const idx = flat.findIndex(l => l.id === lessonId);
    if (idx === -1 || idx + 1 >= flat.length) return null;
    return flat[idx + 1];
  }

  function prevLesson(lessonId) {
    const flat = flattenedLessons();
    const idx = flat.findIndex(l => l.id === lessonId);
    if (idx <= 0) return null;
    return flat[idx - 1];
  }

  // أول درس غير مكتمل (لزر Continue)
  function nextUncompleted() {
    const flat = flattenedLessons();
    for (const l of flat) {
      if (!isLessonComplete(l.id)) return l;
    }
    return null;
  }

  function reset() {
    data = JSON.parse(JSON.stringify(defaults));
    save();
  }

  return {
    isLessonComplete, completeLesson, setCurrentLesson, getCurrentLesson, hasStarted, startJourney,
    getQuizScore, recordQuiz, recordAttempt, getAttempts, recordHint, getHintsUsed,
    recordWeakTopic, clearWeakTopic, getWeakTopics, getReviewQueue,
    getXP, getLevel, stats, getAll,
    isLessonLocked, isChapterComplete, isChapterPassed, nextLesson, prevLesson, nextUncompleted,
    totalLessonCount, reset, onSave, exportData, importData,
  };
})();

window.Progress = Progress;
