const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const routes = {
  customer: {
    label: '找客戶', query: '客戶查詢', subject: '保戶姓名', example: '王小明', page: 1,
    result: '開啟客戶基本資料', detail: '基本資料頁面',
    resultText: '核對畫面上的姓名與辨識資料。找到要查的保戶後，點那張卡片的「客戶資料」，即可開啟基本資料頁面。',
    tip: '姓名有相同的字，可能會出現多筆結果。'
  },
  product: {
    label: '查商品', query: '百科查詢', subject: '商品名稱', example: '三商終身醫療', page: 3,
    result: '前往商品百科', detail: '商品百科頁面',
    resultText: '在結果清單中核對公司、商品名稱及版本，點選商品名稱，即可進入對應的百科頁面。',
    tip: '教練的示範用公司名稱加上險種關鍵字縮小範圍。'
  }
};
let route = 'customer';
let step = 0;
let method = 'text';
let detail = false;
function render() {
  const guide = routes[route];
  const isVoice = method === 'voice';
  const titles = ['從首頁開啟智能助理', '選擇「' + guide.query + '」', guide.result];
  const inputText = isVoice
    ? '點右下角的麥克風，說出' + guide.subject + '關鍵字。若瀏覽器詢問權限，允許使用麥克風，再核對辨識文字並發送。'
    : '在搜尋列輸入' + guide.subject + '關鍵字，再點右下角的「發送訊息」。';
  const texts = ['在雲華佗 2+ 首頁點「智能助理」。手冊紅框標出的中央按鈕和右下角浮動按鈕，都能開啟查詢視窗。', inputText, guide.resultText];
  const key = step === 0 ? 'home' : route + '-' + (step === 1 ? 'input' : detail ? 'detail' : 'result');
  const screenTitle = step === 0 ? '首頁的智能助理入口' : step === 1 ? guide.query + '的搜尋列與麥克風' : detail ? guide.detail : guide.query + '結果';
  const page = step === 0 ? 1 : step === 1 ? guide.page : route === 'product' ? 3 : 2;
  $$('[data-route]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.route === route)));
  $$('[data-step]').forEach(btn => { if (Number(btn.dataset.step) === step) btn.setAttribute('aria-current','step'); else btn.removeAttribute('aria-current'); });
  $$('[data-method]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.method === method)));
  $('#position').textContent = guide.label + '　／　步驟 ' + (step + 1) + '／3';
  $('#step-title').textContent = titles[step];
  $('#step-text').textContent = texts[step];
  $('#methods').hidden = step !== 1;
  $('#example').textContent = (isVoice ? '試著說' : '輸入範例') + '「' + guide.example + '」。' + guide.tip;
  $('#shot').src = 'assets/' + key + '.webp';
  $('#shot').alt = screenTitle;
  $('#caption').textContent = screenTitle + '　·　手冊第 ' + page + ' 頁';
  $('#prev').disabled = step === 0;
  $('#next').textContent = step === 2 ? '回到第一步 ↺' : '下一步 →';
  $('#toggle-detail').hidden = step !== 2;
  $('#toggle-detail').textContent = detail ? '看查詢結果畫面' : '看' + guide.detail;
}
function selectStep(newStep) {
  step = newStep;
  detail = false;
  render();
}
$$('[data-route]').forEach(btn => btn.addEventListener('click', () => {
  if (route === btn.dataset.route) return;
  route = btn.dataset.route;
  method = 'text';
  selectStep(0);
}));
$$('[data-step]').forEach(btn => btn.addEventListener('click', () => selectStep(Number(btn.dataset.step))));
$$('[data-method]').forEach(btn => btn.addEventListener('click', () => { method = btn.dataset.method; render(); }));
$('#prev').addEventListener('click', () => selectStep(Math.max(0,step - 1)));
$('#next').addEventListener('click', () => selectStep((step + 1) % 3));
$('#toggle-detail').addEventListener('click', () => { detail = !detail; render(); });
const dialog = $('#lightbox');
$('#zoom').addEventListener('click', () => {
  $('#large').src = $('#shot').src;
  $('#large').alt = $('#shot').alt;
  $('#light-title').textContent = $('#caption').textContent;
  dialog.showModal();
});
$('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if(e.target === dialog) dialog.close(); });
const video = $('video');
const chapters = $$('[data-time]');
function highlightChapter() {
  const active = chapters.filter(btn => Number(btn.dataset.time) <= video.currentTime).pop();
  chapters.forEach(btn => btn.setAttribute('aria-current', String(btn === active)));
}
chapters.forEach(btn => btn.addEventListener('click', async () => {
  try {
    video.currentTime = Number(btn.dataset.time);
    await video.play();
    $('#play-note').textContent = '';
  } catch {
    $('#play-note').textContent = '請點播放器的播放鍵繼續。';
  }
}));
video.addEventListener('timeupdate', highlightChapter);
highlightChapter();
render();
