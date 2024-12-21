import { setState, getState, bindElement, watch } from '../../../core/SimpleState-v010.js';

class ThemeComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                .theme-container {
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    contain: style layout;
                    border-radius: 8px;
                }
                
                /* Theme styles */
                [data-state="light"] {
                    background: white;
                    color: black;
                    border: 1px solid #eee;
                }
                [data-state="dark"] {
                    background: #333;
                    color: white;
                    border: 1px solid #555;
                }

                /* Controls styling */
                .theme-controls {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid;
                    border-color: inherit;
                }

                button {
                    padding: 0.5rem 1rem;
                    margin-right: 0.5rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                button:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                button:active {
                    transform: translateY(0);
                }

                #themeToggle {
                    background: #4a90e2;
                    color: white;
                }

                [data-state="dark"] #themeToggle {
                    background: #61dafb;
                    color: #333;
                }

                #resetTheme {
                    background: #f5f5f5;
                    color: #333;
                    border: 1px solid #ddd;
                }

                [data-state="dark"] #resetTheme {
                    background: #555;
                    color: #fff;
                    border-color: #666;
                }

                /* Status display */
                .theme-controls > div {
                    margin-top: 0.75rem;
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                #themeValue {
                    font-weight: bold;
                    color: inherit;
                }
            </style>
            <div class="theme-container" data-state-scope>
                <slot></slot>
                <div class="theme-controls">
                    <button id="themeToggle">Toggle Theme</button>
                    <button id="resetTheme">Reset to Parent</button>
                    <div>Current Theme: <span id="themeValue"></span></div>
                </div>
            </div>
        `;
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._container = this.shadowRoot.querySelector('[data-state-scope]');
        if (!this._container) {
            throw new Error('State container not found in template');
        }
        
        // Debug and safety mechanisms
        this._debugId = this.id || `theme-${Math.random().toString(36).slice(2, 7)}`;
        this._container.dataset.debugId = this._debugId;
        this._updateCount = 0;
        this._lastUpdateTime = 0;
        this._maxUpdatesPerSecond = 10;
        this._localOverride = false;
    }

    _safeUpdate(action) {
        // Rate limiting
        const now = Date.now();
        if (now - this._lastUpdateTime < 1000) {
            this._updateCount++;
            if (this._updateCount > this._maxUpdatesPerSecond) {
                console.warn(`[${this._debugId}] Too many updates, skipping...`);
                return false;
            }
        } else {
            this._updateCount = 1;
            this._lastUpdateTime = now;
        }

        try {
            action();
            return true;
        } catch (error) {
            console.error(`[${this._debugId}] Update error:`, error);
            return false;
        }
    }

    connectedCallback() {
        // Initialize with default theme
        this._safeUpdate(() => {
            setState('theme', 'light', { target: this._container });
            this._container.dataset.state = 'light';
        });
        
        // Watch for state changes with debounce
        let updateTimeout;
        bindElement({
            element: this._container,
            stateKey: 'theme',
            target: this._container,
            display: (_, value) => {
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(() => {
                    this._handleStateChange(value);
                }, 50); // Debounce updates
            }
        });

        // Event handling
        this.shadowRoot.addEventListener('click', this._handleClick.bind(this));
    }

    _handleStateChange(value) {
        this._safeUpdate(() => {
            // Clean and validate value
            const cleanValue = (value || '').replace(/^"|"$/g, '').trim();
            if (!['light', 'dark'].includes(cleanValue)) {
                console.warn(`[${this._debugId}] Invalid theme value:`, cleanValue);
                return;
            }
            
            // Update UI
            const themeValue = this.shadowRoot.querySelector('#themeValue');
            themeValue.textContent = cleanValue;
            this._container.dataset.state = cleanValue;
            
            // Log state change
            console.log(`[${this._debugId}] State changed:`, {
                value: cleanValue,
                localOverride: this._localOverride
            });
        });
    }

    _handleClick(event) {
        const button = event.target;
        if (!['themeToggle', 'resetTheme'].includes(button.id)) return;

        this._safeUpdate(() => {
            if (button.id === 'themeToggle') {
                this._localOverride = true;
                const currentValue = getState('theme', { target: this._container });
                const newValue = currentValue === 'light' ? 'dark' : 'light';
                setState('theme', newValue, { target: this._container });
            } else {
                this._resetToParent();
            }
        });
    }

    _resetToParent() {
        this._safeUpdate(() => {
            const parentRoot = this._findParentStateRoot();
            
            // Reset to default if no parent
            if (!parentRoot) {
                this._localOverride = false;
                setState('theme', 'light', { target: this._container });
                return;
            }
            
            // Get parent state
            const parentState = getState('theme', { target: parentRoot });
            if (!parentState) {
                console.warn(`[${this._debugId}] No parent state found, using default`);
                setState('theme', 'light', { target: this._container });
                return;
            }
            
            // Apply parent state
            console.log(`[${this._debugId}] Resetting to parent state:`, parentState);
            this._localOverride = false;
            setState('theme', parentState, { target: this._container });
        });
    }

    _findParentStateRoot() {
        try {
            // Start from this component's parent element
            let parentElement = this.parentElement;
            
            // Traverse up through shadow roots and elements
            while (parentElement) {
                // If we're inside a theme-component's shadow root
                if (parentElement.host instanceof ThemeComponent) {
                    const container = parentElement.host.shadowRoot.querySelector('[data-state-scope]');
                    if (container) {
                        console.log(`[${this._debugId}] Found parent:`, {
                            parentId: parentElement.host._debugId,
                            parentState: getState('theme', { target: container })
                        });
                        return container;
                    }
                }
                
                // Check if current element is a theme-component
                if (parentElement instanceof ThemeComponent) {
                    const container = parentElement.shadowRoot.querySelector('[data-state-scope]');
                    if (container) {
                        console.log(`[${this._debugId}] Found parent:`, {
                            parentId: parentElement._debugId,
                            parentState: getState('theme', { target: container })
                        });
                        return container;
                    }
                }
                
                // Move up to next parent
                parentElement = parentElement.parentNode;
                if (parentElement instanceof ShadowRoot) {
                    parentElement = parentElement.host;
                }
            }
            
            console.log(`[${this._debugId}] No parent found`);
            return null;
        } catch (error) {
            console.error(`[${this._debugId}] Error finding parent:`, error);
            return null;
        }
    }

    disconnectedCallback() {
        this.shadowRoot.removeEventListener('click', this._handleClick.bind(this));
    }
}

customElements.define('theme-component', ThemeComponent);