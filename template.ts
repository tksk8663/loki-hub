import { getHead } from "./common-head.ts";
import { getHeader } from "./header.ts";

export function template(name: string, css?: string, js?: string) {
  return `<!DOCTYPE html>
  <html lang="ja">
    ${getHead(name, css, js)}
    <body>
      ${getHeader()}
      <div class="main">
        <div></div>
        <div style="width: 480px;">
          __main_contents__
        </div>
        <div id="data"></div>
      </div>
    </body>
  </html>`;
}
