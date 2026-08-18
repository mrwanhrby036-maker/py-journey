/* ==========================================================================
   PyJourney — UI Helpers
   ----------------------------------------------------------------
   أيقونات SVG خفيفة، ومكوّنات عرض مشتركة (الشخصيات، كتل المحتوى، …).
   ========================================================================== */

const Icons = {
  logo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 4.9v9.2L12 21l-9-4.9V6.9L12 2z"/><path d="M12 2v19"/><path d="M3.2 7l17.6 9.4"/><path d="M3.2 16.4L20.8 7"/></svg>`,
  menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>`,
  home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>`,
  book: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  chart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="8"/><rect x="12" y="6" width="3" height="12"/><rect x="17" y="13" width="3" height="5"/></svg>`,
  refresh: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-2.64-6.36"/><path d="M21 3v6h-6"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  lock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>`,
  play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  arrowLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>`,
  arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>`,
  bulb: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 014 10.5c-.7.7-1 1.5-1 2.5H9c0-1-.3-1.8-1-2.5A6 6 0 0112 3z"/></svg>`,
  alert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>`,
  star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.6 7 .9-5.2 4.8 1.4 7-6.2-3.5-6.2 3.5 1.4-7L2 9.5l7-.9z"/></svg>`,
  close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`,
  logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>`,
  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
};

/* ---------- الهروب من HTML (أمان) ---------- */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------- التعبيرات المتاحة لكل شخصية ---------- */
const CHARACTER_EMOTIONS = [
  "neutral", "happy", "excited", "surprised", "thinking",
  "confused", "sad", "angry", "proud", "encouraging",
];

/* ---------- صورة الشخصية (مع تعبيرها + أنيميشن) ---------- */
function avatarHtml(charId, emotion) {
  const ch = Curriculum.characters[charId];
  if (!ch) return "";
  const em = (emotion && CHARACTER_EMOTIONS.indexOf(emotion) !== -1) ? emotion : "neutral";
  return `
    <div class="avatar avatar--img avatar--${ch.color}" aria-hidden="true">
      <span class="avatar__letter">${esc(ch.name[0])}</span>
      <img src="${charId}-${em}.png" alt="" onerror="this.remove()" />
    </div>`;
}

/* ---------- كتلة حوار ---------- */
function dialogueHtml(d) {
  const ch = Curriculum.characters[d.who];
  if (!ch) return `<p>${esc(d.text)}</p>`;
  return `
    <div class="character-row">
      ${avatarHtml(d.who, d.emotion)}
      <div class="speech">
        <p class="speech__name">${esc(ch.name)} — ${esc(ch.role)}</p>
        <p>${esc(d.text)}</p>
      </div>
    </div>`;
}

/* ---------- كتلة كود ---------- */
function codeHtml(code) {
  return `<div class="code-block" style="direction:ltr;text-align:left;background:#1b2233;color:#e6e9f2;border-radius:var(--radius-sm);padding:14px 18px;font-family:var(--mono);font-size:.88rem;line-height:1.7;overflow-x:auto;margin:12px 0;white-space:pre;">${esc(code)}</div>`;
}

/* ---------- رسم تعليمي ---------- */
function visualHtml(v) {
  let body = "";
  if (v.kind === "flow") {
    const steps = v.data.steps.map((s, i) => `
      ${i > 0 ? '<div class="flow__arrow">↓</div>' : ""}
      <div class="flow__step ${s.plain ? "flow__step--plain" : ""}">${esc(s.label)}</div>`).join("");
    body = `<div class="flow">${steps}</div>`;
  } else if (v.kind === "vars") {
    const boxes = v.data.boxes.map((b, i) => `
      ${i > 0 ? '<div class="var-box__arrow">=</div>' : ""}
      <div class="var-box">
        <div class="var-box__name">${esc(b.name)}</div>
        <div class="var-box__value">${esc(b.value)}</div>
        <div class="var-box__label">${esc(b.label || "")}</div>
      </div>`).join("");
    body = `<div class="var-diagram">${boxes}</div>`;
  } else if (v.kind === "index") {
    const cells = v.data.cells.map(c => `
      <div class="index-cell ${c.hl ? "index-cell--hl" : ""}">
        <span class="index-cell__i">${esc(c.i)}</span>${esc(c.v)}
      </div>`).join("");
    body = `<div class="index-row">${cells}</div>`;
  }
  // ملاحظة: لا نستخدم أي نوع "raw" يحقن HTML مباشرة (منعًا لثغرات XSS).
  return `<div class="visual"><div class="visual__head">${esc(v.title || "رسم توضيحي")}</div><div class="visual__body">${body}</div></div>`;
}

/* ---------- كتلة محتوى الدرس ---------- */
function renderContentBlock(block) {
  switch (block.type) {
    case "story":
      return `<div class="story-wrap"><span class="story-tag">موقف قصير</span>${block.dialogues.map(dialogueHtml).join("")}</div>`;
    case "heading":
      return `<div class="lesson-block"><h2 class="lesson-block__title">${esc(block.text)}</h2></div>`;
    case "text":
      return `<div class="lesson-block"><p class="${block.lead ? "lead" : ""}">${esc(block.text)}</p></div>`;
    case "list":
      return `<div class="lesson-block"><ul>${block.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`;
    case "code":
      return `<div class="lesson-block">${codeHtml(block.code)}</div>`;
    case "concept":
      return `<div class="concept-box"><div class="concept-box__label">${esc(block.label || "مفهوم أساسي")}</div><div>${esc(block.text)}</div></div>`;
    case "note":
      return `<div class="note-box note-box--${block.variant || "info"}">${esc(block.text)}</div>`;
    case "visual":
      return `<div class="lesson-block">${visualHtml(block)}</div>`;
    case "image":
      return `<figure class="lesson-figure">
        <div class="skeleton-img" data-img-skeleton></div>
        <img src="${esc(block.src)}" alt="${esc(block.alt || "")}" style="display:none" data-img />
        ${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ""}
      </figure>`;
    default:
      return "";
  }
}

/* ---------- شريط "هيا نجرب" ---------- */
function tryBannerHtml() {
  return `<div class="try-banner">
    <div class="try-banner__icon">${Icons.play}</div>
    <div class="try-banner__text">
      <p class="try-banner__title">هيا نجرب</p>
      <p class="try-banner__sub">اكتب الكود بنفسك وشغّله — التعلم يبدأ هنا.</p>
    </div>
  </div>`;
}
