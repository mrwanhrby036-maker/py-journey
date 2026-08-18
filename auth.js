/* ==========================================================================
   PyJourney — المصادقة والحسابات (Auth)
   ----------------------------------------------------------------
   يدير تسجيل الدخول وإنشاء الحساب وتسجيل الخروج، مع مزامنة التقدم إلى السحابة.

   يعمل على Firebase Realtime Database:
   - users/{uid}: { email, name, phone, createdAt, progress }

   التسجيل مفتوح: أي مستخدم ينشئ حسابًا يدخل فورًا — لا يوجد انتظار موافقة.

   وضعان:
   1) وضع Firebase (عند توفر بيانات FirebaseConfig + تحميل الـ SDK).
   2) الوضع المحلي (بدون إنترنت / بيانات ناقصة — للمعاينة فقط).

   ملاحظة أمان:
   - لا توجد أي وسيلة لترقية النفس إلى مشرف من داخل المنصة؛
     حقل isAdmin لا يمكن كتابته إلا عبر Firebase Console مباشرة،
     وقواعد الأمان تمنع أي مستخدم عادي من تعديله.
   ========================================================================== */

const Auth = (() => {
  const USERS_KEY = "pyjourney-users";
  const SESSION_KEY = "pyjourney-session";

  let mode = "local"; // local | firebase
  let current = null; // { uid, email, displayName, isAdmin, mode }
  let fb = null;
  let firebaseAuth = null;
  let db = null;
  const listeners = [];

  // يُحَل عند أول استجابة من onAuthStateChanged (لاستقرار الحالة عند بدء التشغيل)
  let firstAuthResolve = null;
  const firstAuthDone = new Promise((r) => { firstAuthResolve = r; });

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
        notify();
      }
      if (firstAuthResolve) {
        firstAuthResolve();
        firstAuthResolve = null;
      }
    });
  }

  // قراءة سجل المستخدم وتفعيله (أي مستخدم مصادَق يدخل فورًا)
  async function applyUserState(user) {
    try {
      const snap = await db.ref("users/" + user.uid).once("value");
      const d = snap.exists() ? snap.val() : {};
      current = {
        uid: user.uid,
        email: user.email,
        displayName: d.name || user.email,
        isAdmin: d.isAdmin === true,
        mode: "firebase",
      };
      await pullProgress(user.uid);
    } catch (e) {
      console.warn("applyUserState:", e);
      current = null;
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

  /* ================= الوضع المحلي (للمعاينة فقط) ================= */
  // تجزئة كلمة المرور: SHA-256 مُملّح عبر Web Crypto (آمنة قدر الإمكان محليًا)
  function randomSalt() {
    const arr = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(arr);
    else for (let i = 0; i < 16; i++) arr[i] = Math.floor(Math.random() * 256);
    return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function hashPassword(password, salt) {
    try {
      if (window.crypto && crypto.subtle) {
        const data = new TextEncoder().encode(salt + "::" + password);
        const buf = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    } catch (e) { /* fallback أدناه */ }
    // احتياط (بيئة غير آمنة): تجزئة بسيطة — للطوارئ فقط
    let h = 5381;
    const s = salt + "::" + password;
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
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    notify();
  }

  async function localSignUp(name, email, password) {
    const users = localUsers();
    if (users[email]) throw new Error("هذا البريد مسجّل مسبقًا. سجّل الدخول بدلًا من ذلك.");
    const salt = randomSalt();
    const passwordHash = await hashPassword(password, salt);
    const uid = "local-" + Date.now().toString(36);
    users[email] = { uid, name, email, salt, passwordHash, createdAt: Date.now() };
    saveLocalUsers(users);
    setSession({ uid, email, displayName: name, mode: "local" });
    return current;
  }

  async function localSignIn(email, password) {
    const u = localUsers()[email];
    if (!u) throw new Error("البريد أو كلمة المرور غير صحيحة.");
    const h = await hashPassword(password, u.salt || "");
    if (h !== u.passwordHash) {
      throw new Error("البريد أو كلمة المرور غير صحيحة.");
    }
    setSession({ uid: u.uid, email: u.email, displayName: u.name, mode: "local" });
    return current;
  }

  function localSignOut() {
    current = null;
    localStorage.removeItem(SESSION_KEY);
    notify();
  }

  /* ================= التهيئة ================= */
  async function init() {
    if (FirebaseConfig.isConfigured() && typeof window.firebase !== "undefined" && window.firebase.initializeApp) {
      try {
        initFirebase();
        mode = "firebase";
        await Promise.race([firstAuthDone, new Promise((r) => setTimeout(r, 6000))]);
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
  function currentUser() { return current; }
  function getMode() { return mode; }
  function onAuthChange(cb) { listeners.push(cb); }
  function notify() { listeners.forEach((cb) => { try { cb(current); } catch (e) {} }); }

  async function signUp(name, email, password) {
    if (mode === "firebase") {
      const cred = await firebaseAuth.createUserWithEmailAndPassword(email, password);
      // نكتب فقط الحقول المسموح بها (بدون isAdmin — لا يمكن لأحد تعيينه من العميل)
      await db.ref("users/" + cred.user.uid).set({
        email: email,
        name: name,
        phone: "",
        createdAt: new Date().toISOString(),
      });
      await applyUserState(cred.user);
      return current;
    }
    return localSignUp(name, email, password);
  }

  async function signIn(email, password) {
    if (mode === "firebase") {
      const uc = await firebaseAuth.signInWithEmailAndPassword(email, password);
      await applyUserState(uc.user);
      return current;
    }
    return localSignIn(email, password);
  }

  async function signInWithGoogle() {
    if (mode !== "firebase") {
      throw new Error("تسجيل الدخول عبر Google يتطلب ربط بيانات Firebase.");
    }
    const provider = new fb.auth.GoogleAuthProvider();
    try {
      const res = await firebaseAuth.signInWithPopup(provider);
      await applyUserState(res.user);
      return { user: current };
    } catch (e) {
      // المتصفح منع النافذة المنبثقة → جرّب إعادة التوجيه (لا تحتاج Popup)
      if (e && (e.code === "auth/popup-blocked" || e.code === "auth/cancelled-popup-request")) {
        await firebaseAuth.signInWithRedirect(provider);
        return { user: null, redirected: true };
      }
      throw e;
    }
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

  function hookProgressSync() {
    Progress.onSave(() => {
      if (mode === "firebase" && current) pushProgress(current.uid);
    });
  }

  return {
    init, isAuthenticated, currentUser, getMode, onAuthChange,
    signUp, signIn, signInWithGoogle, resetPassword, signOut,
    hookProgressSync,
  };
})();

window.Auth = Auth;
