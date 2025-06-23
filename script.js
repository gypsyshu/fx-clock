/* ─────────────────────────────────────────
   自動売買 ON/OFF スイッチ
──────────────────────────────────────── */
const toggle        = document.getElementById("toggleSystem");
const statusText    = document.getElementById("systemStatus");
const currentStatus = document.getElementById("currentStatus");
const lastEntryTime = document.getElementById("lastEntryTime");

let entryCount = 0; // 通知ログが空か判定するため

// 初期化
(function initSwitch() {
  const isRunning = localStorage.getItem("autoTrade") === "on";
  toggle.checked  = isRunning;
  updateSwitchUI(isRunning);
})();

toggle.addEventListener("change", () => {
  const active = toggle.checked;
  localStorage.setItem("autoTrade", active ? "on" : "off");
  updateSwitchUI(active);
});

function updateSwitchUI(active) {
  statusText.textContent      = active ? "ON" : "OFF";
  currentStatus.textContent   = active ? "稼働中" : "停止中";
  currentStatus.className     = active ? "on" : "off";
}

/* ─────────────────────────────────────────
   収支テーブル & サマリー
──────────────────────────────────────── */
fetch("trade_log.csv")
  .then(res => res.text())
  .then(csv => {
    const lines = csv.trim().split("\n");
    const tbody = document.getElementById("logTable");

    let wins = 0, pipsSum = 0, rrSum = 0;

    lines.forEach((line, i) => {
      if (!line.trim()) return;
      const cols = line.split(",");
      if (i === 0) return; // 見出しスキップ

      const tr = document.createElement("tr");
      cols.forEach(col => {
        const td = document.createElement("td");
        td.textContent = col;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);

      // 集計
      const winLose = cols[1].trim();
      const pips    = parseFloat(cols[2]);
      const rr      = parseFloat(cols[3]);
      if (winLose === "win") wins++;
      pipsSum += pips;
      rrSum   += rr;
    });

    const trades = lines.length - 1;
    updateStatsBar(trades, wins, pipsSum, rrSum / (trades || 1));
  })
  .catch(err => {
    document.getElementById("logTable").innerHTML =
      "<tr><td colspan='4'>データ読み込みエラー</td></tr>";
    console.error("CSV読み込みエラー:", err);
  });

function updateStatsBar(trades, wins, pips, avgRR) {
  document.getElementById("statTrades").textContent  = trades;
  document.getElementById("statWinRate").textContent =
    trades ? ((wins / trades) * 100).toFixed(1) + "%" : "0%";
  document.getElementById("statPips").textContent     = pips.toFixed(1);
  document.getElementById("statRR").textContent       = avgRR.toFixed(2);
}

/* ─────────────────────────────────────────
   エントリー通知ログ & ブラウザ通知
──────────────────────────────────────── */
function notifyEntry(side, pair, price) {
  const now  = new Date().toLocaleString();
  const log  = document.getElementById("entryLog");

  if (entryCount === 0) log.innerHTML = ""; // 初回だけデフォルト行を消す
  entryCount++;

  const li   = document.createElement("li");
  li.textContent = `${now} - ${side} - ${pair} - ${price}`;
  log.prepend(li);

  lastEntryTime.textContent = now;

  // ブラウザ通知
  if (Notification.permission === "granted") {
    new Notification(`${side}エントリー - ${pair}`, {
      body: `${now} / ${price}`,
    });
  }
}

// Permission要求（初回のみ）
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

/* 例）エントリー発生時に以下を呼び出す
notifyEntry("買い", "USDJPY", "158.456");
*/

/* ─────────────────────────────────────────
   地合い評価（ダミーロジック / 6軸）
──────────────────────────────────────── */
const axes = [
  "トレンド方向", "ボラティリティ", "流動性",
  "スプレッド", "イベントリスク", "市場心理"
];
const marketEvalUl = document.getElementById("marketEval");

function renderMarketEval(resultArr) {
  marketEvalUl.innerHTML = "";
  resultArr.forEach((ok, idx) => {
    const li = document.createElement("li");
    li.innerHTML =
      `${axes[idx]}：<span class="${ok ? "ok" : "ng"}">${ok ? "○" : "×"}</span>`;
    marketEvalUl.appendChild(li);
  });
}

function evaluateMarket() {
  // ★ ダミー：ランダム○×を生成。実運用ではここにロジックを入れる
  const result = axes.map(() => Math.random() > 0.3);
  renderMarketEval(result);
  return result;
}
document.getElementById("btnEvalMarket").addEventListener("click", evaluateMarket);
// 初回描画
evaluateMarket();

/* ─────────────────────────────────────────
   構造整合性チェック （ダミーロジック）
──────────────────────────────────────── */
function checkStructure() {
  // ★ ダミー：50%で整合
  const ok = Math.random() > 0.5;
  document.getElementById("structureStatus").textContent =
    ok ? "整合" : "逆行";
  document.getElementById("structureStatus").className =
    ok ? "ok" : "ng";
  return ok;
}
document.getElementById("btnCheckStructure").addEventListener("click", checkStructure);

/* ─────────────────────────────────────────
   TP/SL & RR 計算
──────────────────────────────────────── */
["inpEntry", "inpTP", "inpSL"].forEach(id =>
  document.getElementById(id).addEventListener("input", calcRR)
);

function calcRR() {
  const entry = parseFloat(document.getElementById("inpEntry").value);
  const tp    = parseFloat(document.getElementById("inpTP").value);
  const sl    = parseFloat(document.getElementById("inpSL").value);

  if (isNaN(entry) || isNaN(tp) || isNaN(sl) || entry === sl) {
    document.getElementById("rrValue").textContent = "―";
    return;
  }
  const rr = Math.abs(tp - entry) / Math.abs(entry - sl);
  document.getElementById("rrValue").textContent = rr.toFixed(2);
}

/* ─────────────────────────────────────────
   最終判断  (極簡ロジック例)
──────────────────────────────────────── */
function finalDecision() {
  const evalOK  = [...marketEvalUl.querySelectorAll("span.ok")].length;
  const structOK = document.getElementById("structureStatus").textContent === "整合";
  const rrVal   = parseFloat(document.getElementById("rrValue").textContent);

  let decision = "見送り";
  if (evalOK >= 5 && structOK && rrVal >= 1.5) decision = "撃つ";
  else if (evalOK <= 2 || !structOK) decision   = "構造否定";

  document.getElementById("finalDecision").textContent = decision;
  return decision;
}

// 地合い・構造・RR の各更新後に最終判断を自動更新
["btnEvalMarket", "btnCheckStructure"].forEach(id =>
  document.getElementById(id).addEventListener("click", () => {
    setTimeout(finalDecision, 50);
  })
);
["inpEntry", "inpTP", "inpSL"].forEach(id =>
  document.getElementById(id).addEventListener("input",
    () => setTimeout(finalDecision, 50))
);
