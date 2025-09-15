import { errorResponse } from "../error.ts";

export async function checkZabbixConnect(_req: Request, prm: { [key: string]: number | string }): Promise<Response> {
  try {
    const ret = await postZabbixApi("apiinfo.version", prm.ip as string, []);
    if (ret.status === "success") {
      console.log(prm);
      const ret = await postZabbixApi("user.login", prm.ip as string, {
        user: prm.user,
        password: prm.pw,
      });
      if (ret.status === "success") {
        const version = String(ret.result);
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        return new Response(JSON.stringify({ status: "success", result: version }), {
          status: 200,
          headers,
        });
      } else {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        return new Response(JSON.stringify({ status: "fail", error: "Cannot access to Zabbix." }), {
          status: 500,
          headers,
        });
      }
    } else {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      return new Response(JSON.stringify({ status: "fail", error: "Cannot access to Zabbix." }), {
        status: 500,
        headers,
      });
    }
  } catch (e) {
    console.error(e);
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    return new Response(JSON.stringify({ status: "fail", error: "Any server error." }), {
      status: 500,
      headers,
    });
  }

  /*body: JSON.stringify({
      jsonrpc: "2.0",
      method: "user.login",
      params: {
        user: user,
        password: pw,
      },
      id: 1,
      auth: null,
    }), //*/
}

async function postZabbixApi(method: string, ip: string, prm: any, auth?: string): Promise<any> {
  try {
    const res = await fetch(`http://${ip}/zabbix/api_jsonrpc.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json-rpc",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: method,
        params: prm,
        id: 1,
        auth: auth ? auth : null,
      }),
    });
    const data = await res.json();
    console.log(data);
    if (data.result) {
      return { status: "success", result: data.result };
    } else {
      return { status: "fail" };
    }
  } catch (e) {
    console.error(e);
    return { status: "fail", error: e };
  }
}
