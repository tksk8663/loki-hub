export const template = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>__title__</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="/css/loki-hub.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="/js/loki-hub.js"></script>
</head>
<body>
<div class="header">
  <div style="width: 1200px; margin: 0 auto;">
    <div>開発途中のため、ログイン機能はなく、利用できる操作も制限されています。</div>
    <div>This tool is under development, so there is no login feature and available operations are limited.</div>
  </div>
</div>
<div class="main-content">
__content_body__
</div>
</body>
</html>`;

export const colors = [
  "red", // 赤
  "maroon", // 深い赤
  "magenta", // 赤紫
  "purple", // 紫
  "mediumslateblue", // 青紫
  "steelblue", // 青みがかったグレー
  "blue", // 青
  "navy", // 濃い青
  "cyan", // 明るいシアン
  "darkcyan", // 深いシアン
  "teal", // 緑がかった青
  "green", // 緑
  "lime", // 明るい緑
  "olive", // 黄緑がかった色
  "yellow", // 黄色
  "gold", // 黄金色
  "orange", // 明るいオレンジ
  "coral", // 柔らかいオレンジ
  "tomato", // 赤寄りオレンジ
  "sandybrown", // 明るい茶色（中間色）
];
