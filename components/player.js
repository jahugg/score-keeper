class Player extends HTMLElement {
  // Shared variables
  static colorChroma = 0.1142;
  static colorLightness = 69;
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
    colorCycleButton.addEventListener("click", (event) => { this.cycleColor() });

    const updateInputWidth = (input) => {
      input.style.width = `${input.value.length + 1}ch`;
    };

    const resizeInputs = (inputs) => {
      inputs.forEach(input => {
        updateInputWidth(input);

        input.addEventListener('input', () => {
          updateInputWidth(input);
        });
      });
    };

    const nameInputs = this.shadowRoot.querySelectorAll('.name');
    const pointsInputs = this.shadowRoot.querySelectorAll('.score');

    resizeInputs(nameInputs);
    resizeInputs(pointsInputs);

    // initialize the point button handling
    this.handlePointButtonClicks();
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
    console.log(delta);
    this._score = value;
    this.shadowRoot.querySelector('.score').value = this._score;

    // create a new dom element displaying the delta value
    const deltaEl = document.createElement('div');
    deltaEl.classList.add('delta');
    deltaEl.innerText = delta > 0 ? `+${delta}` : `${delta}`;
    
    const scoreHistoryEl = this.shadowRoot.querySelector('.score-history');
    scoreHistoryEl.appendChild(deltaEl);
  }

  /**
   * @param {number} value
   */
  set colorHue(value) {
    this._colorHue = value;
    let oklchColor = `oklch(${Player.colorLightness}% ${Player.colorChroma} ${this._colorHue})`;
    this.style.setProperty('--color', oklchColor); // Set the custom property --color
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
