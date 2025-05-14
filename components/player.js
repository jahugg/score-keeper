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

    // initialize score knob handling
    this.handleKnobRotation();

    const knobContainerEl = this.shadowRoot.querySelector('.knob-container');
    knobContainerEl.addEventListener("pointerup", (event) => {
      const isContainer = event.target.classList.contains('knob-container')
      if (isContainer) {
        knobContainerEl.setAttribute('data-hidden', '');
      }
    });

    // hide/show the knob
    const scoreHistoryEl = this.shadowRoot.querySelector('.score-history');
    scoreHistoryEl.addEventListener('pointerup', (event) => {

      // only proceed and show if the clicked item is the current score
      if (!event.target.classList.contains('current')) return;

      const knobContainerEl = this.shadowRoot.querySelector('.knob-container');
      const isHidden = knobContainerEl.hasAttribute('data-hidden');
      if (isHidden)
        knobContainerEl.removeAttribute('data-hidden');
      else
        knobContainerEl.setAttribute('data-hidden', '');
    });

    // Add event listener for scroll to update pagination dots
    scoreHistoryEl.addEventListener('scroll', this.updatePaginationDots.bind(this), { passive: true });

    // Add event listener for undo button
    const undoEl = this.shadowRoot.querySelector('button.undo');
    undoEl.addEventListener('pointerup', (event) => {
      const scoreHistoryEl = this.shadowRoot.querySelector('.score-history');
      const currentScoreEl = scoreHistoryEl.querySelector('.score.current');

      if (!currentScoreEl) return; // Exit if no current score element exists

      // Move the undo button element from the current score element to the delta element of the previous score
      const undoEl = this.shadowRoot.querySelector('button.undo');
      const previousScoreEl = currentScoreEl.previousElementSibling;
      const previousDeltaEl = previousScoreEl.querySelector('.delta');
      previousDeltaEl.appendChild(undoEl);

      // Remove the current score element
      scoreHistoryEl.removeChild(currentScoreEl);

      // Update the score by subtracting the last delta
      const deltaEl = currentScoreEl.querySelector('.delta .value');
      if (deltaEl) {
        const delta = parseInt(deltaEl.innerText, 10);
        this._score -= delta;
        this.shadowRoot.querySelector('.score').value = this._score;
      }

      // Set the last score element as the new current
      const lastScoreEl = scoreHistoryEl.querySelector('.score:last-child');
      if (lastScoreEl) {
        lastScoreEl.classList.add('current');
      }

      // Remove the last pagination dot
      const paginationContainerEl = this.shadowRoot.querySelector('.pagination');
      const lastDot = paginationContainerEl.querySelector('li:last-child');
      if (lastDot) {
        paginationContainerEl.removeChild(lastDot);
      }
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

    if (delta === 0) return; // Ignore zero values

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

    // add delta element to score
    const deltaEl = document.createElement('div');
    deltaEl.classList.add('delta');
    const valueEl = document.createElement('div');
    valueEl.classList.add('value');
    valueEl.innerText = delta > 0 ? `+${delta}` : `${delta}`;
    deltaEl.appendChild(valueEl);

    const undoEl = this.shadowRoot.querySelector('button.undo')
    deltaEl.appendChild(undoEl);

    currentScoreEl.appendChild(deltaEl);

    // Scroll to the bottom
    scoreHistoryEl.scrollTop = scoreHistoryEl.scrollHeight;

    // update pagination
    const paginationContainerEl = this.shadowRoot.querySelector('.pagination');
    const paginationDots = this.shadowRoot.querySelectorAll(".pagination li");
    // remove active attribute of all dots
    for (const dot of paginationDots)
      delete dot.dataset.active;

    const paginationEl = document.createElement("li");
    paginationEl.dataset.active = "true";
    paginationContainerEl.appendChild(paginationEl);

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

  handleKnobRotation() {
    const knob = this.shadowRoot.querySelector('.knob-container .knob');
    const valueDisplay = this.shadowRoot.querySelector('.knob-container .value');
    const container = this.shadowRoot.querySelector('.knob-container');

    let value = 0;
    let angleSum = 0;
    let lastAngle = null;
    let lastTime = null;
    let isDragging = false;
    let rotation = 0;

    let startTime = null; // Shared variable for progress bar animation start time
    let progressBarAnimationFrame = null; // Shared variable to track the animation frame

    const center = () => {
      const rect = knob.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    };

    const getAngle = (x, y) => {
      const c = center();
      return Math.atan2(y - c.y, x - c.x) * (180 / Math.PI);
    };

    const normalizeDelta = (delta) => {
      if (delta > 180) return delta - 360;
      if (delta < -180) return delta + 360;
      return delta;
    };

    const update = (angleDelta) => {
      const now = performance.now();
      let deltaTime = now - lastTime;
      lastTime = now;

      deltaTime = Math.max(deltaTime, 8); // minimum for flicks

      const velocity = Math.abs(angleDelta) / deltaTime;

      // Adjust acceleration based on velocity
      const acceleration = velocity < 1
        ? .5 // Slow movements change value half as fast
        : Math.min(1 + velocity * 25, 6); // Faster changes increase slightly faster

      angleSum += angleDelta * acceleration;

      const stepSize = 10;
      const steps = Math.floor(angleSum / stepSize);
      if (steps !== 0) {
        value += steps;
        angleSum -= steps * stepSize;

        // Prepend "+" if value is positive
        valueDisplay.textContent = value > 0 ? `+${value}` : `${value}`;
      }

      rotation += angleDelta;
      knob.style.transform = `rotate(${rotation}deg)`;
    };

    const pointerDown = (e) => {
      isDragging = true;
      const { clientX, clientY } = e;
      lastAngle = getAngle(clientX, clientY);
      lastTime = performance.now();
      knob.setPointerCapture(e.pointerId);
    };

    const pointerMove = (e) => {
      if (!isDragging) return;
      const { clientX, clientY } = e;
      const angle = getAngle(clientX, clientY);
      const delta = normalizeDelta(angle - lastAngle);
      update(delta);
      lastAngle = angle;

      // Cancel and reset the progress bar
      let progressBar = this.shadowRoot.querySelector('.timeout-progress');
      progressBar.value = 0;

      // Cancel the progress bar animation if it is running
      if (progressBarAnimationFrame) {
        cancelAnimationFrame(progressBarAnimationFrame);
        progressBarAnimationFrame = null;
      }

      // Reset the start time of the progress bar animation
      startTime = performance.now();
    };

    const pointerUp = () => {
      isDragging = false;
      const changeDelay = 1500; // Delay in milliseconds

      // Animate progress bar
      let progressBar = this.shadowRoot.querySelector('.timeout-progress');
      progressBar.value = 0;
      startTime = performance.now(); // Initialize start time
      const updateProgress = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min((elapsed / changeDelay) * 100, 100);
        progressBar.value = progress;

        if (elapsed < changeDelay) {
          progressBarAnimationFrame = requestAnimationFrame(updateProgress);
        } else {
          this.adjustScore(value);
          progressBar.value = 0;

          // Reset knob rotation and value
          rotation = 0;
          value = 0;
          knob.style.transform = `rotate(${rotation}deg)`;
          valueDisplay.textContent = value;

          // Hide the knob container
          container.setAttribute('data-hidden', '');
          progressBarAnimationFrame = null; // Clear the animation frame reference
        }
      };

      progressBarAnimationFrame = requestAnimationFrame(updateProgress);
    };

    knob.addEventListener('pointerdown', pointerDown);
    knob.addEventListener('pointermove', pointerMove);
    knob.addEventListener('pointerup', pointerUp);
    knob.addEventListener('pointercancel', pointerUp);
  }

  // Function to update pagination dots
  updatePaginationDots() {
    const scoreHistoryEl = this.shadowRoot.querySelector('.score-history');
    const scores = Array.from(scoreHistoryEl.querySelectorAll('.score'));
    const paginationDots = Array.from(this.shadowRoot.querySelectorAll('.pagination li'));

    const activeIndex = scores.findIndex((score) => {
      const rect = score.getBoundingClientRect();
      const parentRect = scoreHistoryEl.getBoundingClientRect();
      return rect.top >= parentRect.top && rect.bottom <= parentRect.bottom;
    });

    paginationDots.forEach((dot, index) => {
      if (index === activeIndex)
        dot.dataset.active = 'true';
      else
        delete dot.dataset.active; // Ensure active attribute is removed
    });
  }

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
