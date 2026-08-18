/* ==========================================================================
   PyJourney — App (Routing & Pages)
   ----------------------------------------------------------------
   التوجيه بين الصفحات (الرئيسية، الدرس، التقدم، المراجعة، الاختبار)،
   ومنطق التمارين والتلميحات والتحقق.
   ========================================================================== */

const App = (() => {
  const root = document.getElementById("app");
  let currentRoute = null;

  /* ================= التوجيه ================= */
  const routes = {
    home: renderHome,
    lesson: renderLesson,
    progress: renderProgress,
    review: renderReview,
    assessment: renderAssessment,
  };

  function navigate(hash) {
    // hash مثل "#/lesson/what-is-variable"
    const parts = hash.replace(/^#\//, "").split("/");
    const route = parts[0] || "home";
    const param = parts[1] || null;
    currentRoute = { route, param };
    window.scrollTo(0, 0);

    // شاشات المصادقة عامة (بدون جدار تسجيل دخول)
    if (route === "login" || route === "signup") {
      renderAuth(route);
      closeSidebar();
      return;
    }

    // جدار تسجيل الدخول: كل الصفحات الأخرى تتطلب حسابًا مفعّلًا
    if (!Auth.isAuthenticated()) {
      if (Auth.isPending()) renderPendingApproval();
      else renderAuth("login");
      closeSidebar();
      return;
    }

    if (routes[route]) {
      routes[route](param);
    } else {
      renderHome();
    }
    closeSidebar();
  }

  function go(hash) {
    location.hash = hash;
  }

  window.addEventListener("hashchange", () => navigate(location.hash));
  window.addEventListener("DOMContentLoaded", () => navigate(location.hash || "#/home"));

  /* ================= الهيكل العام ================= */
  function shell(contentHtml, opts) {
    opts = opts || {};
    const title = opts.title || "PyJourney";
    root.innerHTML = `
      <div class="app-shell">
        ${sidebarHtml()}
        <div class="main">
          <header class="topbar">
            <button class="menu-toggle" aria-label="فتح أو إغلاق القائمة" aria-expanded="true">${Icons.menu}</button>
            <h2 class="topbar__title">${esc(title)}</h2>
            <span class="spacer"></span>
            <span class="runtime-chip" id="runtime-chip"><span class="runtime-dot" id="runtime-dot"></span><span id="runtime-label">…</span></span>
          </header>
          <main class="content">${contentHtml}</main>
          ${footerHtml()}
        </div>
      </div>
      <div class="sidebar-backdrop hidden" id="sidebar-backdrop"></div>
    `;

    // ربط زر القائمة
    const toggle = root.querySelector(".menu-toggle");
    toggle.addEventListener("click", toggleSidebar);
    root.querySelector("#sidebar-backdrop").addEventListener("click", closeSidebar);

    // ربط زر تسجيل الخروج
    const logoutBtn = root.querySelector("#logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", async () => {
      await Auth.signOut();
      location.hash = "#/login";
    });

    // حالة المحرك
    updateRuntimeChip();
    PythonRuntime.init().then(updateRuntimeChip);
  }

  function updateRuntimeChip() {
    const dot = document.getElementById("runtime-dot");
    const label = document.getElementById("runtime-label");
    if (!dot || !label) return;
    const s = PythonRuntime.getState();
    if (s === "ready") { dot.className = "runtime-dot runtime-dot--ready"; label.textContent = "محرك Python جاهز"; }
    else if (s === "fallback") { dot.className = "runtime-dot runtime-dot--ready"; label.textContent = "محرك Python (مبسّط)"; }
    else { dot.className = "runtime-dot"; label.textContent = "جارٍ تحميل المحرك…"; }
  }

  function footerHtml() {
    return `<footer class="footer">
      <span>PyJourney — منصة تعلّم Python بالممارسة.</span>
      <span class="spacer"></span>
      <span>شعارنا: لا تشاهد البرمجة… مارسها.</span>
    </footer>`;
  }

  /* ================= Sidebar ================= */
  function userBlockHtml() {
    const user = Auth.currentUser();
    if (!user) return "";
    const initial = (user.displayName || user.email || "؟").trim().charAt(0);
    const label = Auth.getMode() === "firebase" ? "حساب سحابي" : "حساب محلي";
    return `
      <div class="sidebar__user">
        <div class="sidebar__user-avatar" aria-hidden="true">${esc(initial)}</div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-name">${esc(user.displayName || user.email)}</div>
          <div class="sidebar__user-mode">${label}</div>
        </div>
        <button class="sidebar__logout" id="logout-btn" type="button" title="تسجيل الخروج" aria-label="تسجيل الخروج">${Icons.logout}</button>
      </div>`;
  }

  function sidebarHtml() {
    const navItems = [
      { icon: Icons.home, label: "الرئيسية", hash: "#/home" },
      { icon: Icons.book, label: "المسار التعليمي", hash: "#/home" },
      { icon: Icons.chart, label: "تقدّمي", hash: "#/progress" },
      { icon: Icons.refresh, label: "المراجعة", hash: "#/review" },
    ];

    const chaptersHtml = Curriculum.chapters.map(ch => {
      const complete = Progress.isChapterComplete(ch.id);
      const open = shouldOpenChapter(ch.id);
      const lessonsHtml = ch.lessonIds.map(id => {
        const lesson = Lessons[id];
        if (!lesson) return "";
        const done = Progress.isLessonComplete(id);
        const locked = Progress.isLessonLocked(id);
        const current = Progress.getCurrentLesson() === id;
        return `
          <li>
            <a href="#/lesson/${id}" class="lesson-link ${locked ? "lesson-link--locked" : ""} ${current ? "lesson-link--current" : ""}">
              <span class="lesson-status">
                ${locked ? Icons.lock : (done ? `<span class="dot dot--done"></span>` : `<span class="dot"></span>`)}
              </span>
              <span class="lesson-title">${esc(lesson.title)}</span>
            </a>
          </li>`;
      }).join("");

      // رابط اختبار الفصل
      const quizScore = Progress.getQuizScore(ch.id);
      const quizHtml = `
        <li>
          <a href="#/assessment/${ch.id}" class="lesson-link lesson-link--quiz">
            <span class="lesson-status">${Progress.isChapterPassed(ch.id) ? Icons.check : ""}</span>
            <span class="lesson-title">اختبار الفصل</span>
            ${quizScore ? `<span class="badge ${quizScore.passed ? "badge--success" : ""}">${quizScore.score}/${quizScore.total}</span>` : ""}
          </a>
        </li>`;

      return `
        <div class="chapter-item ${open ? "chapter-item--open" : ""}">
          <button class="chapter-toggle" type="button" aria-expanded="${open}">
            <span class="chapter-num">${esc(ch.num)}</span>
            <span class="chapter-title">${esc(ch.title)}</span>
            ${complete ? `<span class="badge badge--success">${Icons.check} مكتمل</span>` : ""}
            <span class="chapter-caret">${Icons.arrowLeft}</span>
          </button>
          <ul class="lesson-list" ${open ? "" : 'style="display:none"'}>${lessonsHtml}${quizHtml}</ul>
        </div>`;
    }).join("");

    return `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar__brand">
          <div class="sidebar__logo"><img src="logo-compass-clear.png" alt="شعار PyJourney" /></div>
          <div>
            <div class="sidebar__name">PyJourney</div>
            <div class="sidebar__tag">تعلّم Python بالممارسة</div>
          </div>
        </div>
        <nav aria-label="التنقل الرئيسي">
          ${navItems.map(n => `<a href="${n.hash}" class="nav-link">${n.icon}<span>${n.label}</span></a>`).join("")}
        </nav>
        <div class="chapter-list">${chaptersHtml}</div>
        ${userBlockHtml()}
      </aside>`;
  }

  function shouldOpenChapter(chapterId) {
    const current = Progress.getCurrentLesson();
    if (current) {
      const lesson = Lessons[current];
      if (lesson && lesson.chapter === chapterId) return true;
    }
    // افتح الفصول الأولى والمكتملة
    const idx = Curriculum.chapters.findIndex(c => c.id === chapterId);
    if (idx <= 2) return true;
    if (Progress.isChapterComplete(chapterId)) return true;
    return false;
  }

  function isMobile() { return window.innerWidth <= 860; }

  // زر واحد يفتح/يغلق القائمة: في الجوال يسحبها، وفي الكبيرة يطوي العمود
  function toggleSidebar() {
    const shellEl = root.querySelector(".app-shell");
    const sb = root.querySelector("#sidebar");
    const bd = root.querySelector("#sidebar-backdrop");
    const btn = root.querySelector(".menu-toggle");
    if (!sb) return;

    if (isMobile()) {
      const open = sb.classList.contains("sidebar--open");
      if (open) {
        sb.classList.remove("sidebar--open");
        bd.classList.add("hidden");
        if (btn) btn.setAttribute("aria-expanded", "false");
      } else {
        sb.classList.add("sidebar--open");
        bd.classList.remove("hidden");
        if (btn) btn.setAttribute("aria-expanded", "true");
      }
    } else {
      const collapsed = shellEl.classList.toggle("app-shell--sidebar-collapsed");
      if (btn) btn.setAttribute("aria-expanded", String(!collapsed));
    }
  }

  function openSidebar() {
    if (!isMobile()) return;
    root.querySelector("#sidebar").classList.add("sidebar--open");
    root.querySelector("#sidebar-backdrop").classList.remove("hidden");
  }
  function closeSidebar() {
    const sb = root.querySelector("#sidebar");
    const bd = root.querySelector("#sidebar-backdrop");
    if (sb) sb.classList.remove("sidebar--open");
    if (bd) bd.classList.add("hidden");
  }

  // ربط فتح/إغلاق الفصول بعد الرسم
  function bindChapterToggles() {
    root.querySelectorAll(".chapter-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".chapter-item");
        const list = item.querySelector(".lesson-list");
        const isOpen = list.style.display !== "none";
        list.style.display = isOpen ? "none" : "";
        btn.setAttribute("aria-expanded", String(!isOpen));
        item.classList.toggle("chapter-item--open", !isOpen);
      });
    });
  }

  /* ================= شاشات المصادقة ================= */
  function authErrorText(err) {
    const code = err && err.code ? err.code : "";
    const map = {
      "auth/email-already-in-use": "هذا البريد مسجّل مسبقًا. سجّل الدخول بدلًا من ذلك.",
      "auth/invalid-email": "البريد الإلكتروني غير صالح.",
      "auth/weak-password": "كلمة المرور ضعيفة — استخدم 6 أحرف على الأقل.",
      "auth/user-not-found": "لا يوجد حساب بهذا البريد.",
      "auth/wrong-password": "كلمة المرور غير صحيحة.",
      "auth/invalid-login-credentials": "البريد أو كلمة المرور غير صحيحة.",
      "auth/invalid-credential": "البريد أو كلمة المرور غير صحيحة.",
      "auth/too-many-requests": "محاولات كثيرة جدًا. انتظر قليلًا ثم أعد المحاولة.",
      "auth/network-request-failed": "تعذّر الاتصال بالشبكة. تحقق من الإنترنت.",
      "auth/popup-closed-by-user": "أُغلقت نافذة Google قبل إتمام الدخول.",
      "auth/popup-blocked": "المتصفح منع نافذة تسجيل الدخول المنبثقة. اسمح بالنوافذ المنبثقة، أو استخدم تسجيل الدخول بالبريد وكلمة المرور.",
    };
    if (code && map[code]) return map[code];
    return (err && err.message) ? err.message : "حدث خطأ غير متوقع. حاول مجددًا.";
  }

  function renderAuth(mode) {
    const isLogin = mode === "login";
    const googleEnabled = Auth.getMode() === "firebase";
    const googleSvg = `<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

    root.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-brand">
            <img src="logo-compass-clear.png" alt="شعار PyJourney" />
            <span class="auth-brand__name">PyJourney</span>
          </div>
          <h1 class="auth-title">${isLogin ? "أهلًا بعودتك" : "أنشئ حسابك"}</h1>
          <p class="auth-sub">${isLogin
            ? "سجّل دخولك لمتابعة رحلتك وحفظ تقدّمك."
            : "ابدأ رحلتك في تعلّم Python — مجانًا وبالممارسة."}</p>

          <form class="auth-form" id="auth-form" novalidate>
            ${isLogin ? "" : `
              <label class="auth-field">
                <span>الاسم</span>
                <input type="text" id="auth-name" name="name" autocomplete="name" placeholder="اسمك" required />
              </label>`}
            <label class="auth-field">
              <span>البريد الإلكتروني</span>
              <input type="email" id="auth-email" name="email" autocomplete="email" dir="ltr" placeholder="you@example.com" required />
            </label>
            <label class="auth-field">
              <span>كلمة المرور</span>
              <input type="password" id="auth-password" name="password" autocomplete="${isLogin ? "current-password" : "new-password"}" dir="ltr" placeholder="••••••••" minlength="6" required />
            </label>
            <div class="auth-error" id="auth-error" role="alert"></div>
            <button class="btn btn--primary auth-submit" type="submit">${isLogin ? "تسجيل الدخول" : "إنشاء الحساب"}</button>
          </form>

          <div class="auth-divider"><span>أو</span></div>

          <button class="btn auth-google" id="auth-google" type="button" ${googleEnabled ? "" : "disabled"}>
            ${googleSvg} المتابعة عبر Google
          </button>
          ${googleEnabled ? "" : `<p class="auth-hint">زر Google يُفعَّل تلقائيًا بعد ربط بيانات Firebase.</p>`}

          <div class="auth-alt">
            ${isLogin
              ? `ليس لديك حساب؟ <a href="#/signup">أنشئ حسابًا جديدًا</a>`
              : `لديك حساب بالفعل؟ <a href="#/login">سجّل الدخول</a>`}
          </div>
          ${isLogin ? `<div class="auth-alt"><button class="linklike" id="auth-reset" type="button">نسيت كلمة المرور؟</button></div>` : ""}
        </div>
      </div>
    `;

    const form = root.querySelector("#auth-form");
    const errorEl = root.querySelector("#auth-error");
    const showError = (msg) => { errorEl.textContent = msg; errorEl.classList.add("show"); };
    const clearError = () => { errorEl.textContent = ""; errorEl.classList.remove("show"); };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError();
      const email = root.querySelector("#auth-email").value.trim();
      const password = root.querySelector("#auth-password").value;
      const nameEl = root.querySelector("#auth-name");
      const name = nameEl ? nameEl.value.trim() : "";
      const submitBtn = form.querySelector(".auth-submit");
      submitBtn.disabled = true;
      try {
        if (isLogin) {
          await Auth.signIn(email, password);
        } else {
          if (!name) { showError("فضلك اكتب اسمك."); return; }
          await Auth.signUp(name, email, password);
        }
        // مستخدم مفعّل → الرئيسية؛ وإلا شاشة قيد المراجعة
        if (Auth.isPending()) renderPendingApproval();
        else location.hash = "#/home";
      } catch (err) {
        showError(authErrorText(err));
      } finally {
        submitBtn.disabled = false;
      }
    });

    const googleBtn = root.querySelector("#auth-google");
    if (googleBtn && googleEnabled) {
      googleBtn.addEventListener("click", async () => {
        clearError();
        googleBtn.disabled = true;
        try {
          const res = await Auth.signInWithGoogle();
          if (res && res.redirected) {
            // سيُعاد توجيه المتصفح لصفحة Google وسيعود تلقائيًا بعد تسجيل الدخول
            showError("جارٍ تحويلك إلى Google لتسجيل الدخول… ستُعاد للمنصة تلقائيًا بعد الموافقة.");
            errorEl.style.color = "var(--brand-ink)";
            errorEl.style.background = "var(--brand-soft)";
            return;
          }
          if (Auth.isPending()) renderPendingApproval();
          else location.hash = "#/home";
        } catch (err) {
          showError(authErrorText(err));
        } finally {
          googleBtn.disabled = false;
        }
      });
    }

    const resetBtn = root.querySelector("#auth-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", async () => {
        const email = root.querySelector("#auth-email").value.trim();
        if (!email) { showError("اكتب بريدك أولًا في الحقل أعلاه."); return; }
        clearError();
        resetBtn.disabled = true;
        try {
          await Auth.resetPassword(email);
          showError("أُرسل رابط استعادة كلمة المرور إلى بريدك (تحقق منه).");
          errorEl.style.color = "var(--success)";
          errorEl.style.background = "var(--success-soft)";
        } catch (err) {
          showError(authErrorText(err));
        } finally {
          resetBtn.disabled = false;
        }
      });
    }
  }

  /* ================= شاشة "قيد المراجعة" ================= */
  function renderPendingApproval() {
    const p = Auth.getPending();
    const name = (p && p.name) ? p.name : "";
    root.innerHTML = `
      <div class="auth-page">
        <div class="auth-card" style="text-align:center">
          <div class="auth-brand">
            <img src="logo-compass-clear.png" alt="شعار PyJourney" />
            <span class="auth-brand__name">PyJourney</span>
          </div>
          <div class="pending-icon">${Icons.lock}</div>
          <h1 class="auth-title">حسابك قيد المراجعة</h1>
          <p class="auth-sub">${name ? "أهلًا " + esc(name) + "، " : ""}أنشأت حسابك بنجاح. حسابك ينتظر موافقة المشرف لتفعيله — عادةً يُفعَّل خلال وقت قصير.</p>
          <div class="pending-actions">
            <button class="btn btn--primary" id="pending-retry" type="button">${Icons.refresh} تحقق من التفعيل الآن</button>
            <button class="btn" id="pending-logout" type="button">${Icons.logout} تسجيل الخروج</button>
          </div>
        </div>
      </div>
    `;

    root.querySelector("#pending-retry").addEventListener("click", async () => {
      await Auth.recheck();
      if (Auth.isAuthenticated()) location.hash = "#/home";
      else renderPendingApproval();
    });
    root.querySelector("#pending-logout").addEventListener("click", async () => {
      await Auth.signOut();
      location.hash = "#/login";
    });
  }

  /* ================= الصفحة الرئيسية ================= */
  function renderHome() {
    const started = Progress.hasStarted();
    const next = Progress.nextUncompleted();
    const st = Progress.stats();

    let hero;
    if (started && next) {
      hero = `
        <div class="hero">
          <h1>أهلًا بعودتك، واصل رحلتك</h1>
          <p>أنت في منتصف الطريق. توقّفت عند درس «${esc(next.title)}». أكمل من حيث انتهيت.</p>
          <a class="btn" href="#/lesson/${next.id}">${Icons.play} متابعة التعلّم</a>
        </div>`;
    } else {
      hero = `
        <div class="hero hero--split">
          <div class="hero__content">
            <div class="hero__brand">
              <img src="logo-compass-clear.png" alt="شعار PyJourney" />
              <span class="hero__brand-name">PyJourney</span>
            </div>
            <h1>ابدأ رحلتك في Python</h1>
            <p>منصة تفاعلية بالعربية تعلّمك Python من الصفر تمامًا — عبر رحلة تدريبية حقيقية تكتب فيها الكود بنفسك من أول درس.</p>
            <a class="btn" href="#/lesson/what-is-programming" id="start-btn">ابدأ التعلّم</a>
          </div>
          <img class="hero-img" src="journey.png" alt="مسار تعلّم Python من الصفر إلى الاحتراف" />
        </div>`;
    }

    // شريط التقدم
    const pct = st.totalLessons ? Math.round(st.completedLessons / st.totalLessons * 100) : 0;
    const progressHtml = `
      <div class="stats-row">
        <div class="stat"><div class="stat__num">${st.completedLessons}/${st.totalLessons}</div><div class="stat__label">درسًا مكتملًا</div></div>
        <div class="stat"><div class="stat__num">${st.chaptersDone}</div><div class="stat__label">فصلًا مكتملًا</div></div>
        <div class="stat"><div class="stat__num">${st.level}</div><div class="stat__label">المستوى</div></div>
        <div class="stat"><div class="stat__num">${st.xp}</div><div class="stat__label">نقطة خبرة</div></div>
      </div>
      <div class="progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar__fill" style="width:${pct}%"></div>
      </div>
      <p class="text-muted" style="margin-top:6px;font-size:.85rem">أكملت ${pct}% من المنهج.</p>`;

    // المسار التعليمي
    const pathHtml = Curriculum.chapters.map(ch => {
      const done = Progress.isChapterComplete(ch.id);
      const passed = Progress.isChapterPassed(ch.id);
      const locked = !chapterAccessible(ch.id);
      let badge;
      if (passed) badge = `<span class="badge badge--success">${Icons.check} مجتاز</span>`;
      else if (done) badge = `<span class="badge" style="background:var(--warn-soft);color:var(--warn);border-color:transparent">${Icons.alert} خذ الاختبار</span>`;
      else if (locked) badge = `<span class="badge">${Icons.lock} مقفول</span>`;
      else badge = `<span class="badge badge--brand">${ch.lessonIds.length} دروس</span>`;
      return `
        <div class="path-chapter" data-chapter="${ch.id}" role="button" tabindex="0">
          <div class="path-chapter__num">${esc(ch.num)}</div>
          <div class="path-chapter__info">
            <p class="path-chapter__title">${esc(ch.title)}</p>
            <p class="path-chapter__desc">${esc(ch.desc)}</p>
          </div>
          ${badge}
        </div>`;
    }).join("");

    // خريطة الطريق (فصول قادمة — غير قابلة للنقر)
    const roadmapHtml = (Curriculum.roadmap || []).map(r => `
      <div class="path-chapter" style="cursor:default;opacity:.55">
        <div class="path-chapter__num" style="background:var(--surface-2);color:var(--ink-3)">${esc(r.num)}</div>
        <div class="path-chapter__info">
          <p class="path-chapter__title">${esc(r.title)}</p>
          <p class="path-chapter__desc">${esc(r.desc)}</p>
        </div>
        <span class="badge">${Icons.lock} لاحقًا</span>
      </div>`).join("");

    shell(`
      <div class="page-head">${hero}</div>
      ${started ? `<div class="section-title">${Icons.chart} تقدّمك</div>${progressHtml}` : ""}
      <div class="section-title">${Icons.book} المسار التعليمي</div>
      <div class="path-list">${pathHtml}</div>
      ${roadmapHtml ? `<div class="section-title" style="color:var(--ink-3)">خريطة الطريق الكاملة — من الصفر إلى المتقدم</div><div class="path-list">${roadmapHtml}</div>` : ""}
    `, { title: "الرئيسية" });

    bindChapterToggles();

    // ربط بطاقات الفصول
    root.querySelectorAll(".path-chapter").forEach(el => {
      const chId = el.getAttribute("data-chapter");
      const firstLesson = Curriculum.chapters.find(c => c.id === chId).lessonIds[0];
      el.addEventListener("click", () => go(`#/lesson/${firstLesson}`));
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(`#/lesson/${firstLesson}`); } });
    });

    // زر البداية
    const startBtn = root.querySelector("#start-btn");
    if (startBtn) startBtn.addEventListener("click", () => Progress.startJourney());
  }

  function chapterAccessible(chapterId) {
    const idx = Curriculum.chapters.findIndex(c => c.id === chapterId);
    if (idx <= 0) return true;
    const prev = Curriculum.chapters[idx - 1];
    if (!Progress.isChapterComplete(prev.id)) return false;
    if (window.Quizzes && window.Quizzes[prev.id] && !Progress.isChapterPassed(prev.id)) return false;
    return true;
  }

  /* ================= صفحة الدرس ================= */
  function renderLesson(lessonId) {
    const lesson = Lessons[lessonId];
    if (!lesson) { renderHome(); return; }

    if (Progress.isLessonLocked(lessonId)) {
      shell(`
        <div class="empty-state">
          <div style="width:56px;height:56px;border-radius:50%;background:var(--surface-2);color:var(--ink-3);display:grid;place-items:center;margin:0 auto 14px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg></div>
          <h1>هذا الدرس مقفول</h1>
          <p class="text-muted">أكمل الدروس السابقة أولًا حتى تفتح هذا الدرس. المعرفة تُبنى خطوة بخطوة.</p>
          <a class="btn btn--primary" href="#/home">العودة للمسار</a>
        </div>
      `, { title: lesson.title });
      return;
    }

    Progress.setCurrentLesson(lessonId);

    const ch = Curriculum.chapters.find(c => c.id === lesson.chapter);

    // رأس الدرس
    const headerHtml = `
      <div class="lesson-header">
        <div class="lesson-header__meta">
          <span class="badge badge--brand">${esc(ch.num)} — ${esc(ch.title)}</span>
          ${lesson.difficulty ? `<span class="badge">${esc(lesson.difficulty)}</span>` : ""}
        </div>
        <h1>${esc(lesson.title)}</h1>
        <p class="lesson-header__desc">${esc(lesson.desc)}</p>
      </div>`;

    // الأهداف
    const objectivesHtml = `
      <div class="lesson-objectives">
        <h2>ستتعلم في هذا الدرس:</h2>
        <ul>${lesson.objectives.map(o => `<li>${esc(o)}</li>`).join("")}</ul>
      </div>`;

    // المحتوى
    const contentHtml = lesson.content.map(renderContentBlock).join("");

    // التمرين
    const exerciseHtml = renderExercise(lesson);

    // أسئلة الفهم
    const quizHtml = lesson.quiz && lesson.quiz.length
      ? `<div class="lesson-block"><h2 class="lesson-block__title">تحقق من فهمك</h2><div class="quiz-questions" id="lesson-quiz"></div></div>`
      : "";

    // المراجعة
    const reviewHtml = lesson.review && lesson.review.length
      ? `<div class="summary-card"><h2>خلاصة الدرس</h2><ul>${lesson.review.map(r => `<li>${esc(r)}</li>`).join("")}</ul></div>`
      : "";

    // التنقل
    const prev = Progress.prevLesson(lessonId);
    const next = Progress.nextLesson(lessonId);
    const isLastInChapter = ch && ch.lessonIds[ch.lessonIds.length - 1] === lessonId;
    const nextBtn = isLastInChapter
      ? `<a class="btn btn--primary" href="#/assessment/${lesson.chapter}">${Icons.check} اختبار الفصل ${Icons.arrowLeft}</a>`
      : (next ? `<a class="btn btn--primary" href="#/lesson/${next.id}">التالي: ${esc(next.title)} ${Icons.arrowLeft}</a>` : `<a class="btn btn--primary" href="#/progress">إلى صفحة التقدم</a>`);
    const navHtml = `
      <div class="lesson-nav">
        ${prev ? `<a class="btn" href="#/lesson/${prev.id}">${Icons.arrowRight} السابق: ${esc(prev.title)}</a>` : `<span></span>`}
        <span class="spacer"></span>
        ${nextBtn}
      </div>`;

    shell(`
      ${headerHtml}
      ${objectivesHtml}
      ${contentHtml}
      <div id="exercise-area">${exerciseHtml}</div>
      ${quizHtml}
      <div id="review-area">${reviewHtml}</div>
      <div id="complete-area"></div>
      ${navHtml}
    `, { title: lesson.title });

    bindChapterToggles();

    // تهيئة التمرين
    initExercise(lesson);

    // تهيئة أسئلة الفهم
    if (lesson.quiz && lesson.quiz.length) initQuiz(lesson.quiz, document.getElementById("lesson-quiz"), "lesson");

    // منطقة الاكتمال
    renderCompleteArea(lesson);
  }

  function renderCompleteArea(lesson) {
    const area = document.getElementById("complete-area");
    if (!area) return;
    if (!Progress.isLessonComplete(lesson.id)) return;

    const ch = Curriculum.chapters.find(c => c.id === lesson.chapter);
    const chapterDone = ch && Progress.isChapterComplete(ch.id);
    const chapterPassed = ch && Progress.isChapterPassed(ch.id);

    let extra = "";
    if (chapterDone && !chapterPassed) {
      extra = `
        <div class="assessment-note" style="text-align:center">
          <strong>أكملت كل دروس هذا الفصل!</strong>
          <p class="text-muted" style="margin:6px 0 12px">خذ اختبار الفصل لتثبيت معرفتك وفتح الفصل التالي.</p>
          <a class="btn btn--primary" href="#/assessment/${lesson.chapter}">${Icons.check} ابدأ اختبار الفصل</a>
        </div>`;
    }

    area.innerHTML = `
      <div class="lesson-complete">
        <div class="lesson-complete__icon">${Icons.check}</div>
        <h2>أكملت هذا الدرس</h2>
        <p class="text-muted">أحسنت! استمر إلى الدرس التالي.</p>
      </div>${extra}`;
  }

  /* ================= التمرين ================= */
  function renderExercise(lesson) {
    const ex = lesson.exercise;
    if (!ex) return "";

    if (ex.type === "arrange") {
      return `
        <div class="lesson-block">
          ${tryBannerHtml()}
          <div class="task-card">
            <div class="task-card__label">مهمة: رتّب الخطوات</div>
            <p>${esc(ex.intro)}</p>
            <div id="arrange-available" class="arrange-list"></div>
            <p class="text-muted" style="font-size:.85rem">ترتيبك الحالي:</p>
            <div id="arrange-answer" class="arrange-answer"></div>
            <div style="margin-top:12px">
              <button class="btn btn--sm arrange-reset" type="button">إعادة الترتيب</button>
              <button class="btn btn--sm btn--primary arrange-check" type="button">تحقق</button>
            </div>
            <div id="arrange-feedback"></div>
          </div>
          ${hintsHtml(ex)}
        </div>`;
    }

    if (ex.type === "mc-single") {
      return `
        <div class="lesson-block">
          ${tryBannerHtml()}
          <div class="task-card">
            <div class="task-card__label">سؤال سريع</div>
            <p>${esc(ex.intro)}</p>
            <p style="font-weight:700">${esc(ex.prompt)}</p>
            <div class="mc-options" id="mc-options">
              ${ex.options.map((o, i) => `<button class="option mc-opt" data-i="${i}" type="button">${esc(o.text)}</button>`).join("")}
            </div>
            <div id="mc-feedback" style="margin-top:12px"></div>
          </div>
        </div>`;
    }

    // تمارين الكود: print / input / free
    const starter = ex.starter !== undefined ? ex.starter : "";
    const inputInfo = ex.inputs && ex.inputs.length
      ? `<p class="text-muted" style="font-size:.85rem">سيُمرَّر الإدخال التالي لبرنامجك عند التشغيل: <strong>${esc(ex.inputs.join("، "))}</strong></p>`
      : "";

    return `
      <div class="lesson-block">
        ${tryBannerHtml()}
        <div class="task-card">
          <div class="task-card__label">مهمتك</div>
          <p>${esc(ex.intro)}</p>
          ${inputInfo}
          ${ex.expectedOutput ? `<p style="font-size:.85rem;color:var(--ink-2)">الناتج المتوقع: <span class="term">${esc(ex.expectedOutput)}</span></p>` : ""}
        </div>
        <div id="editor-mount"></div>
        <div class="hint-btn-row" style="margin:14px 0">
          <button class="btn btn--sm check-btn" type="button">${Icons.check} تحقق من الإجابة</button>
        </div>
        ${hintsHtml(ex)}
        <div id="check-feedback"></div>
      </div>`;
  }

  function hintsHtml(ex) {
    if (!ex.hints || ex.hints.length === 0) return "";
    return `
      <div class="hints">
        <div class="hint-btn-row">
          <button class="btn btn--sm hint-btn" type="button">${Icons.bulb} عرض تلميح</button>
          <button class="btn btn--sm solution-btn" type="button">عرض الحل</button>
        </div>
        <div id="hint-list"></div>
      </div>`;
  }

  // نافذة عابرة: تعرض المحتوى لمدة 10 ثوانٍ ثم تغلق تلقائيًا.
  // إذا كانت النافذة مفتوحة بالفعل، يُتجاهل النقر — نافذة واحدة فقط بلا تكرار.
  function transientWindow(container) {
    let open = false;
    let timer = null;
    return function show(html) {
      if (open) return false; // النافذة مفتوحة → تجاهل (لا تكرار)
      open = true;
      container.innerHTML = html;
      timer = setTimeout(() => {
        container.innerHTML = "";
        open = false;
        timer = null;
      }, 10000);
      return true;
    };
  }

  function initExercise(lesson) {
    const ex = lesson.exercise;
    if (!ex) return;

    /* ----- تمرين الترتيب ----- */
    if (ex.type === "arrange") {
      const available = document.getElementById("arrange-available");
      const answerEl = document.getElementById("arrange-answer");
      const feedback = document.getElementById("arrange-feedback");
      const resetBtn = document.querySelector(".arrange-reset");
      const checkBtn = document.querySelector(".arrange-check");

      // خلط العناصر
      let remaining = shuffle([...ex.items]);
      let chosen = [];

      function render() {
        available.innerHTML = remaining.map((it, i) => `<button class="option arrange-chip" data-i="${i}" type="button">${esc(it)}</button>`).join("");
        answerEl.innerHTML = chosen.length
          ? chosen.map((it, i) => `<div class="option arrange-chip arrange-chip--picked" style="border-color:var(--brand);background:var(--brand-soft)"><span style="color:var(--brand-ink);font-weight:700">${i + 1}.</span> ${esc(it)}</div>`).join("")
          : `<p class="text-muted" style="font-size:.85rem">اضغط على الخطوات بالترتيب الصحيح…</p>`;
        available.querySelectorAll(".arrange-chip").forEach(chip => {
          chip.addEventListener("click", () => {
            const i = parseInt(chip.getAttribute("data-i"), 10);
            chosen.push(remaining[i]);
            remaining.splice(i, 1);
            render();
          });
        });
      }
      render();

      resetBtn.addEventListener("click", () => { remaining = shuffle([...ex.items]); chosen = []; feedback.innerHTML = ""; render(); });

      checkBtn.addEventListener("click", () => {
        const correct = JSON.stringify(chosen) === JSON.stringify(ex.answer);
        if (correct) {
          feedback.innerHTML = `<div class="result-panel result-panel--success"><p class="result-panel__title">${Icons.check} صحيح!</p><p>ترتيب ممتاز — هذا هو التفكير المنطقي الذي تحتاجه في البرمجة.</p></div>`;
          Progress.completeLesson(lesson.id);
          renderCompleteArea(lesson);
        } else {
          Progress.recordAttempt(lesson.id);
          feedback.innerHTML = `<div class="result-panel result-panel--fail"><p class="result-panel__title">${Icons.alert} ليس بعد</p><p>راجع ترتيب الخطوات وحاول مجددًا. تذكّر: ابدأ بما تحتاجه أولًا.</p></div>`;
        }
      });

      // التلميحات والحل لتمرين الترتيب (نافذة واحدة تُغلق بعد 10 ثوانٍ)
      const hintList = document.getElementById("hint-list");
      const showWindow = transientWindow(hintList);
      let hintIndex = 0;
      const hintBtn = document.querySelector(".hint-btn");
      if (hintBtn) hintBtn.addEventListener("click", () => {
        if (hintIndex >= (ex.hints || []).length) return;
        const shown = showWindow(`<div class="hint"><div class="hint__label">تلميح ${hintIndex + 1}</div><p>${esc(ex.hints[hintIndex])}</p></div>`);
        if (shown) {
          Progress.recordHint(lesson.id);
          hintIndex++;
          if (hintIndex >= (ex.hints || []).length) hintBtn.disabled = true;
        }
      });
      const solutionBtn = document.querySelector(".solution-btn");
      if (solutionBtn) solutionBtn.addEventListener("click", () => {
        showWindow(`<div class="solution-box"><div class="solution-box__label">الترتيب الصحيح</div><ol style="margin:6px 0;padding-right:20px">${ex.answer.map(a => `<li>${esc(a)}</li>`).join("")}</ol></div>`);
      });
      return;
    }

    /* ----- سؤال الاختيار الواحد ----- */
    if (ex.type === "mc-single") {
      const feedback = document.getElementById("mc-feedback");
      document.querySelectorAll(".mc-opt").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = parseInt(btn.getAttribute("data-i"), 10);
          const opt = ex.options[i];
          document.querySelectorAll(".mc-opt").forEach(b => b.disabled = true);
          if (opt.correct) {
            btn.classList.add("option--correct");
            feedback.innerHTML = `<div class="result-panel result-panel--success"><p class="result-panel__title">${Icons.check} صحيح!</p><p>أحسنت الاختيار.</p></div>`;
            Progress.completeLesson(lesson.id);
            renderCompleteArea(lesson);
          } else {
            btn.classList.add("option--wrong");
            ex.options.forEach((o, j) => { if (o.correct) document.querySelectorAll(".mc-opt")[j].classList.add("option--correct"); });
            Progress.recordAttempt(lesson.id);
            feedback.innerHTML = `<div class="result-panel result-panel--fail"><p class="result-panel__title">${Icons.alert} غير صحيح</p><p>الإجابة الصحيحة موضّحة بالأخضر. راجعها وتابع.</p></div>`;
          }
        });
      });
      return;
    }

    /* ----- تمارين الكود ----- */
    const mount = document.getElementById("editor-mount");
    if (!mount) return;

    const editor = createEditor({
      initialCode: ex.starter !== undefined ? ex.starter : "",
      inputs: ex.inputs || [],
      onRun: (out) => {
        // لا شيء عند التشغيل العادي
      },
    });
    mount.appendChild(editor.el);

    const feedbackEl = document.getElementById("check-feedback");
    const hintList = document.getElementById("hint-list");
    const showWindow = transientWindow(hintList);
    let hintIndex = 0;
    let solved = false;

    // التلميحات (نافذة واحدة تُغلق بعد 10 ثوانٍ)
    const hintBtn = document.querySelector(".hint-btn");
    if (hintBtn) hintBtn.addEventListener("click", () => {
      if (hintIndex >= ex.hints.length) return;
      const shown = showWindow(`<div class="hint"><div class="hint__label">تلميح ${hintIndex + 1}</div><p>${esc(ex.hints[hintIndex])}</p></div>`);
      if (shown) {
        Progress.recordHint(lesson.id);
        hintIndex++;
        if (hintIndex >= ex.hints.length) hintBtn.disabled = true;
      }
    });

    // الحل (نافذة واحدة تُغلق بعد 10 ثوانٍ)
    const solutionBtn = document.querySelector(".solution-btn");
    if (solutionBtn) solutionBtn.addEventListener("click", () => {
      if (ex.solution) {
        showWindow(`<div class="solution-box"><div class="solution-box__label">الحل النموذجي</div>${codeHtml(ex.solution)}<p class="text-muted" style="font-size:.85rem">حاول الآن كتابة الحل بنفسك في المحرر وتشغيله.</p></div>`);
      }
    });

    // التحقق
    const checkBtn = document.querySelector(".check-btn");
    if (checkBtn) checkBtn.addEventListener("click", async () => {
      if (solved) return;
      const code = editor.getValue();
      if (code.trim() === "") {
        feedbackEl.innerHTML = `<div class="result-panel result-panel--fail"><p class="result-panel__title">${Icons.alert} المحرر فارغ</p><p>اكتب كودًا أولًا ثم تحقق.</p></div>`;
        return;
      }
      const res = await PythonRuntime.runCode(code, ex.inputs || []);
      if (res.error) {
        Progress.recordAttempt(lesson.id);
        RecordWeakTopicForError(res.error.type);
        feedbackEl.innerHTML = errorFeedbackHtml(res.error, Progress.getAttempts(lesson.id));
        return;
      }
      const output = (res.output || "").trim();
      const pass = checkOutput(ex, output);
      if (pass) {
        solved = true;
        feedbackEl.innerHTML = `<div class="result-panel result-panel--success"><p class="result-panel__title">${Icons.check} ممتاز! كودك صحيح</p><p>ناتج كودك: <span class="term">${esc(output)}</span></p></div>`;
        Progress.completeLesson(lesson.id);
        renderCompleteArea(lesson);
      } else {
        Progress.recordAttempt(lesson.id);
        Review.recordFailure(lesson.id, chapterToTopic(lesson.chapter));
        const expected = ex.expectedOutput || (ex.customCheck && ex.customCheck.contains) || "";
        feedbackEl.innerHTML = `<div class="result-panel result-panel--fail">
          <p class="result-panel__title">${Icons.alert} الكود يعمل لكن الناتج غير مطابق</p>
          <p>ناتجك: <span class="term">${esc(output || "(فارغ)")}</span></p>
          ${expected ? `<p>المتوقع: <span class="term">${esc(expected)}</span></p>` : ""}
          <p class="text-muted" style="font-size:.85rem">الكود صحيح من ناحية التشغيل، لكنه لا يحقق المطلوب. جرّب تلميحًا.</p>
        </div>`;
      }
    });
  }

  function checkOutput(ex, output) {
    if (ex.free) return output !== "";
    if (ex.customCheck && ex.customCheck.contains) {
      return output.includes(ex.customCheck.contains);
    }
    if (ex.expectedOutput) {
      return normalize(output) === normalize(ex.expectedOutput);
    }
    // إن لم يوجد معيار: اعتبره صحيحًا إذا لم يكن فارغًا
    return output !== "";
  }

  function normalize(s) {
    return String(s).trim().replace(/\s+/g, " ");
  }

  function errorFeedbackHtml(error, attempts) {
    const parts = [];
    parts.push(`<p class="result-panel__title">${Icons.alert} حدث خطأ: ${esc(error.type)}</p>`);
    parts.push(`<p>${esc(error.explain)}</p>`);
    // تلميحات تدريجية حسب المحاولات
    if (attempts <= 1) parts.push(`<p class="text-muted" style="font-size:.85rem">المحاولة ${attempts}: راجع السطر الذي كتبته مؤخرًا.</p>`);
    else if (attempts <= 2) parts.push(`<p class="text-muted" style="font-size:.85rem">المحاولة ${attempts}: انظر لرسالة الخطأ — ما نوعه؟ هذا يحدد مكان المشكلة.</p>`);
    else parts.push(`<p class="text-muted" style="font-size:.85rem">المحاولة ${attempts}: جرّب «عرض الحل» ثم أعد كتابته بنفسك.</p>`);
    return `<div class="result-panel result-panel--fail">${parts.join("")}</div>`;
  }

  function RecordWeakTopicForError(errorType) {
    const map = {
      SyntaxError: "operator",
      NameError: "variable",
      TypeError: "type",
      ValueError: "type",
      IndexError: "string",
      KeyError: "string",
    };
    const topic = map[errorType] || "operator";
    Review.recordFailure("current", topic);
  }

  // ربط الفصل بموضوع مراجعة (لتتبع الأخطاء المنطقية)
  function chapterToTopic(chapterId) {
    const map = {
      ch01: "print",
      ch02: "variable",
      ch03: "type",
      ch04: "operator",
      ch05: "string",
      ch06: "condition",
      ch07: "loop",
    };
    return map[chapterId] || "variable";
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ================= الأسئلة (درس/اختبار) ================= */
  function initQuiz(questions, container, context, onDone) {
    if (!container) return;
    let answered = 0;
    let correctCount = 0;

    questions.forEach((q, qi) => {
      const card = document.createElement("div");
      card.className = "question-card";
      card.setAttribute("data-q", qi);

      let promptHtml = `<p class="question-card__prompt">${esc(q.prompt)}</p>`;
      if (q.code) promptHtml += codeHtml(q.code);

      if (q.type === "tf") {
        promptHtml += `
          <div class="tf-options">
            <button class="option tf-opt" data-v="true" type="button">صحيح (True)</button>
            <button class="option tf-opt" data-v="false" type="button">خطأ (False)</button>
          </div>`;
      } else {
        promptHtml += `<div>${q.options.map((o, i) => `<button class="option mc-opt" data-i="${i}" type="button">${esc(o.text)}</button>`).join("")}</div>`;
      }

      card.innerHTML = promptHtml;
      container.appendChild(card);

      const bindOpt = (btn, isCorrect, why) => {
        // تعطيل كل الخيارات
        card.querySelectorAll(".option").forEach(b => b.disabled = true);
        if (isCorrect) {
          btn.classList.add("option--correct");
          card.insertAdjacentHTML("beforeend", `<div class="question-feedback question-feedback--success">${Icons.check} صحيح. ${esc(why || "")}</div>`);
          correctCount++;
        } else {
          btn.classList.add("option--wrong");
          // إبراز الصحيح
          card.querySelectorAll(".option").forEach(b => {
            let isCorrectOpt = false;
            if (b.classList.contains("mc-opt")) {
              isCorrectOpt = q.options[parseInt(b.getAttribute("data-i"), 10)].correct;
            } else if (b.classList.contains("tf-opt")) {
              isCorrectOpt = (b.getAttribute("data-v") === "true") === q.answer;
            }
            if (isCorrectOpt) b.classList.add("option--correct");
          });
          card.insertAdjacentHTML("beforeend", `<div class="question-feedback question-feedback--fail">${Icons.alert} غير صحيح. ${esc(why || "")}</div>`);
        }
        answered++;
        if (answered === questions.length) {
          if (onDone) {
            onDone(correctCount, questions.length);
          } else {
            // ملخص نهاية أسئلة الدرس
            const summary = document.createElement("div");
            summary.className = "question-feedback question-feedback--success";
            summary.style.marginTop = "12px";
            summary.innerHTML = `${Icons.check} أجبت عن كل الأسئلة: ${correctCount} من ${questions.length} صحيحة.`;
            container.appendChild(summary);
          }
        }
      };

      if (q.type === "tf") {
        card.querySelectorAll(".tf-opt").forEach(btn => {
          btn.addEventListener("click", () => {
            const v = btn.getAttribute("data-v") === "true";
            const isCorrect = v === q.answer;
            bindOpt(btn, isCorrect, q.why);
          });
        });
      } else {
        card.querySelectorAll(".mc-opt").forEach(btn => {
          btn.addEventListener("click", () => {
            const i = parseInt(btn.getAttribute("data-i"), 10);
            const opt = q.options[i];
            bindOpt(btn, opt.correct, opt.why);
          });
        });
      }
    });
  }

  /* ================= صفحة التقدم ================= */
  function renderProgress() {
    const st = Progress.stats();
    const weak = Progress.getWeakTopics();
    const pct = st.totalLessons ? Math.round(st.completedLessons / st.totalLessons * 100) : 0;

    const chaptersHtml = Curriculum.chapters.map(ch => {
      const done = Progress.isChapterComplete(ch.id);
      const doneCount = ch.lessonIds.filter(id => Progress.isLessonComplete(id)).length;
      const quiz = Progress.getQuizScore(ch.id);
      return `
        <div class="review-item">
          <div class="review-item__top">
            <span class="path-chapter__num" style="width:32px;height:32px">${esc(ch.num)}</span>
            <span class="review-item__title">${esc(ch.title)}</span>
            ${done ? `<span class="badge badge--success">${Icons.check} مكتمل</span>` : ""}
            <span class="badge">${doneCount}/${ch.lessonIds.length} دروس</span>
            ${quiz ? `<span class="badge ${quiz.passed ? "badge--success" : ""}">اختبار: ${quiz.score}/${quiz.total}</span>` : ""}
          </div>
          <div class="progress-bar" style="margin-top:10px"><div class="progress-bar__fill" style="width:${ch.lessonIds.length ? doneCount/ch.lessonIds.length*100 : 0}%"></div></div>
        </div>`;
    }).join("");

    const weakHtml = Object.keys(weak).length
      ? `<div class="section-title">${Icons.refresh} مواضيع تحتاج مراجعة</div>
         <div class="review-list">
           ${Object.keys(weak).map(t => `<div class="review-item"><div class="review-item__top"><span class="review-item__title">${esc(Review.getTopicLabel(t))}</span><span class="badge">${weak[t].count} خطأ</span></div><p>تمرّن عليها من صفحة المراجعة.</p></div>`).join("")}
         </div>`
      : `<div class="section-title">${Icons.refresh} مواضيع تحتاج مراجعة</div><p class="text-muted">لا توجد مواضيع ضعيفة حاليًا — أحسنت!</p>`;

    shell(`
      <div class="page-head">
        <h1>تقدّمك</h1>
        <p>نظرة سريعة على رحلتك في تعلّم Python.</p>
      </div>
      <div class="stats-row">
        <div class="stat"><div class="stat__num">${st.completedLessons}/${st.totalLessons}</div><div class="stat__label">درسًا مكتملًا</div></div>
        <div class="stat"><div class="stat__num">${st.chaptersDone}</div><div class="stat__label">فصلًا مكتملًا</div></div>
        <div class="stat"><div class="stat__num">${st.level}</div><div class="stat__label">المستوى</div></div>
        <div class="stat"><div class="stat__num">${st.xp}</div><div class="stat__label">نقطة خبرة</div></div>
      </div>
      <div class="progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar__fill" style="width:${pct}%"></div></div>
      <p class="text-muted" style="margin-top:6px;font-size:.85rem">أكملت ${pct}% من المنهج الكامل.</p>

      <div class="section-title">${Icons.book} تقدم الفصول</div>
      <div class="review-list">${chaptersHtml}</div>

      ${weakHtml}

      <div style="margin-top:32px;text-align:center">
        <button class="danger-link" id="reset-progress" type="button">إعادة تعيين كل التقدم</button>
      </div>
    `, { title: "تقدّمي" });

    bindChapterToggles();

    const resetBtn = root.querySelector("#reset-progress");
    if (resetBtn) resetBtn.addEventListener("click", () => {
      if (confirm("هل أنت متأكد؟ سيتم حذف كل تقدمك ودرجاتك نهائيًا.")) {
        Progress.reset();
        location.hash = "#/home";
        location.reload();
      }
    });
  }

  /* ================= صفحة المراجعة ================= */
  function renderReview() {
    const session = Review.buildSession();

    if (!session) {
      shell(`
        <div class="page-head"><h1>المراجعة الذكية</h1><p>هنا تجد المواضيع التي تحتاج تقوية.</p></div>
        <div class="empty-state">
          <div style="width:56px;height:56px;border-radius:50%;background:var(--success-soft);color:var(--success);display:grid;place-items:center;margin:0 auto 14px">${Icons.check}</div>
          <h2>لا شيء يحتاج مراجعة الآن</h2>
          <p class="text-muted">كل المواضيع التي تعلمتها في حالة جيدة. استمر في التقدم!</p>
        </div>
      `, { title: "المراجعة" });
      return;
    }

    shell(`
      <div class="page-head">
        <h1>المراجعة الذكية</h1>
        <p>لاحظنا أنك تحتاج تقوية في بعض المواضيع. لنراجعها سريعًا.</p>
      </div>
      <div class="assessment-note">
        <strong>موضوع اليوم: ${esc(session.label)}</strong>
        <p class="text-muted" style="margin:6px 0 0">أخطأت فيه ${session.attempts} مرة سابقًا. أجب عن السؤالين التاليين لتثبيته.</p>
      </div>
      <div class="quiz-questions" id="review-quiz"></div>
      <div id="review-result"></div>
    `, { title: "المراجعة" });

    const resultEl = document.getElementById("review-result");
    initQuiz(session.questions, document.getElementById("review-quiz"), "review", (correct, total) => {
      if (correct === total) {
        Review.passReview(session.topic);
        resultEl.innerHTML = `<div class="result-panel result-panel--success"><p class="result-panel__title">${Icons.check} ممتاز!</p><p>أتقنت «${esc(session.label)}» — تم إزالتها من قائمة المراجعة.</p><a class="btn btn--primary btn--sm" href="#/review">موضوع آخر</a></div>`;
      } else {
        resultEl.innerHTML = `<div class="result-panel result-panel--fail"><p class="result-panel__title">${Icons.alert} تحتاج مزيدًا من التمرين</p><p>أعد المحاولة حتى تتقن الموضوع.</p><a class="btn btn--sm" href="#/review">إعادة المحاولة</a></div>`;
      }
    });
  }

  /* ================= اختبار الفصل ================= */
  function renderAssessment(chapterId) {
    const quiz = Quizzes[chapterId];
    if (!quiz) { renderHome(); return; }
    const ch = Curriculum.chapters.find(c => c.id === chapterId);
    const chapterComplete = Progress.isChapterComplete(chapterId);
    const alreadyPassed = Progress.isChapterPassed(chapterId);

    const incompleteNote = !chapterComplete
      ? `<div class="assessment-note" style="border-color:var(--warn);background:var(--warn-soft)"><strong>تنبيه:</strong> لم تكمل كل دروس هذا الفصل بعد. يُفضَّل إكمال الدروس أولًا قبل الاختبار.</div>`
      : "";

    const passedNote = alreadyPassed
      ? `<div class="assessment-note"><strong>اجتزت هذا الاختبار مسبقًا.</strong> يمكنك إعادة المحاولة لتحسين درجتك، أو متابعة الفصل التالي.</div>`
      : "";

    shell(`
      <div class="page-head">
        <div class="lesson-header__meta">
          <span class="badge badge--brand">${esc(ch.num)} — ${esc(ch.title)}</span>
          <a class="badge" href="#/lesson/${ch.lessonIds[0]}">العودة للفصل</a>
        </div>
        <h1>${esc(quiz.title)}</h1>
        <p>أجب عن كل الأسئلة. تحتاج ${quiz.passPercent}% للنجاح. لن تُفتح دروس الفصل التالي إلا بعد النجاح.</p>
      </div>
      ${incompleteNote}
      ${passedNote}
      <div class="quiz-questions" id="assessment-quiz"></div>
      <div id="assessment-result"></div>
    `, { title: quiz.title });

    let correctCount = 0;
    const container = document.getElementById("assessment-quiz");
    const resultEl = document.getElementById("assessment-result");
    const questions = quiz.questions;
    let answered = 0;

    questions.forEach((q, qi) => {
      const card = document.createElement("div");
      card.className = "question-card";
      let html = `<p class="question-card__prompt"><span class="badge badge--brand">س${qi + 1}</span> ${esc(q.prompt)}</p>`;
      if (q.code) html += codeHtml(q.code);
      if (q.type === "tf") {
        html += `<div class="tf-options"><button class="option tf-opt" data-v="true" type="button">صحيح (True)</button><button class="option tf-opt" data-v="false" type="button">خطأ (False)</button></div>`;
      } else {
        html += `<div>${q.options.map((o, i) => `<button class="option mc-opt" data-i="${i}" type="button">${esc(o.text)}</button>`).join("")}</div>`;
      }
      card.innerHTML = html;
      container.appendChild(card);

      const finalize = (btn, isCorrect, why) => {
        card.querySelectorAll(".option").forEach(b => b.disabled = true);
        if (isCorrect) {
          btn.classList.add("option--correct");
          card.insertAdjacentHTML("beforeend", `<div class="question-feedback question-feedback--success">${Icons.check} ${esc(why || "صحيح")}</div>`);
          correctCount++;
        } else {
          btn.classList.add("option--wrong");
          card.querySelectorAll(".option").forEach(b => {
            if (b.classList.contains("mc-opt")) {
              const i = parseInt(b.getAttribute("data-i"), 10);
              if (q.options[i].correct) b.classList.add("option--correct");
            }
          });
          card.insertAdjacentHTML("beforeend", `<div class="question-feedback question-feedback--fail">${Icons.alert} ${esc(why || "غير صحيح")}</div>`);
        }
        answered++;
        if (answered === questions.length) {
          const pct = Math.round(correctCount / questions.length * 100);
          const passed = pct >= quiz.passPercent;
          Progress.recordQuiz(chapterId, correctCount, questions.length, passed);
          const nextChapter = Curriculum.chapters[Curriculum.chapters.findIndex(c => c.id === chapterId) + 1];
          const nextTarget = nextChapter ? `#/lesson/${nextChapter.lessonIds[0]}` : "#/home";
          resultEl.innerHTML = `
            <div class="result-panel ${passed ? "result-panel--success" : "result-panel--fail"}">
              <p class="result-panel__title">${passed ? Icons.check : Icons.alert} ${passed ? "نجحت في الاختبار!" : "لم تنجح بعد"}</p>
              <p class="assessment-score">${correctCount}/${questions.length} (${pct}%)</p>
              <p>${passed ? "أحسنت! فتحت دروس الفصل التالي." : "تحتاج " + quiz.passPercent + "% للنجاح. راجع الدروس وأعد المحاولة."}</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
                ${passed ? `<a class="btn btn--primary" href="${nextTarget}">${Icons.play} متابعة للفصل التالي</a>` : `<a class="btn" href="#/assessment/${chapterId}">إعادة الاختبار</a>`}
                <a class="btn" href="#/lesson/${ch.lessonIds[ch.lessonIds.length - 1]}">مراجعة الدروس</a>
              </div>
            </div>`;
        }
      };

      if (q.type === "tf") {
        card.querySelectorAll(".tf-opt").forEach(btn => btn.addEventListener("click", () => {
          const v = btn.getAttribute("data-v") === "true";
          finalize(btn, v === q.answer, q.why);
        }));
      } else {
        card.querySelectorAll(".mc-opt").forEach(btn => btn.addEventListener("click", () => {
          const i = parseInt(btn.getAttribute("data-i"), 10);
          finalize(btn, q.options[i].correct, q.options[i].why);
        }));
      }
    });
  }

  /* ================= بدء التشغيل ================= */
  function init() {
    // ربط مزامنة التقدم بالسحابة (إن كان Firebase مفعّلًا)
    Auth.hookProgressSync();
    // انتظر تهيئة المصادقة ثم وجّه المستخدم
    Auth.init().then(() => {
      if (!location.hash) location.hash = "#/home";
      else navigate(location.hash);
    });
  }

  return { init, navigate, go };
})();

window.App = App;
App.init();
