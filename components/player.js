class Player extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const template = document.createElement('template');
        template.innerHTML = `
      <style>
        :host {
            width: 100%;
            display: flex;
            flex-direction: column;
            font-size: 2em;
            color: white;
            align-items: center;
            background: rgb(56, 55, 58);
            padding: 1em;
            border-radius: 5px;
        }
            
        /* Hide default number input steppers */
        input[type='number']::-webkit-outer-spin-button,
        input[type='number']::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type='number'] {
          -moz-appearance: textfield;
        }

        input,
        button {
          font-size: inherit;
          border: none;
          color: inherit;
          background: oklch(1 0 0 / 10%);
          text-align: center;
        }

        button {
          --size: 3em;
          border-radius: 9999px;
          height: var(--size);
          width: var(--size);
          aspect-ratio: 1 / 1;
          cursor: pointer;
        }

        .name {
            margin-top: 1em;
          border-radius: 20px;
          min-width: 10ch;
        }

        .points-wrapper {
          display: flex;
          height: 100%;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .points {
          background: none;
          min-width: 2ch;
          font-size: 3em;
        }

        .steppers {
          display: flex;
          justify-content: center;
          gap: 1em;
        }
      </style>
        <input class="name" type="text" placeholder="Player A" />
        <div class="points-wrapper">
            <input class="points" type="number" value="0" step="1" />
            <div class="steppers">
            <button type="button" class="decrement">-</button>
            <button type="button" class="increment">+</button>
            </div>
        </div>
    `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const decrementButton = this.shadowRoot.querySelector('.decrement');
        const incrementButton = this.shadowRoot.querySelector('.increment');
        const numberInput = this.shadowRoot.querySelector('.points');

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
        const pointsInputs = this.shadowRoot.querySelectorAll('.points');

        resizeInputs(nameInputs);
        resizeInputs(pointsInputs);
    }
}

customElements.define('player-component', Player);
