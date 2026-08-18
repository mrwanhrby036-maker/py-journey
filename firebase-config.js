/* ==========================================================================
   PyJourney — إعدادات Firebase
   ----------------------------------------------------------------
   بيانات مشروعك من Firebase Console (Realtime Database + Authentication).
   عند اكتمال البيانات، تعمل المنصة على Firebase الحقيقي:
   - مصادقة بالبريد وكلمة المرور.
   - حفظ بيانات المستخدم في Realtime Database تحت users/{uid}.
   - حفظ التقدم في users/{uid}/progress ومزامنته تلقائيًا.
   - التسجيل مفتوح: أي مستخدم ينشئ حسابًا يدخل فورًا (لا انتظار موافقة).
   ========================================================================== */

const FirebaseConfig = {
  apiKey: "AIzaSyBeor8MTz1uaQumT3C4FFE6M7FZisPvom0",
  authDomain: "edulearn-platform-55b45.firebaseapp.com",
  databaseURL: "https://edulearn-platform-55b45-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "edulearn-platform-55b45",
  storageBucket: "edulearn-platform-55b45.firebasestorage.app",
  messagingSenderId: "866736202453",
  appId: "1:866736202453:web:b81f59c7ed4f39e940385c",
};

// هل البيانات مكتملة؟ (لو أي حقل أساسي فارغ → الوضع المحلي)
FirebaseConfig.isConfigured = function () {
  return Boolean(
    FirebaseConfig.apiKey &&
    FirebaseConfig.projectId &&
    FirebaseConfig.appId &&
    FirebaseConfig.databaseURL
  );
};

window.FirebaseConfig = FirebaseConfig;
