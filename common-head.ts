export function getHead(name?: string, css?: string, js?: string) {
  return `
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=480">
    <title>${name ?? "page"}</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="stylesheet" href="/css/common.css">
    ${css ? `<link rel="stylesheet" href="/css/${css}">` : ""}
    <script src="/js/common.js"></script>
    ${js ? `<script src="/js/${js}"></script>` : ""}
    <script src="https://accounts.google.com/gsi/client" async defer></script>
  </head>`;
}
