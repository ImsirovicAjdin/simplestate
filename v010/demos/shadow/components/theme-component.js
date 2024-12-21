import { setState, getState, bindElement, watch } from '../../../core/SimpleState-v010.js';

class ThemeComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Create template
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                .theme-container {
                    padding: 1rem;
                    transition: all 0.3s ease;
                }
                .theme-controls {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #eee;
                }
                button {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 0.5rem;
                }
                .reset-button {
                    background: #eee;
                    display: none;
                }
                [data-override="true"] .reset-button {
                    display: inline-block;
                }
                [data-theme="light"] {
                    background: #fff;
                    color: #333;
                }
                [data-theme="dark"] {
                    background: #333;
                    color: #fff;
                }
            </style>
            <div class="theme-container">
                <slot></slot>
                <div class="theme-controls">
                    <button id="themeToggle">Toggle Theme</button>
                    <button class="reset-button" id="resetTheme">Reset to Parent</button>
                    <div>Current Theme: <span id="themeValue"></span></div>
                </div>
            </div>
        `;
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._container = this.shadowRoot.querySelector('.theme-container');
        this._localOverride = false;
    }

    static get observedAttributes() {
        return ['cross-shadow'];
    }

    get crossShadow() {
        return this.hasAttribute('cross-shadow');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'cross-shadow' && this.isConnected) {
            this._updateStateBindings();
        }
    }

    _updateDisplay(value) {
        if (!value) return;
        
        const themeValue = this.shadowRoot.querySelector('#themeValue');
        themeValue.textContent = value;
        this._container.dataset.theme = value;
        this._container.dataset.override = this._localOverride;
        console.log('Display updated in', this.id || 'unnamed', 'to:', value, 'override:', this._localOverride);
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

    _getLocalOptions() {
        return {
            target: this._container,
            scope: 'theme',
            crossShadow: false,
            inherit: false
        };
    }

    _getParentOptions() {
        const parentContainer = this._findParentThemeContainer();
        return parentContainer ? {
            target: parentContainer,
            scope: 'theme',
            crossShadow: true,
            inherit: true
        } : null;
    }

    _resetToParent() {
        const parentOptions = this._getParentOptions();
        const localOptions = this._getLocalOptions();
        if (parentOptions) {
            const parentState = getState('theme', parentOptions);
            if (parentState) {
                this._localOverride = false;
                setState('theme', parentState, localOptions);
                this._updateDisplay(parentState);
            }
        }
    }

    _updateStateBindings() {
        // Clean up existing bindings
        if (this._cleanups) {
            this._cleanups.forEach(cleanup => cleanup());
            this._cleanups = [];
        }

        const cleanups = [];
        const localOptions = this._getLocalOptions();

        // Initialize local state if needed
        let currentState = getState('theme', localOptions);
        if (!currentState) {
            currentState = 'light';
            setState('theme', currentState, localOptions);
        }

        // If cross-shadow, watch parent state
        if (this.crossShadow) {
            const parentOptions = this._getParentOptions();
            if (parentOptions) {
                const watchParentCleanup = watch('theme', (value) => {
                    if (!this._localOverride) {
                        console.log('Parent update in', this.id || 'unnamed', 'value:', value);
                        setState('theme', value, localOptions);
                    }
                }, parentOptions);
                cleanups.push(watchParentCleanup);

                // Add reset button handler
                const resetButton = this.shadowRoot.querySelector('#resetTheme');
                resetButton.addEventListener('click', () => this._resetToParent());
                cleanups.push(() => resetButton.removeEventListener('click', () => this._resetToParent()));
            }
        }

        // Bind theme toggle (always local)
        const toggleCleanup = bindElement({
            element: this.shadowRoot.querySelector('#themeToggle'),
            stateKey: 'theme',
            ...localOptions,
            events: {
                click: (_, value) => {
                    this._localOverride = true;
                    const newValue = value === 'light' ? 'dark' : 'light';
                    console.log('Toggle clicked in', this.id || 'unnamed', 'changing to:', newValue);
                    return newValue;
                }
            }
        });
        cleanups.push(toggleCleanup);

        // Watch local state for display
        const watchLocalCleanup = watch('theme', (value) => {
            console.log('Watch update in', this.id || 'unnamed', 'value:', value);
            this._updateDisplay(value);
        }, localOptions);
        cleanups.push(watchLocalCleanup);

        // Update display with current state
        this._updateDisplay(currentState);

        // Store cleanups
        this._cleanups = cleanups;
    }

    connectedCallback() {
        this._updateStateBindings();
    }

    disconnectedCallback() {
        if (this._cleanups) {
            this._cleanups.forEach(cleanup => cleanup());
            this._cleanups = [];
        }
    }
}

customElements.define('theme-component', ThemeComponent);