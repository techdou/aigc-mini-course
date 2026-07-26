/* ============================================================
 * AIGC 实战入门 · Pages 构建脚本
 * 用 lengyi-markdown-editor 同款内核（marked + mermaid）
 * 把 _src/*.md 预渲染成静态 HTML
 *
 * 用法：node build.js
 * 产物：index.html + lesson-01.html ... lesson-10.html
 * ============================================================ */
const fs = require("fs");
const path = require("path");

// 引擎：与 lengyi-markdown-editor 一致的渲染栈核心（marked）
const { marked } = require("marked");

const ROOT = path.resolve(__dirname, ".."); // 仓库根（站点根）
const SRC_DIR = path.join(ROOT, "src");
const OUT_DIR = ROOT;
const ASSETS_REL = "assets"; // HTML 中相对路径

// ---------- 元数据 ----------
// 10 节课的展示元信息（供 index.html 卡片与单节页头使用）
const LESSONS = [
  { n: 1,  file: "01_AI到底能为普通人做什么.md",          title: "AI 到底能为普通人做什么",          duration: "8 分钟",  difficulty: "入门",    summary: "从三个真实成果出发，建立对 AI 能力边界的正确预期——不是陪聊，是把想法做出来。" },
  { n: 2,  file: "02_什么是大语言模型LLM.md",              title: "什么是大语言模型 LLM",             duration: "12 分钟", difficulty: "入门",    summary: "用超级学霸类比讲清 LLM，建立 Token、训练、能力边界三件事的直觉。" },
  { n: 3,  file: "03_什么是提示词Prompt.md",               title: "什么是提示词 Prompt",              duration: "12 分钟", difficulty: "入门",    summary: "把模糊想法说清楚——背景、目标、对象、要求、输出五要素法。" },
  { n: 4,  file: "04_LLM和Agent有什么区别.md",             title: "LLM 和 Agent 有什么区别",          duration: "10 分钟", difficulty: "入门",    summary: "顾问与助理之分：为什么有的 AI 只能说，有的 AI 却能做。" },
  { n: 5,  file: "05_什么是Skill和API.md",                 title: "什么是 Skill 和 API",              duration: "12 分钟", difficulty: "进阶",    summary: "Skill 是技能包，API 是插座——AI 怎样获得专业能力并连接外部服务。" },
  { n: 6,  file: "06_Agent为什么能操作文件和软件.md",      title: "Agent 为什么能操作文件和软件",      duration: "13 分钟", difficulty: "进阶",    summary: "拆穿 Agent 的神通广大：背后是工具、权限与安全边界。" },
  { n: 7,  file: "07_不同人群怎样使用Agent.md",            title: "不同人群怎样使用 Agent",           duration: "13 分钟", difficulty: "进阶",    summary: "家长、老师、办公人员三类场景，同一套 Agent 思维怎么落地。" },
  { n: 8,  file: "08_从文字到图片和视频的生成工作流.md",   title: "从文字到图片和视频的生成工作流",   duration: "13 分钟", difficulty: "进阶",    summary: "一条完整多模态工作流：Prompt → 图片 → 视频的节点串联。" },
  { n: 9,  file: "09_从口播稿到数字人和交互网页.md",       title: "从口播稿到数字人和交互网页",       duration: "14 分钟", difficulty: "实战",    summary: "把口播稿变成数字人和可点击的互动网页，串联起整条产出链。" },
  { n: 10, file: "10_AI趋势学习路径和后续课程.md",         title: "AI 趋势、学习路径和后续课程",      duration: "13 分钟", difficulty: "总结",    summary: "为什么现在值得学，普通人怎么继续学，以及下一步的进阶路径。" },
];

// v5.0 新增页面：课程总开场 + 4 个附录
// 这些页面用 renderPage 渲染（简化版 renderLesson，无"第 N/10 节"标记，文件名自定义）
const EXTRA_PAGES = [
  { file: "00_课程总开场.md",                outFile: "intro.html",       eyebrow: "课程总开场", title: "课程总开场",         duration: "4 分钟",  summary: "这门课给谁看、能学到什么、需要什么基础——以及哪些不会承诺。" },
  { file: "附录A_AIGC合规与法规.md",          outFile: "appendix-a.html",  eyebrow: "附录 A",     title: "AIGC 合规与法规",    duration: "15 分钟", summary: "生成式 AI 服务管理暂行办法、数据安全法、个保法、深度合成管理规定——红线在哪。" },
  { file: "附录B_AIGC安全与风险.md",          outFile: "appendix-b.html",  eyebrow: "附录 B",     title: "AIGC 安全与风险",    duration: "15 分钟", summary: "数据泄露、幻觉、prompt 注入、深度合成滥用——真实案例与防范清单。" },
  { file: "附录C_国产化与自主可控.md",         outFile: "appendix-c.html",  eyebrow: "附录 C",     title: "国产化与自主可控",    duration: "15 分钟", summary: "文心/通义/智谱/DeepSeek/Kimi/豆包/星火——国产大模型概览与选型建议。" },
  { file: "附录D_行业落地实证.md",            outFile: "appendix-d.html",  eyebrow: "附录 D",     title: "行业落地实证",       duration: "15 分钟", summary: "政务、教育、医疗、制造、金融——AIGC 在真实行业的落地案例。" },
];

// ---------- marked 配置 ----------
// 与 lengyi-markdown-editor 的 setOptions 对齐
marked.setOptions({
  gfm: true,
  breaks: false,
});

// 自定义 renderer：把图片路径从源 md 的相对路径改写到 pages/assets/...
// 同时把 ![alt](path) 包成 <figure> + <figcaption>（alt 本身就是"图 N：说明"）
const renderer = new marked.Renderer();
renderer.image = ({ href, title, text }) => {
  const src = rewriteImagePath(href);
  const alt = text || "";
  // alt 形如"图 1：Prompt 五要素卡"——直接当 figcaption
  if (alt) {
    return `<figure><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" /><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
  }
  return `<img src="${src}" alt="" loading="lazy" />`;
};
// 代码块：mermaid 走特殊容器；其他走普通 <pre><code>
renderer.code = ({ text, lang }) => {
  if (lang === "mermaid") {
    return `<div class="mermaid-wrap"><pre class="mermaid">${escapeHtml(text)}</pre></div>`;
  }
  const langClass = lang ? ` class="language-${escapeHtml(lang)}"` : "";
  return `<pre><code${langClass}>${escapeHtml(text)}</code></pre>`;
};
marked.use({ renderer });

// ---------- 工具函数 ----------
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 把 ../03_实践测试案例/assets/lessonXX/foo.png 改写为 assets/lessonXX/foo.png
// v5.0: 同时支持 appendixX/foo.png 和 promo/foo.png
function rewriteImagePath(href) {
  const mLesson = href.match(/lesson(\d+)\/([^/]+)$/);
  if (mLesson) return `${ASSETS_REL}/lesson${mLesson[1]}/${mLesson[2]}`;
  const mAppendix = href.match(/(appendix[A-D])\/([^/]+)$/);
  if (mAppendix) return `${ASSETS_REL}/${mAppendix[1]}/${mAppendix[2]}`;
  const mPromo = href.match(/promo\/([^/]+)$/);
  if (mPromo) return `${ASSETS_REL}/promo/${mPromo[1]}`;
  return href;
}

// 解析元信息 blockquote（首个 > 块，含"建议时长"和"本节目标"）
function extractIntro(md) {
  const m = md.match(/^>\s*([\s\S]+?)\n\n/m);
  if (!m) return { duration: "", goal: "" };
  const raw = m[1];
  const lines = raw.split("\n").map(l => l.replace(/^>\s?/, "").trim());
  let duration = "", goal = "";
  for (const l of lines) {
    const dm = l.match(/建议时长[：:]\s*(.+)/);
    if (dm) duration = dm[1].trim();
    const gm = l.match(/本节目标[：:]\s*(.+)/);
    if (gm) goal = gm[1].trim();
  }
  return { duration, goal };
}

// 去掉首个 blockquote（已经在 intro 里单独渲染）
function stripIntroBlockquote(md) {
  return md.replace(/^>\s*[\s\S]+?\n\n/, "");
}

// 把 H1 "第 N 节：标题" 里的纯标题部分取出
function extractTitleFromH1(md, fallback) {
  const m = md.match(/^#\s*第\s*\d+\s*节[：:]\s*(.+)$/m);
  return m ? m[1].trim() : fallback;
}

// 去掉 H1（标题已在模板里单独渲染）
function stripH1(md) {
  return md.replace(/^#\s*.+\n+/, "");
}

// ---------- 单节 HTML 模板 ----------
function renderLesson(lesson) {
  const srcPath = path.join(SRC_DIR, lesson.file);
  let md = fs.readFileSync(srcPath, "utf8");
  // 统一换行为 LF（源文件在 Windows 下可能是 CRLF，导致正则按 \n 匹配失败）
  md = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const title = extractTitleFromH1(md, lesson.title);
  const { duration, goal } = extractIntro(md);

  // 去掉 H1 和 intro blockquote 后再交给 marked 渲染
  md = stripH1(md);
  md = stripIntroBlockquote(md);
  let bodyHtml = marked.parse(md);
  // 修复 marked 把独立块级元素（figure/div.mermaid-wrap）包进 <p> 的非法嵌套
  // 形如 <p><figure>...</figure></p>  →  <figure>...</figure>
  bodyHtml = bodyHtml.replace(/<p>(<figure[\s\S]*?<\/figure>)<\/p>/g, "$1");
  bodyHtml = bodyHtml.replace(/<p>(<div class="mermaid-wrap"[\s\S]*?<\/div>)<\/p>/g, "$1");
  // 兜底：<p> 里只剩下空白或块级元素时，去掉 <p> 包装
  bodyHtml = bodyHtml.replace(/<p>\s*<\/p>/g, "");

  const prev = lesson.n > 1 ? LESSONS[lesson.n - 2] : null;
  const next = lesson.n < LESSONS.length ? LESSONS[lesson.n] : null;

  const prevHtml = prev
    ? `<a class="lesson-nav__link" href="lesson-${pad(prev.n)}.html" rel="prev">
         <span class="lesson-nav__label">← 上一节</span>
         <span class="lesson-nav__title">${escapeHtml(prev.title)}</span>
       </a>`
    : `<span class="lesson-nav__link lesson-nav__placeholder" aria-hidden="true"></span>`;
  const nextHtml = next
    ? `<a class="lesson-nav__link lesson-nav__link--next" href="lesson-${pad(next.n)}.html" rel="next">
         <span class="lesson-nav__label">下一节 →</span>
         <span class="lesson-nav__title">${escapeHtml(next.title)}</span>
       </a>`
    : `<span class="lesson-nav__link lesson-nav__placeholder" aria-hidden="true"></span>`;

  const metaParts = [];
  if (duration) metaParts.push(`建议 ${escapeHtml(duration)}`);
  metaParts.push(`难度 ${escapeHtml(lesson.difficulty)}`);
  metaParts.push(`第 ${lesson.n} / 10 节`);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>第 ${lesson.n} 节：${escapeHtml(title)} · AIGC 实战入门</title>
  <meta name="description" content="${escapeHtml(lesson.summary)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&display=swap">
  <link rel="stylesheet" href="assets/tokens.css">
  <link rel="stylesheet" href="assets/site.css">
</head>
<body>
  <header class="topbar">
    <a class="topbar__brand" href="index.html">AIGC 实战入门</a>
    <span class="topbar__spacer"></span>
    <span class="topbar__meta">第 ${lesson.n} / 10 节</span>
  </header>

  <main>
    <article class="lesson">
      <p class="lesson__eyebrow">第 ${lesson.n} 节</p>
      <h1 class="lesson__title">${escapeHtml(title)}</h1>
      <p class="lesson__meta">${metaParts.join(" · ")}</p>

      <div class="lesson__intro">
        ${goal ? `<p><strong>本节目标</strong></p><p>${escapeHtml(goal)}</p>` : ""}
        ${duration ? `<p><strong>建议时长</strong>：${escapeHtml(duration)}</p>` : ""}
      </div>

      <div class="lesson__body">
        ${bodyHtml}
      </div>
    </article>

    <nav class="lesson-nav" aria-label="上下节导航">
      ${prevHtml}
      ${nextHtml}
    </nav>

    <section class="cta">
      <div class="cta__panel">
        <div class="cta__text">
          想系统地走完整条学习路线？<br>
          <strong>了解进阶课程</strong>，把这套方法变成你能持续用的能力。
        </div>
        <a class="cta__btn" href="https://github.com/techdou" target="_blank" rel="noopener">了解进阶课程 →</a>
      </div>
    </section>
  </main>

  <footer class="footer">
    © 2026 techdou · AIGC 实战入门 · <a href="index.html">返回目录</a>
  </footer>

  <!-- mermaid 客户端渲染（与 lengyi-markdown-editor 同源同版本 v10） -->
  <script type="module" src="assets/mermaid-init.js"></script>
</body>
</html>
`;
}

// ---------- v5.0 额外页面（总开场 + 附录）模板 ----------
// 复用 renderLesson 的核心逻辑，但不带"第 N/10 节"标记，文件名自定义
function renderPage(page) {
  const srcPath = path.join(SRC_DIR, page.file);
  let md = fs.readFileSync(srcPath, "utf8");
  md = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 标题优先用 page.title（避免附录文件名里的 H1 格式差异）
  const title = page.title;
  const { duration, goal } = extractIntro(md);

  md = stripH1(md);
  md = stripIntroBlockquote(md);
  let bodyHtml = marked.parse(md);
  bodyHtml = bodyHtml.replace(/<p>(<figure[\s\S]*?<\/figure>)<\/p>/g, "$1");
  bodyHtml = bodyHtml.replace(/<p>(<div class="mermaid-wrap"[\s\S]*?<\/div>)<\/p>/g, "$1");
  bodyHtml = bodyHtml.replace(/<p>\s*<\/p>/g, "");

  const metaParts = [];
  if (duration) metaParts.push(`建议 ${escapeHtml(duration)}`);
  metaParts.push(escapeHtml(page.eyebrow));

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} · AIGC 实战入门</title>
  <meta name="description" content="${escapeHtml(page.summary)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&display=swap">
  <link rel="stylesheet" href="assets/tokens.css">
  <link rel="stylesheet" href="assets/site.css">
</head>
<body>
  <header class="topbar">
    <a class="topbar__brand" href="index.html">AIGC 实战入门</a>
    <span class="topbar__spacer"></span>
    <a class="topbar__meta" href="index.html" style="text-decoration:none;color:var(--coffee-4)">返回目录 ↑</a>
  </header>

  <main>
    <article class="lesson">
      <p class="lesson__eyebrow">${escapeHtml(page.eyebrow)}</p>
      <h1 class="lesson__title">${escapeHtml(title)}</h1>
      <p class="lesson__meta">${metaParts.join(" · ")}</p>

      <div class="lesson__intro">
        ${goal ? `<p><strong>本节目标</strong></p><p>${escapeHtml(goal)}</p>` : ""}
        ${duration ? `<p><strong>建议时长</strong>：${escapeHtml(duration)}</p>` : ""}
      </div>

      <div class="lesson__body">
        ${bodyHtml}
      </div>
    </article>

    <nav class="lesson-nav" aria-label="返回目录">
      <a class="lesson-nav__link" href="index.html" rel="prev">
        <span class="lesson-nav__label">← 返回目录</span>
        <span class="lesson-nav__title">课程首页</span>
      </a>
      <span class="lesson-nav__link lesson-nav__placeholder" aria-hidden="true"></span>
    </nav>
  </main>

  <footer class="footer">
    © 2026 techdou · AIGC 实战入门 · <a href="index.html">返回目录</a>
  </footer>

  <script type="module" src="assets/mermaid-init.js"></script>
</body>
</html>
`;
}

// ---------- 首页 index.html 模板 ----------
function renderIndex() {
  const cards = LESSONS.map(l => {
    const isFeature = l.n === 1 || l.n === 10;
    const featureLabel = l.n === 1 ? "开篇 · 从这里开始" : "结课 · 含进阶路线";
    return `<a class="card ${isFeature ? "card--feature" : ""}" href="lesson-${pad(l.n)}.html">
      <span class="card__num">${pad(l.n)}</span>
      <h3 class="card__title">${escapeHtml(l.title)}</h3>
      <p class="card__desc">${escapeHtml(l.summary)}</p>
      <span class="card__meta">
        ${isFeature ? `<strong style="color:var(--accent-strong)">${escapeHtml(featureLabel)}</strong> · ` : ""}
        建议 ${escapeHtml(l.duration)} <span class="card__arrow">→</span>
      </span>
    </a>`;
  }).join("\n      ");

  // v5.0: 附录卡片
  const appendixCards = EXTRA_PAGES.slice(1).map(p => {
    return `<a class="card card--appendix" href="${p.outFile}">
      <span class="card__num">${escapeHtml(p.eyebrow.replace("附录 ", ""))}</span>
      <h3 class="card__title">${escapeHtml(p.title)}</h3>
      <p class="card__desc">${escapeHtml(p.summary)}</p>
      <span class="card__meta">建议 ${escapeHtml(p.duration)} <span class="card__arrow">→</span></span>
    </a>`;
  }).join("\n      ");

  const introPage = EXTRA_PAGES[0];

  // v5.0: 海报作为 catalog 第一个 feature 元素（与 card--feature 等宽对齐）
  const heroBanner = `<a class="card card--feature card--hero-banner" href="${introPage.outFile}">
      <img src="assets/promo/01_课程主视觉海报.png" alt="课程主视觉：普通人也能学会的 AIGC 实战入门" class="hero-banner__img" loading="lazy" />
    </a>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>普通人也能学会的 AIGC 实战入门 · 10 节小课 + 政企普及附录</title>
  <meta name="description" content="面向零基础成人的 AIGC 实战入门课，10 节短课 + 4 个合规与产业附录，讲清 LLM、Prompt、Agent、Skill、API 与多模态工作流，全程贯穿一个真实项目。">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&display=swap">
  <link rel="stylesheet" href="assets/tokens.css">
  <link rel="stylesheet" href="assets/site.css">
</head>
<body>
  <header class="topbar">
    <a class="topbar__brand" href="index.html">AIGC 实战入门</a>
    <span class="topbar__spacer"></span>
    <a class="topbar__meta" href="#catalog" style="text-decoration:none;color:var(--coffee-4)">浏览目录 ↓</a>
  </header>

  <section class="hero">
    <div class="hero__inner">
      <p class="hero__eyebrow">techdou · AIGC mini course · v5.0 政企普及版</p>
      <h1 class="hero__title">普通人也能学会的<br>AIGC 实战入门</h1>
      <p class="hero__sub">10 节核心讲义 + 4 个合规与产业附录。从认识 AI 到把一个真实想法做成能交付的作品——零基础也能跟得上。</p>
      <a class="hero__cta" href="${introPage.outFile}">从课程总开场开始 →</a>
      <a class="hero__cta hero__cta--secondary" href="lesson-01.html">直接进第 1 节</a>
    </div>
  </section>

  <main class="catalog" id="catalog">
    <h2 class="catalog__heading">课程目录 · 10 节核心讲义</h2>
    <div class="catalog__grid">
      ${heroBanner}
      ${cards}
    </div>

    <h2 class="catalog__heading" style="margin-top:56px;">附录 · 合规与产业专题</h2>
    <p style="color:var(--coffee-3);margin:-8px 0 20px;font-size:15px;">政府/企业 AIGC 普及推广的权威背书层——法规、安全、国产化、行业实证。</p>
    <div class="catalog__grid">
      ${appendixCards}
    </div>

    <section class="catalog__pdf" style="margin:56px auto 0;padding:28px;border:1px solid var(--coffee-1);border-radius:12px;background:var(--cream-0);max-width:720px;text-align:center;">
      <h3 style="margin:0 0 8px;color:var(--coffee-4);">需要完整印刷版？</h3>
      <p style="color:var(--coffee-3);margin:0 0 16px;">74 页 A4 PDF 宣传册，含封面、版权页、目录、全部讲义与附录，适合政企培训现场分发。</p>
      <a class="hero__cta" href="https://github.com/techdou/aigc-mini-course/releases" target="_blank" rel="noopener" style="display:inline-block;">下载 PDF 宣传册 →</a>
    </section>
  </main>

  <footer class="footer">
    © 2026 techdou · AIGC 实战入门 · v5.0 政企普及版 · 内容遵循课程版权声明
  </footer>
</body>
</html>
`;
}

function pad(n) { return String(n).padStart(2, "0"); }

// ---------- 执行 ----------
function main() {
  console.log("[build] 开始渲染...");
  // 写 index.html
  const indexHtml = renderIndex();
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), indexHtml, "utf8");
  console.log("[build] ✓ index.html");

  // 写每节
  for (const l of LESSONS) {
    const html = renderLesson(l);
    const out = path.join(OUT_DIR, `lesson-${pad(l.n)}.html`);
    fs.writeFileSync(out, html, "utf8");
    console.log(`[build] ✓ lesson-${pad(l.n)}.html  ←  ${l.file}`);
  }

  // v5.0: 写额外页面（总开场 + 附录）
  for (const p of EXTRA_PAGES) {
    const html = renderPage(p);
    const out = path.join(OUT_DIR, p.outFile);
    fs.writeFileSync(out, html, "utf8");
    console.log(`[build] ✓ ${p.outFile}  ←  ${p.file}`);
  }

  console.log("[build] 完成。共 %d 节 + %d 个附录/总开场页 + 首页。", LESSONS.length, EXTRA_PAGES.length);
}

main();
