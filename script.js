function updateClockAndDate() {
  const now = new Date();
  const time = now.toLocaleTimeString('ja-JP');
  const date = now.toLocaleDateString('ja-JP', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
  });

  document.getElementById('clock').textContent = time;
  document.getElementById('date').textContent = date;
}

// ニュース部分は、後でAPIと連携させる構造
function updateNews() {
  const newsDiv = document.getElementById('news');
  newsDiv.innerHTML = '🟢 本日予定の主要指標はありません。<br><span>※経済ニュースは現在モック表示中</span>';
}

// 毎秒更新
setInterval(updateClockAndDate, 1000);
updateClockAndDate();
updateNews();
