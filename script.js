document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleSystem");
  const status = document.getElementById("systemStatus");
  const notify = document.getElementById("notifyStatus");
  const csv = document.getElementById("csvStatus");
  const lastEntry = document.getElementById("lastEntry");

  // 初期化
  const isActive = localStorage.getItem("systemActive") === "true";
  toggle.checked = isActive;
  updateStatus(isActive);

  toggle.addEventListener("change", () => {
    const active = toggle.checked;
    localStorage.setItem("systemActive", active);
    updateStatus(active);
  });

  function updateStatus(active) {
    const statusElem = document.getElementById("systemStatus");
    statusElem.textContent = active ? "稼働中" : "停止中";
    statusElem.className = active ? "on" : "off";
  }

  function sendPushNotification(message) {
    if (window.OneSignal) {
      OneSignal.Notifications.isPushNotificationsEnabled()
        .then(function(isEnabled) {
          if (isEnabled) {
            OneSignal.sendSelfNotification(
              "エントリー通知",
              message,
              window.location.href,
              null
            );
          } else {
            console.log("通知が許可されていません");
          }
        });
    }
  }

  // データ読み込みチェック
  try {
    if (typeof tradeLog === "undefined" || !Array.isArray(tradeLog)) throw new Error();
    csv.textContent = "OK";

    // 成績集計
    let wins = 0, total = 0, totalPips = 0, totalRR = 0;
    tradeLog.forEach(row => {
      total++;
      totalPips += row.pips;
      totalRR += row.rr;
      if (row.result === 1) wins++;
    });

    document.getElementById("statWinRate").textContent = `${((wins / total) * 100).toFixed(1)}%`;
    document.getElementById("statPips").textContent = totalPips.toFixed(1);
    document.getElementById("statRR").textContent = (totalRR / total).toFixed(2);

    // 最終エントリー
    const last = tradeLog[tradeLog.length - 1];
    const message = `エントリー発生：${last.date} ${last.result === 1 ? 'L' : 'S'}`;
    lastEntry.textContent = `${last.date} ${last.result === 1 ? 'L' : 'S'}`;
    sendPushNotification(message);
  } catch {
    csv.textContent = "エラー";
  }

  // 通知（仮にON固定）
  notify.textContent = "有効";
});

