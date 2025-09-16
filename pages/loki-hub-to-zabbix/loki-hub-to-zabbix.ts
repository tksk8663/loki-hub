import log from "../../logger.ts";

interface ZabbixConnectResponse {
  status: "success" | "fail";
  result?: string; // バージョン
  error?: string;
}

export async function checkZabbixConnect(_req: Request, prm: { [key: string]: number | string }): Promise<Response> {
  try {
    const version = await postZabbixApi("apiinfo.version", prm.ip as string, []);
    if (version.status === "success") {
      const versionNumber = getZabbixVersion(version.result!);
      const varsionString = String(version.result);
      let postPrm;
      if (versionNumber >= getZabbixVersion("5.0.0")) {
        postPrm = {
          username: prm.user,
          password: prm.pw,
        };
      } else {
        postPrm = {
          user: prm.user,
          password: prm.pw,
        };
      }
      const login = await postZabbixApi("user.login", prm.ip as string, postPrm);
      if (login.status === "success") {
        const auth = String(login.result);
        const exit = await postZabbixApi("user.logout", prm.ip as string, {}, auth);
        log.debug(JSON.stringify(exit));
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        return new Response(JSON.stringify({ status: "success", result: varsionString }), {
          status: 200,
          headers,
        });
      } else {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        return new Response(JSON.stringify({ status: "fail", error: "Login to Zabbix is failing." }), {
          status: 401,
          headers,
        });
      }
    } else {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      return new Response(JSON.stringify({ status: "fail", error: "Cannot access to Zabbix." }), {
        status: 404,
        headers,
      });
    }
  } catch (e: any) {
    log.error(e.stack);
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    return new Response(JSON.stringify({ status: "fail", error: "Any server error." }), {
      status: 500,
      headers,
    });
  }
}

async function postZabbixApi(method: string, ip: string, prm: any, auth?: string): Promise<ZabbixConnectResponse> {
  try {
    const requestBody = {
      jsonrpc: "2.0",
      method: method,
      params: prm,
      id: 1,
      auth: auth ?? null,
    };

    const res = await fetch(`http://${ip}/zabbix/api_jsonrpc.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    const data = await res.json();
    if (data.result) {
      return { status: "success", result: data.result };
    } else if (data.error) {
      return { status: "fail", error: data.error.message };
    } else {
      return { status: "fail" };
    }
  } catch (e: any) {
    log.error(e.stack);
    return { status: "fail", error: e.stack };
  }
}

function getZabbixVersion(version: string) {
  const sub = version.split(".");
  return Number(sub[0]) * 100000 + Number(sub[1] ?? 0) * 1000 + Number(sub[2] ?? 0);
}
