import { errorResponse } from "../../error.ts";
import { getHead } from "../../common-head.ts";
import { getHeader } from "../../header.ts";

export function home(req: Request, prm: { [key: string]: number | string } | undefined): Response {
  const method = req.method;
  if (method === "GET") {
    return getHome(prm);
  } else {
    return errorResponse(404);
  }
}

function getHome(_prm: { [key: string]: number | string } | undefined): Response {
  try {
    const header = getHead("HOME");
    const body = `<!DOCTYPE html>
<html lang="ja">${header}
  <body>
    ${getHeader()}
    <div class="main">
      <div></div>
      <div style="width: 480px;" class="home-lists">
        <div><a href="/dice"><img src="/1.png" />さいころ</a></div>
        <div class="qrcode">
          <div>ブックマークなどは↓に貼りなおしてください</div>
          <img src="/qrcode_tkst-kwsk.org.png" />
        </div>
        <div class="home-message">
          <div>&nbsp;</div>
          <div>要望があれば以下からどうぞ</div>
          <div><textarea id="message" placeholder="要望を記入して”送る”ボタンを押してください"></textarea></div>
          <div class="right"><button id="messageSend" onclick="sendMessage()">送る</button></div>
        </div>
      </div>
      <div id="data"></div>
    </div>
  </body>
</html>`;

    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (e) {
    console.error(e);
    return errorResponse(500);
  }
}
