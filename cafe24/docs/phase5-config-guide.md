# Phase 5: 외부 설정 파일 사용 가이드

## 개요

`cafe24/config/optionConfig.js`는 커스텀 옵션 UI의 모든 설정값을 관리하는 파일입니다. 이 파일을 수정하면 카페24 실제 환경에서 UI의 동작(표시되는 옵션, 가격, 뱃지 등)을 변경할 수 있습니다. **JavaScript 로직(option.js)은 건드릴 필요가 없습니다.**

---

## 파일 구조

```
cafe24/config/optionConfig.js
└── optionConfig (전역 상수)
    ├── options (배열: 8개 옵션값)
    ├── groups (객체: 그룹별 설정)
    └── settings (객체: UI 전역 설정)
```

### 로드 순서 (중요!)

HTML에서 스크립트를 로드할 때 다음 순서를 **반드시** 지켜야 합니다:

```html
<!-- 1번: 설정 파일 먼저 로드 -->
<script src="cafe24/config/optionConfig.js"></script>

<!-- 2번: 로직 파일 다음에 로드 -->
<script src="cafe24/src/option.js"></script>
```

로드 순서가 바뀌면 콘솔에 에러가 나타납니다.

---

## 필드별 설명

### `options` (배열)

8개의 옵션값을 정의합니다. 각 항목은 다음 필드를 가집니다:

| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| `id` | 숫자 | ○ | 고유 ID (참고용) | `1`, `2`, ... `8` |
| `rawLabel` | 문자열 | ○ | **카페24 옵션값 (정확히 일치)** | `"10개입_1"`, `"30개입_2"` |
| `groupKey` | 문자열 | ○ | 옵션 그룹 분류 키 (suffix 제거) | `"10개입"`, `"30개입"` |
| `displayName` | 문자열 | ○ | 사용자에게 표시할 이름 | `"10개입"`, `"30개입"` |
| `description` | 문자열 | ○ | 카드 설명 텍스트 | `"소규모 패키지"` |
| `price` | 숫자 | ○ | 추가 금액 (원) | `2000`, `5000` |
| `badge` | 문자열 또는 null | - | 배지 텍스트 (null이면 미표시) | `"가장 많이 사요"`, `"추천"`, `null` |
| `imageSrc` | 문자열 또는 null | - | 카드 이미지 URL | `"https://..."`, `null` |
| `sortOrder` | 숫자 | ○ | 표시 순서 | `1`, `2`, ... `8` |

**주의:**

- **`rawLabel`은 카페24에서 등록한 옵션값과 정확히 일치**해야 동기화가 정상입니다.
  - 카페24 설정: "10개입_1" → optionConfig: `rawLabel: "10개입_1"` ✓
  - 카페24 설정: "10개입_1" → optionConfig: `rawLabel: "10개입_1번"` ✗ (동기화 안 됨)

- **`groupKey`는 suffix를 제거한 부분**입니다.
  - `rawLabel: "10개입_1"` → `groupKey: "10개입"`
  - `groupKey`는 `groups` 객체의 키와도 일치해야 합니다.

### `groups` (객체)

같은 그룹에 속한 옵션들의 선택 제한을 정의합니다.

```javascript
groups: {
  "10개입": { maxCount: 2 },  // 10개입 그룹: 최대 2가지 선택
  "30개입": { maxCount: 2 },  // 30개입 그룹: 최대 2가지 선택
  "50개입": { maxCount: 2 },
  "100개입": { maxCount: 2 },
}
```

**`maxCount` 의미:**

- `maxCount: 2` → "10개입_1" 과 "10개입_2"를 모두 선택 가능 (최대 2가지)
- `maxCount: 3` → 최대 3가지까지 선택 가능 (그룹 내 suffix가 3개 이상 있는 경우)
- 초과 선택 시: "10개입은(는) 최대 2개까지만 추가 가능합니다" 경고 표시

**현재 설정:**

모든 그룹이 `maxCount: 2`이므로, 각 그룹마다 2가지씩 선택 가능합니다.

### `settings` (객체)

UI 전역 설정입니다.

```javascript
settings: {
  showSelectedList: true,   // 선택한 상품 목록 섹션 표시
  showTotalPrice: true,     // 합계 금액 표시
}
```

현재는 항상 `true`로 설정되어 있습니다. (향후 확장용)

---

## 수정 방법

### 1. 기존 옵션 정보 변경

예: "10개입_1"의 가격을 2000원에서 2500원으로 변경

```javascript
{
  id: 1,
  rawLabel: "10개입_1",
  groupKey: "10개입",
  displayName: "10개입",
  description: "소규모 패키지",
  price: 2500,  // ← 수정: 2000 → 2500
  badge: "가장 많이 사요",
  imageSrc: null,
  sortOrder: 1,
}
```

변경 후 페이지를 새로고침하면 즉시 반영됩니다.

### 2. 배지 추가/제거

예: "30개입_2"에 배지 추가

```javascript
{
  id: 4,
  rawLabel: "30개입_2",
  groupKey: "30개입",
  displayName: "30개입",
  description: "중규모 패키지",
  price: 5000,
  badge: "한정 판매",  // ← 추가: null → "한정 판매"
  imageSrc: null,
  sortOrder: 4,
}
```

### 3. 이미지 추가

예: "50개입_1"에 이미지 추가

```javascript
{
  id: 5,
  rawLabel: "50개입_1",
  groupKey: "50개입",
  displayName: "50개입",
  description: "중규모~대규모 패키지",
  price: 8000,
  badge: null,
  imageSrc: "https://example.com/product-50.jpg",  // ← 추가
  sortOrder: 5,
}
```

### 4. 새로운 개입수 옵션 추가

예: "200개입" 옵션 추가 (2가지, _1과 _2)

**Step 1: `options` 배열에 2개 항목 추가**

```javascript
{
  id: 9,
  rawLabel: "200개입_1",
  groupKey: "200개입",
  displayName: "200개입",
  description: "초대형 패키지",
  price: 25000,
  badge: "신규",
  imageSrc: null,
  sortOrder: 9,
},
{
  id: 10,
  rawLabel: "200개입_2",
  groupKey: "200개입",
  displayName: "200개입",
  description: "초대형 패키지",
  price: 25000,
  badge: null,
  imageSrc: null,
  sortOrder: 10,
}
```

**Step 2: `groups` 객체에 항목 추가**

```javascript
groups: {
  "10개입": { maxCount: 2 },
  "30개입": { maxCount: 2 },
  "50개입": { maxCount: 2 },
  "100개입": { maxCount: 2 },
  "200개입": { maxCount: 2 },  // ← 추가
}
```

**Step 3: 카페24에서도 옵션 등록**

카페24 상품 설정에서 "200개입_1", "200개입_2" 옵션을 동일하게 등록해야 동기화됩니다.

### 5. 선택 제한 변경

예: "50개입" 그룹의 최대 선택 개수를 2개에서 1개로 변경

```javascript
groups: {
  "10개입": { maxCount: 2 },
  "30개입": { maxCount: 2 },
  "50개입": { maxCount: 1 },  // ← 수정: 2 → 1
  "100개입": { maxCount: 2 },
}
```

변경 후: "50개입_1" 선택 시, "50개입_2"는 비활성화되고 "최대 1개까지만" 경고 표시

---

## 주의사항

### ⚠️ 가장 중요한 규칙

1. **`rawLabel` ↔ 카페24 옵션값 일치**
   - 카페24에 등록된 옵션값과 정확히 같아야 함
   - 대소문자, 공백, 특수문자까지 모두 일치해야 함
   - 불일치 시: 커스텀 UI와 기본 옵션이 동기화 안 될 수 있음

2. **`groupKey` ↔ suffix 일치**
   - `rawLabel: "10개입_1"` 이면 `groupKey: "10개입"`
   - suffix(_1, _2)를 제거한 부분을 `groupKey`로 사용
   - 불일치 시: 횟수 제한 로직이 제대로 동작 안 할 수 있음

3. **`groupKey` ↔ `groups` 키 일치**
   - `groupKey: "50개입"`이면 `groups["50개입"]` 항목이 있어야 함
   - 없으면: `maxCount` 설정이 무시되고, 대신 `options` 배열에서 같은 `groupKey` 개수가 사용됨

4. **`maxCount` ↔ 실제 suffix 개수**
   - `groupKey: "10개입"`인 옵션이 _1, _2 두 개인데 `maxCount: 3`이면?
   - 결과: 실제로는 2개까지만 선택 가능 (suffix가 3개 없으므로)

5. **JSON 문법 오류 금지**
   - 객체 끝에 쉼표 누락: `{ id: 1, ... },` ← 필요한 경우만
   - 따옴표 누락: `rawLabel "10개입_1"` ✗ → `rawLabel: "10개입_1"` ✓
   - 문법 오류 시: 전체 UI가 표시 안 될 수 있음 (콘솔 에러 확인)

### ⚠️ 피해야 할 변경

- ❌ `rawLabel` 임의로 변경 (카페24 옵션값 확인 후 변경)
- ❌ `id` 중복 (고유해야 함)
- ❌ `options` 배열에서 항목만 지우고 `groups`는 안 지움 (양쪽 모두 정리)
- ❌ JSON 문법 오류 (파일을 다시 로드할 때까지 UI 동작 안 함)

---

## 검증 방법

### 1. 파일 로드 확인

브라우저 개발자 도구(F12) 콘솔 탭을 열고 `preview.html` 페이지에서:

```javascript
console.log(optionConfig);  // 콘솔에서 직접 입력
```

결과: optionConfig 객체의 모든 필드가 표시되어야 함 ✓

### 2. 로드 순서 오류 확인

콘솔에 다음 메시지가 있으면 로드 순서가 잘못된 것입니다:

```
[CustomOptionUI] 초기화 실패: optionConfig가 정의되지 않았습니다.
원인: cafe24/config/optionConfig.js가 로드되지 않았거나 option.js보다 먼저 로드되지 않았습니다.
```

**해결:** HTML의 `<script>` 태그 순서를 다시 확인하세요.

### 3. groups 값 적용 확인

`cafe24/config/optionConfig.js`에서 임시로:

```javascript
groups: {
  "10개입": { maxCount: 1 },  // ← 임시로 1로 변경
  ...
}
```

저장 후 `preview.html` 새로고침, "10개입_1" 선택 → "10개입_2" 클릭 시 "최대 1개까지만" 경고가 뜨는지 확인

확인되면 다시 `maxCount: 2`로 원복하세요.

---

## 자주 묻는 질문 (FAQ)

**Q: 가격을 실수로 문자열로 입력했습니다. 예: `price: "2000"`**  
A: `price`는 **숫자**여야 합니다. `price: 2000` (따옴표 없음)으로 수정하세요.

**Q: 옵션을 추가했는데 카드가 안 나타납니다.**  
A: 카페24 옵션 설정과 `rawLabel`이 일치하는지 확인하세요. 또한 콘솔에서 `optionConfig.options.length`를 입력해 정말 로드됐는지 확인하세요.

**Q: "최대 개수까지만 추가 가능" 경고가 안 나타납니다.**  
A: `groups[groupKey].maxCount`가 실제 suffix 개수보다 작은지 확인하세요. 예: `maxCount: 3`이지만 _1, _2만 있으면 실제로는 2개까지만 선택 가능합니다.

**Q: 이미지를 추가했는데 안 보입니다.**  
A: 이미지 URL이 올바른지, 그리고 CORS 정책 때문에 로드가 차단되지는 않는지 확인하세요. 개발자 도구(F12) Network 탭에서 이미지 요청을 확인할 수 있습니다.

---

## 다음 단계 (Phase 6)

이 설정 파일을 카페24 실 환경(스마트디자인)에 업로드하고, 실제 동작을 검증하는 단계입니다. 설정값 변경 방법은 이 가이드와 동일합니다.
