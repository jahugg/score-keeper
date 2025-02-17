class Player extends HTMLElement {
  static colorChroma = 0.1142; // Shared colorChroma variable
  static colorLightness = 69; // Shared colorLightness variable

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();

    this._name = '';
    this._colorHue = '228';
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
    this.colorHue = this.getAttribute('data-color-hue') || 228;
    this.placeholderName = this.getAttribute('data-placeholder-name') || 'Player Name';

    const decrementButton = this.shadowRoot.querySelector('.decrement');
    const incrementButton = this.shadowRoot.querySelector('.increment');
    const numberInput = this.shadowRoot.querySelector('.score');

    const updateWidth = (input) => {
      input.style.width = `${input.value.length + 1}ch`;
    };

    const updatePoints = (stepFunction) => {
      stepFunction.call(numberInput);
      updateWidth(numberInput);
    };

    decrementButton.addEventListener('click', () => {
      updatePoints(numberInput.stepDown);
    });

    incrementButton.addEventListener('click', () => {
      updatePoints(numberInput.stepUp);
    });

    const resizeInputs = (inputs) => {
      inputs.forEach(input => {
        updateWidth(input);

        input.addEventListener('input', () => {
          updateWidth(input);
        });
      });
    };

    const nameInputs = this.shadowRoot.querySelectorAll('.name');
    const pointsInputs = this.shadowRoot.querySelectorAll('.score');

    resizeInputs(nameInputs);
    resizeInputs(pointsInputs);
  }

  connectedCallback() {
    // Initialization moved to initializeComponent method
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
}

customElements.define('player-component', Player);
