// deno-lint-ignore-file no-window no-unused-vars
const cookie = document.cookie;
let userId = undefined;
for (const c of cookie.split(";")) {
  const key = c.split("=")[0]?.replace(/^\s+/, "");
  const value = c.split("=")[1];
  if (key === "userid") {
    userId = String(value);
  }
}

function _handleCredentialResponse(response) {
  try {
    if (!response.credential) {
      console.warn("⚠️ response.credential が空か undefined です");
      return;
    }
    const token = response.credential;
    // サーバーにトークンを送信
    fetch("/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // 例：トークンをLocalStorageに保存しておく
          //localStorage.setItem("google_id_token", response.credential);

          // ページ遷移
          window.location.href = "/home";
        } else {
          alert(data.error);
        }
      });
  } catch (e) {
    alert(e);
  }
}

function returnHome() {
  if (window.location.pathname.startsWith("/dice/")) {
    const result = window.confirm("ページから移動してよろしいですか？");
    if (result) {
      window.location.href = "/home";
    } else {
      return;
    }
  } else {
    window.location.href = "/home";
  }
}

function logout() {
  const cookiePrm = getCookiePrm(document.cookie);
  if (window.location.pathname.startsWith("/dice/")) {
    const result = window.confirm("連係を解除してよろしいですか？");
    if (result) {
      const roomId = window.location.pathname.replace("/dice/", "");
      exitRoom(roomId);
      //localStorage.removeItem("google_id_token");
      document.cookie = "userid=; max-age=0; path=/;";
      if (cookiePrm?.userid) {
        window.location.href = "/exit?userId=" + cookiePrm.userid;
      } else {
        window.location.href = "/exit";
      }
    } else {
      return;
    }
  } else {
    //localStorage.removeItem("google_id_token");
    document.cookie = "userid=; max-age=0; path=/;";
    if (cookiePrm?.userid) {
      window.location.href = "/exit?userId=" + cookiePrm.userid;
    } else {
      window.location.href = "/exit";
    }
  }
}

let userName = "";
async function loginCheck() {
  try {
    const googleLogin = document.getElementById("google-login");
    if (userId === undefined) {
      if (googleLogin) googleLogin.style.display = "";
      return false;
    }
    const res = await fetch("/auth/check?userid=" + userId);
    const data = await res.json();
    //const id_token = localStorage.getItem("google_id_token");
    const cookiePrm = getCookiePrm(document.cookie);
    //const id_token = cookiePrm["userid"];
    document.getElementById("logout").style.display = "none";

    if (data.user && data.user.id) {
      userId = data.user.id;
      userName = String(data.user.viewName ?? data.user.name);
      document.getElementById("user-name").innerText = userName + " さん";
      document.getElementById("logout").style.display = "";
      return true;
    } else {
      if (googleLogin) googleLogin.style.display = "";
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}

function getCookiePrm(cookieString) {
  const res = {};
  if (cookieString) {
    for (const c of cookieString.split(";")) {
      const key = c.split("=")[0].toString().replace(/^\s+/, "");
      const val = c.split("=")[1];
      res[key] = val;
    }
  }
  return res;
}

window.onload = async () => {
  if (window.location.pathname === "/" || window.location.pathname === "/exit") {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url.toString());
    if ((await loginCheck()) === true) {
      console.debug("login check success.");
      window.location.href = "/home";
    } else {
      console.debug("login check fail.");
    }
  } else {
    if (userId) {
      if ((await loginCheck()) === true) {
        console.debug("account check success.");
      } else {
        console.debug("account check fail.");
        window.location.href = "/";
      }
    } else {
      console.debug("user id nothing");
      window.location.href = "/";
    }
  }
};

function _getGoogleParams(id_token) {
  const parts = id_token.split(".");

  const payloadBase64 = parts[1];
  const decodedPayload = base64UrlDecodeUtf8(payloadBase64);

  return JSON.parse(decodedPayload);
}

function base64UrlDecodeUtf8(input) {
  // Base64URL → Base64
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) input += "=".repeat(4 - pad);

  // バイナリ → UTF-8文字列
  const decoded = atob(input);
  try {
    // TextDecoderを使ってUTF-8として読み直す
    const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch (e) {
    console.warn("TextDecoder が使えない場合は fallback");
    return decoded;
  }
}

function sendMessage() {
  const message = document.getElementById("message");
  if (message) {
    fetch("/send_message", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: message.value,
    })
      .then((response) => response.text())
      .then((data) => {
        message.value = "";
        if (data === "success") {
          alert("メッセージを送信しました");
        } else {
          alert("何かしらの問題が発生しました");
        }
      })
      .catch((error) => alert("何かしらの問題が発生しました"));
  }
}

function modalChangeDisplayName() {
  const back = document.getElementById("back-ground");
  const modal = document.getElementById("modal");
  if (back && modal) {
    modal.style.width = "320px";
    modal.style.height = "120px";
    const mss = document.createElement("div");
    mss.innerText = "表示名を変更します";
    modal.appendChild(mss);
    const iptDiv = document.createElement("div");
    iptDiv.style.paddingBottom = "5px";
    const ipt = document.createElement("input");
    ipt.style.width = "280px";
    ipt.id = "change-display-name";
    ipt.value = userName;
    iptDiv.appendChild(ipt);
    modal.appendChild(iptDiv);
    const btnDiv = document.createElement("div");
    btnDiv.style.textAlign = "right";
    const btn = document.createElement("button");
    btn.innerText = "変更";
    btn.style.width = "64px";
    btn.addEventListener("click", changeDisplayName);
    btnDiv.appendChild(btn);
    modal.appendChild(btnDiv);
    back.style.display = "";
    modal.style.display = "";
  }
}

async function changeDisplayName() {
  const nameInput = document.getElementById("change-display-name");
  if (nameInput && nameInput.value && nameInput.value !== "") {
    const res = await fetch("/change_name?userid=" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: nameInput.value,
    });
    if (res.status === 200) {
      userName = String(nameInput.value);
      document.getElementById("user-name").innerText = nameInput.value + " さん";
      closeMocal();
    } else {
      modalOpen({ width: "320px", height: "120px" }, "エラーが発生しました", res.status, res.text());
    }
  }
}

function modalOpen(option, title, status, message) {
  const modal = document.getElementById("modal");
  if (modal) {
    const div = document.createElement("div");
    div.innerText = title;
    modal.appendChild(div);
    if (status && status !== "") {
      const sts = document.createElement("div");
      sts.innerText = "status: " + status;
    }
    const txt = document.createElement("div");
    txt.innerText = message;
    modal.style.width = option.width;
    modal.style.height = option.height;
    modal.style.display = "";
  }
}

function closeMocal() {
  try {
    const back = document.getElementById("back-ground");
    const modal = document.getElementById("modal");
    if (back) back.style.display = "none";
    if (modal) {
      modal.innerHTML = "";
      modal.style.display = "none";
    }
  } catch (e) {
    console.error(e);
  }
}
