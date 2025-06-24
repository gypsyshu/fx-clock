document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleSystem");
  const status = document.getElementById("systemStatus");
  const notify = document.getElementById("notifyStatus");
  const csv = document.getElementById("csvStatus");
  const lastEntry = document.getElementById("lastEntry");

  function isWithinTradingHours() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const nowMinutes = hours * 60 + minutes;

    const start = 9 * 60 + 0;  // 9:00
    const end = 23 * 60 + 30;  // 23:30

    return nowMinutes >= start && nowMinutes <= end;
  }

  const isUserActive = localStorage.getItem("systemActive") === "true";
  const isActive = isUserActive && isWithinTradingHours();
  toggle.checked = isUserActive;
  updateStatus(isActive);

  toggle.addEventListener("change", () => {
    const active = toggle.checked;
    localStorage.setItem("systemActive", active);
    updateStatus(active && isWithinTradingHours());
  });

  function updateStatus(active) {
    const statusElem = document.getElementById("systemStatus");
    if (!isWithinTradingHours()) {
      statusElem.textContent = "停止中（時間外）";
      statusElem.className = "off";
    } else {
      statusElem.textContent = active ? "稼働中" : "停止中";
      statusElem.className = active ? "on" : "off";
    }
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

  try {
    if (typeof tradeLog === "undefined" || !Array.isArray(tradeLog)) throw new Error();
    csv.textContent = "OK";

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

    const last = tradeLog[tradeLog.length - 1];
    const message = `エントリー発生：${last.date} ${last.result === 1 ? 'L' : 'S'} ${last.time || '--:--'}`;
    lastEntry.textContent = `${last.date} ${last.result === 1 ? 'L' : 'S'} ${last.time || '--:--'}`;
    sendPushNotification(message);
  } catch {
    csv.textContent = "エラー";
  }

  notify.textContent = "有効";
});

// OneSignal 初期化コード
window.OneSignal = window.OneSignal || [];
OneSignal.push(function() {
  OneSignal.init({
    appId: "478eae6e-2a31-446e-8b47-b596293afa68",
    notifyButton: { enable: true },
    allowLocalhostAsSecureOrigin: true
  });

  // 初回通知（テスト）
  sendPushNotification("ページを開きました（OneSignal準備完了）");
});
