# Phase 2-2: 커스텀 UI 구현 방식 설계

이 문서는 "골라담기" 커스텀 옵션 UI의 HTML 구조, CSS 레이아웃, JavaScript 로직을 **구조/기능 중심**으로 설계한 내용입니다. 색상, 폰트, 세부 스타일은 `figma-notes.md`가 완료된 후 Phase 3에서 반영합니다.

---

## 1. HTML 구조 설계

### 1-1 전체 계층 구조

```
커스텀 옵션 컨테이너 (#custom-option-ui)
  ├── 섹션 제목
  ├── 카드 리스트 컨테이너 (#card-list)
  │   ├── 카드 (#card-item-1)
  │   │   ├── 이미지/아이콘 영역
  │   │   ├── 텍스트 영역 (제목, 부제목)
  │   │   ├── 가격 표시
  │   │   ├── 뱃지 (있으면)
  │   │   ├── 선택 상태 표시 (체크마크 등)
  │   │   └── 선택 버튼
  │   ├── 카드 (#card-item-2)
  │   └── ... (8개 모두)
  │
  ├── 선택 상품 목록 영역 (#selected-list)
  │   ├── 목록 제목
  │   ├── 각 선택 항목 (#selected-item-1)
  │   │   ├── 상품명 / 옵션값
  │   │   ├── 추가금액 표시
  │   │   ├── 수량 (증감 버튼)
  │   │   └── 삭제 버튼
  │   └── 합계 금액 영역
  │
  └── (기본 옵션 영역 유지 - display:none으로 숨김)
```

### 1-2 마크업 예시

```html
<!-- 커스텀 옵션 컨테이너 -->
<div id="custom-option-ui" class="custom-option-ui">
  
  <h3 class="section-title">골라담기 상품 선택</h3>
  
  <!-- 카드 리스트 -->
  <div id="card-list" class="card-list">
    <!-- 카드는 JavaScript로 동적 생성 (optionConfig.js 데이터 기반) -->
    <!-- 예:
    <div class="card-item" data-option-value="10개입_1" data-group-key="10개입">
      <div class="card-image">
        <img src="..." alt="10개입">
      </div>
      <div class="card-content">
        <h4 class="card-title">10개입</h4>
        <p class="card-description">소규모 패키지</p>
      </div>
      <div class="card-price">+2,000원</div>
      <div class="card-badge">인기</div>
      <div class="card-select-btn">선택</div>
      <div class="card-checkmark">✓</div>
    </div>
    -->
  </div>
  
  <!-- 선택 상품 목록 -->
  <div id="selected-list" class="selected-list">
    <h4 class="selected-title">선택한 상품</h4>
    <div id="selected-items" class="selected-items">
      <!-- 선택 항목 목록, JavaScript로 동적 업데이트 -->
      <!-- 예:
      <div class="selected-item" data-option-value="10개입_1">
        <span class="selected-name">10개입_1</span>
        <span class="selected-price">+2,000원</span>
        <div class="selected-quantity">
          <button type="button" class="qty-down">-</button>
          <input type="number" value="1" min="1" readonly>
          <button type="button" class="qty-up">+</button>
        </div>
        <button type="button" class="selected-remove">삭제</button>
      </div>
      -->
    </div>
    <div class="selected-total">
      <span class="total-label">합계</span>
      <span id="total-price" class="total-price">0원</span>
    </div>
  </div>
  
</div>

<!-- 기본 옵션 영역 (삭제하지 않고 display:none으로 숨김) -->
<div class="xans-product-option" style="display: none;">
  <!-- 기본 옵션 DOM 그대로 유지 -->
</div>
```

### 1-3 구조 설계 원칙

- **기본 옵션 DOM 삭제 금지**: 카페24의 기본 옵션 DOM은 그대로 유지하되, `display: none` 또는 `visibility: hidden`으로 숨김
- **숨겨진 select/input**: 커스텀 카드 클릭 시 숨겨진 기본 select 또는 input을 프로그래매틱하게 변경 (이벤트 시뮬레이션)
- **양방향 동기화**: 사용자가 기본 옵션을 직접 클릭한 경우에도 커스텀 UI가 동기화되어야 함

---

## 2. CSS 레이아웃 설계

### 2-1 PC 레이아웃

#### 카드 그리드 구성

```css
#card-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 24px;
  background-color: #ffffff;
}

.card-item {
  display: flex;
  flex-direction: column;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease-out;
  background-color: #ffffff;
}

.card-item:hover {
  background-color: #f5f5f5;
  border-color: #dddddd;
}

.card-item.selected {
  border-color: #ff6b35;
  border-width: 2px;
  background-color: #fff3ec;
}

.card-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
  background-color: #f0f0f0;
  border-color: #eeeeee;
}
```

#### 카드 내부 요소 정렬

```css
.card-image {
  width: 100%;
  height: 120px;  /* TODO: 이미지 높이 */
  background-color: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.card-content {
  flex: 1;  /* 나머지 공간 채우기 */
}

.card-title {
  font-size: 14px;  /* TODO: figma에서 폰트 크기 */
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;  /* TODO: 폰트 색상 */
}

.card-description {
  font-size: 12px;
  color: #999;  /* TODO: 보조 텍스트 색상 */
  margin: 0 0 12px 0;
}

.card-price {
  font-size: 16px;
  font-weight: 700;
  color: #ff6b35;
  margin-bottom: 8px;
}

.card-badge {
  display: inline-block;
  background-color: #ffe8dc;
  color: #ff6b35;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-weight: 600;
}

.card-select-btn {
  background-color: #ff6b35;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  font-weight: 600;
  transition: background-color 0.2s ease-out;
}

.card-select-btn:hover {
  background-color: #e55a2b;
}

.card-checkmark {
  position: absolute;  /* 또는 relative로 배치 */
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background-color: /* TODO: 체크마크 배경 */;
  border-radius: 50%;
  display: none;  /* 기본 숨김, 선택 시 표시 */
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
}

.card-item.selected .card-checkmark {
  display: flex;
}
```

#### 선택 상품 목록 영역

```css
#selected-list {
  margin-top: 24px;
  padding: 16px;
  background-color: #f9f9f9;  /* TODO: 배경색 */
  border: 1px solid #e0e0e0;  /* TODO: 테두리 */
  border-radius: 8px;
}

.selected-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

#selected-items {
  max-height: 200px;  /* 스크롤 가능하게 */
  overflow-y: auto;
  margin-bottom: 12px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.selected-item:last-child {
  border-bottom: none;
}

.selected-quantity input {
  width: 40px;
  text-align: center;
  border: 1px solid #ddd;
  padding: 4px;
  margin: 0 4px;
}

.selected-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
}

.selected-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  padding-top: 12px;
  border-top: 2px solid #333333;
}

#total-price {
  color: #ff6b35;
}
```

### 2-2 모바일(MO) 레이아웃

#### 반응형 브레이크포인트

```css
@media (max-width: 768px) {
  
  /* 카드를 2열로 줄임 */
  #card-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
  }
  
  /* 카드 크기 조정 */
  .card-item {
    padding: 8px;
  }
  
  .card-image {
    height: 100px;
    margin-bottom: 8px;
  }
  
  .card-title {
    font-size: 13px;
  }
  
  .card-price {
    font-size: 14px;
  }
  
  .card-select-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  
  /* 초소형 화면: 1열 */
  #card-list {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 12px;
  }
  
  /* 터치 영역 최소화 (44x44px 이상) */
  .card-select-btn {
    padding: 12px;  /* 최소 터치 영역 확보 */
    min-height: 44px;
  }
  
  #selected-list {
    margin-top: 16px;
    padding: 12px;
  }
  
  /* 구매 버튼과의 겹침 방지 - 하단에 여유 공간 추가 */
  #custom-option-ui {
    padding-bottom: 60px;  /* 고정 구매 버튼 높이 대비 여유 */
  }
}
```

#### 선택적 모달/드로어 레이아웃

Figma 시안에서 "모바일에서 모달로 표시"라는 결정이 나면:

```css
@media (max-width: 768px) {
  
  /* 바텀시트 구현: 모바일에서 옵션 선택을 바텀시트로 표시 */
  #custom-option-ui {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    border-radius: 16px 16px 0 0;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease-out;
  }
  
  /* 바텀시트 오버레이 */
  #custom-option-ui::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  /* 드래그 핸들 (바텀시트 상단) */
  .modal-handle {
    width: 32px;
    height: 4px;
    background: #cccccc;
    border-radius: 2px;
    margin: 12px auto;
    cursor: grab;
  }
  
  .modal-handle:active {
    cursor: grabbing;
  }
  
  /* 닫기 버튼 */
  .modal-close {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666666;
    padding: 8px;
  }
}
```

### 2-3 레이아웃 설계 원칙

- **PC (1024px 이상)**: Grid 4열, 충분한 여백
- **태블릿 (768px ~ 1023px)**: Grid 2~3열, 조정
- **모바일 (480px ~ 767px)**: Grid 2열, 긴 리스트는 스크롤
- **초소형 (480px 이하)**: Grid 1열, 터치 최적화
- **터치 영역**: 최소 44×44px 이상 (iOS/안드로이드 가이드라인)
- **구매 버튼 겹침**: 모바일에서 고정 구매 버튼 고려 (하단 패딩 추가)

---

## 2-4 UI 컴포넌트 (새로 추가)

### 2-4-1 토스트 알림

```css
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #2b2b2b;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideInUp 0.3s ease-out, slideOutDown 0.3s ease-out 2.7s forwards;
}

.toast.success::before {
  content: '✓';
  color: #34c759;
  font-weight: 700;
  font-size: 16px;
}

.toast.warning::before {
  content: '!';
  color: #ff3b30;
  font-weight: 700;
  font-size: 16px;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes slideOutDown {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
}
```

### 2-4-2 경고 배지/툴팁

```css
/* 옵션 미선택 시 경고 배지 */
.warning-badge {
  display: inline-block;
  background-color: #4b4b4b;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.warning-badge::before {
  content: '!';
  color: #ff3b30;
  font-weight: 700;
}

/* 횟수 제한 도달 시 툴팁 */
.limit-tooltip {
  background-color: #4b4b4b;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.limit-tooltip::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #4b4b4b;
}
```

### 2-4-3 선택 요약 박스

```css
/* 선택한 옵션 요약 박스 (PC: 우측 패널, MO: 바텀시트 내부) */
.selected-summary {
  background-color: #fff3ec;
  border: 2px solid #ff6b35;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  position: relative;
}

.selected-summary-title {
  font-size: 14px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 8px;
}

.selected-summary-detail {
  font-size: 12px;
  color: #666666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.selected-summary-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-summary-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-stepper {
  display: flex;
  align-items: center;
  border: 1px solid #dddddd;
  border-radius: 4px;
  background-color: #ffffff;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #666666;
  font-weight: 600;
  transition: color 0.2s;
}

.qty-btn:hover {
  color: #ff6b35;
}

.qty-input {
  width: 50px;
  text-align: center;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  color: #333333;
}

.selected-summary-price {
  font-size: 14px;
  font-weight: 700;
  color: #ff6b35;
}

.selected-summary-remove {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999999;
  padding: 4px;
  transition: color 0.2s;
}

.selected-summary-remove:hover {
  color: #ff6b35;
}
```

---

## 3. JavaScript 로직 설계

### 3-1 모듈 구조

```javascript
// 전체 로직을 모듈화하여 조직화
const CustomOptionUI = {
  config: null,
  state: {
    selectedOptions: [],  // 선택된 옵션값 배열
    selectedCounts: {},   // 옵션별 선택 횟수 추적
  },
  
  init(configData) { /* 초기화 */ },
  renderCards() { /* 카드 렌더링 */ },
  syncToDefaultOption(optionValue) { /* 커스텀 → 기본 옵션 동기화 */ },
  syncFromDefaultOption() { /* 기본 옵션 → 커스텀 동기화 */ },
  preventDuplicate(optionValue) { /* 중복 체크 */ },
  enforceLimit(groupKey) { /* 횟수 제한 체크 */ },
  updateSelectedList() { /* 선택 목록 갱신 */ },
  recalculateTotal() { /* 총액 재계산 */ },
  addSelectedOption(optionValue) { /* 옵션 추가 */ },
  removeSelectedOption(optionValue) { /* 옵션 삭제 */ },
};

// 초기화 (page load 또는 DOM ready)
document.addEventListener('DOMContentLoaded', () => {
  CustomOptionUI.init(window.optionConfig);
});
```

### 3-2 각 함수의 로직

#### `init(configData)`

```javascript
init(configData) {
  this.config = configData;
  this.state.selectedOptions = [];
  this.state.selectedCounts = {};
  
  // 각 옵션 그룹의 최대 추가 횟수 계산
  this.config.options.forEach(option => {
    const groupKey = option.groupKey;
    if (!this.state.selectedCounts[groupKey]) {
      this.state.selectedCounts[groupKey] = 0;
    }
  });
  
  // 1. 카드 렌더링
  this.renderCards();
  
  // 2. 기본 옵션 변경 감지 (양방향 동기화)
  this.observeDefaultOption();
  
  // 3. 이벤트 리스너 등록
  this.attachEventListeners();
}
```

#### `renderCards()`

```javascript
renderCards() {
  const cardList = document.getElementById('card-list');
  cardList.innerHTML = '';  // 기존 내용 제거
  
  this.config.options.forEach(option => {
    const card = document.createElement('div');
    card.className = 'card-item';
    card.setAttribute('data-option-value', option.rawLabel);
    card.setAttribute('data-group-key', option.groupKey);
    
    // 카드 내용 구성 (HTML)
    card.innerHTML = `
      <div class="card-image">
        <img src="${option.imageSrc || ''}" alt="${option.displayName}">
      </div>
      <div class="card-content">
        <h4 class="card-title">${option.displayName}</h4>
        <p class="card-description">${option.description || ''}</p>
      </div>
      <div class="card-price">+${option.price.toLocaleString()}원</div>
      ${option.badge ? `<div class="card-badge">${option.badge}</div>` : ''}
      <button type="button" class="card-select-btn">선택</button>
      <div class="card-checkmark">✓</div>
    `;
    
    // 카드 클릭 이벤트
    card.addEventListener('click', () => this.onCardClick(option.rawLabel, option.groupKey));
    
    cardList.appendChild(card);
  });
}
```

#### `onCardClick(optionValue, groupKey)`

```javascript
onCardClick(optionValue, groupKey) {
  // 1. 중복 체크
  if (this.preventDuplicate(optionValue)) {
    alert('이미 선택한 옵션입니다');
    return;
  }
  
  // 2. 횟수 제한 체크
  if (!this.enforceLimit(groupKey)) {
    alert(`${groupKey}은(는) 최대 ${this.getMaxCount(groupKey)}개까지만 추가 가능합니다`);
    return;
  }
  
  // 3. 옵션 추가
  this.addSelectedOption(optionValue);
  
  // 4. 커스텀 → 기본 옵션 동기화 (DOM 이벤트 시뮬레이션)
  this.syncToDefaultOption(optionValue);
  
  // 5. UI 업데이트
  this.updateSelectedList();
  this.recalculateTotal();
  this.updateCardStates();
}
```

#### `syncToDefaultOption(optionValue)`

```javascript
syncToDefaultOption(optionValue) {
  // 기본 옵션 요소 찾기
  const defaultOption = document.querySelector(
    `.xans-product-option select, 
     .xans-product-option .btn-list button`
  );
  
  if (!defaultOption) {
    console.warn('기본 옵션 요소를 찾을 수 없습니다');
    return;
  }
  
  // select 방식
  if (defaultOption.tagName === 'SELECT') {
    defaultOption.value = optionValue;
    defaultOption.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // 버튼 방식
  else {
    const btn = Array.from(defaultOption.parentElement.querySelectorAll('button'))
      .find(b => b.textContent === optionValue || b.value === optionValue);
    if (btn) {
      btn.click();
      // 또는 btn.dispatchEvent(new Event('click', { bubbles: true }));
    }
  }
}
```

#### `syncFromDefaultOption()`

```javascript
syncFromDefaultOption() {
  // 기본 옵션의 현재 선택값 읽기
  const defaultSelect = document.querySelector('.xans-product-option select');
  if (!defaultSelect) return;
  
  const currentValue = defaultSelect.value;
  if (!currentValue) return;  // 미선택 상태
  
  // 커스텀 UI에서 해당 카드 상태 업데이트
  const card = document.querySelector(`[data-option-value="${currentValue}"]`);
  if (card) {
    card.classList.add('selected');
  }
  
  // (필요 시) 선택 목록에도 추가
  if (!this.state.selectedOptions.includes(currentValue)) {
    this.addSelectedOption(currentValue);
  }
}
```

#### `preventDuplicate(optionValue)`

```javascript
preventDuplicate(optionValue) {
  return this.state.selectedOptions.includes(optionValue);
}
```

#### `enforceLimit(groupKey)`

```javascript
enforceLimit(groupKey) {
  // 같은 그룹의 옵션값 개수 확인
  const groupOptions = this.config.options.filter(o => o.groupKey === groupKey);
  const maxCount = groupOptions.length;  // suffix _1, _2, _3... 기반
  
  const currentCount = this.state.selectedOptions.filter(v => {
    const option = this.config.options.find(o => o.rawLabel === v);
    return option && option.groupKey === groupKey;
  }).length;
  
  return currentCount < maxCount;  // true = 추가 가능
}
```

#### `updateSelectedList()`

```javascript
updateSelectedList() {
  const selectedItems = document.getElementById('selected-items');
  selectedItems.innerHTML = '';
  
  this.state.selectedOptions.forEach(optionValue => {
    const option = this.config.options.find(o => o.rawLabel === optionValue);
    if (!option) return;
    
    const item = document.createElement('div');
    item.className = 'selected-item';
    item.setAttribute('data-option-value', optionValue);
    
    item.innerHTML = `
      <span class="selected-name">${option.displayName}</span>
      <span class="selected-price">+${option.price.toLocaleString()}원</span>
      <div class="selected-quantity">
        <button type="button" class="qty-down">-</button>
        <input type="number" value="1" min="1" readonly>
        <button type="button" class="qty-up">+</button>
      </div>
      <button type="button" class="selected-remove">삭제</button>
    `;
    
    // 삭제 버튼 이벤트
    item.querySelector('.selected-remove').addEventListener('click', () => {
      this.removeSelectedOption(optionValue);
    });
    
    // 수량 증감 버튼 (필요 시)
    // ...
    
    selectedItems.appendChild(item);
  });
}
```

#### `recalculateTotal()`

```javascript
recalculateTotal() {
  let total = 0;
  
  this.state.selectedOptions.forEach(optionValue => {
    const option = this.config.options.find(o => o.rawLabel === optionValue);
    if (option) {
      total += option.price;
    }
  });
  
  // 수량 곱하기 (기본 옵션의 수량 참고)
  const quantityInput = document.querySelector('input[name="quantity"]');
  const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
  total = total * quantity;
  
  // 화면에 표시
  document.getElementById('total-price').textContent = 
    `+${total.toLocaleString()}원`;
}
```

#### `addSelectedOption(optionValue)` / `removeSelectedOption(optionValue)`

```javascript
addSelectedOption(optionValue) {
  this.state.selectedOptions.push(optionValue);
}

removeSelectedOption(optionValue) {
  this.state.selectedOptions = this.state.selectedOptions.filter(v => v !== optionValue);
  
  // hidden input에서도 제거 (기본 옵션과 동기화)
  const hiddenInputs = document.querySelectorAll('[name="option_hidden_*"]');
  hiddenInputs.forEach(input => {
    if (input.value === optionValue) {
      input.remove();
    }
  });
  
  this.updateSelectedList();
  this.recalculateTotal();
  this.updateCardStates();
}
```

### 3-3 이벤트 리스너 등록

```javascript
attachEventListeners() {
  // 카드 클릭 (이미 renderCards()에서 등록함)
  
  // 기본 옵션 변경 감지 (양방향 동기화)
  const defaultSelect = document.querySelector('.xans-product-option select');
  if (defaultSelect) {
    defaultSelect.addEventListener('change', () => this.syncFromDefaultOption());
  }
  
  // 수량 변경 시 총액 재계산
  const quantityInput = document.querySelector('input[name="quantity"]');
  if (quantityInput) {
    quantityInput.addEventListener('change', () => this.recalculateTotal());
  }
  
  // 장바구니/바로구매 버튼 클릭 전 옵션 검증 (기본 로직에 위임)
  // → 별도 처리 불필요 (기본 옵션 DOM이 유지되므로)
}

showToast(message, type = 'success') {
  // 토스트 알림 표시 (3초 후 자동 사라짐)
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

updateCardStates() {
  // 모든 카드의 선택 상태 업데이트
  document.querySelectorAll('.card-item').forEach(card => {
    const optionValue = card.getAttribute('data-option-value');
    if (this.state.selectedOptions.includes(optionValue)) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}
```

---

## 4. 호출 흐름 (시퀀스)

```
페이지 로드 (DOMContentLoaded)
  ↓
CustomOptionUI.init(optionConfig)
  ├─ 설정 데이터 로드
  ├─ renderCards() → 카드 8개 생성
  ├─ observeDefaultOption() → 양방향 동기화 설정
  └─ attachEventListeners() → 이벤트 리스너 등록
  ↓
사용자가 카드 클릭
  ↓
onCardClick(optionValue, groupKey)
  ├─ preventDuplicate() → 중복 체크
  ├─ enforceLimit() → 횟수 제한 체크
  ├─ addSelectedOption() → state에 추가
  ├─ syncToDefaultOption() → 기본 옵션 hidden input 변경
  ├─ updateSelectedList() → 선택 목록 렌더링
  ├─ recalculateTotal() → 총액 계산
  └─ updateCardStates() → 카드 UI 갱신
  ↓
사용자가 "바로구매" 또는 "장바구니" 버튼 클릭
  ↓
기본 옵션 유효성 검사 (기존 카페24 로직)
  ↓
선택된 옵션값이 hidden input에 저장된 상태로 폼 제출
```

---

## 5. 설계 확정 사항

✅ **확정된 항목**:
- **DOM 조작**: 기본 옵션 select/hidden input을 직접 조작해 이벤트 시뮬레이션
- **양방향 동기화**: 커스텀 카드와 기본 옵션 간 상태 항상 일치
- **중복 방지**: 같은 옵션값을 두 번 선택 불가
- **횟수 제한**: suffix 기반 그룹핑으로 최대 추가 가능 횟수 제한
- **가격 계산**: 선택된 옵션값별 추가금액 합산
- **수량 연동**: 기본 옵션의 수량 변경 시 총액 재계산

✅ **디자인 참고 자료** (실제 참고 사이트 분석 완료):
- 색상: 오렌지 강조색 `#FF6B35`, 선택 배경 `#FFF3EC`, 토스트 `#2B2B2B` 등
- 레이아웃: PC 2단(좌측 이미지/우측 패널), MO 바텀시트
- 유소: 토스트 알림, 경고 배지, 선택 요약 박스, 바텀시트 드래그 핸들

⏳ **Phase 3에서 구현할 사항**:
- [ ] 실제 HTML/CSS/JS 마크업 작성 (`cafe24/src/` 폴더)
- [ ] 카드 이미지/아이콘 에셋 처리 (placeholder 또는 실제 이미지)
- [ ] 실제 테스트몰 DOM 구조 확인 후 `syncToDefaultOption()` 로직 수정
- [ ] 바텀시트 드래그 로직 구현 (터치 드래그로 닫기)
- [ ] 토스트 자동 사라짐 타이밍 조정
- [ ] 반응형 테스트 (PC/태블릿/모바일 다양한 화면 크기)

---

**작성 상태**: ✅ 설계 + 디자인 분석 완료, ⏳ Phase 3 구현 시작  
**마지막 수정**: 2026-07-12
