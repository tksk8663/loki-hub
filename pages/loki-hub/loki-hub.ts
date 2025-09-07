import { errorResponse } from "../../error.ts";

const template = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>__title__</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="/css/loki-hub.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="/js/loki-hub.js"></script>
</head>
<body>
<div class="header"></div>
<div class="main-content">
__content_body__
</div>
</body>
</html>`;

export function lokiDashboard(_req: Request, _prm: { [key: string]: number | string } | undefined): Response {
  try {
    const title = "Loki HUB";
    const body = `
<div class="p-3">
  <div class="container-fluid">

    <!-- 上部：サマリ＋グラフ -->
    <div class="row d-flex mb-3">
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">サマリ</div>
          <div class="card-body">
            <!-- サマリ内容 -->
            管理Zabbix数：3件<br>
            障害中：1件（重大度：高）
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">障害グラフ</div>
          <div class="card-body">
            <canvas id="bootstrap-graph"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- 下部：Zabbix一覧 -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">Zabbix 一覧</div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Zabbix名</th>
                  <th>状態</th>
                  <th>障害件数</th>
                  <th>最終更新</th>
                </tr>
              </thead>
              <tbody>
                <tr class="table-danger">
                  <td>Zabbix-A</td>
                  <td>障害中</td>
                  <td>5</td>
                  <td>3分前</td>
                </tr>
                <tr class="table-warning">
                  <td>Zabbix-B</td>
                  <td>警告</td>
                  <td>1</td>
                  <td>1分前</td>
                </tr>
                <tr class="table-success">
                  <td>Zabbix-C</td>
                  <td>正常</td>
                  <td>0</td>
                  <td>2分前</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- BootstrapのJS（必要であれば） -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</div>
`;
    return new Response(template.replace("__title__", title).replace("__content_body__", body), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (e) {
    console.error(e);
    return errorResponse(500);
  }
}
