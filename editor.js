/* ==========================================================================
   PyJourney — Code Editor Component
   ----------------------------------------------------------------
   محرر Python داخل المنصة: أرقام أسطر، تشغيل، إعادة، مسح، نسخ، وعرض الناتج
   أو رسالة الخطأ المفسّرة. يدعم input() عبر حقل مدخلات.
   ========================================================================== */

function createEditor(options) {
  const opts = Object.assign({
    initialCode: "",
    placeholder: "اكتب كود Python هنا…",
    inputs: [],        // قيم مدخلات لـ input()
    inputPrompt: null, // نص يوضح القيمة المدخلة
  }, options);

  const wrap = document.createElement("div");
  wrap.className = "editor-wrap";

  // شريط الأدوات
  const toolbar = document.createElement("div");
  toolbar.className = "editor-toolbar";
  toolbar.innerHTML = `
    <span class="editor-toolbar__title">محرر Python</span>
    <span class="spacer"></span>
    <button class="btn btn--primary btn--sm run-btn" type="button">تشغيل</button>
    <button class="btn btn--sm reset-btn" type="button">إعادة</button>
    <button class="btn btn--sm clear-btn" type="button">مسح</button>
    <button class="btn btn--sm copy-btn" type="button">نسخ</button>
  `;

  // منطقة الكود
  const codeArea = document.createElement("div");
  codeArea.className = "code-area";

  const lineNums = document.createElement("div");
  lineNums.className = "line-numbers";
  lineNums.setAttribute("aria-hidden", "true");

  const textarea = document.createElement("textarea");
  textarea.className = "code-input";
  textarea.setAttribute("spellcheck", "false");
  textarea.setAttribute("autocapitalize", "off");
  textarea.setAttribute("autocomplete", "off");
  textarea.setAttribute("aria-label", "محرر كود Python");
  textarea.placeholder = opts.placeholder;

  codeArea.appendChild(lineNums);
  codeArea.appendChild(textarea);

  // حقل المدخلات (يظهر فقط عند الحاجة)
  let inputField = null;
  if (opts.inputs && opts.inputs.length > 0) {
    const inputWrap = document.createElement("div");
    inputWrap.className = "editor-toolbar";
    inputWrap.style.borderTop = "1px solid var(--line)";
    inputWrap.innerHTML = `<span class="editor-toolbar__title">قيمة الإدخال input():</span>`;
    inputField = document.createElement("input");
    inputField.type = "text";
    inputField.className = "input-field";
    inputField.value = opts.inputs.join(",");
    inputField.setAttribute("aria-label", "قيمة الإدخال");
    inputWrap.appendChild(inputField);
    wrap.appendChild(inputWrap);
  }

  // لوحة الناتج
  const outputPanel = document.createElement("div");
  outputPanel.className = "output-panel";
  outputPanel.innerHTML = `
    <div class="output-panel__head">
      <span>الناتج</span>
      <span class="spacer"></span>
      <button class="output-clear" type="button" aria-label="مسح الناتج">مسح الناتج</button>
    </div>
  `;
  const outputBody = document.createElement("div");
  outputBody.className = "output-body";
  outputPanel.appendChild(outputBody);

  // شريط الحالة
  const status = document.createElement("div");
  status.className = "editor-status";
  status.innerHTML = `<span class="status-text"></span><span class="spacer"></span>`;

  wrap.appendChild(toolbar);
  wrap.appendChild(codeArea);
  wrap.appendChild(outputPanel);
  wrap.appendChild(status);

  // ---------- منطق ----------
  textarea.value = opts.initialCode || "";
  let original = opts.initialCode || "";

  function updateLineNumbers() {
    const count = textarea.value.split("\n").length;
    let html = "";
    for (let i = 1; i <= count; i++) html += i + "\n";
    lineNums.textContent = html;
  }

  function syncScroll() {
    lineNums.scrollTop = textarea.scrollTop;
  }

  textarea.addEventListener("input", updateLineNumbers);
  textarea.addEventListener("scroll", syncScroll);
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart, end = textarea.selectionEnd;
      textarea.value = textarea.value.slice(0, start) + "    " + textarea.value.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
      updateLineNumbers();
    }
  });

  const runBtn = toolbar.querySelector(".run-btn");
  const resetBtn = toolbar.querySelector(".reset-btn");
  const clearBtn = toolbar.querySelector(".clear-btn");
  const copyBtn = toolbar.querySelector(".copy-btn");
  const outputClear = outputPanel.querySelector(".output-clear");
  const statusText = status.querySelector(".status-text");

  function setOutput(text, isError) {
    outputBody.textContent = text || "";
    outputBody.classList.toggle("output-body--error", !!isError);
  }

  function setStatus(msg) {
    statusText.textContent = msg || "";
  }

  async function run() {
    const code = textarea.value;
    if (code.trim() === "") {
      setOutput("لا يوجد كود للتشغيل. اكتب شيئًا أولًا.", true);
      return;
    }
    setStatus("جارٍ التشغيل…");
    setOutput("");
    runBtn.disabled = true;
    try {
      // قراءة المدخلات من الحقل إن وجد
      let inputs = opts.inputs || [];
      if (inputField && inputField.value.trim() !== "") {
        inputs = inputField.value.split(",").map(s => s.trim());
      }
      const res = await PythonRuntime.runCode(code, inputs);
      if (res.error) {
        setOutput(res.error.raw, true);
        setStatus("خطأ: " + res.error.type);
        if (opts.onError) opts.onError(res.error);
      } else {
        setOutput(res.output, false);
        setStatus("تم التنفيذ بنجاح");
        if (opts.onRun) opts.onRun(res.output);
      }
    } catch (e) {
      setOutput(String(e), true);
      setStatus("خطأ غير متوقع");
    } finally {
      runBtn.disabled = false;
    }
  }

  runBtn.addEventListener("click", run);
  resetBtn.addEventListener("click", () => { textarea.value = original; updateLineNumbers(); setOutput(""); setStatus(""); });
  clearBtn.addEventListener("click", () => { textarea.value = ""; updateLineNumbers(); setStatus(""); });
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(textarea.value).then(() => {
      setStatus("تم النسخ");
      setTimeout(() => setStatus(""), 1200);
    }).catch(() => {
      textarea.select();
      document.execCommand("copy");
      setStatus("تم النسخ");
    });
  });
  outputClear.addEventListener("click", () => setOutput(""));

  updateLineNumbers();

  return {
    el: wrap,
    getValue: () => textarea.value,
    setValue: (v) => { textarea.value = v; original = v; updateLineNumbers(); },
    run,
    setOutput,
    getStatusEl: () => status,
  };
}
