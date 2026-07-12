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

## 📋 시작하기

1. **Phase 1 진행**
   - `docs/phase1-setup-guide.md`를 읽고 카페24 환경 준비
   - `docs/figma-notes.md`에 Figma 시안 분석 기록
   
2. **다음 단계**
   - Phase 1 완료 후 로드맵에 따라 Phase 2~7 진행

---

