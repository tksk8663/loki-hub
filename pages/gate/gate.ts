import { errorResponse } from "../../error.ts";
import { getHead } from "../../common-head.ts";
import { getHeader } from "../../header.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

export function gate(req: Request, prm: { [key: string]: number | string } | undefined): Response {
  const method = req.method;
  if (method === "GET") {
    return getPage(prm);
  } else {
    return errorResponse(404);
  }
}

function getPage(_prm: { [key: string]: number | string } | undefined): Response {
  try {
    const header = getHead("GATE");
    const body = `<!DOCTYPE html>
<html lang="ja">${header}
  <body>
    ${getHeader()}
    <div class="main">
      <div></div>
      <div style="width: 480px">
        <div></div>
        <div class="elm-center center">ユーザー管理にGoogleログインを利用しています</div>
        <div class="elm-center center">ユーザー管理以外にはデータは使用していません</div>
        <div>&nbsp;</div>
        <div id="google-login" class="elm-center" style="width: 320px; display: none;">
          <div id="g_id_onload"
            data-client_id="${Deno.env.get("GOOGLE_CLIENT_ID")}"
            data-callback="_handleCredentialResponse"
            data-auto_prompt="false">
          </div>

          <div class="g_id_signin"
            data-type="standard"
            data-size="large"
            data-theme="outline"
            data-text="sign_in_with"
            data-shape="rectangular"
            data-logo_alignment="left">
          </div>
        </div>
      </div>
      <div></div>
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
