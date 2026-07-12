# 카페24 상품 옵션 커스터마이징 작업

이 폴더는 카페24 스마트디자인 편집창에 삽입될 **"골라담기" 형태의 커스텀 옵션 UI**를 개발하는 공간입니다.

---

## 🔧 구현 방식 설명

### 옵션 UI 렌더링 및 선택 로직

**동적 렌더링:**
- `cafe24/config/optionConfig.js`의 8개 옵션 데이터를 `cafe24/src/option.js`의 `renderCards()` 함수로 DOM에 동적 생성
- 각 카드는 이미지, 제목, 설명, 가격, 뱃지(선택), 선택 버튼으로 구성
- CSS 그리드로 PC(4열) → 태블릿(3열) → 모바일(2열/1열)로 반응형 렌더링

**선택 로직 흐름:**
1. 카드 클릭 → `onCardClick(rawLabel, groupKey)` 호출
2. `preventDuplicate()`: 이미 선택한 옵션인지 확인 → 경고
3. `enforceLimit(groupKey)`: 그룹당 최대 개수(suffix 기반) 초과 확인 → 경고
4. 통과 시 `addSelectedOption()` → `updateSelectedList()` → `recalculateTotal()` → `updateCardStates()` 순차 실행
5. 선택 카드에 테두리/배경색/체크마크 표시, 비활성 카드에 disabled 스타일

**수량 및 금액:**
- "선택한 상품" 섹션의 +/- 버튼으로 개별 항목 수량 조절
- 삭제 버튼으로 항목 제거
- 합계 금액 = Σ(옵션가격 × 수량) 실시간 계산

### 외부 설정 파일 구조

**`cafe24/config/optionConfig.js`:**
- `options[]`: 8개 옵션값(id, rawLabel, groupKey, displayName, description, price, badge, imageSrc, sortOrder)
- `groups{}`: 그룹별 최대 선택 개수(maxCount) — 현재 모두 2로 설정
- `settings{}`: UI 전역 설정(showSelectedList, showTotalPrice)

상세 필드 설명과 수정 방법: [**docs/phase5-config-guide.md**](docs/phase5-config-guide.md)

### 카페24 기본 옵션과의 양방향 동기화

**지원 방식:**
- **select 방식**: `.xans-product-option select` 요소의 값을 변경하고 change 이벤트 발생
- **텍스트버튼 방식**: `.xans-product-option [data-option-value]` 버튼을 찾아 click 이벤트 발생

**동기화 메커니즘:**
- 커스텀 UI 카드 클릭 → `syncToDefaultOption()` → 기본 옵션 자동 선택
- 기본 옵션 변경 → `attachEventListeners()`의 버튼/select 리스너 → `syncFromDefaultOption()` → 커스텀 UI 자동 업데이트

**주의:** 실제 카페24 DOM 구조는 아직 미검증 상태입니다. 상세 분석: [**docs/phase2-dom-analysis.md**](docs/phase2-dom-analysis.md)

---

## 📋 구현 요구사항 및 체크리스트

개발 완료 후 다음 항목들을 기준으로 검증했습니다:

| # | 요구사항 | 검증 상태 | 비고 |
|----|-----------|---------|------|
| 1 | 상품 상세페이지에 골라담기 형태의 커스텀 옵션 UI가 정상 노출된다 | ✅ | 로컬 환경에서 8개 카드 렌더링 확인 |
| 2 | 커스텀 옵션 선택 시 카페24 기본 옵션을 동시에 변경된다 | ⚠️ 부분 검증 | 동기화 로직 구현 완료, 실 DOM 미확보로 실동작 미검증 |
| 3 | 중복 선택 방지 (같은 옵션 재클릭 시 경고) | ✅ | 로컬 환경에서 중복 방지 알림 확인 |
| 4 | 옵션 suffix(_1, _2) 기준으로 그룹별 최대 선택 개수 제한 | ✅ | 로컬 환경에서 횟수 제한 알림 확인 |
| 5 | 개별 옵션별 추가금액으로 총금액 계산 | ✅ | 로컬 환경에서 금액 계산 확인 |
| 6 | 수량 변경, 금액 계산, 장바구니/바로구매 폼 제출 | ⚠️ 부분 검증 | 수량 UI만 로컬 검증, 폼 제출은 실 스토어 필요 |
| 7 | 선택된 옵션의 상태(테두리, 배경, 체크마크) 시각화 | ✅ | 로컬 환경에서 활성화 상태 표시 확인 |
| 8 | 옵션 데이터(이름, 가격, 뱃지 등)를 외부 설정 JS로 분리 관리 | ✅ | `config/optionConfig.js`로 분리 완료 |
| 9 | PC/태블릿/모바일 환경에서 반응형 레이아웃 구현 | ✅ | 미디어쿼리로 PC(4열), 태블릿(3열), 모바일(2/1열) 구현 |

**범례**: ✅ = 완료, ⚠️ = 부분 검증, ⏳ = 보류

---

## ⚠️ 미구현 항목 및 제한사항

다음 항목들은 **실제 카페24 테스트몰이 준비된 후** 검증 가능합니다:

| 항목 | 상태 | 이유 | 재검증 방법 |
|------|------|------|-----------|
| 기본 옵션과의 동기화 | ⚠️ 부분 검증 | 로직은 보강했으나 실 DOM 미확보 | 카페24 상품 상세페이지에서 양쪽 UI 선택 후 동시 변경 확인 |
| 수량/장바구니/바로구매 | ⚠️ 부분 검증 | 수량 UI만 로컬에서 검증, 폼 제출은 불가능 | 카페24 상품 상세페이지에서 옵션 선택 후 장바구니/바로구매 버튼 클릭하여 폼 제출 확인 |
| 시크릿 창 확인 | ⏳ 보류 | 실 스토어 URL 필요 | 로그아웃 상태에서 스토어프론트 접속하여 커스텀 UI 노출 확인 |
| 화면 녹화 4건 | ⏳ 보류 | 실 스토어 필요 | [**docs/phase6-recording-plan.md**](docs/phase6-recording-plan.md)의 시나리오 참고하여 촬영 |

**현재까지 로컬에서 검증 완료:** UI 노출, 중복 방지, 횟수 제한, 금액 계산, 활성화 상태 표시, 외부 설정 분리, 반응형 CSS

---

## 📂 구조

```
cafe24/
  ├── README.md                     # 이 파일
  ├── docs/
  │   ├── phase1-setup-guide.md    # Phase 1: 카페24 환경 준비 가이드
  │   └── figma-notes.md            # Phase 1: Figma 디자인 시안 분석 (템플릿)
  ├── src/                          # Phase 3~: HTML/CSS/JS 마크업 (예정)
  └── config/                       # Phase 5: 외부 설정 JS (예정)
      └── optionConfig.js           # 옵션 데이터 관리 설정
```

## 🚀 작업 로드맵

### Phase 1: 환경 준비 및 이해 (1시간)
- 카페24 테스트몰 셋업, 상품 등록, 옵션 설정
- Figma 디자인 시안 분석
- **산출물**: `docs/phase1-setup-guide.md`, `docs/figma-notes.md`

### Phase 2: 기본 구조 분석 및 설계 (1.5시간)
- 카페24 기본 옵션 DOM 구조 분석
- 커스텀 UI 구현 방식 설계
- 외부 설정 JS 구조 설계

### Phase 3: 커스텀 UI 마크업 구현 (2시간)
- HTML 구조 작성 (`src/detail-option.html` 예정)
- PC 레이아웃 CSS 구현 (`src/option.css` 예정)
- MO 반응형 구현

### Phase 4: JavaScript 로직 구현 (3시간)
- 옵션 동기화 로직
- 중복 방지 로직
- 횟수 제한 로직
- 기본 구매 로직 연결

### Phase 5: 외부 설정 JS 분리 및 관리 (1시간)
- 설정 파일 구조화 (`config/optionConfig.js`)
- 뱃지, 설명, 가격 등 관리 가능한 구조 구성
- 문서화

### Phase 6: 테스트 및 QA (0.5시간)
- 기능 테스트 (9개 체크리스트)
- 반응형 테스트 (PC/MO)
- 시크릿 창 확인

### Phase 7: 제출 물품 준비 (0.5시간)
- 코드 정리
- 파일 수집 및 압축
- 제출 물품 체크리스트 확인

## 📝 주의사항

### 필수 준수
1. **테스트몰에서만 작업** (운영몰 금지)
2. **기본 구매/장바구니 로직 재구현 금지** (기존 로직 활용)
3. **외부 설정 JS는 옵션 UI 구성값 관리 용도만** (구매 로직 대체 금지)
4. **옵션 관련 DOM·이벤트 삭제 금지**
5. **옵션 외 영역 수정 금지** (이미지, 설명, 배너, 구매 버튼 외형 등)

### 구현 우선순위
1. **기능 안정성** (중복 방지, 횟수 제한, 동기화) - 가장 중요
2. **카페24 구조 이해** (기본 옵션과의 연동)
3. **디자인** (Figma 시안 참고하되, 안정성 우선)

## 🚀 실행 방법

### 로컬 환경에서 미리보기

개발 중 UI를 로컬 브라우저에서 확인하려면:

1. **`cafe24/src/preview.html` 열기**
   - 브라우저에서 직접 파일 경로로 열기: `file:///path/to/cafe24/src/preview.html`
   - 또는 웹 서버 실행 후 접속 (예: `python -m http.server 8000`)

2. **확인 사항**
   - 8개 옵션 카드가 렌더링되는지 확인
   - 카드 클릭 → 선택 표시, 토스트 알림 표시
   - 개발자도구(F12) 콘솔에서 에러 없는지 확인

### 카페24 스마트디자인에 적용

실제 카페24 환경에서 운영하려면:

#### Step 1: 카페24 테스트몰 준비
```
docs/phase1-setup-guide.md 참고
1. 카페24 테스트몰 생성 (3개월 무료)
2. 상품 등록 및 옵션 설정 (8개 옵션값)
3. 스마트디자인 편집창 진입
```

#### Step 2: 파일 삽입
스마트디자인 `/product/detail.html` 파일에 아래 3개 파일을 모두 포함:

**1) 마크업 추가**
```html
<!-- cafe24/src/detail-option.html 내용을 복사하여 삽입 -->
<!-- 기본 옵션 위에 삽입 권장 -->
```

**2) 스타일 링크**
```html
<link rel="stylesheet" href="cafe24/src/option.css">
```

**3) 스크립트 로드 (순서 중요!)**
```html
<!-- 외부 설정: 옵션 데이터 -->
<script src="cafe24/config/optionConfig.js"></script>

<!-- JavaScript 로직: 카드 동적 렌더링 -->
<script src="cafe24/src/option.js"></script>
```

#### Step 3: 검증
1. 스토어프론트 상품 상세페이지 접속
2. 커스텀 옵션 UI 정상 노출 확인
3. 카드 선택 → 기본 옵션도 동시에 변경되는지 확인
4. 장바구니 / 바로구매 정상 동작 확인

### 옵션 데이터 수정

옵션명, 가격, 뱃지 등을 변경하려면:

```javascript
// cafe24/config/optionConfig.js 수정
const optionConfig = {
  options: [
    {
      id: 1,
      rawLabel: "10개입_1",  // 카페24 옵션값과 일치해야 함
      groupKey: "10개입",
      displayName: "10개입",
      description: "소규모 패키지",
      price: 2000,  // 추가 금액
      badge: "가장 많이 사요",  // null이면 미표시
      imageSrc: "../img/image.png",  // null이면 placeholder
      sortOrder: 1,
    },
    // ... 나머지 옵션들
  ],
  groups: {
    "10개입": { maxCount: 2 },  // 최대 선택 개수
    // ...
  },
};
```

상세 가이드: [`docs/phase5-config-guide.md`](docs/phase5-config-guide.md)

---

## 📋 시작하기

1. **로컬 프리뷰** (개발 중)
   - `cafe24/src/preview.html`을 브라우저에서 열어 UI 확인
   
2. **Phase 1 실행** (카페24 적용 시)
   - `docs/phase1-setup-guide.md`를 읽고 카페24 환경 준비
   
3. **Step 2~3 진행**
   - 위의 "카페24 스마트디자인에 적용" 참고하여 3개 파일 삽입
   - 스토어프론트에서 검증

4. **옵션 커스터마이징**
   - `cafe24/config/optionConfig.js`의 옵션 데이터 수정
   - 변경사항은 자동으로 UI에 반영됨

---

