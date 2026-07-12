# Phase 2-1: 카페24 옵션 DOM 구조 분석

⚠️ **중요**: 이 문서는 **초안**입니다. 카페24 스마트디자인의 "독립 선택형 + 텍스트버튼" 옵션이 일반적으로 사용하는 표준 DOM/이벤트 패턴을 기반으로 작성되었습니다. **실제 테스트몰의 `/product/detail.html` 소스를 확보한 후 아래 체크리스트와 대조하여 검증 필요**합니다.

---

## 📋 분석 항목

### 1. 독립 선택형 텍스트버튼 옵션의 기본 DOM 구조

카페24 스마트디자인에서 "독립 선택형 + 텍스트버튼" 옵션을 적용하면 일반적으로 다음과 같은 구조를 갖습니다:

#### 1-1 전체 옵션 컨테이너

```html
<div class="xans-element- xans-product xans-product-option">
  <!-- 옵션 영역 전체 -->
  
  <h3>옵션 선택</h3>  <!-- 섹션 제목 -->
  
  <!-- 개별 옵션 선택 영역 (아래 참고) -->
  
</div>
```

- **클래스명**: `xans-product-option` (카페24 표준 클래스)
- **위치**: 상품 상세페이지 설명 아래, 가격/구매 버튼 위쪽 (일반적 배치)

#### 1-2 개별 옵션 선택 영역 (텍스트버튼형)

```html
<div class="option-type-button">
  <!-- 또는 <div class="product-options"> -->
  
  <div class="option-item">
    <label>옵션명 (예: 수량/입수)</label>
    
    <!-- 텍스트버튼 방식 -->
    <ul class="btn-list">
      <li><button type="button" data-option-value="10개입_1">10개입</button></li>
      <li><button type="button" data-option-value="10개입_2">10개입</button></li>
      <li><button type="button" data-option-value="30개입_1">30개입</button></li>
      <li><button type="button" data-option-value="30개입_2">30개입</button></li>
      <li><button type="button" data-option-value="50개입_1">50개입</button></li>
      <li><button type="button" data-option-value="50개입_2">50개입</button></li>
      <li><button type="button" data-option-value="100개입_1">100개입</button></li>
      <li><button type="button" data-option-value="100개입_2">100개입</button></li>
    </ul>
    
    <!-- 또는 select 방식 (드롭다운) -->
    <select name="option1" id="product_option_id1">
      <option value="">-- 옵션 선택 --</option>
      <option value="10개입_1">10개입_1</option>
      <option value="10개입_2">10개입_2</option>
      <!-- ... 8개 옵션값 -->
    </select>
  </div>
</div>
```

**특징**:
- 텍스트버튼형: `<button>` 또는 `<a>` 요소로 각 옵션값 표시
- 드롭다운형: `<select>` 요소 사용
- 각 버튼/옵션에 `data-option-value` 또는 `value` 속성으로 카페24 옵션값(예: `10개입_1`) 저장

#### 1-3 옵션값 저장 영역

```html
<!-- 선택된 옵션 정보를 저장하는 hidden input 또는 표시 영역 -->

<!-- 방식 1: Hidden input (복수 선택 시) -->
<input type="hidden" name="option_hidden_1" value="10개입_1">
<input type="hidden" name="option_hidden_2" value="30개입_1">
<!-- 각 선택된 옵션마다 hidden input이 하나씩 생성될 수 있음 -->

<!-- 방식 2: Text input (선택 상태 표시) -->
<input type="text" name="option_text_1" value="10개입_1" readonly>

<!-- 방식 3: Div 영역 (선택 상품 표시) -->
<div class="product-choice-area">
  <div class="product-choice-item">
    <span class="choice-name">10개입_1</span>
    <span class="choice-price">+2,000원</span>
    <span class="choice-quantity">
      <input type="number" value="1" min="1">
    </span>
    <button type="button" class="choice-remove">삭제</button>
  </div>
  <!-- 각 선택마다 반복 -->
</div>
```

**저장 위치**:
- 선택된 옵션값들이 저장되는 폼 필드는 `name="option_hidden_1"`, `name="option_hidden_2"` 등 또는 배열 형태 `name="option[]"`
- 또는 JavaScript 객체로 메모리에만 관리 가능

---

### 2. 필수 이벤트 및 훅

#### 2-1 기본 옵션 선택 이벤트

```javascript
// 텍스트버튼 클릭 시 발생
document.querySelectorAll('.btn-list button').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const optionValue = this.getAttribute('data-option-value');
    // 또는 this.textContent, this.value 등에서 추출
    
    // 카페24 전역 함수 호출 (존재 시)
    // fnAddOption(optionValue);  // 옵션 추가 함수
    // fnSelectOption(optionValue); // 옵션 선택 함수
  });
});

// select 변경 시 발생
const selectEl = document.getElementById('product_option_id1');
selectEl.addEventListener('change', function() {
  const optionValue = this.value;
  // 옵션값이 변경됨
});
```

#### 2-2 선택 상태 표시 및 변경 감지

```javascript
// 방식 1: 버튼 상태 변경 감지
// 클릭된 버튼에 'selected' 또는 'active' 클래스 추가/제거
btn.classList.toggle('selected');

// 방식 2: Hidden input 값 변경 감지
const observer = new MutationObserver(() => {
  // hidden input 값이 변경되면 감지
  const selectedValues = document.querySelectorAll('[name="option_hidden_*"]');
});

// 방식 3: 사용자 정의 이벤트
// 카페24가 발생시키는 커스텀 이벤트 (문서에 명시되지 않으면 콘솔에서 확인)
// window.addEventListener('cafe24:optionChange', (e) => { ... });
```

#### 2-3 카페24 전역 함수 및 객체

**가능한 전역 함수/객체** (버전에 따라 다를 수 있음):

```javascript
// 옵션 추가/선택
window.fnAddOption(optionValue, quantity);
window.fnSelectOption(optionValue);
window.fnRemoveOption(optionValue);

// 옵션 관련 데이터 접근
window.gOption = { ... };  // 옵션 정보 객체
window.gProduct = { ... }; // 상품 정보 객체

// 가격 계산
window.fnCalcPrice();  // 총액 재계산

// 폼 전송
window.document.orderform;  // 구매 폼 객체
```

**확인 방법**:
1. 테스트몰 상품 상세페이지 → 브라우저 개발자도구(F12) → 콘솔 탭
2. 옵션을 선택해본 후 콘솔에서 `window` 객체를 확인
3. `fnAddOption`, `gOption` 등의 존재 여부와 동작 확인

---

### 3. 선택된 옵션값 저장 위치

#### 3-1 폼 필드명 패턴

카페24 표준 옵션 필드명:
- `option_hidden_1`, `option_hidden_2`, ... : 선택된 옵션값 저장
- `option_quantity_1`, `option_quantity_2`, ... : 각 옵션의 수량
- `product_option_id1` : select 방식의 선택된 값

#### 3-2 데이터 저장 구조 예시

```html
<!-- 예: "10개입_1", "30개입_1" 두 개 선택 시 -->

<input type="hidden" name="option_hidden_1" value="10개입_1">
<input type="hidden" name="option_hidden_2" value="30개입_1">

<!-- 또는 배열 형태 -->
<input type="hidden" name="option[]" value="10개입_1">
<input type="hidden" name="option[]" value="30개입_1">

<!-- 수량 정보 -->
<input type="hidden" name="option_quantity_1" value="1">
<input type="hidden" name="option_quantity_2" value="1">
```

#### 3-3 데이터 접근 방법

```javascript
// 선택된 옵션값 모두 가져오기 (방식 1: hidden input)
const selectedOptions = Array.from(document.querySelectorAll('[name="option_hidden_*"]'))
  .map(el => el.value);

// 선택된 옵션값 모두 가져오기 (방식 2: 배열 input)
const form = document.querySelector('form[name="orderform"]');
const selectedOptions = form.querySelectorAll('input[name="option[]"]');

// 선택된 옵션값 모두 가져오기 (방식 3: JavaScript 객체)
const selectedOptions = window.gOption?.selectedItems || [];
```

---

### 4. 기본 구매 로직과의 연결점

#### 4-1 구매 폼 구조

```html
<form name="orderform" id="orderform">
  <!-- 상품 정보 -->
  <input type="hidden" name="product_no" value="12345">
  
  <!-- 옵션 정보 (위에서 본 hidden input들) -->
  <input type="hidden" name="option_hidden_1" value="...">
  
  <!-- 수량 -->
  <input type="number" name="quantity" value="1" min="1">
  
  <!-- 구매 버튼 -->
  <button type="button" onclick="fnBuyNow()">바로구매</button>
  <button type="button" onclick="fnAddCart()">장바구니</button>
</form>
```

#### 4-2 구매 함수 호출 흐름

```javascript
// 바로구매 버튼 클릭
function fnBuyNow() {
  // 1. 선택된 옵션 유효성 검사
  if (!validateOptions()) {
    alert('옵션을 선택해주세요');
    return;
  }
  
  // 2. 총액 재계산
  fnCalcPrice();
  
  // 3. 폼 제출
  document.orderform.submit();
  // → 결제 페이지로 이동
}

// 장바구니 추가
function fnAddCart() {
  // 위와 유사한 흐름
  // → 장바구니 페이지로 이동 (또는 팝업 표시)
}
```

#### 4-3 옵션과 가격 연동

```javascript
// 옵션 선택 시 가격 자동 갱신
function fnCalcPrice() {
  let totalPrice = basePrice;  // 기본가
  
  // 선택된 각 옵션값의 추가금액 더하기
  const selectedOptions = /* 선택된 옵션값 배열 */;
  selectedOptions.forEach(optionValue => {
    totalPrice += getAddPrice(optionValue);
  });
  
  // 수량 반영
  const quantity = document.querySelector('input[name="quantity"]').value;
  totalPrice = totalPrice * quantity;
  
  // 화면에 표시
  document.querySelector('.product-price').textContent = totalPrice.toLocaleString();
}

// 옵션값별 추가금액 조회
function getAddPrice(optionValue) {
  const priceMap = {
    '10개입_1': 2000,
    '10개입_2': 2000,
    '30개입_1': 5000,
    // ...
  };
  return priceMap[optionValue] || 0;
}
```

---

## ✅ 검증 체크리스트

실제 테스트몰 `/product/detail.html` 소스 확보 후 아래 항목들을 대조하세요:

### DOM 구조 관련
- [ ] 옵션 컨테이너 클래스가 `xans-product-option` 또는 비슷한 형태인가?
- [ ] 개별 옵션 요소가 `<button>` 또는 `<select>` 중 어느 형태인가?
- [ ] 각 옵션값이 `data-option-value`, `value` 등 속성에 저장되어 있는가?
- [ ] 선택된 옵션 저장용 hidden input 필드명은 무엇인가? (`option_hidden_*`, `option[]` 등)

### 이벤트 관련
- [ ] 옵션 버튼/select에 `change`, `click` 이벤트가 리스너로 등록되어 있는가?
- [ ] 카페24 전역 함수(`fnAddOption`, `fnCalcPrice` 등)가 존재하는가?
- [ ] 커스텀 이벤트나 MutationObserver가 사용되는가?

### 데이터 저장 관련
- [ ] 선택된 옵션값들이 폼 필드(hidden input 또는 다른 형태)에 저장되는가?
- [ ] 수량 정보(`option_quantity_*`)도 함께 저장되는가?
- [ ] 옵션값 텍스트가 정확히 카페24에 등록한 값(예: `10개입_1`)과 일치하는가?

### 가격 계산 관련
- [ ] 옵션값별 추가금액 정보가 어디 저장되어 있는가? (HTML data 속성, JavaScript 객체, 또는 함수)
- [ ] 선택 시 가격이 자동 갱신되는가?

### 구매 로직 관련
- [ ] 구매 폼 이름이 `orderform`인가?
- [ ] 바로구매, 장바구니 버튼이 어떤 함수를 호출하는가?
- [ ] 옵션 선택이 필수인가? (미선택 시 구매 불가능한가?)

---

## 📝 분석 완료 후 다음 단계

이 체크리스트의 모든 항목을 확인하고 실제 소스와 다른 부분을 발견한 경우:

1. 아래 "**분석 결과 정정**" 섹션을 채우세요.
2. Phase 2-2 설계(phase2-design.md)와 Phase 2-3 설정 구조(phase2-config-design.md)에 반영하세요.

---

## 📋 분석 결과 정정

**실제 테스트몰 소스로부터 발견한 차이점**:

```
TODO: 실제 detail.html 소스와 위 초안을 대조한 후, 
다른 부분이 있으면 여기에 기록하세요.

예:
- [차이점 1]: 예상과 달리 ___ 로 구현되어 있음
- [개선 필요]: 위 내용의 ___번 항목을 수정 필요
- [추가 정보]: 추가로 발견한 사항 ___
```

---

**작성 상태**: ✅ 초안 완료, ⏳ 실제 소스 검증 대기  
**마지막 수정**: [사용자 작성 일시]
