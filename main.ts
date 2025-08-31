import { gate } from "./pages/gate/gate.ts";
import { home } from "./pages/home/home.ts";
import { dice, diceSocket } from "./pages/dice/dice.ts";
import { errorResponse } from "./error.ts";
import { verifyJwt } from "./google_jwt_verify.ts";
import { userAdd, userDelete, userUpdate, userGet, userIdGetFromGoogleId, userPayload, userPayloadFiltered } from "./user.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { newProject } from "./pages/new-project/new-project.ts";
import { loadConfig } from "./load-config.ts";

const config = await loadConfig();
const port = config.port;
Deno.serve(
  {
    hostname: "0.0.0.0",
    port: port,
  },
  handler
);
export let chdir = "";
try {
  chdir = config.dir[Deno.build.os];
} catch (_e) {
  throw new Error("Unsupported OS");
}
console.log(`🔄 Server restarting at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
const clients = new Set<WebSocket>();

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const prm = url.search.replace(/^\?/, "");
  const tmp = path.length > 1 ? path.split(".") : [];
  try {
    let ksk = "";
    if (tmp.length > 0 && tmp[0]) ksk = tmp[tmp.length - 1];
    const cTp = {
      css: { "Content-Type": "text/css" },
      js: { "Content-Type": "application/javascript" },
      ico: { "Content-Type": "image/x-icon" },
      png: { "Content-Type": "image/png" },
    };
    const cookie = req.headers.get("cookie");
    const cookiePrm = getCookiePrm(cookie);
    const { headers } = req;

    if (ksk === "css" || ksk === "js") {
      const file = await Deno.open("./public" + path);
      return new Response(file.readable, {
        headers: new Headers(cTp[ksk]),
      });
    } else if (ksk === "ico") {
      const file = await Deno.open("./" + path);
      return new Response(file.readable, {
        headers: new Headers(cTp[ksk]),
      });
    } else if (ksk === "png") {
      const file = await Deno.open("./public/images/" + path);
      return new Response(file.readable, {
        headers: new Headers(cTp[ksk]),
      });
    } else if (path === "" || path === "/") {
      return await gate(req, getprm(prm));
    } else if (path === "/home") {
      return await home(req, getprm(prm));
    } else if (path.startsWith("/dice")) {
      const params = getprm(prm) ?? {};
      const rid = path.replace("/dice", "").replace("/", "");
      if (rid && rid !== "" && rid !== "/") params["id"] = rid;
      return await dice(req, params);
    } else if (path === "/new-project") {
      return await newProject();
    } else if (path === "/exit") {
      const data = getprm(prm);
      if (data?.userId) userDelete(data.userId as string);
      return await gate(req, getprm(prm));
    } else if (path === "/auth/check") {
      const data = getprm(prm);
      const user = userGet(data?.userid as string);
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      if (user?.name) {
        return new Response(JSON.stringify({ user: { id: data?.userid, name: user.name, viewName: user.viewName } }), {
          status: 200,
          headers,
        });
      } else {
        return new Response(JSON.stringify({ user: undefined }), {
          status: 400,
          headers,
        });
      }
    } else if (req.method === "POST" && path === "/auth/google") {
      let rnd = randomString(64);
      const { token } = await req.json();
      if (!token) {
        return new Response(JSON.stringify({ success: false, error: "No token" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const payload = payloadFilter((await verifyJwt(token)) as unknown as userPayload);
      const uid = userIdGetFromGoogleId(payload.sub);
      if (uid) {
        rnd = uid;
      } else {
        userAdd(rnd, payload);
      }

      const headers = new Headers();
      headers.append("Set-Cookie", `userid=${rnd}; Path=/; SameSite=Lax`);
      headers.append("Content-Type", "application/json");
      // 必要に応じてセッション開始やユーザー保存など
      return new Response(JSON.stringify({ success: true, user: rnd }), {
        status: 200,
        headers,
      });
    } else if (req.method === "POST" && path === "/send_message") {
      const message = await req.text();
      //log.info(JSON.stringify(prm, null, 2));
      const hook = Deno.env.get("DISCORD_WEBHOOK_URL")!;

      if (message !== "") {
        const opt = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: message }),
        };

        const response = await fetch(hook, opt);

        const result = await response.text();
        if (result === "") {
          return new Response("success", {
            status: 200,
          });
        } else {
          return new Response("failer", {
            status: 500,
          });
        }
      } else {
        return new Response("no message", {
          status: 200,
        });
      }
    } else if (req.method === "POST" && path === "/change_name") {
      const data = getprm(prm);
      const userName = await req.text();
      if (data?.userid && userName !== "") {
        userUpdate(data.userid as string, userName);
      }
      return new Response("success", {
        status: 200,
      });
    } else if (path === "/socket" && headers.get("upgrade")?.toLowerCase() === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);
      if (!clients.has(socket)) clients.add(socket);
      //socket.onopen = () => console.log("WebSocket connected");
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data ?? "{}");
        if (data) {
          if (data.page == "dice") {
            diceSocket(clients, data);
          }
        } else {
          console.warn("unKnown data resive...");
          console.warn(JSON.stringify(event));
        }
      };
      //socket.onclose = () => console.log("WebSocket closed");
      return response;
    } else {
      return errorResponse(404);
    }
  } catch (e) {
    const data = getprm(prm);
    console.error("request to: " + path);
    console.error(JSON.stringify(data));
    console.error(e);
    return errorResponse(500);
  }
}

function payloadFilter(payload: userPayload): userPayloadFiltered {
  return {
    name: payload.name,
    picture: payload.picture,
    sub: payload.sub,
  };
}

function getprm(prm: string): { [key: string]: number | string } | undefined {
  if (prm === "" || !prm) return {};

  const ret: { [key: string]: string } = {};
  for (const p of prm.split("&")) {
    const tmp = p.split("=");
    ret[tmp[0]] = tmp.join("=").replace(tmp[0] + "=", "");
  }

  return ret;
}

export function getCookiePrm(cookie: string | null): { [key: string]: string } {
  const res: { [key: string]: string } = {};
  if (cookie) {
    for (const c of cookie.split(";")) {
      const key = c.split("=")[0]?.replace(/^\s+/, "");
      const val = c.split("=")[1];
      res[key] = val;
    }
  }
  return res;
}

function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array); // セキュアな乱数

  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}
