/* ============================================================
 * AIGC 实战入门 · mermaid 客户端渲染初始化
 * 与 lengyi-markdown-editor 同源同版本（mermaid v10）
 * 主题：方向 B 教育温暖系（奶油节点 + 棕边 + 深咖啡字）
 * ============================================================ */
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";

mermaid.initialize({
  startOnLoad: true,
  theme: "base",
  // useMaxWidth:false 让 SVG 拿天然定宽，桌面端由容器约束、
  // 移动端由 .mermaid-wrap 的 overflow-x:auto 横滑（符合规格）
  flowchart: { curve: "basis", useMaxWidth: false, htmlLabels: true },
  themeVariables: {
    primaryColor: "#FDF3E4",
    primaryBorderColor: "#DBCBB4",
    primaryTextColor: "#33291F",
    lineColor: "#7D6F61",
    edgeLabelBackground: "#FFFDF9",
    // fontFamily 继承正文（规格 B-4 要求）
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
    fontSize: "15px",
  },
});
