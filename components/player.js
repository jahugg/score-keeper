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

  set score(value) {
    this._score = value;
    this.shadowRoot.querySelector('.score').value = this._score;
  }

  set colorHue(value) {
    this._colorHue = value;
    let oklchColor = `oklch(${Player.colorLightness}% ${Player.colorChroma} ${this._colorHue})`;
    this.style.setProperty('--color', oklchColor); // Set the custom property --color
  }

  set name(value) {
    this._name = value;
    this.shadowRoot.querySelector('.name').value = this._name;
  }

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

    const updateInputWidth = (input) => {
      input.style.width = `${input.value.length + 1}ch`;
    };

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
        const numberInput = this.shadowRoot.querySelector('.score');
        numberInput.value = parseInt(numberInput.value) + clickCount;
        updateInputWidth(numberInput);
        clickCount = 0;
        clickCounterEl.setAttribute('hidden', '');
        clickCounterEl.style.display = 'none';
      }, changeDelay);
    };

    incrementButton.addEventListener('pointerup', () => handleButtonClick('increment'));
    decrementButton.addEventListener('pointerup', () => handleButtonClick('decrement'));
  };
}

customElements.define('player-component', Player);
