<div align="center">

# AIGC 实战入门

**普通人也能学会的 AIGC 实战入门 · 10 节核心讲义 + 4 个政企普及附录**

v5.0 政企 AIGC 普及版——从认识 AI 到把一个真实想法做成能交付的作品，零基础也能跟得上。

</div>

---

## 这是什么

一套面向零基础成人的 AIGC 实战入门课程讲义。**10 节核心课**讲清 LLM、Prompt、Agent、Skill、API 与多模态工作流；**4 个附录**覆盖合规法规、安全风险、国产化选型、行业实证，作为政府/企业 AIGC 普及推广的权威背书层。全程贯穿一个真实项目「豆懂 AI 动物英语微课」，把抽象概念落到一个能看见、能检查的成品上。

本仓库是这套讲义的**静态网站版本**（翻页册），由 [lengyi-markdown-editor](https://github.com/woyin2024/lengyi-markdown-editor) 的同款渲染内核（marked + mermaid）预渲染成纯 HTML，托管在 GitHub Pages 上。

**线上地址**：<https://techdou.github.io/aigc-mini-course/>

## 课程目录

### 10 节核心讲义（主线）

| 节次 | 主题 | 时长 | 难度 |
|---|---|---|---|
| 开场 | 课程总开场 | 4 分钟 | — |
| 01 | AI 到底能为普通人做什么 | 8 分钟 | 入门 |
| 02 | 什么是大语言模型 LLM | 12 分钟 | 入门 |
| 03 | 什么是提示词 Prompt | 12 分钟 | 入门 |
| 04 | LLM 和 Agent 有什么区别 | 10 分钟 | 入门 |
| 05 | 什么是 Skill 和 API | 12 分钟 | 进阶 |
| 06 | Agent 为什么能操作文件和软件 | 13 分钟 | 进阶 |
| 07 | 不同人群怎样使用 Agent | 13 分钟 | 进阶 |
| 08 | 从文字到图片和视频的生成工作流 | 13 分钟 | 进阶 |
| 09 | 从口播稿到数字人和交互网页 | 14 分钟 | 实战 |
| 10 | AI 趋势、学习路径和后续课程 | 13 分钟 | 总结 |

### 4 个附录（副线 · v5.0 新增）

| 附录 | 主题 | 时长 |
|---|---|---|
| A | AIGC 合规与法规 | 15 分钟 |
| B | AIGC 安全与风险 | 15 分钟 |
| C | 国产化与自主可控 | 15 分钟 |
| D | 行业落地实证 | 15 分钟 |

## 仓库结构

```
.
├── index.html                 # 课程首页（10 节 + 附录导航 + PDF 下载）
├── intro.html                 # 课程总开场（v5.0 新增）
├── lesson-01.html ~ 10.html   # 10 节核心讲义页
├── appendix-a.html ~ d.html   # 4 个附录页（v5.0 新增）
├── assets/                    # 站点资源
│   ├── tokens.css             # 设计令牌（教育温暖系）
│   ├── site.css               # 共用排版与组件
│   ├── mermaid-init.js        # mermaid 客户端渲染初始化
│   ├── lesson01~10/           # 各节配图（PNG）
│   ├── appendixA~D/           # 附录配图（v5.0 新增）
│   └── promo/                 # 宣传主视觉、封面、学习路径图（v5.0 新增）
├── demo/                      # 贯穿项目成品（豆懂 AI 动物英语微课）
├── src/                       # 讲义 Markdown 源
│   ├── 00_课程总开场.md        # v5.0 新增
│   ├── 01-10_*.md             # 10 节讲义
│   └── 附录A~D_*.md           # 4 个附录（v5.0 新增）
├── scripts/
│   ├── build.js               # 预渲染脚本：md → HTML（支持 00 和附录）
│   └── serve.js               # 本地预览服务器
├── design-system/
│   └── aigc-mini-course-design-spec.md  # 设计规格文档
├── .gitignore
├── LICENSE
└── README.md
```

## 本地预览

需要 [Node.js](https://nodejs.org/) 18+。

```bash
# 1. 安装依赖
npm install

# 2. 重新构建（把 src/*.md 渲染成 HTML）
npm run build

# 3. 启动本地预览服务器
npm run serve
# 打开 http://localhost:4321/
```

如果你只是想看效果，不用克隆——直接访问线上版即可。

## 技术栈

- **渲染内核**：[marked](https://github.com/markedjs/marked) + [mermaid](https://github.com/mermaid-js/mermaid) v10（与 lengyi-markdown-editor 同源）
- **构建方式**：Node 脚本预渲染 markdown 为静态 HTML，无前端框架、无构建工具链
- **部署**：GitHub Pages，从仓库根目录发布
- **字体策略**：CJK 不加载网络字体，中文走系统字体栈；仅加载 Nunito（拉丁/数字，<40KB），避免移动端 webview 字体加载风险

## 设计

视觉方向：**教育温暖系**（奶油底 + 咖啡墨 + 陶土点缀），目标是面向零基础成人学员的"温暖但不低幼"——通过色彩亲和力降低"我学不会"的心理门槛，同时用克制纪律避免滑向儿童化。

设计决策的反 AI-slop 要点：

- 零 AI 蓝（`#3B82F6`）、零紫色渐变
- mermaid 节点自定义主题，不使用默认淡紫
- 元信息面板醒目但无左彩条、无过度阴影
- 强调色预算：每屏陶土色元素 ≤3 类
- 状态色必配文字标签，不单独依赖色相表意

完整设计规格见 [`design-system/aigc-mini-course-design-spec.md`](./design-system/aigc-mini-course-design-spec.md)，包含两套设计方向（教育温暖系 / 极简学术系）的令牌、线框、排版规则与反 slop 检查清单。

## 修改讲义

讲义内容维护在 `src/*.md`，不是 HTML。修改流程：

1. 编辑 `src/` 下对应的 markdown 文件
2. 运行 `npm run build` 重新渲染
3. `git add . && git commit && git push`，GitHub Pages 会自动更新

讲义格式的约定：
- 文件名：`NN_标题.md`（NN 是两位节序号）
- 首行：`# 第 N 节：标题`
- 紧跟的 blockquote：`建议时长` + `本节目标`（会被自动提取成醒目的元信息面板）
- 图片 alt 文本形如 `图 N：说明`（会被自动转成 figcaption）
- mermaid 代码块会被自动渲染并套上自定义主题

## 许可

本仓库采用**混合许可**（详见 [`LICENSE`](./LICENSE)）：

- **课程内容**（讲义正文、配图、设计规格）：CC BY-NC 4.0
  - 允许个人学习分享，**禁止商业使用**
  - 商用授权（付费课程、企业内训等）请联系作者
- **代码与站点框架**（构建脚本、CSS、HTML 结构）：MIT License

第三方依赖（mermaid、Nunito 字体、lengyi-markdown-editor）通过 CDN 加载，各自遵循其原始许可。

## 致谢

- 渲染内核源自 [lengyi-markdown-editor](https://github.com/woyin2024/lengyi-markdown-editor)（MIT License，作者 [@woyin2024](https://github.com/woyin2024)）
- 流程图由 [mermaid](https://github.com/mermaid-js/mermaid) 渲染
- 标题字体使用 [Nunito](https://fonts.google.com/specimen/Nunito)（SIL OFL）

---

<div align="center">

© 2026 [techdou](https://github.com/techdou) · AIGC 实战入门

</div>
