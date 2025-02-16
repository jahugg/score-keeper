class Player extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        fetch('./components/player-template.html')
            .then(response => response.text())
            .then(templateContent => {
                const template = document.createElement('template');
                template.innerHTML = templateContent;
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.initializeComponent();
            });
    }

    initializeComponent() {
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

    connectedCallback() {
        // Initialization moved to initializeComponent method
    }
}

customElements.define('player-component', Player);
