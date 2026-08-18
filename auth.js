/* ==========================================================================
   PyJourney — المصادقة والحسابات (Auth)
   ----------------------------------------------------------------
   يدير تسجيل الدخول وإنشاء الحساب وتسجيل الخروج، مع مزامنة التقدم إلى السحابة.

   يعمل على Firebase Realtime Database (بنية متوافقة مع مشروعك):
   - users/{uid}: { email, name, phone, isAdmin, approved, createdAt, progress }
   - adminNotifications: إشعار للمشرف عند كل تسجيل جديد.
   - deletedEmails: قائمة بريد محظورة (المستخدم المحذوف لا يعيد التسجيل).

   نظام الموافقة:
   - عند إنشاء حساب جديد: approved = false → ينتظر موافقة المشرف.
   - عند تسجيل الدخول: إن لم يكن مفعّلًا يبقى في شاشة "قيد المراجعة".

   وضعان:
   1) وضع Firebase (عند توفر بيانات FirebaseConfig + تحميل الـ SDK).
   2) الوضع المحلي (بدون إنترنت / بيانات ناقصة — للمعاينة فقط).
   ========================================================================== */

const Auth = (() => {
  const USERS_KEY = "pyjourney-users";
  const SESSION_KEY = "pyjourney-session";

  let mode = "local"; // local | firebase
  let current = null;   // المستخدم المفعّل فقط
  let pending = null;   // { email, name } لمستخدم مسجّل لكنه بانتظار التفعيل
  let fb = null;
  let firebaseAuth = null;
  let db = null;
  const listeners = [];

  // آلية انتظار استقرار حالة المصادقة (بعد قراءة قاعدة البيانات)
  let settleResolvers = [];
  function waitForAuthSettle() {
    return new Promise((res) => settleResolvers.push(res));
  }
  function signalSettled() {
    const rs = settleResolvers;
    settleResolvers = [];
    rs.forEach((r) => r());
  }

  /* ================= وضع Firebase ================= */
  function initFirebase() {
    fb = window.firebase;
    if (!fb.apps || !fb.apps.length) fb.initializeApp(FirebaseConfig);
    firebaseAuth = fb.auth();
    db = fb.database();
    // إبقاء الجلسة حتى بعد إغلاق المتصفح
    if (fb.auth && fb.auth.Auth && fb.auth.Auth.Persistence) {
      firebaseAuth.setPersistence(fb.auth.Auth.Persistence.LOCAL);
    }

    firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        await applyUserState(user);
      } else {
        current = null;
        pending = null;
        notify();
      }
      signalSettled();
    });
  }

  // قراءة سجل المستخدم وتحديد حالته (مفعّل / قيد المراجعة)
  async function applyUserState(user) {
    try {
      const snap = await db.ref("users/" + user.uid).once("value");
      if (snap.exists()) {
        const d = snap.val();
        if (d.approved === false && d.isAdmin !== true) {
          current = null;
          pending = { email: user.email, name: d.name || "" };
        } else {
          current = {
            uid: user.uid,
            email: user.email,
            displayName: d.name || user.email,
            isAdmin: d.isAdmin === true,
            mode: "firebase",
          };
          pending = null;
          await pullProgress(user.uid);
        }
      } else {
        // لا يوجد سجل (حالة نادرة) → اعتباره قيد المراجعة
        current = null;
        pending = { email: user.email, name: "" };
      }
    } catch (e) {
      console.warn("applyUserState:", e);
      current = null;
      pending = null;
    }
    notify();
  }

  async function pullProgress(uid) {
    try {
      const snap = await db.ref("users/" + uid + "/progress").once("value");
      if (snap.exists()) Progress.importData(snap.val());
    } catch (e) {
      console.warn("pullProgress:", e);
    }
  }

  let pushTimer = null;
  function pushProgress(uid) {
    if (!uid || mode !== "firebase") return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      try {
        await db.ref("users/" + uid).update({
          lastActiveAt: Date.now(),
          progress: Progress.exportData(),
        });
      } catch (e) {
        console.warn("pushProgress:", e);
      }
    }, 600);
  }

  /* ================= الوضع المحلي (للمعاينة) ================= */
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return "h" + h.toString(36);
  }

  function localUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveLocalUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function setSession(u) {
    current = u;
    pending = null;
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    notify();
  }

  function localSignUp(name, email, password) {
    const users = localUsers();
    if (users[email]) throw new Error("هذا البريد مسجّل مسبقًا. سجّل الدخول بدلًا من ذلك.");
    const uid = "local-" + Date.now().toString(36);
    users[email] = { uid, name, email, passwordHash: hash(password), createdAt: Date.now() };
    saveLocalUsers(users);
    setSession({ uid, email, displayName: name, mode: "local" });
    return { user: current, pending: null };
  }

  function localSignIn(email, password) {
    const u = localUsers()[email];
    if (!u || u.passwordHash !== hash(password)) {
      throw new Error("البريد أو كلمة المرور غير صحيحة.");
    }
    setSession({ uid: u.uid, email: u.email, displayName: u.name, mode: "local" });
    return { user: current, pending: null };
  }

  function localSignOut() {
    current = null;
    pending = null;
    localStorage.removeItem(SESSION_KEY);
    notify();
  }

  /* ================= التهيئة ================= */
  async function init() {
    if (FirebaseConfig.isConfigured() && typeof window.firebase !== "undefined" && window.firebase.initializeApp) {
      try {
        initFirebase();
        mode = "firebase";
        const p = waitForAuthSettle();
        await Promise.race([p, new Promise((r) => setTimeout(r, 6000))]);
        return mode;
      } catch (e) {
        console.warn("تعذّر تهيئة Firebase — التبديل للوضع المحلي.", e);
      }
    }
    // الوضع المحلي
    mode = "local";
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (s && s.mode === "local" && s.uid) current = s;
    } catch (e) { /* تجاهل */ }
    return mode;
  }

  /* ================= واجهة عامة ================= */
  function isAuthenticated() { return !!current; }
  function isPending() { return !!pending; }
  function currentUser() { return current; }
  function getPending() { return pending; }
  function getMode() { return mode; }
  function onAuthChange(cb) { listeners.push(cb); }
  function notify() { listeners.forEach((cb) => { try { cb(current); } catch (e) {} }); }

  async function signUp(name, email, password) {
    if (mode === "firebase") {
      // منع البريد المحذوف سابقًا
      const emailKey = email.replace(/\./g, "_");
      const delSnap = await db.ref("deletedEmails/" + emailKey).once("value");
      if (delSnap.exists()) {
        throw new Error("هذا البريد محظور من التسجيل. استخدم بريدًا آخر.");
      }

      const cred = await firebaseAuth.createUserWithEmailAndPassword(email, password);
      await db.ref("users/" + cred.user.uid).set({
        email: email,
        name: name,
        phone: "",
        isAdmin: false,
        approved: false,
        createdAt: new Date().toISOString(),
      });

      // إشعار المشرف بحساب جديد
      const notifRef = db.ref("adminNotifications").push();
      await notifRef.set({
        id: notifRef.key,
        userId: cred.user.uid,
        userName: name,
        userEmail: email,
        userPhone: "",
        registeredAt: new Date().toISOString(),
        read: false,
        type: "new_user",
      });

      // انتظر استقرار الحالة (سيكون قيد المراجعة)
      const p = waitForAuthSettle();
      await p;
      return { user: current, pending };
    }
    return localSignUp(name, email, password);
  }

  async function signIn(email, password) {
    if (mode === "firebase") {
      const p = waitForAuthSettle();
      await firebaseAuth.signInWithEmailAndPassword(email, password);
      await p;
      return { user: current, pending };
    }
    return localSignIn(email, password);
  }

  async function signInWithGoogle() {
    if (mode !== "firebase") {
      throw new Error("تسجيل الدخول عبر Google يتطلب ربط بيانات Firebase.");
    }
    const provider = new fb.auth.GoogleAuthProvider();
    const p = waitForAuthSettle();
    try {
      await firebaseAuth.signInWithPopup(provider);
    } catch (e) {
      // المتصفح منع النافذة المنبثقة → جرّب إعادة التوجيه (لا تحتاج Popup)
      if (e && (e.code === "auth/popup-blocked" || e.code === "auth/cancelled-popup-request")) {
        await firebaseAuth.signInWithRedirect(provider);
        return { user: null, pending: null, redirected: true };
      }
      throw e;
    }
    await p;
    return { user: current, pending };
  }

  async function resetPassword(email) {
    if (mode === "firebase") {
      await firebaseAuth.sendPasswordResetEmail(email);
      return;
    }
    throw new Error("استعادة كلمة المرور تتطلب ربط بيانات Firebase.");
  }

  async function signOut() {
    if (mode === "firebase") await firebaseAuth.signOut();
    else localSignOut();
  }

  // إعادة فحص حالة التفعيل (لزر "تحقق الآن" في شاشة قيد المراجعة)
  async function recheck() {
    if (mode !== "firebase") return;
    const u = firebaseAuth.currentUser;
    if (u) await applyUserState(u);
  }

  // ترقية الحساب الحالي إلى مشرف (أداة إعداد أولي للمالك)
  async function promoteSelf() {
    if (mode !== "firebase") throw new Error("غير متاح في الوضع المحلي.");
    const u = firebaseAuth.currentUser;
    if (!u) throw new Error("سجّل الدخول أولًا.");
    await db.ref("users/" + u.uid).update({ isAdmin: true, approved: true });
    await recheck();
  }

  function hookProgressSync() {
    Progress.onSave(() => {
      if (mode === "firebase" && current) pushProgress(current.uid);
    });
  }

  return {
    init, isAuthenticated, isPending, currentUser, getPending, getMode, onAuthChange,
    signUp, signIn, signInWithGoogle, resetPassword, signOut, recheck, promoteSelf,
    hookProgressSync,
  };
})();

window.Auth = Auth;
// أداة إعداد أولي: تُستخدم من الكونسول لترقية حسابك إلى مشرف (مرة واحدة)
window.makeMeAdmin = () => Auth.promoteSelf();
