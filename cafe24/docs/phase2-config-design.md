# Phase 2-3: 외부 설정 JS 구조 설계

이 문서는 Phase 5에서 실제로 작성할 `cafe24/config/optionConfig.js` 파일의 **데이터 스키마와 구조**를 설계합니다. 이 파일은 옵션 UI의 **표시값, 가격, 뱃지, 설명** 등을 관리하는 설정 전용 파일이며, 구매 로직을 대체하지 않습니다.

---

## 1. 옵션 데이터 스키마 설계

### 1-1 전체 구조

```javascript
const optionConfig = {
  // 옵션 목록 (배열로 관리, 순서대로 표시)
  options: [
    {
      id: 1,
      rawLabel: "10개입_1",          // 카페24에 등록한 옵션값 원문 (정확히 일치 필수)
      groupKey: "10개입",            // suffix 제거한 그룹 키
      displayName: "10개입",         // UI에 표시할 이름
      description: "소규모 패키지",  // 부제목/설명
      price: 2000,                   // 추가금액 (원)
      badge: "인기",                 // 뱃지 텍스트 (없으면 null)
      imageSrc: "/images/option-10.png", // 카드 이미지 URL (선택사항)
      sortOrder: 1,                  // 정렬 순서 (낮을수록 먼저)
      maxQuantity: 1,                // 그룹별 최대 추가 횟수 (자동 계산)
    },
    {
      id: 2,
      rawLabel: "10개입_2",
      groupKey: "10개입",
      displayName: "10개입",
      description: "소규모 패키지",
      price: 2000,
      badge: null,
      imageSrc: "/images/option-10.png",
      sortOrder: 2,
      maxQuantity: 1,
    },
    // ... (8개 모두)
  ],
  
  // 그룹별 설정 (옵션을 그룹화하여 횟수 제한 관리)
  groups: {
    "10개입": { maxCount: 2, displayName: "10개입" },
    "30개입": { maxCount: 2, displayName: "30개입" },
    "50개입": { maxCount: 2, displayName: "50개입" },
    "100개입": { maxCount: 2, displayName: "100개입" },
  },
  
  // 전역 설정
  settings: {
    // 선택 상품 목록 표시
    showSelectedList: true,
    selectedListPosition: "below-cards",  // "above-cards", "below-cards", "modal"
    
    // 총액 표시
    showTotalPrice: true,
    
    // 반응형 설정
    responsiveConfig: {
      pcColumns: 4,         // PC 화면: 4열
      tabletColumns: 3,     // 태블릿: 3열
      mobileColumns: 2,     // 모바일: 2열
      mobileBreakpoint: 768, // 모바일 기준 너비 (px)
    },
  },
};

// 내보내기 (HTML 스크립트 태그로 로드 시)
// window.optionConfig = optionConfig;
```

### 1-2 필드 설명

| 필드명 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | number | ✅ | 옵션의 고유 ID (1부터 시작) |
| `rawLabel` | string | ✅ | **카페24 옵션값** (정확히 일치해야 동기화됨) |
| `groupKey` | string | ✅ | `rawLabel`에서 suffix(`_1`, `_2`) 제거한 그룹명 |
| `displayName` | string | ✅ | 사용자에게 보여줄 표시 이름 |
| `description` | string | ⭕ | 부제목/설명 텍스트 |
| `price` | number | ✅ | 추가금액 (정수, 원 단위) |
| `badge` | string \| null | ⭕ | 뱃지 텍스트 (예: "인기", "추천") |
| `imageSrc` | string \| null | ⭕ | 카드에 표시할 이미지 URL |
| `sortOrder` | number | ⭕ | 카드 표시 순서 (낮을수록 먼저) |
| `maxQuantity` | number | ⭕ | 그룹 내 최대 추가 가능 횟수 (자동 계산) |

**⭕ = 선택사항 (없으면 기본값 사용)**

### 1-3 suffix 기반 그룹핑 규칙

**규칙**: `rawLabel`의 `_숫자` 부분을 제거하여 `groupKey` 생성

```
rawLabel          →  groupKey      maxCount
10개입_1          →  10개입        2 (suffix _1, _2 존재)
10개입_2          →  10개입        2
30개입_1          →  30개입        2 (suffix _1, _2 존재)
30개입_2          →  30개입        2
50개입_1          →  50개입        2 (suffix _1, _2 존재)
50개입_2          →  50개입        2
100개입_1         →  100개입       2 (suffix _1, _2 존재)
100개입_2         →  100개입       2
```

**의사코드**:

```javascript
function parseGroupKey(rawLabel) {
  // 정규식: 마지막의 _숫자 제거
  return rawLabel.replace(/_\d+$/, '');
}

// 그룹별 최대 추가 횟수 계산
function calculateMaxCount(options) {
  const groups = {};
  options.forEach(option => {
    if (!groups[option.groupKey]) {
      groups[option.groupKey] = 0;
    }
    groups[option.groupKey]++;
  });
  return groups;  // { "10개입": 2, "30개입": 2, ... }
}
```

---

## 2. 실제 적용 예시

### 2-1 `optionConfig.js` 파일 전체 예시

```javascript
/**
 * 카페24 커스텀 옵션 UI 설정 파일
 * 
 * 주의:
 * 1. rawLabel은 카페24에 등록한 옵션값과 정확히 일치해야 합니다.
 * 2. price는 카페24 상품 옵션 설정의 "추가금액"과 일치해야 합니다.
 * 3. 이 파일은 UI 표시값 관리만 목적이며, 구매 로직을 대체하지 않습니다.
 */

const optionConfig = {
  options: [
    {
      id: 1,
      rawLabel: "10개입_1",
      groupKey: "10개입",
      displayName: "10개입",
      description: "소규모 사용자용",
      price: 2000,
      badge: "인기",
      imageSrc: "/images/product-option-10.jpg",
      sortOrder: 1,
    },
    {
      id: 2,
      rawLabel: "10개입_2",
      groupKey: "10개입",
      displayName: "10개입",
      description: "소규모 사용자용",
      price: 2000,
      badge: null,
      imageSrc: "/images/product-option-10.jpg",
      sortOrder: 2,
    },
    {
      id: 3,
      rawLabel: "30개입_1",
      groupKey: "30개입",
      displayName: "30개입",
      description: "중규모 사용자용",
      price: 5000,
      badge: "추천",
      imageSrc: "/images/product-option-30.jpg",
      sortOrder: 3,
    },
    {
      id: 4,
      rawLabel: "30개입_2",
      groupKey: "30개입",
      displayName: "30개입",
      description: "중규모 사용자용",
      price: 5000,
      badge: null,
      imageSrc: "/images/product-option-30.jpg",
      sortOrder: 4,
    },
    {
      id: 5,
      rawLabel: "50개입_1",
      groupKey: "50개입",
      displayName: "50개입",
      description: "중규모~대규모 사용자용",
      price: 8000,
      badge: null,
      imageSrc: "/images/product-option-50.jpg",
      sortOrder: 5,
    },
    {
      id: 6,
      rawLabel: "50개입_2",
      groupKey: "50개입",
      displayName: "50개입",
      description: "중규모~대규모 사용자용",
      price: 8000,
      badge: null,
      imageSrc: "/images/product-option-50.jpg",
      sortOrder: 6,
    },
    {
      id: 7,
      rawLabel: "100개입_1",
      groupKey: "100개입",
      displayName: "100개입",
      description: "대규모 사용자용",
      price: 15000,
      badge: "대용량",
      imageSrc: "/images/product-option-100.jpg",
      sortOrder: 7,
    },
    {
      id: 8,
      rawLabel: "100개입_2",
      groupKey: "100개입",
      displayName: "100개입",
      description: "대규모 사용자용",
      price: 15000,
      badge: null,
      imageSrc: "/images/product-option-100.jpg",
      sortOrder: 8,
    },
  ],
  
  groups: {
    "10개입": { maxCount: 2 },
    "30개입": { maxCount: 2 },
    "50개입": { maxCount: 2 },
    "100개입": { maxCount: 2 },
  },
  
  settings: {
    showSelectedList: true,
    selectedListPosition: "below-cards",
    showTotalPrice: true,
    responsiveConfig: {
      pcColumns: 4,
      tabletColumns: 3,
      mobileColumns: 2,
      mobileBreakpoint: 768,
    },
  },
};

// 글로벌 scope에 노출 (HTML script 태그로 로드 시)
// <script src="optionConfig.js"></script> 이후
// CustomOptionUI.init(optionConfig); 호출
```

### 2-2 카페24 옵션값과 매핑 확인

**중요**: `rawLabel`이 카페24에 등록한 옵션값과 정확히 일치해야 동기화가 가능합니다.

```
카페24 상품 옵션 설정에 등록된 값:
┌─────────────┬──────────┐
│ 옵션값 이름 │ 추가금액 │
├─────────────┼──────────┤
│ 10개입_1    │ 2,000원  │
│ 10개입_2    │ 2,000원  │
│ 30개입_1    │ 5,000원  │
│ 30개입_2    │ 5,000원  │
│ 50개입_1    │ 8,000원  │
│ 50개입_2    │ 8,000원  │
│ 100개입_1   │ 15,000원 │
│ 100개입_2   │ 15,000원 │
└─────────────┴──────────┘

이 값들이 optionConfig.js의 rawLabel과 정확히 일치해야 함.
                                ↓
optionConfig의 rawLabel이 카페24 옵션값과 다르면 동기화 실패!
```

---

## 3. 동적 계산 로직

Phase 5에서 실제 구현 시, 아래 로직을 포함하세요:

### 3-1 maxCount 자동 계산

```javascript
function initializeConfig(configData) {
  // groupKey별로 같은 것끼리 묶기
  const groupCounts = {};
  configData.options.forEach(option => {
    if (!groupCounts[option.groupKey]) {
      groupCounts[option.groupKey] = 0;
    }
    groupCounts[option.groupKey]++;
  });
  
  // 각 옵션의 maxCount 설정
  configData.options.forEach(option => {
    option.maxCount = groupCounts[option.groupKey];
  });
  
  // groups 객체도 업데이트
  Object.keys(groupCounts).forEach(groupKey => {
    configData.groups[groupKey] = {
      maxCount: groupCounts[groupKey],
      displayName: groupKey,
    };
  });
  
  return configData;
}

// 사용
const initializedConfig = initializeConfig(optionConfig);
```

### 3-2 옵션값으로부터 가격 조회

```javascript
function getPriceByRawLabel(rawLabel, configData) {
  const option = configData.options.find(o => o.rawLabel === rawLabel);
  return option ? option.price : 0;
}

// 사용
const price = getPriceByRawLabel("10개입_1", optionConfig);  // 2000
```

### 3-3 그룹별 남은 선택 가능 횟수 계산

```javascript
function getRemainingCount(groupKey, selectedOptions, configData) {
  const maxCount = configData.groups[groupKey]?.maxCount || 1;
  
  const currentCount = selectedOptions.filter(optionValue => {
    const option = configData.options.find(o => o.rawLabel === optionValue);
    return option && option.groupKey === groupKey;
  }).length;
  
  return maxCount - currentCount;
}

// 사용
const remaining = getRemainingCount("10개입", ["10개입_1"], optionConfig);  // 1
```

---

## 4. 설정과 카페24 동기화 전략

### 4-1 설정값 변경 시 주의사항

**❌ 하지 말아야 할 것**:
- `rawLabel` 변경 (카페24 옵션값과 불일치 발생)
- `price`를 카페24 추가금액과 다르게 설정 (가격 불일치)
- `groups` 구조 임의 변경 (횟수 제한 로직 오류)

**✅ 해도 되는 것**:
- `displayName`, `description` 변경 (UI 텍스트)
- `badge` 추가/제거 (뱃지 표시)
- `imageSrc` 변경 (이미지 변경)
- `sortOrder` 조정 (카드 순서 변경)
- `settings` 내 반응형 설정 수정 (레이아웃 조정)

### 4-2 검증 체크리스트

Phase 5에서 `optionConfig.js`를 작성할 때:

- [ ] 모든 `rawLabel`이 카페24에 등록한 옵션값과 **정확히 일치**
- [ ] 모든 `price`가 카페24 옵션 설정의 "추가금액"과 **일치**
- [ ] `groupKey`가 `rawLabel`에서 suffix 제거로 **올바르게 생성**
- [ ] `groups` 객체의 `maxCount`가 같은 `groupKey` 옵션 개수와 **일치**
- [ ] `sortOrder`가 1부터 시작하여 **순차적**
- [ ] 모든 필수 필드(`id`, `rawLabel`, `groupKey`, `displayName`, `price`)가 **채워짐**

---

## 5. 관리 용도 범위

### 5-1 이 설정 파일이 하는 것

✅ UI 구성값 관리:
- 카드 제목, 설명, 뱃지 텍스트
- 이미지 URL
- 추가금액 표시값 (하지만 실제 계산은 카페24 기본 로직에 위임)
- 카드 정렬 순서

✅ 횟수 제한 관리:
- 옵션 그룹화 및 그룹별 최대 추가 횟수
- suffix 기반 중복 선택 방지

### 5-2 이 설정 파일이 하지 않는 것

❌ 구매 로직 (기존 카페24 로직 사용):
- 가격 계산의 최종 책임
- 폼 제출 및 결제 처리
- 옵션 유효성 검사 (복합 옵션 조합 등)

❌ 기본 옵션 DOM 조작:
- select/button 요소 재구현
- 기본 옵션 이벤트 대체

---

## 📝 작성 규칙

Phase 5에서 실제 파일 작성 시:

1. **JavaScript 객체 리터럴 형식** (JSON이 아님, 주석 가능)
   ```javascript
   // 주석 가능 (JSON이 아니므로)
   const optionConfig = {
     // ...
   };
   ```

2. **숫자는 따옴표 없음**
   ```javascript
   price: 2000,      // ✅ 올바름
   price: "2000",    // ❌ 문자열 (숫자 계산 시 오류)
   ```

3. **문자열은 따옴표 필수**
   ```javascript
   rawLabel: "10개입_1",  // ✅ 올바름
   ```

4. **배열과 객체 구분**
   ```javascript
   options: [{ ... }, { ... }],  // ✅ 배열 (리스트)
   groups: { "10개입": { ... } }, // ✅ 객체 (매핑)
   ```

---

## 🔄 다음 단계

**Phase 3-4 (구현 단계)**:
1. 이 문서의 스키마를 기반으로 `cafe24/config/optionConfig.js` 파일 작성
2. Phase 2-2의 JavaScript 로직에서 이 설정 데이터를 로드하고 활용
3. 실제 카페24 옵션값과 매핑 확인

**Phase 6 (테스트 단계)**:
1. 옵션값별 가격이 올바른지 확인
2. 횟수 제한이 제대로 작동하는지 확인
3. 카페24 기본 옵션과 동기화되는지 확인

---

**작성 상태**: ✅ 스키마 설계 완료, ⏳ Phase 5에서 실제 파일 작성  
**마지막 수정**: [사용자 작성 일시]
