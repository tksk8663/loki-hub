import { errorResponse } from "./pages/error.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { loadConfig } from "./load-config.ts";
import { welcome } from "./pages/welcome.ts";
import { lokiDashboard } from "./pages/loki-hub/loki-hub.ts";

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
  if (chdir === undefined) throw new Error("Unsupported OS");
} catch (_e) {
  throw new Error("Unsupported OS");
}
console.log(`🔄 Server restarting at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
const clients = new Set<WebSocket>();

async function handler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url, config.baseUrl);
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
      } else if (path === "/") {
        return new Response(welcome(), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      } else if (path === "/socket" && headers.get("upgrade")?.toLowerCase() === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(req);
        if (!clients.has(socket)) clients.add(socket);
        //socket.onopen = () => console.log("WebSocket connected");
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data ?? "{}");
          if (data) {
            if (data.page == "loki-hub") {
            } else {
              console.warn("unKnown data resive...");
              console.warn(JSON.stringify(data));
            }
          } else {
            console.warn("unKnown data resive...");
            console.warn(JSON.stringify(event));
          }
        };
        //socket.onclose = () => console.log("WebSocket closed");
        return response;
      } else if (path.startsWith("/loki-hub")) {
        const path_suffix = path.replace("/loki-hub", "");
        if (path_suffix === "" || path_suffix === "/dashboard") {
          return await lokiDashboard(req, getprm(prm));
        } else {
          return errorResponse(404);
        }
      } else {
        return errorResponse(404);
      }
    } catch (e) {
      const data = getprm(prm);
      console.error("request to: " + path);
      console.error(JSON.stringify(data));
      console.error(e);
      if (String(e).includes("NotFound:")) {
        return errorResponse(404);
      } else {
        return errorResponse(500);
      }
    }
  } catch (e) {
    console.error("request to: " + req.url);
    console.error(e);
    if (String(e).includes("NotFound:")) {
      return errorResponse(404);
    } else {
      return errorResponse(500);
    }
  }
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
