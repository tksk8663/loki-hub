let chdir = "";
if (Deno.build.os === "windows") {
  chdir = "D:\\tool\\Deno\\loki-hub";
  Deno.chdir(chdir);
} else if (Deno.build.os === "linux") {
  chdir = "/var/www/syamy";
  Deno.chdir(chdir);
} else {
  throw new Error("Unsupported OS");
}
let userData: Record<string, userPayloadFiltered> = {};
try {
  userData = JSON.parse(await Deno.readTextFile(chdir + "/user.json"));
} catch (e) {}

export function userAdd(id: string, data: any) {
  try {
    //console.log("write date: " + JSON.stringify(data));
    userData[id] = data;
    Deno.writeTextFile(chdir + "/user.json", JSON.stringify(userData, null, 2));
  } catch (e) {
    console.error(e);
  }
}

export function userDelete(id: string) {
  try {
    if (userData[id]) delete userData[id];
    Deno.writeTextFile(chdir + "/user.json", JSON.stringify(userData, null, 2));
  } catch (e) {
    console.error(e);
  }
}

export function userUpdate(id: string, name: string) {
  try {
    if (userData[id]) userData[id].viewName = name;
    Deno.writeTextFile(chdir + "/user.json", JSON.stringify(userData, null, 2));
  } catch (e) {
    console.error(e);
  }
}

export function userGet(id: string): userPayloadFiltered | undefined {
  return userData[id];
}

export function userIdGetFromGoogleId(gid: string): string | undefined {
  const ids = Object.keys(userData);
  let res = undefined;
  for (const id of ids) {
    if (gid === userData[id].sub && res == undefined) {
      res = id;
    }
  }
  return res;
}

export interface user {
  id: string;
  name: string;
}

export interface userPayload {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  nbf: number;
  picture: string;
  sub: string;
}

export interface userPayloadFiltered {
  name: string;
  picture: string;
  sub: string;
  viewName?: string;
}

setInterval(() => {
  try {
    Deno.writeTextFile(chdir + "/user.json", JSON.stringify(userData, null, 2));
  } catch (e) {
    console.error(e);
  }
}, 60 * 1000);
