console.log(window.location.pathname + ": " + window.location.pathname.startsWith("/loki-hub/dashboard"));

const graphOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      offset: true,
      grid: {
        offset: false,
        drawTicks: true,
      },
      ticks: {
        minRotation: 70,
        maxRotation: 70,
        color: "#222",
      },
    },
    y: {
      ticks: {
        color: "#222",
      },
    },
  },
  layout: {
    padding: {
      top: 16,
      left: 6,
    },
  },
  onClick: (_event, elements) => {
    if (elements.length > 0) {
      const chartElement = elements[0];
      const datasetIndex = chartElement.datasetIndex; // datasetsの番号
      const dataIndex = chartElement.index; // ラベルの番号
      const label = window._graph.data.labels[dataIndex];
      const value = window._graph.data.datasets[datasetIndex].data[dataIndex];

      alert(`クリックされたのは: ラベル=${label}, 値=${value}, ${datasetIndex}, ${dataIndex}`);
      // ここで好きな処理を呼び出せます
    }
  },
};

if (window.location.pathname === "/loki-hub/dashboard" || window.location.pathname === "/loki-hub") {
  let count = 0;
  const waitInterval = setInterval(() => {
    const canvas = document.getElementById("bootstrap-graph");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const contextMenu = document.getElementById("contextMenu");
      const saveBtn = document.getElementById("saveImage");
      canvas.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        contextMenu.style.top = e.pageY + "px";
        contextMenu.style.left = e.pageX + "px";
        contextMenu.style.display = "block";
      });
      window.addEventListener("click", function () {
        contextMenu.style.display = "none";
      });
      saveBtn.addEventListener("click", function () {
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = "chart.png";
        link.click();
      });
      if (ctx) {
        const dateTime = new Date();
        let labels = [];
        for (let i = 0; i < 10; i++) {
          const hours = String(dateTime.getHours()).padStart(2, "0");
          const minutes = String(dateTime.getMinutes()).padStart(2, "0");
          labels.unshift(`${hours}:${minutes}`);
          dateTime.setHours(dateTime.getHours() - 1);
        }
        clearInterval(waitInterval);
        window._graph = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Zabbix-A",
                data: [10, 20, 30, 40, 50, 0, 0, 0, 0, 0],
                backgroundColor: colors[0],
              },
              {
                label: "Zabbix-B",
                data: [0, 0, 0, 0, 0, 50, 40, 30, 20, 10],
                backgroundColor: colors[1],
              },
              {
                label: "Zabbix-C",
                data: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
                backgroundColor: colors[2],
              },
            ],
          },
          options: graphOptions,
        });
      }
      const zlb = document.getElementById("zabbix-list-burger");
      if (zlb) {
        zlb.removeEventListener("click", function (event) {
          zabbixListBurger(event);
        });
        zlb.addEventListener("click", function (event) {
          zabbixListBurger(event);
        });
      }
      const azs = document.getElementById("add-zabbix-server");
      if (azs) {
        azs.removeEventListener("click", function (event) {
          zabbixAddModal(event);
        });
        azs.addEventListener("click", function (event) {
          zabbixAddModal(event);
        });
      }
      const mbc = document.getElementById("modal-background");
      if (mbc) {
        mbc.removeEventListener("click", function (event) {
          closeModal(event);
        });
        mbc.addEventListener("click", function (event) {
          closeModal(event);
        });
      }
    }
    count++;
    if (count > 20) {
      clearInterval(waitInterval);
      console.warn("target nothing. from Loki HUB");
    }
  }, 100);
}

function zabbixListBurger(event) {
  const menu = document.getElementById("zabbix-list-burger-menu");
  if (menu) {
    const rect = event.target.getBoundingClientRect();
    menu.style.top = `${rect.bottom}px`;
    menu.style.left = `${rect.left - 180}px`;
    setTimeout(() => {
      menu.style.display = "";
    }, 0);
  }
}

function zabbixAddModal() {
  const menu = document.getElementById("zabbix-list-burger-menu");
  menu.style.display = "none";
  const mbc = document.getElementById("modal-background");
  if (mbc) {
    mbc.style.display = "";
    const mbcRect = mbc.getBoundingClientRect();
    const modal = mbc.children[0];
    modal.style.top = `${Math.floor(mbcRect.height - 240) / 2}px`;
    modal.style.left = `${Math.floor(mbcRect.width - 320) / 2}px`;
  }
}

function closeModal(event) {
  const mbc = document.getElementById("modal-background");
  if (mbc) {
    if (event.target.id === "modal-background") mbc.style.display = "none";
  }
}

window.onclick = function (event) {
  const menu = document.getElementById("zabbix-list-burger-menu");
  if (menu && !event.target.closest("#zabbix-list-burger-menu")) {
    menu.style.display = "none";
  }
};

const colors = [
  "red", // 赤
  "maroon", // 深い赤
  "magenta", // 赤紫
  "purple", // 紫
  "mediumslateblue", // 青紫
  "steelblue", // 青みがかったグレー
  "blue", // 青
  "navy", // 濃い青
  "cyan", // 明るいシアン
  "darkcyan", // 深いシアン
  "teal", // 緑がかった青
  "green", // 緑
  "lime", // 明るい緑
  "olive", // 黄緑がかった色
  "yellow", // 黄色
  "gold", // 黄金色
  "orange", // 明るいオレンジ
  "coral", // 柔らかいオレンジ
  "tomato", // 赤寄りオレンジ
  "sandybrown", // 明るい茶色（中間色）
];
