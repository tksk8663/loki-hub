import { errorResponse } from "../../error.ts";
import { template, colors } from "../../common.ts";
import log from "../../logger.ts";

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
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>障害グラフ</span>
            <div>テスト</div>
          </div>
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
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>Zabbix 一覧</span>
            <div class="burger"><i class="bi bi-list" id="zabbix-list-burger"></i></div>
          </div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>Zabbix名</th>
                  <th>状態</th>
                  <th>障害件数</th>
                  <th>最終更新</th>
                </tr>
              </thead>
              <tbody>
                <tr class="table-danger">
                  <td class="graph-color ${colors[0]}"></td>
                  <td>Zabbix-A</td>
                  <td>障害中</td>
                  <td>5</td>
                  <td>3分前</td>
                </tr>
                <tr class="table-warning">
                  <td class="graph-color ${colors[1]}"></td>
                  <td>Zabbix-B</td>
                  <td>警告</td>
                  <td>1</td>
                  <td>1分前</td>
                </tr>
                <tr class="table-success">
                  <td class="graph-color ${colors[2]}"></td>
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

  <ul id="contextMenu">
    <li id="saveImage">グラフを保存</li>
  </ul>
  <div id="zabbix-list-burger-menu" style="display: none;">
    <ul>
      <li><span id="list-reload">再読み込み</span></li>
      <li><span id="add-zabbix-server">Zabbix Serverを追加</span></li>
    </ul>
  </div>
  <div id="modal-background" style="display: none"><div></div></div>
  <!-- BootstrapのJS（必要であれば） -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</div>
`;
    return new Response(template.replace("__title__", title).replace("__content_body__", body), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (e: any) {
    log.error(e.stack);
    return errorResponse(500);
  }
}
