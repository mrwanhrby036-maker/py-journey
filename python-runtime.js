/* ==========================================================================
   PyJourney — Python Runtime
   ----------------------------------------------------------------
   يدير تنفيذ Python داخل المتصفح.
   1) يحاول استخدام Pyodide (CPython كامل عبر WebAssembly) — بلا أي API مدفوع.
   2) إذا لم يتوفر (مثلًا لا يوجد إنترنت)، يستخدم FallbackInterpreter المدمج.
   النتيجة موحّدة: { output, error } مع رسالة خطأ مبسّطة بالعربية.
   ========================================================================== */

const PythonRuntime = (() => {
  let pyodide = null;
  let state = "loading"; // loading | ready | fallback | error
  let initPromise = null;
  let stdoutBytes = []; // بايتات ناتج print() (UTF-8) داخل Pyodide

  // يضمن تحميل سكريبت Pyodide من CDN مرة واحدة فقط
  function ensurePyodideScript() {
    return new Promise((resolve) => {
      if (typeof loadPyodide === "function") { resolve(); return; }
      const existing = document.querySelector('script[data-pyodide]');
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => resolve());
        return;
      }
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
      s.setAttribute("data-pyodide", "1");
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  async function init() {
    // إذا سبق التهيئة (جاهز أو فشل نهائي) لا نكرر العمل
    if (state === "ready" || state === "fallback") return state;
    // تجنّب استدعاءات متزامنة متكررة
    if (initPromise) return initPromise;

    initPromise = (async () => {
      await ensurePyodideScript();

      // انتظر ظهور loadPyodide (السكريبت يُحمَّل بشكل غير متزامن)
      const deadline = Date.now() + 30000;
      while (typeof loadPyodide !== "function" && Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 200));
      }

      if (typeof loadPyodide !== "function") {
        state = "fallback";
        return state;
      }

      try {
        pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/" });
        // توجيه stdout/stderr إلى مجمّع بايتات لنلتقط ناتج print()
        // raw يمرّر بايتات UTF-8، فنفكّ تشفيرها لاحقًا للحفاظ على النص العربي والأسطر الجديدة.
        pyodide.setStdout({ raw: (code) => { stdoutBytes.push(code & 0xff); } });
        pyodide.setStderr({ raw: (code) => { stdoutBytes.push(code & 0xff); } });
        state = "ready";
      } catch (e) {
        console.warn("Pyodide failed to load, using fallback interpreter.", e);
        state = "fallback";
      }
      return state;
    })();

    return initPromise;
  }

  // تحويل رسالة خطأ Pyodide إلى هيكل موحّد
  function parsePyodideError(errMsg) {
    // غالبًا يكون آخر سطر هو نوع الخطأ
    const lines = errMsg.split("\n").filter(l => l.trim() !== "");
    const last = lines[lines.length - 1] || "";
    const m = last.match(/^([A-Za-z]+Error):?\s*(.*)$/);
    if (m) return { type: m[1], message: m[2] || m[1], raw: errMsg };
    return { type: "Error", message: errMsg, raw: errMsg };
  }

  // رسالة عربية مبسطة حسب نوع الخطأ
  function explain(type, message) {
    const map = {
      SyntaxError: "خطأ في كتابة الكود (SyntaxError) — غالبًا علامة اقتباس غير مغلقة، أو قوس ناقص، أو ترتيب غير صحيح.",
      NameError: "لم يجد Python اسمًا استخدمته (NameError) — غالبًا اسم متغير مكتوب خطأ أو لم يُعرَّف بعد.",
      TypeError: "خلط أنواع لا تعمل معًا (TypeError) — مثل جمع نص مع رقم، أو استدعاء شيء ليس دالة.",
      ValueError: "قيمة غير مناسبة (ValueError) — مثل تحويل نص ليس رقمًا إلى int().",
      IndexError: "فهرس خارج النطاق (IndexError) — تحاول الوصول لعنصر غير موجود في قائمة أو نص.",
      KeyError: "مفتاح غير موجود (KeyError) — تحاول الوصول لمفتاح غير موجود في قاموس.",
      ZeroDivisionError: "قسمة على صفر (ZeroDivisionError) — لا يمكن القسمة على 0.",
      IndentationError: "خطأ في المسافات البادئة (IndentationError) — تأكد من اتساق المسافات داخل الكتل.",
    };
    return map[type] || "حدث خطأ غير متوقع.";
  }

  async function runCode(source, inputs) {
    await init();

    // تحضير المدخلات لـ input()
    let inputBuffer = (inputs || []).slice();

    if (state === "ready") {
      try {
        // محقونة input داخل Pyodide
        if (inputBuffer.length > 0) {
          await pyodide.runPythonAsync(`
_inputs = ${JSON.stringify(inputBuffer)}
_idx = 0
def _fake_input(prompt=""):
    # لا نطبع نص الطلب ليبقى ناتج البرنامج نظيفًا (فقط نتائج print).
    global _idx
    if _idx < len(_inputs):
        v = _inputs[_idx]; _idx += 1; return v
    return ""
__builtins__.input = _fake_input
          `);
        }
        stdoutBytes = []; // ابدأ ناتجًا نظيفًا
        const result = await pyodide.runPythonAsync(source);
        // فكّ تشفير بايتات UTF-8 المجمّعة إلى نص
        let output = new TextDecoder("utf-8").decode(new Uint8Array(stdoutBytes));
        // لو كان آخر سطر تعبيرًا يرجع قيمة (وليس print)، نضمّن قيمته
        if (result !== undefined && result !== null) output += String(result) + "\n";
        return { output, error: null, engine: "pyodide" };
      } catch (e) {
        const parsed = parsePyodideError(e.message || String(e));
        return { output: null, error: { type: parsed.type, message: parsed.message, explain: explain(parsed.type, parsed.message), raw: parsed.raw }, engine: "pyodide" };
      }
    }

    // وضع fallback
    try {
      const res = FallbackInterpreter.run(source, inputBuffer);
      return { output: res.output, error: null, engine: "fallback" };
    } catch (e) {
      const msg = e.message || String(e);
      const m = msg.match(/^([A-Za-z]+Error):\s*(.*)$/);
      const type = m ? m[1] : "Error";
      const message = m ? m[2] : msg;
      return { output: null, error: { type, message, explain: explain(type, message), raw: msg }, engine: "fallback" };
    }
  }

  function getState() { return state; }

  return { init, runCode, getState };
})();

window.PythonRuntime = PythonRuntime;
