class Player extends HTMLElement {
  // Shared variables
  static colorLightness = 69;
  static colorChroma = 0.1142;
  static colorHues = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();

    this._name = '';
    this._colorHue = 0;
    this._score = 0;
    this._placeholderName = 'Player Name';
  }

  async loadTemplate() {
    const response = await fetch('./components/player-template.html');
    const templateContent = await response.text();
    const template = document.createElement('template');
    template.innerHTML = templateContent;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.initializeComponent();
  }

  initializeComponent() {

    // set random initial color from array
    const randomIndex = Math.floor(Math.random() * Player.colorHues.length);
    this.colorHue = Player.colorHues[randomIndex];

    // set placeholder name
    this.placeholderName = this.getAttribute('data-placeholder-name') || 'Player Name';

    // add cycle color button
    const colorCycleButton = this.shadowRoot.querySelector(".cycle-color-btn")
    colorCycleButton.addEventListener("pointerup", (event) => { this.cycleColor() });

    // initialize the point button handling
    this.handlePointButtonClicks();

    // initialize the delta slider handling
    this.handleDeltaSlider();

    // hide/show the steppers
    const scoreHistoryEl = this.shadowRoot.querySelector('.score-history');
    scoreHistoryEl.addEventListener('pointerup', (event) => {
      // const steppersEl = this.shadowRoot.querySelector('.steppers');
      const sliderEl = this.shadowRoot.querySelector('.delta-slider');
      const isHidden = sliderEl.hasAttribute('data-hidden');
      if (isHidden)
        sliderEl.removeAttribute('data-hidden');
      else
        sliderEl.setAttribute('data-hidden', '');
    });
  }

  connectedCallback() {
    // Initialization moved to initializeComponent method
  }

  cycleColor() {
    const currentIndex = Player.colorHues.indexOf(Number(this._colorHue));
    // Calculate the next index, wrapping around to the start of the array if necessary
    const nextIndex = (currentIndex + 1) % Player.colorHues.length;
    this.colorHue = Player.colorHues[nextIndex];
  }

  /**
   * @param {number} value
   */
  set score(value) {
    const delta = value - this._score;
    this._score = value;

    const scoreHistoryEl = this.shadowRoot.querySelector('.score-history');
    this.shadowRoot.querySelector('.score').value = this._score;

    // remove current classes from all elements with score class
    const currentScoreEls = scoreHistoryEl.querySelectorAll('.score.current');
    currentScoreEls.forEach((el) => {
      el.classList.remove('current');
    });

    // add current score element to history
    const currentScoreEl = document.createElement('div');
    currentScoreEl.classList.add('score', 'current');
    currentScoreEl.innerText = this._score;
    scoreHistoryEl.appendChild(currentScoreEl);

    // add delta element to previous score
    const deltaEl = document.createElement('div');
    deltaEl.classList.add('delta');
    deltaEl.innerText = delta > 0 ? `+${delta}` : `${delta}`;
    currentScoreEl.appendChild(deltaEl);

    // Scroll to the bottom
    scoreHistoryEl.scrollTop = scoreHistoryEl.scrollHeight;

    // hide steppers
    const steppersEl = this.shadowRoot.querySelector('.steppers');
    if (!steppersEl.hasAttribute('data-hidden')) {
      steppersEl.setAttribute('data-hidden', '');
    }
    
    const sliderEl = this.shadowRoot.querySelector('.delta-slider');
    if (!sliderEl.hasAttribute('data-hidden')) {
      sliderEl.setAttribute('data-hidden', '');
    }
  }

  /**
   * @param {number} value
   */
  set colorHue(value) {
    this._colorHue = value;
    this.style.setProperty('--color-player-lightness', `${Player.colorLightness}%`); // Set the custom property --color-player
    this.style.setProperty('--color-player-chroma', Player.colorChroma); // Set the custom property --color-player
    this.style.setProperty('--color-player-hue', this._colorHue); // Set the custom property --color-player
  }

  /**
   * @param {string} value
   */
  set name(value) {
    this._name = value;
    this.shadowRoot.querySelector('.name').value = this._name;
  }

  /**
   * @param {string} value
   */
  set placeholderName(value) {
    this._placeholderName = value;
    this.shadowRoot.querySelector('.name').placeholder = this._placeholderName;
  }

  handleDeltaSlider() {
    const sliderEl = this.shadowRoot.querySelector('.delta-slider');
    const knobEl = this.shadowRoot.querySelector('.delta-slider-knob');
    const valueEl = this.shadowRoot.querySelector('.delta-slider-value');

    let knobRect;
    let pointerOffset;
    let value = 0;

    knobEl.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      knobEl.setPointerCapture(event.pointerId);
      knobEl.dataset.dragging = "true";

      // determine pointer offset to knob center
      knobRect = knobEl.getBoundingClientRect();
      const knobCenterX = knobRect.left + knobRect.width / 2;
      pointerOffset = event.clientX - knobCenterX;
    });

    knobEl.addEventListener('pointermove', (event) => {
      if (!knobEl.dataset.dragging) return;
      event.preventDefault();

      const sliderRect = sliderEl.getBoundingClientRect();
      const sliderCenterX = sliderRect.left + sliderRect.width / 2;
      const knobMinX = -sliderRect.width / 2 + knobRect.width / 2;
      const knobMaxX = sliderRect.width / 2 - knobRect.width / 2;

      const knobPosition = event.clientX - sliderCenterX - pointerOffset;
      const knobPositionClamped = Math.min(Math.max(knobPosition, knobMinX), knobMaxX);
      event.clientX - sliderCenterX - pointerOffset;
      knobEl.style.setProperty('--offsetX', `${knobPositionClamped}px`);
      value = Number(knobPositionClamped.toFixed(0));
      valueEl.innerText = value;
    });

    knobEl.addEventListener('pointerup', (event) => {
      event.preventDefault();
      knobEl.releasePointerCapture(event.pointerId);
      delete knobEl.dataset.dragging;
      this.adjustScore(value);
    });

    const cancelDragging = (event) => {
      event.preventDefault();
      delete knobEl.dataset.dragging; // Remove data-dragging attribute
    };

    knobEl.addEventListener('pointerleave', cancelDragging);
    knobEl.addEventListener('pointercancel', cancelDragging);
    knobEl.addEventListener('pointerout', cancelDragging);



  }

  handlePointButtonClicks() {
    let clickCount = 0;
    let timeout;
    const changeDelay = 1000; // Delay in milliseconds

    const incrementButton = this.shadowRoot.querySelector('.increment');
    const decrementButton = this.shadowRoot.querySelector('.decrement');

    const handleButtonClick = (type) => {
      clickCount += type === 'increment' ? 1 : -1;
      clearTimeout(timeout);

      // Display click counter with click count
      let clickCounterEl = this.shadowRoot.querySelector('.click-counter');
      let clickCountEl = this.shadowRoot.querySelector('.click-count');
      let progressBar = this.shadowRoot.querySelector('.timeout-progress');

      if (clickCounterEl.hasAttribute('hidden')) {
        clickCounterEl.removeAttribute('hidden');
        clickCounterEl.style.display = 'flex';
      }
      clickCountEl.innerText = clickCount > 0 ? `+${clickCount}` : `${clickCount}`;

      this.restartAnimation(clickCounterEl, 'animate-pop');

      // Reset progress bar
      progressBar.value = 0;
      const startTime = performance.now();
      const updateProgress = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min((elapsed / changeDelay) * 100, 100);
        progressBar.value = progress;

        if (elapsed < changeDelay) {
          requestAnimationFrame(updateProgress);
        }
      };

      requestAnimationFrame(updateProgress);

      // Process accumulated clicks after a short delay
      timeout = setTimeout(() => {
        this.adjustScore(clickCount);
        clickCount = 0;
        this.restartAnimation(clickCounterEl, 'animate-apply');
      }, changeDelay);

      clickCounterEl.addEventListener('animationend', (event) => {
        if (event.animationName === 'apply') {
          clickCounterEl.classList.remove('animate-apply');
          clickCounterEl.setAttribute('hidden', '');
          clickCounterEl.style.display = 'none';

          // Reset attributes applied by the animation
          clickCounterEl.style.transform = '';
          clickCounterEl.style.opacity = '';
        }
      });
    };

    incrementButton.addEventListener('pointerup', () => handleButtonClick('increment'));
    decrementButton.addEventListener('pointerup', () => handleButtonClick('decrement'));
  };

  adjustScore(delta) {
    this.score = this._score + delta;
  }

  restartAnimation(el, className) {
    el.classList.remove(className);
    void el.offsetWidth;  // Trigger reflow
    el.classList.add(className);
  }
}

customElements.define('player-component', Player);
