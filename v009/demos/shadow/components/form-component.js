// demos/shadow/components/form-component.js
import { setState, getState, watch } from '../../../core/SimpleState-v009.js';

class FormComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._cleanups = [];
        
        this.shadowRoot.innerHTML = `
            <style>
                .form-container {
                    padding: 1rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin: 1rem;
                }
                form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                label {
                    font-weight: bold;
                }
                input, textarea {
                    padding: 0.5rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 1rem;
                }
                button {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    background: #eee;
                    font-weight: bold;
                    align-self: flex-start;
                }
                button:hover {
                    background: #ddd;
                }
                .error {
                    color: #d00;
                    font-size: 0.875rem;
                    display: none;
                }
                .form-group.has-error .error {
                    display: block;
                }
                .form-group.has-error input {
                    border-color: #d00;
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
                [data-theme="dark"] input,
                [data-theme="dark"] textarea {
                    background: #444;
                    color: #fff;
                    border-color: #666;
                }
                .success-message {
                    color: #0a0;
                    margin-top: 1rem;
                    display: none;
                }
                .success-message.show {
                    display: block;
                }
            </style>
            <div class="form-container">
                <slot></slot>
                <form id="demoForm">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" required>
                        <div class="error">Name is required</div>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                        <div class="error">Please enter a valid email</div>
                    </div>
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" rows="4" required></textarea>
                        <div class="error">Message is required</div>
                    </div>
                    <button type="submit">Submit</button>
                </form>
                <div class="success-message">Form submitted successfully!</div>
            </div>
        `;

        this._container = this.shadowRoot.querySelector('.form-container');
        this._form = this.shadowRoot.querySelector('#demoForm');
        this._successMessage = this.shadowRoot.querySelector('.success-message');

        // Bind methods
        this._handleSubmit = this._handleSubmit.bind(this);
        this._handleInput = this._handleInput.bind(this);
    }

    connectedCallback() {
        this._updateStateBindings();
        
        // Initialize form state
        setState('formData', {
            name: '',
            email: '',
            message: ''
        }, this._getLocalOptions());
        
        // Set up form handlers
        this._form.addEventListener('submit', this._handleSubmit);
        this._form.addEventListener('input', this._handleInput);
        
        this._cleanups.push(
            () => this._form.removeEventListener('submit', this._handleSubmit),
            () => this._form.removeEventListener('input', this._handleInput)
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
            scope: 'form'
        };
    }

    _handleInput(event) {
        const formData = getState('formData', this._getLocalOptions()) || {};
        formData[event.target.name] = event.target.value;
        setState('formData', formData, this._getLocalOptions());
        
        // Clear error state
        event.target.closest('.form-group').classList.remove('has-error');
        this._successMessage.classList.remove('show');
    }

    _handleSubmit(event) {
        event.preventDefault();
        
        // Reset error states
        this.shadowRoot.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('has-error');
        });
        
        // Validate
        let isValid = true;
        const formData = getState('formData', this._getLocalOptions());
        
        if (!formData.name) {
            this.shadowRoot.querySelector('#name').closest('.form-group').classList.add('has-error');
            isValid = false;
        }
        
        if (!formData.email || !formData.email.includes('@')) {
            this.shadowRoot.querySelector('#email').closest('.form-group').classList.add('has-error');
            isValid = false;
        }
        
        if (!formData.message) {
            this.shadowRoot.querySelector('#message').closest('.form-group').classList.add('has-error');
            isValid = false;
        }
        
        if (isValid) {
            // Show success message
            this._successMessage.classList.add('show');
            
            // Reset form
            this._form.reset();
            setState('formData', {
                name: '',
                email: '',
                message: ''
            }, this._getLocalOptions());
        }
    }

    _updateStateBindings() {
        // Clean up existing bindings
        if (this._cleanups) {
            this._cleanups.forEach(cleanup => cleanup());
            this._cleanups = [];
        }

        // Watch form data changes
        const formDataCleanup = watch('formData', (value) => {
            Object.entries(value || {}).forEach(([field, val]) => {
                const input = this.shadowRoot.querySelector(`#${field}`);
                if (input && input.value !== val) {
                    input.value = val;
                }
            });
        }, this._getLocalOptions());
        
        this._cleanups.push(formDataCleanup);

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

customElements.define('form-component', FormComponent);