/**
 * 카페24 커스텀 옵션 UI - 외부 설정 데이터
 *
 * 이 파일은 option.js보다 먼저 로드되어야 합니다:
 *   <script src="cafe24/config/optionConfig.js"></script>
 *   <script src="cafe24/src/option.js"></script>
 *
 * =====================================
 * 필드 설명
 * =====================================
 *
 * options[].id
 *   - 고유 ID (참고용, 필수 아님)
 *
 * options[].rawLabel
 *   - 카페24에서 등록한 옵션값 그대로
 *   - 예: "10개입_1", "30개입_2"
 *   - 수정 시: 카페24 옵션 설정과 정확히 일치해야 함 (동기화 안 될 수 있음)
 *
 * options[].groupKey
 *   - 같은 그룹에 속한 옵션들의 분류 키
 *   - suffix(_1, _2) 앞부분과 일치해야 함
 *   - 예: rawLabel="10개입_1" → groupKey="10개입"
 *   - groups 객체의 키와도 일치해야 함
 *
 * options[].displayName
 *   - 사용자에게 보여줄 옵션 이름
 *   - 예: "10개입", "30개입"
 *
 * options[].description
 *   - 카드 하단에 표시할 설명 텍스트
 *   - 예: "소규모 패키지", "중규모 패키지"
 *
 * options[].price
 *   - 이 옵션 선택 시 추가되는 금액 (숫자)
 *   - 예: 2000, 5000, 8000
 *   - 합계 계산에 반영됨
 *
 * options[].badge
 *   - 카드 상단 우측에 표시할 배지 텍스트 (optional)
 *   - 예: "가장 많이 사요", "추천", "최대할인"
 *   - null이면 배지 미표시
 *
 * options[].imageSrc
 *   - 카드 이미지 URL (선택사항)
 *   - null이면 "상품 이미지" placeholder 표시
 *
 * options[].sortOrder
 *   - 카드 표시 순서 (참고용)
 *   - 1부터 8까지
 *
 * groups[groupKey].maxCount
 *   - 같은 groupKey를 가진 옵션들을 최대 몇 개까지 중복 추가할 수 있는지
 *   - 현재: 모든 그룹 maxCount=2 (각 그룹마다 최대 2가지 옵션 선택 가능)
 *   - 예: "10개입_1" + "10개입_2" 모두 선택 가능 (최대 2개)
 *   - 하나 더 클릭하려 하면: "10개입은(는) 최대 2개까지만 추가 가능합니다" 경고
 *   - 주의: maxCount > 실제 suffix 개수(예: maxCount=3이지만 _1, _2만 있음) → 실제로는 2개만 선택 가능
 *
 * settings.showSelectedList
 *   - 선택한 상품 목록 섹션 표시 여부 (현재 항상 표시)
 *
 * settings.showTotalPrice
 *   - 합계 금액 표시 여부 (현재 항상 표시)
 *
 * =====================================
 * 옵션 추가/삭제 방법
 * =====================================
 *
 * 새로운 개입수 추가 예시 (200개입 추가):
 *   1. options 배열에 두 항목 추가:
 *      {
 *        id: 9,
 *        rawLabel: "200개입_1",
 *        groupKey: "200개입",
 *        displayName: "200개입",
 *        description: "초대형 패키지",
 *        price: 25000,
 *        badge: null,
 *        imageSrc: "../img/image.png",
 *        sortOrder: 9,
 *      },
 *      {
 *        id: 10,
 *        rawLabel: "200개입_2",
 *        groupKey: "200개입",
 *        ...
 *      }
 *   2. groups 객체에 항목 추가:
 *      "200개입": { maxCount: 2 }
 *   3. 카페24에서도 같은 옵션값("200개입_1", "200개입_2")을 등록해야 동기화됨
 *
 * =====================================
 * 주의사항
 * =====================================
 *
 * • rawLabel ↔ groupKey 불일치
 *   - 예: rawLabel="30개입_1"이지만 groupKey="30개" (suffix 누락)
 *   - 결과: 횟수 제한 로직이 제대로 동작 안 할 수 있음
 *
 * • groupKey ↔ groups 키 불일치
 *   - 예: groupKey="50개입"이지만 groups에는 "50개입" 항목이 없음
 *   - 결과: maxCount 설정이 무시되고, 대신 options 배열에서 같은 groupKey 개수가 최대치로 사용됨
 *
 * • maxCount > 실제 suffix 개수
 *   - 예: groupKey="10개입"인 options는 _1, _2 두 개인데 maxCount=3
 *   - 결과: 실제로는 2개까지만 선택 가능함 (suffix가 없으므로)
 *
 * • 카페24 옵션값과 rawLabel 불일치
 *   - 결과: 카페24 기본 옵션과 동기화 안 될 수 있음
 *
 */

const optionConfig = {
  options: [
    {
      id: 1,
      rawLabel: "10개입_1",
      groupKey: "10개입",
      displayName: "10개입",
      description: "소규모 패키지",
      price: 2000,
      badge: "가장 많이 사요",
      imageSrc: "../img/image.png",
      sortOrder: 1,
    },
    {
      id: 2,
      rawLabel: "10개입_2",
      groupKey: "10개입",
      displayName: "10개입",
      description: "소규모 패키지",
      price: 2000,
      badge: null,
      imageSrc: "../img/image.png",
      sortOrder: 2,
    },
    {
      id: 3,
      rawLabel: "30개입_1",
      groupKey: "30개입",
      displayName: "30개입",
      description: "중규모 패키지",
      price: 5000,
      badge: "추천",
      imageSrc: "../img/image.png",
      sortOrder: 3,
    },
    {
      id: 4,
      rawLabel: "30개입_2",
      groupKey: "30개입",
      displayName: "30개입",
      description: "중규모 패키지",
      price: 5000,
      badge: null,
      imageSrc: "../img/image.png",
      sortOrder: 4,
    },
    {
      id: 5,
      rawLabel: "50개입_1",
      groupKey: "50개입",
      displayName: "50개입",
      description: "중규모~대규모 패키지",
      price: 8000,
      badge: null,
      imageSrc: "../img/image.png",
      sortOrder: 5,
    },
    {
      id: 6,
      rawLabel: "50개입_2",
      groupKey: "50개입",
      displayName: "50개입",
      description: "중규모~대규모 패키지",
      price: 8000,
      badge: null,
      imageSrc: "../img/image.png",
      sortOrder: 6,
    },
    {
      id: 7,
      rawLabel: "100개입_1",
      groupKey: "100개입",
      displayName: "100개입",
      description: "대규모 패키지",
      price: 15000,
      badge: "최대할인",
      imageSrc: "../img/image.png",
      sortOrder: 7,
    },
    {
      id: 8,
      rawLabel: "100개입_2",
      groupKey: "100개입",
      displayName: "100개입",
      description: "대규모 패키지",
      price: 15000,
      badge: null,
      imageSrc: "../img/image.png",
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
    showTotalPrice: true,
  },
};
