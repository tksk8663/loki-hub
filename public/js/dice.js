// deno-lint-ignore-file
let ws;
if (window.location.protocol === "https:") {
  ws = new WebSocket(`wss://${window.location.hostname}:${window.location.port}/socket`);
} else {
  ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/socket`);
}
const roginRoomId = (window.location.pathname ?? "").replace("/dice/", "");

function getUserId() {
  for (const c of document.cookie.split(";")) {
    const key = c.split("=")[0]?.replace(/^\s+/, "");
    const value = c.split("=")[1];
    if (key === "userid") {
      userId = String(value);
    }
  }
  return userId;
}

function sendWsDice(msg) {
  const userId = getUserId();
  if (userId) {
    if (!msg.page) msg.page = "dice";
    msg.player = userId ?? "unKnown";
    setTimeout(() => {
      ws.send(JSON.stringify(msg));
    }, 0);
  } else {
    alert("ログインデータがありません");
    window.location.href = "/";
  }
}

function addRoom() {}

function joinRoom(roomId) {
  sendWsDice({ roomId: roomId, status: "joinRoom" });
  window.location.href = `/dice/${roomId}`;
}

function exitRoom(roomId) {
  sendWsDice({ roomId: roomId, status: "exitRoom" });
  window.location.href = "/dice";
}

function diceMinus(roomId) {
  sendWsDice({ roomId: roomId, status: "diceMinus" });
}

function dicePlus(roomId) {
  sendWsDice({ roomId: roomId, status: "dicePlus" });
}

async function getUserName(id) {
  const res = await fetch("/auth/check?userid=" + (id ? id : userId));
  const data = await res.json();
  const name = data.user.viewName ?? data.user.name;
  if (data && data.user && name) {
    return name;
  } else {
    return undefined;
  }
}

ws.onopen = () => {
  sendWsDice({ roomId: roginRoomId, status: "dataRequest" });
};

const defaultDiceCount = 3;
let diceInterval = [];
let dices = [];
let rollPlayer = "";
ws.onmessage = async (event) => {
  const data = JSON.parse(event.data);
  //if (data && data.page === "dice") console.log(`[${data.id}] === [${roginRoomId}]`);
  if (data && data.page === "dice" && data.id === roginRoomId) {
    const diceCount = document.getElementById("dice-count");
    if (diceCount) {
      //console.log(data.status);
      if (["dataRequest", "diceMinus", "dicePlus", "diceCount"].includes(data.status)) {
        diceCount.value = data.count ?? defaultDiceCount;
        diceCount.blur();
        dataUpdate();
      } else if (data.status === "diceRoll") {
        //console.log("dice roll");
        const userName = await getUserName(data.userId);
        if (userName) rollPlayer = String(userName);
        let stopCount = 0;
        let temp = [];
        for (let i = 0; i < diceCount.value; i++) {
          const diceB = document.getElementById(`dice-box-${i}`);
          diceB.style.backgroundColor = "";
          diceInterval[i] = setInterval(
            () => {
              const diceValue = getRandomInt(6) + 1;
              const dice = document.getElementById(`dice-${i}`);
              dice.src = `/${diceValue}.png`;
            },
            100,
            i
          );
          if (data.userId === userId) {
            setTimeout(
              (i, diceInterval) => {
                clearInterval(diceInterval);
                const diceValue = getRandomInt(6) + 1;
                const dice = document.getElementById(`dice-${i}`);
                const diceB = document.getElementById(`dice-box-${i}`);
                diceB.style.backgroundColor = "#0f0";
                dice.src = `/${diceValue}.png`;
                temp.push(diceValue);
                stopCount++;
                sendWsDice({ roomId: data.id, status: "diceData", num: i, value: diceValue });
                if (stopCount == diceCount.value) {
                  sendWsDice({ roomId: data.id, status: "diceStop" });
                }
              },
              (getRandomInt(30) / 10 + 0.5) * 1000,
              i,
              diceInterval[i]
            );
          }
        }
      } else if (data.status === "diceData") {
        //console.log("roll stop");
        clearInterval(diceInterval[data.num]);
        const dice = document.getElementById(`dice-${data.num}`);
        const diceB = document.getElementById(`dice-box-${data.num}`);
        diceB.style.backgroundColor = "#0f0";
        dice.src = `/${data.value}.png`;
        dices.push(data.value);
      } else if (data.status === "diceStop") {
        //console.log("all roll stop");
        diceInterval = [];
        const result = dices.sort((a, b) => a - b);
        let temp = rollPlayer ? rollPlayer + ": " : "";
        for (let i = 0; i < result.length; i++) {
          temp += `<span><img src="/${result[i]}.png" /></span>`;
        }
        const rollHistory = document.getElementById("roll-history");
        rollHistory.innerHTML = temp + "<br>" + rollHistory.innerHTML;
        const button = document.getElementById("roll-button");
        button.disabled = false;
        dices = [];
      }
    }
  }
};

function countUpdate(roomId) {
  const diceCount = document.getElementById("dice-count");
  sendWsDice({ roomId: roomId, status: "diceCount", count: diceCount.value ?? defaultDiceCount });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function goRoll(roomId) {
  const button = document.getElementById("roll-button");
  if (button.disabled !== true) {
    button.disabled = true;
    sendWsDice({ roomId: roomId, status: "diceRoll", userId: userId });
  }
}

function dataUpdate() {
  const diceCount = document.getElementById("dice-count");
  const diceBox = document.getElementById("dice-box");
  let dices = "";
  for (let i = 0; i < (diceCount.value ?? defaultDiceCount); i++) {
    dices += `<div id="dice-box-${i}"><img id="dice-${i}" src="/1.png" /></div>`;
  }
  diceBox.innerHTML = dices;
}

ws.onclose = () => {
  //console.log("❌ Connection closed");
};
