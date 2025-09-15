import { errorResponse } from "../error.ts";

export async function checkZabbixConnect(_req: Request, prm: { [key: string]: number | string }): Promise<Response> {
  try {
    console.log(prm);
    const res = await fetch(`http://${prm.ip}/zabbix/api_jsonrpc.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json-rpc",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "apiinfo.version",
        params: [],
        id: 1,
        auth: null,
      }),
    });

    const data = await res.json();
    console.log("API Response:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return errorResponse(500);
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
