# 간식 DNA 연구소 — 메가주 QR 테스트

별도 서버 없이 GitHub Pages(설문 화면) + Google Apps Script(응답 수신) + Google Sheets(저장)로 운영하는 모바일 웹앱입니다.

## 구현 기능
- 2축(E↔C, S↔T) × 각 3문항의 양극형 5점 척도 설문
- '잘 모르겠어요' 응답(점수 계산에서 제외)
- 4개 기본 유형(ET/ES/CT/CS), 7개 제품, 28가지 개인화 조합
- 시식하지 않은 고객도 유형 카드 발급
- 인스타그램 스토리 비율(1080×1920) PNG 생성 및 휴대전화 공유 메뉴
- 구글시트로 선택적 동의 응답 저장(저장 성공/실패 확인 메시지)
- 개인정보 최소화: 휴대전화/이메일/사진 수집 없음

> 주의: 28가지는 과학적으로 검증된 성격 유형 수가 아니라 4개 설문 유형과 7개 제품의 **콘텐츠 조합 수**입니다. 3점 동점/정보부족은 임시로 E 또는 S에 배정하고 결과 페이지에 '불명확' 고지를 합니다. 운영 전 설문 검증 필요.

## 1. 구글시트 연결

1. 새 Google Sheets 문서를 생성합니다.
2. **확장 프로그램 → Apps Script**를 선택합니다.
3. `Code.gs` 파일의 내용을 그대로 붙여 넣고 저장합니다.
4. 함수 목록에서 `setupSheet`를 선택하고 **실행**합니다. 첫 실행은 구글 권한 승인이 필요합니다.
5. **배포 → 새 배포 → 웹 앱**에서 **다음 사용자 인증 정보로 실행: 나**, **액세스 권한: 모든 사용자**를 지정하고 배포합니다. (조직 정책상 허용되지 않을 수 있습니다.)
6. 발급되는 `https://script.google.com/macros/s/.../exec` 주소를 복사합니다. `/dev` 주소는 사용하지 마세요.
7. `config.js`의 `appsScriptUrl`에 붙여 넣습니다. 브랜드 이름, 인스타그램, 스마트스토어 주소도 설정합니다.
8. 설문에 저장 동의하고 테스트 1건을 제출한 뒤 구글시트 `응답` 탭에 한 행이 생성되는지 확인합니다.

> Apps Script는 공개 쓰기 엔드포인트입니다. 악의적인 자동 요청, Apps Script 호출 제한, 스팸 입력 등 가능성이 있으므로 행사 기간에 모니터링해야 합니다. 인증된 참가자만 쓸 수 있는 강력한 보안이 필요한 운영에는 별도 백엔드를 권합니다.

## 2. GitHub Pages 배포

1. GitHub에서 **새 Public 저장소**(예: `treat-dna`)를 생성합니다.
2. 이 폴더의 `index.html`, `styles.css`, `app.js`, `config.js`를 저장소 **최상위(root)**에 업로드합니다. `Code.gs`와 README도 함께 업로드해도 되지만, `Code.gs`에는 비밀정보를 넣지 마세요.
3. 저장소 **Settings → Pages → Build and deployment → Deploy from a branch**를 선택합니다.
4. Branch `main`, Folder `/(root)`를 지정하고 **Save**합니다.
5. `https://깃허브아이디.github.io/treat-dna/` 형태의 주소에서 테스트합니다. 이 URL을 QR코드로 변환해 부스에 부착합니다.

## 3. 현장 운영 주의사항
- 보호자의 시식 적합성 확인 후 급여; 거부, 긴장, 식이 제한이 있으면 시식하지 않음 선택
- 제품 7종 모두가 어떤 강아지에게나 적합하다는 뜻이 아님
- 실제 선택과 보호자 선택은 별도 기록하므로 동일한 기호성 데이터로 분석하지 않기
- 결과의 성향 수치는 설명용이며 과학적 진단 정확도가 아님
- 배포 전 개인정보 안내의 **운영 주체, 문의처, 보유 기간, 삭제 방법**을 구체화하기
- 구글시트 공유 설정을 비공개로 유지. URL을 아는 사람에게 편집 권한을 주지 않기
- 기기/브라우저에 따라 직접 이미지 공유를 지원하지 않을 수 있어 PNG 저장을 기본 경로로 제공

## 자체 점검
- 6문항 모두 응답 → 4개 유형 중 하나 결과
- 7개 제품별 결과 문구 변경
- '시식하지 않음' 선택 시 결과 표시
- 시트 동의 안 함 → 저장 요청 없음
- 시트 동의 + Apps Script URL 설정 → 저장 성공 메시지 및 시트 1행 기록
- PNG 다운로드 / Android·iOS 공유 지원 여부 현장 기기로 점검

## 기술 참고
- [GitHub Pages 가이드](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Apps Script 웹앱 가이드](https://developers.google.com/apps-script/guides/web)
- [MDN Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
