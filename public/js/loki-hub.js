console.log(window.location.pathname + ": " + window.location.pathname.startsWith("/loki-hub/dashboard"));
if (window.location.pathname === "/loki-hub/dashboard" || window.location.pathname === "/loki-hub") {
  let count = 0;
  const waitInterval = setInterval(() => {
    const canvas = document.getElementById("bootstrap-graph");
    if (canvas) {
      const ctx = canvas.getContext("2d");
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
                label: "サンプルデータ",
                data: [10, 20, 30, 40, 50],
                backgroundColor: "#c00",
              },
              {
                label: "サンプルデータ",
                data: [10, 20, 0, 40, 50],
                backgroundColor: "#c00",
              },
              {
                label: "サンプルデータ",
                data: [10, 20, 30, 40, 50],
                backgroundColor: "#c00",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
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
          },
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
