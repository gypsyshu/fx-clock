document.addEventListener("DOMContentLoaded", () => {
  // スイッチと証拠金
  const toggle = document.getElementById("toggleSystem");
  const status = document.getElementById("systemStatus");
  const balance = document.getElementById("balance");

  const isActive = localStorage.getItem("systemActive") === "true";
  toggle.checked = isActive;
  status.textContent = isActive ? "稼働中" : "停止中";
  status.className = isActive ? "on" : "off";

  toggle.addEventListener("change", () => {
    const active = toggle.checked;
    localStorage.setItem("systemActive", active);
    status.textContent = active ? "稼働中" : "停止中";
    status.className = active ? "on" : "off";
  });

  // 仮：証拠金表示（今後API連携対応可能）
  balance.textContent = "¥123,456";

  // ログ表示
  if (typeof tradeLog === "undefined") {
    console.error("data.jsが読み込まれていません");
    return;
  }

  const table = document.getElementById("logTable");
  let wins = 0, total = 0, totalPips = 0, totalRR = 0;

  tradeLog.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${row.result === 1 ? "〇" : "×"}</td>
      <td>${row.pips}</td>
      <td>${row.rr}</td>
    `;
    table.appendChild(tr);

    total++;
    totalPips += row.pips;
    totalRR += row.rr;
    if (row.result === 1) wins++;
  });

  const winRate = total > 0 ? (wins / total * 100).toFixed(1) : 0;
  const avgRR = total > 0 ? (totalRR / total).toFixed(2) : "0.00";

  document.getElementById("statTrades").textContent = total;
  document.getElementById("statWinRate").textContent = `${winRate}%`;
  document.getElementById("statPips").textContent = totalPips.toFixed(1);
  document.getElementById("statRR").textContent = avgRR;
});

