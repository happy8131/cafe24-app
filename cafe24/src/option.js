/**
 * 카페24 커스텀 옵션 UI - JavaScript 로직
 *
 * 역할:
 * 1. 카드를 config 데이터로부터 동적 렌더링
 * 2. 선택 이벤트 처리 (중복방지, 횟수제한)
 * 3. 선택 상품 목록 동기화 및 금액 계산
 * 4. 토스트 알림 및 상태 표시
 *
 * 주의: optionConfig는 cafe24/config/optionConfig.js에서 로드됩니다.
 *       이 스크립트보다 먼저 로드되어야 합니다.
 */

// ====================================
// CustomOptionUI 모듈 (메인 로직)
// ====================================

const CustomOptionUI = {
  config: {}, // optionConfig가 init()에서 로드됨

  state: {
    selectedItems: [], // { rawLabel, groupKey, price, quantity: 1 }
  },

  // ----
  // 초기화
  // ----

  init() {
    if (typeof optionConfig === 'undefined') {
      console.error(
        '[CustomOptionUI] 초기화 실패: optionConfig가 정의되지 않았습니다.\n' +
        '원인: cafe24/config/optionConfig.js가 로드되지 않았거나 option.js보다 먼저 로드되지 않았습니다.\n' +
        '해결방법: HTML에서 스크립트 로드 순서를 확인하세요:\n' +
        '  <script src="cafe24/config/optionConfig.js"></script>\n' +
        '  <script src="cafe24/src/option.js"></script>'
      );
      return;
    }

    this.config = optionConfig;
    this.state.selectedItems = [];
    this.renderCards();
    this.attachEventListeners();
    console.log('[CustomOptionUI] Initialized', { optionCount: this.config.options.length });
  },

  // ----
  // 카드 렌더링
  // ----

  renderCards() {
    const cardList = document.getElementById('card-list');
    if (!cardList) {
      console.error('[CustomOptionUI] #card-list 요소를 찾을 수 없습니다');
      return;
    }

    cardList.innerHTML = '';

    this.config.options.forEach((option) => {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.setAttribute('data-option-value', option.rawLabel);
      card.setAttribute('data-group-key', option.groupKey);

      card.innerHTML = `
        <div class="card-image" style="background-color: #f5f5f5;">
          ${option.imageSrc ? `<img src="${option.imageSrc}" alt="${option.displayName}">` : '<span style="color: #999; font-size: 12px;">상품 이미지</span>'}
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

      card.addEventListener('click', () => this.onCardClick(option.rawLabel, option.groupKey));
      cardList.appendChild(card);
    });
  },

  // ----
  // 카드 클릭 핸들러
  // ----

  onCardClick(rawLabel, groupKey) {
    // 1. 중복 체크
    if (this.preventDuplicate(rawLabel)) {
      this.showToast('이미 선택한 옵션입니다', 'warning');
      return;
    }

    // 2. 횟수 제한 체크
    if (!this.enforceLimit(groupKey)) {
      const maxCount = this.getMaxCount(groupKey);
      this.showToast(
        `${groupKey}은(는) 최대 ${maxCount}개까지만 추가 가능합니다`,
        'warning'
      );
      return;
    }

    // 3. 옵션 추가
    this.addSelectedOption(rawLabel);

    // 4. UI 갱신
    this.updateSelectedList();
    this.recalculateTotal();
    this.updateCardStates();

    // 5. 토스트 표시
    const option = this.config.options.find(o => o.rawLabel === rawLabel);
    if (option) {
      this.showToast(`${option.displayName} 선택됨`, 'success');
    }

    // 6. 기본 옵션 동기화 시도 (실 카페24 DOM 있을 때만 동작)
    this.syncToDefaultOption(rawLabel);
  },

  // ----
  // 유효성 검사
  // ----

  preventDuplicate(rawLabel) {
    return this.state.selectedItems.some(item => item.rawLabel === rawLabel);
  },

  enforceLimit(groupKey) {
    const maxCount = this.getMaxCount(groupKey);
    const currentCount = this.state.selectedItems.filter(item => item.groupKey === groupKey).length;
    return currentCount < maxCount;
  },

  getMaxCount(groupKey) {
    if (this.config.groups && this.config.groups[groupKey]?.maxCount) {
      return this.config.groups[groupKey].maxCount;
    }

    return this.config.options.filter(o => o.groupKey === groupKey).length;
  },

  // ----
  // 선택 항목 관리
  // ----

  addSelectedOption(rawLabel) {
    const option = this.config.options.find(o => o.rawLabel === rawLabel);
    if (!option) return;

    this.state.selectedItems.push({
      rawLabel: option.rawLabel,
      groupKey: option.groupKey,
      displayName: option.displayName,
      price: option.price,
      quantity: 1,
    });
  },

  removeSelectedOption(rawLabel) {
    this.state.selectedItems = this.state.selectedItems.filter(
      item => item.rawLabel !== rawLabel
    );

    this.updateSelectedList();
    this.recalculateTotal();
    this.updateCardStates();
  },

  // ----
  // UI 갱신
  // ----

  updateSelectedList() {
    const selectedItems = document.getElementById('selected-items');
    if (!selectedItems) return;

    selectedItems.innerHTML = '';

    this.state.selectedItems.forEach((item) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'selected-item';
      itemDiv.setAttribute('data-option-value', item.rawLabel);

      itemDiv.innerHTML = `
        <span class="selected-name">${item.displayName}</span>
        <span class="selected-price">+${item.price.toLocaleString()}원</span>
        <div class="selected-quantity">
          <button type="button" class="qty-down" data-option-value="${item.rawLabel}">−</button>
          <input type="number" value="${item.quantity}" min="1" readonly class="qty-input">
          <button type="button" class="qty-up" data-option-value="${item.rawLabel}">+</button>
        </div>
        <button type="button" class="selected-remove" data-option-value="${item.rawLabel}">삭제</button>
      `;

      // 수량 증감 버튼 이벤트
      itemDiv.querySelector('.qty-down').addEventListener('click', (e) => {
        e.stopPropagation();
        this.updateQuantity(item.rawLabel, -1);
      });

      itemDiv.querySelector('.qty-up').addEventListener('click', (e) => {
        e.stopPropagation();
        this.updateQuantity(item.rawLabel, 1);
      });

      // 삭제 버튼 이벤트
      itemDiv.querySelector('.selected-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeSelectedOption(item.rawLabel);
      });

      selectedItems.appendChild(itemDiv);
    });
  },

  updateQuantity(rawLabel, delta) {
    const item = this.state.selectedItems.find(i => i.rawLabel === rawLabel);
    if (!item) return;

    item.quantity = Math.max(1, item.quantity + delta);
    this.updateSelectedList();
    this.recalculateTotal();
  },

  recalculateTotal() {
    let total = 0;

    this.state.selectedItems.forEach((item) => {
      total += item.price * item.quantity;
    });

    const totalPriceEl = document.getElementById('total-price');
    if (totalPriceEl) {
      totalPriceEl.textContent = total > 0 ? `+${total.toLocaleString()}원` : '0원';
    }
  },

  updateCardStates() {
    document.querySelectorAll('.card-item').forEach((card) => {
      const rawLabel = card.getAttribute('data-option-value');
      const groupKey = card.getAttribute('data-group-key');
      const isSelected = this.state.selectedItems.some(item => item.rawLabel === rawLabel);
      const groupFull = !this.enforceLimit(groupKey);

      if (isSelected) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }

      if (groupFull && !isSelected) {
        card.classList.add('disabled');
      } else {
        card.classList.remove('disabled');
      }
    });
  },

  // ----
  // 기본 옵션 동기화 (카페24 실 DOM 전제)
  // ----

  syncToDefaultOption(rawLabel) {
    const defaultSelect = document.querySelector('.xans-product-option select');
    if (defaultSelect) {
      defaultSelect.value = rawLabel;
      defaultSelect.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    const defaultButton = document.querySelector(`.xans-product-option [data-option-value="${rawLabel}"]`);
    if (defaultButton) {
      defaultButton.dispatchEvent(new Event('click', { bubbles: true }));
      return;
    }
  },

  syncFromDefaultOption() {
    const defaultSelect = document.querySelector('.xans-product-option select');
    if (!defaultSelect) {
      return;
    }

    const currentValue = defaultSelect.value;
    if (!currentValue) return;

    const card = document.querySelector(`[data-option-value="${currentValue}"]`);
    if (card) {
      card.classList.add('selected');
    }

    if (!this.state.selectedItems.some(item => item.rawLabel === currentValue)) {
      this.addSelectedOption(currentValue);
      this.updateSelectedList();
      this.recalculateTotal();
    }
  },

  // ----
  // 토스트 알림
  // ----

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  // ----
  // 이벤트 리스너 등록
  // ----

  attachEventListeners() {
    // 기본 옵션 변경 감지 (양방향 동기화용, 실 카페24 환경)
    // select 방식: change 이벤트 감지
    const defaultSelect = document.querySelector('.xans-product-option select');
    if (defaultSelect) {
      defaultSelect.addEventListener('change', () => this.syncFromDefaultOption());
    }

    // 텍스트버튼 방식: click 이벤트 감지 (data-option-value 속성을 가진 모든 버튼)
    const defaultButtons = document.querySelectorAll('.xans-product-option [data-option-value]');
    defaultButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const selectedValue = btn.getAttribute('data-option-value');
        if (selectedValue && !this.state.selectedItems.some(item => item.rawLabel === selectedValue)) {
          this.addSelectedOption(selectedValue);
          this.updateSelectedList();
          this.recalculateTotal();
          this.updateCardStates();
        }
      });
    });
  },
};

// ====================================
// 페이지 로드 시 초기화
// ====================================

document.addEventListener('DOMContentLoaded', () => {
  CustomOptionUI.init();
});
