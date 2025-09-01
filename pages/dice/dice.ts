import { errorResponse } from "../../error.ts";
import { template } from "../../template.ts";
import { userGet, userPayloadFiltered } from "../../user.ts";
import { getCookiePrm } from "../../main.ts";
import { loadConfig } from "../../load-config.ts";

const config = await loadConfig();

let chdir;
try {
  chdir = config.dir[Deno.build.os];
  if (chdir === undefined) throw new Error("Unsupported OS");
} catch (_e) {
  throw new Error("Unsupported OS");
}

let roomData: Record<string, unknown> = {};
let json = "";
try {
  json = await Deno.readTextFile(chdir + "/pages/dice/data.json");
  roomData = JSON.parse(json);
} catch (e) {
  Deno.writeTextFile(chdir + "/pages/dice/data.json", JSON.stringify({ rooms: [] }, null, 2));
  roomData["rooms"] = [];
  console.error(e);
}
const defaultDiceCount = 3;

export function diceSocket(clients: Set<WebSocket>, data: diceData) {
  if (data.page === "dice") {
    const roomItem = ((roomData.rooms ?? []) as roomData[]).find((d: roomData) => d.id === data.roomId);
    //console.log(JSON.stringify(roomItem));
    if (roomItem) {
      //console.log(JSON.stringify(roomItem));
      const rollNow = roomItem.status === "diceRoll";
      roomItem.userId = data.userId;
      roomItem.status = data.status;
      switch (data.status) {
        case "dataRequest":
          sendWs(clients, roomItem);
          break;
        case "diceMinus":
          if (rollNow !== true) {
            roomItem.count = Number(roomItem.count ?? defaultDiceCount) - 1;
            if (roomItem.count < 1) roomItem.count = 1;
            sendWs(clients, roomItem);
          }
          break;
        case "dicePlus":
          if (rollNow !== true) {
            roomItem.count = Number(roomItem.count ?? defaultDiceCount) + 1;
            if (roomItem.count > 100) roomItem.count = 100;
            sendWs(clients, roomItem);
          }
          break;
        // deno-lint-ignore no-case-declarations
        case "joinRoom":
          const player = userGet(data.player) as userPayloadFiltered;
          if (!roomItem.member.find((m) => m.id === data.player)) {
            roomItem.member.push({ id: data.player, name: String(player.viewName ?? player.name) });
          }
          sendWs(clients, roomItem);
          break;
        case "exitRoom":
          if (roomItem.member.find((m) => m.id === data.player)) {
            roomItem.member = roomItem.member.filter((m) => m.id !== data.player);
          }
          sendWs(clients, roomItem);
          break;
        case "diceCount":
          if (rollNow !== true) {
            roomItem.count = Number(data.count);
          }
          sendWs(clients, roomItem);
          break;
        case "diceRoll":
          sendWs(clients, roomItem);
          break;
        case "diceStop":
          sendWs(clients, roomItem);
          break;
        case "diceData":
          roomItem.num = Number(data.num);
          roomItem.value = Number(data.value);
          sendWs(clients, roomItem);
          break;
      }
    } else {
      for (const socket of clients) {
        socket.send(JSON.stringify({}));
      }
    }
  }
}

function sendWs(clients: Set<WebSocket>, msg: any) {
  if (!msg.page) msg.page = "dice";
  for (const socket of clients) {
    socket.send(JSON.stringify(msg));
  }
}

export function dice(req: Request, prm: { [key: string]: number | string } | undefined): Response {
  try {
    const cookie = req.headers.get("cookie");
    const cookiePrm = getCookiePrm(cookie);
    const user = userGet(cookiePrm.userid);
    //console.log(JSON.stringify(user));

    const temp = template("さいころ", "dice.css", "dice.js");
    let content = `<div class="home-link"><a href="/home">ホームへ</a></div>`;
    if (prm?.id) {
      const exit = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
</svg>`;
      const plus = `<svg onclick="dicePlus('${prm.id}')" xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
</svg>`;
      const dash = `<svg onclick="diceMinus('${prm.id}')" xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-dash-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
</svg>`;
      content = `<div class="table" style="width: 100%;">
        <div class="table-cell"></div>
        <div class="table-cell small-box">
          <div class="div-button" onclick="exitRoom('${prm.id}')">${exit}&nbsp;退出</div>
        </div>
      </div>
      <div class="counter-box">
        <div>${dash}</div>
        <div><input id="dice-count" value="" oninput="countUpdate('${prm.id}')" /></div>
        <div>${plus}</div>
      </div>
      <div><button id="roll-button" onclick="goRoll('${prm.id}')">転がす</button></div>
      <div id="roll-history-box"><div id="roll-history"></div></div>
      <div id="dice-box"></div>`;
    } else {
      const person = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
</svg>`;
      const plus = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
</svg>`;
      content += '<div id="rooms" class="rooms">';
      if (roomData.rooms) {
        (roomData.rooms as roomData[]).forEach((room: roomData) => {
          if (room?.id && room.name && room.member && typeof room.member === "object")
            content += `<div class="room" id="${room.id}" onclick="joinRoom('${room.id}')"><div>${room.name}</div><div>${person.repeat(
              room.member.length
            )}</div></div>`;
        });
      }
      content += `<div class="create-room" onclick="addRoom()"><div>${plus}</div></div>`;
      content += "</div>";
    }

    return new Response(temp.replace("__main_contents__", content), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (e) {
    console.error(e);
    return errorResponse(500);
  }
}

interface diceData {
  page: string;
  player: string;
  status: string;
  count: number;
  roomId: string;
  userId: string;
  num: number;
  value: number;
}

interface roomData {
  id: string;
  page: string;
  name: string;
  count: number;
  member: menberData[];
  history: string[];
  status: string;
  userId: string;
  num: number;
  value: number;
}

interface menberData {
  id: string;
  name: string;
}
