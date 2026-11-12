/**
 * Google Apps Script - 구글시트와 연결한 뒤 웹 앱으로 배포
 * Script Properties에 별도 비밀키를 넣을 필요 없음. 공개 쓰기 엔드포인트이므로
 * 스팸/할당량 위험이 있고, 행사 운영 시 시트 보호·모니터링 권장.
 */
const SHEET_NAME = '응답';
const HEADERS = ['기록시간','참여ID','강아지이름','Q1','Q2','Q3','Q4','Q5','Q6','선택제품','선택방식','유형','탐색성평균','식감평균','중간결과'];
const PRODUCTS = ['오리가슴살육포','닭가슴살육포','소고기육포','오리안심오돌뼈','돼지등심육포','소홍두깨살육포','오리근위육포','시식하지 않음'];
const MODES = ['dog','owner','none'];
function doPost(e) {
  const p = (e && e.parameter) || {};
  const nonce = String(p.nonce || '').replace(/[^a-zA-Z0-9]/g,'').slice(0,80);
  let ok = false, error = '';
  try {
    if (p.consent !== 'Y') throw new Error('저장 동의 없음');
    const answers = JSON.parse(p.answers || '[]');
    if (!Array.isArray(answers) || answers.length !== 6 || answers.some(v => !Number.isInteger(v) || v < 0 || v > 5)) throw new Error('설문 형식 오류');
    if (!PRODUCTS.includes(p.product)) throw new Error('제품 형식 오류');
    if (!MODES.includes(p.selectionMode)) throw new Error('선택 방식 오류');
    if (!['ET','ES','CT','CS'].includes(p.type)) throw new Error('유형 형식 오류');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('응답 시트를 찾을 수 없음. setupSheet() 먼저 실행하세요.');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // CSV/formula injection 방지: 문자열을 수식으로 해석하지 않도록 앞에 작은따옴표 표시
      const safe = x => { const s=String(x == null ? '' : x).slice(0,180); return /^[=+\-@\t\r]/.test(s) ? "'"+s : s; };
      const row = [new Date(),safe(p.sessionId),safe(p.dogName),...answers,safe(p.product),safe(p.selectionMode),safe(p.type),safe(p.novelty),safe(p.texture),safe(p.ambiguous)];
      sheet.appendRow(row);
      ok = true;
    } finally { lock.releaseLock(); }
  } catch(ex) { error = String(ex.message || ex).slice(0,120); }
  // 응답 페이지는 제출 요청을 보낸 iframe의 부모에 결과를 알립니다.
  const payload = JSON.stringify({kind:'TREAT_DNA_SHEET',nonce,ok,error}).replace(/</g,'\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><html><body><script>window.parent.postMessage(' + payload + ',"*");</' + 'script></body></html>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function setupSheet(){
  const book=SpreadsheetApp.getActiveSpreadsheet();
  let sheet=book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if(sheet.getLastRow()===0){sheet.appendRow(HEADERS);sheet.setFrozenRows(1);sheet.getRange(1,1,1,HEADERS.length).setBackground('#e8e4d7').setFontWeight('bold');}
}
