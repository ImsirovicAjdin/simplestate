import { setState, getState, watch } from '../../../core/SimpleState-v009.js';

class CounterComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._cleanups = [];
        
        this.shadowRoot.innerHTML = `
            <style>
                .counter-container {
                    padding: 1rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin: 1rem;
                }
                button {
                    padding: 0.5rem 1rem;
                    margin: 0 0.25rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    background: #eee;
                    min-width: 2rem;
                    font-weight: bold;
                }
                button:hover {
                    background: #ddd;
                }
                [data-theme="light"] {
                    background: #fff;
                    color: #000;
                }
                [data-theme="light"] button {
                    background: #eee;
                    color: #000;
                }
                [data-theme="dark"] {
                    background: #333;
                    color: #fff;
                }
                [data-theme="dark"] button {
                    background: #555;
                    color: #fff;
                }
                .count-display {
                    font-size: 1.5rem;
                    margin: 1rem 0;
                    text-align: center;
                }
                .counter-controls {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                }
            </style>
            <div class="counter-container">
                <slot></slot>
                <div class="count-display">Count: <span id="countValue">0</span></div>
                <div class="counter-controls">
                    <button id="decrement">-</button>
                    <button id="increment">+</button>
                    <button id="reset">Reset</button>
                </div>
            </div>
        `;

        this._container = this.shadowRoot.querySelector('.counter-container');
        this._countDisplay = this.shadowRoot.querySelector('#countValue');

        // Bind methods to preserve context
        this._incrementCount = this._incrementCount.bind(this);
        this._decrementCount = this._decrementCount.bind(this);
        this._resetCount = this._resetCount.bind(this);
    }

    connectedCallback() {
        this._updateStateBindings();
        
        // Initialize count state
        setState('count', 0, this._getLocalOptions());
        
        // Set up button handlers
        const increment = this.shadowRoot.querySelector('#increment');
        const decrement = this.shadowRoot.querySelector('#decrement');
        const reset = this.shadowRoot.querySelector('#reset');
        
        increment.addEventListener('click', this._incrementCount);
        decrement.addEventListener('click', this._decrementCount);
        reset.addEventListener('click', this._resetCount);
        
        this._cleanups.push(
            () => increment.removeEventListener('click', this._incrementCount),
            () => decrement.removeEventListener('click', this._decrementCount),
            () => reset.removeEventListener('click', this._resetCount)
        );
    }

    disconnectedCallback() {
        if (this._cleanups) {
            this._cleanups.forEach(cleanup => cleanup());
            this._cleanups = [];
        }
    }

    _getLocalOptions() {
        return {
            target: this._container,
            scope: 'counter'
        };
    }

    _incrementCount() {
        const currentCount = getState('count', this._getLocalOptions()) || 0;
        setState('count', currentCount + 1, this._getLocalOptions());
    }

    _decrementCount() {
        const currentCount = getState('count', this._getLocalOptions()) || 0;
        setState('count', currentCount - 1, this._getLocalOptions());
    }

    _resetCount() {
        setState('count', 0, this._getLocalOptions());
    }

    _updateDisplay(value) {
        this._countDisplay.textContent = value;
    }

    _updateStateBindings() {
        // Clean up existing bindings
        if (this._cleanups) {
            this._cleanups.forEach(cleanup => cleanup());
            this._cleanups = [];
        }

        // Watch count changes
        const countCleanup = watch('count', (value) => {
            this._updateDisplay(value);
        }, this._getLocalOptions());
        
        this._cleanups.push(countCleanup);

        // Handle theme inheritance if cross-shadow attribute is present
        if (this.hasAttribute('cross-shadow')) {
            const parentThemeContainer = this._findParentThemeContainer();
            if (parentThemeContainer) {
                const parentOptions = {
                    target: parentThemeContainer,
                    scope: 'theme',
                    crossShadow: true,
                    inherit: true
                };

                const themeCleanup = watch('theme', (value) => {
                    this._container.dataset.theme = value;
                }, parentOptions);
                
                this._cleanups.push(themeCleanup);
            }
        }
    }

    _findParentThemeContainer() {
        let parent = this.parentElement;
        while (parent) {
            if (parent.tagName.toLowerCase() === 'theme-component') {
                return parent.shadowRoot.querySelector('.theme-container');
            }
            parent = parent.parentElement;
        }
        return null;
    }
}

customElements.define('counter-component', CounterComponent);